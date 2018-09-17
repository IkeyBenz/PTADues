$(document).ready(function() {
    $('#teacherType').on('change', function(e) {
        $('.form').hide();
        $(`#${$('#teacherType').val()}`).show();
    });
});

function addMiscMember() {
    let name = $('#name-misc').val();
    let group = $('#group-misc').val();
    if (name && group) {
        Faculty.addMiscMember(name, group);
    } else {
        alert('Please enter the name and group of the member you would like to add.');
    }
}
function addNursaryTeacher() {
    let name = $('#name-misc').val();
    let classNumber = $('#class-misc').val();
    if (name && classNumber) {
        Faculty.addPreKTeacher(name, classNumber)
    } else {
        alert('Please enter the name and class number of the teacher you would like to add.');
    }
    
}
function addElementaryTeacher() {
    let name = $('#name-elementary').val();
    let className = $('#class-elementary').val();
    let roomNumber = $('#room-elementary').val();
    let assitants = $('#assistants-elementary').val();

    if (name && className && roomNumber && assitants) {
        Faculty.addElementaryTeacher(name, classNumber, roomNumber, assitants);
    } else {
        alert('Please ensure all fields are filled out before adding.');
    }
}
function addMiddleTeacher() {
    let name = $('#name-middle').val();
    let grade = $('#grade-middle').val();
    if (name && grade) {
        Faculty.addMiddleTeacher(name, grade);
    } else {
        alert('Please enter the name and grade of the teacher you are trying to add.');
    }
}
function addAssistant() {
    let name = $('#name-assistant').val();
    if (name) {
        Faculty.addAssistant(name);
    } else {
        alert('Please enter the name of the assistant you are trying to add.');
    }
}