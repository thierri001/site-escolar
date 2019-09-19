const { errHandleRedirect, errHandleJson } = require("./errHandle");

const   express         = require("express"),
        router          = express.Router(),
        passport        = require("passport"),
        middleware      = require("../../middleware/index"),
        Posts           = require('../../models/Blog/post'),
        Perfil          = require('../../models/Blog/Perfil'),
        Assuntos        = require('../../models/Blog/assunto'),
        Categoria       = require('../../models/Blog/categoria'),
        Instituicao     = require("../../models/institucional"),
        User            = require('../../models/user'),
        postRoutes      = require('../blogRoutes/postRoutes'),
        commentRoutes   = require('../blogRoutes/commentRoutes'),
        perfilRoutes    = require('../blogRoutes/perfilRoutes'),
        async           = require("async"),
        nodemailer      = require("nodemailer"),
        crypto          = require("crypto");

router.use(postRoutes);
router.use(commentRoutes);
router.use(perfilRoutes);

router.post('/blog/login',passport.authenticate("local",{
    successRedirect: "/blog",
    failureRedirect: "/blog",
    failureFlash: true,
    badRequestMessage: 'Por favor, preencha todos os campos corretamente.'
}), function(req, res) {
});

router.get('/blog/logout',middleware.isLoggedIn,function(req, res) {
try {
    req.logout();
    res.redirect('/blog');
} catch{
    errHandleRedirect(res);
}
});

router.post('/blog/:post_id/like',middleware.isLoggedIn,(req,res)=>{
    try{
    var currentUser = req.user;
    Posts.findById(req.sanitize(req.params.post_id),(err,post)=>{
        if(err||!post){
            console.log(err);
            res.end();
        } else {
            if(post.id_likes.length > 0){
                for(var i=0; i < post.id_likes.length;i++){
                    if(post.id_likes[i].id_user == currentUser._id){
                    post.id_likes.splice(i);
                    post.save();
                    incrementaLike(-1,true);
                    break;
                    }
                    else if (i+1 === post.id_likes.length){
                    incrementaLike(1);
                    break;
                    }
                }
            } else {
            incrementaLike(1);
            }
        }
    });
    function incrementaLike(likeNum,remove){
        Posts.findOneAndUpdate({_id:req.sanitize(req.params.post_id)},{$inc:{likes: likeNum}},(err,updated)=>{
                if(err){
                    console.log(err);
                    res.end();
                } else {
                    if(remove){
                        res.status(200).json({message:'like'});
                    } else {
                    updated.id_likes.push({id_user:currentUser._id});
                    updated.save();
                    res.status(200).json({message:'like'});
                    }
                }
        });
    }
}catch{
    errHandleJson(res);
}
});

router.post('/blog/:post_id/dislike',middleware.isLoggedIn,(req,res)=>{
    try{
    var currentUser = req.user;
    Posts.findById(req.sanitize(req.params.post_id),(err,post)=>{
        if(err||!post){
            console.log(err);
            res.end();
        } else {
            if(post.id_dislikes.length >0){
                for(i=0; i < post.id_dislikes.length;i++){
                    if(post.id_dislikes[i].id_user == currentUser._id){
                        post.id_dislikes.splice(i);
                        post.save();
                        incrementaDislike(-1,true);
                        break;
                        }
                        else if (i+1 === post.id_dislikes.length){
                        incrementaDislike(1);
                        break;
                        }
                }
            } else {
                incrementaDislike(1);
            }
    }
    function incrementaDislike(dislikeNum,remove){
        Posts.findOneAndUpdate({_id:req.sanitize(req.params.post_id)},{$inc:{dislikes: dislikeNum}},(err,updated)=>{
            if(err){
                console.log(err);
                res.end();
            } else {
                if(remove){
                    res.json({message:'dislike'});
                }else {
                updated.id_dislikes.push({id_user:currentUser._id});
                updated.save();
                res.json({message:'dislike'});
                }
            }
        });
    }
});
}catch{
    errHandleJson(res);
}
});

router.get('/blog/assunto/:assunto/posts', function(req,res){
    
try {
    var assunto = decodeURI(req.sanitize(req.params.assunto)),
    currentUser = req.user,
    numero      = Number('1');
    Categoria.find({}).populate('assuntos').sort({'ordem':1}).exec((err,categorias)=>{
        if(err){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
            Assuntos.findOne({assunto:assunto},(err,assuntoO)=>{
                if(err||!assuntoO){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{    
            Assuntos.find({},(err,assuntos)=>{
            if(err||!assuntos){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                Posts.find({'assunto':assunto}).limit(10).sort({likes:-1,data_criacao:-1}).exec((err,posts)=>{
                    if(err||!posts){if(err != null){res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                        var tamanhoPosts = posts.length;
                        if(tamanhoPosts === 10){
                        Posts.countDocuments({'assunto':assunto},(err,total)=>{
                            if(err){
                                console.log(err);
                                res.render('blog/erro', {message: err.message, h_title:'Erro'});
                            } else {
                                var numeroP = total/10;
                                if(Number.isInteger(numeroP)){
                                var numeroDocs = numeroP;
                                res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs, categorias:categorias});
                                } else {
                                var numeroDocs = Math.floor(numeroP)+1;
                                res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs, categorias:categorias});
                                }
                            }
                        });
                        } else {
                            if(numero < 7){
                                if(numero < 0){
                                    numero = 0;
                                    res.redirect('/blog/pagina/1/'+assunto);
                                } else {
                                res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:false, categorias:categorias});}
                            } else {
                                Posts.countDocuments({'assunto':assunto},(err,total)=>{
                                    if(err){
                                        console.log(err);
                                        res.render('blog/erro', {message: err.message, h_title:'Erro'});
                                    } else {
                                    var numeroP = total/10;
                                    var numeroDocs = numeroP;
                                    res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs, categorias:categorias});
                                    }
                                });
                            }
                        }
                    }
                },10);
                }
            });
            }
        });
        }
    });
} catch {
    errHandleRedirect(res);
}
});

router.get('/blog/search/',(req,res)=>{
    res.redirect('/blog');
});

router.get('/blog/search/:procura',(req,res)=>{
try {
    var currentUser = req.user,
    procura         = req.sanitize(decodeURI(req.params.procura));
    if(procura === ''){
        res.end();
    } else {
    Categoria.find({}).populate('assuntos').sort({'ordem':1}).exec((err,categorias)=>{
        if(err){console.log(err); res.json({message: 'Ocorreu um erro na requisição, contate o administrador!', type:'alert-danger'});}else{
        Assuntos.find({},(err,assuntos)=>{
            if(err){console.log(err); res.json({message: 'Ocorreu um erro na requisição, contate o administrador!', type:'alert-danger'});}else{
                Posts.find({titulo:{$regex:procura, $options: 'i'}}).limit(10).sort('-likes').exec((err,posts)=>{
                    if(err){
                        console.log(err);
                        res.json({message: 'Ocorreu um erro na requisição, contate o administrador!', type:'alert-danger'});
                    } else {
                        res.render('blog/posts', 
                           {posts:posts, 
                            h_title:'Blog | '+req.params.procura,
                            currentUser:currentUser, 
                            assuntos:assuntos, 
                            assuntoPesq:procura, 
                            assunto:false, 
                            numeroPesquisa:false, 
                            numeroDocs:false, 
                            categorias:categorias});
                    }
                });
            }
        });
    }
    });
    }
} catch {
    errHandleRedirect(res);
}
});

router.get('/blog/pagina/:pagina/:assunto',(req,res)=>{
try {    
    var assunto     = decodeURI(req.sanitize(req.params.assunto)),
        numero      = Number(req.sanitize(req.params.pagina)),
        skip        = ((numero-1)*10)-1,
        currentUser = req.user;
    if(isNaN(skip) && isNaN(numero)){
     res.redirect('back');
    } else {
        if(skip < 0){
            skip = 0;
        }
        Categoria.find({}).populate('assuntos').sort({'ordem':1}).exec((err,categorias)=>{
            if(err){console.log(err); res.json({message: 'Ocorreu um erro na requisição, contate o administrador!', type:'alert-danger'});}else{
            Assuntos.findOne({assunto:assunto},(err,assuntoO)=>{
                if(err||!assuntoO){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro'});}}else{    
            Posts.find({'assunto':assunto}).skip(skip).limit(10).sort({likes:-1,data_criacao:-1}).exec((err,posts)=>{
                if(err){
                    console.log(err);
                    res.render('blog/erro', {message: err.message, h_title:'Erro'});
                } else {
                    var tamanhoPosts = posts.length;
                    Assuntos.find({},(err,assuntos)=>{
                        if(err){
                            console.log(err);
                            res.render('blog/erro', {message: err.message, h_title:'Erro'});
                        } else{
                            if(tamanhoPosts === 10){
                                if(numero <= 7){
                                    if(numero <= 0){                                
                                        numero = 1;
                                    }
                                    Posts.countDocuments({'assunto':assunto},(err,total)=>{
                                        if(err){
                                            console.log(err);
                                            res.render('blog/erro', {message: err.message, h_title:'Erro'});
                                        } else {
                                            var numeroP = total/10;
                                            if(Number.isInteger(numeroP)){
                                            var numeroDocs = numeroP;
                                            res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs,categorias:categorias});
                                            } else {
                                            var numeroDocs = Math.floor(numeroP)+1;
                                                res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs,categorias:categorias});
                                            }
                                        }
                                    });
                                } else {
                                    res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:false,categorias:categorias});
                                }
                            } else {
                                if(numero <= 7){
                                    if(numero <= 0){
                                        numero = 1;
                                        res.redirect('/blog/pagina/1/'+assunto);
                                    } else {
                                        Posts.countDocuments({'assunto':assunto},(err,total)=>{
                                            if(err){
                                                console.log(err);
                                                res.render('blog/erro', {message: err.message, h_title:'Erro'});
                                            } else {
                                            var numeroP = total/10;
                                                if(Number.isInteger(numeroP)){
                                                    var numeroDocs = numeroP;
                                                    res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs, categorias:categorias});
                                                    } else {
                                                    var numeroDocs = Math.floor(numeroP)+1;
                                                    res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs, categorias:categorias});
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    res.render('blog/posts', {posts:posts, h_title:'Blog | '+assunto, currentUser:currentUser, assuntos:assuntos, assunto:assuntoO,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:false, categorias:categorias});
                                }
                            }
                        }
                    });
                }
            });
            }
            });
        }
        });
    }
} catch {
    errHandleRedirect(res);
}
});

router.get('/blog',function(req,res){
try {
        User.find({tipo:1}).limit(20).exec((err,usuarios)=>{
            if(err){if(err != null){res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro'});}}else{
        User.countDocuments({},(err,totalUsuarios)=>{
        if(err){if(err != null){res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
            Posts.countDocuments({},(err,totalPosts)=>{
                if(err){if(err != null){res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                Categoria.find({}).populate('assuntos').sort({'ordem':1}).exec((err,categorias)=>{
                    if(err){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                    Posts.findPostBlog({},(err,post)=>{
                        if(err){if(err != null){console.log(err); res.render('blog/erro', {message: err.message, h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                            var currentUser = false;
                            if(req.user != undefined && req.user.tipo === 1){
                                    if(req.user.ban){
                                        req.session.destroy();
                                        req.logout();
                                        res.render('blog/blog', {message:'Usuário banido, por favor, contate o administrador.',posts:post, h_title:'Blog Master',currentUser: currentUser, categorias:categorias, usuarios:usuarios, totalPosts:totalPosts, totalUsuarios:totalUsuarios});
                                    } else{
                                        var currentUser = req.user;
                                        res.render('blog/blog', {message:false,posts:post, h_title:'Blog Master',currentUser: currentUser, categorias:categorias, usuarios:usuarios, totalPosts:totalPosts, totalUsuarios:totalUsuarios});
                                    }
                                } else{
                                        res.render('blog/blog', {message:false,posts:post, h_title:'Blog Master',currentUser: currentUser, categorias:categorias, usuarios:usuarios, totalPosts:totalPosts, totalUsuarios:totalUsuarios});
                                }
                            }
                    },5);
                }
                });
            }
            });
        }
        });
    }
    });
} catch {
    errHandleRedirect(res);
}
});

router.get('/blog/:post_id',function(req,res){
    try{
    var currentUser = false;
    Posts.showPost(req.sanitize(req.params.post_id),function(err,post){
        if(err||!post){if(err != null){res.render('blog/erro', {h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
        User.findById(post.autor.id,(err,user)=>{
            if(req.user && req.user.tipoConta === 1){
                Assuntos.find({},(err,assuntos)=>{
                    if(err){
                        console.log(err);
                    } else {
                        if(req.user){
                            currentUser = req.user;
                            res.render('blog/post',{post:post, h_title: "Blog | "+post.titulo, currentUser: currentUser, assunto:assuntos, descricaoPost: post.descricao, foto:user.foto});
                        } else {res.render('blog/post',{post:post, h_title: "Blog | "+post.titulo, currentUser: currentUser, assunto:assuntos, descricaoPost: post.descricao, foto:user.foto});}
                    }
                });
            } else {
                if(err){if(err != null){res.render('blog/erro', {h_title:'Erro 404'});} else {res.render('blog/erro', {h_title:'Erro 404'});}}else{
                if(req.user){
                    currentUser = req.user;
                    res.render('blog/post',{post:post, h_title: "Blog | "+post.titulo, currentUser: currentUser, assunto:false, descricaoPost: post.descricao, foto:user.foto});
                } else {res.render('blog/post',{post:post, h_title: "Blog | "+post.titulo, currentUser: currentUser, assunto:false, descricaoPost: post.descricao, foto:user.foto});}
            }
        }
        });
        }
    });
    } catch { 
        errHandleRedirect(res);
    }
}); 

router.get('/blog/usuario/new',function(req,res){
    try{
    Instituicao.findOne({titulo:process.env.regras},(err,regra)=>{
        if(err){
            console.log(err);
        } else {
            res.render('blog/registro',{h_title:'Blog',regras:regra.descricao});
        }
    });
    } catch { 
        errHandleRedirect(res);
    }
}); 

router.post('/blog/usuario/new',function(req,res){
    try{
    if(checkCheck(req.body['regras'])){
        if(req.body.email != null||typeof req.body.email != undefined || req.body.email != ''){
                    var newUser = new User({username: req.sanitize(req.body.username),tipo: 1, email: req.sanitize(req.body.email)});
                    User.register(newUser,req.sanitize(req.body.password), function(err, user){
                        if (err||!user){console.log(err);res.json({message: err.message,type:'alert-danger'});}else{
                            Perfil.create({nome:'',email: user.email ,escola:'', usuario:{username:user.username}} ,(err,perfil)=>{
                                if(err||!perfil){
                                    console.log(err);
                                    res.render('blog/erro', {h_title:'Erro'});
                                } else {
                                user.perfil=perfil;
                                user.save();
                                res.json({message:'Usuário criado!',type:'alert-success'});
                                }
                            });
                        }
                    });
            } else {
            res.json({message:'Por favor, preencha todos os campos!',type:'alert-secondary'});
        }
    } else {
            res.json({message:'Para prosseguir você deve aceitar as regras!',type:'alert-secondary'});
    }
    function checkCheck(val){
        if(val == undefined){
            return false;
        }
        if(val === 'on'){
            return true;
        }
    }
}catch{
    errHandleJson(res);
}
});

router.get('/blog/usuario/recuperarSenha',(req,res)=>{
    try{
    res.render('blog/recuperaSenha',{h_title:"Blog"});
    } catch { 
        errHandleRedirect(res);
    }
}); 

router.post('/blog/usuario/recuperarSenha',(req,res)=>{
    try{
    async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ email: req.sanitize(req.body.email) }, function(err, user) {
            if (!user) {
            res.json({message:'Não foi encontrado usuario com esse email!', type:'alert-secondary'});
            } else{
    
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user.save(function(err) {
              done(err, token, user);
            });
        }
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: 'escolamstr@gmail.com',
              pass: process.env.GMAILPW
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'Blog Master',
            subject: 'Recuperação de senha - Blog Master',
            text: 'Você ou alguém requisitou a recuperação de senha para sua conta.\n\n' +
              'Por favor, clique no link ou copie e cole no navegador para completar o processo: \n\n' +
              'http://' + req.headers.host + '/blog/usuario/resetaSenha/' + token + '\n\n' +
              'Se você não requisitou a recuperação de senha, não se preocupe, apenas apague este email e sua senha permanecerá a mesma.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            res.json({message:'Um email foi enviado para ' + user.email + ' com mais instruções.',type:'alert-success'});
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err){ console.log(err); res.json({message:'Houve um erro na solicitação, por favor tente mais tarde', type:'alert-danger'});}else{
        res.redirect('/blog/usuario/recuperarSenha');}
      });
    }catch{
        errHandleJson(res);
    }
});

router.get('/blog/usuario/resetaSenha/:token', function(req, res) {
    try{
    User.findOne({ resetPasswordToken: req.sanitize(req.params.token), resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        res.json({message:'O token para recuperação de senha expirou ou é inválido.',type:'alert-danger'});
      }
        res.render('blog/resetaSenha', {token: req.params.token, h_title:"Blog"});
    });
    } catch { 
        errHandleRedirect(res);
    }
}); 
  
router.post('/blog/usuario/resetaSenha/:token', function(req, res) {
    try{
async.waterfall([
    function(done) {
    User.findOne({ resetPasswordToken: req.sanitize(req.params.token), resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
        res.json({message:'O token para recuperação de senha expirou ou é inválido.',type:'alert-danger'});
        }
        if(req.body.password === req.body.confirm) {
        user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
            req.logIn(user, function(err) {
                done(err, user);
            });
            });
        })
        } else {
            res.json({message:'As senhas não são iguais.', type:'alert-warning'});
        }
    });
    },
    function(user, done) {
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
        user: 'escolamstr@gmail.com',
        pass: process.env.GMAILPW
        }
    });
    var mailOptions = {
        to: user.email,
        from: 'Escola Master - Blog',
        subject: 'Sua senha foi alterada - Blog Master',
        text: 'Olá,\n\n' +
        'Esta é uma confirmação que a senha de sua conta ' + user.username + ' foi alterada com sucesso.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        res.json({message:'Senha alterada com sucesso!', type:'alert-success'});
        done(err);
    });
    }
], function(err) {
    res.redirect('/blog');
});
}catch{
    errHandleJson(res);
}
});

router.put('/blog/mudaAssunto/:id',middleware.moderador,(req,res)=>{
    try{
    Posts.findOneAndUpdate({_id:req.sanitize(req.params.id)},{assunto:req.sanitize(req.body.assunto)},(err,post)=>{
        if(err){
            console.log(err);
        } else {
            res.json({message:'Assunto alterado!',type:'alert-success'});
        }
    });
}catch{
    errHandleJson(res);
}
});

module.exports = router