import Pg from 'pg';
import EventEmitter from 'events';

function emitter(type, msg, data) {
  const message = `${msg}${data ? ':' : '.'} ${Object.keys(data || {})
    .map(key => `${key}=${JSON.stringify(data[key])}`)
    .join(', ')}`;
  this.emit(type, message);
}

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
    emitter.call(this, 'error', 'Failed to execute sql', { error, query });
  } finally {
    client.release();
  }
  return result;
}

class DataQuery extends EventEmitter {
  constructor(options) {
    super();
    const { Pool } = Pg.native;
    this.pool = new Pool(options);

    /* istanbul ignore next */
    this.pool.on('error', (error) => {
      emitter.call(this, 'error', 'Unexpected error on idle client', error);
    });
  }

  run(sql, params, name) {
    emitter.call(this, 'event', 'Data query called run');
    return execute.call(this, sql, params, name);
  }
}

export default DataQuery;
