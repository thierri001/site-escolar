var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema({
    username: {type:String, unique:true, required:true},
    password: String,
    tipo: {type: Number, default: 0},
    isAdmin: {type: Boolean, default: false},
    email: {type:String,unique:true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    permissaoPaginas       :{type: Boolean, default: false},
    permissaoHome          :{type: Boolean, default: false},
    permissaoInstitucional :{type: Boolean, default: false},
    permissaoEventos       :{type: Boolean, default: false},
    permissaoEnsino        :{type: Boolean, default: false},
    permissaoDiferenciais  :{type: Boolean, default: false},
    permissaoContato       :{type: Boolean, default: false},
    permissaoUsuarios      :{type: Boolean, default: false},
    permissaoMensagens     :{type: Boolean, default: false},
    permissaoBlog          :{type: Boolean, default: false},
    permissaoDever         :{type: Boolean, default: false},
    perfil: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Perfil'
    },
    foto: {type:String,default:'/uploads/usuarioDefault.png'},
    tipoConta: {type: Number, default:0},
    ban:{type: Boolean, default:false}
});

UserSchema.pre('save', function(next){
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
    next();
});

var options = {
    errorMessages: {
        MissingPasswordError: 'Por favor, preencha todos os campos!',
        AttemptTooSoonError: 'Muitas tentativas, tente logar mais tarde!',
        TooManyAttemptsError: 'Conta bloqueada devido a diversas tentativas!',
        NoSaltValueStoredError: 'Authentication not possible. No salt value stored!',
        IncorrectPasswordError: 'Senha ou usuário incorreto!',
        IncorrectUsernameError: 'Senha ou usuário incorreto!',
        MissingUsernameError: 'Por favor, preencha todos os campos!',
        UserExistsError: 'Já temos um usuário com este nome!',
        MissingCredentials: 'Por favor, preencha o nome de usuário e a senha.'
    }
};

var handleE11000 = function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error("O email já está cadastrado em outra conta!"));
  } else {
    next();
  }
};

UserSchema.post('save', handleE11000);
UserSchema.post('update', handleE11000);
UserSchema.post('findOneAndUpdate', handleE11000);
UserSchema.post('insertMany', handleE11000);

UserSchema.plugin(passportLocalMongoose,options);

module.exports = mongoose.model("User", UserSchema);