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

const AnnotationSchema = new Schema({
    _id: { type: String, default: uuid.v1 },
    codeSnippet: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeSnippet' },
    response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },

    line: { type: Number },
    noteText: {
        type: String,
        validate: [function(x) { return x.length <= Constants.MAX_ANNOTATION_NOTE_LENGTH}, 'Note length too long.']
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Annotation = mongoose.model('Annotation', AnnotationSchema);
module.exports = Annotation;
