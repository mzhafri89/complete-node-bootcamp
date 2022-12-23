const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tour');

dotenv.config({ path: `${__dirname}/../../config.env` });

const {
  env: { DB_URL, DB_USER, DB_PASSWORD },
} = process;

const databaseConnectionString = DB_URL.replace('<USER>', DB_USER).replace(
  '<PASSWORD>',
  DB_PASSWORD
);

mongoose.connect(databaseConnectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});

const importTours = async () => {
  const tours = fs.readFileSync(
    `${__dirname}/../data/tours-simple.json`,
    'utf-8'
  );

  if (!tours) {
    throw new Error('No data to be save into collections');
  }

  try {
    await Tour.insertMany(JSON.parse(tours));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

const deleteTours = async () => {
  try {
    await Tour.deleteMany({});
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importTours();
} else if (process.argv[2] === '--delete') {
  deleteTours();
}

//execute script with --import or --delete flag in cli
