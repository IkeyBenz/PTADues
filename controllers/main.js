module.exports = function (app) {

    require('./faculty')(app);
    require('./pageRoutes')(app);
    require('./orderedFaculty')(app);
    require('./stripe')(app);
    require('./orders')(app);
    require('./members')(app);

}