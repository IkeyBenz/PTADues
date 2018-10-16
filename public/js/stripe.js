var StripeHandler = StripeCheckout.configure({
    key: 'pk_live_MFjSNMDErxMwrRLWAteHnZTs',
    image: '/images/favicon.ico',
    locale: 'auto',
    token: function(tkn) {
        let amnt = $('#paymentAmount').val();
        $.ajax({
            url: `/charge/`,
            method: 'POST', 
            data: { token: tkn.id, amount: amnt, email: tkn.email },
            statusCode: {
                200: function() {
                    $('#emailAddress').val(tkn.email);
                    $('#duesForm').submit();
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