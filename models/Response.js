const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Constants = require('./constants');
const uuid = require('uuid');

// // Schema types:
// String.
// Number.
// Date.
// Buffer.
// Boolean.
// Mixed.
// Objectid.
// Array.

// https://stackoverflow.com/questions/26156687/mongoose-find-update-subdocument
// --> GREAT answer about how to update subcoduments. And how to think about which way to use them:
// i.e. as subdocuments of objects, or a simple json subarray...
const ResponseSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  isDemo: { type: Boolean, default: false },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },

  unlockPassword: {
    type: String,
    required: true,
  },

  isStarted: { type: Boolean, default: false },
  isSubmitted: { type: Boolean, default: false },
  startTimestamp: { type: Number, default: -1 },
  submitTimestamp: { type: Number, default: -1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResponseSchema.method('authenticate', function(password, callback) {
  if (password === this.unlockPassword) {
    return callback(null, this)
  } else {
    return callback("Incorrect unlock password!")
  }
})

ResponseSchema.method('start', function(callback) {
  if (!this.isStarted) {
    this.isStarted = true;
    this.startTimestamp = Date.now();
    this.parent().save(callback);
  }
});

ResponseSchema.method('submit', function(callback) {
  if (!this.isSubmitted) {
    this.isSubmitted = true;
    this.submitTimestamp = Date.now();
    this.parent().save(callback);
  }
});

const Response = mongoose.model('Response', ResponseSchema);
module.exports = Response;
