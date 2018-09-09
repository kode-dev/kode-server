const _ = require('lodash');

// this is a placeholder user until we have auth working.
USER = {
    organizationId: 'test-org',
    userId: '-LLvvEXog8Jtbf6ZAYx3'
};

// GET /appointments?start=9320984938 (miliseconds from epoch)
app.get('/appointments', function(req, res, next) {
    let orgId = USER.organizationId;
    let start = req.params ? req.params.start : null;
    getAppointmentList(orgId, start).then((appointments) => 
        res.send(appointments)
    );
});
// POST /appointments
app.post('/appointments', function(req, res, next) {
    console.log(req.body)
    const {
        candidate,
        assessmentId,
        start,
        duration
    } = req.body;
    const orgId = USER.organizationId;
    const createdById = USER.userId;
    createAppointment(orgId, candidate, assessmentId, createdById, start, duration).then((appointment) => 
        res.send(appointment.key)
    );
});

// GET /assessments
app.get('/assessments', function(req, res, next) {
    let orgId = USER.organizationId;
    getAssessmentList(orgId).then((assessments) => 
        res.send(assessments)
    );
});

function createUser(organizationId, firstName, lastName, email) {
    return app.database.ref('users').push({
        organizationId: organizationId,
        firstName: firstName,
        lastName: lastName,
        email: email
    });
}

    // candidate: {
    //     firstName: 'Nguyen',
    //     lastName: 'Jin',
    //     email: 'abc@poop.com',
    //     organizationId: 123
    // },
function createCandidate(organizationId, firstName, lastName, email) {
    return app.database.ref(`candidates/${candidateId}`).push({
        organizationId: organizationId,
        firstName: firstName,
        lastName: lastName,
        email: email
    });
}

    // appointment: {
    //     id: '234',
    //     candidate: 'abc@poop.com',
    //     assessment: 'abcAssessment',
    //     createdBy: 'john@poop.com',
    //     start: 'August 24th 2018',
    //     duration: 90,
    //     repoInstanceUrl: 'https://github.com',
    //     chatUrl: 'https://github.com',
    //     organizationId: 123
    // },
function createAppointment(organizationId, candidate, assessmentId, createdById, start, duration) {
    const repoInstanceUrl = null; // TODO: Generate clone here and set repoInstanceUrl on callback
    return app.database.ref(`assessments/${assessmentId}`).once('value').then((assessment) => {
        const appointment = {
            assessment: {
                assessment_id: assessment.key,
                label: assessment.child('label').val()
            },
            candidate: candidate,
            createdBy: {
                user_id: createdById
            },
            status: "New"
        };
        if (start) {
            appointment.start = start;
        }
        if (duration) {
            appointment.duration = duration;
        }


        return app.database.ref(`appointments/${organizationId}`).push(
            
        );
    });
}

function getAppointmentList(organizationId, start) {
    let ref = app.database.ref(`appointments/${organizationId}`).orderByChild('start');
    if (start) {
        ref = ref.startAt(start);
    }
    return ref.once('value');
}


function getAssessmentList(organizationId) {
    let ref = app.database.ref('assessments');
    return ref.once('value');
}


