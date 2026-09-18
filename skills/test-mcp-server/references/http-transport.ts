// Stateless Streamable HTTP transport for an in-development MCP server.
// Copy into your server's src/, then in your entrypoint add an HTTP branch:
//
//   import { runHttp } from "./http-transport.js";
//   const httpPort = process.env.MCP_HTTP_PORT ? Number(process.env.MCP_HTTP_PORT) : undefined;
//   if (httpPort) { await runHttp(buildServer, httpPort); } else { /* existing stdio startup */ }
//
// buildServer MUST return a NEW McpServer instance each call (MCP's stateless
// pattern) so concurrent providers never share session state.
//
// This is a skeleton - adapt to your MCP SDK version. Requires
// @modelcontextprotocol/sdk ^1.30.0+.

import http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export async function runHttp(buildServer: () => McpServer, port: number) {
  const server = http.createServer(async (req, res) => {
    if (!req.url?.startsWith("/mcp")) {
      res.writeHead(404).end();
      return;
    }
    // New server + transport per request (stateless).
    const mcp = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => { transport.close(); mcp.close?.(); });
    await mcp.connect(transport);
    await transport.handleRequest(req, res);
  });
  // allowedHosts: accept the internal Host that forward-internal sends
  // (or run the agent with --host-header=rewrite, which this file assumes).
  server.listen(port, () => console.error(`MCP HTTP transport on :${port}/mcp`));
}
