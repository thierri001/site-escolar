var mongoose = require("mongoose");
 
var equipeSchema = new mongoose.Schema({
    titulo: String,
    gestores:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gestor"
    }],
    ordem: {type:Number,default:1000}
});

module.exports = mongoose.model("Equipe", equipeSchema);