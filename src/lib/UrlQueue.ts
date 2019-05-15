import axios from 'axios';
import signale from 'signale';

import AsyncQueue from './AsyncQueue';

import RedisCache from '../cache/RedisCache';
import db from '../db';

/**
 * Url Queue
 * ---------
 * This queue extends AsyncQueue
 * 
 * The purpose of this queue is to spawn workers that:
 * 
 *  1) Request step:
 *    a) Set a `@url:@id` pair in the cache
 *    b) Checks if call is trying to fetch local IPs
 *    c) Make a request to @url
 * 
 *  2) When the request returns:
 *    a) Store the job data in the database
 *    b) Set an `@id:result` pair in the cache
 */
class UrlQueue extends AsyncQueue {

  /**
   * Check If Local IP --
   * Checks if the supplied URL is a local IP
   */
  static checkIfLocalIP = (url: string) => {
    const urlIs0_0_0_0 = url !== url.replace(/^https:\/\/0\.0\.0\.0/, '');
    const urlIs10 = url !== url.replace(/^https:\/\/10\.\d+\.\d+\.\d+/, '');
    const urlIs127 = url !== url.replace(/^https:\/\/127\.\d+\.\d+\.\d+/, '');
    const urlIs172 = url !== url.replace(/^https:\/\/172\.(1[6-9]|2[0-9]|3[0-6])\.\d+\.\d+/, '');
    const urlIs192_168 = url !== url.replace(/^https:\/\/192\.168\.\d+\.\d+/, '');
    const urlIsLocalhost = url !== url.replace(/^https:\/\/localhost/i, '');
    return urlIs0_0_0_0 || urlIs10 || urlIs127 || urlIs172 || urlIs192_168 || urlIsLocalhost;
  }
  
  /**
   * Worker --
   * Is static so that all UrlQueue instances share the same worker function
   */
  static worker = async (task: { id: string, url: string }, callback: Function) => {
    
    let _url = `https://${task.url}`;
    let htmlResponse: { data: string };
    const isLocalIp = UrlQueue.checkIfLocalIP(_url);
    
    // 1a
    RedisCache.set(`url:${task.url}`, task.id);

    if (isLocalIp) {
      // 1b
      htmlResponse = { data: `Cannot complete request to ${task.url} [JOB ${task.id}]` };
    } else {
      // 1c
      htmlResponse = await axios.get(_url)
        .catch((error: Error) => {
          signale.error(`UrlQueueWorkerError:\n${error}`);
          return { data: `Cannot complete request to ${task.url} [JOB ${task.id}]` };
        });
    }

    try {
      // 2a
      db.Urls.save(task.id, task.url, htmlResponse.data);
      // 2b
      RedisCache.set(`id:${task.id}`, htmlResponse.data);
      callback();
    } catch (error) {
      signale.error(`UrlQueueWorkerError:\n${error}`);
      throw error;
    }
  }

  /**
   * Constructor --
   * This constructor delgates functionality back to its AsyncQueue parent class
   */
  constructor(concurrency = 1) {
    super(UrlQueue.worker, concurrency);
  }

}

export default new UrlQueue(10);
