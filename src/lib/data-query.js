// import Pg from 'pg';

// import { event } from './common';

// function setParameters(sql, params) {
//   const namedParam = /\$(\w+)/g;
//   let newSql = sql;
//   const done = new Set();
//   const newValues = [];
//   let result = true;

//   while (result) {
//     result = namedParam.exec(sql);
//     if (!result) {
//       break;
//     }
//     const param = result[1];
//     if (!done.has(param)) {
//       done.add(param);
//       newValues.push(params[param]);
//       const replacer = new RegExp(`\\${result[0]}`, 'g');
//       newSql = newSql.replace(replacer, `$${done.size}`);
//     }
//   }

//   return { text: newSql, values: done.size > 0 ? newValues : undefined };
// }

// async function execute(sql, params, name, rowMode) {
//   const query = setParameters(sql, params);
//   query.name = name;
//   query.rowMode = rowMode;
//   event.call(this, 'event', 'Executing sql', query);
//   const client = await this.pool.connect();
//   try {
//     const output = await client.query(query);
//     event.call(this, 'event', 'Executied sql', query);
//     return output.rows;
//   } catch (error) {
//     event.call(this, 'error', 'Failed to execute sql', { error, query });
//   } finally {
//     client.release();
//   }
// }
