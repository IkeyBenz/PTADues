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

    function getUpdatableCredentials(memberID) {
        return new Promise(async (resolve, reject) => {
            const member = await getFacultyMember(memberID);
            let data = { memberParams: [], Assistants: false };
            let editedMember = [];
            for (let param in member.DisplayableCredentials) {
                if (param == "Assistants") {
                    const _assistants = await Groups.getAssistants();
                    let assistants = [];
                    for (let key in _assistants) {
                        assistants.push({
                            key: key,
                            name: _assistants[key],
                            selected: member.DisplayableCredentials.Assistants.includes(key)
                        });
                    }
                    data.Assistants = assistants;
                } else {
                    editedMember.push({
                        key: param,
                        val: member.DisplayableCredentials[param]
                    });
                }
            }
            data.memberParams = editedMember;
            resolve(data);
        });
    }

    function getAlphabetizedFacutly() {
        return ref.once('value').then(snapshot => {
            const faculty = snapshot.val();
            let members = [];
            for (let key in faculty) {
                members.push({ key: key, name: faculty[key].DisplayableCredentials.Name });
            }
            members.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            return members;
        });
    }
    return {
        create: addFacultyMember,
        read: getFacultyMember,
        update: updateFacultyMember,
        delete: removeFacultyMember,
        getUpdatableCredentials: getUpdatableCredentials,
        getFaculty: getAlphabetizedFacutly
    }

})();