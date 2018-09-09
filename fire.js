// Functionality:
// - create user
// - create Appointment
// - create candidate

    // user: {
    //     firstName: 'John',
    //     lastName: 'Appleseed',
    //     email: 'john@poop.com',
    //     organizationId: 123
    // },
    // candidate: {
    //     firstName: 'Nguyen',
    //     lastName: 'Jin',
    //     email: 'abc@poop.com',
    //     organizationId: 123
    // },
    // assessment: {
    //     id: 'abcAssessment',
    //     label: 'ABC Assessment',
    //     description: 'This is to assess you.',
    //     repoUrl: 'https://github.com'
    // }
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


// // GETTING appointments:
// firebase.database().ref('appointments/test-org').orderByChild('start').once('value').then((obj) => {
//   let out = []
//   obj.forEach((x) => {
//     out.push(x.val())
//   })
//   console.log(out)
// })


// // CREATING appointment:
// firebase.database().ref('appointments/test-org' + id).set({
//   organizationId: organizationId,
//   candidateId: firstName,
//   lastName: lastName,
//   email: email
// });

// firebase.database().ref('appointments/test-org').once('value').then((obj) => {
//   //console.log(obj.child('candidate').val())
//   //console.log(obj.toJSON())
//   console.log(obj.val())
// })


