var mongoose = require("mongoose");
 
var textSchema = new mongoose.Schema({
    titulo: String,
    descricao: String
});

module.exports = mongoose.model("Institucional", textSchema);