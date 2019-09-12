const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const methodOverride = require('method-override');
const favicon = require('serve-favicon');
const https = require('https');
const expressAuth = require('express-basic-auth');
const enforce = require('express-sslify');

require('dotenv').config();

const app = express();
const port = process.env.PORT;
firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./hbsHelpers') }));
app.set('view engine', 'handlebars')
// app.use(enforce.HTTPS({ trustProtoHeader: true }));
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use('/admin', expressAuth({
  users: JSON.parse(process.env.ADMINS),
  challenge: true,
  unauthorizedResponse: displayUnauthorizedPage
}));

function displayUnauthorizedPage(req) {
  return req.auth
    ? 'You are logged in.'
    : "You dont't have authorization to view this page."
}

require('./controllers/main')(app);

app.listen(port, () => {
  console.log(`Running pta dues at localhost:${port}`);
  // console.log("Running PTA Dues on " + port);
  // setInterval(function () {
  //   https.get('https://mdy-pta-dues.herokuapp.com')
  // }, 1500000);
});