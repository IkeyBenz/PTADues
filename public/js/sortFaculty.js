$(document).ready(function() {
    for (let element of $('.sortable')) {
        Sortable.create(element, { 
            handle: '.drag-handle',
            onEnd: reorderInDatabase
        });
    }
});

function reorderInDatabase(event) {
    const groupElement = document.getElementById(event.to.id);
    let newGroupOrder = getOrderedChildrenIdsFrom(groupElement);
    if (newGroupOrder.length > 1) {
        console.log('This ran.')
        axios.post('/admin/faculty/reorder/', {
            groupOrder: newGroupOrder,
            groupPath: event.to.id
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
    }
}
function getOrderedChildrenIdsFrom(parent) {
    let ids = []
    for (let element of parent.childNodes) {
        if (element.id) {
            ids.push(element.id);
        }
    }
    console.log(ids);
    return ids
}
function showIframe(link) {
    console.log('This function ran.');
    console.log('Heres the link to prove it: ' + link)
    $('#addFacultyIframe').attr('src', link);
    $('.addFacultyContainer').show();
}
function hideIframe() {
    console.log('This ran!');
}