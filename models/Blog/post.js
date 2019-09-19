var mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
    titulo: String,
    assunto: String,
    descricao: String,
    texto: String,
    comentarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario'
    }],
    autor:{
      id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
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
    ordem: {type:Number,default:0},
    data_criacao: Date
});

PostSchema.statics.findPost = function (pesquisa,callback,limit) {
  this.find(pesquisa).limit(limit)
    .populate('assunto.id')
    .sort({ordem:-1,likes:-1,data_criacao:-1})
    .exec(callback);
}

PostSchema.statics.findPostBlog = function (pesquisa,callback,limit) {
  this.find(pesquisa).limit(limit)
    .populate('assunto.id')
    .sort({likes:-1,data_criacao:-1})
    .exec(callback);
}

PostSchema.statics.showPost = function (pesquisa,callback) {
  this.findById(pesquisa)
    .populate('comentarios')
    .exec(callback);
}

module.exports = mongoose.model("Post", PostSchema);