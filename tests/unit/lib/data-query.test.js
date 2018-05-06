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
    it('should run with and return an array', async () => {
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

    it('should run query on missing cache', async () => {
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .once()
        .resolves({ rows: [] });
      clientMock.expects('release').once();
      sandbox.stub(data.queryCache, 'get').resolves();
      sandbox.stub(data.queryCache, 'set').resolves();
      sandbox.stub(data.pool, 'connect').resolves(client);
      const result = await data.run('sql', 'params', 'name', 300);
      expect(result).to.be.an('array');
      clientMock.verify();
      clientMock.restore();
    });

    it('should not run query on cache hit', async () => {
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .never()
        .resolves({ rows: [] });
      clientMock.expects('release').never();
      sandbox.stub(data.queryCache, 'get').resolves([]);
      sandbox.stub(data.queryCache, 'set').resolves();
      sandbox.stub(data.pool, 'connect').resolves(client);
      const result = await data.run('sql', 'params', 'name', 300);
      expect(result).to.be.an('array');
      clientMock.verify();
      clientMock.restore();
    });

    it('should handle params correctly', async () => {
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .once()
        .withArgs({
          text: 'SELECT $1 FROM $2 WHERE enable=$3',
          values: ['apple', 123, true],
          name: 'name',
        })
        .resolves({ rows: [] });
      clientMock.expects('release').once();
      sandbox.stub(data.pool, 'connect').resolves(client);
      const result = await data.run(
        'SELECT $string FROM $number WHERE enable=$boolean',
        {
          string: 'apple',
          number: 123,
          boolean: true,
        },
        'name',
      );
      expect(result).to.be.an('array');
      clientMock.verify();
      clientMock.restore();
    });

    it('should handle dupe params correctly', async () => {
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .once()
        .withArgs({
          text: 'SELECT $1, $2 FROM $2 WHERE enable=$3',
          values: ['apple', 123, true],
          name: 'name',
        })
        .resolves({ rows: [] });
      clientMock.expects('release').once();
      sandbox.stub(data.pool, 'connect').resolves(client);
      const result = await data.run(
        'SELECT $string, $number FROM $number WHERE enable=$boolean',
        {
          string: 'apple',
          number: 123,
          boolean: true,
        },
        'name',
      );
      expect(result).to.be.an('array');
      clientMock.verify();
      clientMock.restore();
    });

    it('should fail on postgres error', async () => {
      const client = { query() {}, release() {} };
      const clientMock = Sinon.mock(client);
      clientMock
        .expects('query')
        .once()
        .rejects();
      clientMock.expects('release').once();
      sandbox.stub(data.pool, 'connect').resolves(client);
      data.on('error', (error) => {
        expect(error).to.exist;
      });
      await data.run('sql', 'params', 'name');
      clientMock.verify();
      clientMock.restore();
    });
  });
});
