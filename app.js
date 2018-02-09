global.cors = require('cors');
var express = require('express');

//Blockchain configs
require('./app-dlt-configs/config.js');

switch(process.env.NODE_ENV){
    case 'development':
    global.config = require('./app-dlt-configs/config-kafka.json');
	break;

    case 'staging':
    global.config = require('./app-dlt-configs/config-kafka-staging.json');    
	break;

    case 'production':
    global.config = require('./app-dlt-configs/config-kafka-production.json');    
	break;
	
    default:
    global.config = require('./app-dlt-configs/config-kafka.json');    
	break;
}

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

global.projectDir = __dirname;
global.environmentDir = path.join(projectDir , '../');


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

// var envirnmentSetup = require('./application/controller-service-layer/services/helper.js').envirnmentSetup;
// envirnmentSetup(process.env.NODE_ENV);


global.Layers = require('./application-utilities/layers').Express;
global.wiring = require('./configurations/UrlMapping');
new Layers(app, router, __dirname + '/application/controller-service-layer', wiring);

configurationHolder.Bootstrap.initApp();
