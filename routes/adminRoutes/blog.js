const   express         = require("express"),
        router          = express.Router({mergeParams:true}),
        sanitizeHtml    = require('sanitize-html'),
        User            = require("../../models/user"),
        Posts           = require('../../models/Blog/post'),
        Comentarios     = require('../../models/Blog/comentario'),
        Instituicao     = require('../../models/institucional'),
        Categoria       = require('../../models/Blog/categoria')
        Assunto         = require('../../models/Blog/assunto'),
        Trofeus         = require('../../models/Blog/trofeu'),
        multer          = require('multer'),
        fs              = require("fs"),
        middlewareS     = require('../../middleware/upload-firebase'),
        ID              = require("../../resources/hash.js");

    // // Alterar assuntos posts tem que ser de 1 em 1

    //  const storage = multer.diskStorage({
    //   destination: function(req, file, cb) {
    //     cb(null, 'public/uploads/eventos');
    //   },
    //   filename: function(req, file, cb) {
    //     var id = ID();
    //     cb(null,file.fieldname
    //     +'-'+'e-'+Date.now()+id+'-'+file.originalname);
    //   }
    // });
    
    // var admin = require("firebase-admin");

    // // admin.initializeApp({
    // //   credential: admin.credential.cert(serviceAccount),
    // //   storageBucket: "colegio-master-243821.appspot.com"
    // // });

    // const bucket = admin.storage().bucket();
    
    // const fileFilter = (req, file, cb) => {
    //     const fileTypes = /jpeg|jpg|png/;
    //     const mimetype  = fileTypes.test(file.mimetype);
    //   if (mimetype) {
    //     cb(null, true);
    //   } else {
    //     cb(null, false);
    //     console.log("Erro no cb filefilter");
    //   }
    // };
    // var maxSize = 1024 * 1024 * 5;
    // const upload = multer({
    //   storage: multer.memoryStorage(),
    //   limits: {
    //     fileSize: maxSize
    //   },
    //   fileFilter: fileFilter,
    //   onFileUploadStart: function(file, req, res){
    //     if(req.files.file.length > maxSize) {
    //       res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
    //     }
    //   }
    // });
    var optionsSanitize = {
        allowedTags: ['i'],
        allowedAttributes:{ 
            i:['class']
        }
    }

router.get('/admin/blog',(_req,res)=>{
    res.render('admin/blog');
});

router.get('/admin/blog/usuarios',(_req,res)=>{
    var numero  = Number('1');
    User.find({tipo:1}).limit(10).exec((err,usuarios)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            if(usuarios.length === 0){
                res.render('admin/blog/usuarios',{usuarios:usuarios, contagem:false, numeroPesquisa:numero, maiorQue10: false, numeroDocs:false});
            } else {
            User.countDocuments({tipo:1},(err,total)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    var numeroP = total/10;
                        if(Number.isInteger(numeroP)){
                        var numeroDocs = numeroP;
                        res.render('admin/blog/usuarios',{usuarios:usuarios, contagem:total,numeroPesquisa:numero, maiorQue10:true, numeroDocs:numeroDocs});
                        } else {
                        var numeroDocs = Math.floor(numeroP)+1;
                        res.render('admin/blog/usuarios',{usuarios:usuarios, contagem:total,numeroPesquisa:numero, maiorQue10:false, numeroDocs:numeroDocs});
                        }
                }
            });
            }
        }
    });
});

router.get('/admin/blog/usuarios/search/:pagina',(req,res)=>{
    var numero  = Number(req.params.pagina),
        skip     = ((numero-1)*10)-1;
    if(isNaN(skip)){
        res.redirect('/admin/gerenciamento');
    }
    if(skip < 0){
        skip = 0;
    }
    User.find({tipo:1}).skip(skip).limit(10).exec((err,usuarios)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            var tamanhoUsuarios = usuarios.length;
            if(tamanhoUsuarios === 10){
            User.countDocuments({},(err,total)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    if(numero  <= 0){
                        numero = 1;
                    }
                    var numeroP = total/10;
                    if(Number.isInteger(numeroP)){
                    var numeroDocs = numeroP;
                    res.render('admin/blog/usuarios', {usuarios:usuarios, numeroPesquisa: numero, maiorQue10: true, numeroDocs:numeroDocs, contagem:false});
                    } else {
                    var numeroDocs = Math.floor(numeroP)+1;
                    res.render('admin/blog/usuarios', {usuarios:usuarios, numeroPesquisa: numero, maiorQue10: true, numeroDocs:numeroDocs, contagem:false});
                    }
                }
            });
            } else {
                if(numero < 7){
                    if(numero <= 0){
                        numero = 1;
                    }
                    res.render('admin/blog/usuarios', {usuarios:usuarios, numeroPesquisa: numero, maiorQue10: false, numeroDocs:false, contagem:false});
                } else {
                    User.countDocuments({},(err,total)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                        var numeroP = total/10;
                        var numeroDocs = numeroP;
                        res.render('admin/blog/usuarios', {usuarios:usuarios, numeroPesquisa: numero, maiorQue10: false, numeroDocs:numeroDocs, contagem:false});
                        }
                    });
                }
            }
        }
    });
});

router.post('/admin/usuarios/search',(req,res)=>{
    User.find({username:{$regex:req.sanitize(req.body.search), $options: 'i'},tipo:1}).limit(10).exec((err,usuarios)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        }else{
            res.render('admin/blog/usuarios',{usuarios:usuarios,contagem:false, numeroPesquisa:false, numeroDocs:false});
        }
    });
});

router.get('/admin/blog/posts',(_req,res)=>{
    var numero  = Number('1');
    Posts.find({}).limit(10).exec((err,posts)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Assunto.find({},(err,assuntos)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else{
                    var tamanhoPosts = posts.length;
                    if(tamanhoPosts === 10){
                    Posts.countDocuments({},(err,total)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                            var numeroP = total/10;
                            if(Number.isInteger(numeroP)){
                            var numeroDocs = numeroP;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            } else {
                            var numeroDocs = Math.floor(numeroP)+1;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            }
                        }
                    });
                    } else {
                        if(numero < 7){
                            if(numero < 0){
                                numero = 0;
                                res.redirect('back');
                            } else {
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:false});}
                        } else {
                            Posts.countDocuments({},(err,total)=>{
                                if(err){
                                    console.log(err);
                                    res.render('admin/erro',{message: err.message});
                                } else {
                                var numeroP = total/10;
                                var numeroDocs = numeroP;
                                res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos, numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs});
                                }
                            });
                        }
                    }
                }
            });
        }
    });
});

router.delete('/admin/blog/post/delete/:id', function(req,res){
    try{
    Posts.findOneAndDelete({_id:req.params.id},(err,deleted)=>{
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

router.get('/admin/blog/posts/search/:pagina',(req,res)=>{
    var numero  = Number(req.sanitize(req.params.pagina)),
        skip    = ((numero-1)*10)-1;
    if(isNaN(skip) && isNaN(numero)){
        res.redirect('/admin/gerenciamento');
    }
    if(skip < 0){
        skip = 0;
    }
    Posts.find({}).skip(skip).limit(10).exec((err,posts)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Assunto.find({},(err,assuntos)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else{
                    var tamanhoPosts = posts.length;
                    if(tamanhoPosts === 10){
                        if(numero  <= 0){
                            numero = 1;
                        }
                    Posts.countDocuments({},(err,total)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                            var numeroP = total/10;
                            if(Number.isInteger(numeroP)){
                            var numeroDocs = numeroP;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos, numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            } else {
                            var numeroDocs = Math.floor(numeroP)+1;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos, numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            }
                        }
                    });
                    } else {
                        if(numero < 7){
                            if(numero <= 0){
                                numero = 1;
                            }
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos, numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:false});
                        } else {
                            Posts.countDocuments({},(err,total)=>{
                                if(err){
                                    console.log(err);
                                    res.render('admin/erro',{message: err.message});
                                } else {
                                var numeroP = total/10;
                                var numeroDocs = numeroP;
                                res.render('admin/blog/posts', {posts:posts, tituloAssunto:false, assuntos:assuntos, numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs});
                                }
                            });
                        }
                    }
                }
            });
        }
    });
});

router.get('/admin/blog/posts/search/:pagina/:assunto',(req,res)=>{
    var numero      = Number(req.sanitize(req.params.pagina)),
        skip        = ((numero-1)*10)-1,
        assunto     = req.sanitize(req.params.assunto);
    if(isNaN(skip)){
        res.redirect('/admin/gerenciamento');
    }
    if(skip < 0){
        skip = 0;
    }
    Posts.find({'assunto':assunto}).skip(skip).limit(10).exec((err,posts)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Assunto.find({},(err,assuntos)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else{
                    var tamanhoPosts = posts.length;
                    if(tamanhoPosts === 10){
                        if(numero  <= 0){
                            numero = 1;
                        }
                    Posts.countDocuments({'assunto':assunto},(err,total)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                            var numeroP = total/10;
                            if(Number.isInteger(numeroP)){
                            var numeroDocs = numeroP;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:assunto, assuntos:assuntos, assunto:assunto,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            } else {
                            var numeroDocs = Math.floor(numeroP)+1;
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:assunto, assuntos:assuntos, assunto:assunto,numeroPesquisa: numero, postMaiorQue10: true, numeroDocs:numeroDocs});
                            }
                        }
                    });
                    } else {
                        if(numero < 7){
                            if(numero  <= 0){
                                numero = 1;
                            }
                            res.render('admin/blog/posts', {posts:posts, tituloAssunto:assunto, assuntos:assuntos, assunto:assunto,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:false});
                        } else {
                            Posts.countDocuments({'assunto':assunto},(err,total)=>{
                                if(err){
                                    console.log(err);
                                    res.render('admin/erro',{message: err.message});
                                } else {
                                var numeroP = total/10;
                                var numeroDocs = numeroP;
                                res.render('admin/blog/posts', {posts:posts, tituloAssunto:assunto, assuntos:assuntos, assunto:assunto,numeroPesquisa: numero, postMaiorQue10: false, numeroDocs:numeroDocs});
                                }
                            });
                        }
                    }
                }
            });
        }
    });
});

router.post('/admin/blog/posts/search',(req,res)=>{
    Posts.find({titulo:{$regex:req.sanitize(req.body.procura), $options: 'i'}}).limit(10).sort('-likes').exec((err,posts)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Assunto.find({},(err,assuntos)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else{
                res.render('admin/blog/posts', {posts:posts,tituloAssunto:false, assuntos:assuntos,numeroPesquisa: false, postMaiorQue10: true, numeroDocs:false});
                }
            });
        }
    });
});

router.get('/admin/blog/:categoria_id/assuntos',(req,res)=>{
    var categoriaId = req.sanitize(req.params.categoria_id);
    Categoria.findById(categoriaId).populate('assuntos')
    .exec((err,categoria)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.render('admin/blog/assuntos',{categoria:categoria,assuntos:categoria.assuntos});
        }
    });
});

router.put('/admin/blog/:categoria_id/icone',(req,res)=>{
    var categoriaId = req.sanitize(req.params.categoria_id),
        icone       = sanitizeHtml(req.body.icone,optionsSanitize);
    Categoria.findOneAndUpdate({_id:categoriaId},{icone:icone},(err)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        }else{
        res.json({message:'Icone criado!',type:'alert-success'});
        }
    });
});

router.post('/admin/blog/:categoria_id/assuntos',(req,res)=>{
    var categoriaId = req.sanitize(req.params.categoria_id);
    Categoria.findById(categoriaId,(err,categoria)=>{
        if(err||!categoria){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        }else{
        Assunto.create({assunto:req.sanitize(req.body.assunto)},(err,assunto)=>{
            if(err){
                console.log(err);
                res.render('admin/erro',{message: err.message});
            } else{
                categoria.assuntos.push(assunto);
                categoria.save();
                res.json({message:'Assunto criado!',type:'alert-success'});
            }
        });
        }
    });
});

router.put('/admin/blog/:categoria_id/:assunto_id/icone',(req,res)=>{
    var assunto_Id  = req.sanitize(req.params.assunto_id),
        icone       = sanitizeHtml(req.body.icone,optionsSanitize);
    Assunto.findOneAndUpdate({_id:assunto_Id},{icone: icone},(err)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        }else{
        res.json({message:'Icone criado!',type:'alert-success'});
        }
    });
});

router.delete('/admin/blog/assuntos/:categoria_id/:assunto_id',(req,res)=>{
    Assunto.findOneAndDelete({_id:req.params.assunto_id},(err)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.json({message:'Assunto deletado!', type:'alert-danger'});
        }
    });
});

router.get('/admin/blog/categorias',(_req,res)=>{
    Categoria.countDocuments({},(err,totalDeCategorias)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
        Categoria.find({}).sort({'ordem':1}).exec((err,categorias)=>{
            if(err){
                console.log(err);
                res.render('admin/erro',{message: err.message});
            } else {
                res.render('admin/blog/categorias',{categorias:categorias, totalDeCategorias:totalDeCategorias});
            }
        });
        }
    });
});

router.post('/admin/blog/categoria',(req,res)=>{
    Categoria.countDocuments({},(err,ordem)=>{
        if(err){console.log(err);res.render('admin/erro',{message: err.message});}else{
            var ordemN = Number(ordem)+1;
    Categoria.create({categoria:req.sanitize(req.body.categoria),ordem:ordemN},(err)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else{
            res.json({message:'Categoria criada!',type:'alert-success'});
        }
    });
    }
    });
});

router.put('/admin/blog/:categoria_id/ordem',(req,res)=>{
    var ordem = req.sanitize(req.body.ordem),
        categoriaId = req.sanitize(req.params.categoria_id);
    if(ordem == undefined){
        ordem = 0;
    }
    Categoria.findOne({ordem:ordem},(err,categoriaAntiga)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else if (!categoriaAntiga){
            Categoria.findOneAndUpdate({_id:categoriaId},{ordem:ordem},(err,categoria)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                }else {
                    res.json({message:'Ordem da categoria alterada!', type:'alert-success'});
                }
            });
        } else {
            Categoria.findById(categoriaId,(err,categoria)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                }else{
                Categoria.findOneAndUpdate({_id:categoriaAntiga._id},{ordem:categoria.ordem},(err)=>{
                    if(err){
                        console.log(err);
                        res.render('admin/erro',{message: err.message});
                    }else{
                    categoria.ordem = ordem;
                    categoria.save();
                    res.json({message:'Ordem da categoria alterada!', type:'alert-success'});
                }
                });
                }
            });
        }
    });
});

router.delete('/admin/blog/categorias/:categoria_id',(req,res)=>{
    var categoriaId = req.sanitize(req.params.categoria_id);
    Categoria.findOneAndDelete({_id:categoriaId},(err,categoria)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Assunto.deleteMany({_id: {$in: categoria.assuntos}},(err)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    res.json({message:'Categoria deletada!', type:'alert-danger'});
                }
            })
        }
    });
});

router.post('/admin/blog/post/:post_id/:assunto/definirCapa',(req,res)=>{
    var assuntoP = req.sanitize(req.params.assunto),
        post_id  = req.sanitize(req.params.post_id);
    Posts.find({assunto:assuntoP,ordem:1},(err,post)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } if(post){
            if(post.length > 1){
                Posts.updateMany({assunto:assuntoP,ordem:1}, {"$set":{"ordem": 0}}, {"multi": true}, (err, writeResult) => {
                    if(err){
                        console.log(err);
                        res.render('admin/erro',{message: err.message});
                    } else{}
                }).then(()=>{
                    Posts.findOneAndUpdate({_id:post_id},{ordem:1},(err,_post)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                            res.json({message:'Post definido como capa!', type:'alert-success'});
                        }
                    });
                });
            } else {
                if(post[0]){
                    if(post[0]._id.equals(post_id)){
                    Posts.findOneAndUpdate({_id:post_id},{ordem:0},(err,_post)=>{
                        if(err){
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                        } else {
                            res.json({message:'Post retirado de capa!', type:'alert-danger'});
                        }
                    });
                    } else {
                    Posts.findOneAndUpdate({_id:post[0]._id},{ordem:0},(err,_post)=>{
                        if(err){console.log(err);res.render('admin/erro',{message: err.message});}
                    }).then(()=>{
                        Posts.findOneAndUpdate({_id:post_id},{ordem:1},(err,_post)=>{
                            if(err){
                                console.log(err);
                                res.render('admin/erro',{message: err.message});
                            } else {
                                res.json({message:'Post definido como capa!', type:'alert-success'});
                            }
                        });
                    });
                    }
                }
            }
        
        } else {
            Posts.findOneAndUpdate({_id:post_id},{ordem:1},(err,_post)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    res.json({message:'Post definido como capa!', type:'alert-success'});
                }
            });
        }
    });
});

router.get("/admin/blog/regras",(req,res)=>{
    Instituicao.findOne({titulo:process.env.regras},(err,regras)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.render('admin/blog/regras',{regras:regras.descricao});
        }
    });
});

router.put("/admin/blog/regras",(req,res)=>{
    Instituicao.findOneAndUpdate({titulo:process.env.regras},{descricao:req.body.descricao},(err,updated)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.json({message:'Salvo!',type:'alert-success'});
        }
    });
});

router.get('/admin/blog/trofeus',(req,res)=>{
    Trofeus.find({},(err,trofeus)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.render('admin/blog/trofeus',{trofeus:trofeus});
        }
    });
});

router.post('/admin/blog/trofeus',(req,res)=>{
    Trofeus.create({nome:req.body.nome},(err,trofeu)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            res.json({model:trofeu});
        }
    });
});

router.post('/admin/blog/trofeus/foto/:trofeu',middlewareS.uploadImageFirebase.single('image'),(req,res)=>{
    let file = req.file;
    if(file){
    middlewareS.uploadImageToStorage(file).then((success) => {
    var urlCompleto = req.file.path,
    imagem = success,
    // imagem = urlCompleto.slice(6),
    defaultImg = '/uploads/default.png';
    Trofeus.findById({_id:req.params.trofeu},(err,trofeu)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            // const pblc = "public",
            // urlc = pblc.concat(trofeu.imagem);
            // if(trofeu.imagem === defaultImg || !(fs.existsSync(urlc))){
                Trofeus.findOneAndUpdate({_id:req.params.trofeu},{imagem:imagem},(err,trofeu)=>{
                    if(err){
                        console.log(err);
                        res.render('admin/erro',{message: err.message});
                    } else {
                        res.json({message:'Trofeu adicionado!',type:'alert-success'});
                    }
                });
            // }
        }
    });
    }).catch(err=>{
    res.json({message:'Algo deu errado! Por favor, insira uma imagem.',type:'alert-secondary'});
    });
}else{
res.json({message:'Algo deu errado!', type:'alert-secondary'});
}
});

router.delete('/admin/blog/trofeus/:trofeu/delete',(req,res)=>{
    Trofeus.findById(req.params.trofeu,(err,trofeu)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else {
            Trofeus.findOneAndDelete({_id:req.params.trofeu},(err)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else{
                    const   pblc = "public",
                            urlc = pblc.concat(trofeu.imagem),
                            defaultImg = '/uploads/default.png';
                    if(fs.existsSync(urlc && urlc != defaultImg)){
                        fs.unlink(urlc, (err) => {
                            if (err){ 
                            console.log(err);
                            res.render('admin/erro',{message: err.message});
                            } else{
                        res.json({message:'Deletado!',type:'alert-danger'});}
                    });
                    } else {
                        res.json({message:'Deletado!',type:'alert-danger'});
                    }
                }
            });
        }
    });
});

router.put('/admin/blog/usuarios/tipoConta/:id',(req,res)=>{
    if(req.body['tipoConta'] == 'on'){
        User.findOneAndUpdate({_id:req.params.id},{tipoConta:1},(err)=>{
            if(err){
                console.log(err);
                res.render('admin/erro',{message: err.message});
            } else {
                res.json({message:'Moderador salvo!',type:'alert-success'});
            }
        });
    }else if(typeof req.body['tipoConta'] !== undefined){
        User.findOneAndUpdate({_id:req.params.id},{tipoConta:0},(err)=>{
            if(err){
                console.log(err);
                res.render('admin/erro',{message: err.message});
            } else {
                res.json({message:'Moderador removido!',type:'alert-success'});
            }
        });
    } else {
        res.redirect('/admin/gerenciamento');
    }
});

router.put('/admin/blog/usuarios/ban/:id',(req,res)=>{
    User.findById(req.params.id,(err,user)=>{
        if(err){
            console.log(err);
            res.render('admin/erro',{message: err.message});
        } else{
            if(user.ban){
            User.findOneAndUpdate({_id:req.params.id},{ban:false},(err)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    res.json({message:'Banimento retirado!',type:'alert-success'});
                }});
            } else {
            User.findOneAndUpdate({_id:req.params.id},{ban:true},(err)=>{
                if(err){
                    console.log(err);
                    res.render('admin/erro',{message: err.message});
                } else {
                    res.json({message:'Usuário '+user.username+' banido!',type:'alert-danger'});
                }});
            }
        }
    });
});

// const uploadImageToStorage = (file) => {
//     return new Promise((resolve, reject) => {
//       if (!file) {
//         reject('No image file');
//       }
//       let newFileName = `${file.originalname}_${Date.now()}`;
  
//       let fileUpload = bucket.file(newFileName);
  
//       const blobStream = fileUpload.createWriteStream({
//         metadata: {
//           contentType: file.mimetype
//         }
//       });
  
//       blobStream.on('finish', () => {
//         const url = "https://firebasestorage.googleapis.com/v0/b/"+`${bucket.name}`+"/o/"+encodeURI(`${fileUpload.name}`+"?alt=media");
//         resolve(url);
//       });
  
//       blobStream.end(file.buffer);
// });
// }

module.exports = router;