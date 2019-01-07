const firebase = require('firebase');
require('dotenv').config();
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
}
const facultyRef = firebase.database().ref('FacultyMembers');
const OrderedGroups = firebase.database().ref('OrderedGroups');
const groupsRef = firebase.database().ref('Groups');
const ref = firebase.database().ref('Orders');

const Faculty = require('./models/member');

const stuff = ['yo', 'hee', 'yurr'];

stuff.forEach(str => {
    console.log(str);
});

