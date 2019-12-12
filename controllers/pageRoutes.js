const OrderedFaculty = require('../models/groups');
const { Order } = require('../models/orders');
const Members = require('../models/member');

module.exports = function pageRouter(app) {
  app.get(['/', '/dues/'], (req, res) => {
    const c = ['1', '2', '3', '4', '5'];
    res.render('dues', { children: c, dues: true });
    // res.render('comingSoon', { dues: true, pageName: 'Dues' });
  });

  app.get('/hanukah/', (req, res) => {
    OrderedFaculty.getDisplayable().then((data) => {
      res.render('hanukkah', { hanukah: true, ...data });
    });

    //res.render('comingSoon', { hanukkah: true, pageName: 'Hanukkah' });
  });

  app.get('/hanukah-highschool', (req, res) => {
    OrderedFaculty.getHighschool().then((teachers) => {
      res.render('highschool-hanukkah', { highschool: true, teachers });
    });
  });

  app.get('/purim/', (req, res) => {
    // OrderedFaculty.getDisplayable().then(data => {
    //     res.render('purim', { purim: true, ...data });
    // });
    res.render('comingSoon', { purim: true, pageName: 'Purim' });
  });

  app.get('/admin/orders/', async (req, res) => {
    const elemOrders = await Order.get('/hanukah/2019/')
        , elemWithKeys = Object.keys(elemOrders).map(key => ({ key, ...elemOrders[key] }))
        , hanukahOrders = (await Promise.all(elemWithKeys.map(o => Order.populateTeachers(o, 'members')))).reverse()
        , hsOrders = await Order.get('/highschool/hanukah/2019')
        , hsWithKeys = Object.keys(hsOrders).map(key => ({ key, ...hsOrders[key] }))
        , highschoolOrders = (await Promise.all(hsWithKeys.map(o => Order.populateTeachers(o, 'highschool')))).reverse();
    res.render('order-history', { layout: 'admin', history: true, hanukahOrders, highschoolOrders });
  });

  app.get('/admin/faculty/stats/', (req, res) => {
    Members.getStats().then((members) => {
      res.render('facultyStats', {
        layout: 'admin',
        stats: true,
        members,
      });
    });
  });

  app.get(['/admin/', '/admin/hannukaPreview'], (req, res) => {
    OrderedFaculty.getDisplayable().then((data) => {
      res.render('hanukkah', { layout: 'admin', hannuka: true, IS_ADMIN: true, ...data });
    });
  });

  app.get('/admin/create-purim-order', (req, res) => {
    OrderedFaculty.getDisplayable().then((data) => {
      res.render('mock-order', { layout: 'admin', mockOrder: true, ...data });
    });
  });
  app.get('/admin/highschool-preview', (req, res) => {
    OrderedFaculty.getHighschool().then((teachers) => {
      res.render('highschool-hanukkah', { layout: 'admin', IS_ADMIN: true, highschool: true, teachers });
    });
  });
};
