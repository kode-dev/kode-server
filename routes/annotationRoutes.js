const Annotation = require('../models/Annotation')
const CodeSnippet = require('../models/CodeSnippet')
const mongoose = require('mongoose')
const extractBody =  require('../util').extractBody
const isCandidateAuthenticated = require('../util').isCandidateAuthenticated
const isUserAuthenticated = require('../util').isUserAuthenticated

const generateNewError = require('../util').generateNewError

module.exports = function(router) {

    router.get('/user/code_snippet_info_annotations/:responseId/:snippetId', isUserAuthenticated, (req, res, next) => {
        let snippetId = req.params.snippetId;
        // check input parameters:
        if (!snippetId) {
            console.log('snippetId is empty');
            return next(generateNewError("Empty CodeSnippet id", 500))
        }

        // then it's OK to serve this user:
        CodeSnippet.findOne({_id: snippetId})
        .exec((err, codeSnippet) => {
            if (err) return next(err);
            Annotation.find({
              response: req.response._id,
              codeSnippet: mongoose.Types.ObjectId(snippetId),
            }).exec((err, annotations) => {
              if (err) return next(err);
              res.status(200);
              res.json({
                snippet: codeSnippet.snippet,
                title: codeSnippet.title,
                annotations: annotations
              })
            })
        })
    });

    router.get('/code_snippet_info_annotations/:responseId/:snippetId', isCandidateAuthenticated, (req, res, next) => {
        let snippetId = req.params.snippetId;
        // check input parameters:
        if (!snippetId) {
            console.log('snippetId is empty');
            return next(generateNewError("Empty CodeSnippet id", 500))
        }

        // then it's OK to serve this user:
        CodeSnippet.findOne({_id: snippetId})
        .exec((err, codeSnippet) => {
            if (err) return next(err);
            Annotation.find({
              response: req.response._id,
              codeSnippet: mongoose.Types.ObjectId(snippetId),
              candidate: req.candidate._id
            }).exec((err, annotations) => {
              if (err) return next(err);
              res.status(200);
              res.json({
                snippet: codeSnippet.snippet,
                title: codeSnippet.title,
                annotations: annotations
              })
            })
        })
    });

    // the annotation id is generated on the front-end, and sent to server to
    // update the DB (so there's no lag for user when annotating).
    // TODO: Make sure the request comes from a candidate THAT HAS THE AUTHORIZATION TO UPDATE THIS RESPONSE OBJECT!
    // Otherwise, they can update other response objects with their annotations. Not good.
    router.post('/annotation/:responseId', isCandidateAuthenticated, (req, res, next) => {
        let annotation = extractBody(req.body).annotation;

        if (!annotation.codeSnippetId) {
            return next(generateNewError("Empty CodeSnippet id", 500))
        }

        var newAnnotation = new Annotation();
        newAnnotation._id = annotation._id;
        newAnnotation.response = req.response;
        newAnnotation.candidate = req.candidate;
        newAnnotation.codeSnippet = mongoose.Types.ObjectId(annotation.codeSnippetId);
        newAnnotation.line = annotation.line;
        newAnnotation.noteText = annotation.noteText;
        newAnnotation.save((err, savedAnnotation) => {
            if (err) return next(err);
            res.status(200);
            res.json(savedAnnotation);
        })
    });

    router.put('/annotation/:responseId', isCandidateAuthenticated, (req, res, next) => {
        let body = extractBody(req.body)

        Annotation.findOneAndUpdate(
            {
                _id: body.id,
                response: req.response._id,
                candidate: req.candidate._id
            },
            {noteText: body.noteText},
            {new: true}
        ).exec((err, annotation) => {
            if (err) return next(err);
            if (!annotation) return next(generateNewError("Could not find annotation to update.", 500));
            console.log("updated annotation noteText: " + annotation.noteText)
            res.status(200);
            res.json(annotation);
        })
    });

    router.delete('/annotation/:responseId', isCandidateAuthenticated, (req, res, next) => {
        const id = extractBody(req.body).id;

        Annotation.findOne({
            _id: id,
            response: req.response._id,
            candidate: req.candidate._id
        })
        .exec((err, annotation) => {
            if (err) return next(err);
            // making sure this user can actually remove this annotation:
            if (annotation) {
                annotation.remove((err) => {
                    if (err) {
                        console.log("error removing annotation: " + err)
                        return next(err)
                    }
                    res.status(200);
                    res.json({success: true});
                })
            } else {
                // some combination of: (annotation id, response id, candidate id) are incorrect:
                next(generateNewError("Incorrect parameters", 500));
            }
        })
    });
}