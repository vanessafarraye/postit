var mongoose = require("mongoose");

var picSchema = new mongoose.Schema({
	fname: String,
	fpath: String,
	description: String
})

module.exports= picSchema;