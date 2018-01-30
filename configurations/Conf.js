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

var configVariables = function() {
    switch (process.env.NODE_ENV) {
        case 'development':
            var config = {
                port: 4000,
                host: 'http://localhost:4000/',
                emailBCC: ''

            }
            config.roles = roles
            config.accessLevels = accessLevels
            return config;

        case 'production':
            var config = {
                port: 4000,
                host: 'https://admin.xyz.com/',
                emailBCC: ''

            }

            config.roles = roles
            config.accessLevels = accessLevels
            return config;

        case 'staging':
            var config = {
                port: 4000,
                host: 'https://staging.xyz.com/',
                emailBCC: ''

            }

            config.roles = roles
            config.accessLevels = accessLevels
            return config;

    }
}


module.exports.configVariables = configVariables;
