module.exports = function (app) {

    require('./databaseRoutes')(app);
    require('./pageRoutes')(app);
    require('./stripe')(app);

}