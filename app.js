
if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

console.log(process.env)

const express=require("express");

const path=require("path")
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const methodOverride = require('method-override')
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const userRouter = require("./routes/user.js");
const flash = require("connect-flash");
const app = express();
const listings = require("./routes/listing.js")



//const MONGO_URL="mongodb://127.0.0.1:27017/chandana"
const dbUrl = process.env.ATLASDB_URL;


main()
.then(()=>{
    console.log("connected to db");
  })
  .catch((err)=>{
    console.log(err);
  });

  
  async function main() {
    console.log("dbUrl:", dbUrl);
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());


app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
app.use("/",userRouter);
app.use("/listings",listings);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.validPassword(password)) { return done(null, false); }
      return done(null, user);
  });
}));
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
      done(err, user);
  });
});*/

app.listen(8080,()=>{
    console.log("server is listening");
})

/*app.get("/testListing", async (req, res) => {
  try {
    let sampleListings = new Listing({
      title: "..",
      description: "ll",
      price: "1200",
      location: "ggg",
      country: "india"
    });
    await sampleListings.save();
    res.json({ message: "Listing saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while saving the listing" });
  }
});
*/





app.get("/", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("home.ejs", { allListings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the listings" });
  }
});


app.get("/listing", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("home.ejs", { allListings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the listings" });
  }
});

/*app.get("/demouser",async(req,res)=>{
  let fakeuser= new User({
    email: "ss@gmail.com",
    username: "student"
  });
  let registerdUser = await User.register(fakeuser, "helloworld");
  res.send(registerdUser)
})*/


app.get("/listings/new",(req,res)=>{
  res.render("edit.ejs");
})





/*showroute*/
app.get("/listings/:id",async(req,res)=>{
 let  {id}=req.params;
 const allChatt=await Listing.findById(id).populate("reviews");
res.render("show.ejs",{allChatt});

});

app.post("/listings",async (req,res,next)=>{
 
  const newListing=new Listing(req.body.listing);
  //if(!newListing.title){
    
    //throw new ExpressError(404,"no title");
  //}
  await newListing.save();
  console.log("newdata",newListing)
   res.redirect("/listing"); 
  });

  /*edit*/
  app.get("/listings/:id/edit",async(req,res)=>{
    let  {id}=req.params;
    const all=await Listing.findById(id);
    res.render("editt.ejs",{all});
  })

app.put("/listings/:id",async(req,res)=>{
  let  {id}=req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect("/listing");

});

app.delete("/listings/:id",async(req,res)=>{
  let  {id}=req.params;
  let deletedListing=await Listing.findByIdAndDelete(id);
  console.log(deletedListing)
  res.redirect("/listing");
});


app.use((err,req,res,next)=>{
  let{statusCode,message}=err;
  res.render("error.ejs",{message})
});





app.post("/listings/:id/review", async(req,res)=>{
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`)
})


app.delete("/listings/:id/reviews/:reviewId",async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
})



const validateReview = (req,res,next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);

  }else{
    next();
  }
}