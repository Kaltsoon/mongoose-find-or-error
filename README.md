# mongoose-find-or-error

[![Build Status](https://travis-ci.org/Kaltsoon/mongoose-find-or-error.svg?branch=master)](https://travis-ci.org/Kaltsoon/mongoose-find-or-error)

Simple Mongoose plugin for rejecting `findOne` and `findById` promises which resolve null.

# Installation

```
npm install mongoose-find-or-error
```

# Why create this plugin?

I find myself many times wanting to end a promise chain if a document is not found in the database. Without this plugin or similar solution I would end up doing something similar to this:

```javascript
User.findById(userId)
  .then(user => {
    if(!user) {
      return Promise.reject('User was not found');
    }

    return doSomethingWithUser(user)
  })
  .then(someData => {
    // ...
  });
  .catch(err => {
    // ...
  });
```

Why not reduce the boilerplate by doing something like this:

```javascript
User.findByIdOrError(userId)
  .then(user => doSomethingWithUser(user))
  .then(someData => {
    // ...
  });
  .catch(err => {
    // ...
  });
```

# How to use

Hook the plugin to a schema:

```javascript
// example.js

const mongoose = require('mongoose');
const findOrErrorPlugin = require('mongoose-find-or-error');

const schema = new mongoose.Schema({
  name: String
});

schema.plugin(findOrErrorPlugin);

mongoose.model('Example', schema);
```

Execute a query:

```javascript
const Example = require('./example');

// use with findById

Example.findByIdOrError('idNotInDatabase')
  .then(() => {
    console.log('Only executed when document is found');
  })
  .catch(err => {
    console.log(err);
  });

 // or use with findOne

 Example.findOneOrError({ name: 'plugin example' })
   .then(() => {
     console.log('Only executed when document is found');
   })
   .catch(err => {
     console.log(err);
   });
```

You can override the default errors by defining plugin options:

```javascript
schema.plugin(findOrErrorPlugin, {
  getFindByIdError: (id, modelName) => new MyCustomError(`Couldn't find ${modelName} by id ${id}`),
  getFindOneError: (query, modelName) => new MyCustomError(`Couldn't find ${modelName} by query`)
});
```

# Running tests

```
npm test
```
