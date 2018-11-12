const OrderedFaculty = require('../models/groups');
const Orders = require('../models/orders');
const Members = require('../models/member');


module.exports = function(app) {

    app.get(['/', '/dues/'], (req, res) => {
        // const c = ['1','2','3','4','5'];
        // res.render('dues', { children: c, dues: true  });
        res.render('comingSoon', {dues: true, pageName: 'Dues' });
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

    app.get('/admin/faculty/stats/', (req, res) => {
        Members.getStats().then(members => {
            res.render('facultyStats', { layout: 'admin', stats: true, members: members });
        });
    });

    app.get('/admin/hannukaPreview', (req, res) => {
        OrderedFaculty.getDisplayable().then(data => {
            res.render('hanukkah', { layout: 'admin', hannuka: true, ...data });
        }); 
    });

}