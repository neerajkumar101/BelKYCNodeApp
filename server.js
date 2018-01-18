global.cors = require('cors');

var express = require('express');
console.log("cors is already running")
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
global.crypto = require('crypto');
global.multipartMiddleware = multipart();
global.app = module.exports = express();

app.options('*', cors());
app.use(cors());

global.errorHandler = require('errorhandler');
global.publicdir = __dirname;
global.async = require('async');
global.path = require('path')
global.router = express.Router();
global.uuid = require('node-uuid');
global.mongooseSchema = mongoose.Schema;
global.configurationHolder = require('./configurations/DependencyInclude.js');
global.domain = require('./configurations/DomainInclude.js');

var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http');
var util = require('util');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

require('./application/controller-service-layer/config.js');
var hfc = require('fabric-client');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');

console.log("configurationHolder", configurationHolder.Bootstrap)
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


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
	secret: 'thisismysecret'
}).unless({
	path: ['/api/v1/users']
}));

app.use(bearerToken());
app.use(function(req, res, next) {
	if (req.originalUrl.indexOf('/api/v1/users') >= 0) {
		return next();
	}

	var token = req.token;
	jwt.verify(token, app.get('secret'), function(err, decoded) {
		if (err) {
			res.send({
				success: false,
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token returned from /users call in the authorization header ' +
					' as a Bearer token'
			});
			return;
		} else {
			// add the decoded user name and org name to the request object
			// for the downstream code to use
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.userName, decoded.orgName));
			return next();
		}
	});
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function() {});
logger.info('****************** SERVER STARTED ************************');
logger.info('**************  http://' + host + ':' + port +
	'  ******************');
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}


global.Layers = require('./application-utilities/layers').Express;
global.wiring = require('./configurations/UrlMapping');
new Layers(app, router, __dirname + '/application/controller-service-layer', wiring);

configurationHolder.Bootstrap.initApp();
