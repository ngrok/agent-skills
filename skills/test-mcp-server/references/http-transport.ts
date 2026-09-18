// Drop-in Streamable HTTP transport for an existing stdio-based MCP server.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";

export interface RunHttpOptions {
  /**
   * Interface to bind to. Defaults to 127.0.0.1 (loopback only). The expected setup is a local ngrok agent forwarding into this process.
   */
  host?: string;
}

export function runHttp(
  buildServer: () => McpServer,
  port: number,
  options: RunHttpOptions = {}
): Promise<void> {
  const app = createMcpExpressApp({
    host: options.host ?? "127.0.0.1",
  });

  app.post("/mcp", async (req: any, res: any) => {
    const server = buildServer();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: { message: "Internal server error" },
        });
      }
    }
  });

  const methodNotAllowed = (_req: any, res: any) => {
    res.writeHead(405).end(
      JSON.stringify({
        error: { message: "Method not allowed." },
      })
    );
  };
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  return new Promise((resolve, reject) => {
    const httpServer = app.listen(port, () => {
      console.error(`MCP server running on http://127.0.0.1:${port}/mcp`);
      resolve();
    });
    httpServer.on("error", reject);
  });
}