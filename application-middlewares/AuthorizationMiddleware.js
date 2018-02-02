/*
 * @author Abhimanyu
 * This module is for the authorization process . Called as middleware function to decide whether user have enough authority to access the 
 */
var helper = require('../application/controller-service-layer/services/helper.js');
var Logger = helper.getLogger('Authentication-Middleware');
var async = require('async');
var jwt = require('jsonwebtoken');
var util = require('util');

var expressJWT = require('express-jwt');
var bearerToken = require('express-bearer-token');

module.exports.jwtSetup = function(app){
    app.set('secret', process.env.SESSION_SECRET);
    
    app.use(expressJWT({
        secret: process.env.SESSION_SECRET
    }).unless({
        path: ['/api/v1/users/fetch', '/api/v1/users']
    }));
    
    app.use(bearerToken());
}

module.exports.AuthorizationMiddleware = (function() {

    /**
     * Verifies for valid usr tokens
     */
    var verifyUserToken = function(){
        return function(req, res, next){
            if (req.originalUrl.indexOf('/api/v1/users') >= 0) {
                return next();
            }
        
            var token = req.token;
            jwt.verify(token, app.get('secret'), function(err, decoded) {
                if (err) {
                    res.send({
                        success: false,
                        message: 'Failed to authenticate token. Make sure to include the ' +
                            'token returned from /users call in the authorization header ' +
                            ' as a Bearer token'
                    });
                    return;
                } else {
                    req.username = decoded.username;
                    req.orgname = decoded.orgName;
                    Logger.debug(util.format('Decoded from JWT token: '));
                    Logger.debug(util.format('username - %s', decoded.username));
                    Logger.debug(util.format('orgName - %s', decoded.orgName));
                    return next();
                }
            });
    
        }
    }

    var verifyUserTokenAndRole = function (accessLevel) {
        // configurationHolder.config.accessLevels[accessLevel]
        return function(req, res, next){
            if (req.originalUrl.indexOf('/api/v1/users') >= 0) {
                return next();
            }
        
            var token = req.token;
            jwt.verify(token, app.get('secret'), function(err, decoded) {
                if (err) {
                    res.send({
                        success: false,
                        message: 'Failed to authenticate token. Make sure to include the ' +
                            'token returned from /users call in the authorization header ' +
                            ' as a Bearer token'
                    });
                    return;
                } else {
                    req.username = decoded.username;
                    req.orgname = decoded.orgName;

                    if(accessLevel.indexOf(decoded.role) > -1){
                        req.authorized = true;
                        Logger.debug(util.format('Decoded from JWT token: '));
                        Logger.debug(util.format('username - %s', decoded.username));
                        Logger.debug(util.format('orgName - %s', decoded.orgName));
                        return next();
                    } else {
                        req.error = new Error("Sorry!! You are not authorized to perform this action.")
                        req.authorized = false;
                        return next();
                    }

                }
            });
        }
    }

    /*
     *  Verify user is authorized to access the functionality or not
     */
    var verifyIsRoleInAccessLevel = function(next, results, res, req, accessLevel) {
        var roleInAccessLevel = configurationHolder.config.accessLevels[accessLevel]
        var authorized = false
        Logger.log("hello" + roleInAccessLevel + accessLevel)
        domain.User.findOne({
            _id: results.authorizationTokenObject.user,
            deleted: false
        }, function(err, userObject) {
            if (userObject) {
                if (roleInAccessLevel.indexOf(userObject.role) > -1) {
                    authorized = true
                    req.loggedInUser = userObject
                    next(results, authorized)
                } else {
                    configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)
                }
            } else {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)

            }
        })
    }

    /*
     * find User and its role using authenticationToken. 
     */
    var findRoleByAuthToken = function(next, results, req, res, authToken) {
        Logger.info("authToken---->" + authToken)
        domain.AuthenticationToken.findOne({
            authToken: authToken
        }, function(err, authObj) {

            if (err || authObj == null) {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)
            } else {
                next(null, authObj)
            }
        })
    }

    /*
     *  call as middleware to decide the accessiblity of the function for the loggedIn user
     *  find user by AuthenticationToken
     *  Decide based on the role of user and accesslevel whether user is authorized or not 
     */
    var authority = function(accessLevel) {
        return function(req, res, next) {
            var authToken = req.get("X-Auth-Token")
                //console.log(authToken+"---------------"+accessLevel)
            if (authToken == null && accessLevel == "anonymous") {
                Logger.info("executed in accesslevel ")
                req.loggedInUser = null
                next()
            } else if (authToken == undefined && accessLevel == "user") {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)
            } else {
                async.auto({
                    authorizationTokenObject: function(next, results) {
                        return findRoleByAuthToken(next, results, req, res, authToken)
                    },
                    isRoleInAccessLevel: ['authorizationTokenObject', function(next, results) {
                        verifyIsRoleInAccessLevel(next, results, res, req, accessLevel)
                    }]
                }, function(err, results) {
                    if (results.isRoleInAccessLevel == true) {
                        next()
                    } else {
                        configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)
                    }
                })
            }
        }
    }

    var updateUserTime = function(next, results, req, res) {
        Logger.info("control in the update user active time" + results.authorizationTokenObject.user);
        var updated = false;
        domain.User.update({
            _id: results.authorizationTokenObject.user
        }, { $set: { lastActiveTime: new Date() } }, function(err, userObject) {
            if (userObject) {
                updated = true;
                next(results, updated);
            } else {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401)
            }
        });

        //        Login.updateOne({name:name},{$set: {role:role,password:password}},
    }

    var lastActiveTime = function() {
            return function(req, res, next) {
                var authToken = req.get("X-Auth-Token");
                Logger.info("authtoken" + authToken);
                if (authToken != "undefined" || authToken != null) {
                    Logger.info("enter in middleware to update the last active time");
                    async.auto({
                        authorizationTokenObject: function(next, results) {
                            return findRoleByAuthToken(next, results, req, res, authToken)
                        },
                        updateLastActiveTime: ['authorizationTokenObject', function(next, results) {
                            updateUserTime(next, results, res, req)
                        }]
                    }, function(err, results) {
                        next();
                    })
                } else {
                    Logger.info("no authToken find so user last active time is not updated");
                    next();
                }
            }

        }
    return {
        verifyUserToken : verifyUserToken,
        verifyUserTokenAndRole: verifyUserTokenAndRole,
        authority: authority,
        lastActiveTime: lastActiveTime
    };
})();
