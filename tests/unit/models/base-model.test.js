/* eslint-env node, mocha */
/* eslint no-unused-vars:0 */

import { expect } from 'chai';

import BaseModel from '../../../src/models/base-model';

describe('BaseModel', () => {
  context('constructor', () => {
    it('should not be able to create an instance of a base model', () => {
      expect(() => {
        const x = new BaseModel();
      }).to.throw();
    });
  });
});
