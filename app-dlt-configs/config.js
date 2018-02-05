import { setTimeout } from 'timers';

var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
setTimeout(() =>{
	console.log('set timeout========================================================================');
	console.log(process.env.NODE_ENV);
	console.log('========================================================================');
}, 1000);
console.log('========================================================================');
console.log(path.join(__dirname, '../.env'));
console.log('========================================================================');

switch(process.env.NODE_ENV){
	case 'development':
	var file = 'network-config-development%s.json';
	break;

	case 'staging':
	var file = 'network-config-staging%s.json';	
	break;

	case 'production':
	var file = 'network-config-production%s.json';	
	break;
	
	default:
	var file = 'network-config-development%s.json';	
	break;
}

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');

// hfc.addConfigFile(path.join(__dirname, 'app', file));
// hfc.addConfigFile(path.join(__dirname, '/services/', file));
hfc.addConfigFile(path.join(__dirname, '/', file));
console.log('========================================================================');
console.log(process.env.NODE_ENV);
console.log('========================================================================');
console.log('========================================================================');
console.log(path.join(__dirname, '/', file));
console.log('========================================================================');


switch(process.env.NODE_ENV){
	case 'development':
	hfc.addConfigFile(path.join(__dirname, '/config-development.json'));
	break;

	case 'staging':
	hfc.addConfigFile(path.join(__dirname, '/config-staging.json'));	
	break;

	case 'production':
	hfc.addConfigFile(path.join(__dirname, '/configproduction.json'));	
	break;
	
	default:
	hfc.addConfigFile(path.join(__dirname, '/config-development.json'));	
	break;
}