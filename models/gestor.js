var mongoose = require("mongoose");
 
var gestorSchema = new mongoose.Schema({
        nome: String,
        url: {type: String, default:"/uploads/default.png"}
});

module.exports = mongoose.model("Gestor", gestorSchema);