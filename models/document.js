var mongoose = require("mongoose");

var documentSchema = new mongoose.Schema({
        nome: {type: String, required: true, unique: true},
        url: {type: String},
        regramento: {type:Boolean,default:false}
});

var handleE11000 = function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error("Por favor, escolha outro nome!"));
  } else {
    next();
  }
};

documentSchema.post('save', handleE11000);
documentSchema.post('update', handleE11000);
documentSchema.post('findOneAndUpdate', handleE11000);
documentSchema.post('insertMany', handleE11000);

module.exports = mongoose.model("Document", documentSchema);