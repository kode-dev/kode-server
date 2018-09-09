const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Constants = require('./constants');

// // Schema types:
// String.
// Number.
// Date.
// Buffer.
// Boolean.
// Mixed.
// Objectid.
// Array.

const CandidateSchema = new Schema({
  firstName: { type: String, validate: [function(x) { return x.length <= Constants.MAX_FIRST_NAME_LENGTH}, 'First name too long.'] },
  lastName: { type: String, validate: [function(x) { return x.length <= Constants.MAX_LAST_NAME_LENGTH}, 'Last name too long.'] },
  email: { type: String, validate: [function(x) { return x.length <= Constants.MAX_EMAIL_LENGTH}, 'Email too long.'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Candidate = mongoose.model('Candidate', CandidateSchema);
module.exports = Candidate;
