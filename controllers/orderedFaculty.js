const OrderedFaculty = require('../models/groups');
module.exports = function (app) {

    app.get('/admin/faculty/orginize', (req, res) => {
        OrderedFaculty.get().then(data => {
            res.render('orginizeTeachers', { layout: 'admin', orginize: true, ...data });
        });
    });

    app.post('/admin/faculty/reorder', (req, res) => {
        const newOrder = req.body.groupOrder;
        const path = req.body.groupPath;
        OrderedFaculty.reorderAtPath(path, newOrder)
            .then(() => res.end)
            .catch(res.error)
    });

}