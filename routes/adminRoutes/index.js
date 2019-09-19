const express = require("express"),
    router  = express.Router(),
    middleware = require("../../middleware/index"),
    passport    = require("passport"),
    
    usuariosRoute       = require("./usuarios"),
    paginasRoutes       = require("./paginas"),
    instituicaoRoutes   = require("./instituicao"),
    diferenciaisRoutes  = require("./diferencial"),
    eventosRoutes       = require("./eventos"),
    homeRoutes          = require("./home"),
    ensinoRoutes        = require("./ensino"),
    mensagemRoutes      = require("./mensagens"),
    contatoRoutes       = require('./contato'),
    blogRoutes          = require('./blog'),
    deverRoutes         = require('./dever');
    
router.use(usuariosRoute);
router.use(paginasRoutes);
router.use(instituicaoRoutes);
router.use(ensinoRoutes);
router.use(diferenciaisRoutes);
router.use(eventosRoutes);
router.use(homeRoutes);
router.use(mensagemRoutes);
router.use(contatoRoutes);
router.use(blogRoutes);
router.use(deverRoutes);

router.get('/cmadmin', function(req,res){
   res.render('admin/login');
});

router.post("/login",passport.authenticate("local", 
        {
            successRedirect: "/admin/gerenciamento",
            failureRedirect: "/cmadmin",
            failureFlash: true
        }), function(req, res) {
});

router.get('/logout',middleware.isLoggedIn,middleware.adminRole, function(req, res) {
   req.logout();
   res.render('admin/login' , {message: "Logout feito com sucesso!", type:'alert-warning'});
});

router.get('/admin/gerenciamento', function(req,res){
    var user = req.user;
    res.render('admin/gerenciamento',{currentUser : user});
});

module.exports = router;