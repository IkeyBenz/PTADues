module.exports = function (app) {

    require('./faculty')(app);
    require('./pageRoutes')(app);
    require('./stripe')(app);
    require('./orders')(app);

}