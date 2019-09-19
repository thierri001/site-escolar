$(document).ready(() => {
    let arr = [],
    selectOn = false,
    selectFotosOn = false;
    session();
    
    $('body').on('change', 'input[type=file][name=image]', function() {
    let ext = $(this).val().split('.').pop().toLowerCase();
        if($.inArray(ext, ['png','jpg','jpeg']) == -1) {
            message('Por favor, selecione uma imagem com o formato jpg/png/jpeg','alert-secondary');
            removeMensagem();
            $('input[type=file][name=image]').val('');
        }
    });
    
    $('body').on('change', 'input[type=file][name=document]', function() {
    let ext = $(this).val().split('.').pop().toLowerCase();
    let fileSize = this.files[0].size;
        if($.inArray(ext, ['xlsx','pdf','doc','docx']) == -1) {
            message('Por favor, selecione um documento com o formato docx/pdf/doc/xlsx','alert-secondary');
            removeMensagem();
            $('input[type=file][name=document]').val('');
        }
       if(fileSize > 5242880){
            message('Por favor, selecione um arquivo até 5Mb','alert-secondary');
            removeMensagem();
            $('input[type=file][name=document]').val('');
        }
    });
    
    $('body').on('change', '#input-file', function() {
        if(this.files[0] != undefined){
       let fileSize = this.files[0].size;
       if(fileSize > 5242880){
           message('Por favor, selecione um arquivo até 5Mb','alert-secondary');
           removeMensagem();
           $(this).val('');
       }
        }
    });
    
    $('body').on('change', '#sendImgArrInput', function(){
        let files = $('#sendImgArrInput')[0].files,
            content = $('#sendImgArrInput').val();
        if(files.length > 0){
            $('.btn-arr-upload').css('display','inline-block');
            $('#label-input-content').addClass('label-input-content');
            if(files.length === 1){
            $('#label-input-content').html(content);
            }else{
            $('#label-input-content').html(files.length+' fotos selecionadas!');
            }
        } else if($('#sendImgArrInput').val() === ''){
            $('.btn-arr-upload').css('display','none');
            $('#label-input-content').removeClass('label-input-content');
            $('#label-input-content').html('');
        }
        for (let i = 0, f; f = files[i]; i++) {
            let ext = f.name.split('.').pop().toLowerCase();
            if($.inArray(ext, ['png','jpg','jpeg']) == -1) {
                message('Por favor, selecione uma imagem com o formato jpg/png/jpeg','alert-secondary');
                removeMensagem();
                $('#sendImgArrInput').val('');
                $('.btn-arr-upload').css('display','none');
            }
            if(f.size > 5242880){
                message('Por favor, selecione arquivos até 5Mb','alert-secondary');
                removeMensagem();
                $('#sendImgArrInput').val('');
                $('.btn-arr-upload').css('display','none');
            }
            if(i > 20){
                message('Por favor, selecione até 20 fotos!','alert-secondary');
                removeMensagem();
                $('#sendImgArrInput').val('');
                $('.btn-arr-upload').css('display','none');
            }
        }
    });

    $('body').on('change', '#searchUrl', function(){
        let option = $(this).val();
        $(this).siblings('#searchPosts').attr('href',option);
    });
    
    $('body').on('click','.cmbtn',function(e){
        let url= $(this).attr('href');
            e.preventDefault();
            barraLoad();
            loadMain(url);
    });

    $('body').on('click','.cmbtn-page',function(){
            barraLoad();
    });
    
    $('body').on('click','.deletar',function(e){
        e.preventDefault();
        let page= $(this).attr('data'),
            botaoSelecionado = $(this);
            $.ajax({
                url: page,
                method: 'delete',
                success: 
                function(response, status, xhr){ 
                    let ct = xhr.getResponseHeader("content-type") || "";
                    if (ct.indexOf('html') > -1) {
                        window.location.reload(response);
                    }
                    if (ct.indexOf('json') > -1) {
                        message(response.message,response.type);
                        $(botaoSelecionado).closest('.container-elemento').remove();
                        removeMensagem();
                    }
                }
            });
    });

    $('body').on('click', '.selecionar-todas', function(e) {
        e.preventDefault();
        if(selectFotosOn){
            $('.fotoEvento').removeAttr('clicado','clicado');
            $('.back-foto-evento').removeClass('back-foto-evento-deletar');
            arr = [];
            selectFotosOn = false;
        }else{
            $('.fotoEvento').attr('clicado','clicado');
            $('.back-foto-evento').addClass('back-foto-evento-deletar');
            addArrImage();
            selectFotosOn = true;
        }
    });
    
    $('body').on('click', '.fotoEvento', function() {
        if(!selectOn){
            highlight($(this));
            $(this).addClass('highlight');
        } else{
        let id = $(this).prop('id'),
            url= $(this).attr('src'),
            attr= $(this).attr('clicado'),
            newID = {
                id: id,
                url: url
                };
            if(typeof attr !== typeof undefined && attr !== false){
                let novoArr = [];
                deleteArray(newID,arr,novoArr);
                arr = novoArr; 
                $(this).removeAttr('clicado');
                $(this).closest('.back-foto-evento').removeClass('back-foto-evento-deletar');
            } else{
                if(checkArray(newID,arr)){}else{arr.push(newID);}
                $(this).attr('clicado','clicado');
                $(this).closest('.back-foto-evento').addClass('back-foto-evento-deletar');
            }
        }
    }).focusout(()=>{
       if(!selectOn){
           $('body .highlight').removeClass('highlight');
       }
    });

    $('body').on('click', '.fotoEventoTag', function(e) {
       e.preventDefault();
    });
    
    $('body').on('click','.selectFotos',function() {
        if(!selectOn){
        $("body .containerFotos").addClass('border border-danger back-container-eventos-ativo');
        $("body .containerFotos").removeClass('padding-eventos');
        select(true);
        selectOn = true;
        } else {
        select(false);
        $("body .containerFotos").removeClass('border back-container-eventos-ativo');
        $("body .containerFotos").addClass('padding-eventos');
        selectOn = false;
        }
    });
    
    $('body').on('click','.mudaBanner',function(e) {
        trocaBanner(e);
    });
    
    $('body').on('click','.mudaInput',function(e) {
        e.preventDefault();
        let attrSelect = $(this).attr('selecturl'),
            attrInput  = $(this).attr('inputurl');
       if((typeof attrSelect !== typeof undefined && attrSelect !== false)){
            $('.selectURL').after("<div class='inputURL'><input type='text' placeholder='Digite uma url' name='url'><button class='mudaInput' inputURL=''>Selecionar páginas</button></div>")
           $('.selectURL').remove();
       } else if(typeof attrInput !== typeof undefined && attrInput !== false){
           loadSelected(window.location,'.form-menus');
       }
    });
    
    $('body').on('click','.criaBanner',function(e) {
        criaBanner($(this));
    });
    
    $('body').on('click','#principal',function() {
        let formBanner     = $('#formBanner'),
        botaoCriaBanner= $('.criaBanner #principal');
       if(formBanner.hasOwnProperty('display')){
           botaoCriaBanner.val('Criar banner principal');
       }
    });
    
    $('body').on('click','#secundario',function() {
        let formBanner  = $('#formBanner'),
        botaoCriaBanner = $('.criaBanner #secundario');
       if(formBanner.hasOwnProperty('display')){
           botaoCriaBanner.val('Criar banner secundario');
       }
    });
    
    $('body').on('click', 'input[type=checkbox]',function() {
       let attr = $(this).attr('checked');
       if(typeof attr !== typeof undefined && attr !== false){
           $(this).removeAttr('checked');
       }
    });

    $('body').on('click', '[data-target="#editarDever"]', function(){
        let url        = $(this).attr('dataUrl'),
            form       = $("#formModalDever");
            $33('#editDeverBox').summernote('code', '');
            $.ajax({
                url: url+'/edit',
                type: 'GET',
                success:(res)=>{
                    if(res.message !== undefined){
                        responseHtml(res);
                    } else {
                        let dever = res.dever;
                        form.attr('data',url);
                        $33('#editDeverBox').summernote('code', dever.texto);
                    }
                }
            });
    });

    $('body').on('click', '#btnFormDever', function(e){
        e.preventDefault();
        $('#formModalDever').submit();
    });

    $('body').on('submit','#formModalDever',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'simple');
    });

    $('body').on('change','#sendImgChange',function(e) {
    let form = $(this)[0],
        data = new FormData(form),
        page= $(this).attr('data');
        e.preventDefault();
        atUpload();
        $.ajax({
            url: page,
            type: 'POST',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            data: data,
            success:
            function(response,status,xhr){
                loadMain(window.location);
                $('#updateImgBtn').prop("disabled", false);
                responseHtml(response);
            }
        });
    });

    $('body').on('change', '#tipoConta', function(e) {
        barraLoad();
        submitForm(e,'PUT',$(this),'simple');
    });

    $('body').on('submit', '#banimento', function(e) {
        barraLoad();
        submitForm(e,'PUT',$(this));
        
    });
    
    $('body').on('submit','#new',function(e){
        atUpload();
        submitForm(e,'POST',$(this));
    });
    
    $('body').on('submit','#newSummer',function(e){
        atUpload();
        submitForm(e,'POST',$(this), 'simple');
    });
    
    $('body').on('submit','#newEvento',function(e){
        atUpload();
        submitForm(e,'POST',$(this),'newEvento');
    });

    $('body').on('submit','#update',function(e) {
        atUpload();
        submitForm(e,'PUT',$(this));
    });
    
    $('body').on('submit','#updatePagina',function(e) {
        atUpload();
        submitForm(e,'PUT',$(this),'simple');
    });
    
    $('body').on('submit','#updateFoto',function(e) {
        atUpload();
        submitForm(e,'PUT',$(this),'updateFoto');
    });
    
    $('body').on('submit', '#updateUser', function(e) {
        atUpload();
        submitForm(e,'PUT',$(this),'simple');
    });

    $('body').on('submit', '#search', function(e) {
        barraLoad();
        submitForm(e,'POST',$(this),'search','.main');
    });

    $('body').on('submit','#sendImg',function(e) {
        atUpload();
        sendArchive(e,$(this));
    });
    
    $('body').on('submit','#sendNameModel',function(e) {
        atUpload();
        submitForm(e,'POST',$(this),'sendArchive');
    });
    
    $('body').on('submit','#sendImgArr',function(e) {
    $(this).closest('#sendImgBtn').prop("disabled", true);
    let form = $('#sendImgArr')[0],
        data = new FormData(form),
        page= $(this).attr('data');
            e.preventDefault();
            atUpload();
                $.ajax({
                    url: page,
                    type: 'POST',
                    enctype: 'multipart/form-data',
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: data,
                    success:
                    function(response,status,xhr){
                        endBarraLoad();
                        responseHtml(response);
                        loadSelected(window.location,'.containerFotos');
                        $('input[name=imagens]').val('');
                        select(false);
                        selectOn = false;
                        $('.selectFotos').removeClass('d-none');
                        $('#sendImgBtn').prop("disabled", false);
                        $('.btn-arr-upload').css('display','none');
                        $('#label-input-content').removeClass('label-input-content');
                        $('#label-input-content').html('');
                    }
                });
    });

    $('body').on('submit','.deletarArr',function(e) {
        e.preventDefault();
        if(arr.length > 0 && arr != undefined){
        let url  = $(this).attr('data');
        let data = arr;
        let URI = encodeURI(JSON.stringify(data)); 
        barraLoad();
        $.ajax({
            url: url+'?page='+URI,
            type: 'post',
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success:
            function(response,status,xhr){
                endBarraLoad();
                responseHtml(response);
                loadSelected(window.location,'.containerFotos');
            }});
        } else {
        message('Por favor, selecione alguma imagem!','alert-secondary');
        removeMensagem();
        }
    });
    
    $(window).on('popstate',function() {
        window.location.reload();
    });
    function responseHtml(response, block){ 
        if(typeof response.href !== 'undefined'){
            let respostaHtml = response.href;
            window.location.href = respostaHtml;
        } else if (typeof response.message !== 'undefined') {
            if(block && typeof block !== undefined){}else{
            message(response.message,response.type);
            removeMensagem();
            }
        } else {
            if(block && typeof block !== undefined){}else{
            window.location.href = '/home';
            }
        }
    }
    function submitForm(e,methodType,select,success,replace){
            e.preventDefault();
            let page      = select.attr('data');
                $.ajax({
                    url: page,
                    type: methodType,
                    data: select.serialize(),
                    timeout: 600000,
                    success:
                    function(response,status,xhr){
                        success;
                        if(success === 'newEvento'){
                            let id = response.evento,
                                url= '/admin/edit/eventos/'+id;
                            loadMain(url);
                        }else
                        if(success === 'updateFoto'){
                            let desc = $('#descricaoHighlight').val(),
                                nome = $('#nomeHighlight').val(),
                                idS  = $('#fotoHighlight').attr('idFoto'),
                                selec = $('body #'+idS+'');
                            selec.attr('nome',nome);
                            selec.attr('desc',desc);
                            endBarraLoad();
                            responseHtml(response);
                        }else
                        if(success === 'eventoCapa'){
                            let capa = response.evento.capa;
                            $('body #capa').attr('src',capa);
                            endBarraLoad();
                        } else if(success === 'sendArchive'){
                            if(response.model != undefined){
                            let idModel = response.model._id,
                                formArch  = $('#sendArchive'),
                                dataForm  = formArch.attr('dataurl')+'/';
                            formArch.attr('data',dataForm+idModel);
                            sendArchive(e,formArch);
                            } else {
                                endBarraLoad();
                                message(response.message,response.type);
                                removeMensagem();
                            }
                        } else if (success === 'simple'){
                            endBarraLoad();
                            responseHtml(response);
                        } else if(success === 'search'){
                            endBarraLoad();
                            responseHtml(response,true);
                            $(replace).replaceWith($(response).find('.main'));
                        }else{
                        loadSelected(window.location.href,'.main');
                        endBarraLoad();
                        responseHtml(response);
                        }
                    }
                });
            }
    function loadSelected(url,replaceWith){
        let scrlLeft = $(window).scrollLeft(),
            scrlTop  = $(window).scrollTop();
        $.ajax({
           url: url,
           type: 'GET',
           cache: false,
           success:(res)=>{
               $(replaceWith).replaceWith($(res).find(replaceWith));
               $('#emptyBox').remove();
                ajaxHistory(url);
                if(res.message != undefined){
                message(res.message,res.type);
                removeMensagem();
                window.scroll(scrlLeft,scrlTop);
                }
           }
        });
    }
    function loadMain(url){
        // Alterar método de reconhecimento
        ajaxHistory(url);
        $.ajax({url:url,type:"GET",cache: false}).done((res)=>{
          let parsed = $.parseHTML(res),
              main   = $(parsed).find('.main'),
              check  = $(parsed).find('.navbar');
        if(!(check.length)){
            $('.main').replaceWith(main);
            endBarraLoad();
            window.scroll(0,0);
        } 
        else { window.location.href = '/home'}
        });
    }
    function ajaxHistory(url){
        url = (''== url) ? '/' : url;
        if(url!=window.location){
        window.history.pushState({path:url},'Gerenciamento | Colégio Master',url);
      }
    }
    function sendArchive(e,selectThis){
    selectThis.closest('#sendImgBtn').prop("disabled", true);
    let form = selectThis[0],
        data = new FormData(form),
        page= selectThis.attr('data');
            e.preventDefault();
                $.ajax({
                    url: page,
                    type: 'POST',
                    enctype: 'multipart/form-data',
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: data,
                    success:
                    function(response,status,xhr){
                        endBarraLoad();
                        responseArchive(response);
                        $('#sendImgBtn').prop("disabled", false);
                    }
                });
    }
    function responseArchive(response){
        if(typeof response.url != undefined){
            endBarraLoad();
            renewImage(response.url);
            loadMain(window.location);
        }
        endBarraLoad();
        message(response.message,response.type);
        removeMensagem();
        loadMain(window.location);
    }
    //Functions
    function message(json,type){
        if($('.alert')>0){
        $('.alert').remove();
        }
        $('body').prepend('<div class="row justify-content-md-center fixed-top mt-lg-0 mt-md-1 alert-bar-top"><div class="alert '+type+' col-md-10 text-center" role="alert">'+json+'</div></div>');
    }
    function removeMensagem (){
        setTimeout(()=>{
            $('.alert-bar-top').remove()}, 3000
        );
    }
    function select(state){
        if(state){
            if($('.containerFotos').hasClass('deletarArr')){
            }else{
            $('body #edicao-fotos').removeClass('p-del-form');
            $('body #edicao-fotos')
            .append("<button class='btn btn-secondary selecionar-todas' id='selecionarTudo'>Selecionar tudo</button><form data='/admin/evento/fotos' class='deletarArr text-right m-0' id='deletarArrForm'><button class='btn btn-delete p-0'><i class='fas fa-trash-alt fa-2x'></i></button></form>");
            }
        }else{
            arr = [];
            $('body #edicao-fotos').addClass('p-del-form');
            $('.back-foto-evento').removeClass('back-foto-evento-deletar');
            $('#deletarArrForm').remove();
            $('#selecionarTudo').remove();
            $('.fotoEvento').removeAttr('clicado');
        }
    }
    function highlight (selector){
       let src  = selector.prop('src'),
           desc = selector.attr('desc'),
           nome = selector.attr('nome'),
           id   = selector.prop('id'),
        urlUpdt = $('.updateFoto').attr('data-part');
        $('body #fotoHighlight').prop('src',src);
        $('body #fotoHighlight').attr('idFoto',id);
        $('#descricaoHighlight').val(desc);
        $('#nomeHighlight').val(nome);
        $('body .updateFoto').attr('data',urlUpdt+id);
    }
    function checkArray(newID,arr){
        if(arr != undefined){
            for(let i = 0; i < arr.length; i++) {
                if (arr[i].id == newID.id) {
                    return true;
                }
            }
        } else { return true}
    }
    function deleteArray(newID,arr,novoArr){
        if(arr != undefined){
            for(let i = 0; i < arr.length; i++) {
                if (arr[i].id !== newID.id) {
                     novoArr.push(arr[i]);
                }
            }
        }
    }
    function addArrImage(){
        $('.fotoEvento').each((i)=>{
            let id = $('.fotoEvento:eq('+i+')').prop('id'),
            url= $('.fotoEvento:eq('+i+')').attr('src'),
            newID = {
                id: id,
                url: url
                };
            if(checkArray(newID,arr)){}else{arr.push(newID);}
        });
    }
    function session(){
        setTimeout(
        function(){
        $.ajax({
            url: '/logout',
            type: 'GET',
            timeout: 60000,
            success: ()=>{
            window.location = "/home";
            }
        });
            }, 1200000);
    }
    function trocaBanner(e){
        let bannerPrimario = $('.container-banner-primario'),
            bannerSecundar = $('.container-banner-secundario'),
            attr           = bannerPrimario.attr('display');
        e.preventDefault();
        
       if (typeof attr !== typeof undefined && attr !== false) {
           bannerPrimario.css('display','none');
           bannerPrimario.removeAttr('display');
           bannerSecundar.css('display','block');
           bannerSecundar.attr('display','display');
       }else{
           bannerPrimario.css('display','block');
           bannerPrimario.attr('display','display');
           bannerSecundar.css('display','none');
           bannerSecundar.removeAttr('display');
       }
    }
    function criaBanner(selectThis){
    let tipo            = selectThis.prop('id'),
        form            = $('#sendNameModel'),
        formArch         = $('#sendArchive'),
        formBanner      = $('#formBanner'),
        bannerPrimario  = $('.container-banner-primario'),
        bannerSecundar  = $('.container-banner-secundario');
        
    form.attr('data',form.attr('data')+tipo);
    formArch.attr('dataurl',formArch.attr('dataurl')+tipo);
    
      formBanner.css('display','block');
      formBanner.attr('display','');
      bannerPrimario.css('display','none');
      bannerPrimario.removeAttr('display');
      bannerSecundar.css('display','none');
      bannerSecundar.removeAttr('display');
    }
    function renewImage(responseModelUrl){
        let url = responseModelUrl;
        $('#showImage').prop('src',url)
    }
    //Barra load
    function atUpload(){
        if($('.progress').length==0){
            $('body').prepend("<div class='progress p-0 m-0 border-none' style='height:20px;'><div class='indeterminate pt-0 m-0 text-center border-none' style='background-color:rgb(139, 0, 0)'><span class='text-center text-white'><b>SALVANDO...</b></span></div></div>")   
        }
    }
    function barraLoad(){
        if($('.progress').length==0){
            $('body').prepend("<div class='progress p-0 m-0'><div class='indeterminate p-0 m-0'></div></div>")   
        }
    }
    function endBarraLoad(){
        $('.progress').remove();
    }
})