import { randomUUID } from "node:crypto";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { createFoundryEngineerMcpServer } from "./mcpServer.js";

const apiKey = process.env.MCP_API_KEY;
const port = Number(process.env.PORT ?? 3000);
const transports = new Map<string, StreamableHTTPServerTransport>();
const app = createMcpExpressApp({ host: "0.0.0.0" });

function isAuthorized(req: { headers: Record<string, string | string[] | undefined> }) {
  if (!apiKey) {
    return true;
  }

  const authorization = req.headers.authorization;
  if (Array.isArray(authorization)) {
    return authorization.includes(`Bearer ${apiKey}`);
  }

  return authorization === `Bearer ${apiKey}`;
}

function rejectUnauthorized(res: { status: (code: number) => { json: (body: unknown) => void } }) {
  res.status(401).json({
    jsonrpc: "2.0",
    error: {
      code: -32001,
      message: "Unauthorized"
    },
    id: null
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    name: "microsoft-foundry-engineer-mcp",
    transport: "streamable-http"
  });
});

app.post("/mcp", async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    rejectUnauthorized(res);
    return;
  }

  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport && !sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          if (transport) {
            transports.set(id, transport);
          }
        }
      });

      transport.onclose = () => {
        const id = transport?.sessionId;
        if (id) {
          transports.delete(id);
        }
      };

      const server = createFoundryEngineerMcpServer();
      await server.connect(transport);
    }

    if (!transport) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid MCP session found"
        },
        id: null
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? transports.get(sessionId) : undefined;

  if (!transport) {
    res.status(400).send("Invalid or missing MCP session ID");
    return;
  }

  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? transports.get(sessionId) : undefined;

  if (!transport) {
    res.status(400).send("Invalid or missing MCP session ID");
    return;
  }

  await transport.handleRequest(req, res);
});

const listener = app.listen(port, (error?: Error) => {
  if (error) {
    console.error("Failed to start HTTP MCP server", error);
    process.exit(1);
  }

  console.log(`Microsoft Foundry Engineer MCP listening on port ${port}`);
});

async function shutdown() {
  for (const [sessionId, transport] of transports) {
    await transport.close();
    transports.delete(sessionId);
  }

  listener.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
