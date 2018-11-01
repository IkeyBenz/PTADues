const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}

function makeElementaryTeacher() {
    const key = firebase.database().ref('NewFaculty').push({
        DisplayableCredentials: {
            Name: 'Mrs. Sarah Kahn',
            Class: '1A-am',
            Room: 'Rm 205',
            Assistants: ['-LQDFK-FwrtN-n691Gpx']
        },
        InternalCredentials: { Type: 'Elementary' }
    }).key;
    console.log(key);
}
makeElementaryTeacher();