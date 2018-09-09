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

const CandidateSessionSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
  token: { type: String, required: true },
  validUntil: { type: Date, required: true }
});

const CandidateSession = mongoose.model('CandidateSession', CandidateSessionSchema);
module.exports = CandidateSession;
