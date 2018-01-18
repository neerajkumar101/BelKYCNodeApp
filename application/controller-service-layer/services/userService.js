var log4js = require('log4js');
var logger = log4js.getLogger('User');
logger.setLevel('User');

var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');
var copService = require('fabric-ca-client');
var helper = require('./helper.js');

var hfc = require('fabric-client');
hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');

var clients = {};
var channels = {};
var caClients = {};

var BaseService = require('./BaseService');

userService = function(app) {
    this.app = app;
};

userService.prototype = new BaseService();

userService.prototype.saveUser = function(callback) {

    // db interaction placed here
    // var getRegisteredUsers = function(userName, userOrg, isJson) {
        var userData = new domain.User({
            fullName: "mobile",
            email: "vgh@g.com",
            password: "5678765456765rfvbhgfdc",
            mobile:876545678

        });
        console.log("ss-------------------", userData);

        userData.save(function(err, result) {
            if (err) {
                console.log("errs", err)
                callback(err, null)
            } else {
                console.log("next ")
                callback(null, result)
            }
        });

}

var getAdminUser = function(userOrg) {
	var users = hfc.getConfigSetting('admins');
	var userName = users[0].userName;
	var password = users[0].secret;
	var member;
	var client = helper.getClientForOrg(userOrg);

	return hfc.newDefaultKeyValueStore({
		path: helper.getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(userName, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				// need to enroll it with CA server
				return caClient.enroll({
					enrollmentID: userName,
					enrollmentSecret: password
				}).then((enrollment) => {
					logger.info('Successfully enrolled user \'' + userName + '\'');
					member = new User(userName);
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
	});
};

userService.prototype.getRegisteredUsers = function(userName, userOrg, isJson) {
	var member;
	var client = helper.getClientForOrg(userOrg);
	var enrollmentSecret = null;
	return hfc.newDefaultKeyValueStore({
		path: helper.getKeyStoreForOrg(helper.getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(userName, true).then((user) => {
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				let caClient = caClients[userOrg];
				return getAdminUser(userOrg).then(function(adminUserObj) {
					member = adminUserObj;
					return caClient.register({
						enrollmentID: userName,
						affiliation: userOrg + '.department1'
					}, member);
				}).then((secret) => {
					enrollmentSecret = secret;
					logger.debug(userName + ' registered successfully');
					return caClient.enroll({
						enrollmentID: userName,
						enrollmentSecret: secret
					});
				}, (err) => {
					logger.debug(userName + ' failed to register');
					return '' + err;
					//return 'Failed to register '+userName+'. Error: ' + err.stack ? err.stack : err;
				}).then((message) => {
					if (message && typeof message === 'string' && message.includes(
							'Error:')) {
						logger.error(userName + ' enrollment failed');
						return message;
					}
					logger.debug(userName + ' enrolled successfully');

					member = new User(userName);
					member._enrollmentSecret = enrollmentSecret;
					return member.setEnrollment(message.key, message.certificate, helper.getMspID(userOrg));
				}).then(() => {
					client.setUserContext(member);
					return member;
				}, (err) => {
					logger.error(util.format('%s enroll failed: %s', userName, err.stack ? err.stack : err));
					return '' + err;
				});;
			}
		});
	}).then((user) => {
		if (isJson && isJson === true) {
			var response = {
				success: true,
				secret: user._enrollmentSecret,
				message: userName + ' enrolled Successfully',
			};
			return response;
		}
		return user;
	}, (err) => {
		logger.error(util.format('Failed to get registered user: %s, error: %s', userName, err.stack ? err.stack : err));
		return '' + err;
	});
};

userService.prototype.getOrgAdmin = function(userOrg) {
	var admin = ORGS[userOrg].admin;
	var keyPath = path.join(__dirname, admin.key);
	var keyPEM = Buffer.from(helper.readAllFiles(keyPath)[0]).toString();
	var certPath = path.join(__dirname, admin.cert);
	var certPEM = helper.readAllFiles(certPath)[0].toString();

	var client = helper.getClientForOrg(userOrg);
	var cryptoSuite = hfc.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: helper.getKeyStoreForOrg(helper.getOrgName(userOrg))}));
		client.setCryptoSuite(cryptoSuite);
	}

	return hfc.newDefaultKeyValueStore({
		path: helper.getKeyStoreForOrg(helper.getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);

		return client.createUser({
			username: 'peer'+userOrg+'Admin',
			mspid: helper.getMspID(userOrg),
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			}
		});
	});
};

module.exports = function(app) {
    return new userService(app);
};

// module.exports = userService.prototype.getRegisteredUsers
