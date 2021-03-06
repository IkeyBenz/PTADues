const Members = require('../models/member');

module.exports = function (app) {

    app.get('/admin/editFaculty', (req, res) => {
        Promise.all([
            Members.getAll(),
            Members.getRecentlyEdited()
        ]).then(([members, lastEdited]) => {
            res.render('newEdit', { layout: 'admin', edit: true, members, lastEdited });
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
        }).catch(console.error);
    });

}