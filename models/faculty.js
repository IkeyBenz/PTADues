const Groups = require('./groups');
const firebase = require('firebase');

const ref = firebase.database().ref('NewFaculty');

module.exports = (function() {
    
    function addFacultyMember(member) {
        return new Promise(function(resolve, reject) {
            let memberType = member.Type;
            delete member.Type;
            let editedMember = {
                DisplayableCredentials: member,
                InternalCredentials: { Type: memberType }
            }
            let memberID = ref.push(editedMember).key;
            if (memberType == "Miscelaneous") {
                Groups.insertMiscInto(memberID, member.Group)
                .then(resolve).catch(reject);
            } else {
                Groups.insertMemberInto(memberType, memberID)
                .then(resolve).catch(reject)
            }
        });
    }
    
    function removeFacultyMember(memberID) {
        return ref.child(memberID).remove()
        .then(Groups.removeMember(memberID))
        .then(() => {
            return Promise.resolve();
        }).catch(error => {
            return Promise.reject(error);
        });
    }
    function updateFacultyMember(memberID, newMember) {
        return ref.child(memberID).once('value').then(snapshot => {
            let member = snapshot.val();
            if (member) {
                ref.child(memberID).child('DisplayableCredentials').set(newMember);
                return Promise.resolve();
            } else {
                return Promise.reject("Member does not exist.");
            }
        });
    }
    function getFacultyMember(memberID) {
        return ref.child(memberID).once('value').then(snapshot => {
            if (snapshot.val()) {
                return { key: snapshot.key, ...snapshot.val() }
            } else {
                return Promise.reject("Member does not exist.");
            }
        });
    }

    return {
        create: (member) => addFacultyMember(member),
        read:   (memberID) => getFacultyMember(memberID),
        update: (memberID, newMember) => updateFacultyMember(memberID, newMember),
        delete: (memberID) => removeFacultyMember(memberID)
    }

})();