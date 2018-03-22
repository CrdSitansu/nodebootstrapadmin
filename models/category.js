var mongoose = require("mongoose");

var catSchema = new mongoose.Schema({
	cate_name : String
	
});



module.exports = mongoose.model("Category", catSchema);