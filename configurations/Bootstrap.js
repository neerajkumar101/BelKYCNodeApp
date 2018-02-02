    var initApp = function() {
        // console.log("config" + configurationHolder.config.accessLevels["anonymous"]);
        // createSuperAdmin()
        bootApplication();

    }

    // function createSuperAdmin() {
    //     var saltString = uuid.v1()
    //     var password = crypto.createHmac('sha1', saltString).update("xyz").digest('hex')

    //     domain.User.findOne({
    //         email: 'superadmin@jeenees.com',
    //         deleted: false
    //     }, function(err, doc) {
    //         if (!err && doc == null) {
    //             var superAdminUser = new domain.User({
    //                 fullName: 'SuperAdmin',
    //                 email: '',
    //                 salt: saltString,
    //                 password: password,

    //             })

    //             superAdminUser.save(function(err, user) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     bootApplication()
    //                 }
    //             })
    //         } else {
    //             bootApplication()
    //         }
    //     });
    // }


    // code to start the server
    function bootApplication() {
        console.log("Express server listening on port %d in %s mode");
        console.log("loading files succesfully")

        // app.listen(3003, function() {
        switch (process.env.NODE_ENV) {
            case 'development':
                console.log('Runtime environment is:' + process.env.NODE_ENV);
                console.log("Server started on port " + process.env.DEVELOPMENT_SERVER_PORT + " ...")                   
                app.listen(process.env.DEVELOPMENT_SERVER_PORT, function() {
                    
                });
            return;
            break;

            case 'production':
                console.log('Runtime environment is:' + process.env.NODE_ENV);
                console.log("Server started on port " + process.env.PRODUCTION_SERVER_PORT + " ...")
                app.listen(process.env.PRODUCTION_SERVER_PORT, function() {
                    
                });
            return;
            break;

            case 'staging':
                console.log('Runtime environment is:' + process.env.NODE_ENV);
                console.log("Server started on port " + process.env.STAGING_SERVER_PORT + " ...")
                app.listen(process.env.STAGING_SERVER_PORT, function() {
                    
                });
            return;
            break;
        }   
    }

    module.exports.initApp = initApp
