import Pg from 'pg';
import EventEmitter from 'events';

import { emitter } from './common';
import QueryCache from './query-cache';

function setParameters(sql, params) {
  const namedParam = /\$(\w+)/g;
  let newSql = sql;
  const done = new Set();
  const newValues = [];
  let result = true;

  while (result) {
    result = namedParam.exec(sql);
    if (!result) {
      break;
    }
    const param = result[1];
    if (!done.has(param)) {
      done.add(param);
      newValues.push(params[param]);
      const replacer = new RegExp(`\\${result[0]}`, 'g');
      newSql = newSql.replace(replacer, `$${done.size}`);
    }
  }
  return { text: newSql, values: done.size > 0 ? newValues : undefined };
}

async function execute(sql, params, name) {
  let result;
  const query = setParameters(sql, params);
  query.name = name;
  emitter.call(this, 'event', 'Executing sql', query);
  const client = await this.pool.connect();
  try {
    const output = await client.query(query);
    emitter.call(this, 'event', 'Executed sql', query);
    result = output.rows;
  } catch (error) {
    console.log(error);
    emitter.call(this, 'error', 'Failed to execute sql', { error, query });
  } finally {
    client.release();
  }
  return result;
}

class DataQuery extends EventEmitter {
  constructor(options, queryCache = new QueryCache()) {
    super();
    const { Pool } = Pg.native;
    this.pool = new Pool(options);
    this.queryCache = queryCache;
    this.pool.on('error', (error) => {
      emitter.call(this, 'error', 'Unexpected error on idle client', error);
    });
  }

  async run(sql, params, name, ttl = 0) {
    let result;
    if (ttl) {
      result = await this.cache.get(sql, params);
      if (result) {
        return result;
      }
    }
    result = execute.call(this, sql, params, name);
    if (result && ttl) {
      await this.cache.set(sql, params, ttl);
    }
    return result;
  }
}

export default DataQuery;
