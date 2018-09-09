// learned from: https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
//model:
let Response = require('../models/Response');
let Assignment = require('../models/Assignment');
let CodeSnippet = require('../models/CodeSnippet')
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

describe('CandidateFlow', () => {

  //Before each test we empty the database
  beforeEach((done) => {
    Response.remove({}, (err) => {
       done();
    });
  });

    describe('/GET response', () => {
        it('it should GET the response', (done) => {
            let codeSnippet = new CodeSnippet({snippet: "poop"})
            codeSnippet.save((err, snippet) => {

                let ass = new Assignment({
                    codeSnippets: [snippet._id]
                });

                ass.save((err, ass) => {
                    let resp = new Response({unlockPassword: "poop", assignment: ass._id});
                    resp.save((err, resp) => {

                        chai.request(server)
                            .get('/response/' + resp.id)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('_id').eql(resp.id);
                                res.body.should.have.property('assignment');

                                let assignment = res.body.assignment;
                                assignment.codeSnippets.should.be.a('array');
                                expect(assignment.codeSnippets).to.have.lengthOf(1);
                                assignment.codeSnippets[0].should.be.a('object');
                                done();
                            });
                    });
                });
            });
        });
    });

  describe('/PUT response', () => {
    it('should update response longFormAnswer', (done) => {
      let resp = new Response({unlockPassword: 'poop'});
      let newLongFormAnswer = "PoopLongFormAnswer";
      resp.save((err, resp) => {
        chai.request(server)
          .put('/response_long_form_answer/' + resp.id)
          .send({longFormAnswer: newLongFormAnswer})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');

            // expecting updated Response object to be returned:
            res.body.should.have.property('_id').eql(resp.id);
            res.body.should.have.property('longFormAnswer').eql(newLongFormAnswer);
            done();
          })
      });
    });
  });

  describe('/POST response', () => {
    it('should start() the response.', (done) => {
      let resp = new Response({unlockPassword: 'poop'});
      resp.save((err, resp) => {
        chai.request(server)
          .post('/response/start/' + resp.id)
          .send()
          .end((err, res) => {
            assert(!err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            assert(typeof res.body.startTimestamp === 'number');
            done();
          })
      });
    });
  });

  describe('/POST response', () => {
    it('should submit() the response.', (done) => {
      let resp = new Response({
        unlockPassword: 'poop',
        isStarted: true,
        startTimestamp: Date.now()
      });
      let finalLongFormAnswer = "final candidate's answer";
      resp.save((err, resp) => {
        chai.request(server)
          .post('/response/submit/' + resp.id)
          .send({longFormAnswer: finalLongFormAnswer})
          .end((err, res) => {
            assert(!err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            assert(typeof res.body.submitTimestamp === 'number');
            done();
          })
      });
    });
  });

  describe('/POST response', () => {
    it('should NOT submit() the response --> because finalLongFormAnswer is null', (done) => {
      let resp = new Response({
        unlockPassword: 'poop',
        isStarted: true,
        startTimestamp: Date.now()
      });
      resp.save((err, resp) => {
        chai.request(server)
          .post('/response/submit/' + resp.id)
          .send({longFormAnswer: null})
          .end((err, res) => {
            assert(err);
            done();
          })
      });
    });
  });
});
