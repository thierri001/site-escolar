const { errHandleRedirect, errHandleJson } = require("./errHandle");
const   express         = require("express"),
        router          = express.Router({mergeParams:true}),
        fs              = require('fs'),
        User            = require('../../models/user'),
        Perfil          = require('../../models/Blog/Perfil'),
        ID              = require('../../resources/hash'),
        multer          = require('multer'),
        middleware      = require('../../middleware/index'),
        path            = require('path'),
        Post            = require('../../models/Blog/post'),
        Trofeus         = require('../../models/Blog/trofeu');


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

router.get('/blog/perfil/:usuario_nome',(req,res)=>{
    try{
    var currentUser = req.user;
    User.findOne({username:req.sanitize(req.params.usuario_nome)})
    .populate('perfil')
    .exec((err,usuario)=>{
        if(err||!usuario){
            if(err != null){
                console.log(err);
                res.render('blog/erro',{message:err.message, h_title:'Erro'});
            } else{
                res.render('blog/erro',{h_title:'Erro 404'});
            }
        } else {
            Perfil.findById(usuario.perfil._id)
            .populate('trofeus')
            .exec((err,perfil)=>{
                if(err||!perfil){
                    if(err != null){
                        console.log(err);
                        res.render('blog/erro',{message:err.message, h_title:'Erro'});
                    } else{
                        res.render('blog/erro',{h_title:'Erro 404'});
                    }
                } else {
                    if(currentUser){
                        if(currentUser.tipoConta === 1){
                        Trofeus.find({},(err,trofeus)=>{
                            if(err){
                                console.log(err);
                            }
                            res.render('blog/perfilPublico',{perfil:perfil,foto:usuario.foto,h_title:'Blog',trofeus:trofeus});
                        });
                        } else {res.render('blog/perfilPublico',{perfil:perfil,foto:usuario.foto,h_title:'Blog'});}
                    } else {res.render('blog/perfilPublico',{perfil:perfil,foto:usuario.foto,h_title:'Blog'});}
                }
            });
        }
    });
}catch{
    errHandleRedirect(res);
}
}); 

router.get('/blog/perfil',middleware.isLoggedIn,(req,res)=>{
    try{
    var currentUser = req.user;
    User.findById({_id:currentUser._id}).populate('perfil').exec((err,usuario)=>{
        if(err||!usuario){
            if(err != null){
                console.log(err);
                res.render('blog/erro',{message:err.message, h_title:'Erro'});
            } else{
                res.render('blog/erro',{h_title:'Erro'});
            }
        } else {
            Perfil.findOne({_id:usuario.perfil._id}).populate('trofeus').exec((err,perfil)=>{
                if(err){
                    console.log(err);
                } else {
                    res.render('blog/perfil',{usuario:usuario,perfil:perfil,h_title:'Blog Perfil | '+usuario.username});
                }
            });
        }
    });
}catch{
    errHandleRedirect(res);
}
}); 

router.post('/post/perfil/:usuario_nome/foto',upload.single('image'),middleware.donoDoPerfil,(req,res)=>{
    try{
    let file = req.file;
    if(file){
        uploadImageToStorage(file).then((success) => {
            var currentUser = req.user,
            urlCompleto     = req.file.path,
            // imagem          = urlCompleto.slice(6),
            imagem          = success,
            defaultImg      = '/uploads/usuarioDefault.png';

        User.findOne({_id:currentUser._id})
        .populate('perfil')
        .exec((err,user)=>{
            if(err||!user){
                if(err != null){
                    console.log(err);
                    res.render('blog/erro',{message:err.message, h_title:'Erro'});
                } else{
                    res.json({message:'Usuário não encontrado, contate o administrador!', type:'alert-warning'});
                }
            } else {
                // if(user.foto !== defaultImg){
                // var pblc = "public",
                //     urlc = pblc.concat(user.foto);
                //     if(fs.existsSync(urlc)){
                //     fs.unlink(urlc, (err) => {
                //             if (err){ 
                //                 console.log(err);
                //                 } else{
                //     updateFoto();
                //      }
                //     });
                //     } else {
                //     updateFoto();
                //     }
                // } else {
                    updateFoto();
                // }
            }
            function updateFoto() {
                        user.foto = imagem;
                        user.save();
                        res.json({message: 'Salvo!', type: 'alert-success'});
            }
        });
    }).catch(err=>{
        res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    });
    }else{
    res.json({message:'Algo deu errado! Tente novamente!', type:'alert-secondary'});
    }
}catch{
errHandleJson(res);
}
}); 

router.put('/blog/perfil/:usuario_nome/:perfil_id',middleware.donoDoPerfil,(req,res)=>{
    try{
    var currentUser = req.user,
        perfil      = {
            nome: req.sanitize(req.body.nome),
            email: req.sanitize(req.body.email),
            escola: req.sanitize(req.body.escola),
        };
    User.findById(currentUser._id).populate('perfil').exec((err,user)=>{
        if(err){
            console.log(err);
            res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
        } else {
            Perfil.findOneAndUpdate({_id:req.sanitize(req.params.perfil_id)},perfil,(err,updated)=>{
                if(err){
                    console.log(err);
                    res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
                }else{
                    user.perfil = updated;
                    user.save();
                    res.json({message:'Perfil atualizado!',type:'alert-success'});
                }
            });
        }
    });
}catch{
errHandleJson(res);
}
}); 

router.put('/blog/trofeu/:perfil_id',middleware.blogRole,middleware.moderador,(req,res)=>{
    try{
    Trofeus.findById(req.sanitize(req.body.trofeu_id),(err,trofeu)=>{
        if(err){
            console.log(err);
            res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
        } else {
            Perfil.findById(req.params.perfil_id,(err,perfil)=>{
                if(err){
                    console.log(err);
                    res.json({message:'Ocorreu um erro na solicitação', type:'alert-danger'});
                } else {
                    perfil.trofeus.push(trofeu);
                    perfil.save();
                    res.json({message:perfil.nome+' recebeu o trofeu: '+trofeu.nome, type:'alert-success'});
                }
            });
        }
    });
}catch{
errHandleJson(res);
}
}); 

router.delete('/blog/post/delete/trofeu/:perfil_id/:trofeu_id',middleware.blogRole,middleware.moderador,(req,res)=>{
    try{
            Trofeus.findById(req.sanitize(req.params.trofeu_id),(err,trofeu)=>{
                if(err||!trofeu){
                    console.log(err);
                    res.json({message:'Ocorreu um erro ao deletar!', type:'alert-danger'});
                } else {
                    Perfil.updateOne(
                        {_id: req.sanitize(req.params.perfil_id)},
                        { "$pull": { "trofeus": trofeu._id } },
                        function (err){
                            if (err) console.log(err); res.json({message:'Ocorreu um erro ao deletar!', type:'alert-danger'});
                            res.end();
                    });
                }
    });
    function arrayRemove(arr, value) {
        return arr.filter(function(ele){
            return ele != value;
        });
     
     }
    }catch{
errHandleJson(res);
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
