module.exports = function(app) {
    app.get('/', (req, res) => {
        res.render('index', { subtitle: 'Hanuka' });
    });
    app.get('/admin/', (req, res) => {
        let pageName = req.query.p || 'editTeachers';
        res.render(pageName, { layout: 'admin' });
    });
}