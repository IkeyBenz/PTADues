const Groups = require('../models/groups');
const Orders = require('../models/orders');
const Faculty = require('../models/faculty');

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
    
    app.get(['/admin/', '/admin/orders/'], (req, res) => {
        Orders.getAll().then(orders => {
            res.render('donationHistory', { layout: 'admin', orders: orders, history: true });
        });
    });

    app.get('/admin/faculty/edit/', (req, res) => {
        let data = {layout: 'admin', edit: true, pageName: 'edit faculty', ...req.query }
        if (req.query.existing) {
            Faculty.getFaculty().then(members => {
                data['members'] = members;
                delete data.existing;
                res.render('editTeachers', data);
            });
        } else {
            res.render('editTeachers', data);
        }        
    });

    app.get('/admin/faculty/orginize/', (req, res) => {
        Groups.getAllFaculty().then(data => {
            res.render('orginizeTeachers', { layout: 'admin', orginize: true, ...data });
        });
    });

    app.get('/admin/faculty/stats/', (req, res) => {
        res.render('adminComingSoon', { layout: 'admin', stats: true, pageName: 'faculty stats' });
    });

}