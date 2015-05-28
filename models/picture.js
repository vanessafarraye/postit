var mongoose = require("mongoose");

var picSchema = new mongoose.Schema({
	fname: {
		type: String,
		require: true
	},
	fpath: {
		type: String,
		require: true
	},
	description: { 
		type: String,
		default: ""
	}
})

module.exports= picSchema;