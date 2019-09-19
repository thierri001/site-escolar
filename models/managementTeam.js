var mongoose = require("mongoose");
 
var textSchema = new mongoose.Schema({
    título: String,
    gestor: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Gestor"
    }
});

module.exports = mongoose.model("EquipeGestora", textSchema);