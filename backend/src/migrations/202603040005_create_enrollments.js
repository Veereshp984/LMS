exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("enrollments");
  if (!exists) {
    await knex.schema.createTable("enrollments", (table) => {
      table.bigIncrements("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .bigInteger("subject_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("subjects")
        .onDelete("CASCADE");
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.unique(["user_id", "subject_id"]);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("enrollments");
};
