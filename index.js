const Promise = require('bluebird');

function withExistsOrError(error) {
  return promise => (
    promise
      .then((value) => {
        if (value === null) {
          return Promise.reject(error);
        }

        return value;
      })
  );
}

function findOrErrorPlugin(schema, options) {
  schema.statics.findByIdOrError = function (id) {
    const error = options && typeof options.getFindByIdError === 'function'
      ? options.getFindByIdError(id, this.modelName)
      : new Error(`Couldn't find ${this.modelName} by id "${id}"`);

    return withExistsOrError(error)(this.findById(id));
  };

  schema.statics.findOneOrError = function (query) {
    const error = options && typeof options.getFindOneError === 'function'
      ? options.getFindOneError(query, this.modelName)
      : new Error(`Couldn't find ${this.modelName} by query`);

    return withExistsOrError(error)(this.findOne(query));
  };
}

module.exports = findOrErrorPlugin;
