const http = require('http')

const hostname = "localhost"
const port = 5000

const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader("Access-Control-Allow-Headers", "Authorization, Cache-Control, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    res.end(JSON.stringify({cards: [{color: "green", value: 1}]}))
})

server.listen(port, hostname, () => {
    console.log(`Server running ${hostname}:${port}`)
})
