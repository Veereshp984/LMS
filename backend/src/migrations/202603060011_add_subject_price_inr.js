exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn("subjects", "price_inr");
  if (!hasColumn) {
    await knex.schema.alterTable("subjects", (table) => {
      table.integer("price_inr").unsigned().notNullable().defaultTo(1499);
    });
  }

  await knex("subjects")
    .where({ is_published: 1 })
    .whereNull("price_inr")
    .update({ price_inr: 1499 });

  const priceBySlug = {
    "playlist-course-1-plbti3-mardoniijxb6xftpnhm0wtwz0x6": 1799,
    "playlist-course-2-plbti3-mardokxrLxdmt1nomtcs-84ibhh": 2499,
    "playlist-course-3-plu0w-9lii9agwh1xjrt242xiphhpt2llg": 1499,
    "playlist-course-4-plu0w-9lii9ahr1blwxxgsll4y9iqbnlpr": 1599,
    "playlist-course-5-plu0w-9lii9ahwfDuexcppfhaK829wto2o": 1299,
    "playlist-course-6-plu0w-9lii9ags67uits0unjyryixhds6q": 1699,
  };

  for (const [slug, price] of Object.entries(priceBySlug)) {
    // Keep updates idempotent if migration runs in different environments.
    // eslint-disable-next-line no-await-in-loop
    await knex("subjects").where({ slug }).update({ price_inr: price });
  }
};

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn("subjects", "price_inr");
  if (hasColumn) {
    await knex.schema.alterTable("subjects", (table) => {
      table.dropColumn("price_inr");
    });
  }
};
