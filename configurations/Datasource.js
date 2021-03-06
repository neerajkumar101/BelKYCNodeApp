  // var options = {
  //     user: 'supersuser',
  //     pass: 'xyz
  // };
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  
  var getDbConnection = function() {
      switch (process.env.NODE_ENV) {
          case 'development':
              var db = mongoose.connect('mongodb://localhost/BelPrivDatabase');
              return checkMongooseConnection(db);
              break;

          case 'production':
              var db = mongoose.connect('mongodb://localhost/BelPrivDatabase', options);
              return checkMongooseConnection(db);
              break;

          case 'staging':
              var db = mongoose.connect('mongodb://localhost/BelPrivDatabase');
              return checkMongooseConnection(db);
              break;
      }
  }


  // function to check connection to database server
  function checkMongooseConnection(db) {
      mongoose.connection.on('open', function(ref) {
          console.log('Connected to mongo server.');
          return db
      });
      mongoose.connection.on('error', function(err) {
          console.log('Could not connect to mongo server!');
          console.log(err);
      });
  }

  module.exports.getDbConnection = getDbConnection;
