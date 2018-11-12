$(document).ready(function() {
    $('#continueBtn').on('click', openStripeHandler);
});
function validate() {
    for (let input of $('.childName')) {
        if (input.value != '') {
            return true;
        }
    }
    return false;
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
    token: function(tkn) {
        const amnt = $('#paymentAmount').val();
        $.ajax({
            url: `/charge/`,
            method: 'POST', 
            data: { token: tkn.id, amount: amnt, email: tkn.email },
            statusCode: {
                200: function() {
                    $('#emailAddress').val(tkn.email);
                    $('#hanukkahForm').submit();
                },
                500: function() {
                    alert('Something went wrong.');
                }
            }
        });
    }  
});
window.addEventListener('popstate', function() {
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