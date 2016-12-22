const mongoose = require('mongoose');
const objectId = require('bson-objectid');
const expect = require('chai').expect;

const database = require('../utils/database');
const findOrErrorPlugin = require('../index');

describe('Find or error plugin', () => {
  let ExampleModel;

  function testFindResolve(model, method, getParams) {
    const newDoc = new ExampleModel();

    return newDoc
      .save()
      .then(doc => mongoose.models[model][method](getParams(doc)))
      .then(doc => {
        expect(doc._id.toString()).to.equal(newDoc._id.toString());
      });
  }

  function testFindReject(model, method, getParams, getErrorMessage, done) {
    const id = objectId().toHexString();

    mongoose.models[model][method](getParams(id))
      .then(() => done(new Error('Expected to be rejected')))
      .catch(err => {
        const expectedMessage = getErrorMessage(id);

        if(err.message !== expectedMessage) {
          done(new Error(`Expected error message ${expectedMessage} but got ${err.message}`));
        } else {
          done();
        }
      });
  }

  before(() => {
    const exampleSchema = new mongoose.Schema({});

    exampleSchema.plugin(findOrErrorPlugin);

    ExampleModel = mongoose.models.Example
      ? mongoose.models.Example
      : mongoose.model('Example', exampleSchema);
  });

  before(database.connect);

  it('findByIdOrError should reject when doc is not found', done => {
    return testFindReject('Example', 'findByIdOrError', id => id, id => `Couldn't find Example by id "${id}"`, done);
  });

  it('findByIdOrError should reject with custom error if provided', done => {
    const anotherExampleSchema = new mongoose.Schema({});

    anotherExampleSchema.plugin(findOrErrorPlugin, {
      getFindByIdError: (id, modelName) => new Error(`No ${modelName} by id "${id}" in my database. Sorry!`)
    });

    mongoose.model('AnotherExampleA', anotherExampleSchema);

    return testFindReject('AnotherExampleA', 'findByIdOrError', id => id, id => `No AnotherExampleA by id "${id}" in my database. Sorry!`, done);
  });

  it('findByIdOrError should resolve doc when doc is found', () => {
    return testFindResolve('Example', 'findByIdOrError', doc => doc._id);
  });

  it('findByOneOrError should reject when doc is not found', done => {
    return testFindReject('Example', 'findOneOrError', id => ({ _id: id }), () => `Couldn't find Example by query`, done);
  });

  it('findOneOrError should reject with custom error if provided', done => {
    const anotherExampleSchema = new mongoose.Schema({});

    anotherExampleSchema.plugin(findOrErrorPlugin, {
      getFindOneError: (id, modelName) => new Error(`No ${modelName} by query in my database. Sorry!`)
    });

    mongoose.model('AnotherExampleB', anotherExampleSchema);

    return testFindReject('AnotherExampleB', 'findOneOrError', doc => ({ _id: doc._id }), id => `No AnotherExampleB by query in my database. Sorry!`, done);
  });

  it('findByOneOrError should resolve doc when doc is found', () => {
    return testFindResolve('Example', 'findOneOrError', doc => ({ _id: doc._id }));
  });

  afterEach(database.clean);

  after(database.disconnect);
});
