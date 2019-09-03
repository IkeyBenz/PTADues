const Sendgrid = require('@sendgrid/mail');
const hb = require('express-handlebars').create();
Sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (function () {

  function sendConfirmationEmail(orderInfo) {
    hb.render('views/emails/email-template.handlebars', orderInfo).then(html => {
      Sendgrid.send({
        to: orderInfo.email,
        from: 'PTADues@gmail.com',
        subject: orderInfo.Subject || 'PTA Purim Gifts - Confirmation',
        html: html
      });
    });
  }

  return {
    sendConfirmationEmail: (orderInfo) => sendConfirmationEmail(orderInfo)
  }

})();