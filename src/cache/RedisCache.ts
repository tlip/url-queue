import redis from 'redis';
import bluebird from 'bluebird';

// So that we can promisify the redis client methods
bluebird.promisifyAll(redis.RedisClient.prototype);

/**
 * Redis Cache
 */
class RedisCache {

  /**
   * client --
   * This is static so that we can reuse the same redis store wherever we
   * use this struct
   */
  static client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: +<string | number>process.env.REDIS_PORT,
  });

  /**
   * set --
   * This asyncronously sets a key/value to the cache
   */
  static set = async (key: string, value: string): Promise<string | null> => {
    // @ts-ignore
    return await RedisCache.client.setAsync(key, value, 'EX', 60);
  }

  /**
   * get --
   * This asynchronously retrieves a key/value from the cache
   */
  static get = async (key: string): Promise<string | null> => {
    // @ts-ignore
    return await RedisCache.client.getAsync(key);
  }

}

export default RedisCache;
