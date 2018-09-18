const firebase = require('firebase');

module.exports = (function() {
    function getMemberPaths(memberID) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref('CategorizedFaculty').once('value').then(snapshot => {
                let grouped = snapshot.val();
                let pathsToMember = _findPathsToMember(memberID, grouped, 'CategorizedFaculty');
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
            firebase.database().ref('CategorizedFaculty/' + category).once('value').then(snapshot => {
                let obj = snapshot.val();
                resolve(obj.length);
            });
        });
    }
    function insertMiscIntoGroup(memberKey, groupTitle) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref('CategorizedFaculty/Miscelaneous').once('value').then(snapshot => {
                let groups = snapshot.val();
                for (let index in Object.keys(groups)) {
                    if (groups[index].Title == groupTitle) {
                        groups[index].Members.push(memberKey);
                        firebase.database().ref(`CategorizedFaculty/Miscelaneous/${index}/Members`).set(groups[index].Members);
                        resolve();
                    }
                }
                getLastIndexOf('Miscelaneous').then(index => {
                    firebase.database().ref('CategorizedFaculty/Miscelaneous/' + index).set({
                        Members: [memberKey],
                        Title: groupTitle
                    });
                    resolve();
                });
            });
        });
    }
    return {
        removeMember: (memberID) => removeMemberAt(memberID),
        insertMiscInto: (memberID, groupTitle) => insertMiscIntoGroup(memberID, groupTitle),
        insertMemberInto: (category, memberID) => {
            return new Promise(async function(resolve, reject) {
                let index = await getLastIndexOf(category);
                firebase.database().ref(`CategorizedFaculty/${category}/${index}`).set(memberID);
                resolve();
            });
        }
    }
})()