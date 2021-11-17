var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');  
var bodyParser = require('body-parser'); 

// Define routers
var registrationRouter = require('./routes/login/registration.js');
var signinRouter = require('./routes/login/signin.js');
var logoutRouter = require('./routes/login/logout.js');
var assessmentRouter = require('./routes/assessment/assessment.js');
var secondAssessmentRouter = require('./routes/assessment/secondAssessment.js');
var groupPlacementRouter = require('./routes/assessment/groupPlacement.js');
var userAccountRouter = require('./routes/userAccount/userAccount.js');
var changeEmailRouter = require('./routes/userAccount/changeEmail.js');
var changePwdRouter = require('./routes/userAccount/changePassword.js');
var resetPwdRouter = require('./routes/userAccount/resetPassword.js');
var forgotPwdRouter = require('./routes/userAccount/forgotPassword.js')
var deleteUserRouter = require('./routes/userAccount/deleteAccount.js');
var chatRouter = require('./routes/chat/chat.js');
var indexRouter = require('./routes/index.js');
var resourcesRouter = require('./routes/resources/resources.js');
var volunteerApplicationRouter = require('./routes/volunteers/volunteerApplication.js');
var modReportRouter = require('./routes/reports/modReports.js');
var userReportRouter = require('./routes/reports/userReports.js');
var termsRouter = require('./routes/policies/terms');
const { appendFileSync } = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session initialization
app.use(session({
  secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//app.use(bodyParser.urlencoded({extended : true}));
//app.use(express.json());

// Tell app to use routers defined above
app.use('/registration', registrationRouter);
app.use('/signin', signinRouter);
app.use('/logout', logoutRouter);
app.use('/assessment', assessmentRouter);
app.use('/secondAssessment', secondAssessmentRouter);
app.use('/groupPlacement', groupPlacementRouter);
app.use('/userAccount', userAccountRouter);
app.use('/changeEmail', changeEmailRouter);
app.use('/changePassword', changePwdRouter);
app.use('/resetPassword', resetPwdRouter);
app.use('/forgotPassword', forgotPwdRouter);
app.use('/deleteAccount', deleteUserRouter);
app.use('/chat', chatRouter);
app.use('/resources', resourcesRouter);
app.use('/volunteers', volunteerApplicationRouter);
app.use('/terms', termsRouter);
app.use('/modReports', modReportRouter);
app.use('/userReports', userReportRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
