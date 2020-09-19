function Localization(){
    this.locale_value = null;// сюда нужно читать дефолт агента при инициализации
    this.locale_data = null;
    
    this.init = function(){
        $('#locale_select').change(function(){            
            localization.changeLocale($(this).val());
        });
        
        //$.post("/api/localization/getdefaultlocale.json", {}, function(response){
            this.locale_value = global_data.localization_getdefaultlocale["locale_value"];
            this.locale_data = global_data.localization_getdefaultlocale["locale_data"];
            
            this.toLocaleOnInit();
        //});
    };
    
    this.changeLocaleForced = function(){
        localization.changeLocale($('#locale_select').val());
    };
    
    this.toLocaleOnInit = function(locale){
        /*if (locale == -1){
            if (utils.getCookie("locale") == undefined || utils.getCookie("locale") == -1){
                this.locale_value = "en";
            }
            else{
                this.locale_value = utils.getCookie("locale");
            }
            
            $('#locale_select').val(this.locale_value);
        }
        else{
            this.locale_value = locale;
        }*/

        for (var i = 0; i < this.locale_data.length; i++){
            var e = $('*[locale="'+this.locale_data[i].variable+'"]');
            var v = this.locale_data[i][this.locale_value];
            e.html(v);

            /*if (e.attr("localized") == undefined){
                e.attr("localized", "no");
            }*/

            this.localeTitle(i);

            if (this.isOverflowed(e)){
                e.attr("title", v);
                /*var e_selected = $('*[locale="'+this.locale_data[i].variable+'"]:selected');

                if (e_selected.length > 0 && e_selected.attr("localized") == "no"){
                    e_selected.parent().attr("title", v);
                    e_selected.attr("localized", "yes");
                }*/
            }
            else{
                e.attr("title", "");
            }
        }
        
        this.setDatepickerLocale();
        this.setArabian();
        $('.help_tip, .help_tip_span, .help_tip_label').tooltip(); 
    };
    
    /*this.setLocale = function(locale){
        var locale_parsed = locale;
        
        if (locale == -1 && utils.getCookie("locale") != undefined && utils.getCookie("locale") != -1){ // если дифолт-локаль не задана, но она есть в куках
            locale_parsed = utils.getCookie("locale");
        }
        
        this.locale_value = locale_parsed;
        utils.setCookie("locale", locale_parsed, {expires: 315360000});
        $('#locale_select').val(locale_parsed);
        this.getLocale(locale_parsed);
        
        if (typeof user != "undefined" && user.id != 4){
            $.post("/api/defaults/set.json",{
                parameter: "locale",
                value: locale_parsed
            },function (response){
                if (response.error != undefined)
                   showErrorMessage(response.error.description);
            });
        }
    };*/
    
    this.changeLocale = function(locale){
        utils.setCookie("locale", locale, {expires: 315360000});
        
        if (typeof user != "undefined" && user.id != 4){
            $.post("/api/defaults/set.json",{
                parameter: "locale",
                value: locale
            },function (response){
                if (response.error != undefined){
                   showErrorMessage(response.error.description);
                }
                else{
                    location.reload();
                }
            });
        }
        else{
            location.reload();
        }
    };
    
    this.toLocale = function(){
        //console.log("localization.toLocale()");
        
        if (this.locale_data != null){
            for (var i = 0; i < this.locale_data.length; i++){
                var e = $('*[locale="'+this.locale_data[i].variable+'"]');
                var v = this.locale_data[i][this.locale_value];
                e.html(v);
                
                this.localeTitle(i);
                
                if (localization.isOverflowed(e)){
                    e.attr("title", v);
                }
                else{
                    e.attr("title", "");
                }
            }
            
            this.setArabian();
            $('.help_tip, .help_tip_span, .help_tip_label').tooltip(); 
        }
    };
    
    this.getVariable = function(key){ // отдает значение отдельного слова/фразы на текущем языке
        if (this.locale_data != null){
            for (var i = 0; i < this.locale_data.length; i++){
                if (this.locale_data[i].variable === key){
                    return this.locale_data[i][this.locale_value];
                }
            }
        }
    };
    
    /*this.setDefault = function(){
        localization.locale_value = "en";
        this.getLocale("en");
    };*/
    
    this.localeTitle = function(counter){
        var e = $('*[locale_title="'+this.locale_data[counter].variable+'"]');
        var v = this.locale_data[counter][this.locale_value];
        
        if (e.attr("data-original-title") == undefined){
            e.attr("title", v);
        }

        e = $('*[locale_data_title="'+this.locale_data[counter].variable+'"]');
        v = this.locale_data[counter][this.locale_value];
        e.attr("data-title", v);

        e = $('*[locale_placeholder="'+this.locale_data[counter].variable+'"]');
        v = this.locale_data[counter][this.locale_value];
        e.attr("placeholder", v);
    };
    
    this.setArabian = function(){
        if (location.pathname == "/"){
            if (this.locale_value == "he" || this.locale_value == "ar" || this.locale_value == "fa"){
                $('body').attr("dir", "rtl");
                $('#slider').css("direction", "ltr");
                $('#try_now_top_button').css("margin-right", "20px");
                $('#register_now_button').css("margin-right", "0");
                
                if (this.locale_value != "ar" && this.locale_value != "fa"){ // HE only
                    //$('#slider li, #slider > a').hide();
                    //$('#slider #youtube_slide').show();
                    
                    if (screen.width <= 1024){
                        $('#laptop_img').css("margin-right", "-43px");
                    }
                }
            }
            else{
                $('body').attr("dir", "ltr");
                //$('#slider li, #slider > a').show();
                //$('#slider #youtube_slide').hide();
            }
        }
        else if (location.pathname != "/" && (this.locale_value == "he" || this.locale_value == "ar" || this.locale_value == "fa")){
            $('span, label, input, button, a, .modal, select, textarea').css("direction", "rtl");            
            $('#tools_button, #help_a, #toggle-right, #logout_a').css("direction", "ltr");
            $('.show_password_span').css("right", "-21px");
            $('.modal-header > button.close').css("float", "left");
            $('#bug_a').css("direction", "ltr");
            
            switch (location.pathname){
                case "/query":
                    $('#legend_wrapper').css("float", "left");
                    $('ul.tagit li').css("float", "right");
                    $('#property_results_table_wrapper, #client_results_table_wrapper').css("direction", "rtl");
                break;
                case "/client":
                    $('#comparison_modal .modal_header_buttons_block').css({
                        direction: "ltr",
                        marginRight: "30px"
                    });
                break;
                case "/property":
                    $('#comparison_modal .modal_header_buttons_block').css({
                        direction: "ltr",
                        marginRight: "30px"
                    });
                    
                    if (this.locale_value != "ar" && this.locale_value != "fa"){
                        $('.stock_badge').css("margin-left", "18px");
                        $('#collected_stock_buttona_wrapper').css({
                            "margin-top": "-22px",
                            "margin-right": "-18px"
                        });
                    }
                    else if (this.locale_value == "ar"){
                        $('#collected_stock_buttona_wrapper').css({
                            "margin-left": "3px"
                        });
                    }
                    else{
                        $('#collected_stock_buttona_wrapper').css({
                            "margin-top": "-22px",
                            "margin-left": "3px"
                        });
                    }
                break;
            }
        }
        else if ( //fix stock for all except ru, el, da, tr, cs, ro
                this.locale_value != "ru" &&
                this.locale_value != "el" &&
                this.locale_value != "da" &&
                this.locale_value != "tr" &&
                this.locale_value != "cs" &&
                this.locale_value != "ro"
        ){
            switch (location.pathname){
                case "/property":
                    $('.stock_badge').css("margin-left", "18px");
                    $('#collected_stock_buttona_wrapper').css({
                        "margin-top": "-22px"
                    });
                break;
            }
        }
        else{
            $('body').attr("dir", "ltr");
            $('span, label, input, button, a, .modal, select, textarea').css("direction", "ltr");
            $('#property_results_table_wrapper, #client_results_table_wrapper').css("direction", "ltr");
            $('.show_password_span').css("right", "12px");
            $('.modal-header > button.close').css("float", "right");
            
            switch (location.pathname){
                case "/query":
                    $('#legend_wrapper').css("float", "right");
                    $('ul.tagit li').css("float", "left");
                    $('#property_results_table_wrapper, #client_results_table_wrapper').css("direction", "ltr");
                break;
                case "/client":
                    $('#comparison_modal .modal_header_buttons_block').css({
                        marginRight: "0px"
                    });
                break;
                case "/property":
                    $('#comparison_modal .modal_header_buttons_block').css({
                        marginRight: "0px"
                    });
                break;
            }
        }
    };
    
    this.isArabian = function(){
        if (this.locale_value === "he" || this.locale_value === "ar" || this.locale_value === "fa"){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.isOverflowed = function(element){
        var e = element[0];
        
        if (e != undefined){
            return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth; //|| this.textOverflowed(element);
        }
        else{
            return false;
        }
    };
    
    this.textOverflowed = function(e) {
        var tagname = e.prop("tagName");
        var font = e.css("font-family");
        var font_size = e.css("font-size");
        var font_weight = e.css("font-weight");
        // if given, use cached canvas for better performance
        // else, create new canvas
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = font+" "+font_size+" "+font_weight;
        
        switch (tagname) {
            case "OPTION":
                var metrics = context.measureText(e.html());
                
                if (e.parent().width() > metrics.width*1.3){
                    return false;
                }
                else return true;
            break;
            case "INPUT": 
                var metrics = context.measureText(e.val());
                
                if (e.width() > metrics.width*1.3){
                    return false;
                }
                else{
                    return true;
                }
            break;
        }
    };
    
    this.setDatepickerLocale = function(){
        var locale = "en";
        
        switch (this.locale_value){
            case "he":
                locale = "he";
            break;
            case "ru":
                locale = "ru";
            break;
            case "fr":
                locale = "fr";
            break;
        }
        
        if (
                location.pathname === "/query" || 
                location.pathname === "/property" ||
                location.pathname === "/client" ||
                location.pathname === "/map" ||
                location.pathname === "/balance"
        ){
            $.datepicker.setDefaults($.datepicker.regional[locale]);
        }
    };
}