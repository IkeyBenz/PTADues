const Faculty = require('../models/faculty');
const Groups = require('../models/groups');

module.exports = function(app) {

    app.post('/faculty/create', (req, res) => {
        Faculty.create(req.body)
        .then(() => {
            const successMessage = `Successfully%20Added%20${req.body.Name}`;
            res.redirect(`/admin/faculty/edit?successMsg=${successMessage}`);
        }).catch(error => {
            res.redirect(`/admin/faculty/edit/?errorMsg=${error.message}`);
        });
    });

    app.post('/faculty/:memberId/update', (req, res) => {
        delete req.body.Type;
        Faculty.update(req.params.memberId, req.body).then(() => {
            res.redirect('/admin/faculty/edit?successMsg=Update%20Successful.');
        }).catch(error => {
            res.redirect(`/admin/faculty/edit?errorMsg=${error}`);
        });
    });

    app.get('/faculty/:memberId/edit', (req, res) => {
        Faculty.getUpdatableCredentials(req.params.memberId).then(credentials => {
            res.render('editTeachers', { 
                layout: 'admin', edit: true,
                memberId: req.params.memberId,
                isBeingUpdated: true, 
                ...credentials 
            });
        }).catch(error => {
            res.render('editTeachers', { layout: 'admin', errorMsg: error });
        });
    });

    app.post('/admin/faculty/reorder', (req, res) => {
        const newOrder = req.body.groupOrder;
        const path = req.body.groupPath;
        Groups.reorderAtPath(path, newOrder)
        .then(() => res.end)
        .catch(res.error)
    });

    app.post('/admin/faculty/addExisting', (req, res) => {
        const path = req.body.path;
        const memberID = req.body.member;
        Groups.insertMemberInto(path, memberID).then(() => {
            res.redirect('/admin/faculty/orginize/');
        });
    });

    app.get('/admin/groups/assistants', (req, res) => {
        Groups.getAssistants().then(assistants => {
            res.json(assistants);
        });
    });

    // Shitty Routes But fuck it cause got no time to be pretty
    app.post('/admin/faculty/createMiscAndAdd', (req, res) => {
        const memberName = req.body.memberName;
        const groupId = req.body.groupId;
        Groups.insertMiscIntoGroupId(Faculty.create(memberName), groupId).then(() => {
            res.end();
        });
    });

    app.post('/admin/faculty/addToMiscGroup', (req, res) => {
        const memberId = req.body.memberId;
        const groupId = req.body.groupId;
        Groups.insertMiscIntoGroupId(memberId, groupId).then(() => {
            res.end();
        });
    });

    app.post('/admin/faculty/addClass', (req, res) => {
        const classType = req.body.Type;
        if (classType == 'Nursary') {
            const teacherId = req.body.TeacherID || Faculty.create(req.body.NewTeacherName);
            Groups.createNursaryClass(teacherId, req.body.Class).then(() => {
                return res.end();
            });
        }
    })

}