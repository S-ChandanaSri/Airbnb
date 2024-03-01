
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MONGO_URL = "mongodb://127.0.0.1:27017/chandana";

/*
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}*/

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description:
  {
type:String,
  } ,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
    type:Schema.Types.ObjectId,
    ref:"Review",
  },
],
owner:{
  type:Schema.Types.ObjectId,
  ref:"User",
}
});

const Listing = mongoose.model("Listing", listingSchema);



module.exports = Listing;