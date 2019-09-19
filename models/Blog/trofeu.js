var mongoose = require("mongoose");

var TrofeuSchema = new mongoose.Schema({
imagem: {type:String,default:'/uploads/default.png'},
nome: String
});

module.exports = mongoose.model("Trofeu", TrofeuSchema);