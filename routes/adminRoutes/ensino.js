const express   = require("express"),
    router      = express.Router({mergeParams:true}),
    Difensino   = require("../../models/ensino"),
    Equipes     = require("../../models/equipe"),
    Gestores    = require("../../models/gestor"),
    multer      = require("multer"),
    fs          = require("fs"),
    ID          = require("../../resources/hash.js"),
    generateView = require('../../functions/generateViews');

    var admin = require("firebase-admin");
    var serviceAccount = require("../../firebaseStorage.json");

    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    //   storageBucket: "colegio-master-243821.appspot.com"
    // });

    const bucket = admin.storage().bucket();
    
    const fileFilter = (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimetype  = fileTypes.test(file.mimetype);
      if (mimetype) {
        cb(null, true);
      } else {
        cb(null, false);
        console.log("Erro no cb filefilter");
      }
    };
    var maxSize = 1024 * 1024 * 5;
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: maxSize
      },
      fileFilter: fileFilter,
      onFileUploadStart: function(file, req, res){
        if(req.files.file.length > maxSize) {
          res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
        }
      }
    });

    function checkOrdem(val){
        if(val == '1'|'2'|'3'){
            return val;
        } else if (val == null||undefined){
            return undefined;
        }
        else {
            return false;
        }
    }
// ------------------------------------------------ 

router.get('/admin/ensino/new', function(req, res) {
    res.render('admin/content/ensino/newEnsino');
});

router.get('/admin/edit/ensino', function(req,res){
    Difensino.find({},function(err,todosEnsinos){
       if(err||!todosEnsinos){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/ensino', {ensinos: todosEnsinos});}
    });
});

router.post('/admin/ensino/new',function(req, res) {
    var EnsTitulo           = req.body.titulo,
        EnsDesc             = req.body.descricao,
        EnsSubdesc          = req.body.subdescricao;
        
        Difensino.create({
            titulo: EnsTitulo,
            descricao: EnsDesc,
            subdescricao: EnsSubdesc
        },function(err,ensino){
            if(err||!ensino){res.render('admin/erro',{message: err.message});}else{
                generateView.ensino();
                generateView.home();
                res.json({message:"Salvo!",type:'alert-success'});}
        });
});

router.post('/admin/ensino/upload/:idEns',upload.single('image'), function(req, res) {
    let file = req.file;
    if (file) {
      uploadImageToStorage(file).then((success) => {
    var urlCompleto = req.file.path,
    // imagem = urlCompleto.slice(6),
    imagem = success,
    ensId  = req.params.idEns,
    defaultImg = '/uploads/default.png';
    
    Difensino.findById({_id:ensId}, function(err,ensino){
        if(err||!ensino){res.render('admin/erro',{message: err.message});}else{
        // if(ensino.URL === defaultImg){
        //     updateEnsino();
        // }else{
        // const pblc = "public",
        //       urlc = pblc.concat(ensino.URL);
        // if(fs.existsSync(urlc)){
        //     fs.unlink(urlc, (err) => {
        //       if (err){ 
        //         console.log(err);
        //         res.status.json({ err: err });
        //         }
        //         updateEnsino();
        //     });
        // }       
        updateEnsino();
        // }
        }
        function updateEnsino(){
            Difensino.findOneAndUpdate({_id: ensId},{URL:imagem},function(err, updated) {
                    if(err||!updated){
                        ensino.URL = defaultImg;
                        ensino.save();
                        res.render('admin/erro',{message: err.message});}else{
                        generateView.ensino();
                        generateView.home();
                        res.json({message: "Salvo!",type:'alert-success'});
                        }
                });
        }
        });
    }).catch((error) => {
        console.error(error);
        res.json({message: "Algo deu errado!",type:'alert-danger'});
    });
    }else{
        res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    };
});

router.put('/admin/edit/ensino/:ensinoId',function(req,res){
    var ensinoId = req.params.ensinoId,
        EnsTitulo           = req.body.titulo,
        EnsDesc             = req.body.descricao,
        EnsSubdesc          = req.body.subdescricao;

        Difensino.findOneAndUpdate({_id:ensinoId},{
            titulo: EnsTitulo,
            descricao: EnsDesc,
            subdescricao: EnsSubdesc
        },function(err,ensinoAtualizado){
            if(err||!ensinoAtualizado){res.render('admin/erro',{message: err.message});}else{
                generateView.ensino();
                generateView.home();
            res.json({message: "Salvo!",type:'alert-success'});}
        });
});

router.delete('/admin/ensino/:ensino/delete',function(req,res){
    var ensinoId = req.params.ensino;
    Difensino.findById(ensinoId, function(err,ensino){
    if(err||!ensino){res.render('admin/erro',{message: err.message});}else{
    const pblc = "public",
    urlc = pblc.concat(ensino.URL);
        if(fs.existsSync(urlc)){
            fs.unlink(urlc, (err) => {
              if (err){ 
                console.log(err);
                res.status.json({ err: err });
                } else{
                deletaEnsino();}
            });
        } else {deletaEnsino()}
    }
        function deletaEnsino(){
            Difensino.findOneAndDelete({_id:ensinoId}, function(err,deletado){
                if(err){res.render('admin/erro',{message: err.message});}else{
                    generateView.ensino();
                    generateView.home();
                   res.json({message:"Deletado com sucesso!",type:'alert-danger'});}
            });
        }
    });
});

//Equipe Gestora
router.get('/admin/ensino/equipes',function(req, res) {
    Equipes.find({},(err,equipes)=>{
       if(err||!equipes){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/ensino/equipes',{equipes:equipes});}
    });
});

router.post('/admin/ensino/equipes',function(req,res){
    Equipes.countDocuments({},(err,numero)=>{
        if(err||!numero){res.render('admin/erro',{message: err.message});}else{
    Equipes.create({titulo: req.body.titulo,ordem:numero+1},(err,criada)=>{
       if(err||!criada){res.render('admin/erro',{message: err.message});}else{
        generateView.ensino();
        generateView.home();
       res.json({message:"Equipe criada!",type:'alert-success'});}
    });
    }
});
});

router.put('/admin/ensino/equipes/:id',function(req,res){
    var titulo  = req.sanitize(req.body.titulo),
        ordemS  = req.sanitize(req.body.ordem),
        ordem   = checkOrdem(ordemS);
    if(ordem){
        Equipes.findOneAndUpdate({_id:req.params.id},{titulo:titulo,ordem:ordem}, function(err,updated){
           if(err||!updated){res.render('admin/erro',{message: err.message});}else{
            generateView.ensino();
            generateView.home();
           res.json({message:"Equipe atualizada!",type:'alert-success'});}
        });
    } else if(ordem === undefined) {
        Equipes.findOneAndUpdate({_id:req.params.id},{titulo:titulo}, function(err,updated){
           if(err||!updated){res.render('admin/erro',{message: err.message});}else{
            generateView.ensino();
            generateView.home();
           res.json({message:"Equipe atualizada!",type:'alert-success'});}
        });
    } else {
        res.json({message:"Houve um erro ao atualizar!",type:'alert-danger'});
    }
});

router.delete('/admin/ensino/equipes/:id',function(req,res){
   Equipes.findOneAndDelete({_id:req.params.id},(err,deletada)=>{
       if(err){res.render('admin/erro',{message: err.message});}else{
       Gestores.deleteMany({_id:{$in: deletada.gestores}},(err,deletado)=>{
       if(err){res.render('admin/erro',{message: err.message});}else{
        generateView.ensino();
        generateView.home();
       res.json({message:"Equipe deletada!",type:'alert-danger'});}
       });
       }
   });
});
//Gestores
router.get('/admin/ensino/equipes/:equipeId/gestores',function(req, res) {
   Equipes.findById(req.params.equipeId).populate("gestores").exec((err,equipe)=>{
       if(err || !equipe){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/ensino/gestores',{gestores:equipe.gestores, equipe:equipe});}
   });
});

router.post('/admin/ensino/equipes/:equipe_id/gestores',function(req, res) {
   Equipes.findById(req.params.equipe_id, function(err, equipe) {
      if(err||!equipe){res.render('admin/erro',{message: err.message});}else{
      Gestores.create({nome:req.body.nome},(err,criado)=>{
      if(err||!equipe){res.render('admin/erro',{message: err.message});}else{
      equipe.gestores.push(criado);
      equipe.save();
      generateView.ensino();
      generateView.home();
      res.json({model:criado});
      }
      });
      }
   });
});

router.post('/admin/ensino/equipes/imagem/:idGestor',upload.single('image'),function(req, res) {
    let file = req.file;
    if (file) {
      uploadImageToStorage(file).then((success) => {
        var urlCompleto = req.file.path,
            // imagem          = urlCompleto.slice(6),
            imagem = success,
            defaultImg      = '/uploads/default.png';;
        Gestores.findById({_id: req.params.idGestor},(err,gestor)=>{
            if(err){res.render('admin/erro',{message: err.message});}else{
                // if(gestor.url===defaultImg){
                    updateGestor();
                // }else{
                //         const pblc  = "public",
                //               urlc  = pblc.concat(gestor.url);
                //     if(fs.existsSync(urlc)){
                //         fs.unlink(urlc, (err)=>{
                //           if (err){ 
                //             console.log(err);
                //             res.status.json({ err: err });
                //             }else{
                //             updateGestor();}
                //         });
                    // }else{  updateGestor();}
                // }
            }
            function updateGestor(){
                Gestores.findOneAndUpdate({_id: req.params.idGestor},{url:imagem},(err,updated)=>{
                    if(err){console.log(err);res.json({message:err.message, type:'alert-danger'});}else{
                        generateView.ensino();
                        generateView.home();
                    res.json({message:"Salvo!", url:imagem, type:'alert-success'});}
                });
            }
        });
    }).catch(error=>{
        res.json({message:'Por favor, insira também uma imagem!', type:'alert-secondary'});
    });
}else{
    res.json({message:'Algo deu errado!', type:'alert-secondary'});
}
});

router.put('/admin/ensino/equipes/gestor/:idGestor',function(req, res) {
     Gestores.findOneAndUpdate({_id:req.params.idGestor},{nome:req.body.nome},(err,updated)=>{
        if(err||!updated){res.render('admin/erro',{message: err.message});}else{
            generateView.ensino();
            generateView.home();
        res.json({message:'Salvo!',type:'alert-success'});}
     });
});

router.delete('/admin/ensino/equipes/gestor/:idGestor',function(req, res) {
   Gestores.findOneAndDelete({_id:req.params.idGestor},(err,deletado)=>{
       if(err){res.render('admin/erro',{message: err.message});}else{
       var  pblc    = "public",
            urlc    = pblc.concat(deletado.url),
            defaultImg = 'public/uploads/default.png';
        console.log(urlc);
        if(fs.existsSync(urlc) && urlc != defaultImg){
            fs.unlink(urlc, (err) => {
              if (err){ 
                console.log(err);
                res.status.json({ err: err });
                }else{
                generateView.ensino();
                generateView.home();
                res.json({message:"Gestor deletado!",type:'alert-danger'});}
            });
        }else{
            generateView.ensino();
            generateView.home();
            res.json({message:"Gestor deletado!", type:'alert-danger'});}
     }
    });
});

const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No image file');
      }
      let newFileName = `${file.originalname}_${Date.now()}`;
  
      let fileUpload = bucket.file(newFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('finish', () => {
        const url = "https://firebasestorage.googleapis.com/v0/b/"+`${bucket.name}`+"/o/"+encodeURI(`${fileUpload.name}`+"?alt=media");
        resolve(url);
      });
  
      blobStream.end(file.buffer);
    });
  }

module.exports = router;