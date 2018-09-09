const express = require('express');

const routes = require('./routes/')

const app = express();
var session = require('express-session')
const cors = require('cors')

const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

let config = require('config'); //we load the db location from the JSON files
//db options
let options = {
                server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
              };

//db connection
mongoose.connect(config.DBHost, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//don't show the log when it is test
if(config.util.getEnv('NODE_ENV') !== 'dev') {
    //use morgan to log at command line
    app.use(logger('combined')); //'combined' outputs the Apache style LOGs
}

//============================== AUTHORIZATION =================================
//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));
//==============================================================================

//parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));

// TODO: Understand why having this doesn't let me hit localhost:3000 and test the API!?

if(config.util.getEnv('NODE_ENV') !== 'test') {
  // var allowCrossDomain = function(req, res, next) {
  //   res.header('Access-Control-Allow-Origin', "*");
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  //   res.header('Access-Control-Allow-Headers', 'Content-Type');
  //   next();
  // }
  // app.use(allowCrossDomain);
  // // app.use((req, res, next) => {
  // //   res.header('Access-Control-Allow-Origin', '*');
  // //   res.header(
  // //     'Access-Control-Allow-Headers',
  // //     'Origin, X-Requested-With, Content-Type, Accept'
  // //   );
  // //   if (req.method === 'Options') {
  // //     res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE');
  // //     return res.status(200).json({});
  // //   }
  // // });
  app.use(cors({credentials: true, origin: true}));
}

app.use(logger('dev'));

app.use('/', routes)

app.use((req, res, next) => {
  console.log('About to send a Not Found error')
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log('About to send the error: ' + err.message)
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Web server listening on: ${port}`);
});

module.exports = app;
