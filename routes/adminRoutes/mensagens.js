const express   = require("express"),
    router      = express.Router(),
    Mensagens   = require("../../models/mensagem");
    
router.get('/admin/mensagens', function(req,res){
   Mensagens.find({}, {}, { sort: { 'data_criacao' : -1 } },(err,todasMensagens)=>{
      if(err||!todasMensagens){res.render('admin/erro',{message: err.message});}else{
      res.render('admin/mensagens',{mensagens:todasMensagens});}
   });
});

router.get('/admin/mensagens/:mensagem_id', function(req,res){
   Mensagens.findById(req.params.mensagem_id, (err,msg)=>{
      if(err||!msg){res.render('admin/erro',{message: err.message});}else{
      res.render('admin/content/mensagens/mensagem', {mensagem:msg});}
   });
});

router.post('/contato/mensagem', function(req,res){
   const sanitizedNome = req.sanitize(req.body.message.nome),
         sanitizedEmail = req.sanitize(req.body.message.email),
         sanitizedTelefone = req.sanitize(req.body.message.telefone),
         sanitizedTexto = req.sanitize(req.body.message.texto),
         messageStr      = sanitizedTelefone,
         messageStrTel   = messageStr.replace(/\(|\)|\-|\+/g, ''),
         messageTelNum   = Number(messageStrTel),
         dataCriacao = new Date();
   if(!(isNaN(messageTelNum))){
   Mensagens.create({nome:sanitizedNome,email:sanitizedEmail,telefone:messageTelNum,texto:sanitizedTexto,data_criacao:dataCriacao}, (err,mensagem)=>{
      if(err||!mensagem){
         res.json({message:"Houve um erro e não conseguimos enviar sua mensagem - "+err.message, type:'alert-danger'});
      } else {
         res.json({message:"Mensagem enviada com sucesso!", type:'alert-success'});
      }
   });
   } else {
   res.json({message:"Por favor, preencha todos os campos corretamente!", type:'alert-danger'});
   }
});

router.delete('/admin/mensagem/:id',function(req,res){
   Mensagens.findOneAndDelete({_id:req.params.id},(err,deletado)=>{
     if(err){res.render('admin/erro',{message: err.message});}else{
     res.json({message:'Mensagem apagada!', type:'alert-danger'});}
   });
});

module.exports = router;