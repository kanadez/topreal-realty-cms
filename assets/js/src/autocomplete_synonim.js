// ########### Библиотека для работы с собственной базой геолокаций, замена Google Maps Autocomplete ############## //

function AutocompleteSynonim(object_for){ // object_for - объект, к кто. подключаем систему. Например, property
    this.list = null;//["ул. Ленина", "ул. Лен.", "ул. Лены", "ул. Ленинградская", "ул. Ленинская", "ул. Лени"];
    this.current_input = null; // текущее поле ввода куда набирается геолокация
    this.current_selected = {  // текущий выбранный геосиноним
        route: null, 
        neighborhood: null 
    };
    this.selected = { // флаги для переключения когда гугл-геолокация или синоним был выбран, чтоб не создавать новый
        route: 0, 
        neighborhood: 0 
    };
    this.object_for = object_for;
    this.confirmed = {  // подтверждения для создания синонимв
        route: 0, 
        neighborhood: 0 
    };
    this.route_input_id = location.pathname === "/query" ? "synonim_route" : "route";
    
    this.show = function(){ // формирует и показывает загруженный по запросу список синонимов
        $('.ac_synonim-container').html("");
        this.current_input = ac.current_input;
        
        for (var i = 0; i < ac.synonims.length; i++){
            if (ac.synonims[i] != null){
                $('.ac_synonim-container').append('<div class="ac_synonim-item" data-key="'+i+'" onclick="ac_synonim.insert('+i+')" oncontextmenu="ac_synonim.edit(this, '+i+');return false;"><span class="ac_synonim-icon ac_synonim-icon-marker"></span><span class="ac_synonim-item-query"><span class="ac_synonim-matched">'+ac.synonims[i].text+'</span></span></div>');
            }
            else{
                $('.ac_synonim-container').append('<div class="ac_synonim-item" data-key="'+i+'" onclick="ac_synonim.new(this, '+i+')"><span class="ac_synonim-icon-new ac_synonim-icon-marker"></span><span class="ac_synonim-item-query"><span class="ac_synonim-matched"></span></span></div>');
            }
            
            if (i === ac.synonims.length-1){
                $('.ac_synonim-container').append("<div class='ac_synonim_logo'><span>"+localization.getVariable("shortcuts")+"</span> <b>TOP</b>REAL</div>");
            }
        }
        
        if (location.pathname === "/query"){
            $('.ac_synonim-container').css({top: this.current_input.offset().top+this.current_input.outerHeight(), left: this.current_input.offset().left, width: this.current_input.outerWidth()}).show();
        }
        else{
            $('.ac_synonim-container').css({top: this.current_input.offset().top+this.current_input.outerHeight(), left: this.current_input.offset().left+226, width: this.current_input.outerWidth()-150}).show();
        }
        
        if (this.current_input.val().trim().length === 0){
            $('.ac_synonim-container').hide();
        }
    };
    
    this.removeInput = function(){
        if ($('#ac_new_synonim_input').length > 0){
            var parent = $('#ac_new_synonim_input').parent();
            
            $('#ac_new_synonim_input, #ac_new_synonim_input+div').remove();
            parent.html('<span class="ac_synonim-icon-new ac_synonim-icon-marker"></span><span class="ac_synonim-item-query"><span class="ac_synonim-matched"></span></span>').css("text-align", "left");
        }
    };
    
    this.new = function(div, key){
        /*if (user.type != 0 && user.type != 2){
            utils.errorModal("<span locale='quote_add_error'>Only agency host is able to add quotes.</span>");
            
            return 0;
        }*/
        
        this.removeInput();
        $(div).html('<input id="ac_new_synonim_input" locale_placeholder="type_n_press_enter" maxlength="100" onkeypress="return ac_synonim.add(event, '+key+')" placeholder="'+localization.getVariable("type_n_press_enter")+'" /><div class="ac_synonim-loader"></div>').css("text-align", "center");
        $('#ac_new_synonim_input').focus();
    };
    
    this.edit = function(div, key){
        if (user.agency_data.id == 1){
            this.removeInput();
            $(div).html('<input id="ac_new_synonim_input" locale_placeholder="type_n_press_enter" maxlength="100" onkeypress="return ac_synonim.saveEdited(event, '+key+')" placeholder="'+localization.getVariable("type_n_press_enter")+'" /><div class="ac_synonim-loader"></div>').css("text-align", "center");
            $('#ac_new_synonim_input').focus();
        }
    };
    
    this.add = function(e, key){
        if (e.keyCode == 13 && $('#ac_new_synonim_input').val().trim().length > 0){
            $('#ac_new_synonim_input+div').show();
            
            $.post("/api/acsynonim/add.json", {
                place_id: ac.list[key].place_id,
                place_text: ac.list[key].structured_formatting.main_text,
                place_fulltext: ac.list[key].description,
                place_city: property.geoloc.city,
                place_city_text: ac.city_locales[0],
                text: $('#ac_new_synonim_input').val().trim()
            }, function (response){
                $('#ac_new_synonim_input+div').hide();
                
                if (response.error == undefined){
                    $('#ac_new_synonim_input').parent()
                        .html('<span class="ac_synonim-icon ac_synonim-icon-marker"></span><span class="ac_synonim-item-query"><span class="ac_synonim-matched">'+response.text+'</span></span>')
                        .css("text-align", "left")
                        .attr("onclick", "ac_synonim.insert("+$(this).attr("data-key")+")");
                }
                else{
                    $('#synonim_error_modal .modal-body > div > span')
                        .attr("locale", response.error.description)
                        .text(localization.getVariable(response.error.description));
                    $('#synonim_error_modal').modal("show");
                }
            });
            
            return false;
        }
    };
    
    this.saveEdited = function(e, key){
        if (e.keyCode == 13 && $('#ac_new_synonim_input').val().trim().length > 0){
            $('#ac_new_synonim_input+div').show();
            
            $.post("/api/acsynonim/edit.json", {
                synonim_id: ac.synonims[key].id,
                text: $('#ac_new_synonim_input').val().trim()
            }, function (response){
                $('#ac_new_synonim_input+div').hide();
                
                if (response.error == undefined){
                    $('#ac_new_synonim_input').parent()
                        .html('<span class="ac_synonim-icon ac_synonim-icon-marker"></span><span class="ac_synonim-item-query"><span class="ac_synonim-matched">'+response.text+'</span></span>')
                        .css("text-align", "left")
                        .attr("onclick", "ac_synonim.insert("+$(this).attr("data-key")+")");
                }
                else{
                    $('#synonim_error_modal .modal-body > div > span')
                        .attr("locale", response.error.description)
                        .text(localization.getVariable(response.error.description));
                    $('#synonim_error_modal').modal("show");
                }
            });
            
            return false;
        }
    };
    
    this.search = function(input){ // получает список синонимов с сервера по вводу строки (onkeyup)
        this.selected[$(input).attr("id")] = 0;
        this.current_input = $(input);
        //this.resetGoogle();
        //this.clearCurrentSelected();
        
        if (this.object_for === "property" && property.data != null && property.data.stock == 1){
            return 0;
        }
        
        if ($(input).val().trim().length > 0){
            $.post("/api/acsynonim/search.json",{
                query: $(input).val().trim()
            },function (response){
                if (response != 0){
                    ac_synonim.list = response;
                    ac_synonim.show();
                }else{
                    $('.ac_synonim-container').hide();
                }
            });
        }
        else{
            $('.ac_synonim-container').hide();
        }
    };
    
    this.insert = function(key){ // вставляет синоним в текущее поле и очиаешь гугл автокомплит
        if (this.current_input !== null){
            this.current_selected[this.current_input.attr("id")] = ac.synonims[key].id;
            this.selected[this.current_input.attr("id")] = 1;
            
            switch (this.object_for){
                case "search":
                    if (this.current_input.attr("id") === this.route_input_id){
                        search.streets_mode = 2;
                        search.geoloc.street_tmp = this.list[key].id;
                        search.geoloc.street_object_tmp = {"name": this.list[key].text};
                    }
                break;
                case "property":
                    if (this.current_input.attr("geotype") === "route"){
                        property.geoloc.street = ac.list[key].place_id;
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        property.geoloc.neighborhood = ac.list[key].place_id;
                    }
                    
                    this.current_input.val((ac.list[key].structured_formatting.main_text != null ? ac.list[key].structured_formatting.main_text : "")+" ("+ac.synonims[key].text+")");
                break; 
                case "client":
                    if (this.current_input.attr("geotype") === "route"){
                        client.geoloc.street_tmp = this.list[key].id;
                        client.geoloc.street_object_tmp = {"name": this.list[key].text};
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        client.geoloc.neighborhood = this.list[key].id;
                    }
                break; 
            } 
            
            //this.resetGoogle(); 
            
            $('.ac_synonim-container, .autocomplete-container').hide();
        }
    };
    
    this.autoInsert = function(synonim_id, input){ // берет с сервера один синоним и вставляет его в текущее поле
        this.current_input = input;
        
        $.post("/api/acsynonim/get.json",{
            id: synonim_id,
            type: this.current_input.attr("id")
        },function (response){
            if (response.error == undefined){
                $('#'+response.type).val(response.text).attr("place_name", response.text);
                ac_synonim.current_selected[response.type] = response.id;
                ac_synonim.selected[response.type] = 1;
            }
        });
    };
    
    this.autoInsertNoInput = function(synonim_id){ // берет с сервера один синоним и вставляет его в элемент c placeid = synonim_id
        $.post("/api/acsynonim/get.json",{
            id: synonim_id 
        },function (response){
            if (response.error == undefined){
                $('.geoloc_span[placeid="'+response.id+'"]').text(response.text);
            }
        });
    }; 
    
    this.autoInsertTag = function(synonim_id){ // берет с сервера один синоним и вставляет его в элемент c placeid = synonim_id
        $.post("/api/acsynonim/get.json",{
            id: synonim_id 
        },function (response){
            if (response.error == undefined){
                $("#route_input").tagit("createTag", response.text, response.id);
            }
        });
    };
    
    this.reset = function(){ // сбрасывает значения гео-позиции (например, при выборе варианта гугл-автокомплита)
        this.clearCurrentSelected();
        $('.ac_synonim-container').hide();
    };
    
    this.resetGoogle = function(){ // сбрасывает geoloc
        switch (this.object_for){
            case "search":
                search.geoloc.street = null;
                //search.geoloc.lat = null;
                //search.geoloc.lng = null;
            break;
            case "property":
                property.geoloc.street = null;
                //property.geoloc.lat = null;
                //property.geoloc.lng = null;
            break; 
            case "client":
                client.geoloc.street = null;
                //property.geoloc.lat = null;
                //property.geoloc.lng = null;
            break; 
        } 
    };
    
    this.collectRoute = function(){ // правильно собирает данные нового синонима для улицы для отправки на серв, причем универсально как для поиска так и для остального
        if ($('#route').val().trim().length > 0 && this.selected.route === 0 && ac.selected.route === 0){
            return $('#route').val().trim();
        }
        else{
            return null;
        }
    };
    
    this.collectHood = function(){ // правильно собирает данные для отправки нового синонима для улицы на серв, причем универсально как для поиска так и для остального
        if ($('#neighborhood').val().trim().length > 0 && this.selected.neighborhood === 0 && ac.selected.neighborhood === 0){
            return $('#neighborhood').val().trim();
        }
        else{
            return null;
        }
    };
    
    /*this.collectRouteForSaved = function(){ // правильно собирает данные нового синонима для улицы для отправки на серв, причем универсально как для поиска так и для остального
        if ($('#route').val().trim().length > 0 && this.selected.route === 0 && ac.selected.route === 0 && property.changes.route != undefined){
            return $('#route').val().trim();
        }
        else{
            return null;
        }
    };
    
    this.collectHoodForSaved = function(){ // правильно собирает данные для отправки нового синонима для улицы на серв, причем универсально как для поиска так и для остального
        if ($('#neighborhood').val().trim().length > 0 && this.selected.neighborhood === 0 && ac.selected.neighborhood === 0  && property.changes.neighborhood != undefined){
            return $('#neighborhood').val().trim();
        }
        else{
            return null;
        }
    };*/
    
    this.addGooglePlace = function(short_name, long_name, lat, lng, placeid){ // кладет в базу место гугла
        $.post("/api/googleac/add.json",{
            short_name: short_name,
            long_name: long_name,
            lat: lat,
            lng: lng,
            placeid: placeid
        }, null);
    };
    
    this.clearCurrentSelected = function(){ // очищает выбор синонимов по ключу
        this.current_selected = { 
            route: null, 
            neighborhood: null 
        };
    };
    
    this.confirmCreating = function(subject){ // подтверждает создание синонима после выдачи предупрежедения юзеру
        this.confirmed[subject] = 1;
        
        if (property.newcard === 1){
            property.create();
        }
        else{ 
            property.save();
        }
    };
    
    this.getByPlaceID = function(place_id){
        $.post("/api/acsynonim/getbyplaceid.json",{
            place_id: place_id
        }, function(response){
            if (response != false){
                $('.ac_synonim_badge[place_id="'+response[0]+'"]').text("("+response[1]+")");
            }
        });
    };
    
    this.getByPlaceIDForInput = function(place_id){
        $.post("/api/acsynonim/getbyplaceid.json",{
            place_id: place_id
        }, function(response){
            if (response != false){
                var tmpval = $('.ac_synonim_input[place_id="'+response[0]+'"]').val();
                $('.ac_synonim_input[place_id="'+response[0]+'"]').val(tmpval+" ("+response[1]+")");
            }
        });
    };
}