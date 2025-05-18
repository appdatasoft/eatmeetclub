
/**
 * Request tracker for implementing rate limiting and concurrency control
 */

// Global request tracker with sophisticated throttling
const requestTracker = {
  count: 0,
  lastReset: Date.now(),
  maxRequestsPerMinute: 30, // Reduced from 60 to 30
  inProgressRequests: 0,
  maxConcurrentRequests: 3,
  requestQueue: [] as Array<() => void>,
  
  async checkAndWait() {
    // Reset counter after a minute
    if (Date.now() - this.lastReset > 60000) {
      this.count = 0;
      this.lastReset = Date.now();
    }
    
    this.count++;
    
    // If we're at our concurrent limit, queue the request
    if (this.inProgressRequests >= this.maxConcurrentRequests) {
      return new Promise<void>(resolve => {
        this.requestQueue.push(resolve);
      });
    }
    
    // If we're hitting our rate limit, add artificial delay
    if (this.count > this.maxRequestsPerMinute) {
      const waitTime = Math.min(10000, Math.pow(2, this.count - this.maxRequestsPerMinute) * 200);
      console.warn(`Rate limiting, waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.inProgressRequests++;
    return Promise.resolve();
  },
  
  releaseRequest() {
    this.inProgressRequests--;
    
    // Process next request from queue if any
    if (this.requestQueue.length > 0 && this.inProgressRequests < this.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }
  }
};

export { requestTracker };
