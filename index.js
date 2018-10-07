let express = require('express');
let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let firebase = require('firebase');
let methodOverride = require('method-override');

let app = express();
let port = process.env.PORT || 5000;
firebase.initializeApp(require('./firebaseConfig'));

let activateControllers = require('./controllers/main');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

activateControllers(app);

app.listen(port, () => {
    console.log("Running PTA Dues on " + port);
});