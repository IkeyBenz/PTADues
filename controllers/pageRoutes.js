let Groups = require('../models/groups');

module.exports = function(app) {

    app.get('/', (req, res) => {
        res.render('index', { subtitle: 'Hanuka' });
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