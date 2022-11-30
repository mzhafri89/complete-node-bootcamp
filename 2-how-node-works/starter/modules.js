console.log(arguments)
console.log(require("module").wrapper)


//module.exports
const Calculator = require("./calculator")

const calc = new Calculator();

console.log(calc.add(1, 2))

//exports
const { add } = require("./calculatorz")

console.log(add(3,4))

//caching - module is only loaded once

require("./cache")()
require("./cache")()
require("./cache")()

