const fs = require("fs");
const superagent = require("superagent");

const readFilePromise = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject("File not found");
      resolve(data);
    });
  });
};

const writeFilePromise = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) reject("File not written");
      resolve(`File written: ${data}`);
    });
  });
};

//return a promise to chain it
// readFilePromise(`${__dirname}/dog.txt`)
//   .then((res) =>
//     superagent.get(`https://dog.ceo/api/breed/${res}/images/random/`)
//   )
//   .then((res) => writeFilePromise("dog-img.txt", res.body.message))
//   .then((res) => console.log(res))
//   .catch((reason) => console.log(reason)); //this last catch would catch any exception thrown from the top

//async await - syntax sugar to promises

async function main() {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    const all = await Promise.all([
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random/`),
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random/`),
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random/`),
    ]);
    const images = all.map((el) => el.body.message);

    const ok = await writeFilePromise("dog-img.txt", images.join("\n"));
    console.log(ok);
  } catch (e) {
    console.log(e);
  }
  return "Ready";
}

(async function () {
  const x = await main();
  console.log(x);
})();
