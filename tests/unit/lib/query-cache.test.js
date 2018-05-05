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
    it('should set fine with object value', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      await qc.set('sql', 'params', {});
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should set fine without value', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      await qc.set('sql', 'params');
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should set fine with string', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, null, 'result');
      await qc.set('sql', 'params', 'apple');
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should error on cache set fail', async () => {
      sandbox.stub(qc.cache, 'set').callsArgWith(3, 'error', 'result');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params', {});
      sandbox.assert.calledOnce(qc.cache.set);
    });

    it('should fail on bson serialize fail', async () => {
      sandbox.stub(qc.bson, 'serialize').throws();
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.set('sql', 'params', {});
    });
  });

  context('get', () => {
    it('should get fine with undefined', async () => {
      sandbox.stub(qc.cache, 'get').callsArgWith(1, null, undefined);
      const result = await qc.get('sql', 'params', {});
      expect(result).to.be.undefined;
      sandbox.assert.calledOnce(qc.cache.get);
    });

    it('should get fine with object', async () => {
      const data = bson.serialize({ apple: true });
      sandbox.stub(qc.cache, 'get').callsArgWith(1, null, data);
      const result = await qc.get('sql', 'params', {});
      expect(result).to.deep.equal({ apple: true });
      sandbox.assert.calledOnce(qc.cache.get);
    });

    // it('should error', async () => {
    //   sandbox.stub(qc.cache, 'set').callsArgWith(3, 'error', 'result');
    //   qc.on('error', (error) => {
    //     expect(error).to.exist;
    //   });
    //   await qc.set('sql', 'params', {});
    //   sandbox.assert.calledOnce(qc.cache.set);
    // });
  });

  context('flush', () => {
    it('should flush fine', async () => {
      sandbox.stub(qc.cache, 'flush').callsArgWith(0, null, 'result');
      await qc.flush();
      sandbox.assert.calledOnce(qc.cache.flush);
    });

    it('should error on cache fail fail', async () => {
      sandbox.stub(qc.cache, 'flush').callsArgWith(0, 'error');
      qc.on('error', (error) => {
        expect(error).to.exist;
      });
      await qc.flush();
      sandbox.assert.calledOnce(qc.cache.flush);
    });
  });
});
