const Sendgrid = require('@sendgrid/mail');
const hb = require('express-handlebars').create();
const moment = require('moment');

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (function () {


  function sendConfirmationEmail(orderInfo) {
    const d = new Date();
    const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    hb.render('views/emails/email-template.handlebars', { ...orderInfo, date }).then(html => {
      Sendgrid.send({
        to: orderInfo.Email,
        from: 'PTADues@gmail.com',
        subject: 'PTA Dues - Thank You!',
        html: html
      });
    });
  }

  return {
    sendConfirmationEmail: (orderInfo) => sendConfirmationEmail(orderInfo)
  }

})();