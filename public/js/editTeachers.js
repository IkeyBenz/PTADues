$(document).ready(function() {
    $('#teacherType').on('change', setQuestionair);
});
function setQuestionair(e) {
    let options = {
        'misc': ['Name', 'Group'],
        'preK': ['Name', 'Class'],
        'elementary': ['Name', 'Class', 'Room', 'Assistants'],
        'middle': ['Name', 'Grade'],
        'assistant': ['Name']
    }
    let key = $('#teacherType').val();
    let html = getFormHTMLWithQueries(options[key]);
    $('#query-table').html(html);
}
function getFormHTMLWithQueries(queries) {
    let html = '';
    for (let query of queries) {
        html += `<tr><td>${query}: </td><td><input name="${query}" type="text"></td></tr>`
    }
    return html
}
