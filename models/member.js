const firebase = require('firebase');
const ref = firebase.database().ref('FacultyMembers');
const promise = require('bluebird');
const writeFile = promise.promisify(require('fs').writeFile);

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

    function edit(path, value) {
        return ref.child(path).set(value);
    }

    function create(member) {
        return ref.push(member);
    }
    function remove(memberId) {
        return ref.child(memberId).remove();
    }
    function getStats() {
        return ref.once('value').then(snapshot => {
            const faculty = snapshot.val();
            return Object.keys(faculty).map(memberKey => {
                let name = faculty[memberKey].Name;
                if (faculty[memberKey].Info) { name += ` (${faculty[memberKey].Info})` }
                let obj = { Name: name }
                if (faculty[memberKey].Donors) { obj['Children'] = faculty[memberKey].Donors.join(', ') }
                return obj;
            });
        });
    }
    function createStatsCSV() {
        return getStats().then(stats => {
            let csvString = `"Name","Children"\n`;
            for (let member of stats) {
                csvString += `"${member.Name}","${member.Children || ''}"\n`;
            }
            return writeFile(__dirname + '/../stats.csv', csvString);
        });
    }

    return {
        create: create,
        getAll: getAllMembers,
        update: edit,
        remove: remove,
        getStats: getStats,
        createStatsSpreadSheet: createStatsCSV
    }
})();