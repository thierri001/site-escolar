const express   = require("express"),
    router      = express.Router(),
    User        = require("../../models/user"),
    Post        = require('../../models/Blog/post'),
    Perfil      = require('../../models/Blog/Perfil'),
    fs          = require('fs'),
    Comentario  = require('../../models/Blog/comentario');

router.get('/admin/usuario/new', function(req, res) {
    res.render('admin/content/user/newUser');
});

router.get('/admin/edit/usuarios', function(req, res) {
    var currentUser = req.user;
        User.find({tipo:0}, function(err, todosUsuarios){
            if(err|!todosUsuarios){res.render('admin/erro',{message: err.message});}else{
            res.render('admin/content/user/usuarios', {currentUser: currentUser ,usuarios: todosUsuarios});}
        }); 
});

router.post('/admin/usuario/new', function(req, res) {
    var newUser = new User({username: req.body.username,email:getRandomInt(10,99999)}),
        currentUser = req.user;
    if(req.body.admin === "adm" && currentUser.isAdmin){
           newUser.isAdmin = true;
       }
        User.register(newUser, req.body.password, function(err, user){
            if (err){
                res.json({message: err.message, type:'alert-danger'});
            } else {
               res.json({message: "Usuário cadastrado com sucesso!", type:'alert-success'});}
            });
            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }
});

router.get('/admin/usuario/:id/edit', function(req,res){
    var currentUser = req.user;
    User.findById({_id:req.params.id}, function(err,usuario){
       if(err|!usuario){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/user/edit', {user: usuario, currentUser: currentUser});}
    });
});

router.get('/admin/usuario/:id/permissoes', function(req,res){
    User.findById({_id:req.params.id}, function(err,usuario){
       if(err|!usuario){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/user/permissoes',{usuario: usuario});}
    });
});

router.put('/admin/:idUsuario/mudarNome', function(req, res) {
    var currentUser = req.user,
        idUsuario = req.params.idUsuario,
        newUsername = req.body.newUsername;
    User.findById(idUsuario, function(err,usuario){
        if(err||!usuario){
         res.render('admin/gerenciamento',{currentUser: currentUser, message: "Ocorreu um erro ao consultar usuário!", type:'alert-danger'});
        }
        else {
        if(currentUser._id.equals(usuario._id) || currentUser.isAdmin){
            User.findOneAndUpdate({_id:idUsuario}, newUsername, function(err,usuarioMudado){
                if (err && err.code === 11000){
                    res.json({message: "O nome tem que ser único!", type:'alert-secondary'});
                } else if(err || !usuarioMudado){
                    res.render('admin/erro',{message: err.message});
                }
                else if (usuario._id.equals(currentUser._id)){
                    req.logout();
                    res.render('admin/login',{message: "Alteração no nome feita com sucesso!", type:'alert-success'});
                }
                else if(err||!usuarioMudado){
                    res.json({message: "Ocorreu um erro ao atualizar usuário!", type:'alert-danger'});
                } else {
                    res.json({message:"Alterações feitas com sucesso!", type:'alert-success'});
                }
            });
        } else {res.json({message: "Sem permissão para alterar usuário!", type:'alert-danger'});}
        }
    });
});

router.put('/admin/:usuario/recuperarSenha', function(req, res) {
    var currentUser = req.user,
        newPassword = req.sanitize(req.body.password);
        User.findById({_id:req.params.usuario}
        , function(err, usuario) {
          if(err||!usuario){res.render('admin/erro',{message: err.message});} 
          else if (usuario._id.equals(currentUser._id)) {
            usuario.setPassword(newPassword,(err)=>{
                if (err){res.render('admin/erro',{message: err.message});}else{
                req.logout();
                usuario.save(function(err){
                    if (err){res.render('admin/erro',{message: err.message});}
                    else {
                    res.json({message: "Senha alterada com sucesso!", type:'alert-success',href:'/cmadmin'});
                    }
                });
                }
            });
          } else {
              if(!(currentUser.isAdmin)){
                  res.json({message: "Sem permissão!", type:'alert-danger'});
              }else{
            usuario.setPassword(newPassword,(err)=>{
                if (err){res.render('admin/erro',{message: err.message});}else{
                usuario.save(function(err){
                    if (err) { console.log(err); }
                    else {
                    res.json({message: "Senha alterada com sucesso!", type:'alert-success'});
                    }
                });
                }
            });
              }
          }
        });
});

router.put('/admin/:usuario/permissoes', function(req, res) {
    var a = checkCheck(req.body['home']),
        b = checkCheck(req.body['instituicao']),
        c = checkCheck(req.body['eventos']),
        d = checkCheck(req.body['contato']),
        e = checkCheck(req.body['ensino']),
        f = checkCheck(req.body['diferencial']),
        g = checkCheck(req.body['mensagens']),
        h = checkCheck(req.body['usuarios']),
        i = checkCheck(req.body['paginas']),
        j = checkCheck(req.body['blog']),
        k = checkCheck(req.body['dever']),
        currentUser = req.user;
    var propriedades = {
        permissaoHome            : a,
        permissaoInstitucional   : b,
        permissaoEventos         : c,
        permissaoContato         : d,
        permissaoEnsino          : e,
        permissaoDiferenciais    : f,
        permissaoMensagens       : g,
        permissaoUsuarios        : h,
        permissaoPaginas         : i,
        permissaoBlog            : j,
        permissaoDever           : k
    };

    User.findById(req.params.usuario, function(err,usuario){
    if(err||!usuario){
     res.render('admin/gerenciamento',{currentUser: currentUser, message: "Ocorreu um erro ao consultar usuário!", type:'alert-danger'});
    }
    else {
    if(currentUser._id.equals(usuario._id) || currentUser.isAdmin){
    User.findOneAndUpdate({_id:req.params.usuario},propriedades,function(err,updated){
       if(err||!updated){res.render('admin/erro',{message: err.message});}else{
       res.json({message: "Permissões atualizadas para "+updated.username+"!", type:'alert-success'});
      }
    });
    } else {res.json({message: "Sem permissão para alterar usuário!", type:'alert-danger'});}
    }
    });
    function checkCheck(val){
        if(val == undefined){
            return false;
        }
        if(val === 'on'){
            return true;
        }
    }
});

router.delete('/admin/usuario/:usuario/delete', function(req,res){
    var currentUser = req.user,
        usuarioId   = req.params.usuario;
        if(usuarioId == currentUser._id || !(currentUser.isAdmin)){
         res.json({message: "Não pode deletar usuario logado!", type:'alert-secondary'});
        } else {
        User.findById(req.params.usuario,(err,usuario)=>{
        if(err){res.render('admin/erro',{message: err.message});}else{ 
        User.findOneAndDelete({_id:usuarioId}, function(err){
           if(err){res.render('admin/erro',{message: err.message});}else{
               Post.find({'autor.id':usuario._id}, (err,posts)=>{
                if(err){res.render('admin/erro',{message: err.message});}else{
                    posts.forEach((post)=>{
                        Comentario.deleteMany({_id:{$in: post.comentarios}},(err)=>{
                            if(err){res.render('admin/erro',{message: err.message});}
                            });
                    });
                    Post.deleteMany({'autor.id':usuario._id}, (err)=>{
                        if(err){res.render('admin/erro',{message: err.message});}else{
                        Perfil.findOneAndDelete({_id:usuario.perfil._id},(err)=>{
                            if(err){res.render('admin/erro',{message: err.message});}else{
                                var defaultImg = '/uploads/usuarioDefault.png';
                                if(usuario.foto !== defaultImg){
                                    var pblc = "public",
                                        urlc = pblc.concat(usuario.foto);
                                    if(fs.existsSync(urlc)){
                                        fs.unlink(urlc, (err) => {
                                            if (err){ 
                                                console.log(err);
                                                res.status.json({ err: err });
                                            } res.json({message: "Usuário removido com sucesso!", type:'alert-danger'});
                                        });
                                    } 
                                } else {
                                res.json({message: "Usuário removido com sucesso!", type:'alert-danger'});}
                                }
                            });
                        }
                    });
                }
            });
            }
        });
    }
    });
    }
});
    
module.exports = router;