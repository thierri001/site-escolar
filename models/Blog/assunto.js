var mongoose = require("mongoose");

var AssuntoSchema = new mongoose.Schema({
    icone:String,
    assunto:{type:String,unique:true}
});

var handleE11000 = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
      next(new Error("Por favor, escolha outro título para o assunto!"));
    } else {
      next();
    }
};

AssuntoSchema.post('save', handleE11000);
AssuntoSchema.post('update', handleE11000);
AssuntoSchema.post('findOneAndUpdate', handleE11000);
AssuntoSchema.post('insertMany', handleE11000);

module.exports = mongoose.model("Assunto", AssuntoSchema);