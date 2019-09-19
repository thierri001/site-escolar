var mongoose = require("mongoose");
 
var contatoSchema = new mongoose.Schema({
    telefone1: String,
    telefone2: String,
    telefone3: String,
    email: String,
    fb: String,
    yt: String,
    ig: String,
    location: String,
    lat: Number,
    lng: Number
});

module.exports = mongoose.model("Contato", contatoSchema);