var StripeHandler = StripeCheckout.configure({
    key: 'pk_live_Vek1WDHXK9AjMQcZJxaQSVEY',
    image: '/images/Logo.png',
    locale: 'auto',
    token: function(tkn) {
        let amnt = $('#paymentAmount').val();
        $.ajax({
        url: `https://jsc-payment-processor.herokuapp.com/charge`, 
        data: { token: tkn.id, amount: amnt },
        statusCode: {
            200: function() {
            alert('Payment Succeeded\nPlease sign the following waiver to complete your signup.');
            window.location.replace('https://waiver.fr/p-FuRDa');
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