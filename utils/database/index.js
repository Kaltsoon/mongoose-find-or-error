const mongoose = require('mongoose');
const Promise = require('bluebird');
const mongodb = require('mongodb');

Promise.promisifyAll(mongodb);

const mongoClient = Promise.promisifyAll(mongodb.MongoClient);

function connect() {
  return Promise.promisify(mongoose.connect, { context: mongoose })(process.env.MONGO_URI);
}

function disconnect() {
  return Promise.promisify(mongoose.disconnect, { context: mongoose })();
}

function clean() {
  return mongoClient.connectAsync(process.env.MONGO_URI)
    .then(db => (
      db.dropDatabaseAsync()
        .then(() => db.closeAsync())
    ));
}

module.exports = {
  connect,
  disconnect,
  clean,
};
