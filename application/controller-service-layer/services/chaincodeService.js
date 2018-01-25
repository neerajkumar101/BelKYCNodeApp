var path = require('path');
var fs = require('fs');
var util = require('util');
// var config = require('../config.json');
var helper = require('./helper.js');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var ORGS = hfc.getConfigSetting('network-config');
var tx_id = null;
var eh = null;

var BaseService = require('./BaseService');

chaincodeService = function(app) {
    this.app = app;
};
 var userService = require('./userService');

chaincodeService.prototype = new BaseService();

//=================================Installing Chaincode===========================================
chaincodeService.prototype.installChaincode = function(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgName) {

    var logger = helper.getLogger('install-chaincode');

    logger.debug(
        '\n============ Install chaincode on organizations ============\n');
    helper.setupChaincodeDeploy();
    var channel = helper.getChannelForOrg(orgName);
    var client = helper.getClientForOrg(orgName);

    return helper.getOrgAdmin(orgName).then((user) => {
    // return app.services.userService.getOrgAdmin(orgName).then((user) => {        
        var request = {
            targets: helper.newPeers(peers, orgName),
            chaincodePath: chaincodePath,
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion
        };
        return client.installChaincode(request);
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('install proposal was good');
            } else {
                logger.error('install proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Successfully sent install Proposal and received ProposalResponse: Status - %s',
                proposalResponses[0].response.status));
            logger.debug('\nSuccessfully Installed chaincode on organization ' + orgName +
                '\n');
            return 'Successfully Installed chaincode on organization ' + orgName;
        } else {
            logger.error(
                'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send install proposal due to error: ' + err.stack ?
            err.stack : err);
        throw new Error('Failed to send install proposal due to error: ' + err.stack ?
            err.stack : err);
    });

};

chaincodeService.prototype.instantiateChaincode = function(channelName, chaincodeName, chaincodeVersion, functionName, args, username, orgName) {

    var logger = helper.getLogger('instantiate-chaincode');

    logger.debug('\n============ Instantiate chaincode on organization ' + orgName +
    ' ============\n');

    var channel = helper.getChannelForOrg(orgName);
    var client = helper.getClientForOrg(orgName);

    return helper.getOrgAdmin(orgName).then((user) => {
    // return app.services.userService.getOrgAdmin(orgName).then((user) => {        
        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((success) => {
        tx_id = client.newTransactionID();
        // send proposal to endorser
        var request = {
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion,
            args: args,
            txId: tx_id
        };

        if (functionName)
            request.fcn = functionName;

        return channel.sendInstantiateProposal(request);
    }, (err) => {
        logger.error('Failed to initialize the channel');
        throw new Error('Failed to initialize the channel');
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('instantiate proposal was good');
            } else {
                logger.error('instantiate proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                .signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            eh = client.newEventHub();
            // let data = fs.readFileSync(path.join(__dirname, ORGS[orgName].peers['peer1']['tls_cacerts']));
            let data = fs.readFileSync(ORGS[orgName].peers['peer1']['tls_cacerts']);            
            eh.setPeerAddr(ORGS[orgName].peers['peer1']['events'], {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[orgName].peers['peer1']['server-hostname']
            });
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(deployId, (tx, code) => {
                    logger.info(
                        'The chaincode instantiate transaction has been committed on peer ' +
                        eh._ep._endpoint.addr);
                    clearTimeout(handle);
                    eh.unregisterTxEvent(deployId);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        logger.error('The chaincode instantiate transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        logger.info('The chaincode instantiate transaction was valid.');
                        resolve();
                    }
                });
            });

            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat([txPromise])).then((results) => {
                logger.debug('Event promise all complete and testing complete');
                return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
            }).catch((err) => {
                logger.error(
                    util.format('Failed to send instantiate transaction and get notifications within the timeout period. %s', err)
                );
                return 'Failed to send instantiate transaction and get notifications within the timeout period.';
            });
        } else {
            logger.error(
                'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send instantiate proposal due to error: ' + err.stack ?
            err.stack : err);
        return 'Failed to send instantiate proposal due to error: ' + err.stack ?
            err.stack : err;
    }).then((response) => {
        if (response.status === 'SUCCESS') {
            logger.info('Successfully sent transaction to the orderer.');
            return 'Chaincode Instantiation is SUCCESS';
        } else {
            logger.error('Failed to order the transaction. Error code: ' + response.status);
            return 'Failed to order the transaction. Error code: ' + response.status;
        }
    }, (err) => {
        logger.error('Failed to send instantiate due to error: ' + err.stack ? err
            .stack : err);
        
        return 'Failed to send instantiate due to error: ' + err.stack ? err.stack :
            err;
    });


};

chaincodeService.prototype.invokeChaincode = function(peerNames, channelName, chaincodeName, fcn, args, username, orgName) {

    var logger = helper.getLogger('invoke-chaincode');

    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', orgName));
    var client = helper.getClientForOrg(orgName);
    var channel = helper.getChannelForOrg(orgName);
    var targets = (peerNames) ? helper.newPeers(peerNames, orgName) : undefined;
    var tx_id = null;
    var res = null;
    
    return helper.getRegisteredUsers(username, orgName).then((user) => {
    // return app.services.userService.getRegisteredUsers(username, orgName).then((user) => {        
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%j"', tx_id));
        // send proposal to endorser
        var request = {
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        if (targets)
            request.targets = targets;

        // logger.debug(channel.sendTransactionProposal(request));
        return channel.sendTransactionProposal(request);
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('transaction proposal was good');
            } else {
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug('=====message begin======');
            logger.debug(proposalResponses[0].response.message);
            logger.debug(proposalResponses[0].response.payload);
            logger.debug('=====message end========');
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                .signature));
            res = proposalResponses[0].response.payload;
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            if (!peerNames) {
                peerNames = channel.getPeers().map(function(peer) {
                    return peer.getName();
                });
            }

            var eventhubs = helper.newEventHubs(peerNames, orgName);
            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            logger.error(
                                'The balance transfer transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            logger.info(
                                'The balance transfer transaction has been committed on peer ' +
                                eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            };
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                logger.debug(' event promise all complete and testing complete');
                logger.debug(results);
                return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
            }).catch((err) => {
                logger.error(
                    'Failed to send transaction and get notifications within the timeout period.'
                );
                return 'Failed to send transaction and get notifications within the timeout period.';
            });
        } else {
            logger.error(
                'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
            err;
    }).then((response) => {
        if (response.status === 'SUCCESS') {
            logger.info('Successfully sent transaction to the orderer.');
            return res;
        } else {
            logger.error('Failed to order the transaction. Error code: ' + response.status);
            return 'Failed to order the transaction. Error code: ' + response.status;
        }
    }, (err) => {
        logger.error('Failed to send transaction due to error: ' + err.stack ? err
            .stack : err);
        return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
            err;
    });


};


module.exports = function(app) {
    return new chaincodeService(app);
};