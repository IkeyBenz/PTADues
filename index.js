const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const methodOverride = require('method-override');
const favicon = require('serve-favicon');

const app = express();
const port = process.env.PORT || 5000;
firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

require('./controllers/main')(app);

app.listen(port, () => {
    console.log("Running PTA Dues on " + port);
});


