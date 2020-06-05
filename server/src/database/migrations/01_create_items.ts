import Knex from 'knex';

// database CTRL + Y
export async function up(knex: Knex) {
  return knex.schema.createTable('items', (table) => {
    table.increments('id').primary();
    table.string('image').notNullable();
    table.string('title').notNullable();
  });
}

// database CTRL + Z
export async function down(knex: Knex) {
  return knex.schema.dropTable('items');
}
