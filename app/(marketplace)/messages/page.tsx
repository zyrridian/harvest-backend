"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Search,
  ChevronRight,
  Loader2,
  Filter,
  Check,
  CheckCheck,
  Package,
  User,
  Clock,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  errorBg: "#fee2e2",
};

interface Participant {
  user_id: string;
  name: string;
  profile_picture: string | null;
  user_type: string;
  is_online: boolean;
  last_seen: string | null;
}

interface LastMessage {
  message_id: string;
  sender_id: string;
  sender_name: string;
  type: string;
  content: string | null;
  preview: string;
  timestamp: string;
  is_read: boolean;
}

interface Order {
  order_id: string;
  order_number: string;
  status: string;
}

interface Conversation {
  conversation_id: string;
  type: string;
  participant: Participant;
  order: Order | null;
  last_message: LastMessage | null;
  unread_count: number;
  muted: boolean;
  pinned: boolean;
  updated_at: string;
}

type FilterType = "all" | "unread" | "order" | "general";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmerId = searchParams.get("farmer");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  useEffect(() => {
    // If farmer param is present, start a conversation with them
    if (farmerId) {
      startConversationWithFarmer(farmerId);
    } else {
      fetchConversations();
    }
  }, [filter, farmerId]);

  const startConversationWithFarmer = async (recipientId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsStartingConversation(true);
    try {
      const response = await fetch("/api/v1/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          type: "general",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the conversation
        router.replace(`/messages/${data.data.conversation_id}`);
      } else {
        console.error("Failed to start conversation:", data.message);
        // Fall back to showing conversations list
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      fetchConversations();
    } finally {
      setIsStartingConversation(false);
    }
  };

  const fetchConversations = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("filter", filter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/v1/conversations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) return "No messages yet";
    const msg = conversation.last_message;
    if (msg.type === "image") return "📷 Photo";
    if (msg.type === "product") return "🛍️ Product shared";
    if (msg.type === "order") return "📦 Order update";
    return msg.preview || msg.content || "";
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "order", label: "Orders" },
    { key: "general", label: "General" },
  ];

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unread_count,
    0,
  );

  // Show loading state when starting a new conversation
  if (isStartingConversation) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Loader2
          size={32}
          className="animate-spin mb-4"
          style={{ color: colors.accent }}
        />
        <p className="text-sm" style={{ color: colors.body }}>
          Starting conversation...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1
                className="text-xl font-semibold"
                style={{ color: colors.heading }}
              >
                Messages
              </h1>
              {totalUnread > 0 && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: showFilters ? colors.successBg : "transparent",
                color: showFilters ? colors.accent : colors.body,
              }}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.body }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.heading,
              }}
            />
          </form>

          {/* Filter Tabs */}
          {showFilters && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor:
                      filter === f.key ? colors.accent : colors.background,
                    color: filter === f.key ? colors.white : colors.body,
                    border: `1px solid ${filter === f.key ? colors.accent : colors.border}`,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: colors.successBg }}
            >
              <MessageSquare size={32} style={{ color: colors.accent }} />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.heading }}
            >
              No conversations yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              Start a conversation by messaging a seller
            </p>
            <Link
              href="/farmers"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: colors.accent, color: colors.white }}
            >
              Browse Farmers
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {/* Pinned conversations */}
            {conversations
              .filter((conv) => conv.pinned)
              .map((conversation) => (
                <ConversationItem
                  key={conversation.conversation_id}
                  conversation={conversation}
                  formatTime={formatTime}
                  getMessagePreview={getMessagePreview}
                />
              ))}

            {/* Unpinned conversations */}
            {conversations
              .filter((conv) => !conv.pinned)
              .map((conversation) => (
                <ConversationItem
                  key={conversation.conversation_id}
                  conversation={conversation}
                  formatTime={formatTime}
                  getMessagePreview={getMessagePreview}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  formatTime,
  getMessagePreview,
}: {
  conversation: Conversation;
  formatTime: (timestamp: string) => string;
  getMessagePreview: (conversation: Conversation) => string;
}) {
  const hasUnread = conversation.unread_count > 0;

  return (
    <Link
      href={`/messages/${conversation.conversation_id}`}
      className="flex items-center gap-3 p-4 transition-colors hover:bg-zinc-50"
      style={{
        backgroundColor: hasUnread ? colors.successBg + "40" : colors.white,
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {conversation.participant.profile_picture ? (
          <img
            src={conversation.participant.profile_picture}
            alt={conversation.participant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.border }}
          >
            <User size={24} style={{ color: colors.body }} />
          </div>
        )}

        {/* Online indicator */}
        {conversation.participant.is_online && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{
              backgroundColor: colors.success,
              borderColor: colors.white,
            }}
          />
        )}

        {/* Order indicator */}
        {conversation.type === "order" && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Package size={12} style={{ color: colors.white }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`text-sm font-${hasUnread ? "semibold" : "medium"} truncate`}
            style={{ color: colors.heading }}
          >
            {conversation.participant.name}
          </h3>
          <span
            className="text-xs flex-shrink-0 ml-2"
            style={{ color: hasUnread ? colors.accent : colors.body }}
          >
            {conversation.last_message
              ? formatTime(conversation.last_message.timestamp)
              : formatTime(conversation.updated_at)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            {/* Read status icon */}
            {conversation.last_message &&
              conversation.last_message.sender_id !==
                conversation.participant.user_id &&
              (conversation.last_message.is_read ? (
                <CheckCheck
                  size={14}
                  style={{ color: colors.accent }}
                  className="flex-shrink-0"
                />
              ) : (
                <Check
                  size={14}
                  style={{ color: colors.body }}
                  className="flex-shrink-0"
                />
              ))}
            <p
              className={`text-sm truncate ${hasUnread ? "font-medium" : ""}`}
              style={{ color: hasUnread ? colors.heading : colors.body }}
            >
              {getMessagePreview(conversation)}
            </p>
          </div>

          {/* Unread badge */}
          {hasUnread && (
            <span
              className="ml-2 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-medium rounded-full flex-shrink-0"
              style={{ backgroundColor: colors.accent, color: colors.white }}
            >
              {conversation.unread_count > 99
                ? "99+"
                : conversation.unread_count}
            </span>
          )}
        </div>

        {/* Order info */}
        {conversation.order && (
          <div
            className="flex items-center gap-1 mt-1 text-xs"
            style={{ color: colors.body }}
          >
            <Package size={12} />
            <span>Order {conversation.order.order_number}</span>
            <span className="capitalize">
              • {conversation.order.status.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      <ChevronRight
        size={18}
        style={{ color: colors.border }}
        className="flex-shrink-0"
      />
    </Link>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#FAFAF9" }}
        >
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "#166534" }}
          />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
