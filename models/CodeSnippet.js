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

const CodeSnippetSchema = new Schema({
    title: {
        type: String,
        validate: [
          function(x) {
            return x.length <= Constants.MAX_CODE_SNIPPET_TITLE_LENGTH}, 'SubmittedMessage too long.'
          ]
    },
    snippet: {
        type: String
    },
    type: { type: String },
    language: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const CodeSnippet = mongoose.model('CodeSnippet', CodeSnippetSchema);
module.exports = CodeSnippet;
