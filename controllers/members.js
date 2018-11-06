const Members = require('../models/member');

module.exports = function (app) {

    app.get('/admin/editFaculty', (req, res) => {
        Members.getAll().then(members => {
            res.render('newEdit', { layout: 'admin', edit: true, members: members });
        });
    });

    app.post('/admin/members/:id/edit', (req, res) => {
        const path = `${req.params.id}/${req.body.param}`;
        Members.update(path, req.body.data).then(() => {
            res.end();
        });
    });

    app.post('/admin/members/new', (req, res) => {
        Members.create(req.body).then(() => {
            res.end();
        });
    });

    app.post('/admin/members/:id/remove', (req, res) => {
        Members.remove(req.params.id).then(() => {
            res.end();
        });
    });

}