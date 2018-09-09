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

const OwnerSession = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  createdAt: { type: Date, default: Date.now },
  token: { type: String, required: true },
  validUntil: { type: Date, required: true }
});

const OwnerSession = mongoose.model('OwnerSession', OwnerSession);
module.exports = OwnerSession;
