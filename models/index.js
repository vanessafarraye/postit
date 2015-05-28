var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/postit_app");
var multer = require("multer");
module.exports.User = require("./user");
mongoose.connect( process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL || 
               "mongodb://localhost/postit_app");
// module.exports.Pic = require("./picture").Pic;


