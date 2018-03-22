var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    storage = multer.diskStorage({
			  destination: function (req, file, cb) {
			    cb(null, 'public/uploads')
			  },
			  filename: function (req, file, cb) {
			    var filename = file.originalname;
			    var filenameparts = filename.split('.');
			    cb(null, file.fieldname + '-' + Date.now() + '.' +filenameparts[1])
			  }
			}),
    upload = multer({ storage: storage }).single('files'),
     User = require('./models/user'),
    Category = require("./models/category"),
    SubCategory = require("./models/subcategory"),
    Product = require("./models/productimages")




mongoose.connect("mongodb://localhost/firstadmindemo");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     var filename = file.originalname;
//     var filenameparts = filename.split('.');
//     cb(null, file.fieldname + '-' + Date.now() + '.' +filenameparts[1])
//   }
// })

// var upload = multer({ storage: storage }).single('files')



app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("./public/"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
/*---Passport Configaration  */

app.use(require("express-session")({

	secret : "Roami is very sweet",
	resave : false,
	saveUninitialized : false 

}));



app.use(passport.initialize());
app.use(passport.session());
//passport.use(new LocalStrategy(User.authenticate()));
// passport.use(new LocalStrategy({
//     usernameField: 'username',
//   },User.authenticate()));
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());



app.get('/login', function(req,res){

	res.render("login");

});

app.get('/registration', function(req,res){

	res.render("registration");

});

app.post('/register', function(req,res){

		
	var newUser = new User({username:req.body.useremail, password :req.body.password});
	console.log(newUser);
	 User.createUser(newUser, function(err,user){
		 if(err) throw err; 
		 	console.log(err);
		 	console.log(user);
		 	//return res.render("registration");
	});	//console.log(user);
	res.redirect('/login');

});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err,user){
    	if(err) throw err;
    	if(!user){
    		return done(null, false);
    	}
    User.comparePassword(password,user.password, function(err, isMatch){
    		if(err) throw err;
    	if(isMatch){
    		return done(null, user);
    	}else {
    		return done(null, false);
    	}
    });
    });
      
}));

passport.serializeUser(function(user,done){
	done(null, user.id);
});

passport.deserializeUser(function(id,done){
	User.getUserById(id, function(err,user){
		done(err,user);
	});
});


app.post('/logedin', 
	passport.authenticate('local',{successRedirect:'/dashboard',failureRedirect:'/login'})
	,function(req, res){
		//var username=new User({username:req.body.username});
		res.redirect('/dashboard');
});

app.get('/logout', function(req,res){
		req.logout();
		res.redirect('/login');

});

function isLoggedIn(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		res.redirect("/login");
}


app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});


app.get('/dashboard', isLoggedIn, function(req,res){
	//console.log(req.user);
	res.render("index",{currentUser:req.user});

});

app.get('/addcategory', isLoggedIn, function(req,res){

	res.render("category_add",{currentUser:req.user});

});

app.post('/addcategoryform', isLoggedIn, function(req,res){
	var cate_name = req.body.cate_name;
	var catobj = {cate_name: cate_name}
	//res.render("category_add");

	Category.create(catobj, function(err,newcategorydata){
			if(err){
				console.log(err);
			} else {
				//console.log("Data Inserted: ");
				//console.log(empdata);
				res.redirect("/category",{currentUser:req.user});
			}

		});
		

});


app.get('/category', isLoggedIn, function(req,res){

	Category.find({}, function(err, allcatlist){
		if(err){
			console.log(err);
		}else{
			res.render("category", {catname : allcatlist, currentUser:req.user});
		}
	})
	//res.render("category");

});


app.get("/categoryedit/:id/edit", isLoggedIn, function(req, res){

	Category.findById(req.params.id, function(err, foundcat){

		if(err){
			console.log(err);
		}else{
			res.render("selectcategory", {selectid : foundcat, currentUser:req.user});
		}
	})
	//res.render("showdetails")
});



app.put("/editcategoryform/:id", isLoggedIn, function(req, res){

	    var cate_name = req.body.cate_name;
		
		var newdata = {cate_name: cate_name}

	Category.findByIdAndUpdate(req.params.id, newdata, function(err, updatecateg){
		if(err){
			console.log(err);
		}else{

			res.redirect("/category");
		}
	})

});


app.delete("/deletcategory/:id", function(req,res){

	Category.findByIdAndRemove(req.params.id, function(err, deletedcategory){
		if(err){
			console.log(err);
		}else{

			res.redirect("/category");
		}
	})

});

app.get('/subcategory', function(req,res){
	//console.log(req);
	SubCategory.find({}).populate('cate_id').exec(function(err,subcatlist){
		if(err){
			console.log(err);
		}else{
			//console.log(JSON.stringify(subcatlist,false,2));
			res.render("subcategory", {subcatlist});
			
		}
	})
	
});


app.get('/addsubcategory', function(req,res){

	Category.find({}, function(err, allcatlist){
		if(err){
			console.log(err);
		}else{
			res.render("subcategory_add", {catname : allcatlist});
		}
	})
	//res.render("subcategory_add");

});



app.post('/addsubcategoryform', function(req,res){
	var cate_id = req.body.cat_id;
	var subcat_name = req.body.subcat_name;
	var subcatobj = {cate_id: cate_id, subcat_name: subcat_name}
	//res.render("category_add");

	SubCategory.create(subcatobj, function(err,newsubcategorydata){
			if(err){
				console.log(err);
			} else {
				//console.log("Data Inserted: ");
				//console.log(newsubcategorydata);
				res.redirect("/subcategory");
			}

		});
		

});


app.get("/subcategoryedit/:id/edit", isLoggedIn, function(req, res){

	SubCategory.findById(req.params.id).populate('cate_id').exec(function(err, allcatsubcat){

		if(err){
			console.log(err);
		}else{
			//console.log(allcatsubcat);
		   Category.find({}, function(err, allcatlist){
			if(err){
				console.log(err);
			}else{
				//console.log(allcatlist);
				res.render("subcategoryedit", {allcatsubcat ,allcatlist});
			  }
		    });
		}

	});
});
	


app.put("/updatesubcategory/:id", isLoggedIn, function(req, res){

	    var cate_id = req.body.cat_id;
	    var subcat_name = req.body.subcat_name;
	    var subcatobj = {cate_id: cate_id, subcat_name: subcat_name}
 
	SubCategory.findByIdAndUpdate(req.params.id, subcatobj, function(err, updatesubcat){
		if(err){
			console.log(err);
		}else{

			res.redirect("/subcategory");
		}
	})

});




app.delete("/deletsubcategory/:id", function(req,res){

	SubCategory.findByIdAndRemove(req.params.id, function(err, deletedsubcategory){
		if(err){
			console.log(err);
		}else{

			res.redirect("/subcategory");
		}
	})

});

app.get('/addimage', isLoggedIn, function(req,res){
	Category.find({}, function(err, allcatlist){
		if(err){
			console.log(err);
		}else{
			res.render("imageadd", {catname : allcatlist});
		}
	})
	//res.render("imageadd");

	
});

// ajax call //

app.get('/getsubcat', function(req,res){
	
	
	var getcateid= req.query.categoryId;
	//console.log(getcateid);
	
	//SubCategory.find({}).populate({path :'cate_id',match:{ _id :{$gte : 5a735233538bd422d83e1ad0}} ,select:'name -_id'}).exec(function(err,ajaxsubcatlist){
		
			SubCategory.find({}).populate('cate_id').exec(function(err,ajaxsubcatlist){
		if(err){
			console.log(err);
		}else{

			//console.log(JSON.stringify(ajaxsubcatlist,false,2));
			res.render("filtersubcategory", {ajaxsubcatlist,getcateid});
			
		}
	})
	//res.send(getsubcat);'/getsubcat?categoryId=5a735233538bd422d83e1ad0'

});



app.post('/add_photo', upload, (req, res) => {
  	var filepath = req.file.destination.substr(7) + '/' + req.file.filename;
  	var cate_id = req.body.cat_id;
	var subcate = req.body.subcat_id;
	
  	var fileobj = {filepath: filepath, cate_id:cate_id, subcate_id:subcate }
	
	//console.log(JSON.stringify(subcate,false,2));
	Product.create(fileobj, function(err,newproductdata){
			if(err){
				console.log(err);
			} else {
				//console.log("Data Inserted: ");
				//console.log(filepath);
				//console.log(newproductdata);
				res.redirect("/imagelist");
				//res.render("allimage");
			}

		});
	
    
});

app.get('/imagelist', isLoggedIn, function(req,res){

	Product.find({}).populate('cate_id').populate('subcate_id').exec(function(err, allimglist){
		if(err){
			console.log(err);
		}else{
			//console.log(allimglist);
			//console.log(JSON.stringify(allimglist,false,2));
			res.render("allimage", {imgpath : allimglist, currentUser:req.user});
		}
	})
	
});

app.get("/productimgedit/:id/edit", isLoggedIn, function(req, res){

	Product.findById(req.params.id).populate('cate_id').populate('subcate_id').exec(function(err, findproductimg){

		if(err){
			console.log(err);
		}else{
			Category.find({}, function(err, allcatlist){
				if(err){
					console.log(err);
				}else{
					SubCategory.find({}).populate('cate_id').exec(function(err, allsubcatlist){
						if(err){
							console.log(err);
						}else{
							 //console.log(JSON.stringify(allsubcatlist,false,2));
							// console.log(typeof findproductimg);
							// console.log(typeof allcatlist);
							// console.log(JSON.stringify(findproductimg.cate_id).toString);
							//res.render("subcategoryedit", {allcatsubcat ,allcatlist});
							res.render("selectproduct", {selectimgid : findproductimg,allcatlist,allsubcatlist});
						  }
					})
					
				  }
			})  
			//console.log(findproductimg);
			//res.render("selectproduct", {selectimgid : findproductimg, currentUser:req.user});
		}
	})
	//res.render("showdetails")
});


app.put("/edit_photo/:id", upload, function(req, res){

	    var filepath = req.file.destination.substr(7) + '/' + req.file.filename;
		var cate_id = req.body.cat_id;
	    var subcate = req.body.subcat_id;
	    var oldimg = req.body.old;
	 		var fileobj = {filepath: filepath, cate_id:cate_id, subcate_id:subcate}
		
		if(req.file.destination == 'undefined' || filepath == ''){
			var fileobj = {filepath: oldimg,cate_id:cate_id, subcate_id:subcate}
		}else{
			var fileobj = {filepath: filepath, cate_id:cate_id, subcate_id:subcate}
		}
		console.log(req.file.filename);
		console.log(req.file.destination);
		console.log(filepath);

	Product.findByIdAndUpdate(req.params.id, fileobj, function(err, updateproductimg){
		if(err){
			console.log(err);
		}else{
			//console.log(updateproductimg);
			res.redirect("/imagelist");
		}
	})

});





app.delete("/deletimage/:id", function(req,res){

	Product.findByIdAndRemove(req.params.id, function(err, deletedimage){
		if(err){
			console.log(err);
		}else{

			res.redirect("/imagelist");
		}
	})

});




















var server = app.listen(8081, function(){

	var host = server.address().address;
	var port = server.address().port;
	console.log("Example app listening at http://%s:%s", host, port);
});