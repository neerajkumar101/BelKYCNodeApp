//import { setTimeout } from 'timers';

var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

// switch(process.env.NODE_ENV){
// 	case 'development':
// 	var file = 'network-config-development%s.json';
// 	break;

// 	case 'staging':
// 	var file = 'network-config-staging%s.json';	
// 	break;

// 	case 'production':
// 	var file = 'network-config-production%s.json';	
// 	break;
	
// 	default:
// 	var file = 'network-config-development%s.json';	
// 	break;
// }

	var file = 'network-config-kafka%s.json';
	// var file = 'network-config-development%s.json';


var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');

// hfc.addConfigFile(path.join(__dirname, 'app', file));
// hfc.addConfigFile(path.join(__dirname, '/services/', file));
hfc.addConfigFile(path.join(__dirname, '/', file));

// switch(process.env.NODE_ENV){
// 	case 'development':
// 	hfc.addConfigFile(path.join(__dirname, '/config-development.json'));
// 	break;

// 	case 'staging':
// 	hfc.addConfigFile(path.join(__dirname, '/config-staging.json'));	
// 	break;

// 	case 'production':
// 	hfc.addConfigFile(path.join(__dirname, '/configproduction.json'));	
// 	break;
	
// 	default:
// 	hfc.addConfigFile(path.join(__dirname, '/config-development.json'));	
// 	break;
// }

	hfc.addConfigFile(path.join(__dirname, '/config-kafka.json'));
	// hfc.addConfigFile(path.join(__dirname, '/config.json'));
	