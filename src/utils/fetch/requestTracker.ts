
interface RequestTrackerOptions {
  maxConcurrent?: number;
  timeout?: number;
}

class RequestTracker {
  private ongoingRequests = 0;
  private maxConcurrent: number;
  private timeout: number;
  private waitingCallbacks: Array<() => void> = [];

  constructor(options: RequestTrackerOptions = {}) {
    this.maxConcurrent = options.maxConcurrent || 6;
    this.timeout = options.timeout || 30000;
  }

  startRequest(): void {
    this.ongoingRequests++;
  }

  endRequest(): void {
    this.ongoingRequests--;
    if (this.waitingCallbacks.length > 0 && this.ongoingRequests < this.maxConcurrent) {
      const callback = this.waitingCallbacks.shift();
      if (callback) callback();
    }
  }

  getOngoingCount(): number {
    return this.ongoingRequests;
  }

  checkAndWait(): Promise<void> {
    if (this.ongoingRequests < this.maxConcurrent) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      const timeoutId = setTimeout(() => {
        const index = this.waitingCallbacks.indexOf(resolve);
        if (index !== -1) {
          this.waitingCallbacks.splice(index, 1);
        }
        resolve();
      }, this.timeout);

      this.waitingCallbacks.push(() => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  }

  releaseRequest(): void {
    this.endRequest();
  }
}

export const requestTracker = new RequestTracker();
