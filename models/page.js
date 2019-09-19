var mongoose = require("mongoose");
 
var textSchema = new mongoose.Schema({
    name: {type:String, unique:true, required:true},
    html: String
});

var handleE11000 = function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error("Por favor, escolha outro título para a página!"));
  } else {
    next();
  }
};

textSchema.post('save', handleE11000);
textSchema.post('update', handleE11000);
textSchema.post('findOneAndUpdate', handleE11000);
textSchema.post('insertMany', handleE11000);


module.exports = mongoose.model("Page", textSchema);