const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const firebase = require('firebase');

const { HanukahOrder, HSHanukahOrder } = require('../models/orders');
const { HanukahEmail, BotherIkeyEmail } = require('./emails');

/** Replaces all teacherIds in an object with their names
 * @param {Object<string, string[]>} child_teachers An object of { childName: teacherId[] }
 */
async function replaceTeacherIdsWithNames(child_teachers) {
  const membersRef = firebase.database().ref('members');
  const nameFromId = (teacherId) => membersRef.child(teacherId).once('value').then(s => s.val().Name);
  const withNames = {}
  for (let childName in child_teachers) {
    const teacherIds = child_teachers[childName];
    const teacherNames = await Promise.all(teacherIds.map(nameFromId));
    withNames[childName] = teacherNames;
  }
  return withNames;
}

module.exports = function (app) {

  app.post('/orders/hanukah', async (req, res) => {
    try {
      const { source, amount, email, parentsName, gifts } = req.body;
      await stripe.charges.create({ amount, source, currency: 'usd', description: 'PTA DUES' });
      const { timestamp, orderId } = await (new HanukahOrder(parentsName, email, amount/100, gifts)).save();
      const populatedGifts = await replaceTeacherIdsWithNames(gifts);
      await (new HanukahEmail(email, parentsName, amount/100, orderId, timestamp, populatedGifts)).send();
      res.status(200).end();
    } catch (e) {
      await (new BotherIkeyEmail('Hanukah Order Failed!!\n\n' + e.message + `\n\n${email}\n${parentsName}`)).send(); // :(
      res.statusMessage = e.message;
      res.status(500).end();
    }
  });

  app.post('/orders/highschool-hanukah/', async (req, res) => {
    try {
      const { source, amount, email, parentsName, gifts } = req.body;
      await stripe.charges.create({ amount, source, currency: 'usd', description: 'PTA DUES' });
      const { timestamp, orderId, giftsWTeachers } = await (new HSHanukahOrder(parentsName, email, amount/100, gifts)).save();
      await (new HanukahEmail(email, parentsName, amount/100, orderId, timestamp, giftsWTeachers)).send();
      res.status(200).end();
    } catch (e) {
      await (new BotherIkeyEmail('HS Hanuka Order Failed!!\n\n' + `${e.message}\n\n${email}, ${parentsName}, ${gifts}`));
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
