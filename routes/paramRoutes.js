const Assignment = require('../models/Assignment')
const Candidate = require('../models/Candidate')
const Owner = require('../models/Owner')
const Response = require('../models/Response')
const CodeSnippet = require('../models/CodeSnippet')
const Annotation = require('../models/Annotation')

module.exports = function(router) {
  // PARAM HANDLING:
  router.param('assignmentId', (req, res, next, id) => {
    Assignment.findById(id)
      .populate('owner')
      .populate('codeSnippets')
      .exec((err, doc) => {
        if (err) return next(err);
        if (!doc) {
          err = new Error("Document not found");
          err.status = 404;
          return next(err);
        }



        req.assignment = doc;
        return next();
      })
  });

  // TODO: populate the annotations for Response.
  router.param('responseId', (req, res, next, id) => {
    console.log("Router.param --> " + id)
    Response.findById(id)
      .populate('owner')
      .populate('candidate')
      .populate('assignment')
      .exec((err, resp) => {
        console.log(err)
        if (err) {
          return next(new Error("Submission not found"))
        }
        if (!resp) {
          err = new Error("Submission not found");
          err.status = 404;
          return next(err);
        }

        req.response = resp;
        return next();
      });
  });

  router.param('candidateId', (req, res, next, id) => {
    Candidate.findById(id, (err, doc) => {
      console.log(err);
      if (err) return next(err);
      if (!doc) {
        err = new Error("Document not found");
        err.status = 404;
        return next(err);
      }
      req.candidate = doc;
      return next();
    });
  });
}
