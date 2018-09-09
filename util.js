// ------------------------- ANALYTICS INIT ------------------------------------

var Mixpanel = require('mixpanel');
// initialize mixpanel client configured to communicate over https
var mixpanel = Mixpanel.init('7f6e4d0104fb695040eaf35e11c057ac', {
    protocol: 'https'
});
const CandidateSession = require('./models/CandidateSession')
const Candidate = require('./models/Candidate')
const Owner = require('./models/Owner')

// -----------------------------------------------------------------------------

module.exports = {
    extractBody: function(body) {
        var parsedBody = {}
        try {
            parsedBody = JSON.parse(body);
        } catch (err) {
            parsedBody = body
        }
        return parsedBody
    },

    isUserAuthenticated: function(req, res, next) {
        // setting a DUMMY user for now.
        const DUMMY_OWNER_ID = "5a89f1c851608a19beed4a09"
        Owner.findById(DUMMY_OWNER_ID, (err, doc) => {
          if (err) {
            console.log('error isUserAuthenticated: ' + err)
            return next(err)
          }
          if (!doc) {
            console.log("there is no owner with this id")
            err.status = 404;
            return next(err);
          }
          req.user = doc
          return next()
        })
    },

    isCandidateAuthenticated: function(req, res, next) {
        // pass if we're in a testing environment:
        if (process.env.NODE_ENV === 'test') {
            // create a dummy candidate (TODO: please do this in a better way. Shouldn't be seeing test specific code out in the open like this.)
            const DUMMY_CANDIDATE_ID = require('./constants').DUMMY_CANDIDATE_ID;
            var candidate = new Candidate({_id: DUMMY_CANDIDATE_ID});
            candidate.firstName = "Joe";
            candidate.lastName = "Smith";
            candidate.email = "joesmith@abc.com";
            req.candidate = candidate;
            return next()
        }

        // you can do this however you want with whatever variables you set up
        if (req.session.candidateToken) {
            console.log('candidate authentication: we have a session token: ' + req.session.candidateToken)
            // pull the session from the db and see if it's valid still:
            CandidateSession.findOne({token: req.session.candidateToken})
                .populate({
                    path: 'response',
                    select: 'candidate',
                    populate: {
                        path: 'candidate',
                        model: 'Candidate'
                    }
                })
                .exec((err, session) => {
                    if (err || !session || session.validUntil < Date.now()) {
                        req.session.candidateToken = ''
                        console.log('Yeahhh.. this candidate isnt authorized:')
                        console.log(err)
                        console.log(session)
                        console.log('session.validUntil: ' + session.validUntil)
                        return next(this.generateNewError("User not authorized", 401))
                    }

                    // session is valid, so let the user pass:
                    console.log('session is valid. isCandidateAuthenticated() passed!')
                    req.candidate = session.response.candidate;
                    return next()
                })
        } else {
            console.log('Candidate is not authorized!')
            return next(generateNewError("User not authorized", 401))
        }
    },

    generateNewError: function(message, status) {
        let error = new Error(message)
        error.status = status
        return error
    },

    log: function(eventName, body) {
        console.log('logging(): ' + eventName)
        //mixpanel.track(eventName, body)
    }
}
