const Groups = require('./groups');
const firebase = require('firebase');
const db = firebase.database();

module.exports = (function() {
    function addFacultyMember(member) {
        return new Promise(function(resolve, reject) {
            let memberID = db.ref('FacultyMembers').push(member).key;
            if (member.Type == "Miscelaneous") {
                Groups.insertMiscInto(memberID, member.Group)
                .then(resolve).catch(reject);
            } else {
                Groups.insertMemberInto(member.Type, memberID)
                .then(resolve).catch(reject)
            }
        });
    }
    function removeFacultyMember(memberID) {
        return new Promise(function(resolve, reject) {
            db.ref(`FacultyMembers/${memberID}`).remove()
            .then(() => {
                Groups.removeMember(memberID);
            }).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }
    function updateFacultyMember(memberID, newMember) {
        return new Promise(function(resolve, reject) {
            db.ref('FacultyMembers/' + memberID).once('value')
            .then(snapshot => {
                let member = snapshot.val();
                if (member) {
                    db.ref('FacultyMembers/' + memberID).set(newMember)
                    resolve();
                } else {
                    reject("Member does not exist.");
                }
            });
        });
    }
    function getFacultyMember(memberID) {
        return new Promise(function(resolve, reject) {
            db.ref('FacultyMembers/' + memberID).once('value')
            .then(snapshot => {
                if (snapshot.val()) {
                    resolve(snapshot.val());
                } else {
                    reject("Member does not exist.");
                }
            });
        });
    }
    return {
        create: (member) => addFacultyMember(member),
        read:   (memberID) => getFacultyMember(memberID),
        update: (memberID, newMember) => updateFacultyMember(memberID, newMember),
        delete: (memberID) => removeFacultyMember(memberID)
    }
})()