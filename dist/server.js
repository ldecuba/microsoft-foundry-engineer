import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createFoundryEngineerMcpServer } from "./mcpServer.js";
const server = createFoundryEngineerMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
