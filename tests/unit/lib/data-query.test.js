/* eslint-env node, mocha */
/* eslint no-unused-expressions:0 */

import { expect } from 'chai';
import Sinon from 'sinon';

import DataQuery from '../../../src/lib/data-query';

describe('DataQuery', () => {
  let data;
  let sandbox;

  beforeEach(() => {
    data = new DataQuery();
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('run', () => {
    it('should set with object value', async () => {
      const clientMock = Sinon.mock();
      clientMock
        .expects('query')
        .once()
        .resolves();
      sandbox.stub(data.pool, 'connect').resolves(clientMock);
      await data.run('sql', 'params', {});
      sandbox.assert.calledOnce(cache.cache.set);
    });
  });
});
