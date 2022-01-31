require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function main() {
  const client = new Client();
  await client.connect();

  const res = await client.query(
    'SELECT column_name, table_name FROM INFORMATION_SCHEMA.COLUMNS ORDER BY table_name DESC;'
  );

  const csvWriter = createCsvWriter({
    path: 'columns.csv',
    header: [
      { id: 'table_name', title: 'table_name' },
      { id: 'column_name', title: 'column_name' },
    ],
  });

  await csvWriter.writeRecords(res.rows);

  const groups = res.rows.reduce((group, row) => {
    const { table_name: table, column_name: column } = row;

    if (table[0] !== '_') {
      if (!group[table]) {
        group[table] = [];
      }

      group[table].push(column);
    }

    return group;
  }, {});

  fs.writeFileSync('columns.json', JSON.stringify(groups, null, 2));

  await client.end();
}
main();
