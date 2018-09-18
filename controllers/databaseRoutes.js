let Faculty = require('../models/faculty');

module.exports = function(app) {

    app.post('/faculty/create', (req, res) => {
        Faculty.create(req.body)
        .then(() => {
            res.render('editTeachers', { layout: 'admin', successMessage: req.body.Name});
        }).catch(error => {
            res.render('editTeachers', { layout: 'admin', errorMessage: error.message});
        });
    });

}