var helper = require('../services/helper.js');
var logger = helper.getLogger('Helper');
var jwt = require('jsonwebtoken');
var hfc = require('fabric-client');


module.exports = function() {
    var getRegisteredUsers = function(req, res, callback) {

        var userName = req.body.userName;
        var orgName = req.body.orgName;
        logger.debug('End point : /api/v1/users');
        logger.debug('User name : ' + userName);
        logger.debug('Org name  : ' + orgName);
        if (!userName) {
            res.json(getErrorMessage('\'userName\''));
            return;
        }
        if (!orgName) {
            res.json(getErrorMessage('\'orgName\''));
            return;
        }
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
            userName: userName,
            orgName: orgName
        }, app.get('secret'));
        helper.getRegisteredUsers(userName, orgName, true).then(function(response) {
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

    }

    return {
        getRegisteredUsers: getRegisteredUsers,
    }
};
