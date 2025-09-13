import { NextRequest } from "next/server";
import { rateLimiter } from "./rateLimit";
import { deepSanitize  } from "./sanitize";

const limiter = rateLimiter({ windowMs: 60_000, maxRequests: 10 });

export function secureHandler(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async function (req: NextRequest): Promise<Response> {
    try {
      // Rate limiting
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const { allowed, retryAfter } = await limiter(ip);

      if (!allowed) {
        return new Response(
          JSON.stringify({ message: `Too many requests. Try again in ${retryAfter}s.` }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      // Sanitize JSON body if needed
      if (
        req.method !== "GET" &&
        req.headers.get("content-type")?.includes("application/json")
      ) {
        try {
          const rawBody = await req.json();
          const cleanBody = deepSanitize(rawBody);

          req = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(cleanBody),
          });
        } catch(parseError) {
            // If JSON parsing fails, continue without sanitization
            console.warn("Failed to parse JSON body:", parseError);
        }
      }

      // Call the actual API logic
      return await handler(req);

    } catch (err) {
      console.error("secureHandler error:", err);
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
