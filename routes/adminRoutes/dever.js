const express   = require("express"),
    router      = express.Router({mergeParams:true}),
    Dever       = require('../../models/dever'),
    sanitizeHtml = require('sanitize-html');;

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

  router.get('/admin/dever',(req,res)=>{
    var date = new Date(),
        data      = date.getDate()+'/ '+(date.getMonth()+1)+'/ '+date.getFullYear();
    Dever.find({}).sort({'date':-1}).exec((err,dever)=>{
      if(err){
        console.log(err);
        res.render('admin/erro',{message: err.message});
      }else {
        Dever.findOne(
          {
            date:
            {"$gte": new Date(date.getFullYear(),date.getMonth(),date.getDate()), 
             "$lt": new Date(date.getFullYear(),date.getMonth(),date.getDate()+1)
            }
          },(err,deverDia)=>{
            if(err){
              console.log(err);
              res.render('admin/erro',{message: err.message});
            } else if(!deverDia){
              res.render('admin/dever',{dever:dever, h_title:"Gerenciamento", data:data});
            } else {
              res.render('admin/dever',{dever:dever, h_title:"Gerenciamento", data:false});
            }
          });
      }
    });
  });

  // router.get('/admin/dever/cria/cria',(req,res)=>{
  //   var date = new Date(2019,7,3);
  //   Dever.create({date:date,texto:'Um outro dever'},(err,criado)=>{
  //     if(err || !criado){
  //       console.log(err);
  //       res.json({message:'erro',type:'alert-danger'});
  //     } else{
  //       res.json({message:'Salvo!',type:'alert-success'});
  //     } 
  //   });
  // })

  router.put('/admin/dever/:dever_id',(req,res)=>{
    var texto = sanitizeHtml(req.body.texto,optionsSanitize),
        dever_id = req.sanitize(req.params.dever_id);
    Dever.findOneAndUpdate({_id:dever_id},{texto:texto},(err,criado)=>{
      if(err || !criado){
        console.log(err);
        res.json({message:'erro',type:'alert-danger'});
      } else{
        res.json({message:'Salvo!',type:'alert-success'});
      }   
    });
  });

  router.get('/admin/dever/:dever_id/edit',(req,res)=>{
    var dever_id = req.params.dever_id;
    Dever.findById(dever_id,(err,dever)=>{
      if(err){
        console.log(err);
        res.json({message:'Algo deu errado!', type:'alert-danger'});
      } else {
        res.json({dever:dever});
        //Recebe dever no ajax, on click e printa no meio do input do editarDever;
      }
    });
  })

  router.post('/admin/dever',(req,res)=>{
    var date = new Date(),
        texto = sanitizeHtml(req.body.texto, optionsSanitize);
    Dever.findOne(
      {
        date:
        {"$gte": new Date(date.getFullYear(),date.getMonth(),date.getDate()), 
         "$lt": new Date(date.getFullYear(),date.getMonth(),date.getDate()+1)
        }
      },(err,dever)=>{
        if(err){
          console.log(err);
          res.render('admin/erro',{message: err.message});
        } else if(!dever){
          Dever.create({date:date,texto:texto},(err,criado)=>{
              if(err || !criado){
                console.log(err);
                res.json({message:'erro',type:'alert-danger'});
              } else{
                res.json({message:'Salvo!',type:'alert-success'});
              } 
            });
          } else {
            res.json({message:'Já temos dever para o dia!',type:'alert-warning'});
        }
      });
  });

  router.delete('/admin/dever/:dever_id',(req,res)=>{
    var dever_id = req.params.dever_id;
    Dever.findOneAndDelete({_id:dever_id},(err)=>{
      if(err){
        console.log(err);
        res.render('admin/erro',{message: err.message});
      } else {
        res.json({message:'Dever deletado!', type:'alert-danger'});
      }
    })
  });

  module.exports = router;