const EventEmitter = require("events")
const http =  require("http")

// const myEmitter = new EventEmitter();

class MyEvent extends  EventEmitter{
    constructor() {
        super();
    }
}
const myEmitter = new MyEvent();

//observer pattern
//observer
myEmitter.on("newSale", () => console.log("new sale"))

myEmitter.on("newSale", () => console.log("new sale 2"))

myEmitter.on("newSale", (stock) => console.log(stock))

//emitter
myEmitter.emit("newSale", 9);

/////////////////////

const server = http.createServer();

server.on("request", (req, res) => {
    console.log("request");
    res.end("ok")
} )

server.on("request", (req, res) => {
    console.log("request 2");
} )

server.on("close", () => console.log("bye"))

server.listen(8000, "127.0.0.1", () => console.log("waiting"))