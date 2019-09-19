const   express      = require("express"),
        router       = express.Router(),
        Contato      = require('../../models/contact'),
        generateView = require('../../functions/generateViews');

router.get('/admin/edit/contato',function(req,res){
    Contato.findById({_id:process.env.idContato},(err,contato)=>{
        if(err||!contato){res.render('admin/erro',{message: err.message});}else{
        res.render('admin/contato',{contato:contato});
        }
    });
});

router.put('/admin/contato',function(req,res){
    var telefone1 = req.body.contato.telefone1,
        telefone2 = req.body.contato.telefone2,
        telefone3 = req.body.contato.telefone3,
        email     = req.body.contato.email,
        fb        = req.body.contato.fb,
        ig        = req.body.contato.ig,
        yt        = req.body.contato.yt,
        location  = req.body.contato.location;

    var newContato = {
        telefone1: telefone1,
        telefone2: telefone2,
        telefone3: telefone3,
        email   : email,
        yt: yt,
        fb: fb,
        ig: ig,
        location: location
    };
    Contato.findOneAndUpdate({_id:process.env.idContato},newContato,(err,updated)=>{
        if(err||!updated){res.render('admin/erro',{message: err.message});}else{
            generateView.home(res);
        }
       });
});
    
module.exports = router;