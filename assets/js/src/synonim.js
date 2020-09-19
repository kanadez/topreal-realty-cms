// ########### Библиотека для работы с собственной базой геолокаций, замена Google Maps Autocomplete ############## //

function Synonim(object_for){ // object_for - объект, к кто. подключаем систему. Например, property
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
    /*for posponed on-input-search*/
    this.sleep_timer = null;
    this.input = null;
    
    this.show = function(){ // формирует и показывает загруженный по запросу список синонимов
        $('.synonim-container').html("");
        
        for (var i = 0; i < this.list.length; i++){
            $('.synonim-container').append('<div class="synonim-item" onclick="synonim.insert('+i+')"><span class="synonim-icon synonim-icon-marker"></span><span class="synonim-item-query"><span class="synonim-matched">'+this.list[i].text+'</span></span></div>');
        
            if (i === this.list.length-1){
                $('.synonim-container').append("<div class='synonim_logo'><span>"+localization.getVariable("shortcuts")+"</span> <b>TOP</b>REAL</div>");
            }
        }
        
        if (this.object_for === "search"){
            $('.synonim-container').css({top: this.current_input.offset().top+this.current_input.outerHeight()+8, left: $('#route_input').offset().left+278, width: $('#route_input').outerWidth()-150}).show();
        }
        else if (this.object_for === "client"){
            $('.synonim-container').css({top: this.current_input.offset().top+this.current_input.outerHeight()+8, left: $('#route_input').offset().left+235, width: $('#route_input').outerWidth()-150}).show();
        }
        else{
            $('.synonim-container').css({top: this.current_input.offset().top-$('.synonim-container').outerHeight(), left: this.current_input.offset().left, width: this.current_input.outerWidth()}).show();
        }
    };
    
    this.search = function(input){
        this.input = input;
        
        if (this.sleep_timer != null){
            clearTimeout(this.sleep_timer);
        }
        
        this.sleep_timer = setTimeout("synonim.searchAfterSleep()", 1000);
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
        
        if (this.object_for === "property" && property.data != null && property.data.stock == 1){
            return 0;
        }
        
        if ($(input).val().trim().length > 0 && ac.city_locales != undefined){
            $.post("/api/synonim/search.json",{
                q: $(input).val().trim(),
                pc: geoloc_tmp.city,
                pct: ac.city_locales[0]
            },function (response){
                if (response != 0){
                    synonim.list = response;
                    synonim.show();
                }else{
                    $('.synonim-container').hide();
                }
            });
        }
        else{
            $('.synonim-container').hide();
        }
    };
    
    this.insert = function(key){ // вставляет синоним в текущее поле и очиаешь гугл автокомплит
        if (this.current_input !== null){
            //this.current_input.val(this.list[key].text);
            this.current_selected[this.current_input.attr("id")] = this.list[key].id;
            this.selected[this.current_input.attr("id")] = 1;
            
            switch (this.object_for){
                case "search":
                    if (this.current_input.attr("geotype") === "route"){
                        if (this.list[key].place_id == null){
                            search.streets_mode = 2;
                            search.geoloc.street_tmp = this.list[key].id;
                            search.geoloc.street_object_tmp = {name: "<span class='tag_synonim_text'>("+this.list[key].text+")</span>"};
                            //search.geoloc.lat = 0;
                            //search.geoloc.lng = 0;
                        }
                        else{
                            search.streets_mode = 1;
                            search.geoloc.street_tmp = this.list[key].place_id;
                            search.geoloc.street_object_tmp = {name: this.list[key].place_text+" <span class='tag_synonim_text'>("+this.list[key].text+")</span>"};
                        }
                        
                        search.addStreet();
                        $("#route_input").tagit("createTag", search.geoloc.street_object_tmp.name, search.geoloc.street_tmp);
                        this.current_input.focus();
                        this.renewTags();
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        $('#neighborhood_not_selected_error').hide();
                        
                        if (this.list[key].place_id == null){
                            search.geoloc.neighborhood = this.list[key].id;
                            this.current_input.val(" ("+this.list[key].text+")");
                        }
                        else{
                            search.geoloc.neighborhood = this.list[key].place_id;
                            this.current_input.val(this.list[key].place_text+" ("+this.list[key].text+")");
                        }
                    }
                break;
                case "property":
                    if (this.current_input.attr("id") === this.route_input_id){
                        property.geoloc.street = this.list[key].id;
                        property.geoloc.lat = 0;
                        property.geoloc.lng = 0;
                    }
                    else{
                        property.geoloc.neighborhood = this.list[key].id;
                    }
                break; 
                case "client":
                    if (this.current_input.attr("geotype") === "route"){
                        if (this.list[key].place_id == null){
                            client.geoloc.street_tmp = this.list[key].id;
                            client.geoloc.street_object_tmp = {name: "<span class='tag_synonim_text'>("+this.list[key].text+")</span>"};
                        }
                        else{
                            client.geoloc.street_tmp = this.list[key].place_id;
                            client.geoloc.street_object_tmp = {name: this.list[key].place_text+" <span class='tag_synonim_text'>("+this.list[key].text+")</span>"};
                        }

                        client.addStreet();
                        this.renewTags();
                    }
                    else if (this.current_input.attr("geotype") === "neighborhood"){
                        $('#neighborhood_not_selected_error').hide();
                        
                        if (this.list[key].place_id == null){
                            client.geoloc.neighborhood = this.list[key].id;
                            this.current_input.val(" ("+this.list[key].text+")");
                        }
                        else{
                            client.geoloc.neighborhood = this.list[key].place_id;
                            this.current_input.val(this.list[key].place_text+" ("+this.list[key].text+")");
                        }
                    }
                break; 
            } 
            
            //this.resetGoogle(); 
            
            $('.synonim-container').hide();
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
                $('.geoloc_span[placeid="'+response.id+'"]').text("("+response.text+")");
            }
        });
    }; 
    
    this.autoInsertTag = function(synonim_id){ // берет с сервера один синоним и вставляет его в элемент c placeid = synonim_id
        $.post("/api/synonim/get.json",{
            id: synonim_id 
        },function (response){
            if (response.error == undefined){
                $("#route_input").tagit("createTag", '<span class="tag_synonim_text">('+response.text+')</span>', response.id);
                synonim.renewTags();
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
    
    this.renewTags = function(){
        $('.tagit-label').each(function(){
            if ($(this).attr("data-styled") == undefined){
                var a = $(this).text();
                $(this).html(a).attr("data-styled", true);
            }
        });
    };
}