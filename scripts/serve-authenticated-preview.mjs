import { createServer } from "node:http";

const upstream = process.env.UPSTREAM_URL ?? "http://localhost:4321";
const port = Number(process.env.AUTH_PREVIEW_PORT ?? 4322);
const userId = process.env.AUTH_PREVIEW_USER ?? "validation-user-a";

const server = createServer(async (request, response) => {
  try {
    const target = new URL(request.url ?? "/", upstream);
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value !== undefined && !["host", "connection", "content-length"].includes(name)) {
        headers.set(name, Array.isArray(value) ? value.join(", ") : value);
      }
    }
    headers.set("accept-encoding", "identity");
    headers.set("oai-authenticated-user-id", userId);
    headers.set("oai-authenticated-user-email", `${userId}@example.test`);
    headers.set("oai-authenticated-user-full-name", encodeURIComponent("验证用户甲"));
    headers.set("oai-authenticated-user-full-name-encoding", "percent-encoded-utf-8");

    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
    const upstreamResponse = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    response.statusCode = upstreamResponse.status;
    for (const [name, value] of upstreamResponse.headers) {
      if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(name)) {
        response.setHeader(name, value);
      }
    }
    const payload = Buffer.from(await upstreamResponse.arrayBuffer());
    response.end(payload);
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end(error instanceof Error ? error.message : "Preview proxy failed");
  }
});

server.listen(port, "::1", () => {
  console.log(`Authenticated local preview: http://localhost:${port}`);
});
