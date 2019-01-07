const Members = require('../models/member');

module.exports = function (app) {

    app.get('/admin/editFaculty', (req, res) => {
        Promise.all([
            Members.getAll(),
            Members.getRecentlyEdited()
        ]).then(vals => {
            const members = vals[0];
            const lastEdited = vals[1];
            res.render('newEdit', { layout: 'admin', edit: true, members: members, lastEdited: lastEdited });
        });
    });

    app.post('/admin/members/edit', (req, res) => {
        Members.update(req.body.path, req.body.value).then(() => {
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