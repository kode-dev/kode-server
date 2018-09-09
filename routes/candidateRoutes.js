var uniqid = require('uniqid');
const CandidateSession = require('../models/CandidateSession')
const extractBody =  require('../util').extractBody
const generateNewError = require('../util').generateNewError
const isCandidateAuthenticated = require('../util').isCandidateAuthenticated

module.exports = function(router) {
  // ------------------- AUTH ----------------------------------------------------

  // GET /logout
  router.get('/candidate_logout', function(req, res, next) {
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
  router.post('/candidate_login/:responseId', function (req, res, next) {
    let unlockPassword = extractBody(req.body).unlockPassword
    console.log('unlockPassword: ' + unlockPassword)
    if (unlockPassword) {
      req.response.authenticate(unlockPassword, function(err, resp) {
        if (err) {
          console.log('error authenticating: ' + err)
          return next(generateNewError('Incorrect unlock password.', 401))
        }
        // create and set the session:
        var session = new CandidateSession()
        session.token = uniqid()
        session.response = req.response

        // valid until a day from right now:
        let oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        session.validUntil = oneDayFromNow
        session.save((err, session) => {
          if (err || !session) {
            console.log('could not save session for candidate :(')
            return next(generateNewError('Could not save session for this candidate', 401));
          }

          // set the req.session with this token to auth candidate from now on:
          console.log('Holy shit candidate_login passed everything: here is the sesh token: ' + session.token)
          req.session.candidateToken = session.token

          res.send({success: true})
        })
      });
    } else {
      return next(generateNewError('Assignment unlock password empty', 401))
    }
  });

  router.get('/is_candidate_logged_in', function(req, res, next) {
    res.status(200)
    if (req.session.candidateToken) {
      CandidateSession.findOne({token: req.session.candidateToken})
        .exec((err, session) => {
          if (err || !session || session.validUntil < Date.now()) {
            req.session.candidateToken = ''
            return res.json(false)
          }
          return res.json(true)
        })
    } else {
      return res.json(false)
    }
  });

    //----------------------------- GET ------------------------------------------
    router.get('/response/:responseId', isCandidateAuthenticated, (req, res, next) => {
        res.status(200);
        // populate the assignment:
        res.json(req.response);
    });

    router.get('/assignment/:assignmentId', isCandidateAuthenticated, (req, res, next) => {
        res.status(200);
        res.json(req.assignment);
    });

    router.get('/candidate/:candidateId', isCandidateAuthenticated, (req, res, next) => {
        res.status(200);
        res.json(req.candidate);
    });

    router.get('/candidate/:codeSnippetId', isCandidateAuthenticated, (req, res, next) => {
        const codeSnippetId = req.params.codeSnippetId
        if (!codeSnippetId) return next(generateNewError("invalid snippet id", 500))
        CodeSnippet.findOne({_id: codeSnippetId})
            .exec((err, snippet) => {
                if (err) return next(err)
                res.status(200)
                res.json(snippet)
            })
    });

  // -------------------------------------------------------------------------------------------------------------------

  // START & SUBMIT:
  router.post('/response/start/:responseId', isCandidateAuthenticated, (req, res, next) => {
    if (!req.response.isStarted) {
      req.response.isStarted = true;
      req.response.startTimestamp = Date.now();
      req.response.save((err, resp) => {
        if (err) return next(generateNewError('Failed to start submission.', 401));
        res.status(200);
        console.log('success starting()')
        res.json({startTimestamp: resp.startTimestamp});
      });
    } else {
      return next(generateNewError('Submission already started.', 401)); // when can this even occur (from the front-end). --> on a stale page.
    }
  });

  router.post('/response/submit/:responseId', isCandidateAuthenticated, (req, res, next) => {
    if (!req.response.isSubmitted && req.response.isStarted) {
      req.response.isSubmitted = true;
      req.response.submitTimestamp = Date.now();
      req.response.save((err, resp) => {
        if (err) return next(err);
        res.status(200);
        res.json({submitTimestamp: resp.submitTimestamp});
      });
    } else {
      return next(new Error("Could not successfully submit the assignment.")); // when can this even occur (from the front-end).
    }
  });

  router.get('/', (req, res, next) => {
    res.send({'hi': 'hi'});
  });
}
