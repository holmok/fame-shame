import Memcahed from 'memcached';
import BSON from 'bson';
import EventEmitter from 'events';
import Hash from 'object-hash';
import Base62 from 'base62';

import { emitter } from './common';

function makeKey(sql, params) {
  if (!sql) {
    throw new Error('Parameter sql cannot be empty');
  }
  const hash = Hash({ sql, params });
  return Base62.encode(hash);
}

class QueryCache extends EventEmitter {
  constructor(host, options, ttl = 300) {
    super();

    this.cache = new Memcahed(host, options);
    this.bson = new BSON();
    this.ttl = ttl;

    /* istanbul ignore next */
    this.cache.on('failure', (error) => {
      emitter.call(this, 'error', 'Cache failure event', error);
    });

    /* istanbul ignore next */
    this.cache.on('issue', (error) => {
      emitter.call(this, 'error', 'Cache issue event', error);
    });

    emitter.call(this, 'event', 'Cache initialized', { host, options });
  }

  set(sql, params, value, ttl = this.ttl) {
    return new Promise((resolve) => {
      try {
        if (typeof value !== 'object') {
          throw new Error('Can only cache objects in QueryCache.');
        }
        emitter.call(this, 'event', 'Setting item to cache', { sql, params, ttl });

        const key = makeKey(sql, params);

        const buffer = this.bson.serialize(value);

        this.cache.set(key, buffer, ttl, (error, result) => {
          if (error) {
            emitter.call(this, 'error', 'Failed setting item to cache', error);
            resolve();
          } else {
            emitter.call(this, 'event', 'Set item to cache', {
              key,
              sql,
              params,
              ttl,
            });
            resolve(result);
          }
        });
      } catch (error) {
        emitter.call(this, 'error', 'Failed setting item to cache', error);
        resolve();
      }
    });
  }

  get(sql, params) {
    return new Promise((resolve) => {
      try {
        emitter.call(this, 'event', 'Getting item from cache', { sql, params });

        const key = makeKey(sql, params);

        this.cache.get(key, (error, result) => {
          if (error) {
            emitter.call(this, 'error', 'Failed getting item from cache', {
              key,
              sql,
              params,
              error,
            });
            resolve();
          } else {
            try {
              const data = result ? this.bson.deserialize(result) : undefined;
              emitter.call(this, 'event', 'Got item from cache', { key, sql, params });
              resolve(data);
            } catch (err) {
              emitter.call(this, 'error', 'Failed getting item from cache', {
                key,
                sql,
                params,
                err,
              });
              resolve();
            }
          }
        });
      } catch (error) {
        emitter.call(this, 'error', 'Failed setting item to cache', {
          sql,
          params,
          error,
        });
        resolve();
      }
    });
  }

  flush() {
    return new Promise((resolve) => {
      emitter.call(this, 'event', 'Flushing cache');
      this.cache.flush((error) => {
        if (error) {
          emitter.call(this, 'error', 'Failed setting item to cache', error);
          resolve();
        } else {
          emitter.call(this, 'event', 'Flushed cache');
          resolve();
        }
      });
    });
  }
}

export default QueryCache;
