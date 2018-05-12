import BaseModel from './base-model';

const GET_LIST = `
SELECT 
  "m"."id" as "id", 
  "m"."label" as "label", 
  "m"."name" as "name", 
  "m"."created" as "created", 
  "m"."updated" as "updated", 
  "u"."id" as "unit_id", 
  "u"."label" as "unit_label", 
  "u"."name" as "unit_name", 
  "u"."is_float" as "unit_is_float", 
  "u"."created" as "unit_created", 
  "u"."updated" as "unit_updated"
FROM "metrics"."metrics" AS "m"
INNER JOIN "metrics"."units" AS "u"
ON "m"."unit_id" = "u"."id"
LIMIT $take
OFFSET $skip;
`;

const GET_BY_ID = `
SELECT 
  "m"."id" as "id", 
  "m"."label" as "label", 
  "m"."name" as "name", 
  "m"."created" as "created", 
  "m"."updated" as "updated", 
  "u"."id" as "unit_id", 
  "u"."label" as "unit_label", 
  "u"."name" as "unit_name", 
  "u"."is_float" as "unit_is_float", 
  "u"."created" as "unit_created", 
  "u"."updated" as "unit_updated"
FROM "metrics"."metrics" AS "m"
INNER JOIN "metrics"."units" AS "u"
ON "m"."unit_id" = "u"."id"
WHERE "id" = $id 
LIMIT 1;
`;

const GET_BY_LABEL = `
SELECT 
  "m"."id" as "id", 
  "m"."label" as "label", 
  "m"."name" as "name", 
  "m"."created" as "created", 
  "m"."updated" as "updated", 
  "u"."id" as "unit_id", 
  "u"."label" as "unit_label", 
  "u"."name" as "unit_name", 
  "u"."is_float" as "unit_is_float", 
  "u"."created" as "unit_created", 
  "u"."updated" as "unit_updated"
FROM "metrics"."metrics" AS "m"
INNER JOIN "metrics"."units" AS "u"
ON "m"."unit_id" = "u"."id"
WHERE "label" = $label 
LIMIT 1;
`;

const CREATE = `
INSERT INTO "metrics"."metrics"
("label", "name", "unit_id")
VALUES
($label, $name, $unitId)
RETURNING "id";
`;

const UPDATE = `
UPDATE "metrics"."metrics" 
SET "label" = $label, "name" = $name, "unit_id" = $unitId, "updated" = CURRENT_TIMESTAMP  
WHERE "id",  = $id
`;

function toObject(results) {
  return {
    id: results.id,
    label: results.label,
    name: results.name,
    created: results.created,
    updated: results.updated,
    unit: {
      id: results.unit_id,
      label: results.unit_label,
      name: results.unit_name,
      isFloat: results.unit_is_float,
      created: results.unit_created,
      updated: results.unit_updated,
    },
  };
}

class Metrics extends BaseModel {
  async getList(skip = 0, take = 25) {
    const results = await this.dataQuery.run(GET_LIST, { skip, take }, 'get-metric-list');
    return results.map(result => toObject(result));
  }

  async getById(id) {
    const [results] = await this.dataQuery.run(GET_BY_ID, { id }, 'get-metric-by-id');
    return toObject(results);
  }

  async getByLabel(label) {
    const [results] = await this.dataQuery.run(GET_BY_LABEL, { label }, 'get-metric-by-label');
    return toObject(results);
  }

  async create(label, name, unitId) {
    const [{ id }] = await this.dataQuery.run(CREATE, { label, name, unitId }, 'create-metric');
    return id;
  }

  async update(id, label, name, unitId) {
    await this.dataQuery.run(
      UPDATE,
      {
        id,
        label,
        name,
        unitId,
      },
      'update-metric',
    );
  }
}

export default Metrics;
