const express   = require("express"),
    router      = express.Router(),
    Difensino   = require("../../models/diferencial"),
    multer      = require("multer"),
    fs          = require("fs"),
    ID          = require("../../resources/hash.js"),
    https       = require('https'),
    generateView = require('../../functions/generateViews');

    // const storage = multer.diskStorage({
    //   destination: function(req, file, cb) {
    //     cb(null, 'public/uploads/diferenciais');
    //   },
    //   filename: function(req, file, cb) {
    //     var id = ID();
    //     cb(null,file.fieldname
    //     +'-'+'d-'+Date.now()+id+'-'+file.originalname);
    //   }
    // });

    var admin = require("firebase-admin");

    var serviceAccount = require('../../firebaseStorage.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "colegio-master-243821.appspot.com"
    });

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

// ------------------------------------------------ 

router.get('/admin/diferencial/new', function(req, res) {
    res.render('admin/content/diferenciais/newDif');
});

router.get('/admin/edit/diferencial', function(req,res){
    Difensino.find({},function(err,todosDif){
       if(err||!todosDif){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/diferenciais', {diferenciais: todosDif});
       }
    });
});

router.post('/admin/diferencial/new',function(req, res) {
    var DifTitulo           = req.body.titulo,
        DifDesc             = req.body.descricao;
        
        Difensino.create({
            titulo: DifTitulo,
            descricao: DifDesc
        },function(err,diferencial){
            if(err||!diferencial){res.render('admin/erro',{message: err.message});}else{
              generateView.home();
                res.json({message:"Salvo!",type:'alert-success'});
            }
        });
});

router.post('/admin/diferencial/upload/:idDif',upload.single('image'), function(req, res) {
  let file = req.file;
  if (file) {
    uploadImageToStorage(file).then((success) => {
    var urlCompleto = req.file.path,
    // imagem = urlCompleto.slice(6),
    imagem = success,
    difId  = req.params.idDif,
    defaultImg = '/uploads/default.png';
    Difensino.findById({_id:difId}, function(err,diferencial){
        if(err||!diferencial){res.render('admin/erro',{message: err.message});}else{
            // if(diferencial.URL === defaultImg){
            update();
            // }else{
            // const pblc = "public",
            //       urlc = pblc.concat(diferencial.URL);
            // if(fs.existsSync(urlc)){
            //     fs.unlink(urlc, (err) => {
            //       if (err){ 
            //         console.log(err);
            //         res.status.json({ err: err });
            //         }
                    // update();
                // });
            // } else{
              // update();
            // }
            }
            function update(){
                Difensino.findOneAndUpdate({_id: difId},{URL:imagem},function(err, updated) {
                        if(err||!updated){
                            diferencial.URL = defaultImg;
                            diferencial.save();
                            res.render('admin/erro',{message: err.message});}else{
                              generateView.home();
                            res.json({url: imagem,message: "Salvo!",type:'alert-success'});}
                        
                }); 
            // }
        }
        });
    }).catch((error) => {
      console.error(error);
      res.json({message: "Algo deu errado!",type:'alert-danger'});
    });
  } else {
    res.json({message: "Algo deu errado!",type:'alert-danger'});
  }
});

router.put('/admin/edit/diferencial/:diferencial',function(req,res){
    var diferencialId = req.params.diferencial,
        DifTitulo           = req.body.titulo,
        DifDesc             = req.body.descricao;

        Difensino.findOneAndUpdate({_id:diferencialId},{
            titulo: DifTitulo,
            descricao: DifDesc
        },function(err,diferencialAtualizado){
            if(err||!diferencialAtualizado){res.render('admin/erro',{message: err.message});}else{
              generateView.home();
            res.json({message: "Salvo!",type:'alert-success'});}
        });
});

router.delete('/admin/diferencial/:diferencial/delete',function(req,res){
    var diferencialId = req.params.diferencial;
    Difensino.findById(diferencialId, function(err,ensino){
    if(err||!ensino){res.render('admin/erro',{message: err.message});}else{
    const pblc = "public",
    urlc = pblc.concat(ensino.URL);
        if(fs.existsSync(urlc)){
            fs.unlink(urlc, (err) => {
              if (err){ 
                console.log(err);
                res.status.json({ err: err });
                } else{
                deletaDiferencial();}
            });
        } else {deletaDiferencial()}
    }
        function deletaDiferencial(){
            Difensino.findOneAndDelete({_id:diferencialId}, function(err,deletado){
                if(err){res.render('admin/erro',{message: err.message});}else{
                  generateView.home();
                   res.json({message:"Deletado com sucesso!",type:'alert-danger'});}
            });
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

function checkIfExists(fileURL){
  https.get(fileURL,res=>{
    if(typeof res.message.error !== undefined){
      return false;
    } else {
      return true;
    }
  })
}

module.exports = router;