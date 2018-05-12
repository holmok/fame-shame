/* eslint-env node, mocha */
/* eslint no-unused-vars:0 */

import { expect } from 'chai';
import Sinon from 'sinon';

import Units from '../../../src/models/units';
import DataQuery from '../../../src/lib/data-query';

describe('Units', () => {
  const date = new Date();
  const data = {
    id: 123,
    name: 'name',
    label: 'label',
    isFloat: true,
    created: date,
    updated: date,
  };
  let units;
  let queryStub;
  let sandbox;
  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    queryStub = sandbox.createStubInstance(DataQuery);
    units = new Units(queryStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('constructor', () => {
    it('should be able to create an instance of a units model', () => {
      const x = new Units(queryStub);
      expect(x).to.be.an('object');
    });
  });

  context('methods', () => {
    it('should be able call create', async () => {
      queryStub.run.resolves([{ id: 123 }]);
      const results = await units.create('label', 'name', true);
      expect(results).to.be.equal(123);
    });

    it('should be able call update', async () => {
      queryStub.run.resolves();
      await units.update(123, 'label', 'name', true);
    });

    it('should be able call getById', async () => {
      queryStub.run.resolves([data]);
      const results = await units.getById(123);
      expect(results).to.deep.equal(data);
    });

    it('should be able call getByLabel', async () => {
      queryStub.run.resolves([data]);
      const results = await units.getByLabel('label');
      expect(results).to.deep.equal(data);
    });

    it('should be able call getList', async () => {
      queryStub.run.resolves([data, data]);
      const results = await units.getList();
      expect(results).to.deep.equal([data, data]);
    });
  });
});
