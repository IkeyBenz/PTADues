const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const faculty = firebase.database().ref('FacultyMembers');
const OrderedGroups = firebase.database().ref('OrderedGroups');
const Groups = firebase.database().ref('Groups');

// Elementary, Nursary, Middle,


function doWork() {
    const newClass = Groups.child('ElemClasses').push({
        Class: '1A-am',
        Room: 'Rm 205',
        Teacher: '-LQctb01yVl2UETg-8ky',
        Assistants: ['-LQcxsEkay8LeguP-tRl']
    }).key;
    OrderedGroups.child('Elementary/0').set(newClass);
}
doWork();


