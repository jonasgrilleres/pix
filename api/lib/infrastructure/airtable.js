const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');

function _airtableClient() {
  return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.base);
}

function getRecord(tableName, recordId) {
  logger.info({ tableName, recordId }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .find(recordId);
}

function findRecords(tableName, fields) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(fields ? { fields } : {})
    .all();
}

module.exports = {
  getRecord,
  findRecords,
};
