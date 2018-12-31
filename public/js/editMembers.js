$(document).ready(function() {
    $('.memberInput').on('change', updateInDB);
});

function updateInDB(e) {
    axios.post('/admin/members/edit', {
        path: e.target.id,
        value: e.target.value
    }).then(() => window.location.reload())
    .catch(console.error);

}
function addMember() {
    axios.post('/admin/members/new', { Name: '', Info: '' })
    .then(() => window.location.reload())
    .catch(console.error);
}
function addMultipleMembers() {
    console.log('Adding the members!!!!!!');
    let promises = []
    for (let i = 0; i < $('#membersAmount').val(); i++) {
        promises.push(axios.post('/admin/members/new', { Name: '', Info: '' }));
    }
    Promise.all(promises).then(() => window.location.reload());
}
function remove(id) {
    axios.post(`/admin/members/${id}/remove`)
    .then(() => window.location.reload())
    .catch(console.error);
}