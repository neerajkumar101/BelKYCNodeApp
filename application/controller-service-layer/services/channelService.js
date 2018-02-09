/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var util = require('util');
var fs = require('fs');
var path = require('path');
// var config = require('../../../app-dlt-configs/config.json');
var helper = require('./helper.js');
var BaseService = require('./BaseService');
// var userService = require('./userService');

var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var tx_id = null;
var nonce = null;

//helper.hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = helper.ORGS;
var allEventhubs = [];

channelService = function(app) {
	this.app = app;
};

channelService.prototype = new BaseService();

//Attempt to send a request to the orderer with the sendCreateChain method
channelService.prototype.createChannel = function(channelName, channelConfigPath, username, orgName) {
	
	var logger = helper.getLogger('Create-Channel');

    // db interaction placed here

	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	var client = helper.getClientForOrg(orgName);
	var channel = helper.getChannelForOrg(orgName);

	// read in the envelope for the channel config raw bytes
	// var envelope = fs.readFileSync(path.join(__dirname, '../', channelConfigPath));
	var envelope = fs.readFileSync(channelConfigPath);
	
	
	// extract the channel config bytes from the envelope to be signed
	var channelConfig = client.extractChannelConfig(envelope);

	//Acting as a client in the given organization provided with "orgName" param
	return helper.getOrgAdmin(orgName).then((admin) => {
	// return app.services.userService.getOrgAdmin(orgName).then((admin) => {	

		logger.debug(util.format('Successfully acquired admin user for the organization "%s"', orgName));
		// sign the channel config bytes as "endorsement", this is required by
		// the orderer's channel creation policy
		let signature = client.signChannelConfig(channelConfig);

		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			orderer: channel.getOrderers()[0],
			// orderer: channel.getOrderers(),			
			txId: client.newTransactionID()
		};

		// send to orderer
		return client.createChannel(request);
	}, (err) => {
		logger.error('Failed to enroll user \''+username+'\'. Error: ' + err);
		throw new Error('Failed to enroll user \''+username+'\'' + err);
	}).then((response) => {
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
			let response = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
		  return response;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			throw new Error('Failed to create the channel \'' + channelName + '\'');
		}
	}, (err) => {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack :
			err);
		throw new Error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
	});



}


channelService.prototype.joinChannel = function(channelName, peers, username, orgName) {

	var logger = helper.getLogger('Join-Channel');

	// on process exit, always disconnect the event hub
	var closeConnections = function(isSuccess) {
		if (isSuccess) {
			logger.debug('\n============ Join Channel is SUCCESS ============\n');
		} else {
			logger.debug('\n!!!!!!!! ERROR: Join Channel FAILED !!!!!!!!\n');
		}
		logger.debug('');
		for (var key in allEventhubs) {
			var eventhub = allEventhubs[key];
			if (eventhub && eventhub.isconnected()) {
				//logger.debug('Disconnecting the event hub');
				eventhub.disconnect();
			}
		}
	};
	//logger.debug('\n============ Join Channel ============\n')
	logger.info(util.format(
		'Calling peers in organization "%s" to join the channel', orgName));

	var client = helper.getClientForOrg(orgName);
	var channel = helper.getChannelForOrg(orgName);
	var eventhubs = [];

	return helper.getOrgAdmin(orgName).then((admin) => {
	// return app.services.userService.getOrgAdmin(orgName).then((admin) => {		
		logger.info(util.format('received member object for admin of the organization "%s": ', orgName));
		tx_id = client.newTransactionID();
		let request = {
			txId : 	tx_id
		};

		return channel.getGenesisBlock(request);
	}).then((genesis_block) => {
		tx_id = client.newTransactionID();
		var request = {
			targets: helper.newPeers(peers, orgName),
			txId: tx_id,
			block: genesis_block
		};

		eventhubs = helper.newEventHubs(peers, orgName);
		for (let key in eventhubs) {
			let eh = eventhubs[key];
			eh.connect();
			allEventhubs.push(eh);
		}

		var eventPromises = [];
		eventhubs.forEach((eh) => {
			let txPromise = new Promise((resolve, reject) => {
				// let handle = setTimeout(reject, parseInt(config.eventWaitTime));
				let handle = setTimeout(reject, parseInt(global.config.eventWaitTime));				
				eh.registerBlockEvent((block) => {
					clearTimeout(handle);
					// in real-world situations, a peer may have more than one channels so
					// we must check that this block came from the channel we asked the peer to join
					if (block.data.data.length === 1) {
						// Config block must only contain one transaction
						var channel_header = block.data.data[0].payload.header.channel_header;
						if (channel_header.channel_id === channelName) {
							resolve();
						}
						else {
							reject();
						}
					}
				});
			});
			eventPromises.push(txPromise);
		});
		let sendPromise = channel.joinChannel(request);
		return Promise.all([sendPromise].concat(eventPromises));
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\' due to error: ' +
			err.stack ? err.stack : err);
		throw new Error('Failed to enroll user \'' + username +
			'\' due to error: ' + err.stack ? err.stack : err);
	}).then((results) => {
		logger.debug(util.format('Join Channel R E S P O N S E : %j', results));
		if (results[0] && results[0][0] && results[0][0].response && results[0][0]
			.response.status == 200) {
			logger.info(util.format(
				'Successfully joined peers in organization %s to the channel \'%s\'',
				orgName, channelName));
			closeConnections(true);
			let response = {
				success: true,
				message: util.format(
					'Successfully joined peers in organization %s to the channel \'%s\'',
					orgName, channelName)
			};
			return response;
		} else {
			logger.error(' Failed to join channel');
			closeConnections();
			throw new Error('Failed to join channel');
		}
	}, (err) => {
		logger.error('Failed to join channel due to error: ' + err.stack ? err.stack :
			err);
		closeConnections();
		// throw new Error('Failed to join channel due to error: ' + err.stack ? err.stack :
		// 	err);
	});


	
}


module.exports = function(app) {
    return new channelService(app);
};




// var createChannel = function() {
	
// };

// exports.createChannel = createChannel;
