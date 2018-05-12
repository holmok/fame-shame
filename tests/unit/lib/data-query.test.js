/* eslint-env node, mocha */
/* eslint no-unused-expressions:0 */

import { expect } from 'chai';
import Sinon from 'sinon';

import DataQuery from '../../../src/lib/data-query';

describe('DataQuery', () => {
  let data;
  let sandbox;
  let clientMock;
  let client;

  beforeEach(() => {
    data = new DataQuery();
    sandbox = Sinon.createSandbox();
    client = { query() {}, release() {} };
    clientMock = sandbox.mock(client);
    clientMock.expects('release').once();
    sandbox.stub(data.pool, 'connect').resolves(client);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('run', () => {
    it('should run with and return an array', async () => {
      clientMock
        .expects('query')
        .once()
        .resolves({ rows: [] });
      const result = await data.run('sql', { params: 'params' }, 'name');
      expect(result).to.be.an('array');
      clientMock.verify();
    });

    it('should handle params correctly', async () => {
      clientMock
        .expects('query')
        .once()
        .withArgs({
          text: 'SELECT $1 FROM $2 WHERE enable=$3',
          values: ['apple', 123, true],
          name: 'name',
        })
        .resolves({ rows: [] });
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
    });

    it('should handle dupe params correctly', async () => {
      clientMock
        .expects('query')
        .once()
        .withArgs({
          text: 'SELECT $1, $2 FROM $2 WHERE enable=$3',
          values: ['apple', 123, true],
          name: 'name',
        })
        .resolves({ rows: [] });
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
    });

    it('should fail on postgres error', async () => {
      clientMock
        .expects('query')
        .once()
        .rejects();
      data.on('error', (error) => {
        expect(error).to.exist;
      });
      await data.run('sql', { params: 'params' }, 'name');
      clientMock.verify();
    });
  });
});
