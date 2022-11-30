const fs = require("fs")
const crypto = require("crypto")

const start = Date.now();
//manage threadpool size
process.env.UV_THREADPOOL_SIZE = 1

setTimeout(() => console.log("Timer 1 finished"), 0);
//immediate cb would be called first since the fs needed some time to finish reading the file.
setImmediate(() => console.log("Immediate 1 finished"))

fs.readFile(`${__dirname}/test-file.txt`, (_, data) => {
    console.log("IO Finished")

    setTimeout(() => console.log("Timer 2 finished"), 0);
    setTimeout(() => console.log("Timer 3 finished"), 3000);
    //set immediate would be called first since the expired timer would wait till fs is finished
    setImmediate(() => console.log("Immediate 2 finished"))

    process.nextTick(() => console.log("next tick"))

    //thread pool
    crypto.pbkdf2("secret", "salt", 100000, 1024, "sha512", () => {
        console.log(Date.now() - start,"password is enc")
    })
    crypto.pbkdf2("secret", "salt", 100000, 1024, "sha512", () => {
        console.log(Date.now() - start,"password is enc")
    })
    crypto.pbkdf2("secret", "salt", 100000, 1024, "sha512", () => {
        console.log(Date.now() - start,"password is enc")
    })
    crypto.pbkdf2("secret", "salt", 100000, 1024, "sha512", () => {
        console.log(Date.now() - start,"password is enc")
    })
})

console.log("Top level code")
