//add Roles in the system
// var roles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_SUPPORT']
var roles = ['ROLE_USER', 'ROLE_MERCHANT', 'ROLE_ADMIN', 'ROLE_SUPERADMIN'];

// Add different accessLevels
// var accessLevels = {
//     'anonymous': ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_SUPPORT'],
//     'user': ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_SUPPORT'],
//     'support': ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_SUPPORT'],
//     'admin': ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
//     'superadmin': ['ROLE_SUPERADMIN']
// }
var accessLevels = {
    'user': ['ROLE_USER'],
    'merchant' : [ 'ROLE_MERCHANT'],
    'admin': ['ROLE_ADMIN'],
    'superadmin': ['ROLE_SUPERADMIN']
}
require('dotenv').config({ path: path.join(__dirname, '../.env') });

var configVariables = function() {
    switch (process.env.NODE_ENV) {
        case 'development':
            var config = {
                port: process.env.DEVELOPMENT_SERVER_PORT,
                host: 'http://localhost:' + process.env.DEVELOPMENT_SERVER_PORT + '/api/v1/',
                emailBCC: ''

            }
            config.roles = roles;
            config.accessLevels = accessLevels;
            return config;
            break;

        case 'production':
            var config = {
                port: process.env.PRODUCTION_SERVER_PORT,
                host: 'https://admin.xyz.com/',
                emailBCC: ''

            }

            config.roles = roles;
            config.accessLevels = accessLevels;
            return config;
            break;
        
        case 'staging':
            var config = {
                port: process.env.STAGING_SERVER_PORT,
                host: 'https://staging.xyz.com/',
                emailBCC: ''

            }

            config.roles = roles;
            config.accessLevels = accessLevels;
            return config;
            break;
    }
}


module.exports.configVariables = configVariables;
