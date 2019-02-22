$(document).ready(function () {
    $('#continueBtn').on('click', openStripeHandler);
    $('#numChildren').on('change', updateChildren);
    $('.list-group-item input[type="checkbox"]').on('click', toggleChildSelector);
});

// When the checkbox inputs inside of listgroupitems are checked, grab the id of the 
// list-group-item (which is the class id), and paste the selector in it with id {{@key}}-childname

function toggleChildSelector() {
    const parent = $(this).closest('.list-group-item');
    const selector = $(`#${parent.attr('id')}-childname`);
    if ($(this).is(':checked')) {
        if (!selector.length)
            parent.append(renderChildSelector(parent.attr('id')));
    } else {
        if (!$(`#${parent.attr('id')} input[type="checkbox"]:checked`).length)
            selector.remove();
    }
}
function renderChildSelector(classId) {
    let name_grade = [];
    for (tag of ['input', 'select']) {
        $('#namesDropdownMenu ' + tag).each((i, inp) => {
            const d = $(inp).val();
            name_grade[i] ? name_grade[i][1] = d : name_grade[i] = [d];
        });
    }
    const options = name_grade.map(pair => {
        const selected = $(`#${classId}`).closest('.tab-pane').attr('id') == pair[1] ? 'selected' : '';
        return `<option value="${pair[1]}" ${selected}>${pair[0]}</option>`;
    }).join('');
    return `<select id="${classId}-childname">${options}</select>`;
}
function updateChildren() {
    // Two separate loops because we dont want to unneccesarily
    // remove any data that might be in the dropdown.
    while ($('#namesDropdownMenu').children().length < $('#numChildren').val()) {
        const i = $('#namesDropdownMenu').children().length + 1;
        const options = `<option value="Playgroup">Playgroup</option>
    <option value="Nursery">Nursery</option>
    <option value="Pre-Kindergarten">Pre-Kindergarten</option>
    <option value="Kindergarten">Kindergarten</option>
    <option value="1st Grade">1</option>
    <option value="2nd Grade">2</option>
    <option value="3rd Grade">3</option>
    <option value="4th Grade">4</option>
    <option value="5th Grade">5</option>
    <option value="6th Grade">6</option>
    <option value="7th Grade">7</option>
    <option value="8th Grade">8</option>`;

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
function calculatePrice() {
    const base = 36;
    const uniqueNames = []
    for (let nameInput of $('.childName')) {
        if (nameInput.value != '' && !uniqueNames.includes(nameInput.value))
            uniqueNames.push(nameInput.value);
    }
    return base * uniqueNames.length;
}

var StripeHandler = StripeCheckout.configure({
    // My Test Live Key: pk_test_sPgdIFsNfyEgBxVx3omCpyLX
    // Their Real Live Key: pk_live_MFjSNMDErxMwrRLWAteHnZTs
    key: 'pk_test_sPgdIFsNfyEgBxVx3omCpyLX',
    image: '/images/favicon.ico',
    locale: 'auto',
    token: function (tkn) {
        const amnt = $('#paymentAmount').val();
        $.ajax({
            url: `/charge/`,
            method: 'POST',
            data: { token: tkn.id, amount: amnt, email: tkn.email },
            statusCode: {
                200: function () {
                    $('#emailAddress').val(tkn.email);
                    $('#hanukkahForm').submit();
                },
                500: function () {
                    alert('Something went wrong.');
                }
            }
        });
    }
});
window.addEventListener('popstate', function () {
    StripeHandler.close();
});

function openStripeHandler() {
    if (validate()) {
        const price = calculatePrice() * 100;
        $('#paymentAmount').val(price);
        StripeHandler.open({
            name: 'PTA Dues',
            description: '',
            amount: price
        });
    }
}