var helper = require('../services/helper.js');

module.exports = function() {
    var installChaincode = function(req, res, callback) {

        var logger = helper.getLogger('install-chaincode');


        logger.debug('==================== INSTALL CHAINCODE ==================');
        var peers = req.body.peers;
        var chaincodeName = req.body.chaincodeName;
        var chaincodePath = req.body.chaincodePath;
        var chaincodeVersion = req.body.chaincodeVersion;
        var userName = req.user.userName;
        var orgName = req.user.orgName;


        logger.debug('peers : ' + peers); // target peers list
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('chaincodePath  : ' + chaincodePath);
        logger.debug('chaincodeVersion  : ' + chaincodeVersion);
        if (!peers || peers.length == 0) {
            res.json(getErrorMessage('\'peers\''));
            return;
        }
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!chaincodePath) {
            res.json(getErrorMessage('\'chaincodePath\''));
            return;
        }
        if (!chaincodeVersion) {
            res.json(getErrorMessage('\'chaincodeVersion\''));
            return;
        }

        this.services.chaincodeService.installChaincode(peers, chaincodeName, chaincodePath,
            chaincodeVersion, userName, orgName).then(function(message) {
            res.send(message);
        });

        // callback(null, "allset");

        
    }

    var instantiateChaincode = function(req, res, callback) {

        var logger = helper.getLogger('instantiate-chaincode');

        logger.debug('==================== INSTANTIATE CHAINCODE ==================');
        var chaincodeName = req.body.chaincodeName;
        var chaincodeVersion = req.body.chaincodeVersion;
        var channelName = req.params.channelName;
        var userName = req.user.userName;
        var orgName = req.user.orgName;

        var fcn = req.body.fcn;
        var args = req.body.args;
        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('chaincodeVersion  : ' + chaincodeVersion);
        logger.debug('fcn  : ' + fcn);
        logger.debug('args  : ' + args);
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!chaincodeVersion) {
            res.json(getErrorMessage('\'chaincodeVersion\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        this.services.chaincodeService.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, userName, orgName)
        .then(function(message) {
            res.send(message);
        });


        // callback(null, "allset");    

    }

    var invokeChaincode = function(req, res, callback) {

        var logger = helper.getLogger('invoke-chaincode');

        logger.debug('==================== INVOKE ON CHAINCODE ==================');
        var peers = req.body.peers;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;
        var userName = req.user.userName;
        var orgName = req.user.orgName;

        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : ' + fcn);
        logger.debug('args  : ' + args);
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
    
        this.services.chaincodeService.invokeChaincode(peers, channelName, chaincodeName, fcn, args, userName, orgName)
        .then(function(message) {
            let json = message.toString('utf-8');
            if(json.payload){
            json.payload.data = json.payload.data.toString('utf8');
            logger.debug(json.payload.data);		
            res.send(json.payload.data);
            }		
            logger.debug("success");
            // res.send("success");
            res.send(message);            
        });

        // callback(null, "allset");
    
    }

    return {
        installChaincode: installChaincode,
        instantiateChaincode : instantiateChaincode,
        invokeChaincode : invokeChaincode,
    }
};
