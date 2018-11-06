$(document).ready(function() {
    $('.memberInput').on('change', updateInDB);
});

function updateInDB(e) {
    const params = e.target.id.split('_');
    axios.post(`/admin/members/${params[0]}/edit`, {
        data: e.target.value,
        param: params[1]
    }).catch(console.error);
}
function addMember() {
    axios.post('/admin/members/new', { Name: '', Info: '' })
    .then(() => window.location.reload())
    .catch(console.error);
}
function remove(id) {
    axios.post(`/admin/members/${id}/remove`)
    .then(() => window.location.reload())
    .catch(console.error);
}