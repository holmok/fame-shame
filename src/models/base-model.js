import EventEmitter from 'events';

class BaseModel extends EventEmitter {
  constructor(dataQuery) {
    super();

    // can not create instance of base model
    if (this.constructor.name === 'BaseModel') {
      throw new Error('Can not create an instance of model base');
    }

    // keep the data query
    this.dataQuery = dataQuery;

    // bubble up events
    /* istanbul ignore next */
    this.dataQuery.on('event', (event) => {
      this.emit('event', event);
    });

    /* istanbul ignore next */
    this.dataQuery.on('error', (error) => {
      this.emit('error', error);
    });
  }
}

export default BaseModel;
