const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    nome: {type:String , required: false},
    descricao: {type:String , required: false},
    URL: {type: String, default:"/uploads/default.png"}
});

module.exports = mongoose.model('Image', productSchema);