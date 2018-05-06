/* eslint-env node, mocha */
/* eslint no-unused-expressions:0 */

import { expect } from 'chai';
import Sinon from 'sinon';
import BSON from 'bson';

import QueryCache from '../../../src/lib/query-cache';

describe('QueryCache', () => {
  let cache;
  let sandbox;

  beforeEach(() => {
    cache = new QueryCache();
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('set', () => {
    it('should set with object value', async () => {
      sandbox.stub(cache.cache, 'set').callsArgWith(3, null, 'result');
      await cache.set('sql', 'params', {});
      sandbox.assert.calledOnce(cache.cache.set);
    });

    it('should fail set without value', async () => {
      sandbox.stub(cache.cache, 'set').callsArgWith(3, null, 'result');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.set('sql', 'params');
      sandbox.assert.notCalled(cache.cache.set);
    });

    it('should fail set with string', async () => {
      sandbox.stub(cache.cache, 'set').callsArgWith(3, null, 'result');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.set('sql', 'params', 'apple');
      sandbox.assert.notCalled(cache.cache.set);
    });

    it('should fail set on cache error', async () => {
      sandbox.stub(cache.cache, 'set').callsArgWith(3, 'error', 'result');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.set('sql', 'params', {});
      sandbox.assert.calledOnce(cache.cache.set);
    });

    it('should fail set  on bson serialize fail', async () => {
      sandbox.stub(cache.bson, 'serialize').throws();
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.set('sql', 'params', {});
    });
  });

  context('get', () => {
    it('should get with undefined', async () => {
      sandbox.stub(cache.cache, 'get').callsArgWith(1, null, undefined);
      const result = await cache.get('sql', 'params');
      expect(result).to.be.undefined;
      sandbox.assert.calledOnce(cache.cache.get);
    });

    it('should get with object', async () => {
      const bson = new BSON();
      const data = bson.serialize({ apple: true });
      sandbox.stub(cache.cache, 'get').callsArgWith(1, null, data);
      const result = await cache.get('sql', 'params');
      expect(result).to.deep.equal({ apple: true });
      sandbox.assert.calledOnce(cache.cache.get);
    });

    it('should fail get with no params', async () => {
      sandbox.stub(cache.cache, 'get');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      const result = await cache.get();
      expect(result).to.be.undefined;
      sandbox.assert.notCalled(cache.cache.get);
    });

    it('should fail get on cache error', async () => {
      sandbox.stub(cache.cache, 'get').callsArgWith(1, 'error');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.get('sql', 'params');
      sandbox.assert.calledOnce(cache.cache.get);
    });

    it('should fail get on deserialize error', async () => {
      const bson = new BSON();
      const data = bson.serialize({ apple: true });
      sandbox.stub(cache.cache, 'get').callsArgWith(1, null, data);
      sandbox.stub(cache.bson, 'deserialize').throws();
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.get('sql', 'params');
      sandbox.assert.calledOnce(cache.cache.get);
    });
  });

  context('flush', () => {
    it('should flush', async () => {
      sandbox.stub(cache.cache, 'flush').callsArgWith(0, null, 'result');
      await cache.flush();
      sandbox.assert.calledOnce(cache.cache.flush);
    });

    it('should fail flush on cache error', async () => {
      sandbox.stub(cache.cache, 'flush').callsArgWith(0, 'error');
      cache.on('error', (error) => {
        expect(error).to.exist;
      });
      await cache.flush();
      sandbox.assert.calledOnce(cache.cache.flush);
    });
  });
});
