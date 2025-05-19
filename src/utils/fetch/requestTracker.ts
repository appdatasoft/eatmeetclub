
/**
 * Request tracking utility to monitor and throttle API requests
 */

interface RequestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestTime: number;
  consecutiveFailures: number;
  rateLimit: {
    remaining: number;
    resetAt: number;
  };
}

class RequestTracker {
  private stats: RequestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    lastRequestTime: 0,
    consecutiveFailures: 0,
    rateLimit: {
      remaining: 100,
      resetAt: 0
    }
  };
  
  private throttleDelay = 500; // Minimum time between requests in ms
  private activeRequests = 0;
  private maxConcurrentRequests = 3;
  
  // Check if we need to wait before sending a new request
  async checkAndWait(): Promise<void> {
    this.stats.totalRequests++;
    
    // Wait if we're at the maximum concurrent requests
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Apply throttling if needed
    const now = Date.now();
    const timeSinceLastRequest = now - this.stats.lastRequestTime;
    
    if (timeSinceLastRequest < this.throttleDelay) {
      const waitTime = this.throttleDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Check if we're rate limited
    if (this.stats.rateLimit.remaining <= 0 && now < this.stats.rateLimit.resetAt) {
      const waitTime = this.stats.rateLimit.resetAt - now + 1000;
      console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Update state
    this.stats.lastRequestTime = Date.now();
    this.activeRequests++;
  }
  
  // Mark a request as completed and release the slot
  releaseRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }
  
  // Mark a request as successful and update rate limit info
  recordSuccess(remainingLimit?: number, resetAt?: number): void {
    this.stats.successfulRequests++;
    this.stats.consecutiveFailures = 0;
    this.releaseRequest();
    
    // Update rate limit info if provided
    if (remainingLimit !== undefined) {
      this.stats.rateLimit.remaining = remainingLimit;
    } else {
      // Assume successful request reduces limit by 1
      this.stats.rateLimit.remaining = Math.max(0, this.stats.rateLimit.remaining - 1);
    }
    
    if (resetAt !== undefined) {
      this.stats.rateLimit.resetAt = resetAt;
    }
  }
  
  // Mark a request as failed
  recordFailure(isRateLimit = false): void {
    this.stats.failedRequests++;
    this.stats.consecutiveFailures++;
    this.releaseRequest();
    
    // If it's a rate limit error, update rate limit info
    if (isRateLimit) {
      this.stats.rateLimit.remaining = 0;
      this.stats.rateLimit.resetAt = Date.now() + 60000; // Assume 1-minute timeout
      
      // Increase throttling when we hit rate limits
      this.throttleDelay = Math.min(this.throttleDelay * 2, 5000);
    }
    
    // If we're seeing consecutive failures, increase throttling
    if (this.stats.consecutiveFailures > 3) {
      this.throttleDelay = Math.min(this.throttleDelay + 500, 5000);
    }
  }
  
  // Get current stats
  getStats(): RequestStats {
    return { ...this.stats };
  }
  
  // Reset stats
  reset(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastRequestTime: 0,
      consecutiveFailures: 0,
      rateLimit: {
        remaining: 100,
        resetAt: 0
      }
    };
    this.throttleDelay = 500;
  }
}

// Export a singleton instance
export const requestTracker = new RequestTracker();
