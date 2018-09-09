//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
//model:
let Response = require('../models/Response');
let Annotation = require('../models/Annotation');
let Assignment = require('../models/Assignment');
let CodeSnippet = require('../models/CodeSnippet');

let mongoose = require('mongoose');
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;
let uuidv1 = require('uuid').v1;

chai.use(chaiHttp);

const DUMMY_CANDIDATE_ID = require('../constants').DUMMY_CANDIDATE_ID;
const DUMMY_CODE_SNIPPET_ID = require('../constants').DUMMY_CODE_SNIPPET_ID;
const DUMMY_RESPONSE_ID = "5a89f1c851608a19beed4a18";
const DUMMY_ANNOTATION_ID = "5a89f1c851608a19beed4a91"

describe('AnnotationsTests', () => {

    beforeEach((done) => {
        Response.remove({}, (err) => {
            Assignment.remove({}, (err) => {
                Annotation.remove({}, (err) => {
                    CodeSnippet.remove({}, (err) => {
                        done()
                    })
                })
            })
        })
    });

    describe('/GET annotations_for_snippet', () => {
        it('get all annotations for a given snippet id, and responseId param...', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });

            let codeSnippet = new CodeSnippet({
                _id: DUMMY_CODE_SNIPPET_ID,
                snippet: 'poop'
            })

            // should be pulled
            let newAnnotation1 = new Annotation({
                _id: uuidv1(),
                noteText: 'poop1',
                range: {
                    start: 0,
                    end: 10
                },
                response: mongoose.Types.ObjectId(DUMMY_RESPONSE_ID),
                candidate: mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID),
                codeSnippet: mongoose.Types.ObjectId(DUMMY_CODE_SNIPPET_ID)
            });

            // should be pulled
            let newAnnotation2 = new Annotation({
                _id: uuidv1(),
                noteText: 'poop2',
                range: {
                    start: 0,
                    end: 10
                },
                response: mongoose.Types.ObjectId(DUMMY_RESPONSE_ID),
                candidate: mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID),
                codeSnippet: mongoose.Types.ObjectId(DUMMY_CODE_SNIPPET_ID)
            });

            // should NOT be pulled (incorrect response ref - Null)
            let newAnnotation3 = new Annotation({
                _id: uuidv1(),
                noteText: 'poop2',
                range: {
                    start: 0,
                    end: 10
                },
                candidate: mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID),
                codeSnippet: mongoose.Types.ObjectId(DUMMY_CODE_SNIPPET_ID)
            });

            // should NOT be pulled (incorrect candidate ref - Null)
            let newAnnotation4 = new Annotation({
                _id: uuidv1(),
                noteText: 'poop2',
                range: {
                    start: 0,
                    end: 10
                },
                codeSnippet: mongoose.Types.ObjectId(DUMMY_CODE_SNIPPET_ID)
            });

            // should NOT be pulled (incorrect codeSnippet ref)
            let newAnnotation5 = new Annotation({
                _id: uuidv1(),
                noteText: 'poop3',
                range: {
                    start: 0,
                    end: 10
                },
                response: mongoose.Types.ObjectId(DUMMY_RESPONSE_ID),
                candidate: mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID),
                codeSnippet: mongoose.Types.ObjectId(DUMMY_RESPONSE_ID)
            });

            resp.save((err, resp) => {
                codeSnippet.save((err, codeSnippet) => {
                  newAnnotation1.save((err, obj) => {
                    newAnnotation2.save((err, obj2) => {
                      newAnnotation3.save((err, obj3) => {
                        chai.request(server)
                          .get('/code_snippet_info_annotations/' + DUMMY_RESPONSE_ID + '/' + DUMMY_CODE_SNIPPET_ID)
                          .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            expect(res.body.annotations).to.have.lengthOf(2);
                            res.body.should.have.property('snippet').eql(codeSnippet.snippet)
                            done();
                          });
                      });
                    });
                  });
                })
            });
        });
    });



    describe('/POST annotation', () => {
        it('should add annotation to response', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            let newAnnotation = {
                _id: uuidv1(),
                noteText: 'poop',
                range: {
                    start: 0,
                    end: 10
                },
                codeSnippetId: DUMMY_CODE_SNIPPET_ID
            };
            resp.save((err, resp) => {
                chai.request(server)
                    .post('/annotation/' + resp.id)
                    .send({'annotation': newAnnotation})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        assert(res.body.response._id === resp._id.toString())
                        assert(res.body.codeSnippet === DUMMY_CODE_SNIPPET_ID)
                        res.body.should.have.property('noteText').eql(newAnnotation.noteText);
                        res.body.should.have.property('range').eql(newAnnotation.range);
                        done();
                    })
            });
        });
    });

    describe('/POST annotation', () => {
        it('Should fail adding annotation because Code snippet Id is empty', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            let newAnnotation = {
                _id: uuidv1(),
                noteText: 'poop',
                range: {
                    start: 0,
                    end: 10
                }
            };
            resp.save((err, resp) => {
                chai.request(server)
                    .post('/annotation/' + resp.id)
                    .send({'annotation': newAnnotation})
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.should.be.a('object');
                        res.body.should.have.property('error')
                        done();
                    })
            });
        });
    });

    describe('/POST annotation', () => {
        it('Should update annotation with new noteText', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            resp.save((err, resp) => {
                let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                annotation.noteText = 'poop';
                annotation.response = mongoose.Types.ObjectId(DUMMY_RESPONSE_ID);
                annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                annotation.range = {
                    start: 0,
                    end: 10
                };
                let newNoteText = 'poop2';
                annotation.save((err, savedAnnotation) => {
                    chai.request(server)
                        .put('/annotation/' + resp.id)
                        .send({
                            id: savedAnnotation.id,
                            noteText: newNoteText
                        })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            // expecting updated Response object to be returned:
                            res.body.should.have.property('_id').eql(DUMMY_ANNOTATION_ID);
                            res.body.should.have.property('noteText').eql(newNoteText);
                            done();
                        })
                });

            });
        });
    });


    describe('/POST annotation', () => {
        it('Should FAIL to update annotation with new noteText --> because incorrect Response Id. ', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            resp.save((err, resp) => {
                let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                annotation.noteText = 'poop';
                annotation.response = mongoose.Types.ObjectId(DUMMY_RESPONSE_ID);
                annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                annotation.range = {
                    start: 0,
                    end: 10
                };
                let newNoteText = 'poop2';
                annotation.save((err, savedAnnotation) => {
                    chai.request(server)
                        .put('/annotation/' + DUMMY_ANNOTATION_ID)
                        .send({
                            id: savedAnnotation.id,
                            noteText: newNoteText
                        })
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a('object');
                            // expecting updated Response object to be returned:
                            res.body.should.have.property('error');
                            done();
                        })
                });

            });
        });
    });

    describe('/POST annotation', () => {
        it('Should FAIL to update annotation with new noteText --> because annotation response ref is different than request responseId param. But the response exists.',
            (done) => {
                let resp = new Response({
                    _id: DUMMY_RESPONSE_ID,
                    unlockPassword: 'poop'
                });
                resp.save((err, resp) => {
                    let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                    annotation.noteText = 'poop';
                    annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                    annotation.range = {
                        start: 0,
                        end: 10
                    };
                    let newNoteText = 'poop2';
                    annotation.save((err, savedAnnotation) => {
                        chai.request(server)
                            .put('/annotation/' + DUMMY_RESPONSE_ID)
                            .send({
                                id: savedAnnotation.id,
                                noteText: newNoteText
                            })
                            .end((err, res) => {
                                res.should.have.status(500);
                                res.body.should.be.a('object');
                                // expecting updated Response object to be returned:
                                res.body.should.have.property('error');
                                done();
                            })
                    });

                });
        });
    });

    describe('/DELETE annotation', () => {
        it('should delete annotation', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            resp.save((err, resp) => {
                let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                annotation.response = mongoose.Types.ObjectId(DUMMY_RESPONSE_ID);
                annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                annotation.range = {
                    start: 0,
                    end: 10
                };
                let newNoteText = 'poop2';
                annotation.save((err, savedAnnotation) => {
                    chai.request(server)
                        .delete('/annotation/' + resp.id)
                        .send({
                            id: savedAnnotation.id,
                        })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            // expecting updated Response object to be returned:
                            res.body.should.have.property('success').eql(true);
                            done();
                        })
                });

            });
        });
    });

    describe('/DELETE annotation', () => {
        it('should FAIL TO delete annotation - Because annotation response ref is different than request responseId param.', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            resp.save((err, resp) => {
                let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                annotation.noteText = 'poop';
                annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                annotation.range = {
                    start: 0,
                    end: 10
                };
                annotation.save((err, savedAnnotation) => {
                    chai.request(server)
                        .delete('/annotation/' + resp.id)
                        .send({
                            id: savedAnnotation.id,
                        })
                        .end((err, res) => {
                            res.should.have.status(500);
                            res.body.should.be.a('object');
                            // expecting updated Response object to be returned:
                            res.body.should.have.property('error');
                            done();
                        })
                });

            });
        });
    });


    describe('/DELETE annotation', () => {
        it('should FAIL TO delete annotation - because incorrect response id in the Request itself...', (done) => {
            let resp = new Response({
                _id: DUMMY_RESPONSE_ID,
                unlockPassword: 'poop'
            });
            resp.save((err, resp) => {
                let annotation = new Annotation({_id: DUMMY_ANNOTATION_ID});
                annotation.noteText = 'poop';
                annotation.response = resp._id;
                annotation.candidate = mongoose.Types.ObjectId(DUMMY_CANDIDATE_ID);
                annotation.range = {
                    start: 0,
                    end: 10
                };
                annotation.save((err, savedAnnotation) => {
                    chai.request(server)
                        .delete('/annotation/' + DUMMY_ANNOTATION_ID) // note: using annotation_id instead of the correct, response_id.
                        .send({
                            id: savedAnnotation.id,
                        })
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a('object');
                            // expecting updated Response object to be returned:
                            res.body.should.have.property('error');
                            done();
                        })
                });

            });
        });
    });
});
