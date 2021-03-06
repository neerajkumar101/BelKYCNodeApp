var helper = require('../services/helper.js');
var logger = helper.getLogger('Query');

module.exports = function() {
    var queryChaincode = function(req, res, callback) {

        logger.debug('==================== QUERY BY CHAINCODE ==================');
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        let args = req.query.args;
        let fcn = req.query.fcn;
        let peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;
    
        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);
    
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
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);
        this.services.queryService.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgName)
        .then(function(message) {
            res.send(message);
        });

    }
    /**
     * 
     */
    var queryBlockByNumber = function(req, res, callback) {

        logger.debug('==================== GET BLOCK BY NUMBER ==================');

        let blockId = req.params.blockId;
        let peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;

        logger.debug('channelName : ' + req.params.channelName);
        logger.debug('BlockID : ' + blockId);
        logger.debug('Peer : ' + peer);
        if (!blockId) {
            res.json(getErrorMessage('\'blockId\''));
            return;
        }
    
        this.services.queryService.queryBlockByNumber(peer, blockId, username, orgName)
            .then(function(message) {
                res.send(message);
            });
        
    }

    /**
     * 
     */
    var queryTransactionByID = function(req, res, callback) {

        logger.debug(
            '================ GET TRANSACTION BY TRANSACTION_ID ======================'
        );
        logger.debug('channelName : ' + req.params.channelName);
        let trxnId = req.params.trxnId;
        let peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;

        if (!trxnId) {
            res.json(getErrorMessage('\'trxnId\''));
            return;
        }
    
        this.services.queryService.queryTransactionByID(peer, trxnId, username, orgName)
            .then(function(message) {
                res.send(message);
            });
        
    }
    /**
     * 
     */
    var queryBlockByHash = function(req, res, callback) {
        
        logger.debug('================ GET BLOCK BY HASH ======================');
        logger.debug('channelName : ' + req.params.channelName);
        let hash = req.query.hash;
        let peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;

        if (!hash) {
            res.json(getErrorMessage('\'hash\''));
            return;
        }
    
        this.services.queryService.queryBlockByHash(peer, hash, username, orgName).then(
            function(message) {
                res.send(message);
            });

        
    }

    /**
     * 
     */
    var queryChainInfo = function(req, res, callback) {

        logger.debug(
            '================ GET CHANNEL INFORMATION ======================');
        logger.debug('channelName : ' + req.params.channelName);
        let peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;
    
        this.services.queryService.queryChainInfo(peer, username, orgName).then(
            function(message) {
                res.send(message);
            });       
        
    }

    /**
     * 
     */
    var queryInstalledChaincodes = function(req, res, callback) {
        var peer = req.query.peer;
        var installType = req.query.type;
        var username = req.user.username;
        var orgName = req.user.orgName;

        //TODO: add Constnats
        if (installType === 'installed') {
            logger.debug(
                '================ GET INSTALLED CHAINCODES ======================');
        } else {
            logger.debug(
                '================ GET INSTANTIATED CHAINCODES ======================');
        }
    
        this.services.queryService.queryInstalledChaincodes(peer, installType, username, orgName)
        .then(function(message) {
            res.send(message);
        });

    }

    /**
     * 
     */
    var queryChannels = function(req, res, callback) {

        logger.debug('================ GET CHANNELS ======================');
        logger.debug('peer: ' + req.query.peer);
        var peer = req.query.peer;
        var username = req.user.username;
        var orgName = req.user.orgName;

        if (!peer) {
            res.json(getErrorMessage('\'peer\''));
            return;
        }
    
        this.services.queryService.queryChannels(peer, username, orgName)
        .then(function(
            message) {
            res.send(message);
        });

    }
    
    

    return {
        queryChaincode: queryChaincode,
        queryBlockByNumber : queryBlockByNumber,
        queryTransactionByID : queryTransactionByID,
        queryBlockByHash : queryBlockByHash,
        queryChainInfo : queryChainInfo,
        queryInstalledChaincodes : queryInstalledChaincodes,
        queryChannels : queryChannels
    }
};
