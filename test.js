const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const Groups = require('./models/groups');


function test() {
    Groups.getAllFaculty().then(values => {
        console.log(values.misc);
    });
}

test();