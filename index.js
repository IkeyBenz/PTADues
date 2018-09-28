let express = require('express');
let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let firebase = require('firebase');
let methodOverride = require('method-override');

let app = express();
let port = process.env.PORT || 5000;
firebase.initializeApp(require('./firebaseConfig'));

let pageController = require('./controllers/pageRoutes');
let databaseController = require('./controllers/databaseRoutes');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

pageController(app);
databaseController(app);

app.listen(port, () => {
    console.log("Running PTA Dues on " + port);
});