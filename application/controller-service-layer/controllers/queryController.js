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
        var username = req.body.username;
        var orgname = req.body.orgname;
    
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
        this.services.queryService.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname)
        .then(function(message) {
            res.send(message);
        });

    }

    var queryBlockByNumber = function(req, res, callback) {

        var username = req.body.username;
        var orgname = req.body.orgname;

        logger.debug('==================== GET BLOCK BY NUMBER ==================');

        let blockId = req.params.blockId;
        let peer = req.query.peer;

        logger.debug('channelName : ' + req.params.channelName);
        logger.debug('BlockID : ' + blockId);
        logger.debug('Peer : ' + peer);
        if (!blockId) {
            res.json(getErrorMessage('\'blockId\''));
            return;
        }
    
        this.services.queryService.getBlockByNumber(peer, blockId, username, orgname)
            .then(function(message) {
                res.send(message);
            });
        
    }

    var queryTransactionByID = function(req, res, callback) {

        logger.debug(
            '================ GET TRANSACTION BY TRANSACTION_ID ======================'
        );
        logger.debug('channelName : ' + req.params.channelName);
        let trxnId = req.params.trxnId;
        let peer = req.query.peer;
        var username = req.body.username;
        var orgname = req.body.orgname;

        if (!trxnId) {
            res.json(getErrorMessage('\'trxnId\''));
            return;
        }
    
        this.services.queryService.getTransactionByID(peer, trxnId, username, orgname)
            .then(function(message) {
                res.send(message);
            });
        
    }

    var queryBlockByHash = function(req, res, callback) {
        
        logger.debug('================ GET BLOCK BY HASH ======================');
        logger.debug('channelName : ' + req.params.channelName);
        let hash = req.query.hash;
        let peer = req.query.peer;
        var username = req.body.username;
        var orgname = req.body.orgname;

        if (!hash) {
            res.json(getErrorMessage('\'hash\''));
            return;
        }
    
        this.services.queryService.getBlockByHash(peer, hash, username, orgname).then(
            function(message) {
                res.send(message);
            });

        
    }

    var queryChainInfo = function(req, res, callback) {

        logger.debug(
            '================ GET CHANNEL INFORMATION ======================');
        logger.debug('channelName : ' + req.params.channelName);
        let peer = req.query.peer;
        var username = req.body.username;
        var orgname = req.body.orgname;
    
        this.services.queryService.queryChainInfo(peer, username, orgname).then(
            function(message) {
                res.send(message);
            });       
        
    }

    var queryInstalledChaincodes = function(req, res, callback) {
        
        var peer = req.query.peer;
        var installType = req.query.type;
        var username = req.body.username;
        var orgname = req.body.orgname;

        //TODO: add Constnats
        if (installType === 'installed') {
            logger.debug(
                '================ GET INSTALLED CHAINCODES ======================');
        } else {
            logger.debug(
                '================ GET INSTANTIATED CHAINCODES ======================');
        }
    
        this.services.queryService.getInstalledChaincodes(peer, installType, username, orgname)
        .then(function(message) {
            res.send(message);
        });

    }

    var queryChannels = function(req, res, callback) {

        logger.debug('================ GET CHANNELS ======================');
        logger.debug('peer: ' + req.query.peer);
        var peer = req.query.peer;
        var username = req.body.username;
        var orgname = req.body.orgname;

        if (!peer) {
            res.json(getErrorMessage('\'peer\''));
            return;
        }
    
        this.services.queryService.getChannels(peer, username, orgname)
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
        queryChannels : queryChannels,

    }
};
