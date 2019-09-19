var mongoose = require("mongoose");
 
var mensagemSchema = new mongoose.Schema({
    nome: {type: String, required:true},
    email: {type: String, required:true},
    telefone: {type: Number, required:true},
    texto: {type: String, required:true},
    data_criacao: Date
});

var handleValidation = function(error, res, next) {
  if(error.name === 'ValidationError'){
    next({message: "Por favor, preencha todos os campos corretamente!"});
  }
    next();
};

mensagemSchema.post('save', handleValidation);

module.exports = mongoose.model("Mensagem", mensagemSchema);