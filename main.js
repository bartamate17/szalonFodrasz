console.log('MongoDB - működöm!');
var password = "";
var repositoryName = "";
var databaseName = "";

//BACKEND
const METHOD_GET = "GET";

//PACKAGE - CSOMAGOT TÖLT BE NODE -bol
var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

//MIME - INTERNETES SZABVÁNY DEFINÍCIÓ
var mime = {
    html: "text/html",
    css: "text/css",
    txt: "text/plain",
    js: "application/javascript",
    json: "application/json",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml"
};

const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://mate17:" + password + "@cluster0.2stvc.mongodb.net/" + repositoryName + "?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var server = http.createServer(function(request, response) {

    var method = request.method;
    var parsedUrl = url.parse(request.url);

    switch (true) {
        case method == METHOD_GET && parsedUrl.pathname == "/":

            response.writeHead(200, {
                "Content-type": "text/html; charset=utf-8"
            });

            fs.readFile(__dirname + "/public/index.html", function(error, file) {

                response.write(file);
                response.end();
            });

            break;

        case method == METHOD_GET && parsedUrl.pathname == "/":

            response.writeHead(200, {
                "Content-type": "text/html; charset=utf-8"
            });

            fs.readFile(__dirname + "/public/admin.html", function(error, file) {

                response.write(file);
                response.end();
            });

            break;

        case method == METHOD_GET && parsedUrl.pathname == "/fodraszok":

            response.writeHead(200, {

                "Content-type": "application/json; charset=utf-8"
            });

            client.connect(err => {

                const dbo = client.db(repositoryName);
                const collection = dbo.collection(databaseName);

                collection.find().toArray(function(err, res) {

                    console.log(res);

                    response.write(JSON.stringify(res));
                    response.end();

                    client.close();
                });

            });

            break;

        case method == METHOD_GET && parsedUrl.pathname == "/idopontok":

            response.writeHead(200, {

                "Content-type": "application/json; charset=utf-8"
            });

            client.connect(err => {

                const dbo = client.db("vizsgamunka");
                const collection = dbo.collection("idopontfoglalas");

                collection.find().toArray(function(err, res) {

                    console.log(res);

                    response.write(JSON.stringify(res));
                    response.end();

                    client.close();
                });
            });

            break;

        case method == "POST" && parsedUrl.pathname == "/newreservation":

            var dataString = '';
            var newResDate = {};

            response.writeHead(201, {

                "Content-type": "application/json; charset=utf-8"
            });

            request.on("data", function(chunk) {
                dataString += chunk;

                console.log(chunk);
            });

            request.on("end", function() {
                newResDate = JSON.parse(dataString);

                console.log(newResDate);

                client.connect(err => {

                    const dbo = client.db("vizsgamunka");
                    const collection = dbo.collection("idopontfoglalas");

                    collection.insertOne(newResDate, (err, resp) => {

                        var obj = '{' +
                            '"message" : ' + '"Inserted OK"' +
                            '}';

                        response.write(obj);
                        response.end();

                        client.close();
                    });
                });
            });

            break;

        default:
            var extension = parsedUrl.pathname.slice(parsedUrl.pathname.indexOf(".") + 1);

            response.writeHead(200, {
                "Content-type": mime[extension] || "text/plain"
            });

            fs.readFile(path.join(__dirname, "public", parsedUrl.pathname.slice(1)), function(err, file) {
                if (err) {
                    response.write(err + ": Szerverhiba");
                } else {
                    response.write(file);
                }
                response.end();
            });

            break;
    };

}).listen(3000);