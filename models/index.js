var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/postit_app");
var multer = require("multer");
module.exports.User = require("./user");
// module.exports.Pic = require("./picture").Pic;


