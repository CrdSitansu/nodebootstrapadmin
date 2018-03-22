var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt");

var userSchema = new mongoose.Schema({
	// username : String,
	// password : String
	username: {
    type: String,
    index: true
  },
  password: {
    type: String,
    index: true
  }
	
});

//userSchema.plugin(passportLocalMongoose);



//module.exports = mongoose.model("User", userSchema);

var User = module.exports = mongoose.model("User", userSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(newUser.password, salt, function(err, hash){
			newUser.password = hash;
			newUser.save(callback);
		})
	})
}



module.exports.getUserByUsername = function(username, callback){
	var query = { username:username};
	User.findOne(query,callback);
}

module.exports.getUserById = function(id, callback){
	
	User.findById(id,callback);
}
module.exports.comparePassword = function(candidatePassword, hash ,callback){

		bcrypt.compare(candidatePassword, hash, function(err, isMatch){
			if(err) throw err;
			callback(null, isMatch);
		});
	
}