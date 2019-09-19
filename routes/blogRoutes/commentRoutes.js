const { errHandleRedirect, errHandleJson } = require("./errHandle");
const   express         = require("express"),
        router          = express.Router({mergeParams:true}),
        sanitizeHtml    = require('sanitize-html'),
        Comentarios     = require('../../models/Blog/comentario'),
        Post            = require('../../models/Blog/post'),
        middleware      = require('../../middleware/index');

var optionsSanitize = {
    allowedTags: ['blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'],
    allowedAttributes: {
    a: [ 'href', 'name', 'target' ],
    img: ['src'],
    span: ['style'],
    table:['class']
    },
    selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'style'],
    allowProtocolRelative: true
}

router.post('/blog/:post_id/comment/new',function(req,res){
    try{
    var currentUser = req.user,
        texto       = sanitizeHtml(req.body.texto,optionsSanitize);
    Post.findById(req.sanitize(req.params.post_id),(err,post)=>{
        if(err||!post){
            console.log(err);
            res.json({message:"Ocorreu um erro ao postar o comentário!",type:'alert-danger'});
        } else {
            Comentarios.create({texto:texto,data_criacao:Date.now()},(err,comentario)=>{
                if(err||!comentario){
                    console.log(err);
                    res.json({message:"Ocorreu um erro ao postar o comentário!",type:'alert-danger'});
                }else{
                    comentario.autor.id         = currentUser._id;
                    comentario.autor.foto       = currentUser.foto;
                    comentario.autor.username   = currentUser.username;
                    comentario.autor.id_perfil  = currentUser.perfil._id;
                    comentario.save();
                    post.comentarios.push(comentario);
                    post.save();
                    res.send('Feito!');
                }
            });
        }
    });
} catch{
    errHandleJson(res);
}
}); 

router.put('/blog/:post_id/comentario/edit/:comentario_id',middleware.donoDoComentario,(req,res)=>{
    try{
    var texto = sanitizeHtml(req.body.texto,optionsSanitize);
    if(req.body.texto===""){
        Comentarios.findOneAndDelete({_id:req.params.comentario_id},(err,deletado)=>{
            if(err){
                console.log(err);
                res.json({message:"Ocorreu um erro ao postar o comentário!",type:'alert-danger'});
            } else {
                res.json('Comentario apagado!');
            }
        });
    } else {
        Comentarios.findOneAndUpdate({_id:req.sanitize(req.params.comentario_id)},{texto:texto},(err,updated)=>{
            if(err||!updated){
                console.log(err);
                res.json({message:"Ocorreu um erro ao postar o comentário!",type:'alert-danger'});
            } else {
                res.send('Comentario atualizado!');
            }
        });
    }
} catch{
    errHandleJson(res);
}
}); 

router.delete('/blog/:post_id/comentario/delete/:comentario_id',middleware.donoDoComentario,(req,res)=>{
    try{
    Comentarios.findOneAndDelete({_id:req.sanitize(req.params.comentario_id)},(err,deletado)=>{
        if(err){
            console.log(err);
            res.json({message:"Ocorreu um erro ao deletar o comentário!",type:'alert-danger'});
        } else {
            res.json({status:'Comentario apagado!'});
        }
    });
} catch{
    errHandleJson(res);
}
}); 

router.post('/blog/:post_id/comentario/like/:comentario_id',(req,res)=>{
    try{
    var currentUser = req.user;
    Comentarios.findOne({_id:req.sanitize(req.params.comentario_id)},(err,comentario)=>{
        if(err||!comentario){
            console.log(err);
            res.end();
        } else {
            if(comentario.id_likes.length > 0){
                for(var i=0; i < comentario.id_likes.length;i++){
                    if(comentario.id_likes[i].id_user == currentUser._id){
                    comentario.id_likes.splice(i);
                    comentario.save();
                    incrementaLike(-1,true);
                    break;
                    }
                    else if (i+1 === comentario.id_likes.length){
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
        Comentarios.findOneAndUpdate({_id:req.sanitize(req.params.comentario_id)},{$inc:{likes: likeNum}},(err,updated)=>{
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
} catch{
    errHandleJson(res);
}
}); 

router.post('/blog/:post_id/comentario/dislike/:comentario_id',(req,res)=>{
    try{
    var currentUser = req.user;
    Comentarios.findOne({_id:req.sanitize(req.params.comentario_id)},(err,comentario)=>{
        if(err||!comentario){
            console.log(err);
            res.end();
        } else {
            if(comentario.id_dislikes.length >0){
                for(i=0; i < comentario.id_dislikes.length;i++){
                    if(comentario.id_dislikes[i].id_user == currentUser._id){
                        comentario.id_dislikes.splice(i);
                        comentario.save();
                        incrementaDislike(-1,true);
                        break;
                        }
                        else if (i+1 === comentario.id_dislikes.length){
                        incrementaDislike(1);
                        break;
                        }
                }
            } else {
                incrementaDislike(1);
            }
    }
    function incrementaDislike(dislikeNum,remove){
        Comentarios.findOneAndUpdate({_id:req.params.comentario_id},{$inc:{dislikes: dislikeNum}},(err,updated)=>{
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
} catch{
    errHandleJson(res);
}
}); 

module.exports = router;