const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const errorHandler = require('./controllers/error');
const AppError = require('./utils/appError');

const app = express();
const apiVersion = 'v1';
const baseRoute = `/api/${apiVersion}`;

//app, js mainly should contain middlewares
//global middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
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
//not handled route
app.all('*', (req, res, next) => {
  next(new AppError(`resource ${req.url} doesn't exist`, 404));
}); //.all will handle all verb

//global error handling middleware, express auto recognize the error handling middleware when the call back expects an error param
app.use(errorHandler);

module.exports = app;
