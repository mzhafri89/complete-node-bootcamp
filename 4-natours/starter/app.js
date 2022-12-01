const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');

const app = express();
const apiVersion = 'v1';
const baseRoute = `/api/${apiVersion}`;

//app, js mainly should contain middlewares
//global middleware
app.use(morgan('dev'));
//server static pages
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use((req, _, next) => {
  req.timestammp = new Date().getTime();
  next();
});
//route middleware - create a sub app for each route
app.use(`${baseRoute}/tours`, tourRouter);
app.use(`${baseRoute}/users`, userRouter);

module.exports = app;
