const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const dbName = process.env.DATABASE
const connectionUrl = process.env.MONGOCONNECTIONSTRING

let client = null;


function createMongoClient() {
  return new MongoClient(connectionUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
}


function getMongoClient() {
  if (!client) {
    client = createMongoClient()
  }
  return client;
}


async function getCollectionByName(collectionName) {
  client = getMongoClient();
  await client.connect();
  const db = client.db(dbName);
  return db.collection(collectionName);
}


async function insertSingleDocument(collectionName, document) {
  const collection = await getCollectionByName(collectionName);
  const result = await collection.insertOne(document);
  return result;
}


async function replaceDocument(collectionName, filter, replacement) {
  const collection = await getCollectionByName(collectionName);
  const result = await collection.replaceOne(filter, replacement);
  return result;
}


async function findDocuments(collectionName, query = {}) {
  const collection = await getCollectionByName(collectionName);
  const result = await collection.find(query).toArray();
  return result;
}


module.exports = {
  insertSingleDocument,
  replaceDocument,
  findDocuments,
};

