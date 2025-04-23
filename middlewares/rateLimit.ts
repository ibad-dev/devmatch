type RateLimitOptions = {
    windowMs: number; // e.g., 60_000 for 1 minute
    maxRequests: number; // e.g., 10
  };
  
  type ClientRecord = {
    count: number;
    expiresAt: number;
  };
  
  const clients = new Map<string, ClientRecord>();
  
  export function rateLimiter({ windowMs, maxRequests }: RateLimitOptions) {
    return async (ip: string): Promise<{ allowed: boolean; retryAfter?: number }> => {
      const currentTime = Date.now();
      const client = clients.get(ip);
  
      if (!client || currentTime > client.expiresAt) {
        // New client or expired window
        clients.set(ip, {
          count: 1,
          expiresAt: currentTime + windowMs,
        });
        return { allowed: true };
      }
  
      if (client.count < maxRequests) {
        client.count += 1;
        return { allowed: true };
      }
  
      const retryAfter = Math.ceil((client.expiresAt - currentTime) / 1000);
      return { allowed: false, retryAfter };
    };
  }
  