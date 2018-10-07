var StripeHandler = StripeCheckout.configure({
    key: 'getPublicKey',
    image: '/images/Logo.png',
    locale: 'auto',
    token: function(tkn) {
        let amnt = $('#paymentAmount').val();
        $.ajax({
        url: `/charge/`, 
        data: { token: tkn.id, amount: amnt },
        statusCode: {
            200: function() {
            alert('Payment Succeeded\nThank you for your generous contribution!');
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