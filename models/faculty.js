module.exports = (function() {
    function getAllFaculty() {
        return new Promise(function(resolve, reject) {
            db.ref('FacultyMembers').once('value').then(snapshot => {
                resolve(snapshot.val());
            });
        });
    }
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
        let key = db.ref('FacultyMembers').push({ Name: name }).key;
        Groups.insertMiscInto(key, group);
    }
    function addPreK(name, classNumber) {

    }
    function addElementary(name, classNumber, room, assistants) {

    }
    function addMiddle(name, grade) {

    }
    function addAssistant(name) {

    }
    return {
        getAll: () => getAllFaculty(),
        addMiscMember: (name, group) => addMisc(name, group),
        addPreKTeacher: (name, classNumber) => addPreK(name, classNumber),
        addElementaryTeacher: (name, classNumber, room, assistants) => addElementary(name, classNumber, room, assistants),
        addMiddleTeacher: (name, grade) => addMiddle(name, grade),
        addMember: (member) => addFacultyMember(member, group),
        addAssistant: (name) => addAssistant(name),
        removeMember: (memberID) => removeFacultyMember(memberID)
    }
})()
