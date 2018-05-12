import BaseModel from './base-model';

const GET_LIST = `
SELECT "id", "label", "name", "created" 
FROM "metrics"."owners" 
LIMIT $take
OFFSET $skip;
`;

const GET_BY_ID = `
SELECT "id", "label", "name", "created" 
FROM "metrics"."owners" 
WHERE "id" = $id 
LIMIT 1;
`;

const GET_BY_LABEL = `
SELECT "id", "label", "name", "created" 
FROM "metrics"."owners" 
WHERE "label" = $label 
LIMIT 1;
`;

const CREATE = `
INSERT INTO "metrics"."owners"
("label", "name")
VALUES
($label, $name)
RETURNING "id";
`;

const UPDATE = `
UPDATE "metrics"."owners" 
SET "label" = $label, "name" = $name 
WHERE "id",  = $id
`;

class Owners extends BaseModel {
  getList(skip = 0, take = 25) {
    return this.dataQuery.run(GET_LIST, { skip, take }, 'get-owner-by-id');
  }

  async getById(id) {
    const [results] = await this.dataQuery.run(GET_BY_ID, { id }, 'get-owner-by-id');
    return results;
  }

  async getByLabel(label) {
    const [results] = await this.dataQuery.run(GET_BY_LABEL, { label }, 'get-owner-by-label');
    return results;
  }

  async create(label, name) {
    const [{ id }] = await this.dataQuery.run(CREATE, { label, name }, 'create-owner');
    return { id, label, name };
  }

  async update(id, label, name) {
    await this.dataQuery.run(UPDATE, { id, label, name }, 'update-owner');
  }
}

export default Owners;
