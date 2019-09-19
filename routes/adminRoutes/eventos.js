const express   = require("express"),
    router      = express.Router({mergeParams: true}),
    Eventos     = require("../../models/event"),
    Imagens     = require("../../models/image"),
    multer      = require("multer"),
    fs          = require("fs"),
    ID          = require("../../resources/hash.js"),
    generateView = require('../../functions/generateViews');

    // const storage = multer.diskStorage({
    //   destination: function(req, file, cb) {
    //     cb(null, 'public/uploads/eventos');
    //   },
    //   filename: function(req, file, cb) {
    //     var id = ID();
    //     cb(null,file.fieldname
    //     +'-'+'e-'+Date.now()+id+'-'+file.originalname);
    //   }
    // });
    
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

router.get('/admin/edit/eventos', function(req,res){
   Eventos.find({}, {}, { sort: { 'data_criacao' : -1 } }, (err,todosEventos)=>{
      if(err||!todosEventos){res.render('admin/erro',{message: err.message});}else{
      res.render('admin/eventos', {todosEventos: todosEventos});}
   });
});

router.get('/admin/edit/eventos/:id', function(req,res){
    var eventoId = req.params.id;
    Eventos.findById(eventoId)
    .populate('fotos')
    .exec((err,evento)=>{
       if(err||!evento){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/evento', {evento: evento});}
    });
});

router.get('/admin/evento/new', function(req, res) {
   res.render('admin/content/eventos/newEvento');
});

router.post('/admin/evento/new', function(req,res){
    var titulo = req.body.titulo,
        descricao = req.body.descricao,
        dataCriacao = new Date(),
        evento = new Eventos({
            titulo: titulo,
            descricao: descricao,
            data_criacao: dataCriacao
        });
    Eventos.create(evento,(err,eventoCriado)=>{
       if(err||!eventoCriado){res.render('admin/erro',{message: err.message});}else{
        generateView.home();
        res.json({message:"Evento criado!",evento: eventoCriado._id,type:'alert-success'});}
    });
});

router.post('/admin/eventos/upload/capa/:idEvento',upload.single('image'),(req,res)=>{
    let file = req.file;
    if (file) {
      uploadImageToStorage(file).then((success) => {
    var urlCompleto = req.file.path,
    imagem = success,
    // imagem = urlCompleto.slice(6),
    eventoId  = req.params.idEvento,
    defaultImg = '/uploads/default.png';
    
    // try{
    Eventos.findById(eventoId, function(err,evento){
        if(err||!evento){res.render('admin/erro',{message: err.message});}else{
            const pblc = "public",
                  urlc = pblc.concat(evento.capa);
            // if(evento.capa === defaultImg || !(fs.existsSync(urlc))){
            updateCapa();
            // }else{
            // if(fs.existsSync(urlc)){
            //     fs.unlink(urlc, (err) => {
            //       if (err){ 
            //         console.log(err);
            //         res.json({ err: err });
            //         }
            //         updateCapa();
            //     });
            // }       updateCapa();
            // }
        }
        function updateCapa(){
            Eventos.findOneAndUpdate({_id: eventoId},{capa:imagem},function(err, updated) {
                    if(err||!updated){
                        console.log(err);
                        evento.capa = defaultImg;
                        evento.save();
                        res.json({message: "Ocorreu um erro!", type:'alert-danger'});
                    }
                        generateView.home();
                        res.json({message: "Salvo!", url: imagem, type:'alert-success'});
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

router.post('/admin/eventos/upload/fotos/:idEvento',upload.array('imagens',20), function(req,res){
    try{ 
    var arrayFotos = req.files,
         idEvento   = req.params.idEvento,
         iCount = 0;
         
    arrayFotos.forEach((foto)=>{
        let file = foto;
            if (file) {
            uploadImageToStorage(file).then((success) => {
            var path   = foto.path,
                // imagem = path.slice(6);
                imagem = success;
                Eventos.findById({_id:idEvento}).populate('fotos').exec(function(err,evento){
                    if(err||!evento){res.render('admin/erro',{message: err.message});}else{
                            Imagens.create({URL: imagem},function(err,imgCriada){
                                if(err){
                                    console.log(err);
                                }    
                                evento.fotos.push(imgCriada);
                                evento.save();
                                iCount++;
                                if(iCount === arrayFotos.length){
                                    res.json({message:"Upload completo!", type:'alert-success'});
                                }
                            });
                        }
                });
            });
            // }else{
            //     res.json({message:'Algo deu errado!', type:'alert-secondary'});
            }
        });
    } catch(err){
        res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    }
});

router.put('/admin/evento/:idEvento/', function(req,res){
    var idEvento = req.params.idEvento,
        titulo   = req.body.titulo,
        descricao= req.body.descricao;
    Eventos.findOneAndUpdate({_id:idEvento},{titulo:titulo, descricao:descricao}, (err,eventoAtualizado)=>{
       if(err||!eventoAtualizado){res.render('admin/erro',{message: err.message});}else{
        generateView.home();
       res.json({message:"Salvo!", evento: eventoAtualizado, type:'alert-success'});}
    });
});

router.put('/admin/eventos/:idEvento/images/:idFoto', function(req,res){
    Eventos.findById({_id:req.params.idEvento}).populate('fotos').then((evento)=>{
        evento.fotos.forEach((foto)=>{
            if(foto._id == req.params.idFoto){
                foto.nome = req.body.nome;
                foto.descricao = req.body.descricao;
                foto.save();
                res.json({message:'Salvo!', type:'alert-success'});
            }
        });
    })
    .catch((err)=>{res.render('admin/erro',{message: err.message});});
});

router.delete('/admin/evento/:idEvento', function(req,res){
    var counter = 0;
   Eventos.findOneAndDelete({_id:req.params.idEvento})
   .populate('fotos')
   .exec(function(err, eventoDeletado) {
    if(err){res.render('admin/erro',{message: err.message});}else{
        if(eventoDeletado.fotos.length>0){
            eventoDeletado.fotos.forEach((foto)=>{
                const pblc = "public",
                      urlc = pblc.concat(foto.URL);
                if(fs.existsSync(urlc)){
                    fs.unlink(urlc, (err) => {
                      if (err){ 
                        console.log(err);
                        res.status.json({ err: err });
                        } counter++;
                    if(counter === eventoDeletado.fotos.length){
                        Imagens.deleteMany({_id: {$in: eventoDeletado.fotos}});
                            if(err){res.render('admin/erro',{message: err.message});}else{
                                generateView.home();
                            res.json({message:"Evento excluído com sucesso!", type:'alert-danger'});}
                        }
                    });
                }   if(counter === eventoDeletado.fotos.length){
                        Imagens.deleteMany({_id: {$in: eventoDeletado.fotos}});
                            if(err){res.render('admin/erro',{message: err.message});}else{
                                generateView.home();
                            res.json({message:"Evento excluído com sucesso!", type:'alert-danger'});}
                        }
            });
        } else {
            generateView.home();
        res.json({message:"Evento excluído com sucesso!", type:'alert-danger'});}
    }
    });
});

router.post('/admin/evento/fotos', function(req,res){
    var arrCoded    = req.query.page,
        arrString   = decodeURI(arrCoded),
        pblc        = "public",
        arrCount    = 0,
        arr = JSON.parse(arrString);
    if(arr.length > 0){
    arr.forEach((foto)=>{
    var urlc = pblc.concat(foto.url);
    arrCount++;
    if(fs.existsSync(urlc)){
        fs.unlink(urlc, (err) => {
          if (err){ 
            console.log(err);
            res.status.json({ err: err });
            }
        Imagens.findOneAndDelete({_id:foto.id},(err,fotoDeletada)=>{
                  if(err||!fotoDeletada){res.render('admin/erro',{message: err.message});}else{
                  Eventos.updateOne(
                    { "fotos": foto.id },
                    { "$pull": { "fotos": foto.id } },
                    function (err, res){
                        if (err) throw err;
                        arrCount++;
                    });
                  }
                });
        });
    } else {
        Imagens.findOneAndDelete({_id:foto.id},(err,fotoDeletada)=>{
                  if(err){res.render('admin/erro',{message: err.message});}else{
                  Eventos.updateOne(
                    { "fotos": foto.id },
                    { "$pull": { "fotos": foto.id } },
                    function (err,res){
                        if (err){
                            console.log(err);
                        }
                    });
                  }
                });
    }
        if(arrCount === arr.length){
        res.json({message: "Imagens deletadas com sucesso!",type:'alert-danger'});
        }
    });
    } else {
        res.json({message: "Por favor, escolha alguma imagem para ser deletada!",type:'alert-warning'});
    }
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