const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const emailer = require('@sendgrid/mail');
emailer.setApiKey(process.env.SENDGRID_API_KEY);

const { HanukahOrder } = require('../models/orders');
const Groups = require('../models/groups');
const { HanukahEmail, BotherIkeyEmail } = require('./emails');

// TODO: use a router to simplify the routes without including /admin and /orders in all of them

module.exports = function (app) {

  app.post('/orders/hanukah', async (req, res) => {
    try {
      const { source, amount, email, parentsName, gifts } = req.body;
      await stripe.charges.create({ amount, source, currency: 'usd', description: 'PTA DUES' });
      const order = new HanukahOrder(parentsName, email, amount/100, gifts);
      const orderId = await order.save();
      const thankYouEmail = new HanukahEmail(email, parentsName, amount/100, orderId, order.timestamp, gifts);
      await thankYouEmail.send();
      res.status(200).end();
    } catch (e) {
      await (new BotherIkeyEmail('Hanukah Order Failed!!\n\n' + e.message)).send(); // :(
      res.statusMessage = e.message;
      res.status(500).end();
    }
  });

  // app.post('/orders/hanukah-highschool/', (req, res) => {

  // });

  
  /* CREATE new order */
  // TODO: change POST route to /orders
  // app.post('/orders/new/', (req, res) => {
  //   Orders.create(req.body).then(orderInfo => {
  //     const tmp = orderInfo.Amount;
  //     orderInfo.Amount = tmp.slice(0, tmp.length - 2);
  //     Emailer.sendConfirmationEmail(orderInfo);
  //     res.render('thankYou', orderInfo);
  //   }).catch((err) => {
  //     console.log("ERORR MAKING ORDER", err);
  //   });
  // });

  // /* CREATE hannukkah order */
  // // TODO: Remove this route and make a general create route
  // app.post('/orders/hanukkah/new', (req, res) => {
  //   const classes = Object.keys(req.body).map(key => {
  //     const newKey = key.slice(key.indexOf('/') + 1);
  //     if (newKey.indexOf('/') == -1 && req.body[key] == 'on') {
  //       return {
  //         ClassPath: key,
  //         ChildName: req.body[`${key}/childName`]
  //       }
  //     }
  //   }).filter(item => (item != undefined));
  //   const now = new Date().toDateString();
  //   const children = classes.map(obj => obj.ChildName)
  //   Groups.saveHanukkahOrder(classes).catch(console.error);
  //   Orders.createHanukkahOrder({
  //     Amount: req.body.Amount / 100,
  //     Email: req.body.Email,
  //     Children: children.map(child => { return { name: child } }),
  //     Timestamp: now
  //   }).then(orderId => {
  //     return Emailer.sendConfirmationEmail({
  //       date: now,
  //       orderId: orderId,
  //       Amount: req.body.Amount / 100,
  //       Email: req.body.Email,
  //       Children: children.join(', '),
  //       Subject: 'Thank you for your gift!',
  //       Text: `We've recieved your hanukkah presents from your children ${children.join(', ')}!`
  //     });
  //   }).then(() => {
  //     res.render('thankYou', { email: req.body.Email });
  //   });

  // });

  app.get('/admin/order-history/csv', (req, res) => {
    Orders.getAsCSV().then(() => {
      const filePath = __dirname + '/../orders.csv';
      res.download(filePath);

    });
  });

  app.get('/admin/purim-orders/csv', (req, res) => {
    Orders.createPurimCSV().then(() => {
      res.download(__dirname + '/../purimOrders.csv');
    });
  });

  app.put('/admin/orders/:orderId/', (req, res) => {
    Orders.update(req.params.orderId, req.body).then(() => {
      res.redirect(`/admin/orders?success=Successfully updated order #${req.params.orderId}`);
    });
  });

};
