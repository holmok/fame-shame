import BaseModel from './base-model';

const GET_LIST = `
SELECT "id", "label", "name", "is_float" as "isFlost", "created", "updated" 
FROM "metrics"."units" 
LIMIT $take
OFFSET $skip;
`;

const GET_BY_ID = `
SELECT "id", "label", "name", "is_float" as "isFlost", "created", "updated"
FROM "metrics"."units" 
WHERE "id" = $id 
LIMIT 1;
`;

const GET_BY_LABEL = `
SELECT "id", "label", "name", "is_float" as "isFlost", "created", "updated"
FROM "metrics"."units" 
WHERE "label" = $label 
LIMIT 1;
`;

const CREATE = `
INSERT INTO "metrics"."units"
("label", "name", "is_float")
VALUES
($label, $name, $isFloat)
RETURNING "id";
`;

const UPDATE = `
UPDATE "metrics"."units" 
SET "label" = $label, "name" = $name, "is_float" = $isFLoat, "updated" = CURRENT_TIMESTAMP
WHERE "id",  = $id
`;

class Units extends BaseModel {
  getList(skip = 0, take = 25) {
    return this.dataQuery.run(GET_LIST, { skip, take }, 'get-unit-list');
  }

  async getById(id) {
    const [results] = await this.dataQuery.run(GET_BY_ID, { id }, 'get-unit-by-id');
    return results;
  }

  async getByLabel(label) {
    const [results] = await this.dataQuery.run(GET_BY_LABEL, { label }, 'get-unit-by-label');
    return results;
  }

  async create(label, name, isFloat) {
    const [{ id }] = await this.dataQuery.run(CREATE, { label, name, isFloat }, 'create-unit');
    return id;
  }

  async update(id, label, name, isFloat) {
    await this.dataQuery.run(
      UPDATE,
      {
        id,
        label,
        name,
        isFloat,
      },
      'update-unit',
    );
  }
}

export default Units;
