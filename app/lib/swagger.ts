import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Harvest API",
        version: "1.0.0",
        description:
          "REST API for the Harvest Mobile App - connecting farmers with consumers",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your JWT token",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              name: { type: "string" },
              phone_number: { type: "string", nullable: true },
              avatar_url: { type: "string", nullable: true },
              user_type: {
                type: "string",
                enum: ["CONSUMER", "PRODUCER", "ADMIN"],
              },
              is_verified: { type: "boolean" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
          },
          AuthResponse: {
            type: "object",
            properties: {
              status: { type: "string", example: "success" },
              data: {
                type: "object",
                properties: {
                  user: { $ref: "#/components/schemas/User" },
                  access_token: { type: "string" },
                  refresh_token: { type: "string" },
                  token_type: { type: "string", example: "Bearer" },
                  expires_in: { type: "integer", example: 3600 },
                },
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              message: { type: "string" },
            },
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
