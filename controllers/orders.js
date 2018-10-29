const Orders = require('../models/orders');
const Emailer = require('./sendgrid');

module.exports = function (app) {
    
    app.post('/orders/new/', (req, res) => {

        req.body.Amount /= 100;
        let ct = new Date();
        let dateString = `${ct.getMonth() + 1}/${ct.getDate()}/${ct.getFullYear()}`;

        Orders.create({ Timestamp: ct.toString(), ...req.body }).then(orderId => {
            Emailer.sendConfirmationEmail({ date: dateString, orderId: orderId, ...req.body });
            res.render('thankYou', { name: req.body.Name, email: req.body.Email });
        });
        
    });

};
