var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

switch(process.env.NODE_ENV){
	case 'development':
	var file = 'network-config-kafka%s.json';
	var confJson = 'config-kafka-development.json';
	break;

	case 'staging':
	var file = 'network-config-kafka-staging%s.json';
	var confJson = 'config-kafka-staging.json';
	break;

	case 'production':
	var file = 'network-config-kafka-production%s.json';
	var confJson = 'config-kafka-production.json';
	break;
	
	default:
	var file = 'network-config-kafka%s.json';
	var confJson = 'config-kafka.json';	
	break;
}

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');


hfc.addConfigFile(path.join(__dirname, '/', file));
hfc.addConfigFile(path.join(__dirname, '/' , confJson));
