const dotenv = require('dotenv');
const mongoose = require('mongoose');
//always load env config before app module is loaded.
dotenv.config({ path: './config.env' });

//init database
const {
  env: { DB_URL, DB_USER, DB_PASSWORD },
} = process;

const databaseConnectionString = DB_URL.replace('<USER>', DB_USER).replace(
  '<PASSWORD>',
  DB_PASSWORD
);

mongoose
  .connect(databaseConnectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.info('Database connected.');
  });

//will caught sync code issue before app being init
process.on('uncaughtException', (error) => {
  console.error(error.name, error.message);

  process.exit(1);
});

//init app
const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//handled all unhandled rejection for async
process.on('unhandledRejection', (error) => {
  console.error(error.name, error.message);
  server.close(() => {
    //gracefully shutdown the server
    process.exit(1);
  });
});
