import Memcahed from 'memcached';
import BSON from 'bson';
import Hash from 'object-hash';
import Base62 from 'base62';
import EventEmiter from 'events';

function makeKey(sql, params) {
  if (!sql) {
    throw new Error('Parameter sql cannot be empty');
  }
  const hash = Hash({ sql, params });
  return Base62.encode(hash);
}

function event(type, msg, data) {
  const message = `${msg}${data ? ':' : '.'} ${Object.keys(data || {})
    .map(key => `${key}=${JSON.stringify(data[key])}`)
    .join(', ')}`;
  this.emit(type, message);
}

class QueryCache extends EventEmiter {
  constructor(host = '127.0.0.1:11211', options = {}, ttl = 300) {
    super();

    this.cache = new Memcahed(host, options);
    this.bson = new BSON();
    this.ttl = ttl;

    /* istanbul ignore next */
    this.cache.on('failure', (error) => {
      event.call(this, 'error', 'Cache failure event', { error });
    });

    /* istanbul ignore next */
    this.cache.on('issue', (error) => {
      event.call(this, 'error', 'Cache issue event', { error });
    });

    event.call(this, 'event', 'Cache initialized', { host, options });
  }

  set(sql, params, value, ttl = this.ttl) {
    return new Promise((resolve) => {
      try {
        if (typeof value !== 'object') {
          throw new Error('Can only cache objects in query cacher.');
        }
        event.call(this, 'event', 'Setting item to cache', { sql, params, ttl });

        const key = makeKey(sql, params);

        const buffer = this.bson.serialize(value);

        this.cache.set(key, buffer, ttl, (error, result) => {
          if (error) {
            event.call(this, 'error', 'Failed setting item to cache', { error });
            resolve();
          } else {
            event.call(this, 'event', 'Set item to cache', { sql, params, ttl });
            resolve(result);
          }
        });
      } catch (error) {
        event.call(this, 'error', 'Failed setting item to cache', { error });
        resolve();
      }
    });
  }

  get(sql, params) {
    return new Promise((resolve) => {
      try {
        event.call(this, 'event', 'Getting item from cache', { sql, params });

        const key = makeKey(sql, params);

        this.cache.get(key, (error, result) => {
          if (error) {
            event.call(this, 'error', 'Failed getting item from cache', { error });
            resolve();
          } else {
            try {
              const data = result ? this.bson.deserialize(result) : undefined;
              event.call(this, 'event', 'Got item from cache', { sql, params });
              resolve(data);
            } catch (err) {
              event.call(this, 'error', 'Failed getting item from cache', { err });
              resolve();
            }
          }
        });
      } catch (error) {
        event.call(this, 'error', 'Failed setting item to cache', { error });
        resolve();
      }
    });
  }

  flush() {
    return new Promise((resolve) => {
      event.call(this, 'event', 'Flushing cache');
      this.cache.flush((error) => {
        if (error) {
          event.call(this, 'error', 'Failed setting item to cache', { error });
          resolve();
        } else {
          event.call(this, 'event', 'Flushed cache');
          resolve();
        }
      });
    });
  }
}

export default QueryCache;
