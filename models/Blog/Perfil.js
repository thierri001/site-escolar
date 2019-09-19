var mongoose = require("mongoose");

var PerfilSchema = new mongoose.Schema({
    nome: String,
    email: String,
    escola: String,
    usuario:{
        username:{
            type: String,
            unique: true
        }
    },
    trofeus: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trofeu'
    }]
})

module.exports = mongoose.model("Perfil", PerfilSchema);