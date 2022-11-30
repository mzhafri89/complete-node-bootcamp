//import core module
const fs = require("fs");
const http = require("http");
const url = require("url");

//3rd party modules
const slugify = require("slugify");

//own modules
//. in require path would always point to current dir
const replaceTemplate = require("./modules/replaceTemplate");

///////////////////
///// File ops

//read write file

//not specifying encoding, would only return the buffer
const text = fs.readFileSync("./txt/input.txt", "utf-8");

//console.log(text);

const textOut = `This what we know about the avocado: ${text}. \n Created on ${Date.now()}`;

fs.writeFileSync("./txt/output.txt", textOut);

//console.log("File written");

//blocking and non blocking

//blocking

const texts = fs.readFileSync("./txt/input.txt", "utf-8");

//console.log(texts);

//non blocking
// read write async

fs.readFile("./txt/start.txt", "utf-8", (_err, data) => {
  //console.log(data)
});
//console.log("Executed first"); //will be executed before the line above

//call back hell
// fs.readFile("./txt/start.txt", "utf-8", (error, startData) => {
//     if(error) {
//         console.log(error);
//         return;
//     }
//
//     fs.readFile(`./txt/${startData}.txt`, "utf-8", (_, readThisData) => {
//         console.log(readThisData)
//         fs.readFile("./txt/append.txt", "utf-8", (_, appendData) => {
//             console.log(appendData)
//
//             fs.writeFile("./txt/final.txt", `${readThisData}: \n${appendData}`, (err) => {
//                 if(err) {
//                     console.log(err)
//                     return;
//                 }
//
//                 console.log("File is written")
//             })
//         })
//     })
// })

///////////////////
///// Server

//get the data once, store in mem
//tempaltes
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
//api
const product = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const productObject = JSON.parse(product);
//slugs
const slugs = productObject.map((el) =>
  slugify(el.productName, { lower: true })
);
console.log(slugs);

const server = http.createServer((req, res) => {
  console.log(`request url: ${req.url}`);
  const { query, pathname: path } = url.parse(req.url, true);

  if (path === "/overview" || path === "/") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const cards = productObject
      .map((el) => replaceTemplate(templateCard, el))
      .join("");
    //console.log(cards);

    const output = templateOverview.replace("{%PRODUCT_CARDS%}", cards);

    res.end(output);
  } else if (path === "/product") {
    const p = productObject[query.id];

    const output = replaceTemplate(templateProduct, p);

    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end(output);
  } else if (path === "/api") {
    //. notation would always refer to the path where the node command is executed. Not relative to the path of the executed file.
    //use
    // fs.readFile(`${__dirname}/dev-data/data.json`,"utf-8", (error, data) => {
    //     if(error) {
    //         res.writeHead(500, {...error});
    //     }
    //
    //     const product = JSON.parse(data)
    //
    //     console.log(product)
    //
    //     res.writeHead(200, {
    //         "Content-type": "application/json"
    //     })
    //     res.end(data)
    // })

    //console.log(productObject);

    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(product);

    //res.end("api")
  } else {
    //always write header before res body.
    res.writeHead(404, {
      "Content-type": "text/html",
      "custom-header": "hello",
    });
    res.end("<h1>Page not found<h1>");
  }

  //res.end("Hello from the server!");
});

//server would be on event loop
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to request on port 8000");
});

//routing
