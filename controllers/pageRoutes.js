let Groups = require('../models/groups');
let Orders = require('../models/orders');

module.exports = function(app) {

    app.get(['/', '/dues/'], (req, res) => {
        const c = ['1','2','3','4','5'];
        res.render('dues', { children: c, dues: true  });
    });

    app.get('/hanukkah/', (req, res) => {
        // Groups.getFacultyWithoutMisc().then(faculty => {
        //     res.render('hanukkah', { faculty: faculty, hannukah: true });
        // }).catch(console.error);
        res.render('comingSoon', { hanukkah: true, pageName: 'Hanukkah' });
    });

    app.get('/purim/', (req, res) => {
        // Groups.getAllFaculty().then(faculty => {
        //     res.render('purim', { faculty: faculty, purim: true });
        // }).catch(console.error);
        res.render('comingSoon', { purim: true, pageName: 'Purim' });
    });
    
    // app.get('/admin/', (req, res) => {
    //     let pageName = req.query.p || 'editTeachers';
        
    //     if (pageName == 'orginizeTeachers') {
    //         Groups.getAllFaculty().then(fac => {
    //             let data = { layout: 'admin', miscelaneous: fac.misc, otherCategories: fac.other }
    //             data[pageName] = true;
    //             res.render(pageName, data);
    //         });
    //     } else {
    //         let data = getCorrectDataForPageName(pageName, req.query);
    //         res.render(pageName, data);
    //     }
        
    // });
    // app.get('/admin/', (req, res) => {
    //     Orders.getAll().then(orders => {
    //         res.render('donationHistory', { layout: 'admin', orders: orders });
    //     })
        
    // });
}
function getCorrectDataForPageName(pageName, query) {
    let data = { layout: 'admin' }
    data[pageName] = true;
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