const firebase = require('firebase');
const ref = firebase.database().ref('FacultyMembers');

module.exports = (function() {

    function getAllMembers() {
        return ref.once('value').then(snapshot => {
            return Object.keys(snapshot.val()).map(memberKey => {
                return {
                    name: snapshot.val()[memberKey].Name,
                    info: snapshot.val()[memberKey].Info,
                    id: memberKey
                }
            }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        });
    }

    function edit(path, data) {
        return ref.child(path).set(data);
    }

    function create(member) {
        return ref.push(member);
    }
    function remove(memberId) {
        return ref.child(memberId).remove();
    }

    return {
        create: create,
        getAll: getAllMembers,
        update: edit,
        remove: remove
    }
})();