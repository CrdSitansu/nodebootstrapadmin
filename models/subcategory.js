var mongoose = require("mongoose");

var subcatSchema = new mongoose.Schema({
	//cate_id : String,
	subcat_name : String,
	cate_id: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category"
		}
	]
	
});



module.exports = mongoose.model("SubCategory", subcatSchema);
