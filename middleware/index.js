const Posts         = require('../models/Blog/post'),
      Comentarios   = require('../models/Blog/comentario'),
      User          = require('../models/user');

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated() && req.user != undefined){
        if(!(req.user.ban)){
            return next();
        } else {
        req.logout();
        res.status(404).redirect('/blog');
        }
    } 
    req.session.destroy();
    res.status(404).redirect('/home');
};

middlewareObj.adminRole = function(req,res,next){
if(req.user.tipo === 0){
    return next();
}
req.session.destroy();
res.status(404).redirect('/home');
};

middlewareObj.blogRole = function(req,res,next){
    if(req.user.tipo === 1){
        return next();
    }
    req.session.destroy();
    res.status(404).redirect('/blog');
};

middlewareObj.donoDoPost = function(req,res,next){
    Posts.findById(req.sanitize(req.params.id)).populate('autor.id').exec((err,post)=>{
        if(err || !post){
            res.redirect('/blog');
        } else {
            if(post.autor.id.equals(req.user._id)||req.user.tipoConta === 1){
                next();
            } else {
                res.redirect('/blog');
            }
        }
    });
}

middlewareObj.donoDoComentario = function(req,res,next){
    Comentarios.findById(req.sanitize(req.params.comentario_id),(err,comentario)=>{
        if(err||!comentario){
            console.log(err);
            res.redirect('/blog');
        } else {
            if(comentario.autor.id.equals(req.user._id) || req.user.tipoConta === 1){
                next();
            } else {
                res.redirect('/blog');
            }
        }
    });
}

middlewareObj.donoDoPerfil = function(req,res,next){
    User.findOne({username:req.sanitize(req.params.usuario_nome)},(err,usuario)=>{
        if(err||!usuario){
            res.redirect('/blog');
        } 
        if(usuario._id.equals(req.user._id)){
            next();
        } else {
            req.redirect('/blog');
        }
    });
}
    
middlewareObj.hasPermissionPaginas = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoPaginas||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionHome = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoHome||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionInstitucional = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoInstitucional||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionEventos = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoEventos||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionEnsino = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoEnsino||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionDiferenciais = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoDiferenciais||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionContato = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoContato||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionUsuarios = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoUsuarios||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionMensagens = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoMensagens||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home')
  }
};

middlewareObj.hasPermissionBlog = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoBlog||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home');
  }
};

middlewareObj.hasPermissionDever = function (req,res,next){
    var currentUser = req.user;
  if(currentUser.permissaoDever||currentUser.isAdmin){
      next();
  } else {
      res.status(404).redirect('/home');
  }
};

middlewareObj.moderador = function (req,res,next){
    var currentUser = req.user;
    if(currentUser.tipoConta === 1){
        next();
    } else {
        res.status(404).redirect('/home');
    }
}

module.exports = middlewareObj;