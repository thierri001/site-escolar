var  Contato        = require('./models/contact'),
     Instituicao    = require("./models/institucional"),
     Usuario        = require('./models/user');

function checkDb() {
    Contato.findById(process.env.idContato, (err, contato) => {
        if (err) {
            console.log(err);
        }
        else if (!contato) {
            Contato.create({ _id: process.env.idContato }, (err, contato) => {
                if (err) {
                    console.log(err);
                }
                else {
                }
            });
        }
    });
    Usuario.findOne({username:process.env.usuarioAdmin}, (err, usuario) => {
        if (err) {console.log(err);}
        else if (!usuario) {
            var newUser = new Usuario({username: process.env.usuarioAdmin,isAdmin: true});
            Usuario.register(newUser, process.env.senhaAdmin, function(err, user){
                if (err){console.log(err);} else {}
                });} else{}
    });
    Instituicao.findOne({titulo:process.env.regras}, (err, institu) => {
        if (err) {
            console.log(err);
        }
        else if (!institu) {
            Instituicao.create({titulo: process.env.regras}, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                }
            });
        }
    });
    checaInstitu(process.env.principal);
    checaInstitu(process.env.descricao1);
    checaInstitu(process.env.descricao2);
    checaInstitu(process.env.descricao3);
    function checaInstitu(idInstitu) {
        Instituicao.findById(idInstitu, (err, institu) => {
            if (err) {
                console.log(err);
            }
            else if (!institu) {
                Instituicao.create({ _id: idInstitu }, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                    }
                });
            }
        });
    }
}
exports.checkDb = checkDb;
