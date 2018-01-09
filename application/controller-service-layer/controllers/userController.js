var helper = require('../services/helper.js');
var logger = helper.getLogger('Helper');
var jwt = require('jsonwebtoken');
var hfc = require('fabric-client');


module.exports = function() {
    var getRegisteredUsers = function(req, res, callback) {

        var username = req.body.username;
        var orgName = req.body.orgName;
        logger.debug('End point : /users');
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
        helper.getRegisteredUsers(username, orgName, true).then(function(response) {
            if (response && typeof response !== 'string') {
                response.token = token;
                res.json(response);
            } else {
                res.json({
                    success: false,
                    message: response
                });
            }
        });

        this.services.userService.fetchData(res, callback);
    }



    return {
        getRegisteredUsers: getRegisteredUsers,

    }
};
