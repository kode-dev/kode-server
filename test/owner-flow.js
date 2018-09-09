// learned from: https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
//model:
let Response = require('../models/Response');
let Assignment = require('../models/Assignment')
let Candidate = require('../models/Candidate')
let CodeSnippet = require('../models/CodeSnippet')

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

const DUMMY_OWNER_ID = "5a89f1c851608a19beed4a09"
const DUMMY_OWNER_ID_SECOND = "5a89f1c851608a19beed4a11"

describe('OwnerFlow', () => {

  //Before each test we empty the database
  beforeEach((done) => {
    Response.remove({}, (err) => {
      Assignment.remove({}, (err) => {

        done()
      })
    })
  });

  // describe('/GET /user/is_user_logged_in', () => {
  //   it('it should get the Dummy User.', (done) => {
  //     chai.request(server)
  //       .get('/user/is_user_logged_in/')
  //       .end((err, res) => {
  //           res.should.have.status(200);
  //         done();
  //       });
  //   });
  // });

  // describe('/GET /user/assignment_list', () => {
  //   it('it should GET the assignment list', (done) => {
  //     let ass = new Assignment({owner: DUMMY_OWNER_ID})
  //     let ass2 = new Assignment({owner: DUMMY_OWNER_ID_SECOND})
  //     ass.save((err, ass) => {
  //       console.log('error: ' + err)
  //       ass2.save((err, ass2) => {
  //         if (err) console.log(err)
  //         chai.request(server)
  //           .get('/user/assignment_list')
  //           .end((err, res) => {
  //               res.should.have.status(200);
  //               res.body.should.be.a('object')
  //               let assignments = res.body.assignments
  //               console.log('BODY: assignment_list')
  //               console.log(res.body)
  //               expect(assignments).to.have.length(1)
  //               assignments[0].should.have.property('owner').eql(DUMMY_OWNER_ID)
  //             done();
  //           });
  //       })
  //     })
  //   });
  // });

  // describe('/GET /user/response_list', () => {
  //   it('it should GET the response', (done) => {


  //     let candidate = new Candidate({firstName: 'Jon', lastName: 'Smith'})
  //     let assignment = new Assignment({
  //       title: 'Poop Assignment',
  //       instructions: 'abc',
  //       codeSnippets: [],
  //       timeLimit: 8000
  //     })

  //     candidate.save((err, candidate) => {
  //       assignment.save((err, assignment) => {

  //         let resp = new Response({
  //           unlockPassword: "poop", 
  //           isStarted: true, 
  //           owner: DUMMY_OWNER_ID,
  //           assignment: assignment._id,
  //           candidate: candidate._id
  //         });

  //         let resp2 = new Response({
  //           unlockPassword: "poop", 
  //           isStarted: false, 
  //           owner: DUMMY_OWNER_ID_SECOND,
  //           assignment: assignment._id,
  //           candidate: candidate._id
  //         })

  //         resp.save((err, resp) => {
  //           resp2.save((err, resp) => {
  //             chai.request(server)
  //               .get('/user/response_list')
  //               .end((err, res) => {
  //                   res.should.have.status(200);
  //                   res.body.should.be.a('object')
  //                   let responses = res.body.responses
  //                   expect(responses).to.have.length(1)
  //                   responses[0].should.have.property('isStarted').eql(true)
  //                   responses[0].assignment.should.be.a('object')
  //                   responses[0].candidate.should.be.a('object')
  //                 done();
  //               });
  //           })
  //         })
  //       })
  //     })
  //   });
  // });
  // //
  // describe('/GET /user/response', () => {
  //   it('it should GET the response', (done) => {
  //     let resp = new Response({unlockPassword: "poop", owner: DUMMY_OWNER_ID});
  //     resp.save((err, resp) => {
  //       console.log('error: ' + err)
  //       chai.request(server)
  //         .get('/user/response/' + resp.id)
  //         .end((err, res) => {
  //             res.should.have.status(200);
  //             res.body.should.be.a('object');
  //             res.body.should.have.property('_id').eql(resp.id);
  //           done();
  //         });
  //     })
  //   });
  // });

  // describe('/GET /user/response', () => {
  //   it('it should NOT GET the response since it doest belong to this user.', (done) => {
  //     let resp = new Response({unlockPassword: "poop", owner: DUMMY_OWNER_ID_SECOND});
  //     resp.save((err, resp) => {
  //       console.log('error: ' + err)
  //       chai.request(server)
  //         .get('/user/response/' + resp.id)
  //         .end((err, res) => {
  //             res.should.have.status(404);
  //             res.body.should.be.a('object');
  //             res.body.should.have.property('error')
  //           done();
  //         });
  //     })
  //   });
  // });

  // describe('/GET /user/assignment', () => {
  //   it('it should GET the assignment', (done) => {
  //     let ass = new Assignment({
  //       owner: DUMMY_OWNER_ID,
  //       codeSnippets: []
  //     });
  //     ass.save((err, ass) => {
  //       console.log('error: ' + err)
  //       chai.request(server)
  //         .get('/user/assignment/' + ass.id)
  //         .end((err, res) => {
  //             res.should.have.status(200);
  //             res.body.should.be.a('object');
  //             res.body.should.have.property('_id').eql(ass.id);
  //             res.body.should.have.property('codeSnippets')
  //             expect(res.body.codeSnippets).to.have.lengthOf(0);
  //           done();
  //         });
  //     })
  //   });
  // });

  // describe('/GET /user/assignment', () => {
  //   it('it should NOT GET the assignment, because it doesnt belong to this user.', (done) => {
  //     let ass = new Assignment({
  //       owner: DUMMY_OWNER_ID_SECOND,
  //       codeSnippets: []
  //     });
  //     ass.save((err, ass) => {
  //       console.log('error: ' + err)
  //       chai.request(server)
  //         .get('/user/assignment/' + ass.id)
  //         .end((err, res) => {
  //             res.should.have.status(404);
  //             res.body.should.be.a('object');
  //             res.body.should.have.property('error')
  //           done();
  //         });
  //     })
  //   });
  // });

  // POST routes:
  // describe('/POST assignment', () => {
  //     it('should create code snippets and assignments', (done) => {
  //         let newAssignment = {
  //           title: 'PoopTitle',
  //           preStartMessage: 'PoopPreStart',
  //           postSubmitMessage: 'PoopPostSubmit',
  //           instructions: 'This is how you poop',
  //           timeLimit: 30,
  //           codeSnippets: [
  //           {
  //             title: 'snippet1.py',
  //             language: 'Python',
  //             snippet: 'Code is code dude'
  //           },
  //           {
  //             title: 'snippet2.py',
  //             language: 'Python',
  //             snippet: 'Code is code dude2'
  //           }]
  //         };
  //         chai.request(server)
  //             .post('/user/assignment/')
  //             .send({'assignment': newAssignment})
  //             .end((err, res) => {
  //                 res.should.have.status(200);
  //                 res.body.should.be.a('object');
  //                 res.body.should.have.property('assignmentId')
  //                 done();
  //             })
  //     });
  // });
  describe('/POST demo assignment', () => {
      it('should create a demo assignment', (done) => {
          let newAssignment = {
            title: 'PoopTitle',
            preStartMessage: 'PoopPreStart',
            postSubmitMessage: 'PoopPostSubmit',
            instructions: 'This is how you poop',
            timeLimit: 30,
            codeSnippets: [
            {
              title: 'snippet1.py',
              language: 'Python',
              snippet: 'Code is code dude'
            },
            {
              title: 'snippet2.py',
              language: 'Python',
              snippet: 'Code is code dude2'
            }]
          };
          console.log(require('../constants').DUMMY_CANDI)
          chai.request(server)
              .post('/user/demo_assignment/')
              .send({'assignment': newAssignment})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('submissionId')
                  done();
              })
      });
  });

});
