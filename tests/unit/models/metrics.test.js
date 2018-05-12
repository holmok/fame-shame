/* eslint-env node, mocha */
/* eslint no-unused-vars:0 */

import { expect } from 'chai';
import Sinon from 'sinon';

import Metrics from '../../../src/models/metrics';
import DataQuery from '../../../src/lib/data-query';

describe('Metrics', () => {
  const date = new Date();
  const data = {
    id: 123,
    name: 'name',
    label: 'label',
    created: date,
    updated: date,
    unit_id: 12,
    unit_name: 'unit_name',
    unit_label: 'unit_label',
    unit_is_float: true,
    unit_created: date,
    unit_updated: date,
  };
  const output = {
    id: 123,
    name: 'name',
    label: 'label',
    created: date,
    updated: date,
    unit: {
      id: 12,
      name: 'unit_name',
      label: 'unit_label',
      isFloat: true,
      created: date,
      updated: date,
    },
  };
  let metrics;
  let queryStub;
  let sandbox;
  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    queryStub = sandbox.createStubInstance(DataQuery);
    metrics = new Metrics(queryStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('constructor', () => {
    it('should be able to create an instance of a units model', () => {
      const x = new Metrics(queryStub);
      expect(x).to.be.an('object');
    });
  });

  context('methods', () => {
    it('should be able call create', async () => {
      queryStub.run.resolves([{ id: 123 }]);
      const results = await metrics.create('label', 'name', 12);
      expect(results).to.be.equal(123);
    });

    it('should be able call update', async () => {
      queryStub.run.resolves();
      await metrics.update(123, 'label', 'name', 12);
    });

    it('should be able call getById', async () => {
      queryStub.run.resolves([data]);
      const results = await metrics.getById(123);
      expect(results).to.deep.equal(output);
    });

    it('should be able call getByLabel', async () => {
      queryStub.run.resolves([data]);
      const results = await metrics.getByLabel('label');
      expect(results).to.deep.equal(output);
    });

    it('should be able call getList', async () => {
      queryStub.run.resolves([data, data]);
      const results = await metrics.getList();
      expect(results).to.deep.equal([output, output]);
    });
  });
});
