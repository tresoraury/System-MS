const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var mysql = require('mysql');
var User = require('./models/user');
var morgan = require('morgan');
var session = require('express-session');
var path = require('path');


require('dotenv').config();

const app = express();
app.set('port', process.env.PORT || 3000);

//listening to port 3000
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

// Parsing middleware
app.use(bodyParser.urlencoded({ extended: false}));

// Parse application/Json
app.use(bodyParser.json());

// static files
app.use(express.static('public'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'somesecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

// templating engine
app.engine('hbs', exphbs.engine( {extname: '.hbs' }));
app.set('view engine', 'hbs');


// route home page
app.get('/', (req, res) => {
  res.render('login');
});

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user){
    res.clearCookie('user_sid');
  }
  next();
});

var hbsContent = {userName: '', loggedin: false, title: "Not logged in", body: "aury ishimwe"};

var sessionChecker = (req, res, next) => {
  if (req.session.user && !req.cookies.user_sid){
    res.redirect('dashboard');
  } else {
    next();
  }
};

//route for signup page
app.route('/signup')
    .get((req, res) => {
      //res.sendFil(__dirname + '/public/signup.html');
      res.render('signup', hbsContent);
    })
    .post((req, res) => {
      User.create({
        username: req.body.username,
        password: req.body.password
      })
      .then(user => {
        req.session.user = user.dataValues;
        res.redirect('login')
      })
      .catch(error => {
        res.redirect('/signup')
      });
    });

// route for login
app.route('/login')
    .get((req, res) => {
      //res.sendFil(__dirname + '/public/login.html');
      res.render('login', hbsContent);
    })
    .post((req, res) => {
      var username = req.body.username;
      var password = req.body.password;

      User.findOne({ where: { username: username } }).then(function (user) {
        if (!user) {
          res.redirect('login');
        } else if (!user.validPassword(password)) {
          res.redirect('login');
        }else {
          req.session.user = user.dataValues;
          res.redirect('dashboard')
        }
      });
    });

//route for user's dashboard
app.get('/dashboard', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    hbsContent.loggedin = true;
    hbsContent.username = req.session.user.username;
    hbsContent.title = "logged in";
    res.render('dashboard', hbsContent);
  } else {
      res.redirect('/login');
  }
});

// route for user's logout
app.get('/logout', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    hbsContent.loggedin = true;
    hbsContent.title = "logged out";
    res.clearCookie('user_sid');
    res.redirect('/login');
  } else {
    res.redirect('/login');
  }
});



