const stripe = require('stripe')(process.env.STRIPE_PRIVATE);

module.exports = function (app) {

    app.post('/charge/', (req, res) => {
        if (!req.query.token) { return res.status(400).send('No token, cannot process').end() }
        stripe.charges.create({
            amount: req.query.amount,
            currency: 'usd',
            description: 'PTA Dues',
            source: req.query.token
        }).then(chrg => {
            // Send verification email ?
            res.status(200).end();
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    });

}