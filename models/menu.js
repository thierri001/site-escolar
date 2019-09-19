var mongoose = require("mongoose");

var menuSchema = new mongoose.Schema({
        nome: {type: String, required: true, unique: true},
        url: {type: String},
        ordem: {type:Number, default:50},
        plataformas: {type:Boolean,default:false}
});

var handleE11000 = function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error("Por favor, escolha outro nome!"));
  } else {
    next();
  }
};

menuSchema.statics.findMenu = function (pesquisa,callback) {
  this.find(pesquisa)
  .sort({'ordem':1})
  .exec(callback);
}

menuSchema.post('save', handleE11000);
menuSchema.post('update', handleE11000);
menuSchema.post('findOneAndUpdate', handleE11000);
menuSchema.post('insertMany', handleE11000);

module.exports = mongoose.model("Menu", menuSchema);