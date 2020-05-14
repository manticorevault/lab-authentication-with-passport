'use strict';

const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const bindUserToLocal = require("./middleware/bind-user-to-view-locals")
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const mongoose = require("mongoose");
const passport = require("passport");

require("./configure-passport");


const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: false
  })
);
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie{
      maxAge: 15 * 24 * 60 * 60 * 1000;
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    },
    store: new (connectMongo(expressSession))({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60
    })
  });
);

app.use(passport.initialize());
app.use(passport.session);

app.use(bindUserToLocal);

app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
