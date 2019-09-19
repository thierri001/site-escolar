var mongoose = require("mongoose");

var ComentarioSchema = new mongoose.Schema({
    texto: String,
    autor:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        foto: String,
        id_perfil:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Perfil'
        },
        username: String
    },
    likes: {type:Number, default:0},
    dislikes: {type:Number, default:0},
    id_likes:[{
        id_user: String
      }],
    id_dislikes:[{
        id_user: String
    }],
    data_criacao: Date
});

module.exports = mongoose.model("Comentario", ComentarioSchema);