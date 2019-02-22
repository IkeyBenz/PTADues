const stripe = require('stripe')(process.env.STRIPE_PRIVATE);

module.exports = function (app) {

    app.post('/charge/', (req, res) => {
        if (!req.body.token) { return res.status(400).send('No token, cannot process').end() }
        stripe.charges.create({
            amount: req.body.amount,
            currency: 'usd',
            description: 'PTA Purim Presents',
            source: req.body.token
        }).then(chrg => {
            res.status(200).end();
        }).catch(err => {
            console.error(err);
            res.status(500).end(err);
        });
    });

}