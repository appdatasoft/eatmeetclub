/**
 * Request tracker to prevent too many requests being sent at once
 */

type PendingRequest = {
  resolve: () => void;
  priority: number;
  timestamp: number;
};

class RequestTracker {
  private activeRequests = 0;
  private maxConcurrentRequests = 10; // Maximum concurrent requests
  private pendingQueue: PendingRequest[] = [];
  private processingQueue = false;

  // Add a request to the queue and wait until it can be processed
  async add<T>(requestFn: () => Promise<T>, cacheKey?: string): Promise<T> {
    // If we haven't hit our limit, process immediately
    if (this.activeRequests < this.maxConcurrentRequests) {
      this.activeRequests++;
      try {
        return await requestFn();
      } finally {
        this.activeRequests--;
        this.processQueue();
      }
    }

    // Otherwise, queue the request
    return new Promise<T>((resolve, reject) => {
      const priority = cacheKey ? 0 : 1; // Lower priority for cached requests
      
      // Add to pending queue
      const queued: PendingRequest = {
        resolve: async () => {
          this.activeRequests++;
          try {
            const result = await requestFn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.activeRequests--;
            this.processQueue();
          }
        },
        priority,
        timestamp: Date.now()
      };
      
      this.pendingQueue.push(queued);
      
      // Ensure the queue processing starts
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  // Check if we need to wait before sending another request
  async checkAndWait(): Promise<void> {
    if (this.activeRequests < this.maxConcurrentRequests) {
      return;
    }
    
    // Wait for a slot to open
    return new Promise(resolve => {
      const queued: PendingRequest = {
        resolve,
        priority: 2, // Higher priority for system checks
        timestamp: Date.now()
      };
      
      this.pendingQueue.push(queued);
      
      // Ensure the queue processing starts
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  // Release a request slot
  releaseRequest(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    this.processQueue();
  }

  // Process pending requests in the queue
  private async processQueue(): Promise<void> {
    // If we're already processing the queue or there are no slots available, return
    if (this.processingQueue || this.activeRequests >= this.maxConcurrentRequests || this.pendingQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      // Sort queue by priority (lower number = higher priority) and then by timestamp
      this.pendingQueue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      // Process as many requests as we can
      while (this.pendingQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
        const next = this.pendingQueue.shift();
        if (next) {
          next.resolve();
        }
      }
    } finally {
      this.processingQueue = false;
      
      // If there are still pending requests and slots available, process again
      if (this.pendingQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }
}

export const requestTracker = new RequestTracker();
