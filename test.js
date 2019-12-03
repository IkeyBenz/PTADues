const firebase = require('firebase');
const fs = require('fs');
require('dotenv').config();
if (firebase.apps.length < 1) {
    firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
}
// const facultyRef = firebase.database().ref('FacultyMembers');
// const OrderedGroups = firebase.database().ref('OrderedGroups');
// const groupsRef = firebase.database().ref('Groups');
// const ref = firebase.database().ref('Orders');

// const Faculty = require('./models/member');

const highschoolFaculyRef = firebase.database().ref('highschool');

function addHighSchoolTeachers() {
    const lines = fs.readFileSync('./highschool_faculty.csv', 'utf-8').split('\r\n').map(s => s.trim());
    lines.splice(0, 1);
    const teachers = lines.map(line => {
        const [lastName, title, firstName, email, position] = line.split(',');
        return {
            name: [title, firstName, lastName].join(' '),
            email,
            position
        }
    });
    teachers.forEach(teacher => {
        highschoolFaculyRef.push(teacher);
    });
}
