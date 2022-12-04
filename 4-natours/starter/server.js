const dotenv = require('dotenv');
//always load env config before app module is loaded.
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
