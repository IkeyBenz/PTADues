const Orders = require('../models/orders');
const Emailer = require('./sendgrid');
const fs = require('fs');

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

    app.get('/admin/orderHistory/csv', (req, res) => {
        Orders.getAsCSV().then(() => {
            const filePath = __dirname + '/../orders.csv';
            res.download(filePath);
            
        });
    });

};
