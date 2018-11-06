$(document).ready(function() {
    for (let element of $('.sortable')) {
        Sortable.create(element, { 
            handle: '.drag-handle',
            onEnd: reorderInDatabase
        });
    }
    $('.exButton').click((e) => $('.addFacultyContainer').hide() );
});

function reorderInDatabase(event) {
    const groupElement = document.getElementById(event.to.id);
    let newGroupOrder = getOrderedChildrenIdsFrom(groupElement);
    if (newGroupOrder.length > 1) {
        axios.post('/admin/faculty/reorder/', {
            groupOrder: newGroupOrder,
            groupPath: event.to.id
        }).then(response => {
            console.log(response);
        }).catch(console.error);
    }
}
function getOrderedChildrenIdsFrom(parent) {
    let ids = []
    for (let element of parent.childNodes) {
        if (element.id) {
            ids.push(element.id);
        }
    }
    return ids
}
function displayCreateMiscMember(groupId, groupTitle) {
    $('#miscGroupTitle').text(groupTitle);
    $('#createMiscMemberButton').attr('onclick', `createMiscMember('${groupId}')`);
    $('.addition').hide();
    $('.addFacultyContainer').show();
    $('#miscMemberCreate').show();
}
function createMiscMember(groupId) {
    const memberName = $('#memberName').val();
    if (!memberName) return alert("Please enter the member's name before continuing.");
    axios.post('/admin/faculty/createMiscAndAdd', {
        memberName: memberName,
        groupId: groupId
    }).then(res => {
        console.log('Yay');
        window.location.reload();
    }).catch(console.error);
}