import async, { AsyncWorker } from 'async';

/**
 * Async Queue
 * -----------
 * It's used as the bottom level interface to extend to more specific queue implementations
 * 
 * Although this looks like a pointless class, as it just copies over the functionality
 * pretty much verbatim, the reason I added this level of abstraction was because we may want
 * to add or extend the basic functionality to all of its inhereting subclasses in the future.
 */
class AsyncQueue {

  // The async queue member
  protected queue: async.AsyncQueue<any>;
  
  /**
   * Constructor --
   * Where we initialize our queue
   */
  constructor(worker: AsyncWorker<any, any>, concurrency: number) {
    this.queue = async.queue(worker, concurrency);
  }

  /**
   * Push -- 
   * Add a job to the end of the queue
   */
  public push = (task: { [field: string]: any }) => {
    this.queue.push(task);
  }

}

export default AsyncQueue;
