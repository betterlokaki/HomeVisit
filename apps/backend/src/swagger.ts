/**
 * Swagger/OpenAPI Configuration
 *
 * Defines the OpenAPI 3.0 specification for the HomeVisit API.
 */

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "HomeVisit API",
    description:
      "Backend API for the HomeVisit application - manages user authentication and site data with enriched geospatial information.",
    version: "0.1.0",
    contact: {
      name: "HomeVisit Team",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
    {
      url: "https://api.homevisit.local",
      description: "Production server",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check endpoint",
        description:
          "Returns the health status of the API and service information.",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "timestamp", "environment"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["ok"],
                      example: "ok",
                      description: "Health status indicator",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2025-11-17T10:30:00.000Z",
                      description: "ISO 8601 timestamp of the health check",
                    },
                    environment: {
                      type: "string",
                      enum: ["development", "production", "test"],
                      example: "development",
                      description: "Current environment",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate user and create session",
        description:
          "Authenticates a user and creates or retrieves their user record. Returns user_id and group_id.",
        operationId: "loginUser",
        requestBody: {
          description: "Login credentials",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  group_id: {
                    type: "integer",
                    minimum: 1,
                    example: 1,
                    description:
                      "Group ID (optional, defaults to 1). Must be a positive number.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "data"],
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      required: ["user_id", "group_id"],
                      properties: {
                        user_id: {
                          type: "integer",
                          example: 42,
                          description: "Unique user identifier",
                        },
                        group_id: {
                          type: "integer",
                          example: 1,
                          description: "Group identifier",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid group_id: must be a positive number",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Authentication failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Authentication failed",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/sites": {
      get: {
        tags: ["Sites"],
        summary: "Get sites by group with optional filters",
        description:
          "Retrieves sites for a specific group with optional filtering by username and/or status. The group parameter is required. Returns an array of sites with their geometries and status information.",
        operationId: "getSitesByGroup",
        parameters: [
          {
            name: "group",
            in: "query",
            description: "Group name (required)",
            required: true,
            schema: {
              type: "string",
              example: "Weekly Refresh Group",
            },
          },
          {
            name: "username",
            in: "query",
            description: "Username to filter sites (optional)",
            required: false,
            schema: {
              type: "string",
              example: "shahar",
            },
          },
          {
            name: "status",
            in: "query",
            description:
              "Seen status to filter sites (optional). Valid values: 'Seen', 'Partial', 'Not Seen'",
            required: false,
            schema: {
              type: "string",
              enum: ["Seen", "Partial", "Not Seen"],
              example: "Not Seen",
            },
          },
        ],
        responses: {
          "200": {
            description: "Sites retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "data"],
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      required: ["group", "username", "status", "sites"],
                      properties: {
                        group: {
                          type: "string",
                          example: "Weekly Refresh Group",
                          description: "Group name queried",
                        },
                        username: {
                          type: "string",
                          example: "shahar",
                          description:
                            "Username filter applied (or 'all' if not specified)",
                        },
                        status: {
                          type: "string",
                          example: "Not Seen",
                          description:
                            "Status filter applied (or 'all' if not specified)",
                        },
                        sites: {
                          type: "array",
                          description: "Array of sites matching the filters",
                          items: {
                            $ref: "#/components/schemas/Site",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing required group parameter",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Missing required parameter: group",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Failed to fetch sites by group",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Failed to fetch sites by group",
                    },
                    details: {
                      type: "string",
                      example: "Database connection error",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Site: {
        type: "object",
        required: [
          "site_id",
          "site_name",
          "group_id",
          "user_id",
          "seen_status",
          "geometry",
        ],
        properties: {
          site_id: {
            type: "integer",
            example: 1,
            description: "Unique site identifier",
          },
          site_name: {
            type: "string",
            example: "New York",
            description: "Name of the site",
          },
          group_id: {
            type: "integer",
            example: 1,
            description: "Group ID this site belongs to",
          },
          user_id: {
            type: "integer",
            example: 1,
            description: "User ID this site is assigned to",
          },
          seen_status: {
            type: "string",
            enum: ["Seen", "Partial", "Not Seen"],
            example: "Not Seen",
            description: "Status of whether the site has been observed",
          },
          seen_date: {
            type: "string",
            format: "date-time",
            example: "2025-11-18T00:00:00",
            description: "ISO 8601 timestamp of last seen status update",
          },
          geometry: {
            type: "string",
            format: "wkt",
            example:
              "POLYGON((-74.3 40.5, -73.9 40.6, -73.7 40.5, -73.8 40.9, -74.2 40.8, -74.3 40.5))",
            description:
              "WKT (Well-Known Text) polygon geometry of the site with 6+ vertices",
          },
        },
      },
      User: {
        type: "object",
        required: ["user_id", "group_id"],
        properties: {
          user_id: {
            type: "integer",
            example: 42,
            description: "Unique user identifier",
          },
          group_id: {
            type: "integer",
            example: 1,
            description: "Group identifier",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Service health check endpoints",
    },
    {
      name: "Authentication",
      description: "User authentication endpoints",
    },
    {
      name: "Sites",
      description: "Site management endpoints",
    },
  ],
};
