var hfc = require('fabric-client');
var helper = require('../services/helper.js');
var Logger = helper.getLogger('Helper');

module.exports = function() {
    var registerUsers = function(req, res, callback) {

        var username = req.body.username;
        var orgName = req.body.orgName;
        var email = req.body.email;
        var role = req.body.role;
        Logger.debug('End point : /api/v1/users');
        Logger.debug('User name : ' + username);
        Logger.debug('Org name  : ' + orgName);
        if (!username) {
            res.json(getErrorMessage('\'username\''));
            return;
        }
        if (!orgName) {
            res.json(getErrorMessage('\'orgName\''));
            return;
        }
        if (!email) {
            res.json(getErrorMessage('\'email\''));
            return;
        }
        if (!role) {
            res.json(getErrorMessage('\'role\''));
            return;
        }

        helper.generateUserToken(username, orgName, email, role, (err, token) =>{
            if(err) 
                throw new Error(err.stack ? err.stack :	err);

                helper.getRegisteredUsers(username, orgName, email, role, true, token).then(function(response) {
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
        });
    }

    var getUserPublicKeyByUuid = function (req, res, callback) {
        var uuid = req.params.uuid;
        Logger.debug('Fetch End point : /api/v1/publicKeys/fetch/:uuid');
        if (!uuid) {
            res.json(getErrorMessage('\'uuid\''));
            return;
        }
        // if(req.authorized != undefined && req.authorized == true){
        helper.getUserPublicKeyByUuid(uuid, (err, message) => {
            if(err) throw new Error(err.stack ? err.stack :	err);

            res.send(message);
        });
        // } else {
        //     res.send(req.error.message);
        // }
    }

    return {
        registerUsers: registerUsers,
        getUserPublicKeyByUuid: getUserPublicKeyByUuid
    }
};
