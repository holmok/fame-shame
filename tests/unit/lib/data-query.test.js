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
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .once()
        .resolves({ rows: [] });
      clientMock.expects('release').once();
      sandbox.stub(data.pool, 'connect').resolves(client);
      const result = await data.run('sql', 'params', {});
      expect(result).to.be.an('array');
      clientMock.verify();
      clientMock.restore();
    });
  });
});
