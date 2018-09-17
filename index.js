let express = require('express');
let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let pageController = require('./controllers/pageRoutes');
let app = express();
let port = process.env.PORT || 5000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

pageController(app);

app.listen(port, console.log("Running PTA Dues on " + port));