module.exports = function(app) {

    app.get('/', (req, res) => {
        res.render('index', { subtitle: 'Hanuka' });
    });
    

    app.get('/admin/', (req, res) => {
        let pageName = req.query.p || 'editTeachers';
        let data = { layout: 'admin' }
        if (req.query.errorMsg) {
            data['errorMessage'] = req.query.errorMsg;
        } 
        if (req.query.successMsg) {
            data['successMessage'] = req.query.successMsg;
        }
        
        if (pageName = 'editTeachers') {
            data['isBeingUpdated'] = false,
            data['facultyType'] = 'Miscelaneous',
            data['memberParams'] = [
                {'key': 'Name', 'val': ''},
                {'key': 'Group', 'val': ''}
            ]
        }
        res.render(pageName, data);
    });
}