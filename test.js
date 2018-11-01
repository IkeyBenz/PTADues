const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const ref = firebase.database().ref('NewFaculty');

function restructureFaculty() {
    ref.once('value').then(snapshot => {
        const faculty = snapshot.val();
        let newFaculty = {}
        for (let key in faculty) {
            const member = faculty[key];
            newFaculty[key] = {
                aliases: [member.DisplayableCredentials],
                InternalCredentials: member.InternalCredentials
            }
        }
        ref.set(newFaculty);
    });
}
function undo() {
    firebase.database().ref('PreviousFaculty').once('value').then(snapshot => {
        ref.set(snapshot.val());
    });
}
undo();