exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("sections");
  if (!exists) {
    await knex.schema.createTable("sections", (table) => {
      table.bigIncrements("id").primary();
      table
        .bigInteger("subject_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("subjects")
        .onDelete("CASCADE");
      table.string("title", 255).notNullable();
      table.integer("order_index").notNullable();
      table.timestamps(true, true);
      table.unique(["subject_id", "order_index"]);
      table.index(["subject_id", "order_index"]);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("sections");
};
