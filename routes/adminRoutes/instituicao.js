const express = require("express"),
    router  = express.Router(),
    Instituicao = require("../../models/institucional");
    
router.get('/admin/edit/instituicao', function(req,res){
    const principal = process.env.principal,
          descricao1= process.env.descricao1,
          descricao2= process.env.descricao2,
          descricao3= process.env.descricao3;
        Instituicao.find({}, function(err,todos){
            if(err||!todos){res.render('admin/erro',{message: err.message});}else{
           res.render('admin/instituicao', {
              Institucional: todos,
               principal: principal,
               descricao1: descricao1,
               descricao2: descricao2,
               descricao3: descricao3
            });}
    });
});

router.put('/admin/edit/instituicao/:instituicao', function(req,res){
    var instituicaoId = req.params.instituicao,
        instituicao   = req.body.instituicao;
   Instituicao.findOneAndUpdate({_id:instituicaoId},instituicao, function(err,done){
      if(err||!done){res.render('admin/erro',{message: err.message});}else{
      res.json({message: "Salvo!",type:'alert-success'});}
   });
});
module.exports = router;