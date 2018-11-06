$(document).ready(function() {
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
function displayCreateMiscMember(groupId, groupTitle) {
    $('.miscGroupTitle').text(groupTitle);
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
        window.location.reload();
    }).catch(console.error);
}
function displayAddMiscMember(groupId, groupTitle) {
    $('.miscGroupTitle').text(groupTitle);
    $('#addMiscMemberButton').attr('onclick', `addMiscMember('${groupId}')`);
    $('.addition').hide();
    $('.addFacultyContainer').show();
    $('#miscMemberAdd').show();
}
function addMiscMember(groupId) {
    const memberId = $('#memberToAdd').val();
    if (memberId == 'None') return alert('Please select a member before continuing.');
    axios.post('/admin/faculty/addToMiscGroup', {
        memberId: memberId,
        groupId, groupId
    }).then(res => {
        window.location.reload();
    }).catch(console.error);
}
function displayAddClassPopup(classType) {
    if (classType == 'Nursary') {
        $('#classInput').show();
    } else if (classType == 'Middle') {
        $('#gradeInput').show();
    } else if (classType == 'Elementary') {
        $('.classInputs').show();
    }
    $('.addition').hide();
    $('#classAdd').show();
    $('#classType').text(classType);
    $('#addClassButton').attr('onclick', "addClass('Nursary')")
    $('.addFacultyContainer').show();
}

function addClass(type) {
    if ($('#teacherSelect').val() == 'None' && $('#newTeacherName').val() == '') {
         return alert('Please select a teacher or enter the name of a new one before continuing.')
    };
    let data = { 
        Type: type, 
        TeacherID: $('#teacherSelect').val() == 'None' ? false : $('#teacherSelect').val(),
        NewTeacherName: $('#newTeacherName').val() == '' ? false : $('#newTeacherName').val()
    };
    if (type == 'Nursary') {
        if ($('#classInput').val() == '') return alert('Please enter the class before continuing.');
        data = {
            ...data,
            Class: $('#classInput').val()
        }
    } else if (type == 'Middle') {
        if ($('#gradeInput').val() == '') return alert('Please enter the grade before continuing.');
        data = {
            ...data,
            Grade: $('#gradeInput').val()
        }
    } else if (type == 'Elementary') {
        
    }
    axios.post('/admin/faculty/addClass', data).then(() => {
        window.location.reload();
    }).catch(console.error);
}