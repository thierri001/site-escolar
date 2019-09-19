$(document).ready(() => {
    session();
    let scrlTop  = 0,
        scrlLeft = 0;

    windowSize();
    removeMensagem();

    $('body').on('change', 'input[type=file][name=image]', function() {
        let ext = $(this).val().split('.').pop().toLowerCase();
        if($(this).val() === undefined || $(this).val() === '' || $(this).val() === null){
        } else {
            if($.inArray(ext, ['png','jpg','jpeg']) == -1) {
                message('Por favor, selecione uma imagem com o formato jpg/png/jpeg','alert-secondary');
                removeMensagem();
                $('input[type=file][name=image]').val('');
            }
        }
    });

    $('body').on('change', '#input-file', function() {
        let button = $(this).parents('.custom-file'),
            btn    = button.find('.custom-file-control');
        if(this.files[0] != undefined){
            btn.addClass('bg-success text-light');
       let fileSize = this.files[0].size;
       if(fileSize > 5242880){
           message('Por favor, selecione um arquivo até 5Mb','alert-secondary');
           removeMensagem();
           $(this).val('');
       }
        } else {
            btn.removeClass('bg-success text-light');
        }

    });

    $('body').on('click', '[data-target="#modalComentario"]', function(){
        let comentario = $(this).closest('.col-12').find('#comentarioTexto').contents().clone(),
            url        = $(this).attr('dataUrl'),
            form       = $("#formModalComentario");
        form.attr('data',url);
        $33('#editCommentBox').summernote({
            placeholder: 'Faça seu comentário!',
            lang: 'pt-BR',
            tabsize: 2,
            height: 100,
            toolbar: [['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link']]],
            callbacks: {
                onKeydown: function (e) { 
                    var max = 1000;
                    var t = e.currentTarget.innerText; 
                    if (t.trim().length >= max) {
                        //delete keys, arrow keys, copy, cut
                        if (e.keyCode != 8 && !(e.keyCode >=37 && e.keyCode <=40) && e.keyCode != 46 && !(e.keyCode == 88 && e.ctrlKey) && !(e.keyCode == 67 && e.ctrlKey))
                        e.preventDefault(); 
                    } 
                },
                onKeyup: function (e) {
                    var max = 1000;
                    var t = e.currentTarget.innerText;
                    $('#maxContentPost').text(max - t.trim().length);
                },
                onPaste: function (e) {
                    var max = 1000;
                    var t = e.currentTarget.innerText;
                    var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                    e.preventDefault();
                    var maxPaste = bufferText.length;
                    if(t.length + bufferText.length > max){
                        maxPaste = max - t.length;
                    }
                    if(maxPaste > 0){
                        document.execCommand('insertText', false, bufferText.substring(0, maxPaste));
                    }
                    $('#maxContentPost').text(max - t.length);
                }
            }
        });
        $33('#editCommentBox').summernote('code', comentario);
    });

    $("body").on("click",".cmbtn", function(e){
        let url = encodeURI($(this).attr('href')),
            str = 'http';
        $(this).attr('disabled','disabled');
        barraLoad();
        if(url == '/blog'){
            endBarraLoad();
        }else if(url == '/dever'){
            e.preventDefault();
            mudaPagina2(url,true);
        }else if(url.indexOf(str) != -1){
            endBarraLoad();
        } else {
        e.preventDefault();
        mudaPagina(url,true,$(this));
        }
    });

    $("body").on("click",".cmbtn3", function(e){
        let url = $(this).attr('href');
        $(this).attr('disabled','disabled');
        barraLoad();
        e.preventDefault();
        mudaPagina(url,true,$(this));
    });
    
    $("body").on("click",".cmbtn2", function(e){
        let url = $(this).attr('href'),
            str = 'http';
        $(this).attr('disabled','disabled');
        barraLoad();
        if(url.indexOf(str) != -1){
        } else {
        e.preventDefault();
        mudaPagina2(url,true);
        }
    });

    $("body").on("click","#likes", function(e){
        e.preventDefault();
        let url     = $(this).attr('href'),
            scroll  = $(window).scrollTop();
        $.ajax({
            url: url,
            method: 'POST',
            success:
            (res)=>{
                loadSelected(window.location.href,'.main',scroll);
            }
        });
    });

    $('body').on('submit','#new',function(e){
        submitForm(e,'POST',$(this));
    });

    $('body').on('submit','#newSummer',function(e){
        barraLoad();
        submitForm(e,'POST',$(this),'simple');
    });

    $('body').on('change','#assuntoChange',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'assuntoChange');
    });

    $('body').on('submit','#newComment',function(e){
        barraLoad();
        submitForm(e,'POST',$(this),'comment');
    });

    $('body').on('submit','#formModalComentario',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'updateComment');
    });

    $('body').on('click','#formModalComentarioBtn',function(e){
        $('#formModalComentario').submit();
    });

    $('body').on('submit','#updatePost',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'simple');
    });

    $('body').on('submit','#updatePerfil',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'assuntoChange');
    });

    $('body').on('submit','#sendImg',function(e) {
        let form = $(this)[0],
            data = new FormData(form),
            page= $(this).attr('data');
            e.preventDefault();
            $(this).attr('disabled','disabled');
            barraLoad();
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
                    message(response.message,response.type);
                    location.reload();
                    endBarraLoad();
                    // loadSelected(window.location.href,'.');
                    removeMensagem();
                }
            });
        });
    
    $('body').on('submit','#trofeu',function(e){
        barraLoad();
        submitForm(e,'PUT',$(this),'assuntoChange');
    });

    $('body').on('submit','#procura-desk',function(e){
        e.preventDefault();
        barraLoad();
        var proc    = $(this).children('input[name="procura"]'),
            url     = '/blog/search/'+proc.val();
            if(proc.val()[0] != ' '){
                mudaPagina2(url,true);
                proc.val('');
            } else{
                endBarraLoad();
                proc.val('');
            }
    });

    $('body').on('submit','#procura-mob',function(e){
        e.preventDefault();
        barraLoad();
        var proc    = $(this).children('input[name="procura"]'),
            url     = '/blog/search/'+proc.val();
            if(proc.val()[0] != ' '){
                mudaPagina2(url,true);
                proc.val('');
            } else{
                endBarraLoad();
                proc.val('');
            }
    });

    $('body').on('change', '#dateEvent', function(e) {
    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
        let dataStr = $(this).val()+'-30',
            data = new Date(dataStr),
            mes  = monthNames[data.getMonth()],
            url = '/eventos/'+mes+'/'+data.getFullYear();
        barraLoad();
        mudaPagina(url,true);
    });

    $('body').on('click','.deletarPost',function(e){
        e.preventDefault();
        let page= $(this).attr('data'),
            botaoSelecionado = $(this);
            $.ajax({
                url: page,
                method: 'delete',
                success: 
                function(response, status, xhr){ 
                    let ct = xhr.getResponseHeader("content-type") || "";
                        message(response.message,response.type);
                        mudaPagina('/blog',true);
                        removeMensagem();
                }
            });
    });

    $('body').on('click','.deletarComment',function(e){
        e.preventDefault();
        $(this).attr('disabled','disabled');
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
                        $(this).removeAttr('disabled');
                        message(response.message,response.type);
                        loadSelected(window.location.href,'.comments');
                        removeMensagem();
                    }
                }
            });
    });

    $('body').on('click','.deletarTrofeu',function(e){
        $(this).attr('disabled','disabled');
        e.preventDefault();
        let url = $(this).attr('data');
        barraLoad();
        $.ajax({
            url: url,
            method: 'delete',
            success: 
            function(response, status, xhr){ 
                endBarraLoad();
                loadSelected(window.location.href,'.main',$(window).scrollTop())
            }
        });
    });
    
    $('#botaoToggler').click(function(e) {
        let attr = $('.dropdown-menu').attr('mostra');
        e.preventDefault();
        if (attr === 'true'){
            if($(window).width() < 992){
                $('#navbarSupportedContent .nav-item').toggle('slide');
            }
            $('.dropdown-menu').css('display','none');
            $('.dropdown-menu').attr('mostra','false');
        }else if(typeof attr === undefined){
            if($(window).width() < 992){
                $('#navbarSupportedContent .nav-item').toggle('slide');
            }
            $('.dropdown-menu').css('display','none');
            $('.dropdown-menu').attr('mostra','true');
        }else {
        $('.dropdown-menu').css('display','inline-block');
        $('.dropdown-menu').attr('mostra','true');
        if($(window).width() < 992){
                $('#navbarSupportedContent .nav-item').toggle('slide');
            }
        }
    });
    
    $('.ajaxPopup').on('click', function (e) {
        e.preventDefault();
        let $myModal = $('#myModal-sum');
        loadSelected(window.location,'.modal-body');
        $myModal.modal({
            show: true,
            backdrop: true
        });
    });

    $('body').on('click','.carousel-button',function(e) {
       e.preventDefault();
      $('#toggle-modal-evento').click();
       scrlTop = $(window).scrollTop();
       scrlLeft   = $(window).scrollLeft();
    });
    
    $('body').on('click','.botao-carousel',function(e) {
       e.preventDefault();
    });
    
    $('body').on('click','.close',function(e) {
        e.preventDefault();
        window.scroll(scrlLeft,scrlTop);
    });
    
    $( window ).resize(function() {
        windowSize();
    });
    $(window).on('popstate',function() {
        window.location.reload();
    });
    function submitForm(e,methodType,select,success){
            e.preventDefault();
            let page= select.attr('data');
                $.ajax({
                    url: page,
                    type: methodType,
                    data: select.serialize(),
                    timeout: 60000,
                    success:
                    function(response,status,xhr){
                        if(response.message !== undefined){
                        message(response.message,response.type);
                        removeMensagem();
                        }
                        success;
                        if (success === 'simple'){
                            endBarraLoad();
                        } else if (success === 'assuntoChange'){
                            endBarraLoad();
                            loadSelected(window.location.href,'.main',$(window).scrollTop());
                        } else if (success === 'comment'){
                            setTimeout(function(){loadSelected(window.location.href,'.comments');},300);
                            $33('#commentBox').summernote('code', '');
                        } else if (success === 'updateComment'){
                            endBarraLoad();
                            $33('#editCommentBox').summernote('code','');
                            loadSelected(window.location.href,'.comments');
                        }
                }
                });
    }
    function loadSelected(url,replaceWith,scroll,success){
        $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            success:(res,status,xhr)=>{
                endBarraLoad();
                $(replaceWith).replaceWith($(res).find(replaceWith));
                if(res.message != undefined){
                message(res.message,res.type);
                removeMensagem();
                if(typeof scroll != undefined){
                    window.scroll(scroll);
                }
                }
            }
        });
    }
    function mudaPagina (url, bool,thisEl){
        let url1 = (''== url) ? '/' : url;
        if(url1!=window.location && bool){
        $('.content-page').load(url1+" .page-main",(res)=>{
            let el = $( '<div></div>' ),
                title = $('title',el.html(res)).text();
            document.title = title;
            if(thisEl !== undefined){
            thisEl.removeAttr('disabled');
            }
            let attr = $('.navbar-toggler').attr('aria-expanded');
            if(attr){
                let buttonToggler = $('.navbar-toggler')
                buttonToggler.attr('aria-expanded','false');
                buttonToggler.addClass('collapsed');
                $('.navbar-collapse').removeClass('show');
            }
            if(url === '/home'){
                windowSize();
            }
            window.scroll(0,0);
            endBarraLoad();
        });
    }
    window.history.pushState(url,null,url);
    }
    function mudaPagina2(url,bool){
        let url1 = (''== url) ? '/' : url;
        if(url1!=window.location && bool){
            $.ajax({
                url: url,
                type: 'GET',
                success:(res)=>{
                    let html = $.parseHTML(res,true),
                        el = $( '<div></div>' ),
                        title = $('title',el.html(res)).text(),
                        attr = $('.navbar-toggler').attr('aria-expanded');
                    if(attr){
                let buttonToggler = $('.navbar-toggler')
                buttonToggler.attr('aria-expanded','false');
                buttonToggler.addClass('collapsed');
                $('.navbar-collapse').removeClass('show');
                    }
                    $('.page-main').replaceWith($(html).find('.page-main'));
                    document.title = title;
                    window.scroll(0,0);
                    endBarraLoad();
                }
            });
        }
        window.history.pushState(url,null,url);
    }
    function barraLoad(){
        if($('.progress').length==0){
            $('.page').prepend("<div class='progress p-0 m-0'><div class='indeterminate p-0 m-0'></div></div>")   
        }
    }
    function endBarraLoad(){
        $('.progress').remove();
    }
    function message(json,type){
        $('nav').append('<div class="row justify-content-md-center text-center fixed-top m-0"><div class="alert '+type+' col-md-12 text-center" role="alert">'+json+'</div></div>')
        $('input').val('');
        $('textarea').val('');
    }
    function removeMensagem (){
        setTimeout(()=>{
            $('.alert').remove()}, 3000
        );
    }
    function windowSize(){
        let windowSizeWidth     = $(window).width(),
            screenSizeWidth     = screen.width;
        if(windowSizeWidth > 992){
            $('.nav-item').show();
        }
        if(screenSizeWidth >= 770){
            $('.desktop').removeClass('active');
            $('#primBannerDesk').addClass('active');
            $('.mobile').removeClass('active carousel-item');
            $('.desktop').addClass('carousel-item');
        }
        if(screenSizeWidth <= 770){
            $('.mobile').removeClass('active');
            $('#primBannerMob').addClass('active');
            $('.mobile').addClass('carousel-item');
            $('.desktop').removeClass('active carousel-item');
        }
        if(windowSizeWidth >576){
        $('.botao-carousel').addClass('carousel-button')
        $('.botao-carousel').removeAttr('disabled');
        $('.botao-carousel').attr('data-target','#carousel-modal-demo')
        }
        if(windowSizeWidth <576){
        $('.botao-carousel').removeAttr('data-target');
        $('.botao-carousel').attr('disabled','disabled');
        $('.botao-carousel').removeClass('carousel-button');
        }
    }
    function session(){
        setTimeout(
        function(){
        $.ajax({
            url: '/logout',
            type: 'GET',
            timeout: 60000,
            success: (res)=>{
            window.location = "/blog";
            }
        });
            }, 1200000);
    }
});