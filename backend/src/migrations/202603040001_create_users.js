exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("users");
  if (!exists) {
    await knex.schema.createTable("users", (table) => {
      table.bigIncrements("id").primary();
      table.string("email", 255).notNullable().unique().index();
      table.string("password_hash", 255).notNullable();
      table.string("name", 255).notNullable();
      table.timestamps(true, true);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("users");
};
