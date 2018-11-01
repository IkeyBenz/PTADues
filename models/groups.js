const firebase = require('firebase');
const db = firebase.database();
const ref = firebase.database().ref('RestrcutredCategories');

module.exports = (function() {
    function getMemberPaths(memberID) {
        return new Promise(function(resolve, reject) {
            ref.once('value').then(snapshot => {
                let grouped = snapshot.val();
                let pathsToMember = _findPathsToMember(memberID, grouped, 'RestrcutredCategories');
                resolve(pathsToMember);
            });
        });
    }
    function _findPathsToMember(needle, haystack, currPath) {
        let paths = [];
        for (let key in haystack) {
            if (typeof haystack[key] == 'object') {
                paths = paths.concat(_findPathsToMember(needle, haystack[key], `${currPath}/${key}`));
            } else if (haystack[key] == needle) {
                paths.push(`${currPath}/${key}`);
            } 
        }
        return paths
    }
    async function removeMemberAt(memberID) {
        let pathsToRemove = await getMemberPaths(memberID);
        for (let path of pathsToRemove) {
            let pathAndElem = getElemAndArrayPath(path);
            removeFromDbArray(pathAndElem[0], pathAndElem[1])
        }
    }
    function getElemAndArrayPath(originalPath) {
        let reversed = originalPath.split('').reverse();
        let elem = reversed.slice(0, reversed.indexOf('/')).reverse().join('');
        let path = reversed.slice(reversed.indexOf('/'), reversed.length).reverse().join('');
        return [path, elem]
    }
    function removeFromDbArray(pathToArray, elem) {
        firebase.database().ref(pathToArray).once('value').then(snapshot => {
            let array = snapshot.val();
            let indexOfElem = array.indexOf(elem)
            array.splice(indexOfElem, 1);
            firebase.database().ref(pathToArray).set(array);
        });
    }
    function getLastIndexOf(category) {
        return new Promise(function(resolve, reject) {
            ref.child(category).once('value').then(snapshot => {
                let obj = snapshot.val();
                resolve(obj.length);
            });
        });
    }
    function insertMiscIntoGroup(memberKey, groupTitle) {
        return new Promise(function(resolve, reject) {
            ref.child('Miscelaneous').once('value').then(snapshot => {
                let groups = snapshot.val();
                for (let index in Object.keys(groups)) {
                    if (groups[index].Title == groupTitle) {
                        groups[index].Members.push(memberKey);
                        ref.child(`Miscelaneous/${index}/Members`).set(groups[index].Members);
                        resolve();
                    }
                }
                getLastIndexOf('Miscelaneous').then(index => {
                    ref.child('Miscelaneous/' + index).set({
                        Members: [memberKey],
                        Title: groupTitle
                    });
                    resolve();
                });
            });
        });
    }
    
    function getParametersForCategory(category) {
        return new Promise(function(resolve, reject) {
            ref.child(`${category}/0`).once('value').then(snapshot => {
                let memberKey = snapshot.val();
                firebase.database().ref(`New/${memberKey}`).once('value')
            }).then(snapshot => {
                resolve(Object.keys(snapshot.val().DiplayableCredentials));
            }).catch(error => {
                reject(error)
            });
        });
    }
    function downloadFaculty() {
        return Promise.all([
            ref.once('value'),
            firebase.database().ref('NewFaculty').once('value'),
            ref.child('MiscGroups').once('value')
        ]);
    }
    function getMiscelaneousFrom(values) {
        let categories = values[0].val(), members = values[1].val(), miscGroups = values[2].val();
        let misc = [];
        for (let groupKeyIndex in categories.Miscelaneous) {
            const groupKey = categories.Miscelaneous[groupKeyIndex];
            const group = miscGroups[groupKey];
            if (group) {
                let _group = { title: group.Title, groupKey: groupKey, members: [] }
                for (let memberIndex in group.Members) {
                    _group.members.push({
                        name: members[group.Members[memberIndex]].DisplayableCredentials.Name,
                        key: group.Members[memberIndex]
                    });
                }
                misc.push(_group);
            }
        }
        return misc;
    }
    function getOtherFacultyFrom(values) {
        let categories = values[0].val(), members = values[1].val();
        let faculty = [];
        for (let category in categories) {
            if (category != 'Miscelaneous' && category != 'MiscGroups') {
                let cat = { title: category, members: [] }
                for (let memberKey of categories[category]) {
                    cat.members.push({ 
                        key: memberKey, 
                        props: members[memberKey].DisplayableCredentials
                    });
                }
                faculty.push(cat);
            }
        }
        return faculty;
    }
    function getFaculty() {
        return new Promise(function(resolve, reject) {
            downloadFaculty().then(values => {
                let misc = getMiscelaneousFrom(values);
                let otherFaculty = getOtherFacultyFrom(values);
                resolve({ misc: misc, other: otherFaculty });
            }).catch(error => reject(error));
        });
    }
    function getFacultyWithoutMisc() {
        return new Promise(function(resolve, reject) {
            downloadFaculty().then(values => {
                resolve(getOtherFacultyFrom(values));
            }).catch(error => reject(error));
        });
    }
    function insertMemberInto(category, memberID) {
        return getLastIndexOf(category).then(index => {
            return ref.child(`${category}/${index}`).set(memberID);
        });
    }
    function reorderAtPath(path, orderedArray) {
        return ref.child(path).set(orderedArray);
    }
    function getAssistants() {
        const facultyPromise = db.ref('NewFaculty').once('value');
        const assistantsPromise = ref.child('Assistants').once('value');
        return Promise.all([facultyPromise, assistantsPromise]).then(snapshots => {
            let assistants = {}
            const members = snapshots[0].val();
            const assistantKeys = snapshots[1].val();
            for (let key of assistantKeys) {
                assistants[key] = members[key].DisplayableCredentials.Name;
            }
            return assistants
        });
    }

    return {
        removeMember: removeMemberAt,
        insertMiscInto: insertMiscIntoGroup,
        insertMemberInto: insertMemberInto,
        getAllFaculty: getFaculty,
        getFacultyWithoutMisc: getFacultyWithoutMisc,
        reorderAtPath: reorderAtPath,
        getAssistants: getAssistants
    }
})()