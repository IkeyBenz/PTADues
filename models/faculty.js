const Groups = require('./groups');
const firebase = require('firebase');

module.exports = (function() {
    function addFacultyMember(member, group) {
        let memberId = db.ref('FacultyMembers').push(member).key;

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
    
    async function addMisc(name, group) {
        let key = firebase.database().ref('FacultyMembers').push({ Name: name }).key;
        Groups.insertMiscInto(key, group);
    }
    return {
        create: (member) => {
            return new Promise(function(resolve, reject) {
                let memberID = firebase.database().ref('Faculty').push(member).key;
                if (member.Type == "Miscelaneous") {
                    Groups.insertMiscInto(memberID, member.Group)
                    .then(resolve).catch(reject);
                } else {
                    Groups.insertMemberInto(member.Type, memberID)
                    .then(resolve).catch(reject)
                }
            });
        }
    }
})()