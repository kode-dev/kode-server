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

// TODO: set a unique validation criteria for the assignment title.
const AssignmentSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
    isDemo: { type: Boolean, default: false },
    title: {
        type: String,
        validate: [
            function(x) {
                return x.length <= Constants.MAX_ASSIGNMENT_INSTRUCTIONS_LENGTH}, 'Instructions too long.'
        ]
    },
    preStartMessage: {
        type: String,
        validate: [
          function(x) {
            return x.length <= Constants.MAX_ASSIGNMENT_INSTRUCTIONS_LENGTH}, 'IntroductionMessage too long.'
          ]
    },
    postSubmitMessage: {
        type: String,
        validate: [
          function(x) {
            return x.length <= Constants.MAX_ASSIGNMENT_INSTRUCTIONS_LENGTH}, 'SubmittedMessage too long.'
          ]
    },
    instructions: {
        type: String,
        validate: [
          function(x) {
            return x.length <= Constants.MAX_ASSIGNMENT_INSTRUCTIONS_LENGTH}, 'Instructions too long.'
          ]
    },
    codeSnippets: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'CodeSnippet' }
    ],
    timeLimit: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;
