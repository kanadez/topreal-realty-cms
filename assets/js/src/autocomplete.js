function Autocomplete(object_for){ // object_for - объект, к кто. подключаем систему. Например, property
    this.list = null;//["ул. Ленина", "ул. Лен.", "ул. Лены", "ул. Ленинградская", "ул. Ленинская", "ул. Лени"];
    this.synonims = null;
    this.geolocation; // геолокация центра текущего города (для поиска в радиусе 6км вокруг)
    this.current_input = null; // текущее поле ввода куда набирается геолокация
    this.current_selected = {  // текущий выбранный геосиноним
        route: null, 
        neighborhood: null 
    };
    this.selected = { // флаги для переключения когда гугл-геолокация или синоним был выбран, чтоб не создавать новый
        route: 0, 
        neighborhood: 0 
    };
    this.selected_geolocations_names = []; // названия выбранных локаций для одного поля ввода (при перекл в другое нужно обнулять)
    this.object_for = object_for;
    this.confirmed = {  // подтверждения для создания синонимв
        route: 0, 
        neighborhood: 0 
    };
    this.route_input_id = "route";
    /*for posponed on-input-search*/
    this.sleep_timer = null;
    this.input = null;
    
    this.show = function(){ // формирует и показывает загруженный по запросу список синонимов
        $('.autocomplete-container').html("");
        var tmp_list = [];
        var tmp_synonims = [];
        
        for (var i = 0; i < this.list.length; i++){
            var location_coincides = false;
            
            for (var c = 0; c < this.city_locales.length; c++){
                if (this.list[i].terms[1] != undefined && utils.stringContains(this.city_locales[c], this.list[i].terms[1].value)){
                    location_coincides = true;
                }
            }
            
            if (location_coincides){
                tmp_list.push(this.list[i]);
                tmp_synonims.push(this.synonims[i]);
            }
        }
        
        tmp_list = utils.arrUnique(tmp_list, "place_id");
        tmp_synonims = utils.arrUnique(tmp_synonims, "id");
        this.list = tmp_list.reverse();
        this.synonims = tmp_synonims.reverse();
        
        for (var i = 0; i < this.list.length; i++){
            if (this.list[i].structured_formatting.main_text != null){
                $('.autocomplete-container').append('<div class="autocomplete-item" onclick="ac.insert('+i+')"><span class="autocomplete-icon autocomplete-icon-marker"></span><span class="autocomplete-item-query"><span class="autocomplete-matched">'+this.list[i].structured_formatting.main_text+'</span>&nbsp;&nbsp;<span class="autocomplete-matched-secondary">'+this.list[i].structured_formatting.secondary_text+'</span></span></div>');
            }
            else{
                $('.autocomplete-container').append('<div class="autocomplete-item"><span></span><span class="autocomplete-item-query"><span class="autocomplete-matched"></span>&nbsp;&nbsp;<span class="autocomplete-matched-secondary"></span></span></div>');
            }
            
            if (i === this.list.length-1 && $('.autocomplete-item').length > 0){
                $('.autocomplete-container').append("<div class='autocomplete_logo'></div>");
            }
        }
        
        if (this.object_for === "search" || this.object_for === "client"){
            $('.autocomplete-container').css({top: this.current_input.offset().top+this.current_input.outerHeight()+8, left: $('#route_input').offset().left, width: $('#route_input').outerWidth()-100}).show();
        }
        else{
            $('.autocomplete-container').css({top: this.current_input.offset().top+this.current_input.outerHeight(), left: this.current_input.offset().left, width: this.current_input.outerWidth()-100}).show();
        }
        
        if (this.current_input.val().trim().length === 0 || $('.autocomplete-item').length === 0){
            $('.autocomplete-container, .ac_synonim-container').hide();
        }
        
        ac_synonim.show();
    };
    
    this.search = function(input){
        this.input = input;
        
        if (this.sleep_timer != null){
            clearTimeout(this.sleep_timer);
        }
        
        this.sleep_timer = setTimeout("ac.searchAfterSleep()", 1000);
    };
    
    this.searchAfterSleep = function(){ // получает список синонимов с сервера по вводу строки (onkeyup)
        var input = this.input;
        this.selected[$(input).attr("id")] = 0;
        this.current_input = $(input);
        var geoloc_tmp = null;
        
        switch (this.object_for){
            case "property":
                geoloc_tmp = property.geoloc;
            break;
            case "client":
                geoloc_tmp = client.geoloc;
            break;
            case "search":
                geoloc_tmp = search.geoloc;
            break;
        }
        //this.resetGoogle();
        //this.clearCurrentSelected();
        
        if ($(input).val().trim().length > 0 && ac.city_locales != undefined){
            $.post("/api/autocomplete/search.json",{
                q: $(input).val().trim().split(",").pop().trim(),
                ll: JSON.stringify(this.geolocation),
                t: $(input).attr("ac_types"),
                l: localization.locale_value,
                pc: geoloc_tmp.city,
                pct: ac.city_locales[0] 
            },function (response){
                if (response != 0){
                    ac.list = response[0].predictions;
                    ac.synonims = response[1];
                    ac.show();
                }else{
                    $('.autocomplete-container, .ac_synonim-container').hide();
                }
            });
        }
        else{
            $('.autocomplete-container, .ac_synonim-container').hide();
        }
    };
    
    this.insert = function(key){ // вставляет синоним в текущее поле и очиаешь гугл автокомплит
        if (this.current_input !== null){ 
            this.current_selected[this.current_input.attr("id")] = this.list[key].place_id;
            this.selected[this.current_input.attr("id")] = 1;
            
            switch (this.object_for){
                case "search":
                    if (this.current_input.attr("geotype") === "route"){
                        search.streets_mode = 1;
                        search.geoloc.street_tmp = this.list[key].place_id;
                        search.geoloc.street_object_tmp = {name: this.list[key].structured_formatting.main_text};

                        search.addStreet();
                        $("#route_input").tagit("createTag", this.list[key].structured_formatting.main_text, this.list[key].place_id);
                        this.current_input.focus();
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        search.geoloc.neighborhood = this.list[key].place_id;
                        this.current_input.val(this.list[key].structured_formatting.main_text+(this.synonims[key] != null ? " ("+this.synonims[key].text+")" : ""));
                    }
                break;
                case "property":
                    if (this.current_input.attr("geotype") === "route"){
                        property.geoloc.street = this.list[key].place_id;
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        property.geoloc.neighborhood = this.list[key].place_id;
                    }
                    
                    this.current_input.val(this.list[key].structured_formatting.main_text+(this.synonims[key] != null ? " ("+this.synonims[key].text+")" : ""));
                break; 
                case "client":
                    if (this.current_input.attr("geotype") === "route"){
                        client.geoloc.street_tmp = this.list[key].place_id;
                        client.geoloc.street_object_tmp = {"name": this.list[key].structured_formatting.main_text};
                        client.addStreet();
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        client.geoloc.neighborhood = this.list[key].place_id;
                        this.current_input.val(this.list[key].structured_formatting.main_text+(this.synonims[key] != null ? " ("+this.synonims[key].text+")" : ""));
                        ac_synonim.selected.neighborhood = 1;
                        $('#neighborhood_not_selected_error').hide();
                    }
                break; 
            } 
            
            //this.resetGoogle();
            $('.autocomplete-container').hide();
            utils.addGooglePlaceShort(this.list[key].place_id);
        }
    };
    
    this.autoInsert = function(synonim_id, input){ // берет с сервера один синоним и вставляет его в текущее поле
        this.current_input = input;
        
        $.post("/api/synonim/get.json",{
            id: synonim_id,
            type: this.current_input.attr("id")
        },function (response){
            if (response.error == undefined){
                $('#'+response.type).val(response.text).attr("place_name", response.text);
                synonim.current_selected[response.type] = response.id;
                synonim.selected[response.type] = 1;
            }
        });
    };
    
    this.autoInsertNoInput = function(synonim_id){ // берет с сервера один синоним и вставляет его в элемент c placeid = synonim_id
        $.post("/api/synonim/get.json",{
            id: synonim_id 
        },function (response){
            if (response.error == undefined){
                $('.geoloc_span[placeid="'+response.id+'"]').text(response.text);
            }
        });
    }; 
    
    this.autoInsertTag = function(synonim_id){ // берет с сервера один синоним и вставляет его в элемент c placeid = synonim_id
        $.post("/api/synonim/get.json",{
            id: synonim_id 
        },function (response){
            if (response.error == undefined){
                $("#route_input").tagit("createTag", response.text, response.id);
            }
        });
    };
    
    this.reset = function(){ // сбрасывает значения гео-позиции (например, при выборе варианта гугл-автокомплита)
        this.clearCurrentSelected();
        $('.synonim-container').hide();
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
    
    this.collectRoute = function(object){ // правильно собирает данные нового синонима для улицы для отправки на серв, причем универсально как для поиска так и для остального
        if ($('#'+this.route_input_id).val().trim().length > 0 && this.selected.route === 0){
            return $('#'+this.route_input_id).val().trim();
        }
        else{
            return null;
        }
    };
    
    this.collectHood = function(object){ // правильно собирает данные для отправки нового синонима для улицы на серв, причем универсально как для поиска так и для остального
        if ($('#neighborhood').val().trim().length > 0 && this.selected.neighborhood === 0){
            return $('#neighborhood').val().trim();
        }
        else{
            return null;
        }
    };
    
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
    
    this.getCityLocales = function(city_placeid){
        $.post("/api/geo/getforlocales.json",{
            place_id: city_placeid
        }, function (response){
            ac.city_locales = response;
        });
    };
}