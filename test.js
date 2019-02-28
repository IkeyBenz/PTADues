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

function findPathOfMissingMember() {
    return new Promise(async (resolve, reject) => {
        const faculty = await facultyRef.once('value').then(s => { return s.val() });
        const groups = await groupsRef.once('value').then(s => { return s.val() });
        for (let group in groups) {
            for (let room in groups[group]) {
                if (groups[group][room].Assistants) {
                    if (typeof groups[group][room].Assistants == 'object') {
                        for (let assistant of groups[group][room].Assistants) {
                            if (!(assistant in faculty)) {
                                resolve(assistant);
                            }
                        }
                    } else {
                        if (!(groups[group][room].Assistants in faculty)) {
                            resolve(groups[group][room].Assistants);
                        }
                    }
                }
                if (groups[group][room].Teacher) {
                    if (typeof groups[group][room].Teacher == 'object') {
                        for (let teacher of groups[group][room].Teacher) {
                            if (!(teacher in faculty)) {
                                resolve(teacher);
                            }
                        }
                    } else {
                        if (!(groups[group][room].Teacher in faculty)) {
                            resolve(groups[group][room].Teacher);
                        }
                    }
                }
            }
        }
        resolve('No one');
    });
}

function findPathOfMissingClasses() {
    return new Promise(async (resolve, reject) => {
        const groups = await groupsRef.once('value').then(s => { return s.val() });
        const ordered = await OrderedGroups.once('value').then(s => { return s.val() });

        for (let group in ordered) {
            for (let room of ordered[group]) {
                if (!(room in groups[group])) {
                    resolve(`OrderedGroups/${group}/${room}`);
                }
            }
        }
        resolve('none bruh');
    });
}
function findPathOfExtraClasses() {
    return new Promise(async (resolve, reject) => {
        const groups = await groupsRef.once('value').then(s => { return s.val() });
        const ordered = await OrderedGroups.once('value').then(s => { return s.val() });

        let paths = [];

        for (let group in groups) {
            for (let classKey in groups[group]) {
                if (!ordered[group].includes(classKey)) {
                    paths.push(`Groups/${group}/${classKey}`);
                }
            }
        }
        resolve(paths);
    });
}


function addAdminToDB() {
    /* 
    Groups/Administration = {
        -id: {
            Title: 'Principal',
            Members: [-LR4WPlqh9HlygGT0Rra]
        }
    }
    OrderedGroups/Administration = {
        0: -id
    }
    */
    const key = firebase.database().ref('Groups/Administration').push({
        Title: 'Principal',
        Members: ['-LR4WPlqh9HlygGT0Rra']
    }).key
    firebase.database().ref('OrderedGroups/Administration').set([key]);
}

function getData() {
    return Promise.all([
        facultyRef.once('value'),
        OrderedGroups.once('value'),
        groupsRef.once('value')
    ]).then(res => {
        return {
            faculty: res[0].val(),
            orderedGroups: res[1].val(),
            groups: res[2].val()
        }
    });
}
async function nursary() {
    const data = await getData();
    console.log(formattedGroup(data, 'Nursary'))

}
function teacherExists(teachers, faculty) {
    if (typeof teachers == 'object') {
        for (let teacherKey of teachers) {
            if (!faculty[teacherKey]) {
                return false
            }
        }
        return true;
    } else {
        return faculty[teachers] || false;
    }
}
function getTeacherName(teachers, faculty) {
    if (typeof teachers == 'object') {
        return teachers.map(key => {
            return faculty[key].Name;
        }).join(', ');
    }
    return faculty[teachers].Name;
}

function formattedGroup(d, groupName) {
    return d.orderedGroups[groupName] ? d.orderedGroups[groupName].map(key => {
        const teacherKey = d.groups[groupName][key].Teacher;
        const assistantKey = d.groups[groupName][key].Assistants || undefined;
        const teacherName = teacherExists(teacherKey, d.faculty) ? getTeacherName(teacherKey, d.faculty) : '';
        const assistantName = assistantKey && teacherExists(assistantKey, d.faculty) ? getTeacherName(assistantKey, d.faculty) : '';
        return { ...d.groups[groupName][key], id: key, teacherName, assistantName }
    }) : {};
}

function addMiddleShoolTeacher() {
    const key = firebase.database().ref('Groups/MiddleSchool').push({
        Subject: '',
        Teacher: '',
        Grade: ''
    }).key;
    firebase.database().ref('OrderedGroups/MiddleSchool/0').set(key);
}
function addAdministrationToTheMix() {
    const firstKey = groupsRef.child('Administration').push({
        Members: [],
        Title: 'Principal'
    }).key;
    OrderedGroups.child('Administration').remove();
    OrderedGroups.child('Administration/0').set(firstKey);
}
function addAdminContainers() {
    groupsRef.child('Administration').once('value').then(s => {
        const admin = s.val();
        for (let categoryKey in admin) {
            const members = admin[categoryKey].Members;
            for (let i in members) {
                // get index and value at this location
                const memberKey = members[i];
                const memberPath = groupsRef.child(`Administration/${categoryKey}/Members/${i}`);
                // create new push in Administration/Containers with value of memberKey
                const containerKey = groupsRef.child('Administration/Containers').push(memberKey).key;
                // set push key to be value at this index in reg Admin
                memberPath.set(containerKey);
            }
        }
    });
}
function downloadFaculty() {
    return Promise.all([
        facultyRef.once('value'),
        groupsRef.once('value'),
        OrderedGroups.once('value')
    ]).then(vals => {
        return {
            faculty: vals[0].val(),
            groups: vals[1].val(),
            orderedGroups: vals[2].val()
        }
    });
}
function removeNumbers(string) {
    const indexOfNumbers = string.indexOf(string.match(/[1-9]/g).join(''));
    return string.slice(0, indexOfNumbers);
}
function getEarlyChildhood(db) {
    const nursary = db.orderedGroups.Nursary.map(key => {
        return db.groups.Nursary[key];
    });
    let grades = {}
    for (let _class of nursary) {
        let grade = removeNumbers(_class.Class);
        if (!grades[grade])
            grades[grade] = {}
        if (!grades[grade][_class.Class])
            grades[grade][_class.Class] = []
        grades[grade][_class.Class].push({ Id: _class.Teacher, ...db.faculty[_class.Teacher] });
    }
    grades[Object.keys(grades)[0]].First = true;
    console.log(grades);
    return grades;
}
function getMiddleSchool(db) {
    const middleSchool = db.orderedGroups.MiddleSchool.map(key => {
        const classInfo = db.groups.MiddleSchool[key],
            withTeacher = { ...classInfo, Teacher: { ...db.faculty[classInfo.Teacher], Id: classInfo.Teacher } }
        return withTeacher
    });
    const grades = {};
    for (let _class of middleSchool) {
        if (!grades[_class.Grade])
            grades[_class.Grade] = []
        grades[_class.Grade].push(_class);
    }
    return grades;
}

async function separateMiscFromAdmin() {
    const db = await Promise.all([
        firebase.database().ref('OrderedGroups/Administration').once('value'),
        firebase.database().ref('Groups/Administration').once('value')
    ]).then(vals => {
        return {
            orderedAdmin: vals[0].val(),
            admin: vals[1].val()
        }
    });

    // Create admin backup (just in case):
    firebase.database().ref('AdminBackup/Groups').set(db.admin);
    firebase.database().ref('AdminBackup/Ordered').set(db.orderedAdmin);

    // Get array of groupId's to move
    const groupsToMove = db.orderedAdmin.splice(24)
        , groupsToKeep = db.orderedAdmin;

    // Move ordered Admin group ids out of Administration and into Misc
    firebase.database().ref('OrderedGroups/Administration').set(groupsToKeep);
    firebase.database().ref('OrderedGroups/Misc').set(groupsToMove);

    // Create ref in Groups for Misc and set its value to ...
    const createGroup = (groupIds) => {
        const newGroup = { Containers: {} }
        for (let groupId of groupIds) {
            const group = db.admin[groupId];
            newGroup[groupId] = group;
            for (let containerId of group.Members) {
                newGroup.Containers[containerId] = db.admin.Containers[containerId];
            }
        }
        return newGroup;
    }

    // Move actual Admin groups out of Administration and into Misc
    const admin = createGroup(groupsToKeep)
        , misc = createGroup(groupsToMove);

    firebase.database().ref('Groups/Administration').set(admin);
    firebase.database().ref('Groups/Misc').set(misc);

    // If everything works, manually delete the Admin backup
}
