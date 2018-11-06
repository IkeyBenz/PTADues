const firebase = require('firebase');
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
}
const faculty = firebase.database().ref('FacultyMembers');
const OrderedGroups = firebase.database().ref('OrderedGroups');
const Groups = firebase.database().ref('Groups');

// Elementary, Nursary, Middle,


function doWork() {
    const newClass = Groups.child('Elementary').push({
        Class: '1A-am',
        Room: 'Rm 205',
        Teacher: '-LQctb01yVl2UETg-8ky',
        Assistants: ['-LQcxsEkay8LeguP-tRl']
    }).key;
    OrderedGroups.child('Elementary/0').set(newClass);
}
function doMoreWork() {
    const newClass = Groups.child('Nursary').push({
        Class: 'PPG1',
        Teacher: '-LQcyIMgOpYUlVghKOBW'
    }).key;
    OrderedGroups.child('Nursary/0').set(newClass);
}
function doEvenMoreWork() {
    const newClass = Groups.child('MiddleSchool').push({
        Grade: '',
        Teacher: '-LQcy6K8JMAwFLssdiZ6'
    }).key;
    OrderedGroups.child('MiddleShool/0').set(newClass);
}


