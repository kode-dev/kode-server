// models:
const Assignment = require('../models/Assignment')
const Candidate = require('../models/Candidate')
let CodeSnippet = require('../models/CodeSnippet')
const Owner = require('../models/Owner')
const Response = require('../models/Response')
const extractBody =  require('../util').extractBody
const generateNewError = require('../util').generateNewError
const isUserAuthenticated = require('../util').isUserAuthenticated

const log = require('../util').log

module.exports = function(router) {
  // GET /logout
  router.get('/user_logout', function(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.json(true);
        }
      });
    }
  });

  //POST route for loggin in candidate:
  router.post('/user_login/', function (req, res, next) {
  })

  router.post('/user_signup/', function (req, res, next) {
  })

  router.get('/user/is_user_logged_in', function(req, res, next) {
    if (req.user) {
      return res.json(true)
    }
    return res.json(false)
  })

  router.get('/current_user', isUserAuthenticated, function(req, res, next) {
    console.log('/current_user')
    if (req.user) {
      console.log('returning the current user: ' + req.user.email);
      return res.json(req.user)
    }
    return res.json(null)
  })

  // ------------------------------ GET ------------------------------------------
  router.get('/user/response/:responseId', isUserAuthenticated, (req, res, next) => {
    // need to check if the response belongs to an assignment with the owner as the logged in user:
    if (
      (req.response) &&
      (req.response.owner !== null) &&
      (req.response.owner._id.equals(req.user._id))
    ) {
      res.status(200);
      res.json(req.response)
    } else {
      err = new Error("Response not found");
      err.status = 404;
      return next(err);
    }
  });

  router.get('/user/assignment/:assignmentId', isUserAuthenticated, (req, res, next) => {
    if (
      (req.assignment) &&
      (req.assignment.owner !== null) &&
      (req.assignment.owner._id.equals(req.user._id))
    ) {
      res.status(200);
      res.json(req.assignment)
    } else {
      err = new Error("Assignment not found");
      err.status = 404;
      return next(err);
    }
  });

  router.get('/user/response_list', isUserAuthenticated, (req, res, next) => {
    Response.find({owner: req.user._id})
      .populate('assignment', '_id title timeLimit')
      .populate('candidate', 'firstName lastName')
      .sort({createdAt: -1})
      .exec((err, responses) => {
      if (err) {
        err = new Error("Could not get list of candidate submissions.");
        err.status = 404;
        return next(err);
      }
      res.status(200);
      console.log('returning responses: ' + responses.length)
      res.json({responses: responses});
    });
  });

  router.get('/user/response_list_for_assignment', isUserAuthenticated, (req, res, next) => {
    console.log("response list for assignmnet()")
    let assignmentId = req.query.assignmentId
    if (!assignmentId) return next(generateNewError("Assignment id provided is empty", 403))

    Response.find({
      owner: req.user._id,
      assignment: assignmentId
    })
      .populate('assignment', '_id title timeLimit')
      .populate('candidate', 'firstName lastName')
      .sort({createdAt: -1})
      .exec((err, responses) => {
        if (err) return next(generateNewError("Could not get list of candidate submissions.", 404));
        // success:
        res.status(200);
        console.log('returning responses: ' + responses.length)
        res.json({responses: responses});
      });
  });

  router.get('/user/assignment_list', isUserAuthenticated, (req, res, next) => {
    Assignment
      .find({owner: req.user._id})
      .sort({createdAt: -1})
      .exec((err, assignments) => {
        if (err) {
          console.log('fetch assignments error:')
          console.log(err)
          err = new Error("Could not get list of assignments for you.");
          err.status = 404;
          return next(err);
        }
        res.status(200);
        res.json({assignments: assignments});
      });
  });

  // ------------------------------ POST -----------------------------------------

  router.post('/user/demo_assignment', isUserAuthenticated, (req, res, next) => {
    // first create the demo assignment given request data.
    // then use / create the demo candidate
    // create the demo response w/ above 2 references, as well as this owner object.
    // return the response.id
    let ass = extractBody(req.body).assignment;
    let newAssignment = new Assignment()
    newAssignment.title = ass.title
    newAssignment.preStartMessage = ass.preStartMessage
    newAssignment.postSubmitMessage = ass.postSubmitMessage
    newAssignment.instructions = ass.instructions
    newAssignment.timeLimit = ass.timeLimit
    newAssignment.isDemo = true

    CodeSnippet.insertMany(ass.codeSnippets, (err, snippets) => {
      if (err) {
        return next(generateNewError("Could not save code snippets", 500))
      }

      // now that code snippets have been saved:
      newAssignment.codeSnippets = snippets;

      // setting owner as current authenticated user:
      newAssignment.owner = req.user

      // now save the assignment:
      newAssignment.save((err, newAssignment) => {
        if (err) return next(generateNewError("Error creating demo assignment", 500))
        let demoCandidateId = require('../constants').DEMO_CANDIDATE_ID
        Candidate.findOne({
          _id: demoCandidateId,
        }).exec((err, demoCandidate) => {
          if (err || !demoCandidate) {
            // time to create a new one!
            let demoCandidate = new Candidate({
              _id: demoCandidateId,
              firstName: 'John',
              lastName: 'Appleseed',
              isDemo: true
            })
            demoCandidate.save((err, candidate) => {
              if (err) return next(generateNewError("Error saving Demo Candidate", 500))
              console.log('demo candidate created: ' + candidate.id + 'vs. ' + demoCandidateId)
            })
          } 

          // create the demo response:
          let demoResponse = new Response({
            assignment: newAssignment.id,
            candidate: demoCandidateId,
            owner: req.user.id,
            isDemo: true,
            unlockPassword: 'test'
          })

          demoResponse.save((err, demoResponse) => {
            if (err) return next(generateNewError(""))
            res.status(200)
            console.log('DEMO ASSIGNMENT PROCESSED: ' + demoResponse.id)
            res.json({submissionId: demoResponse.id})
          })
        })
      })
    })
  })

  router.post('/user/assignment', isUserAuthenticated, (req, res, next) => {
    let ass = extractBody(req.body).assignment;
    let newAssignment = new Assignment()
    newAssignment.title = ass.title
    newAssignment.preStartMessage = ass.preStartMessage
    newAssignment.postSubmitMessage = ass.postSubmitMessage
    newAssignment.instructions = ass.instructions
    newAssignment.timeLimit = ass.timeLimit

    // setting owner as current authenticated user:
    newAssignment.owner = req.user

    CodeSnippet.insertMany(ass.codeSnippets, (err, snippets) => {
      if (err) {
        return next(generateNewError("Could not save code snippets", 500))
      }

      // now that code snippets have been saved:
      newAssignment.codeSnippets = snippets;
      newAssignment.save((err, newAssignment) => {
        if (err) {
          return next(generateNewError("Could not save assignment - after saving code snippets", 500))
        }

        res.status(200)
        res.json({assignmentId: newAssignment._id})
      })
    })
  })

  router.post('/user/assign_to_candidate/:assignmentId', isUserAuthenticated, (req, res, next) => {
    // 1. check if the assignment is valid - and belongs to this user.
    // 2. create a candidate with the firstName, lastName
    // 3. create a Response object: that connects the candidate and assignment, and also sets the unlockPassword.
    // 4. return the values required by the front-end, to display when assigning to candidate is successful (in the modal).

    // when this line is hit: we know that the assignmentId points to an actual assignment (otherwise, would have errored out in the paramRoutes itself).
    if (
      (req.assignment) &&
      (req.assignment.owner !== null) &&
      (req.assignment.owner._id.equals(req.user._id))
    ) {
      let body = extractBody(req.body)
      if (body.firstName) {
        let newCandidate = Candidate({
          firstName: body.firstName,
          lastName: body.lastName,
        })
        newCandidate.save((err, savedCandidate) => {
          if (err) return next(generateNewError("Could create a new Candidate", 500))
          // now create the response:
          let newResponse = Response({
            unlockPassword: body.unlockPassword,
            owner: req.user,
            assignment: req.assignment,
            candidate: savedCandidate
          })
          newResponse.save((err, savedResponse) => {
            if (err) return next(generateNewError("Could not save new Response", 500))
            // return the correct values:
            res.status(200)
            res.json({
              responseId: savedResponse._id,
              unlockPassword: savedResponse.unlockPassword,
              candidate: {
                firstName: savedCandidate.firstName,
                lastName: savedCandidate.lastName
              }
            })
          })
        })
      }
    }
  })
}
































