var mongoose = require("mongoose");
 
var textSchema = new mongoose.Schema({
    name: String,
    cargo: String,
    imagem: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Image"
    }
});

module.exports = mongoose.model("Gestor", textSchema);