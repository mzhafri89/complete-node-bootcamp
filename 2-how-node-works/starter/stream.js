const fs = require("fs");
const server =  require("http").createServer();

server.on("request", (req, res) => {
    //solution 1, load entire file to mem
    // fs.readFile("test-file.txt", (err, data) => {
    //     if(err) console.log(err)
    //
    //     res.end(data)
    // })

    //solution 2, streams -- causes back pressure(when writeable stream is receiving to much data at the same time)
    // const readable = fs.createReadStream("test-file.txt");
    // readable.on("data", chunk => {
    //     res.write(chunk)
    // })
    //
    // readable.on("end", () => res.end())
    //
    // readable.on("error", err => {
    //     console.log(err);
    //     res.statusCode(500);
    //     res.end("error")
    // })

    //solution 3 - pipe controls the amount of data being sent to the written stream
    const readable = fs.createReadStream("test-file.txt");
    readable.pipe(res)
})

server.listen(8000, "127.0.0.1", () => console.log("listening"))