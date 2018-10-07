let Groups = require('../models/groups');

module.exports = function(app) {

    app.get(['/', '/hanukkah/'], (req, res) => {
        Groups.getFacultyWithoutMisc().then(faculty => {
            res.render('hanukkah', { faculty: faculty, hannukah: true });
        }).catch(console.error);
    });

    app.get('/purim/', (req, res) => {
        Groups.getAllFaculty().then(faculty => {
            res.render('purim', { faculty: faculty, purim: true });
        }).catch(console.error);
    });

    app.get('/dues/', (req, res) => {
        res.render('dues', { dues: true });
    });
    

    app.get('/admin/', (req, res) => {
        let pageName = req.query.p || 'editTeachers';
        
        if (pageName == 'orginizeTeachers') {
            Groups.getAllFaculty().then(fac => {
                let data = { layout: 'admin', miscelaneous: fac.misc, otherCategories: fac.other }
                res.render(pageName, data);
            });
        } else {
            let data = getCorrectDataForPageName(pageName, req.query);
            res.render(pageName, data);
        }
        
    });
}
function getCorrectDataForPageName(pageName, query) {
    let data = { layout: 'admin' }
    if (query.errorMsg) {
        data['errorMessage'] = query.errorMsg;
    } 
    if (query.successMsg) {
        data['successMessage'] = query.successMsg;
    }
    if (pageName == 'editTeachers') {
        data['isBeingUpdated'] = false,
        data['facultyType'] = 'Miscelaneous',
        data['memberParams'] = [
            {'key': 'Name', 'val': ''},
            {'key': 'Group', 'val': ''}
        ];
    }
    return data
}