//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
//model:
let Response = require('../models/Response');
let CandidateSession = require('../models/CandidateSession')
let mongoose = require('mongoose')
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;
let uuidv1 = require('uuid').v1

chai.use(chaiHttp);


describe('Sessions', () => {

  //Before each test we empty the database
  beforeEach((done) => {
    Response.remove({}, (err) => {
      CandidateSession.remove({}, (err) => {
        done();
      })
    })
  })

  describe('/POST candidate_login', () => {
    it('should log in candidate and unlock response', (done) => {
      let resp = new Response({
        unlockPassword: 'poop',
        annotations: [{
          _id: uuidv1(),
          noteText: 'poop',
          range: {
            start: 0,
            end: 10
          }
        }]
      });
      resp.save((err, resp) => {
        chai.request(server)
          .post('/candidate_login/' + resp.id)
          .send({unlockPassword: 'poop'})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true)
            CandidateSession.findOne({response: mongoose.Types.ObjectId(resp.id)})
              .exec((err, session) => {
                assert(!err)
                assert(session.response, resp.id)
                done()
              })
          })
      })
    })
  })
})
