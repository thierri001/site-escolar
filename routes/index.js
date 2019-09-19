const express       = require("express"),
    router          = express.Router(),
    Contato         = require("../models/contact"),
    Dever           = require('../models/dever'),
    Ensino          = require("../models/ensino"),
    Equipes         = require("../models/equipe"),
    Eventos         = require("../models/event"),
    Instituicao     = require("../models/institucional"),
    Menus           = require("../models/menu"),
    Paginas         = require("../models/page"),
    Usuarios        = require("../models/user"),
    adminRoutes     = require("./adminRoutes/index"),
    blogRoutes      = require('./blogRoutes/index'),
    path            = require('path');

    var caminho = (arquivo)=>{
        return path.resolve('views/'+arquivo);
    }
    
router.use(adminRoutes);
router.use(blogRoutes);

var titles = {
    home : "Colégio Master | Ensino Médio, Fundamental e Infantil",
    instituicao: "Colégio Master | Instituição",
    ensino: "Colégio Master | Ensino",
    gestores: "Colégio Master | Gestores",
    eventos: "Colégio Master | Eventos",
    diferenciais: "Colégio Master | Diferenciais",
    contato: "Colégio Master | Contato",
    dever: "Colégio Master | Dever de casa"
};

router.get('/home', function(req,res){
    try{
        res.sendFile(caminho('html/template.html'));
        } catch{
            res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
        }
});

router.get('/dever',(req,res)=>{
    try{
    var date = new Date(),
        diasMes = getLastDayOfMonth(date.getFullYear(),date.getMonth()),
        primeiroDia = new Date(date.getFullYear(),date.getMonth(),1),
        ultimoDia = new Date(date.getFullYear(),date.getMonth()+1,0),
        semana = primeiroDia.getDay()+1,
        ultimoDiaDaSemanaNoMes = 6-ultimoDia.getDay();

    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Dever.find({date:{"$gte": new Date(date.getFullYear(), date.getMonth(), 1), "$lt": new Date(date.getFullYear(), date.getMonth()+1, 0)}},(err,dever)=>{
            if(err||!dever){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            res.render('deverDeCasa',{diasMes:diasMes,elementosCalendario:diasMes+semana+ultimoDiaDaSemanaNoMes, naoTemData:semana,ultimoDiaSemana:ultimoDiaDaSemanaNoMes, h_title:titles.dever, menus:menus, dever:dever, mes:monthNames[date.getMonth()]});}
        });
        }
    });
    function getLastDayOfMonth(year, month) {
        let date = new Date(year, month + 1, 0);
        return date.getDate();
    }
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/instituicao', function(req,res){
    try{
        Instituicao.find({}, function(err,todos){
            if(err||!todos){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                Menus.findMenu({},(err,menus)=>{
                    if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                        res.render('instituicao', {h_title : titles.instituicao,
                            Institucional: todos,
                             principal: process.env.principal,
                             descricao1: process.env.descricao1,
                             descricao2: process.env.descricao2,
                             descricao3: process.env.descricao3,
                             menus:menus
                          });
                    }
                });
            }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/ensino', function(req, res) {
    try{
        res.sendFile(caminho('html/ensino.html'));
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/ensino/gestores', function(req, res) {
    try{
    Equipes.find({}).populate('gestores').exec((err,equipes)=>{
        if(err||!equipes){
            console.log(err);
            if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            Menus.findMenu({},(err,menus)=>{
                if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            var equipe1 = {},
                equipe2 = {},
                equipe3 = {},
                equipesArr = [],
                counter = 0;
                if(equipes.length >0){
                equipes.forEach((equipe)=>{
                if(equipe.ordem === 1){
                    equipe1 = equipe;
                }
                if(equipe.ordem === 2){
                    equipe2 = equipe;
                }
                if(equipe.ordem === 3){
                    equipe3 = equipe;
                } else if(equipe.ordem !== 1 && equipe.ordem !== 2 && equipe.ordem !== 3) {
                    equipesArr.push(equipe);
                }
                counter++;
            if(counter === equipes.length){
                res.render('gestores', {h_title: titles.gestores, equipe1: equipe1, equipe2: equipe2, equipe3: equipe3, equipes:equipesArr, menus:menus});
            }});
            } else {res.render('gestores', {h_title: titles.gestores, equipe1: equipe1, equipe2: equipe2, equipe3: equipe3, equipes:equipesArr, menus:menus});}
        }
    });
        }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

router.get('/eventos', function(req, res) {
    try{
    var date = new Date(),
        year = date.getFullYear(),
        month= date.getMonth(),
        mesAnterior = monthNames[checkMonth(month-1)],
        mesPosterior = monthNames[checkMonth(month+1)];

    searchEvento();
    
    function checkMonth(month){
        if(month === 12){
            return 0;
        }
        if(month === -1){
            return 11;
        }
        return month;
    }
    
    function searchEvento (){
        Menus.findMenu({},(err,menus)=>{
            if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Eventos.find(
        {
        "data_criacao":{"$gte": new Date(year,month, 1), "$lt": new Date(year,month+1,0)}
        },function(err,todosEventos){
            if(err||!todosEventos){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            }   
            res.render('eventos', {mes: monthNames[month], mesAnterior: mesAnterior ,mesPosterior: mesPosterior, ano: year, h_title: titles.eventos, todosEventos: todosEventos, menus:menus});
        });
    }
    });
    }
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});
//Ajax EVENTOS
router.get('/eventos/:mes/:ano', function(req, res) {
    try{
    var ano = req.sanitize(req.params.ano),
        mesStr = req.sanitize(req.params.mes),
        mes = monthNames.indexOf(mesStr),
        mesAnterior = monthNames[checkMonth(mes-1)],
        mesPosterior = monthNames[checkMonth(mes+1)];
        
    if(monthNames.includes(mesStr) &&!(isNaN(ano))){
    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Eventos.find(
        {"data_criacao": {"$gte": new Date(ano, mes, 1), "$lt": new Date(ano, mes+1, 0)}}
        ,function(err,todosEventos){
            if(err||!todosEventos){
            res.render('erro', {h_title:'Erro 404',message: "Ocorreu um erro ao procurar os eventos! "+err.message});
            } else{
            res.render('eventos', {mes: mesStr, mesAnterior: mesAnterior, mesPosterior: mesPosterior, ano: ano, h_title: titles.eventos, todosEventos: todosEventos, menus:menus});
            }
        });
        }
    });
    }else{res.render('erro', {h_title:'Erro 404',message: "Ocorreu um erro ao procurar os eventos!"});}
    function checkMonth(month){
        if(month === 12){
            return 0;
        }
        if(month === -1){
            return 11;
        }
        return month;
    }
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/eventos/:evento', function(req, res) {
    try{
    var eventoID = req.sanitize(req.params.evento);
    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
    Eventos.findById(eventoID)
    .populate('fotos')
    .exec(function(err,evento){
        if(err|!evento){if(err != null){res.render('erro', {h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        res.render('evento', {h_title: "Colégio Master | "+evento.titulo, evento:evento, windowUrl:req.protocol + '://' + req.get('host') + req.originalUrl, menus:menus});
        }
    });
    }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/diferenciais', function(req, res) {
    try{
    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
   res.render('diferenciais', {h_title: titles.diferenciais, menus:menus}); 
        }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/contato/agendamento', function(req, res) {
    try{
    Contato.findById(process.env.idContato,function(err, contato) {
        if(err||!contato)if(err != null){res.render('erro', {h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}else{
            Menus.findMenu({},(err,menus)=>{
                if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            res.render('agendamento', {h_title: titles.contato, contato:contato, menus:menus});
                }
            });
        }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/contato/outros', function(req, res) {
    try{
    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
   res.render('outros', {h_title: titles.contato, menus:menus});
        }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/pagina/:idPg', function(req, res) {
    try{
    var idPg = req.sanitize(req.params.idPg);
    Menus.findMenu({},(err,menus)=>{
        if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Paginas.findById({_id:idPg}, function(err,pagina){
            if(err|!pagina){
                if(err != null){
                res.render('erro', {h_title:'Erro 404'});
                } else {
                res.render('erro', {h_title:'Erro 404'});    
                }
            } else {
            res.render('paginaModelo', {h_title: "Colégio Master | "+pagina.name, pagina: pagina, menus:menus});}
        });
    }
    });
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});

router.get('/*', function(req, res) {
    try{
    res.status(404).redirect('/home');
    } catch{
        res.render('erro',{message:'Erro na requisição, contate o administrador da página',h_title:'Erro'});
    }
});
module.exports = router;