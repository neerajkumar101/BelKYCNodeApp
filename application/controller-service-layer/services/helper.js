var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');

var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
// var crypto = require('crypto');
var caService = require('fabric-ca-client');
var randomStringGenerator = require("randomstring");

var hfc = require('fabric-client');
hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');

var clients = {};
var channels = {};
var caClients = {};

var jwt = require('jsonwebtoken');

// set up the client and channel objects for each org
for (let key in ORGS) {
	if (key.indexOf('org') === 0) {
		let client = new hfc();

		let cryptoSuite = hfc.newCryptoSuite();
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(ORGS[key].name)}));
		client.setCryptoSuite(cryptoSuite);

		let channel = client.newChannel(hfc.getConfigSetting('channelName'));
		channel.addOrderer(newOrderer(client));
		
		// for(let ordr in ORGS.orderer){
		// 	channel.addOrderer(newOrderer(client, ordr));
			
		// }
		

		clients[key] = client;
		channels[key] = channel;

		setupPeers(channel, key, client);

		let caUrl = ORGS[key].ca;
		caClients[key] = new caService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, cryptoSuite);
	}
}

var readReplaceJSONObjectFieldValue = function(JSONFileDir, JSONFile, objectFieldKeyToChangeValue, changeValueWith, callback) {
	fs.readFile( JSONFileDir + JSONFile, "utf8", (err, data) => {
		if (err) calback(err, null);
		var jsondata = JSON.parse(data);
		console.log(jsondata);
		if(jsondata[objectFieldKeyToChangeValue] != undefined){

			jsondata[objectFieldKeyToChangeValue] = changeValueWith;
			console.log(objectFieldKeyToChangeValue +', '+ jsondata);
			callback(null, true);
		} else{
			callback(null, false);			
		}
	});
}

function setupPeers(channel, org, client) {
	for (let key in ORGS[org].peers) {
		// let data = fs.readFileSync(path.join(__dirname, ORGS[org].peers[key]['tls_cacerts']));
		let data = fs.readFileSync(ORGS[org].peers[key]['tls_cacerts']);		
		let peer = client.newPeer(
			ORGS[org].peers[key].requests,
			{
				pem: Buffer.from(data).toString(),
				'ssl-target-name-override': ORGS[org].peers[key]['server-hostname']
			}
		);
		peer.setName(key);

		channel.addPeer(peer);
	}
}

// function newOrderer(client, ordr) {
function newOrderer(client) {	
	// var caRootsPath = ORGS.orderer[ordr].tls_cacerts;
	var caRootsPath = ORGS.orderer.tls_cacerts;	
	// let data = fs.readFileSync(path.join(__dirname, caRootsPath));
	let data = fs.readFileSync(caRootsPath);
	
	let caroots = Buffer.from(data).toString();
	// return client.newOrderer(ORGS.orderer[ordr].url, {
	return client.newOrderer(ORGS.orderer.url, {		
		'pem': caroots,
		// 'ssl-target-name-override': ORGS.orderer[ordr]['server-hostname']
		'ssl-target-name-override': ORGS.orderer['server-hostname']		
	});
}

// function newOrderer(client) {
// 	var caRootsPath = ORGS.orderer.tls_cacerts;
// 	// let data = fs.readFileSync(path.join(__dirname, caRootsPath));
// 	let data = fs.readFileSync(caRootsPath);
	
// 	let caroots = Buffer.from(data).toString();
// 	return client.newOrderer(ORGS.orderer.url, {
// 		'pem': caroots,
// 		'ssl-target-name-override': ORGS.orderer['server-hostname']
// 	});
// }

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir,file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}

function getOrgName(org) {
	return ORGS[org].name;
}

function getKeyStoreForOrg(org) {
	return hfc.getConfigSetting('keyValueStore') + '_' + org;
}

function newRemotes(names, forPeers, userOrg) {
	let client = getClientForOrg(userOrg);

	let targets = [];
	// find the peer that match the names
	for (let idx in names) {
		let peerName = names[idx];
		if (ORGS[userOrg].peers[peerName]) {
			// found a peer matching the name
			// let data = fs.readFileSync(path.join(__dirname, ORGS[userOrg].peers[peerName]['tls_cacerts']));
			let data = fs.readFileSync(ORGS[userOrg].peers[peerName]['tls_cacerts']);			
			let grpcOpts = {
				pem: Buffer.from(data).toString(),
				'ssl-target-name-override': ORGS[userOrg].peers[peerName]['server-hostname']
			};

			if (forPeers) {
				targets.push(client.newPeer(ORGS[userOrg].peers[peerName].requests, grpcOpts));
			} else {
				let eh = client.newEventHub();
				eh.setPeerAddr(ORGS[userOrg].peers[peerName].events, grpcOpts);
				targets.push(eh);
			}
		}
	}

	if (targets.length === 0) {
		logger.error(util.format('Failed to find peers matching the names %s', names));
	}

	return targets;
}

//-------------------------------------//
// APIs
//-------------------------------------//

var generateUserToken = function(username, orgName, email, role, callback){
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName,
		email: email,
		role: role
	}, app.get('secret'));
	
	callback(null, token);
}

var getChannelForOrg = function(org) {
	return channels[org];
};

var getClientForOrg = function(org) {
	return clients[org];
};

var newPeers = function(names, org) {
	return newRemotes(names, true, org);
};

var newEventHubs = function(names, org) {
	return newRemotes(names, false, org);
};

var getMspID = function(org) {
	logger.debug('Msp ID : ' + ORGS[org].mspid);
	return ORGS[org].mspid;
};

var getAdminUser = function(userOrg) {
	var users = hfc.getConfigSetting('admins');
	var username = users[0].username;
	var password = users[0].secret;
	var member;
	var client = getClientForOrg(userOrg);

	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(username, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				// need to enroll it with CA server
				return caClient.enroll({
					enrollmentID: username,
					enrollmentSecret: password
				}).then((enrollment) => {
					logger.info('Successfully enrolled user \'' + username + '\'');
					client;
					member = new User(username);
					member.setCryptoSuite(client.getCryptoSuite());
					return member.setEnrollment(enrollment.key, enrollment.certificate, getMspID(userOrg));
				}).then(() => {
					return client.setUserContext(member);
				}).then(() => {
					return member;
				}).catch((err) => {
					logger.error('Failed to enroll and persist user. Error: ' + err.stack ?
						err.stack : err);
					return null;
				});
			}
		});
	}).catch(function(err){
		throw new Error(err.stack ? err.stack :	err);
	});
};

var getRegisteredUsers = function(username, userOrg, email, role, isJson, jwtToken) {
	var member;
	var client = getClientForOrg(userOrg);
	var enrollmentSecret = null;
	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(username, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				return getAdminUser(userOrg).then(function(adminUserObj) {
					member = adminUserObj;
					return caClient.register({
						enrollmentID: username,
						affiliation: userOrg + '.department1'
					}, member);
				}).then((secret) => {
					enrollmentSecret = secret;
					logger.debug(username + ' registered successfully');
					return caClient.enroll({
						enrollmentID: username,
						enrollmentSecret: secret
					});
				}, (err) => {
					logger.debug(username + ' failed to register');
					return '' + err;
					//return 'Failed to register '+username+'. Error: ' + err.stack ? err.stack : err;
				}).then((message) => {
					if (message && typeof message === 'string' && message.includes(
							'Error:')) {
						logger.error(username + ' enrollment failed');
						return message;
					}
					logger.debug(username + ' enrolled successfully');

					member = new User(username);
					member._enrollmentSecret = enrollmentSecret;
					return member.setEnrollment(message.key, message.certificate, getMspID(userOrg));
				}).then(() => {
					client.setUserContext(member);
				
					//retrieving public key for saving it to the database
					getPublicKeyFromUsername(username, userOrg)
					.then(function(publicKey){
						persistUser(username, userOrg, email, role, member.secret, jwtToken, publicKey, (err, result) => {
							if(err) throw err;
						});
					}).catch(function(err){
						console.log('error is persisting the user to database : ' + err);
						throw new Error(err.stack ? err.stack :	err);
					});											
					return member;
				}, (err) => {
					logger.error(util.format('%s enroll failed: %s', username, err.stack ? err.stack : err));
					return '' + err;
				});;
			}
		});
	}).then((user) => {

		if (isJson && isJson === true) {
			var response = {
				success: true,
				secret: user._enrollmentSecret,
				message: username + ' enrolled Successfully',
			};
			return response;
		}
		return user;
	}, (err) => {
		logger.error(util.format('Failed to get registered user: %s, error: %s', username, err.stack ? err.stack : err));
		return '' + err;
	});
};

var getOrgAdmin = function(userOrg) {
	var admin = ORGS[userOrg].admin;

	// var keyPath = path.join(__dirname, admin.key);
	var keyPath = admin.key;	

	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();

	// var certPath = path.join(__dirname, admin.cert);
	var certPath = admin.cert;	

	var certPEM = readAllFiles(certPath)[0].toString();

	var client = getClientForOrg(userOrg);
	var cryptoSuite = hfc.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(getOrgName(userOrg))}));
		client.setCryptoSuite(cryptoSuite);
	}

	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);

		return client.createUser({
			username: 'peer'+userOrg+'Admin',
			mspid: getMspID(userOrg),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			}
		});
	}).catch(function(err){
		throw new Error(err.stack ? err.stack :	err);
	});
};

var getPublicKeyFromUsername = function(username, userOrg, callback){
	return new Promise(function(resolve, reject){
		new Promise(function(resolve, reject){
			fs.readFile(getKeyStoreForOrg(getOrgName(userOrg)) + '/' + username, "utf8", (err, data) => {
				if (err) throw err;
				var jsondata = JSON.parse(data);
				var identity = jsondata.enrollment.signingIdentity;
				resolve(identity);
			});
		}).then(function(identity){
			new Promise(function(resolve, reject){
				fs.readFile(path.join(process.env.HOME, '/.hfc-key-store/', identity + '-pub'), "utf-8", (err, data) => {
					if (err) throw err;
					// var jsondata = JSON.parse(data);
					console.log(data);
					resolve(data);					
				});
			}).then(function(data){
				resolve(data);
			});
		}).catch(function(err){
			throw new Error(err.stack ? err.stack :	err);
		});
	});	
}

var setupChaincodeDeploy = function() {
	// process.env.GOPATH = path.join(__dirname, '../', hfc.getConfigSetting('CC_SRC_PATH'));
	process.env.GOPATH = hfc.getConfigSetting('CC_SRC_PATH');	
};

var getLogger = function(moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

var persistUser = function(username, userOrg, email, role,  secret, jwt, pubKey, callback) {
	var userData = new domain.User({
		uuid : randomStringGenerator.generate(),
		username: username,
		userOrg: userOrg, 
		roleOfUser : role,
		email: email,
		password: secret,
		jwtHash: jwt,
		pubKey: pubKey
	});

	userData.save(function(err, result) {
		if (err) {
			console.log("errs", err);
			callback(err, null)
		} else {
			callback(null, result);
		}
	});
}

var getUserPublicKeyByUuid = function (uuid, callback){	
		var query = domain.User.findOne({ 'uuid': uuid });
		query.select('pubKey');
		query.exec(function (err, result) {
		  if (err) callback(err, null);
			  
		  purifyPublicKey(result.pubKey, (err, publicKey) => {
			  if(err) callback(err, null);
		  
			result.pubKey = publicKey;
		  	callback(null, result);
		  });
		  callback(null, result);
		});
}

var purifyPublicKey = function(pubKey, callback) {
	pubKey = pubKey.replace('-----BEGIN PUBLIC KEY-----', '')
	.replace('-----END PUBLIC KEY-----', '')
	.replace(/(\r\n|\n|\r)/gm, '');

	callback(null, pubKey);
}

var getUserJwtHashPublicKeyByNameAndOrg = function (username, userOrg){
	return new Promise(function(resolve, reject){
		var query = domain.User.findOne({ 'username': username });
		query.select('jwtHash pubKey');
		query.exec(function (err, result) {
		  if (err) reject(err);
		  resolve(result);
		});
	});
}

exports.getChannelForOrg = getChannelForOrg;
exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getMspID = getMspID;
exports.ORGS = ORGS;
exports.newPeers = newPeers;
exports.newEventHubs = newEventHubs;
exports.getRegisteredUsers = getRegisteredUsers;
exports.getOrgAdmin = getOrgAdmin;
exports.getUserPublicKeyByUuid = getUserPublicKeyByUuid;
exports.generateUserToken = generateUserToken;
// exports.envirnmentSetup = envirnmentSetup;
