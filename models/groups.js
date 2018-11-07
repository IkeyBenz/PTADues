const firebase = require('firebase');
// const db = firebase.database();
// const ref = firebase.database().ref('RestrcutredCategories');

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
            console.log(formattedMiddleSchool(d));
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
    return {
        create: createClass,
        get: getFaculty,
        update: updateAtPath,
        delete: remove,
        reorderAtPath: reorder
    }
})();

// module.exports = (function() {
//     function getMemberPaths(memberID) {
//         return new Promise(function(resolve, reject) {
//             ref.once('value').then(snapshot => {
//                 let grouped = snapshot.val();
//                 let pathsToMember = _findPathsToMember(memberID, grouped, 'RestrcutredCategories');
//                 resolve(pathsToMember);
//             });
//         });
//     }
//     function _findPathsToMember(needle, haystack, currPath) {
//         let paths = [];
//         for (let key in haystack) {
//             if (typeof haystack[key] == 'object') {
//                 paths = paths.concat(_findPathsToMember(needle, haystack[key], `${currPath}/${key}`));
//             } else if (haystack[key] == needle) {
//                 paths.push(`${currPath}/${key}`);
//             } 
//         }
//         return paths
//     }
//     async function removeMemberAt(memberID) {
//         let pathsToRemove = await getMemberPaths(memberID);
//         for (let path of pathsToRemove) {
//             let pathAndElem = getElemAndArrayPath(path);
//             removeFromDbArray(pathAndElem[0], pathAndElem[1])
//         }
//     }
//     function getElemAndArrayPath(originalPath) {
//         let reversed = originalPath.split('').reverse();
//         let elem = reversed.slice(0, reversed.indexOf('/')).reverse().join('');
//         let path = reversed.slice(reversed.indexOf('/'), reversed.length).reverse().join('');
//         return [path, elem]
//     }
//     function removeFromDbArray(pathToArray, elem) {
//         firebase.database().ref(pathToArray).once('value').then(snapshot => {
//             let array = snapshot.val();
//             let indexOfElem = array.indexOf(elem)
//             array.splice(indexOfElem, 1);
//             firebase.database().ref(pathToArray).set(array);
//         });
//     }
//     function getLastIndexOf(category) {
//         return new Promise(function(resolve, reject) {
//             ref.child(category).once('value').then(snapshot => {
//                 let obj = snapshot.val();
//                 resolve(obj.length);
//             });
//         });
//     }
//     function insertMiscIntoGroup(memberKey, groupTitle) {
//         return new Promise(function(resolve, reject) {
//             ref.child('Miscelaneous').once('value').then(snapshot => {
//                 let groups = snapshot.val();
//                 for (let index in Object.keys(groups)) {
//                     if (groups[index].Title == groupTitle) {
//                         groups[index].Members.push(memberKey);
//                         ref.child(`Miscelaneous/${index}/Members`).set(groups[index].Members);
//                         resolve();
//                     }
//                 }
//                 getLastIndexOf('Miscelaneous').then(index => {
//                     ref.child('Miscelaneous/' + index).set({
//                         Members: [memberKey],
//                         Title: groupTitle
//                     });
//                     resolve();
//                 });
//             });
//         });
//     }
//     function insertMiscIntoGroupId(memberKey, groupId) {
//         return getLastIndexOf(`MiscGroups/${groupId}/Members`).then(index => {
//             console.log(index);
//             console.log(memberKey);
//             return ref.child(`MiscGroups/${groupId}/Members/${index}`).set(memberKey);
//         });
//     }
    
//     function getParametersForCategory(category) {
//         return new Promise(function(resolve, reject) {
//             ref.child(`${category}/0`).once('value').then(snapshot => {
//                 let memberKey = snapshot.val();
//                 firebase.database().ref(`New/${memberKey}`).once('value')
//             }).then(snapshot => {
//                 resolve(Object.keys(snapshot.val().DiplayableCredentials));
//             }).catch(error => {
//                 reject(error)
//             });
//         });
//     }
//     function downloadFaculty() {
//         return Promise.all([
//             ref.once('value'),
//             firebase.database().ref('Faculty').once('value'),
//         ]).then(vals => { return { faculty: vals[1].val(), categories: vals[0].val() } });
//     }
//     function getMiscelaneousFrom(values) {
//         let categories = values.categories, members = values.faculty, miscGroups = values.categories.MiscGroups;
//         let misc = [];
//         for (let groupKeyIndex in categories.Miscelaneous) {
//             const groupKey = categories.Miscelaneous[groupKeyIndex];
//             const group = miscGroups[groupKey];
//             if (group) {
//                 let _group = { title: group.Title, groupKey: groupKey, members: [] }
//                 for (let memberIndex in group.Members) {
//                     _group.members.push({
//                         name: members[group.Members[memberIndex]].DisplayableCredentials.Name,
//                         key: group.Members[memberIndex]
//                     });
//                 }
//                 misc.push(_group);
//             }
//         }
//         return misc;
//     }
//     function getOtherFacultyFrom(values) {
//         let categories = values.categories, members = values.faculty;
//         let faculty = [];
//         for (let category in categories) {
//             if (!['Miscelaneous', 'MiscGroups', 'ElemClasses', 'Elementary', 'NursaryClasses', 'Nursary'].includes(category)) {
//                 let cat = { title: category, members: [] }
//                 for (let memberKey of categories[category]) {
//                     cat.members.push({ 
//                         key: memberKey, 
//                         props: members[memberKey].DisplayableCredentials
//                     });
//                 }
//                 faculty.push(cat);
//             }
//         }
//         return faculty;
//     }
//     function formattedMembers(d) {
//         return Object.keys(d.faculty).map(memberKey => {
//             return { id: memberKey, name: d.faculty[memberKey].DisplayableCredentials.Name }
//         }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
//     }
//     function getFaculty() {
//         return downloadFaculty().then(values => {
//             return {
//                 misc: getMiscelaneousFrom(values),
//                 otherFaculty: getOtherFacultyFrom(values),
//                 elementary: formattedElementary(values),
//                 nursary: formattedNursary(values),
//                 faculty: formattedMembers(values)
//             }
//         });
//     }
//     function getFacultyWithoutMisc() {
//         return new Promise(function(resolve, reject) {
//             downloadFaculty().then(values => {
//                 resolve(getOtherFacultyFrom(values));
//             }).catch(error => reject(error));
//         });
//     }
//     function insertMemberInto(category, memberID) {
//         return getLastIndexOf(category).then(index => {
//             return ref.child(`${category}/${index}`).set(memberID);
//         });
//     }
//     function reorderAtPath(path, orderedArray) {
//         return ref.child(path).set(orderedArray);
//     }
//     function getAssistants() {
//         const facultyPromise = db.ref('NewFaculty').once('value');
//         const assistantsPromise = ref.child('Assistants').once('value');
//         return Promise.all([facultyPromise, assistantsPromise]).then(snapshots => {
//             let assistants = {}
//             const members = snapshots[0].val();
//             const assistantKeys = snapshots[1].val();
//             for (let key of assistantKeys) {
//                 assistants[key] = members[key].DisplayableCredentials.Name;
//             }
//             return assistants
//         });
//     }

//     function formattedElementary(d) {
//         return d.categories.Elementary.map(classKey => {
//             let newClass = d.categories.ElemClasses[classKey];
//             newClass.Teacher = { id: newClass.Teacher, Name: d.faculty[newClass.Teacher].DisplayableCredentials.Name };
//             newClass.id = classKey;
//             newClass.Assistants = typeof newClass.Assistants == 'string'
//             ? { id: newClass.Assistants, Name: d.faculty[newClass.Assistants].DisplayableCredentials.Name }
//             : newClass.Assistants.map(key => { return { id: key, Name: d.faculty[key].DisplayableCredentials.Name } });
//             return newClass;
//         });
//     }
//     function formattedNursary(d) {
//         return d.categories.Nursary.map(classKey => {
//             let newClass = d.categories.NursaryClasses[classKey];
//             newClass.id = classKey;
//             newClass.Teacher = { id: newClass.Teacher, Name: d.faculty[newClass.Teacher].DisplayableCredentials.Name }
//             return newClass;
//         });
//     }
//     function createNursaryClass(teacherId, className) {
//         return getLastIndexOf('Nursary').then(index => {
//             const classKey = ref.child('NursaryClasses').push({
//                 Class: className,
//                 Teacher: teacherId
//             }).key;
//             return ref.child(`Nursary/${index}`).set(classKey);
//         });
//     }

//     return {
//         removeMember: removeMemberAt,
//         insertMiscInto: insertMiscIntoGroup,
//         insertMemberInto: insertMemberInto,
//         getAllFaculty: getFaculty,
//         getFacultyWithoutMisc: getFacultyWithoutMisc,
//         reorderAtPath: reorderAtPath,
//         getAssistants: getAssistants,
//         insertMiscIntoGroupId: insertMiscIntoGroupId,
//         createNursaryClass: createNursaryClass
//     }

// })();