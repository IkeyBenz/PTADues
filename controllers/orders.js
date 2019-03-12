const Orders = require('../models/orders');
const Groups = require('../models/groups');
const Emailer = require('./sendgrid');

// TODO: use a router to simplify the routes without including /admin and /orders in all of them

module.exports = function (app) {

    /* CREATE new order */
    // TODO: change POST route to /orders
    app.post('/admin/orders/new/', (req, res) => {
        Orders.create(req.body).then(orderInfo => {
            Emailer.sendConfirmationEmail(orderInfo);
            res.json(orderInfo);
        });
    });

    /* CREATE hannukkah order */
    // TODO: Remove this route and make a general create route
    app.post('/admin/orders/hanukkah/new', (req, res) => {
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

    app.get('/admin/order-history/csv', (req, res) => {
        Orders.getAsCSV().then(() => {
            const filePath = __dirname + '/../orders.csv';
            res.download(filePath);

        });
    });

    app.put('/admin/orders/:orderId/', (req, res) => {
        Orders.update(req.params.orderId, req.body).then(() => {
            res.redirect(`/admin/orders?success=Successfully updated order #${req.params.orderId}`);
        });
    });

};
