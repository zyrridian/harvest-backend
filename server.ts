import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyToken } from "./app/features/auth/application/services/token.service";
import prisma from "./app/core/database/prisma";
import { logger } from "./app/core/logger";
import { activeSocketConnections } from "./app/core/metrics";
import { createAdapter } from "@socket.io/redis-adapter";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "./app/core/database/redis";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const subClient = redisClient.duplicate();

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 100,
  duration: 60,
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

async function getUserConversationStats(userId: string) {
  try {
    const rawStats = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT m.conversation_id) as unread_conversations,
        COUNT(m.id) as total_unread_messages
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.is_read = false 
        AND m.sender_id != ${userId}
        AND (
          (c.participant_1_id = ${userId} AND m.deleted_for_recipient = false) OR
          (c.participant_2_id = ${userId} AND m.deleted_for_sender = false)
        )
    ` as any[];
    
    return {
      unread_conversations: Number(rawStats?.[0]?.unread_conversations || 0),
      total_unread_messages: Number(rawStats?.[0]?.total_unread_messages || 0)
    };
  } catch (error) {
    logger.error({ err: error }, "[Socket] Failed to get stats");
    return null;
  }
}

// Cache for conversation participants (conversationId -> { p1, p2 })
const conversationParticipantsCache = new Map<string, { p1: string; p2: string }>();

async function getConversationParticipants(conversationId: string) {
  if (conversationParticipantsCache.has(conversationId)) {
    return conversationParticipantsCache.get(conversationId)!;
  }
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participant1Id: true, participant2Id: true },
  });
  if (conv) {
    const data = { p1: conv.participant1Id, p2: conv.participant2Id };
    conversationParticipantsCache.set(conversationId, data);
    // Basic cache clearing if it gets too large
    if (conversationParticipantsCache.size > 10000) {
      const firstKey = conversationParticipantsCache.keys().next().value;
      if (firstKey) conversationParticipantsCache.delete(firstKey);
    }
    return data;
  }
  return null;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      try {
        await rateLimiter.consume(ip as string);
      } catch (rateLimitErr) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Too Many Requests" }));
        return;
      }

      res.setHeader("X-DNS-Prefetch-Control", "off");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
      res.setHeader("X-Download-Options", "noopen");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-XSS-Protection", "1; mode=block");

      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error({ err, url: req.url }, "Error occurred handling");
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
    adapter: createAdapter(redisClient, subClient),
  });

  // Middleware: authenticate socket connection
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        (socket.handshake.query.token as string) ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = await verifyToken(token);
      if (!payload || payload.type !== "access") {
        return next(new Error("Invalid token"));
      }

      (socket as any).userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`[Socket] User ${userId} connected — socket ${socket.id}`);
    activeSocketConnections.inc();

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Generic listener for debugging incoming events
    socket.onAny((eventName, ...args) => {
      logger.debug(
        { userId, eventName, args: JSON.stringify(args).slice(0, 300) },
        `[Socket event from ${userId}]: ${eventName}`
      );
    });

    // Mark user online in DB
    await prisma.user
      .update({
        where: { id: userId },
        data: { isOnline: true },
      })
      .catch(() => {});

    // Join the personal user room
    socket.join(`user_${userId}`);

    // Broadcast online status to contacts
    socket.broadcast.emit("user:online", { userId });

    // ─────────────────────────────────────────────
    // EVENT: Send a message
    // ─────────────────────────────────────────────
    socket.on("message:send", async (data: any) => {
      try {
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        const { conversation_id, content, type = "text", temp_id } = data || {};

        if (!content?.trim()) {
          logger.warn({ data }, `[Socket warning] message:send got empty content`);
          return;
        }

        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversation_id,
            OR: [{ participant1Id: userId }, { participant2Id: userId }],
          },
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Save message to DB
        const message = await prisma.message.create({
          data: {
            conversationId: conversation_id,
            senderId: userId,
            type: type.toUpperCase() as any,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversation_id },
          data: { updatedAt: new Date() },
        });

        const messagePayload = {
          message_id: message.id,
          temp_id,
          conversation_id,
          sender_id: message.senderId,
          sender_name: message.sender.name,
          sender_avatar: message.sender.avatarUrl,
          type: message.type.toLowerCase(),
          content: message.content,
          timestamp: message.createdAt.toISOString(),
          is_read: false,
          is_edited: false,
        };

        // Emit to both participants' personal user rooms
        io.to(`user_${conversation.participant1Id}`)
          .to(`user_${conversation.participant2Id}`)
          .emit("message:new", messagePayload);

        // Emit unread notification to recipient if they're online
        const recipientId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        if (onlineUsers.has(recipientId)) {
          io.to(`user_${recipientId}`).emit("conversation:update", {
            conversation_id,
            last_message: messagePayload,
          });

          const stats = await getUserConversationStats(recipientId);
          if (stats) {
            const userSocketIds = onlineUsers.get(recipientId);
            if (userSocketIds) {
              for (const socketId of userSocketIds) {
                io.to(socketId).emit("conversations:stats", stats);
              }
            }
          }
        }
      } catch (err) {
        logger.error({ err }, "[Socket] message:send error");
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ─────────────────────────────────────────────
    // EVENT: Mark messages as read
    // ─────────────────────────────────────────────
    socket.on("message:read", async (data: any) => {
      try {
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        const { conversation_id } = data || {};
        if (!conversation_id) return;

        await prisma.message.updateMany({
          where: {
            conversationId: conversation_id,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true, readAt: new Date() },
        });

        const participants = await getConversationParticipants(conversation_id);
        if (!participants) return;
        
        const senderId = participants.p1 === userId ? participants.p2 : participants.p1;

        // Notify sender that messages were read
        io.to(`user_${senderId}`).emit("message:read_ack", {
          conversation_id,
          reader_id: userId,
        });

        const stats = await getUserConversationStats(userId);
        if (stats) {
          const userSocketIds = onlineUsers.get(userId);
          if (userSocketIds) {
            for (const socketId of userSocketIds) {
              io.to(socketId).emit("conversations:stats", stats);
            }
          }
        }
      } catch (err) {
        logger.error({ err }, "[Socket] message:read error");
      }
    });

    // ─────────────────────────────────────────────
    // EVENT: Typing indicator
    // ─────────────────────────────────────────────
    socket.on("typing:start", async (data: any) => {
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (!data?.conversation_id) return;
      
      const participants = await getConversationParticipants(data.conversation_id);
      if (!participants) return;
      const recipientId = participants.p1 === userId ? participants.p2 : participants.p1;

      io.to(`user_${recipientId}`).emit("typing:start", {
        conversation_id: data.conversation_id,
        user_id: userId,
      });
    });

    socket.on("typing:stop", async (data: any) => {
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (!data?.conversation_id) return;
      
      const participants = await getConversationParticipants(data.conversation_id);
      if (!participants) return;
      const recipientId = participants.p1 === userId ? participants.p2 : participants.p1;

      io.to(`user_${recipientId}`).emit("typing:stop", {
        conversation_id: data.conversation_id,
        user_id: userId,
      });
    });

    // ─────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────
    socket.on("disconnect", async () => {
      logger.info(`[Socket] User ${userId} disconnected — socket ${socket.id}`);
      activeSocketConnections.dec();

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Mark offline in DB
          await prisma.user
            .update({
              where: { id: userId },
              data: { isOnline: false, lastSeen: new Date() },
            })
            .catch(() => {});

          socket.broadcast.emit("user:offline", {
            userId,
            last_seen: new Date().toISOString(),
          });
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      logger.error({ err }, "Server failed to start");
      process.exit(1);
    })
    .listen(port, () => {
      logger.info(`> Ready on http://${hostname}:${port}`);
    });
});
