$(document).ready(function () {
    $('#continueBtn').on('click', openStripeHandler);
    $('#numChildren').on('change', updateChildren);
    $('.teacherCheckbox').on('click', toggleChildSelector);
    $('#checkout-button').on('click', openStripeHandler);
});

// When the checkbox inputs inside of listgroupitems are checked, grab the id of the 
// list-group-item (which is the class id), and paste the selector in it with id {{@key}}-childname

function toggleChildSelector() {
    const parent = $(this).closest('.list-group-item');
    const selector = $(`#${parent.attr('id')}-childname`);
    if ($(this).is(':checked')) {
        if (!selector.length)
            parent.append(renderChildSelector(parent.attr('id')));
        $('.childSelect').change(checkForOtherOption);
    } else {
        if (!$(`#${parent.attr('id')} input[type="checkbox"]:checked`).length) {
            selector.remove();
            parent.children('input[type="text"]').remove();
        }
    }
    updatePrice();
}
function checkForOtherOption() {
    `Called when a .childSelect is clicked. Checks if the option with val "Other" is selected.`
    if ($(this).val() == "Other") {
        $(this).parent().children('input[type="text"]').remove();
        $(this).parent().append('<input type="text" class="form-control" placeholder="Enter other name">');
    } else {
        /* Remove the "other" name input */
        $(this).parent().children('input[type="text"]').remove();
    }
}
function updatePrice() {
    const price = $('.teacherCheckbox:checked').length * 4;
    $('#orderTotal').text(price);
    return price;
}
function renderChildSelector(classId) {
    let name_grade = [];
    for (tag of ['input', 'select']) {
        $('#namesDropdownMenu ' + tag).each((i, inp) => {
            const d = $(inp).val();
            name_grade[i] ? name_grade[i][1] = d : name_grade[i] = [d];
        });
    }
    let options = name_grade.map(pair => {
        const selected = $(`#${classId}`).closest('.tab-pane').attr('id') == pair[1] ? 'selected' : '';
        return `<option value="${pair[1]}" ${selected}>${pair[0]}</option>`;
    });
    if ($('#parentsName').val() != '') {
        options.push(`<option>${$('#parentsName').val()}, and family</option>`)
    }

    return `<select class="childSelect" id="${classId}-childname">
                ${options.join('')}
                <option value="Other">Other</option>
            </select>`;
}
function updateChildren() {
    // Two separate loops because we dont want to unneccesarily
    // remove any data that might be in the dropdown.
    while ($('#namesDropdownMenu').children().length < $('#numChildren').val()) {
        const i = $('#namesDropdownMenu').children().length + 1;
        const options = `<option value="Pre-Playgroup">Pre-Playgroup</option>
    <option value="Playgroup">Playgroup</option>
    <option value="Nursery">Nursery</option>
    <option value="Pre-Kindergarten">Pre-Kindergarten</option>
    <option value="Kindergarten">Kindergarten</option>
    <option value="E1st">1</option>
    <option value="E2nd">2</option>
    <option value="E3rd">3</option>
    <option value="E4th">4</option>
    <option value="E5th">5</option>
    <option value="M6">6</option>
    <option value="M7">7</option>
    <option value="M8">8</option>`;

        const template = `<li class="d-flex">
    <input class="form-control" type="text" id="childname${i}" placeholder="Full Name">
    <select name="" class="form-control" id="childgrade${i}">
        ${options}
    </select>
</li>`;
        $('#namesDropdownMenu').append(template);
    }
    while ($('#namesDropdownMenu').children().length > $('#numChildren').val()) {
        $('#namesDropdownMenu').children().last().remove();
    }

}

var StripeHandler = StripeCheckout.configure({
    // My Test Live Key: pk_test_sPgdIFsNfyEgBxVx3omCpyLX
    // Their Real Live Key: pk_live_MFjSNMDErxMwrRLWAteHnZTs
    key: 'pk_test_sPgdIFsNfyEgBxVx3omCpyLX',
    image: '/images/favicon.ico',
    locale: 'auto',
    token: function (tkn) {
        const amnt = updatePrice() * 100;
        fetch('/charge/', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: tkn.id,
                amount: amnt,
                email: tkn.email
            })
        }).then(res => {
            console.log(res);
            saveOrder(tkn.email);
        }).catch(alert);
    }
});
window.addEventListener('popstate', function () {
    StripeHandler.close();
});
function saveOrder(email) {
    const now = new Date();
    let teachers = [];
    $('.teacherCheckbox:checked').each((i, el) => {
        const classId = $(el).closest('.list-group-item').attr('id'),
            childSelect = $(`#${classId} select option:selected`),
            teacherId = $(el).attr('name'),
            childName = (childSelect.text() == 'Other')
                ? $($(el).closest('.list-group-item').children('input[type="text"]')[0]).val()
                : childSelect.text();
        teachers.push({ Id: teacherId, gifter: childName })
    });
    const order = {
        email: email,
        total: `$${updatePrice()}.00`,
        date: `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`,
        teachers
    }
    fetch('/orders/new/', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    }).then(res => res.json()).then(() => {
        alert(`Thank you!\nA confirmation email has been sent to ${email}`);
        window.location.replace('/');
    }).catch(alert);
}
function openStripeHandler() {
    StripeHandler.open({
        name: 'PTA Purim Gifts',
        description: '',
        amount: updatePrice() * 100
    });
}