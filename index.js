var express = require("express"),
    bodyParser = require("body-parser"),
    path = require("path"),
    db = require("./models"),
    fs = require("fs"),
	app = express();

var session = require("express-session");

// somewhere
app.use(session({
  secret: "SUPER STUFF",
  resave: false,
  saveUninitialized: true
}));

var multer = require("multer");
var done = false;  

app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(path.join(__dirname,'/bower_components')));
app.use(bodyParser.urlencoded({extended: true }));

var loginHelpers = function (req, res, next) {
  req.login = function (user) {
    req.session.userId = user._id;
    req.user = user;
    return user;
  };
  req.logout = function () {
    req.session.userId = null;
    req.user  = null;
  };
  req.currentUser = function (cb) {
    var userId = req.session.userId;
    db.User.
      findOne({
        _id: userId
      }, cb);
  };
  // careful to have this
  next(); // real important
};


app.use(loginHelpers)
app.use("/api", function (req, res, next) {
  req.currentUser(function (err, user) {
    if (err) {
      res.redirect("/");
    } else {
      req.user = user;
      next()
    }
  })
});

app.use("/uploads", function (req, res, next) {
  db.User.
    findOne({
      "_id": req.session.userId,
      "pictures.fpath": req.originalUrl
    }, function (err, user) {
      if (!err) {
        res.sendFile(path.join(__dirname, req.originalUrl));
      } else {
        res.send(404, "OOPS!")
      }
    });
})

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file, req, res) {
  console.log(file.originalname + ' is starting ...')
  console.log(req.user);
  if (!req.user) {
    res.redirect("/");
    return false;
  } 
},
onFileUploadComplete: function (file, req, res) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
  console.log("BODY", req.body["img[description]"])
  req.user.pictures.push({
    fname: file.name,
    fpath: file.path,
    description: req.body["img[description]"]
  })
  req.user.save(function (err, user) {
    console.log("SAVED!!!!")
  })
  //res.redirect("/profile")
}
}));

var views = path.join(__dirname, "views");

app.get("/", function (req, res) {
  var homePath = path.join(views, "home.html");
  res.sendFile(homePath);
});

app.get("/signup", function (req, res) {
  var signupPath = path.join(views, "signup.html");
  res.sendFile(signupPath);
});

app.post("/users", function (req, res) {
  var newUser = req.body.user;
  db.User.
  createSecure(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/profile")
    } else {
      res.redirect("/signup");
    }
  });
});

app.post("/", function (req, res) {
  var user = req.body.user;
  db.User.
  authenticate(user,
  function (err, user) {
    if (!err) {
      req.login(user);
      res.redirect("/profile");
    } else {
      console.log(err);
      res.redirect("/");
    }
  });
});

app.get("/profile", function (req, res) {
  // res.send("COMING SOON");
    var profilePath = path.join(views, "profile.html");
    req.currentUser(function (err, user) {
      console.log(user);
      res.sendFile(profilePath);
    }); 
});

app.post("/api/photo",function(req,res){
  if(done==true){
    done=false;
    console.log(req.files);
    res.redirect("/profile");
  } else {
    console.log("error");
  }
});

app.get("/currentUser", function (req, res) {
  req.currentUser(function (err, user) {
    console.log(user)
    res.send(user);
  })
})

app.delete("/pictures/:id", function (req, res){
  console.log('Delete pic with id: ', req.params.id);
  db.User.
    // step 1: find the user id and the picture id
    findOne({
      _id: req.session.userId,
      "pictures._id": req.params.id
    }, function (err, user) {
      // step 2 finding the pic path
      var pic = user.pictures.id(req.params.id);
      var picPath = path.join(__dirname, pic.fpath);
      // step 3 removing the pic from file
      fs.unlinkSync(picPath);
      // step 4 removing the picture from db
      pic.remove();
      user.save(function (err) {
        res.status(204).end("DELETED!");
      })
    })
});

// app.post("/picture/:id", function (req, res){
//   var description = req.body.imgDescription;
//   console.log("here is the description ", description)
//   //res.redirect("/profile");
//   db.User.
//     // step 1: find the user id and the picture id
//     findOne({
//       _id: req.session.userId,
//       "pictures._id": req.params.id
//     }, function (err, user) {
//       // step 2 finding the pic path
//       if (err){ console.log(err) }
//       var pic = user.pictures.id(req.params.id);
//       pic.description = description;
//       pic.save(function (err) {
//         console.log("description saved")
//         res.status(204).end("YAYYY");
//       })
//     })
// });

// app.delete("/currentUser", function (req, res) {
//   db.User.findByIdAndRemove(req.session.userId, 
//     function (err, user) {
//       req.logout();
//       res.status(200).end("Destroyed")
//     });
// })

app.listen(process.env.PORT || 3000) {
  console.log("ready!!!")
}
// app.listen(3000, function () {
//   console.log("Running!");
// });