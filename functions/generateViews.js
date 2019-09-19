const   Contato         = require("../models/contact"),
        BannerPrim      = require("../models/bannerPrimario"),
        BannerSecu      = require("../models/bannerSecundario"),
        Diferenciais    = require("../models/diferencial"),
        Documentos      = require("../models/document"),
        Menus           = require("../models/menu"),
        Ensino          = require("../models/ensino"),
        Equipes         = require("../models/equipe"),
        Eventos         = require("../models/event"),
        ejs             = require('ejs'),
        fs              = require('fs'),
        path            = require('path'),
        indexPath       = path.resolve('views/index.ejs'),
        ensinoPath      = path.resolve('views/ensino.ejs');

var generateHtml = {};

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

generateHtml.home = (res)=>{
        var date = new Date(),
        ano = date.getFullYear(),
        mes= date.getMonth();
            Contato.findById(process.env.idContato,function(err, contato) {
                if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                BannerPrim.find({},(err,bannersP)=>{
                if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                    BannerSecu.find({},(err,banners)=>{
                    if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                        Diferenciais.find({},(err,diferenciais)=>{
                        if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                            Documentos.find({},(err,documentos)=>{
                            if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                Documentos.findOne({regramento:'true'},(err,documentosR)=>{
                                if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}
                                if(!documentosR){
                                    var documentosR = false;
                                }
                                else{
                                Menus.findMenu({},(err,menus)=>{
                                    if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                        Menus.find({plataformas:'true'},(err,menusP)=>{
                                        if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                        Ensino.find({},(err,ensino)=>{
                                            if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                                Equipes.find({}).populate('gestores').sort({'ordem':1}).limit(2).exec((err,equipes)=>{
                                                    if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                                Eventos.find({"data_criacao": {"$gte": new Date(ano, mes, 1), "$lt": new Date(ano, mes+1, 0)}},(err,eventos)=>{
                                                    if(err){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
                                                        
                                                        ejs.renderFile(indexPath, 
                                                        {h_title : titles.home,
                                                        contato:contato,
                                                        bannersPrincipais: bannersP,
                                                        bannersSecundarios: banners,
                                                        diferenciais: diferenciais,
                                                        documentos: documentos,
                                                        regramento: documentosR,
                                                        menus: menus,
                                                        plataformas: menusP,
                                                        ensino:ensino,
                                                        eventos:eventos,
                                                        equipes:equipes
                                                        },(err,file)=>{
                                                            if(err){
                                                                console.log(err);
                                                            }
                                                            fs.writeFile('views/html/template.html',file,
                                                            (err) => {
                                                                if(err){
                                                                    if(res){
                                                                        res.render('admin/erro',{message: err.message});
                                                                    }
                                                                }else{
                                                                    if(res){
                                                                        res.json({message:"Atualizações feitas!",type:'alert-success'});
                                                                    }
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                            }
                                            });
                                            }
                                        });
                                    }
                                    });
                                    }
                                });
                            }
                            });
                            }
                            });
                        }
                        });
                    }
                    });
                }
                });
            }
            }).catch((err)=>{
            console.log(err);
            });
}

generateHtml.ensino = (res)=>{
    Ensino.find({},(err,ensinos)=>{
        if(err||!ensinos){
            console.log(err);
            if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Menus.findMenu({},(err,menus)=>{
                if(err||!menus){if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
        Equipes.find({}).populate('gestores').exec((err,equipes)=>{
            if(err||!equipes){
                console.log(err);
                if(err != null){res.render('erro', {message: err.message, h_title:'Erro 404'});} else {res.render('erro', {h_title:'Erro 404'});}}else{
            var equipe1 = {},
                equipe2 = {},
                equipe3 = {},
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
                }
                counter++;
            if(counter === equipes.length){
                ejs.renderFile(ensinoPath, {h_title: titles.ensino, ensinos:ensinos, equipe1: equipe1, equipe2: equipe2, equipe3: equipe3, menus:menus},
                    (err,file)=>{
                        if(err){
                            console.log(err);
                        }
                        fs.writeFile('views/html/ensino.html',file,
                        (err) => {
                            if(err){
                                if(res){
                                    res.render('admin/erro',{message: err.message});
                                }
                            }else{
                                if(res){
                                    res.json({message:"Atualizações feitas!",type:'alert-success'});
                                }
                            }
                        });
                    });
                }
            });
            } else {ejs.renderFile(ensinoPath, {h_title: titles.ensino, ensinos:ensinos, equipe1: equipe1, equipe2: equipe2, equipe3: equipe3, menus:menus},
                (err,file)=>{
                        if(err){
                            console.log(err);
                        }
                        fs.writeFile('views/html/ensino.html',file,
                        (err) => {
                            if(err){
                                if(res){
                                    res.render('admin/erro',{message: err.message});
                                }
                            }else{
                                if(res){
                                    res.json({message:"Atualizações feitas!",type:'alert-success'});
                                }
                            }
                        });
                    });
                }
                }
            });
            }
        });
        }
    });
}

module.exports = generateHtml;