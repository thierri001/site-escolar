var mongoose = require("mongoose");

var CategoriaSchema = new mongoose.Schema({
    categoria:String,
    icone:String,
    assuntos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assunto'
    }],
    ordem: {type:Number, default:50}
});

module.exports = mongoose.model("Categoria", CategoriaSchema);