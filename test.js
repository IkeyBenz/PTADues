const firebase = require('firebase');
firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));

const Groups = require('./models/groups');

function test() {
    Groups.getAllFaculty().then(console.log);
}
