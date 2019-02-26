const Sendgrid = require('@sendgrid/mail');
const hb = require('express-handlebars').create();
Sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (function () {

    function sendConfirmationEmail(orderInfo) {
        hb.render('views/emails/purim.handlebars', orderInfo).then(html => {
            // Sendgrid.send({
            //     to: orderInfo.email,
            //     from: 'PTADues@gmail.com',
            //     subject: orderInfo.Subject || 'PTA Purim Gifts - Confirmation',
            //     html: html
            // });
            console.log('Not sending email because that code is commented.')
        });
    }

    return {
        sendConfirmationEmail: (orderInfo) => sendConfirmationEmail(orderInfo)
    }

})();