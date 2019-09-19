const express   = require("express"),
    router      = express.Router(),
    multer      = require("multer"),
    fs          = require("fs"),
    BannerPrim  = require("../../models/bannerPrimario"),
    BannerSecu  = require("../../models/bannerSecundario"),
    Documentos  = require("../../models/document"),
    Paginas     = require("../../models/page"),
    Menus       = require("../../models/menu"),
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
    
    // const storageDoc = multer.diskStorage({
    //   destination: function(req, file, cb) {
    //     cb(null, 'public/uploads/documentos');
    //   },
    //   filename: function(req, file, cb) {
    //     cb(null,file.fieldname
    //     +'-'+Date.now()+'-'+file.originalname);
    //   }
    // });
    
    const fileFilterDoc = (req, file, cb) => {
        const fileTypes = /pdf|xlsx|docx|doc/;
        const mimetype  = fileTypes.test(file.mimetype);
      if (mimetype) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    };
    
    const uploadDoc = multer({
    storage: multer.memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 5
      },
      fileFilter: fileFilterDoc,
      onError : function(err, next) {
      console.log('error', err);
      next(err);
      }
    });

//Banners

router.get('/admin/home', function(req,res){
   res.render('admin/home');
});

router.get('/admin/home/banners', function(req,res){
    BannerPrim.find({},function(err,todosBannersPrim){
       if(err||!todosBannersPrim){res.render('admin/erro',{message: err.message});}else{
       BannerSecu.find({},function(err,todosBannersSecu){
       if(err||!todosBannersSecu){res.render('admin/erro',{message: err.message});}else{
       res.render('admin/content/home/banners',{bannersPrincipais: todosBannersPrim, bannersSecundarios: todosBannersSecu});
       }
       });
       }
    });
});

router.post('/admin/home/banners/:tipo',function(req, res) {
    var tipo = req.params.tipo,
        nome = req.body.nome,
        banner = {
            nome: nome
        };
    if(tipo === 'primario'){
        criaModel(BannerPrim);
    } else if (tipo === 'secundario'){
        criaModel(BannerSecu);
    }
    else {
        res.json({message: 'Requisição sem a solicitação do tipo!', type:'alert-secondary'});
    }
    function criaModel(model){
    model.create(banner, function(err,criado){
            if(err||!criado){res.render('admin/erro',{message: err.message});}else{
            generateView.home();
            res.json({model: criado});}
        });
    }
});

router.post('/admin/home/banners/:tipo/:id',upload.single('image'),function(req, res) {
    let file = req.file;
    if(file){
    uploadImageToStorage(file).then((success) => {
    var tipo        = req.params.tipo,
        idBanner    = req.params.id,
        // imagem      = urlCompleto.slice(6),
        imagem      = success;

    if(tipo === 'primario'){
        criaModel(BannerPrim,'primário');
    } else if (tipo === 'secundario'){
        criaModel(BannerSecu,'secundário');
    }
    else {
        res.json({message: 'Requisição sem a solicitação do tipo!', type:'alert-secondary'});
    }
    function criaModel(model,message){
        model.findById(idBanner,(err,banner)=>{
            if(err||!banner){res.render('admin/erro',{message: err.message});}else{
            // if(banner.url === defaultImg){
                updateBanner(model);
            // }else{
            // const pblc = "public",
            //       urlc = pblc.concat(banner.url);
            // if(fs.existsSync(urlc)){
            //     fs.unlink(urlc, (err) => {
            //       if (err){ 
            //         console.log(err);
            //         res.status.json({ err: err });
            //         }
            //         updateBanner(model);
            //     });
            // }       updateBanner(model);
            // }
            }
            function updateBanner(model){
                model.findOneAndUpdate({_id:idBanner},{url:imagem}, function(err,atualizado){
                    if(err||!atualizado){res.render('admin/erro',{message: err.message});}else{
                    generateView.home();
                    res.json({message:"Banner "+message+" salvo!", type:'alert-success'});}
                });
            }
        });
    }
    }).catch(()=>{
        res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    });
    }else{
    res.json({message:'Algo deu errado!', type:'alert-secondary'});
    }
});

router.put('/admin/home/banners/:id',(req,res)=>{
    BannerPrim.findOne({_id:req.params.id},(err,banner)=>{
        if(err){
            res.json({message:'Algo deu errado',type:'alert-secondary'});
        } else if(banner.mobile){
            BannerPrim.findOneAndUpdate({_id:req.params.id},{mobile:false},(err)=>{
                if(err){
                    res.json({message:'Algo deu errado',type:'alert-secondary'});
                } else{
                    generateView.home();
                    res.json({message:'Atualizado!', type:'alert-success'});
                }
            });
        } else{
            BannerPrim.findOneAndUpdate({_id:req.params.id},{mobile:true},(err)=>{
                if(err){
                    res.json({message:'Algo deu errado',type:'alert-secondary'});
                } else{
                    generateView.home();
                    res.json({message:'Atualizado!', type:'alert-success'});
                }
            });
        }
    });
});

router.delete('/admin/home/banners/:tipo/:id', function(req,res){
    if(req.params.tipo === 'primario'){
        deletaBanner(BannerPrim);
    }
    if(req.params.tipo === 'secundario'){
        deletaBanner(BannerSecu);
    }
    function deletaBanner(model){
        var defaultImg  = '/uploads/default.png';
        model.findOneAndDelete({_id:req.params.id},function(err,deletado){
           if(err){res.render('admin/erro',{message: err.message});}else{
           const pblc = "public",
              urlc = pblc.concat(deletado.url);
            if(fs.existsSync(urlc) && deletado.url!==defaultImg){
                fs.unlink(urlc, (err) => {
                  if (err){res.render('admin/erro',{message: err.message});}else{
                generateView.home();
                res.json({message:"Deletado com sucesso!", type:'alert-danger'});}
                });
            }else{
            generateView.home();
            res.json({message:"Deletado com sucesso!",type:'alert-danger'});}
            }
           });
    }
});

//Documentos
router.get('/admin/home/documentos', function(req, res) {
   Documentos.find({},(err,todosDocs)=>{
      if(err||!todosDocs){res.render('admin/erro',{message: err.message});}else{
      res.render('admin/content/home/documentos',{documentos: todosDocs});}
   });
});

router.post('/admin/home/documentos',function(req, res) {
    var data = new Date(),
        nome = data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear()+" - "+req.body.nome;
    Documentos.create({nome:nome}, function(err,criado){
            if(err||!criado){res.render('admin/erro',{message: err.message});}else{
            generateView.home();
            res.json({model: criado});}
        });
});

router.post('/admin/home/documentos/:id',uploadDoc.single('document'),function(req, res) {
    let file = req.file;
    if(file){
        uploadImageToStorage(file).then((success) => {
    var idDocumento    = req.params.id;
        // if(req.file !== undefined|null){
            var // imagem      = urlCompleto.slice(6)
            imagem = success;
            var documentObj = {
                    url: imagem
            };
            Documentos.findById({_id:idDocumento},(err,banner)=>{
                if(err||!banner){res.render('admin/erro',{message: err.message});}else{
                // if(banner.url === undefined){
                    updateDoc();
                // }else{
                // const pblc = "public",
                //       urlc = pblc.concat(banner.url);
                // if(fs.existsSync(urlc)){
                //     fs.unlink(urlc, (err) => {
                //       if (err)
                //         {res.render('admin/erro',{message: err.message});}else{
                //         updateDoc();
                //         }
                //     });
                // }       updateDoc();
                // }
                }
                    function updateDoc(){
                        Documentos.findOneAndUpdate({_id:idDocumento},documentObj, function(err,criado){
                            if(err||!criado){res.render('admin/erro',{message: err.message});}else{
                            generateView.home();
                            res.json({message:'Documento enviado!', type:'alert-success'});}
                        });
                    }
                });
        // } else {  
        //    Documentos.findOneAndDelete({_id: idDocumento},function(err,deletado){
        //     if(err){console.log(err);res.json({message:err.message, type:'alert-danger'});}
        //     res.json({message:'Por favor, escolha um documento!', type:'alert-secondary'});
        //     });
        // }
    }).catch(()=>{
        res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    });
    }else{
    res.json({message:'Algo deu errado!', type:'alert-secondary'});
    }
});

router.put('/admin/home/documentos/regramento/:id',(req,res)=>{
    Documentos.findOne({regramento:true},(err,documento)=>{
        if(err){
            console.log(err);
        } else if(!documento) {
            Documentos.findOneAndUpdate({_id:req.params.id},{regramento:true},(err)=>{
                if(err){
                    console.log(err);
                } else {
                    generateView.home();
                    res.json({message:'Definido como regramento!', type:'alert-success'})
                }
            });
        } else {
            Documentos.findOneAndUpdate({_id:documento._id},{regramento:false},(err)=>{
                if(err){
                    console.log(err);
                } else {
                    Documentos.findOneAndUpdate({_id:req.params.id},{regramento:true},(err)=>{
                        if(err){
                            console.log(err);
                        } else {
                            generateView.home();
                            res.json({message:'Definido como regramento!', type:'alert-success'})
                        }
                    });
                }
            });
        }
    });
});

router.delete('/admin/home/documentos/:id', function(req,res){
        Documentos.findOneAndDelete({_id:req.params.id},function(err,deletado){
           if(err){res.render('admin/erro',{message: err.message});}else{
           if(deletado.url === null){
                generateView.home();
               res.json({message:"Deletado com sucesso!", type:'alert-danger'});
           } else {
           const pblc = "public",
              urlc = pblc.concat(deletado.url);
            if(fs.existsSync(urlc)){
                fs.unlink(urlc, (err) => {
                  if (err){res.render('admin/erro',{message: err.message});}
                generateView.home();
                res.json({message:"Deletado com sucesso!", type:'alert-danger'});
                });
            } else{
            generateView.home();
            res.json({message:"Deletado com sucesso!", type:'alert-danger'});
            }
           }
           }
        });
});

router.get('/admin/home/menus',function(req, res) {
    Menus.findMenu({},function(err,todosMenus){
        Menus.countDocuments({},(err,totalDeMenus)=>{
        if(err||!todosMenus){res.render('admin/erro',{message: err.message});}else{
        Paginas.find({}, function(err, todasPaginas) {
            if(err)console.log(err);
            res.render('admin/content/home/menus', {menus: todosMenus, paginas: todasPaginas, totalDeMenus: totalDeMenus});
        });
        }
        });
    });
});

router.post('/admin/home/menus',function(req, res) {
    Menus.countDocuments({},(err,totalDeMenus)=>{
        if(err)console.log(err);
        var totalMenus  = Number(totalDeMenus)+1,
            nome        = req.sanitize(req.body.nome),
            url         = req.sanitize(req.body.url);
        Menus.create({
            nome:nome, 
            url:url,
            ordem:totalMenus
            })
        .then(() =>{
            generateView.home();
                res.json({message:"Menu criado!", type:'alert-success'});
            })
        .catch(err => {
            res.json({
                message: err.message,
                type:'alert-danger'
            });
        });
    });
});

router.put('/admin/home/:menu_id/ordem',(req,res)=>{
    var menuId  = req.sanitize(req.params.menu_id),
        ordem   = req.sanitize(req.body.ordem);
    Menus.findOne({ordem:ordem},(err,menuAntigo)=>{
        if(err){
            console.log(err);
            return err;
        } else if (!menuAntigo) {
            Menus.findByIdAndUpdate(menuId,{ordem:ordem},(err)=>{
                if(err){console.log(err);
                    res.json({message:'Algo deu errado!', type:'alert-success'});}else{
                generateView.home();
                res.json({message:'Ordem do menu alterada!', type:'alert-success'});}
            });
        } else {
            Menus.findById(menuId,(err,menu)=>{
                if(err){console.log(err);
                    res.json({message:'Algo deu errado!', type:'alert-success'});}
                else{
                    Menus.findByIdAndUpdate(menuAntigo._id,{ordem:menu.ordem},(err)=>{
                        if(err){console.log(err);
                        res.json({message:'Algo deu errado!', type:'alert-success'});}
                        else{
                            menu.ordem = ordem;
                            menu.save();
                            generateView.home();
                            res.json({message:'Ordem do menu alterada!', type:'alert-success'});
                        }
                            });
                        }
                    });
                }   
    })
});

router.put('/admin/home/menus/plataformas/:id',(req,res)=>{
    Menus.findById(req.params.id,(err,menu)=>{
        if(err){
            console.log(err);
        } else if(menu.plataformas) {
            Menus.findOneAndUpdate({_id:req.params.id},{plataformas:false},(err)=>{
                if(err){
                    console.log(err);
                } else {
                    generateView.home();
                    res.json({message:'Retirado menu plataforma!', type:'alert-secondary'});
                }
            });
        } else {
            Menus.findOneAndUpdate({_id:req.params.id},{plataformas:true},(err)=>{
                if(err){
                    console.log(err);
                } else {
                    generateView.home();
                    res.json({message:'Adicionado menu plataforma!', type:'alert-secondary'});
                }
            });
        }
    });
});

router.delete('/admin/home/menus/:id', function(req, res) {
   Menus.findOneAndDelete({_id:req.params.id},function(err){
       if(err){res.render('admin/erro',{message: err.message});}else{
    generateView.home();
       res.json({message:"Deletado!", type:'alert-danger'});}
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