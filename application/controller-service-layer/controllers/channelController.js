var helper = require('../services/helper.js');

module.exports = function() {
    var createChannel = function(req, res, callback) {

        var logger = helper.getLogger('Create-Channel');

        logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
        logger.debug('End point : /channels');
        var channelName = req.body.channelName;
        var channelConfigPath = req.body.channelConfigPath;
        var username = req.body.username;
        var orgname = req.body.orgname;


        logger.debug('Channel name : ' + channelName);
        logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!channelConfigPath) {
            res.json(getErrorMessage('\'channelConfigPath\''));
            return;
        }
    
        this.services.channelService.createChannel(channelName, channelConfigPath, username, orgname, callback)
        .then(function(message) {
            res.send(message);
        });

        // callback(null, "allset");

    };

    var joinChannel = function(req, res, callback) {
        
        var logger = helper.getLogger('Join-Channel');

        
        logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
        var channelName = req.params.channelName;
        var peers = req.body.peers;
        var username = req.body.username;
        var orgname = req.body.orgname;

        logger.debug('channelName : ' + channelName);
        logger.debug('peers : ' + peers);
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!peers || peers.length == 0) {
            res.json(getErrorMessage('\'peers\''));
            return;
        }
    
        this.services.channelService.joinChannel(channelName, peers, username, orgname)
        .then(function(message) {
            res.send(message);
        });

        //callback(null, "allset");

    };

    return {
        createChannel: createChannel,
        joinChannel: joinChannel,
    }

};
