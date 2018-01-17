var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Query');

var BaseService = require('./BaseService');

queryService = function(app) {
    this.app = app;
};

queryService.prototype = new BaseService();

queryService.prototype.queryChaincode = function(peer, channelName, chaincodeName, args, fcn, userName, orgName) {
    
    var channel = helper.getChannelForOrg(orgName);
	var client = helper.getClientForOrg(orgName);
	var target = buildTarget(peer, orgName);
	return helper.getRegisteredUsers(userName, orgName).then((user) => {
		tx_id = client.newTransactionID();
		// send query
		var request = {
			chaincodeId: chaincodeName,
			txId: tx_id,
			fcn: fcn,
			args: args
		};
		logger.debug('printing transaction id start');		
		logger.debug(request.txId);
		logger.debug('printing transaction id end');
		return channel.queryByChaincode(request, target);
	}, (err) => {
		logger.info('Failed to get submitter \''+userName+'\'');
		return 'Failed to get submitter \''+userName+'\'. Error: ' + err.stack ? err.stack :
			err;
	}).then((response_payloads) => {
		if (response_payloads) {
			for (let i = 0; i < response_payloads.length; i++) {
				logger.info(args[0]+' now has ' + response_payloads[i].toString('utf8') +
					' after the move');
				return args[0]+' now has ' + response_payloads[i].toString('utf8') +
					' after the move';
			}
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to end to end test with error:' + err.stack ? err.stack :
			err);
		return 'Failed to end to end test with error:' + err.stack ? err.stack :
			err;
	});
}

queryService.prototype.queryBlockByNumber = function(peer, blockNumber, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);

	return helper.getRegisteredUsers(userName, orgName).then((member) => {
		return channel.queryBlock(parseInt(blockNumber), target);
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			//logger.debug(response_payloads);
			logger.debug(response_payloads);
			return response_payloads; //response_payloads.data.data[0].buffer;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});

}

queryService.prototype.queryTransactionByID = function(peer, trxnID, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);

	return helper.getRegisteredUsers(userName, orgName).then((member) => {
		return channel.queryTransaction(trxnID, target);
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			logger.debug(response_payloads);
			return response_payloads;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
    
}
queryService.prototype.queryBlockByHash = function(peer, hash, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);

	return helper.getRegisteredUsers(userName, orgName).then((member) => {
		return channel.queryBlockByHash(Buffer.from(hash), target);
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response_payloads) => {
		if (response_payloads) {
			logger.debug(response_payloads);
			return response_payloads;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
    
}
queryService.prototype.queryChainInfo = function(peer, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);

	return helper.getRegisteredUsers(userName, orgName).then((member) => {
		return channel.queryInfo(target);
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((blockchainInfo) => {
		if (blockchainInfo) {
			// FIXME: Save this for testing 'getBlockByHash'  ?
			logger.debug('===========================================');
			logger.debug(blockchainInfo.currentBlockHash);
			logger.debug('===========================================');
			//logger.debug(blockchainInfo);
			return blockchainInfo;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
    
}
queryService.prototype.queryInstalledChaincodes = function(peer, type, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);
	var client = helper.getClientForOrg(orgName);

	return helper.getOrgAdmin(orgName).then((member) => {
		if (type === 'installed') {
			return client.queryInstalledChaincodes(target);
		} else {
			return channel.queryInstantiatedChaincodes(target);
		}
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
			}
			return details;
		} else {
			logger.error('response is null');
			return 'response is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
    
}
queryService.prototype.queryChannels = function(peer, userName, orgName){

    var target = buildTarget(peer, orgName);
	var channel = helper.getChannelForOrg(orgName);
	var client = helper.getClientForOrg(orgName);

	return helper.getRegisteredUsers(userName, orgName).then((member) => {
		//channel.setPrimaryPeer(targets[0]);
		return client.queryChannels(target);
	}, (err) => {
		logger.info('Failed to get submitter "' + userName + '"');
		return 'Failed to get submitter "' + userName + '". Error: ' + err.stack ?
			err.stack : err;
	}).then((response) => {
		if (response) {
			logger.debug('<<< channels >>>');
			var channelNames = [];
			for (let i = 0; i < response.channels.length; i++) {
				channelNames.push('channel id: ' + response.channels[i].channel_id);
			}
			logger.debug(channelNames);
			return response;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to query with error:' + err.stack ? err.stack : err);
		return 'Failed to query with error:' + err.stack ? err.stack : err;
	});
    
}

function buildTarget(peer, orgName) {
	var target = null;
	if (typeof peer !== 'undefined') {
		let targets = helper.newPeers([peer], orgName);
		if (targets && targets.length > 0) target = targets[0];
	}

	return target;
}


module.exports = function(app) {
    return new queryService(app);
};