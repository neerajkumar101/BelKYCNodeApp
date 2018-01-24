var helper = require('../services/helper.js');
var logger = helper.getLogger('Helper');
var jwt = require('jsonwebtoken');
var hfc = require('fabric-client');

module.exports = function() {
    var registerUsers = function(req, res, callback) {

        var username = req.body.username;
        var orgName = req.body.orgName;
        logger.debug('End point : /api/v1/users');
        logger.debug('User name : ' + username);
        logger.debug('Org name  : ' + orgName);
        if (!username) {
            res.json(getErrorMessage('\'username\''));
            return;
        }
        if (!orgName) {
            res.json(getErrorMessage('\'orgName\''));
            return;
        }
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
            username: username,
            orgName: orgName
        }, app.get('secret'));

        helper.getRegisteredUsers(username, orgName, true, token).then(function(response) {
        // this.services.userService.getRegisteredUsers(username, orgName, true).then(function(response) {
            
            if (response && typeof response !== 'string') {
                response.token = token;
                res.json(response);
            } else {
                res.json({
                    success: false,
                    message: response
                });
            }
        }).catch(function(err){
            throw new Error(err.stack ? err.stack :	err);
        });

    }

    // function persistUser(req, res, callback){
    //     this.services.userService.persistUser(callback);
    // }

    function getUserByUuid (req, res, callback) {

        var uuid = req.params.uuid;

        logger.debug('Fetch End point : /api/v1/users/:uuid');
        
        if (!uuid) {
            res.json(getErrorMessage('\'uuid\''));
            return;
        }
        helper.getUserByUuid(req.query.uuid)
        .then(function(message){
            res.send(message);
        }).catch(function(err){
            throw new Error(err.stack ? err.stack :	err);
        });
    }

    return {
        registerUsers: registerUsers,
        // persistUser: persistUser,
        getUserByUuid: getUserByUuid
    }
};
