const express   = require("express"),
    router      = express.Router(),
    Pages       = require("../../models/page"),
    sanitizeHtml= require('sanitize-html'),
    save        = require("summernote-nodejs"),
    fs          = require("fs");

var optionsSanitize = {
allowedTags: [ 'h1','h2','h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'video', 'body','div'],
allowedAttributes: false,
selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta', 'iframe', 'body' ],
allowedSchemes: ['style','width','height','frameborder','data','http', 'https', 'ftp', 'mailto' ],
allowedSchemesByTag: ['style','class'],
allowedSchemesAppliedToAttributes: ['href', 'src', 'cite','width','height','frameborder','class','style'],
allowProtocolRelative: true
}
    
router.get('/admin/edit/paginas', function(req, res) {
    Pages.find({}, function(err,allPages){
       if(err|!allPages){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/pages/crudPg', {paginas: allPages});}
    });
});

router.get('/admin/edit/paginas/:pagina', function(req, res) {
    var idPagina = req.params.pagina;
    Pages.findById(idPagina, function(err, pagina){
       if(err||!pagina){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/pages/editPg', {pagina: pagina});}
    });
});

router.get('/admin/new/pagina', function(req, res) {
   res.render('admin/content/pages/newPagina');
});

router.post('/admin/pagina', function(req, res) {
    var name = req.body.name,
        code = sanitizeHtml(req.body.html,optionsSanitize),
        novaPagina = new Pages({
            html:code, 
            name:name});
    novaPagina
    .save()
    .then(result =>{
            res.json({message:"Página criada com sucesso!", type:'alert-success'});
        })
    .catch(err => {
        res.json({
            message: err.message,
            type: 'alert-danger'
        });
    });
});

router.put('/admin/edit/paginas/:pagina', function(req, res) {
    var pagina = sanitizeHtml(req.body.page.html,optionsSanitize), 
        nome = sanitizeHtml(req.body.page.name),
        paginaId = req.params.pagina;
    
    Pages.findOneAndUpdate({_id:paginaId},{html: pagina, name:nome})
        .then(result=>{
            res.json({message: "Atualização feita com sucesso!", type:'alert-success'});
        })
        .catch(err=>{
            res.json({
                message: err.message,
                type:'alert-danger'
            });
        });
});
        
router.delete('/admin/paginas/:pagina/delete', function(req,res){
    
    Pages.findOneAndDelete({_id:req.params.pagina})
    .then(result =>{
        res.json({message: "Página deletada com sucesso!", type:'alert-danger'});
    })
    .catch(err=>{
        res.json({
            message: err.message,
            type:'alert-danger'
        });
    });
});

module.exports = router;