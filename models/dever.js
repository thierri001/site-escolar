var mongoose = require("mongoose");
 
var deverSchema = new mongoose.Schema({
    date: Date,
    texto: String
});

module.exports = mongoose.model("Dever", deverSchema);