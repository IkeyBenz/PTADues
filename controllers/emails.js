const sendgrid = require('@sendgrid/mail');
const hb = require('express-handlebars').create();

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

class ThankYouEmail {
  constructor (email, parentsName, amount, orderId, timestamp) {
    this.email = email;
    this.parentsName = parentsName;
    this.amount = amount;
    this.orderId = orderId;
    this.timestamp = timestamp;
  }

  async send() {
   const template = await hb.render(this.templatePath, this._data());
    await sendgrid.send({ 
      to: this.email, 
      from: 'PTADues@gmail.com', 
      subject: 'MDY PTA - Thank You!',
      html: template
    });
  }

  _data() {
    const { month, day, year, time } = this.timestamp;
    return {
      parentsName: this.parentsName,
      amount: this.amount,
      orderId: this.orderId,
      timestamp: `${month}/${day}/${year} ${time}`
    }
  }
}

class HanukahEmail extends ThankYouEmail {
  constructor(email, parentsName, amount, orderId, timestamp, gifts) {
    super(email, parentsName, amount, orderId, timestamp);
    this.gifts = gifts;
    this.templatePath = 'views/emails/hanukah-ty.handlebars'
  }
  _data() {
    return {
      ...super._data(),
      gifts: this.gifts
    }
  }
}

class BotherIkeyEmail {
  constructor(problem) {
    this.message = problem;
  }
  async send() {
    await sendgrid.send({
      to: 'ikey.benz@gmail.com',
      from: 'PTADues@gmail.com',
      subject: 'Houston we have a problem',
      text: this.message
    });
  }
}

module.exports = { HanukahEmail, BotherIkeyEmail };

// module.exports = (function () {


//   function sendConfirmationEmail(orderInfo) {
//     const d = new Date();
//     const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
//     renderTemplate.render('views/emails/email-template.handlebars', { ...orderInfo, date }).then(html => {
//       Sendgrid.send({
//         to: orderInfo.Email,
//         from: 'PTADues@gmail.com',
//         subject: 'PTA Dues - Thank You!',
//         html: html
//       });
//     });
//   }

//   return {
//     sendConfirmationEmail: (orderInfo) => sendConfirmationEmail(orderInfo)
//   }

// })();