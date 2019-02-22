const Orders = require('../models/orders');
const Groups = require('../models/groups');
const Emailer = require('./sendgrid');

module.exports = function (app) {

    app.post('/orders/new/', (req, res) => {
        Orders.create(req.body).then(orderInfo => {
            Emailer.sendConfirmationEmail(orderInfo);
            res.render('thankYou', orderInfo);
        });
    });

    app.post('/orders/hanukkah/new', (req, res) => {
        const classes = Object.keys(req.body).map(key => {
            const newKey = key.slice(key.indexOf('/') + 1);
            if (newKey.indexOf('/') == -1 && req.body[key] == 'on') {
                return {
                    ClassPath: key,
                    ChildName: req.body[`${key}/childName`]
                }
            }
        }).filter(item => (item != undefined));
        const now = new Date().toDateString();
        const children = classes.map(obj => obj.ChildName)
        Groups.saveHanukkahOrder(classes).catch(console.error);
        Orders.createHanukkahOrder({
            Amount: req.body.Amount / 100,
            Email: req.body.Email,
            Children: children.map(child => { return { name: child } }),
            Timestamp: now
        }).then(orderId => {
            return Emailer.sendConfirmationEmail({
                date: now,
                orderId: orderId,
                Amount: req.body.Amount / 100,
                Email: req.body.Email,
                Children: children.join(', '),
                Subject: 'Thank you for your gift!',
                Text: `We've recieved your hanukkah presents from your children ${children.join(', ')}!`
            });
        }).then(() => {
            res.render('thankYou', { email: req.body.Email });
        });

    });

    app.get('/admin/orderHistory/csv', (req, res) => {
        Orders.getAsCSV().then(() => {
            const filePath = __dirname + '/../orders.csv';
            res.download(filePath);

        });
    });

};
