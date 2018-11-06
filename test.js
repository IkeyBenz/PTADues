const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const faculty = firebase.database().ref('NewFaculty');
const ref = firebase.database().ref('RestrcutredCategories');

// const elem = {
//     Class: String,
//     Room: String,
//     Teacher: UID,
//     Assistants: [UID]
// }

// const nursary = {
//     Class: String,
//     Teacher: UID
// }



// const FacultyMember = {
//     DisplayableCredentials: {
//         Name: String
//     },
//     InternalCredentials: {
//         Notes: String
//         Earned: Float
//     }
// }
