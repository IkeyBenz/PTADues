$(document).ready(function () {
    $('#numChildren').on('change', updateChildrenNameInputs);
    $('#pay-other-btn').click(setOtherPrice);
    $('.teacherCheckbox').on('click', toggleChildSelector);
    $('#checkout-button').on('click', () => {
        if ($('#parentsName').val() === '')
            return alert('Parents name field cannot be empty');
        if (!validateChildrenNames())
            return alert('Children name inputs cannot be empty');
        openStripeHandler();
    });
    updateChildrenNameInputs();
});


/** Shows/hides a child-name select when a teacher checkbox is checked/unchecked. */
function toggleChildSelector() {
    const grade = $(this).closest('.tab-pane').attr('id')
        , classContainer = $(this).closest('.list-group-item')
        , classId = classContainer.attr('id')
        , selector = classContainer.children('select')[0];

    if ($(this).is(':checked')) {
        if (!selector)
            classContainer.append(renderChildSelector(classId, grade));
        $('.childSelect').change(checkForOtherOption);
    } else {
        if (!$(`#${grade} #${classId} input[type="checkbox"]:checked`).length) {
            selector.remove();
            classContainer.children('input[type="text"]').remove();
        }
    }
}

/** Returns the html for the child-name select that appears next to selected teachers. */
function renderChildSelector(classId, inGrade) {
    if (IS_HIGHSCHOOL) {
        let names = [];
        $('#namesDropdownMenu input').each((i, inp) => names.push($(inp).val()));
        const select = `
            <select class="childSelect">
                ${names.map((n, i) => `<option ${i===0 ? 'selected' : ''} value="${n}">${n}</option>`)}
                <option value="Other">Other</option>
            </select>
        `;
        return select;
    }
    let name_grade = [];
    ['input', 'select'].forEach((tag) => {
        $('#namesDropdownMenu ' + tag).each((i, inp) => {
            const d = $(inp).val();
            name_grade[i] ? name_grade[i][1] = d : name_grade[i] = [d];
        });
    });
    let options = name_grade.map(([name, grade]) => {
        const selected = inGrade == grade ? ' selected' : '';
        // usually value is grade
        return `<option value="${name}"${selected}>${name}</option>`;
    });
    if ($('#parentsName').val() !== '') {
        options.push(`<option>${$('#parentsName').val()}, and family</option>`)
    }

    return `<select class="childSelect" id="${classId}-childname-${inGrade}">
                ${options.join('')}
                <option value="Other">Other</option>
            </select>`;
}

/** Called when a .childSelect is clicked. Checks if the option with val "Other" is selected. */
function checkForOtherOption() {
    if ($(this).val() == "Other") {
        $(this).parent().children('input[type="text"]').remove();
        $(this).parent().append('<input type="text" class="form-control" placeholder="Enter other name">');
    } else {
        /* Remove the "other" name input */
        $(this).parent().children('input[type="text"]').remove();
    }
}

/** Calculates and returns the total cost of the current order. */
function updatePrice() {
    const price = Number($('#other-amount').val()) || $('#namesDropdownMenu').children().length * 36;
    $('#orderTotal').text(price);
    return price;
}

/** Prompts the user to enter the other amount they'd like to give */
function setOtherPrice() {
    let amount = prompt('Enter other amount:');
    try { amount = Number(amount); } catch (e) { return alert(e); }
    $('#other-amount').val(amount);
    updatePrice();
}

/** Incriments or decriments the number of children-name inputs. */
function updateChildrenNameInputs() {
    while ($('#namesDropdownMenu').children().length < $('#numChildren').val()) {
        const i = $('#namesDropdownMenu').children().length + 1;
        const options = [
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
        let template;
        if (IS_HIGHSCHOOL) {
            template = `
            <li class="d-flex">
			    <input class="form-control" type="text" id="childname${i}" placeholder="Full Name">
		    </li>`
        } else {
            template = `
            <li class="d-flex">
                <input class="form-control" type="text" id="childname${i}" placeholder="Full Name">
                <select name="" class="form-control" id="childgrade${i}">
                    ${options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('\n')}
                </select>
            </li>`;
        }
        $('#namesDropdownMenu').append(template);
    }
    while ($('#namesDropdownMenu').children().length > $('#numChildren').val()) {
        $('#namesDropdownMenu').children().last().remove();
    }

    // Price depends on number of children
    updatePrice();
}

/** Returns true if all child name inputs are not empty */
function validateChildrenNames() {
    let noEmptyFields = true;
    $('#namesDropdownMenu li input').each((i, el) => {
        if (!$(el).val() || $(el).val() === '')
            noEmptyFields = false;
    });
    return noEmptyFields;
}

/** Returns an Object of { gifter, teacherId[] } for every selected teacher. */
function getSelectedTeachers() {
    const child_teachers = {};
    $('.teacherCheckbox:checked').each((i, el) => {
        const li = $(el).closest('.list-group-item')
            , childSelect = $(li.children('select')[0])
            , teacherId = $(el).attr('name')
            , childName = (childSelect.val() == 'Other')
                ? $(li.children('input[type="text"]')[0]).val()
                : childSelect.val();
        if (!(childName in child_teachers))
            child_teachers[childName] = [];
        child_teachers[childName].push(teacherId);
    });
    return child_teachers;
}

/** Returns the relevant info for processing this order */
function getOrderInfo(stripeToken) {
    return {
        source: stripeToken.id,
        amount: updatePrice() * 100,
        email: stripeToken.email,
        parentsName: $('#parentsName').val(),
        gifts: getSelectedTeachers()
    }
}

function processOrder(stripeToken) {
    const endpoint = IS_HIGHSCHOOL ? '/orders/highschool-hanukah/' : '/orders/hanukah/';
    fetch(endpoint, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getOrderInfo(stripeToken))
    }).then(res => {
        if (!res.ok)
            return alert("Something went wrong: " + res.statusText);
        return alert("Thank you!\nA confirmation email has been sent to " + stripeToken.email);
    }).catch(e => alert(e.message));
}
/** Opens the stripe payment widget with the price of the selected teachers. */
function openStripeHandler() {
    StripeHandler.open({
        name: 'PTA Hanukah Gifts',
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
    token: processOrder
});

window.addEventListener('popstate', function () {
    StripeHandler.close();
});