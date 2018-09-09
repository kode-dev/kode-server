const firebase = require('firebase')

var config = {
  apiKey: "AIzaSyDBrzpaDsKEmNzqMX65WUqowtRaWVAITqI",
  authDomain: "kode-dev-12dc0.firebaseapp.com",
  databaseURL: "https://kode-dev-12dc0.firebaseio.com",
  projectId: "kode-dev-12dc0",
  storageBucket: "kode-dev-12dc0.appspot.com",
  messagingSenderId: "372900376255"
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

function createUser(organization, firstName, lastName, email) {
  let userId = firebase.database().ref().child('users').push().key;
  firebase.database().ref('users/' + userId).set({
    firstName: firstName,
    lastName: lastName,
    email: email
  });
}

function createOrganization(name) {
  let orgId = firebase.database().ref().child('organizations').push().key;
}

function create

console.log("wrote.")
