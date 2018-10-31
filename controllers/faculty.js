const Faculty = require('../models/faculty');
const Groups = require('../models/groups');

module.exports = function(app) {

    app.post('/faculty/create', (req, res) => {
        Faculty.create(req.body)
        .then(() => {
            res.redirect(`/admin/?p=editTeachers&successMsg=${req.body.Name}`);
        }).catch(error => {
            res.redirect(`/admin/?p=editTeachers&?errorMsg=${error.message}`);
        });
    });

    app.post('/faculty/:memberId/update', (req, res) => {
        delete req.body.Type;
        Faculty.update(req.params.memberId, req.body).then(() => {
            res.redirect('/admin/?p=editTeachers&successMsg=Update%20Successful.');
        }).catch(error => {
            res.redirect(`/admin/?p=editTeachers&errorMsg=${error}`);
        });
    });

    app.get('/faculty/:memberId/edit', (req, res) => {
        Faculty.read(req.params.memberId).then(member => {
            let editedMember = [];
            for (let param in member.DisplayableCredentials) {
                editedMember.push({
                    key: param,
                    val: member.DisplayableCredentials[param]
                });
            }
            let data = {
                layout: 'admin', 
                memberParams: editedMember, 
                memberId: member.key,
                isBeingUpdated: true
            }
            res.render('editTeachers', data);
        }).catch(error => {
            res.render('editTeachers', { layout: 'admin', errorMessage: error });
        });
    });

    app.post('/admin/faculty/reorder', (req, res) => {
        const newOrder = req.body.groupOrder;
        const path = req.body.groupPath;
        Groups.reorderAtPath(path, newOrder)
        .then(() => res.end)
        .catch(res.error)
    });

}