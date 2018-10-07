let Faculty = require('../models/faculty');

module.exports = function(app) {

    app.post('/faculty/create', (req, res) => {
        Faculty.create(req.body)
        .then(() => {
            res.redirect(`/admin/?p=editTeachers&successMsg=${req.body.Name}`);
        }).catch(error => {
            res.redirect(`/admin/?p=editTeachers&?errorMsg=${error.message}`);
        });
    });

    app.get('/faculty/:memberId/edit', (req, res) => {
        Faculty.read(req.params.memberId)
        .then(member => {
            let editedMember = [];
            for (let param in member) {
                editedMember.push({
                    key: param,
                    val: member[param]
                });
            }
            let data = {
                layout: 'admin', 
                member: editedMember, 
                memberId: memberId,
                isBeingEdited: true
            }
            res.render('editTeachers', data);
        }).catch(error => {
            res.render('editTeachers', { layout: 'admin', errorMessage: error.message });
        })
    })

}