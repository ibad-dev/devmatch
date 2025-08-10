  // lib/security/secureHandler.ts
  import { NextRequest } from "next/server";
  import { rateLimiter } from "./rateLimit";
  import { deepSanitize } from "./sanitize";

  const limiter = rateLimiter({ windowMs: 60_000, maxRequests: 10 });

  export function secureHandler(handler: (req: NextRequest) => Promise<Response>) {
    return async function (req: NextRequest) {
      try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const { allowed, retryAfter } = await limiter(ip);

        if (!allowed) {
          return new Response(
            JSON.stringify({ message: `Too many requests. Try again in ${retryAfter}s.` }),
            { status: 429 }
          );
        }

        // Sanitize body if it's JSON
        if (req.headers.get("content-type")?.includes("application/json")) {
          const rawBody = await req.json();
          const cleanBody = deepSanitize(rawBody);
          // recreate the request with sanitized body
          req = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(cleanBody),
          });
        }

        return await handler(req);
      } catch (err) {
        console.error("secureHandler error:", err);
        return new Response(JSON.stringify({ message: "Internal error" }), { status: 500 });
      }
    };
  }
