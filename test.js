const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const facultyRef = firebase.database().ref('FacultyMembers');
const OrderedGroups = firebase.database().ref('OrderedGroups');
const groupsRef = firebase.database().ref('Groups');
const ref = firebase.database().ref('Orders');

const Faculty = require('./models/member');

function addDonorToTeacher(teacherId, childName) {
    return facultyRef.child(teacherId).once('value').then(snapshot => {
        const member = snapshot.val();
        let children = [childName];
        if (member.Donors) { children = children.concat(member.Donors) }
        return facultyRef.child(`${teacherId}/Donors`).set(children);
    });
}

addDonorToTeacher('-LR6blqLPDJb69C7NiiW', 'Ikey');