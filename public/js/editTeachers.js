$(document).ready(function() {
    if ($('#teacherType').length) {
        setQuestionair();
        $('#teacherType').on('change', setQuestionair);
    }
});
function setQuestionair() {
    $('#add-button').text(`Add ${$('#teacherType option:selected').text()} Member`);
    const options = {
        'Miscelaneous': ['Name', 'Group'],
        'PreK': ['Name', 'Class'],
        'Elementary': ['Name', 'Class', 'Room', 'Assistants'],
        'Middle': ['Name', 'Grade'],
        'Assistants': ['Name']
    }
    const key = $('#teacherType').val();
    if (key == "Elementary") {
        getFormHTMLForElementary().then(html => {
            $('#query-table').html(html);
        });
    } else {
        const html = getFormHTMLWithQueries(options[key]);
        $('#query-table').html(html);
    }
    
}
function getFormHTMLWithQueries(queries) {
    let html = '';
    for (let query of queries) {
        html += `<tr class="form-group"><td>${query}: </td><td><input class="form-control" name="${query}" type="text"></td></tr>`
    }
    return html
}
function getFormHTMLForElementary() {
    return axios.get('/admin/groups/assistants').then(response => {
        const assistants = response.data;
        let html = '';
        for (let query of ['Name', 'Class', 'Room']) {
            html += `<tr class="form-group"><td>${query}: </td><td><input class="form-control" name="${query}" type="text"></td></tr>`;
        }
        html += '<tr class="form-group"><td>Assistants: </td><td><select name="Assistants" multiple>';
        for (let key in assistants) {
            html += `<option value="${key}">${assistants[key]}</option>`;
        }
        html += '</select></td></tr>';
        return html;
    });
}
function addExisting() {
    const member = $('#member').val();
    const path = $('#path').val();
    console.log('Was suppose to add Member ' + member + ' to path ' + path);
    hideSelf();
}
function createMember() {
    let newMember = {}
    $('.createParams').forEach(input => {
        const name = $(input).attr('name');
        const val = $(input).val();
        newMember[name] = val;
    });
    
}

function hideSelf() {
    parent.hideIframe();
}