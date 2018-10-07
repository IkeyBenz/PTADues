let express = require('express');
let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let firebase = require('firebase');
let methodOverride = require('method-override');

const activateControllers = require('./controllers/main');
const app = express();
const port = process.env.PORT || 5000;

firebase.initializeApp(process.env.FIREBASE_CONFIG || require('./firebaseConfig'));

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