const Faculty = require('../models/member');
const Groups = require('../models/groups');

module.exports = function (app) {

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


    app.post('/admin/classes/update', (req, res) => {
        const path = req.body.path;
        const data = req.body.data;
        Groups.update(path, data).then(() => {
            return res.end();
        });
    });

    app.post('/admin/classes/create', (req, res) => {
        const path = req.body.path;
        delete req.body.path;
        Groups.create(path, req.body).then(() => {
            return res.end();
        });
    });

    app.post('/admin/classes/addMiscMember', (req, res) => {
        Groups.addMiscMember(req.body.group).then(() => {
            return res.end();
        });
    });

    app.post('/admin/classes/removeMiscMember', (req, res) => {
        Groups.removeMiscMember(req.body.group, req.body.container).then(() => {
            return res.end();
        });
    });

    app.post('/admin/classes/remove', (req, res) => {
        const path = req.body.path;
        const classId = req.body.classId;
        Groups.delete(path, classId).then(() => {
            return res.end();
        });
    });

    app.get('/admin/faculty/stats/download', (req, res) => {
        Faculty.createStatsSpreadSheet().then(() => {
            res.download(__dirname + '/../stats.csv')
        });
    });

}