$(document).ready(function () {
    $('#continueBtn').on('click', openStripeHandler);
    $('#numChildren').on('change', updateChildrenNameInputs);
    $('.teacherCheckbox').on('click', toggleChildSelector);
    $('#checkout-button').on('click', openStripeHandler);
});


/* Shows/hides a child-name select when a teacher checkbox is checked/unchecked */
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

/* Returns the html for the child-name select that appears next to selected teachers */
function renderChildSelector(classId) {
    let name_grade = [];
    for (tag of ['input', 'select']) {
        $('#namesDropdownMenu ' + tag).each((i, inp) => {
            const d = $(inp).val();
            name_grade[i] ? name_grade[i][1] = d : name_grade[i] = [d];
        });
    }
    let options = name_grade.map(pair => {
        const selected = $(`#${classId}`).closest('.tab-pane').attr('id') == pair[1] ? ' selected' : '';
        return `<option value="${pair[1]}"${selected}>${pair[0]}</option>`;
    });
    if ($('#parentsName').val() != '') {
        options.push(`<option>${$('#parentsName').val()}, and family</option>`)
    }

    return `<select class="childSelect" id="${classId}-childname">
                ${options.join('')}
                <option value="Other">Other</option>
            </select>`;
}

/* Called when a .childSelect is clicked. Checks if the option with val "Other" is selected. */
function checkForOtherOption() {
    if ($(this).val() == "Other") {
        $(this).parent().children('input[type="text"]').remove();
        $(this).parent().append('<input type="text" class="form-control" placeholder="Enter other name">');
    } else {
        /* Remove the "other" name input */
        $(this).parent().children('input[type="text"]').remove();
    }
}

/* Calculates and returns the total cost of the current order */
function updatePrice() {
    const price = $('.teacherCheckbox:checked').length * 4;
    $('#orderTotal').text(price);
    return price;
}

/* Incriments or decriments the number of children-name inputs */
function updateChildrenNameInputs() {
    while ($('#namesDropdownMenu').children().length < $('#numChildren').val()) {
        const i = $('#namesDropdownMenu').children().length + 1;
        const options = [
            ['Pre-Playgroup', 'Pre-Playgroup'],
            ['Playgroup', 'Playgroup'],
            ['Nursery', 'Nursery'],
            ['Pre-Kindergarten', 'Pre-Kindergarten'],
            ['Kindergarten', 'Kindergarten'],
            ['E1st', '1'],
            ['E2nd', '2'],
            ['E3rd', '3'],
            ['E4th', '4'],
            ['E5th', '5'],
            ['M6', '6'],
            ['M7', '7'],
            ['M8', '8'],
        ]
        const template = `<li class="d-flex">
    <input class="form-control" type="text" id="childname${i}" placeholder="Full Name">
    <select name="" class="form-control" id="childgrade${i}">
        ${options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('\n')}
    </select>
</li>`;
        $('#namesDropdownMenu').append(template);
    }
    while ($('#namesDropdownMenu').children().length > $('#numChildren').val()) {
        $('#namesDropdownMenu').children().last().remove();
    }

}

/* Stores an order in the database and sends a confirmation email */
function saveOrder(email) {
    const now = new Date();
    const order = {
        email: email,
        total: `$${updatePrice()}.00`,
        date: `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`,
        teachers: getSelectedTeachers()
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

/* Returns a list of { Id, gifter } for every selected teacher */
function getSelectedTeachers() {
    let teachers = [];
    $('.teacherCheckbox:checked').each((i, el) => {
        const classId = $(el).closest('.list-group-item').attr('id')
            , childSelect = $(`#${classId} select option:selected`)
            , teacherId = $(el).attr('name')
            , childName = (childSelect.text() == 'Other')
                ? $($(el).closest('.list-group-item').children('input[type="text"]')[0]).val()
                : childSelect.text();
        teachers.push({ Id: teacherId, gifter: childName })
    });
    return teachers;
}

/* Opens the stripe payment widget with the price of the selected teachers */
function openStripeHandler() {
    StripeHandler.open({
        name: 'PTA Purim Gifts',
        description: '',
        amount: updatePrice() * 100
    });
}

/* STRIPE HANDLER */
var StripeHandler = StripeCheckout.configure({
    // My Test Live Key: pk_test_sPgdIFsNfyEgBxVx3omCpyLX
    // Their Real Live Key: pk_live_MFjSNMDErxMwrRLWAteHnZTs
    key: 'pk_live_MFjSNMDErxMwrRLWAteHnZTs',
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
            saveOrder(tkn.email);
        }).catch(alert);
    }
});

window.addEventListener('popstate', function () {
    StripeHandler.close();
});