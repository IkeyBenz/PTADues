const firebase = require('firebase');

const groupsRef = firebase.database().ref('Groups');
const orderedGroupsRef = firebase.database().ref('OrderedGroups');
const facultyRef = firebase.database().ref('FacultyMembers');


module.exports = (function() {
    function downloadFaculty() {
        return Promise.all([
            facultyRef.once('value'),
            groupsRef.once('value'),
            orderedGroupsRef.once('value')
        ]).then(vals => {
            return {
                faculty: vals[0].val(),
                groups: vals[1].val(),
                orderedGroups: vals[2].val()
            }
        });
    }
    function formattedElementary(d) {
        return d.orderedGroups.Elementary.map(classKey => {
            return { ...d.groups.Elementary[classKey], id: classKey }
        });
    }
    function formattedFaculty(d) {
        let members = [];
        for (let memberKey in d.faculty) {
            members.push({
                id: memberKey,
                name: d.faculty[memberKey].Name,
                info: d.faculty[memberKey].Info
            });
        }
        return members.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    }
    function formattedNursary(d) {
        return d.orderedGroups.Nursary.map(classKey => {
            return { ...d.groups.Nursary[classKey], id: classKey }
        });
    }
    function formattedMiddleSchool(d) {
        return d.orderedGroups.MiddleSchool.map(classKey => {
            return { ...d.groups.MiddleSchool[classKey], id: classKey }
        });
    }
    function getFaculty() {
        return downloadFaculty().then(d => {
            return {
                elementary: formattedElementary(d),
                faculty: formattedFaculty(d),
                nursary: formattedNursary(d),
                middleSchool: formattedMiddleSchool(d)
            }
        });
    }
    function getLastOrderedIndexOf(category) {
        return orderedGroupsRef.child(category).once('value').then(snapshot => {
            return snapshot.val().length;
        });
    }
    function updateAtPath(path, data) {
        return groupsRef.child(path).set(data);
    }
    function createClass(path, data) {
        return getLastOrderedIndexOf(path).then(index => {
            orderedGroupsRef.child(`${path}/${index}`).set(
                groupsRef.child(path).push(data).key
            );
        });
    }
    function reorder(path, newOrder) {
        return orderedGroupsRef.child(path).set(newOrder);
    }
    function remove(path, classId) {
        const promise1 = orderedGroupsRef.child(path).once('value').then(snapshot => {
            let order = snapshot.val();
            order.splice(order.indexOf(classId), 1);
            return orderedGroupsRef.child(path).set(order);
        });
        const promise2 = groupsRef.child(`${path}/${classId}`).remove();
        return Promise.all([promise1, promise2]);
    }
    function getDisplayableFaculty() {
        return downloadFaculty().then(d => {
            const nursaryClasses = d.orderedGroups.Nursary.map(classKey => {
                return {
                    ClassId: classKey,
                    Class: d.groups.Nursary[classKey].Class,
                    TeacherId: d.groups.Nursary[classKey].Teacher,
                    TeacherName: d.faculty[d.groups.Nursary[classKey].Teacher].Name
                }
            });
            const elemClasses = d.orderedGroups.Elementary.map(classKey => {
                const classObj = d.groups.Elementary[classKey]
                return {
                    ClassId: classKey,
                    Class: classObj.Class,
                    Room: classObj.Room,
                    Teacher: d.faculty[classObj.Teacher].Name,
                    TeacherId: classObj.Teacher,
                    Assistants: classObj.Assistants.map(assistantId => {
                        return {
                            Name: d.faculty[assistantId].Name,
                            Id: assistantId
                        }
                    })
                }
            });
            const middleSchool = d.orderedGroups.MiddleSchool.map(classKey => {
                const classObj = d.groups.MiddleSchool[classKey];
                return {
                    ClassId: classKey,
                    Grade: classObj.Grade,
                    Teacher: d.faculty[classObj.Teacher].Name,
                    TeacherId: classObj.Teacher
                }
            });
            const nursary = addSpaces(nursaryClasses);
            
            return {
                nursary: nursary,
                elementary: elemClasses,
                middleSchool: middleSchool
            }
        });
    }
    function addSpaces(classes) {
        let newClasses = [classes[0]];
        for (let i = 0; i < classes.length - 1; i++) {
            if (removeNumbers(classes[i].Class) != removeNumbers(classes[i+1].Class)) {
                newClasses.push({ space: true });
            }
            newClasses.push(classes[i+1]);
        }
        return newClasses
    }
    function removeNumbers(string) {
        const indexOfNumbers = string.indexOf(string.match(/[1-9]/g).join(''));
        return string.slice(0, indexOfNumbers);
    }
    function saveHanukkahOrder(classes) {
        const promises = classes.map(group => addDonorToTeachersInClass(group.ClassPath, group.ChildName));
        return Promise.all(promises);
    }
    function addDonorToTeachersInClass(classPath, childName) {
        return groupsRef.child(classPath).once('value').then(snapshot => {
            const group = snapshot.val();
            let teachers = [];
            if (group.Teacher) teachers.push(group.Teacher);
            if (group.Assistants) { teachers = teachers.concat(group.Assistants) }
            const promises = teachers.map(teacherId => addDonorToTeacher(teacherId, childName));
            return Promise.all(promises);
        });
    }
    function addDonorToTeacher(teacherId, childName) {
        return facultyRef.child(teacherId).once('value').then(snapshot => {
            const member = snapshot.val();
            let children = [childName];
            if (member.Donors) { children = children.concat(member.Donors) }
            return facultyRef.child(`${teacherId}/Donors`).set(children);
        });
    }
    return {
        create: createClass,
        get: getFaculty,
        getDisplayable: getDisplayableFaculty,
        update: updateAtPath,
        delete: remove,
        reorderAtPath: reorder,
        saveHanukkahOrder: saveHanukkahOrder
    }
})();