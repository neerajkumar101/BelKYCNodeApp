global.cors = require('cors');
var express = require('express');

require('./app-dlt-configs/config.js');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');

global.crypto = require('crypto');
global.multipartMiddleware = multipart();
global.app = module.exports = express();

app.options('*', cors());
app.use(cors());

global.errorHandler = require('errorhandler');
// global.publicdir = __dirname;
global.async = require('async');
global.path = require('path');
global.router = express.Router();
global.uuid = require('node-uuid');
global.mongooseSchema = mongoose.Schema;
global.configurationHolder = require('./configurations/DependencyInclude.js');
global.domain = require('./configurations/DomainInclude.js');

//now the env variables are available throughout the application without using any import
require('dotenv').config({ path: __dirname + '/.env' });

var hfc = require('fabric-client');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');

app.use(errorHandler());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,X-Auth-Token");
    next();
});

//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));

var jwtSetup = require('./application-middlewares/AuthorizationMiddleware.js').jwtSetup;
jwtSetup(app);

global.Layers = require('./application-utilities/layers').Express;
global.wiring = require('./configurations/UrlMapping');
new Layers(app, router, __dirname + '/application/controller-service-layer', wiring);

configurationHolder.Bootstrap.initApp();
