const { hasColumn } = require("./schema");

async function getSubjectSelectColumns(extraColumns = []) {
  const columns = ["id", "title", "slug", "description"];
  if (await hasColumn("subjects", "price_inr")) {
    columns.push("price_inr");
  }
  return [...columns, ...extraColumns];
}

function mapSubjectPrice(items) {
  return items.map((item) => ({
    ...item,
    price_inr: item.price_inr == null ? null : Number(item.price_inr),
  }));
}

module.exports = { getSubjectSelectColumns, mapSubjectPrice };
