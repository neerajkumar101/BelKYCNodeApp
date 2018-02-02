module.exports = function(app) {
	var controllers = app.controllers,
		views = app.views;

	return {

		"/api/v1/users": [{
			method: "POST",
			action: app.controllers.userController.registerUsers,
			middleware: [],
			views: {
				json: views.jsonView
			}
		}],
		"/api/v1/users/fetch": [{
			method: "GET",
			action: app.controllers.userController.getUserPublicKeyByUuid,
			middleware: [], 
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels": [{
			method: "GET",
			action: app.controllers.queryController.queryChannels,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		},
		{
			method: "POST",
			action: app.controllers.channelController.createChannel,
			middleware: [], //configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/peers": [{
			method: "POST",
			action: app.controllers.channelController.joinChannel,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/chaincodes": [{
			method: "GET",
			action: app.controllers.queryController.queryInstalledChaincodes,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		},
		{
			method: "POST",
			action: app.controllers.chaincodeController.installChaincode,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/chaincodes": [{
			method: "POST",
			action: app.controllers.chaincodeController.instantiateChaincode,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/chaincodes/:chaincodeName": [{
			method: "POST",
			action: app.controllers.chaincodeController.invokeChaincode,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		},
		{
			method: "GET",
			action: app.controllers.queryController.queryChaincode,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/blocks/:blockId": [{
			method: "GET",
			action: app.controllers.queryController.queryBlockByNumber,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/transactions/:trxnId": [{
			method: "GET",
			action: app.controllers.queryController.queryTransactionById,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName/blocks": [{
			method: "GET",
			action: app.controllers.queryController.queryBlockByHash,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],
		
		"/api/v1/channels/:channelName": [{
			method: "GET",
			action: app.controllers.queryController.queryChainInfo,
			middleware: [configurationHolder.security.verifyUserTokenAndRole('ROLE_USER')],
			views: {
				json: views.jsonView
			}
		}],		
	};
};
