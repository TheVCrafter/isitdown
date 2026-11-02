import { createServer, type Server } from "node:http";

export type TargetServer = {
  readonly baseUrl: string;
  close(): Promise<void>;
};

export async function startTargetServer(): Promise<TargetServer> {
  const server: Server = createServer((request, response) => {
    switch (request.url) {
      case "/ok":
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("ok");
        return;
      case "/error":
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("error");
        return;
      case "/redirect":
        response.writeHead(301, { Location: "/ok" });
        response.end();
        return;
      case "/slow":
        return;
      default:
        response.writeHead(404);
        response.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The target server did not start on a TCP port");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
