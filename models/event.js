var mongoose = require("mongoose");
 
var eventSchema = new mongoose.Schema({
    titulo: {type: String, required: true},
    descricao: String,
    capa: {type: String, default:"/uploads/default.png"},
    fotos: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Image"
        }
    ],
    data_criacao: Date
});

module.exports = mongoose.model("Evento", eventSchema);