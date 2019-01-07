$(document).ready(function () {
    for (let element of $('.sortable')) {
        Sortable.create(element, {
            handle: '.drag-handle',
            onEnd: reorderInDatabase
        });
    }
    $('.exButton').click((e) => {
        $('.addFacultyContainer').hide();
        $('.classInputs').hide();
    });
    $('.classInput').on('change', updateInDB);
    $('.multi-select').multipleSelect({ onClick: updateAssistants });
});

function reorderInDatabase(event) {
    const groupElement = document.getElementById(event.to.id);
    const newGroupOrder = getOrderedChildrenIdsFrom(groupElement);
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

function updateInDB(e) {
    axios.post('/admin/classes/update', {
        path: e.target.id,
        data: e.target.value
    }).catch(console.error);
}
function updateAssistants(e) {
    const path = e.instance['$el'][0].id;
    const mamaSelect = e.instance.$parent[0].childNodes[1].childNodes[0];
    let selected = [];
    for (let childNode of mamaSelect.childNodes) {
        if (childNode.classList[1] == "selected") {
            selected.push(childNode.classList[0]);
        }
    }
    axios.post('/admin/classes/update', {
        path: path,
        data: selected
    }).catch(console.error);
}

function addClass(type) {
    let data = {}
    if (type == "Elementary") {
        data = { Assistants: [], Class: '', Room: '', path: 'Elementary' }
    } else if (type == "Nursary") {
        data = { Class: '', path: 'Nursary' }
    } else if (type == "MiddleSchool") {
        data = { Grade: '', path: 'MiddleSchool' }
    }
    data['Teacher'] = '';

    axios.post('/admin/classes/create', data)
        .then(() => window.location.reload())
        .catch(console.error);
}

function removeClass(id, type) {
    axios.post('/admin/classes/remove', {
        classId: id,
        path: type
    }).then(() => window.location.reload())
        .catch(console.error);
}