/* eslint-env node, mocha */
/* eslint no-unused-expressions:0 */

import { expect } from 'chai';
import Sinon from 'sinon';
import BSON from 'bson';

import QueryCache from '../../../src/lib/query-cache';

describe('QueryCache', () => {
  let qc;
  let sandbox;
  let bson;
  beforeEach(() => {
    qc = new QueryCache();
    bson = new BSON();
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('set', () => {
    it('should set with object value', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      await qc.set('sql', 'params', {});
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should fail set without value', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params');
      sandbox.assert.notCalled(qc.cache.set);
    });

    it('should fail set with string', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params', 'apple');
      sandbox.assert.notCalled(qc.cache.set);
    });

    it('should fail set on cache error', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, 'error', 'result');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params', {});
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should fail set  on bson serialize fail', async () => {
      sandbox.stub(qc.bson, 'serialize').throws();
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params', {});
    });
  });

  context('get', () => {
    it('should get with undefined', async () => {
      sandbox.stub(qc.cache, 'get').callsArgWith(1, null, undefined);
      const result = await qc.get('sql', 'params');
      expect(result).to.be.undefined;
      sandbox.assert.calledOnce(qc.cache.get);
    });

    it('should get with object', async () => {
      const data = bson.serialize({ apple: true });
      sandbox.stub(qc.cache, 'get').callsArgWith(1, null, data);
      const result = await qc.get('sql', 'params');
      expect(result).to.deep.equal({ apple: true });
      sandbox.assert.calledOnce(qc.cache.get);
    });

    it('should fail get with no params', async () => {
      sandbox.stub(qc.cache, 'get');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      const result = await qc.get();
      expect(result).to.be.undefined;
      sandbox.assert.notCalled(qc.cache.get);
    });

    it('should fail get on cache error', async () => {
      sandbox.stub(qc.cache, 'get').callsArgWith(1, 'error');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.get('sql', 'params');
      sandbox.assert.calledOnce(qc.cache.get);
    });

    it('should fail get on deserialize error', async () => {
      const data = bson.serialize({ apple: true });
      sandbox.stub(qc.cache, 'get').callsArgWith(1, null, data);
      sandbox.stub(qc.bson, 'deserialize').throws();
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.get('sql', 'params');
      sandbox.assert.calledOnce(qc.cache.get);
    });
  });

  context('flush', () => {
    it('should flush', async () => {
      sandbox.stub(qc.cache, 'flush').callsArgWith(0, null, 'result');
      await qc.flush();
      sandbox.assert.calledOnce(qc.cache.flush);
    });

    it('should fail flush on cache error', async () => {
      sandbox.stub(qc.cache, 'flush').callsArgWith(0, 'error');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.flush();
      sandbox.assert.calledOnce(qc.cache.flush);
    });
  });
});
