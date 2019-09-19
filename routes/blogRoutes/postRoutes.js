const { errHandleRedirect, errHandleJson } = require("./errHandle");
const   express         = require("express"),
        router          = express.Router(),
        sanitizeHtml    = require('sanitize-html'),
        Post            = require('../../models/Blog/post'),
        Comentarios     = require('../../models/Blog/comentario'),
        Assunto         = require('../../models/Blog/assunto'),
        middleware      = require('../../middleware/index');

var optionsSanitize = {
allowedTags: [ 'h1','h2','h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'video', 'body','div'],
allowedAttributes: {
    a: [ 'href', 'name', 'target' ],
    img: ['src'],
    iframe:['style','class','width','height','frameborder','src','href'],
    '*':['style']
},
selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta', 'iframe', 'body' ],
allowedSchemes: ['style','width','height','frameborder','data','http', 'https', 'ftp', 'mailto' ],
allowedSchemesByTag: ['style','class'],
allowedSchemesAppliedToAttributes: ['href', 'src', 'cite','width','height','frameborder','class','style'],
allowProtocolRelative: true
}

router.get('/blog/post/new', function(req,res){
    try{
    Assunto.find({},(err,assuntos)=>{
        if(err){
            console.log(err);
            res.render('blog/erro',{message:err.message});
        } else {
            res.render('blog/newPost',{h_title:'Blog | Novo Post ', assuntos:assuntos});
        }
    });
}catch{
    errHandleRedirect(res);
}
});
router.post('/blog/post/new', function(req,res){
    try{
    var data = new Date(),
    newPost = {
    titulo: req.sanitize(req.body.titulo),
    descricao: req.sanitize(req.body.descricao),
    assunto: req.sanitize(req.body.assunto),
    texto: sanitizeHtml(req.body.texto,optionsSanitize),
    autor: {id: req.user._id,
            username: req.user.username},
    data_criacao: data
    };
        Post.create(newPost,(err,post)=>{
            if(err||!post){
                console.log(err);
                res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
            } else {
                res.json({message:'Post criado!', type:'alert-success'});
            }
        });
    }catch{
    errHandleJson(err);
    }
});
router.get('/blog/post/edit/:id',middleware.donoDoPost, function(req,res){
    try{
    Post.findById(req.params.id,function(err,post){
        if(err||!post){
            if(err!=null){
            console.log(err);
            res.render('blog/erro',{message:err.message, h_title:'Erro'});
        }else{
            res.render('blog/erro',{h_title:'Erro 404'});
        }
        } else {
            res.render('blog/editPost',{post: post,h_title:'Blog'});
        }
    });
    }catch{
        errHandleRedirect(res);
    }
});
router.put('/blog/post/edit/:id',middleware.donoDoPost,function(req,res){
    try{
    var update = {
        descricao: req.sanitize(req.body.descricao),
        texto: sanitizeHtml(req.body.texto,optionsSanitize)
                    };
    Post.findOneAndUpdate({_id:req.params.id},update,(err,updated)=>{
        if(err||!updated){
            console.log(err);
            res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
        } else {
            res.json({message:'Salvo!', type:'alert-success'});
        }
    });

    }catch{
    errHandleJson(err);
    }
}); 
router.delete('/blog/post/delete/:id',middleware.donoDoPost, function(req,res){
    try{
    Post.findOneAndDelete({_id:req.params.id},(err,deleted)=>{
        if(err){
            console.log(err);
            res.json({message:'Ocorreu um erro ao deletar!', type:'alert-danger'});
        } else {
            Comentarios.deleteMany({_id: {$in: deleted.comentarios}});
            if(err){res.render('blog/erro',{message: err.message});}else{
            res.json({message:'Apagado!', type:'alert-danger'});}
        }
    });

    }catch{
    errHandleJson(err);
    }
}); 
module.exports = router;