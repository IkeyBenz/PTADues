const OrderedFaculty = require('../models/groups');
module.exports = function (app) {

    app.get('/admin/faculty/orginize', (req, res) => {
        OrderedFaculty.get().then(d => {
            console.log(d);
            res.render('orginizeTeachers', { layout: 'admin', orginize: true, elementary: d.elementary, facMembers: d.faculty });
        });
    });

}