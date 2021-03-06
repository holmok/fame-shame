/* eslint-env node, mocha */
/* eslint no-unused-vars:0 */

import { expect } from 'chai';
import Sinon from 'sinon';

import Owners from '../../../src/models/owners';
import DataQuery from '../../../src/lib/data-query';

describe('Owners', () => {
  const date = new Date();
  const data = {
    id: 123,
    name: 'name',
    label: 'label',
    created: date,
    updated: date,
  };
  let owners;
  let queryStub;
  let sandbox;
  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    queryStub = sandbox.createStubInstance(DataQuery);
    owners = new Owners(queryStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('constructor', () => {
    it('should be able to create an instance of a owners model', () => {
      const x = new Owners(queryStub);
      expect(x).to.be.an('object');
    });
  });

  context('methods', () => {
    it('should be able call create', async () => {
      queryStub.run.resolves([{ id: 123 }]);
      const results = await owners.create('label', 'name');
      expect(results).to.be.equal(123);
    });

    it('should be able call update', async () => {
      queryStub.run.resolves();
      await owners.update(123, 'label', 'name');
    });

    it('should be able call getById', async () => {
      queryStub.run.resolves([data]);
      const results = await owners.getById(123);
      expect(results).to.deep.equal(data);
    });

    it('should be able call getByLabel', async () => {
      queryStub.run.resolves([data]);
      const results = await owners.getByLabel('label');
      expect(results).to.deep.equal(data);
    });

    it('should be able call getList', async () => {
      queryStub.run.resolves([data, data]);
      const results = await owners.getList();
      expect(results).to.deep.equal([data, data]);
    });
  });
});
