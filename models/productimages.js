var mongoose = require("mongoose");

var productimgSchema = new mongoose.Schema({
	//filepath : { data : Buffer, contentType : String}
	filepath : String,
	cate_id: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category"
		}
	],
	subcate_id: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "SubCategory"
		}
	]
});



module.exports = mongoose.model("Product", productimgSchema);