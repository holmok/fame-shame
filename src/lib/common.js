function event(type, msg, data) {
  const message = `${msg}${data ? ':' : '.'} ${Object.keys(data || {})
    .map(key => `${key}=${JSON.stringify(data[key])}`)
    .join(', ')}`;
  this.emit(type, message);
}

export default { event };
