// server.js
// where your node app starts

// init project
var express = require('express');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//passport auth
var	passport = require('passport'),
	PocketStrategy = require('passport-pocket');


// Passport Set serializers
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Passport Set up
var pocketStrategy = new PocketStrategy({
		consumerKey    : process.env.POCKET_CONSUMER_KEY,
		callbackURL    : "https://"+process.env.PROJECT_DOMAIN+".glitch.me"+"/auth/pocket/callback"//process.env.PORT+
	},function(username, accessToken, done) {
		process.nextTick(function () {
			return done(null, {
				username    : username,
				accessToken : accessToken
			});
		});
	}
);

passport.use(pocketStrategy);

app.use(expressSession({ 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2592000000 } // 30 days 
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', function(req, res){
	console.log('Req to /');
	if(req.user){
		
			res.render('index', {
				user  : req.user
			});
		
	}else{
		res.render('index', { user: req.user });
	}
});

// Passport routes for express
app.get('/auth/pocket',passport.authenticate('pocket'),
function(req, res){
    // If user is already log in and this url is called please readirect the user to the correct place.
    res.redirect('/');
});

app.get('/auth/pocket/callback', passport.authenticate('pocket', { failureRedirect: '/login' }),
function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect('/');
});


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

/*
// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);



// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});
*/

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
