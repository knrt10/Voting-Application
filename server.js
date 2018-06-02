// create a database connection string 

var db = 'mongodb://localhost:27017/free-code-camp-voting';

// create a port for server to listen
var port = process.env.PORT || 8080;

//Load in router

var router = require("./routes/api");

// Load in modules that we require

var express = require("express");
var morgan  = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dotenv = require("dotenv");
var http = require("http");

// create express application
var app = express();

// Load in  env (environment) variables

dotenv.config({ verbose : true });

// Connect to mongodb
mongoose.connect(db,(err)=>{
    if(err){
        console.log(err);
    }
});

// Listen to mongoose connection events

mongoose.connection.on('connected',()=>{
    console.log("successfully connected to " + db);
});

mongoose.connection.on('disconnected',()=>{
    console.log("successfully disconnected from " + db);
});

mongoose.connection.on('error',()=>{
    console.log("error connecting to " + db);
});

// configure xpress middleware

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use('/node_modules',express.static(__dirname + 'node_modules'));
app.use(express.static(__dirname + "/public"));
app.use('/api',router);
app.get("*",(req,res)=>{
    res.sendFile(__dirname + "/public/index.html");
});

// start a server
app.listen(port,  ()=> {
	console.log('Node.js listening on port ' + port + '...');
});

console.log(process.env.secret);