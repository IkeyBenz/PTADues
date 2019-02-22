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
    } else {
        if (!$(`#${parent.attr('id')} input[type="checkbox"]:checked`).length)
            selector.remove();
    }
    updatePrice();
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
            token: tkn.id,
            amount: amnt,
            email: tkn.email
        }).then(res => {
            saveOrder(tkn.email);
        }).catch(alert);
    }
});
window.addEventListener('popstate', function () {
    StripeHandler.close();
});
function saveOrder(email) {
    const now = new Date();
    const order = {
        email: email,
        total: `$${updatePrice()}.00`,
        date: `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`,
        teachers: $('.teacherCheckbox:checked').map((i, el) => {
            const classId = $(el).closest('.list-group-item').attr('id');
            const childName = $(`#${classId} select option:selected`).text();
            const teacherId = $(el).attr('name');
            return { Id: teacherId, gifter: childName }
        })
    }

    //fetch('/orders/new/', order).catch(alert);
}
function openStripeHandler() {
    const price = updatePrice() * 100;
    StripeHandler.open({
        name: 'PTA Purim Presents',
        description: '',
        amount: price
    });

}