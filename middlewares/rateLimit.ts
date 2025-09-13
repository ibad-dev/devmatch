type RateLimitOptions = {
    windowMs: number; 
    maxRequests: number; 
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
  // clean up expired entries every minute to save memory
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of clients) {
    if (record.expiresAt < now) {
      clients.delete(ip);
    }
  }
}, 60_000);