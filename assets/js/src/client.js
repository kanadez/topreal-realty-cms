var localization = new Localization();
var client = new Client(); // объект клиента
var urlparser = new URLparser(); // парсер урл-адреса
var synonim = new Synonim("client"); // оюъект для работы с системой гео-синонимов
var ac_synonim = new AutocompleteSynonim("client");
var ac = new Autocomplete("client"); // ac, т.к. autocomlete где-то уже используется
var user = new User();
var clientcomp = new ClientComparison();
var propcomp = new PropertyComparison();
var uslider = new UploadsSlider();
var help_tip = new HelpTip();
var utils = new Utils(); // утилиты общего назначения
var imageviewer = null; // объект вьювераient/getformoptions изображений 
var docviewer = null; // объект вьювера документов
var hist = null; // объект Истории. данные парсятся после получения общего списка валют водном из шагов property.get
var owl = new Owl();
var stock = new Stock();
var subscription = new Subscription();
var tools = new Tools();

$(document).click(function(e){
    var target = $(e.target);
    
    if (!target.is('#'+client.focused_input_id) && !target.is('#'+client.showed_multiselect_id) && !target.is('#'+client.showed_multiselect_id+' option')) $('#'+client.showed_multiselect_id).hide();   

    if (
            !target.is('.synonim-container') && 
            !target.is('.synonim-item') &&
            !target.is('.synonim-icon') &&
            !target.is('.synonim-item-query') && 
            !target.is('.synonim-matched')
    ){
        $('.synonim-container').hide();
    }
    
    if (
            !target.is('.autocomplete-container') && 
            !target.is('.autocomplete-item') &&
            !target.is('.autocomplete-icon') &&
            !target.is('.autocomplete-item-query') && 
            !target.is('.autocomplete-matched')
    ){
        $('.autocomplete-container').hide();
    }
});

$(document).ajaxStop(function() {
  client.multiSelectToInput("properties_select", "properties_input");
  client.loaderStop();
  utils.setSelectsOverflows(client.overflowed_selects);
});

function Client(){
    this.temporary_id = null;
    this.defaults = {};
    this.data = null;
    this.agent_list = null;
    this.search = null;
    this.clients = null;
    this.properties = null;
    this.properties_parsed = [];
    this.property_from = null; // недвижимость, с компарижна которой сделан переход
    this.object_type = 1;
    this.geoloc = {};
    this.geo_mode = 1;
    this.geoloc.street = [];
    this.geoloc.street_objects = [];
    this.geoloc.city_locales = [];
    this.form_options = {};
    this.changes = {};
    this.last_change = null;
    this.changes_interval = null;
    this.focused_input_id = "properties_input";
    this.showed_multiselect_id = "properties_select";
    this.mode = 1;// 1 - view mode, 2 - edit mode
    this.newcard = 1;
    this.just_created = 0; // флаг факта создания карточки, устанавлениется от создания и до reload
    this.uploaded_doc_id = null; // временное хранение только что выгруженного документа
    this.doc_new_filename_prefix = "";
    this.form_elements = [
        "properties_input",
        "properties_select",
        "price_from_input",
        "price_to_input",
        "currency_select",
        "select_status",
        "floors_from_input",
        "floors_to_input",
        "rooms_from_count_input",
        "rooms_to_count_input",
        "age_from_select",
        "contact1_input",
        //"contact1_remark_input",
        "contact2_input",
        //"contact2_remark_input",
        "contact3_input",
        //"contact3_remark_input",
        "contact4_input",
        //"contact4_remark_input",
        "contact5_input",
        "name_input",
        "country",
        "administrative_area_level_1",
        "locality",
        "neighborhood",
        "route",
        "furniture_select",
        "object_type_select",
        "homesize_from_input",
        "homesize_to_input",
        "homesize_dims_select",
        "lotsize_from_input",
        "lotsize_to_input",
        "lotsize_dims_select",
        "freefrom_input",
        "select_project",
        "remarks_area",
        "del_doc_button",
        "add_doc_button",
        "doc_upload_input",
        "details_area",
        "contour_select",
        "geo_mode_select",
        "free_number_input",
        "rooms_type_select"
    ];
    
    this.form_elements_classes = [
        "delete_upload_button"
    ];
    
    this.form_checkboxes = [
        "nogroundfloor_check",
        "nolastfloor_check",
        "front_check",
        "parking_check",
        "conditioner_check",
        "elevator_check"
    ];
    
    this.neccesary = [
        "properties_input",
        "price_from_input",
        "price_to_input",
        "contact1_input",
        "country"
    ];
    
    this.overflowed_selects = [
        "geo_mode_select",
        "object_type_select"
    ];
    
    this.form_buttons_to_block = [
        "newcard_button",
        "to_search_button",
        "saved_button",
        "copy_button",
        "print_button",
        "check_button",
        "del_button",
        "next_button",
        "previous_button",
        "to_calendar_button",
        "comparison_button",
        "map_button",
        "history_button",
        "in_owl_button",
        "utils_button",
        "new_button"
    ];
    
    this.initImageViewer = function(){
        $.post("/api/property/getphotos.json",{
            iPropertyId: this.temporary_id !== null ? this.temporary_id : this.data.id
        },function (response){
            if (client.newcard == 1) client.data = {};
            client.data.photos = response;
            imageviewer = new ImageViewer(response, 0);
            imageviewer.showLast();
        });
    };
    
    this.initDocViewer = function(){
        $.post("/api/client/getdocs.json",{
            client_id: this.temporary_id !== null ? this.temporary_id : this.data.id
        },function (response){
            if (response.error == undefined){
                if (client.newcard == 1) client.data = {};
                client.data.docs = response;
                docviewer = new DocViewer(response, 0);
                docviewer.showLast();
            }
        });
    };
    
    this.setupForm = function(){
        this.loaderStart();
        this.viewmode();
        localization.init();
        subscription.init();
        app.customCheckbox();
        help_tip.initInapp();
        $('#route').next().css("margin-right", "-19px");
        this.generateHeader();
        $('.feedback').feedback();
        this.bindEnterEvents();
        
        //############## getting common user defaults ##########################//
        
        /*$.post("/api/defaults/get.json",{
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
            else{
                client.defaults = response;

                if (urlparser.getParameter("id") == undefined){
                    for (var key in client.defaults){
                        switch (key) {
                            case "country":
                                if ($('#country').val().trim().length === 0){
                                    placeDetailsByPlaceId(client.defaults[key], service_country, $('#country'));
                                    client.geoloc.country = client.defaults[key];
                                }
                            break;
                            case "city":
                                if ($('#locality').val().trim().length === 0){
                                    placeDetailsByPlaceId(client.defaults[key], service_city, $('#locality'));
                                    client.geoloc.city = client.defaults[key];
                                    
                                    ac.getCityLocales(response[key]);
                                }
                            break;
                            case "lat":
                                if (client.geoloc.lat == undefined){
                                    client.geoloc.lat = client.defaults[key];
                                }
                            break;
                            case "lng":
                                if (client.geoloc.lng == undefined){
                                    client.geoloc.lng = client.defaults[key];
                                }
                            break;
                        }
                    }
                    
                    falseGeolocateByLatLng(client.geoloc.lat, client.geoloc.lng);
                }
            }
        });*/
        
        stock.setDefaults();
        initAutocomplete();
        
        $('#save_button').click(function(){
            if (client.newcard === 1)
                client.create();
            else client.save();
        });
        
        $('#freefrom_input').datepicker({ 
            dateFormat: "dd/mm/yy"
        });
        
        //##################### events for event creating form #####################//
        $('#event_start_input').datepicker({ dateFormat: "yy-mm-dd" });
        $('#event_end_input').datepicker({  dateFormat: "yy-mm-dd" });
        $('#event_start_input').datepicker('setDate', new Date());
        $('#event_end_input').datepicker('setDate', new Date());
        $('#event_end_time_select').val("01:00:00");
        //$('#event_start_time_select').change(function(){
            //$(this).
        //});
        //#########################################################################//
        
        $('.advopt_check').on('ifClicked', function(){client.onAdvoptChange();});
        
        //$.post("/api/client/getformoptions.json",{
        //},function (response){
            var response = global_data.client_getformoptions;
        
            if (response.error != undefined)
                utils.errorModal(response.error.description);
            else{
                this.form_options = response;
                
                for (var key in this.form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < this.form_options[key].length; i++){
                                $('#ascription_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                            }
                            
                            if (urlparser.getParameter("ascription") != undefined && this.newcard === 1){
                                if (urlparser.getParameter("ascription") == "sale"){
                                    $('#ascription_select').val(0);
                                }
                                else if (urlparser.getParameter("ascription") == "rent"){
                                    $('#ascription_select').val(1);
                                }
                            }
                        break;
                        case "status":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#select_status').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                        break;
                        case "property_type":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#properties_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                        break;
                        /*case "view":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#view_select').append("<option value='"+i+"'>"+this.form_options[key][i]+"</option>");
                        break;
                        case "direction":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#directions_select').append("<option value='"+i+"'>"+this.form_options[key][i]+"</option>");
                        break;*/
                        case "dimension":
                            for (var i = 0; i < this.form_options[key].length; i++){
                                $('#homesize_dims_select').append("<option locale='"+this.form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i]["locale"])+"</option>");
                                $('#lotsize_dims_select').append("<option locale='"+this.form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i]["locale"])+"</option>");
                            }
                            
                            if ($('#homesize_dims_select').val() == -1){
                                $('#homesize_dims_select').val(5);
                            }
                        break;
                        case "currency":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#currency_select').append("<option value='"+i+"'>"+this.form_options[key][i]["symbol"]+"</option>");
                        break;
                    }
                }
                
                //############## getting common user defaults ##########################//
        
                //$.post("/api/defaults/getsearch.json", {}, function (response){
                    var response = global_data.defaults_getsearch;
                
                    if (response.error != undefined){
                        showErrorMessage(response.error.description);
                    }
                    else{
                        this.defaults.search = response;

                        if (urlparser.getParameter("id") == undefined){
                            $('#currency_select').val(response["currency"]);
                            $('#object_size_dims_select').val(response["object_dimensions"]);
                            $('#my_last_properties_span').show();
                            $('#no_name_span').hide();

                            for (var key in response){
                                if (response[key] != null){
                                    switch (key) {
                                        case "country":
                                            if ($('#country').val().trim().length === 0){
                                                placeDetailsByPlaceId(response[key], service_country, $('#country'));
                                                this.geoloc.country = response[key];
                                            }
                                        break;
                                        case "city":
                                            if ($('#locality').val().trim().length === 0){
                                                placeDetailsByPlaceId(response[key], service_city, $('#locality'));
                                                this.geoloc.city = response[key];
                                                ac.getCityLocales(response[key]);
                                            }
                                        break;
                                        case "lat":
                                            if (this.geoloc.lat == undefined){
                                                this.geoloc.lat = response[key];
                                            }
                                        break;
                                        case "lng":
                                            if (this.geoloc.lng == undefined){
                                                this.geoloc.lng = response[key];
                                            }
                                        break;
                                        case "currency":
                                            $('#currency_select').val(response[key]);
                                        break;
                                        case "object_dimensions":
                                            $('#homesize_dims_select').val(response[key]);
                                        break;
                                    }
                                }
                            }

                            falseGeolocateByLatLng(this.geoloc.lat, this.geoloc.lng);
                        }
                    }
                //});
                
                //localization.toLocale();
                
                if (urlparser.getParameter("id") != undefined){ // если объект недвижимости задан в адресе 
                    //this.viewmode();    
                    this.newcard = 0;
                    this.get();
                    
                    if ((this.search = urlparser.getParameter("search")) != undefined){
                        var controller = "getshort";
                    
                        if (this.search == "default"){
                            controller = "getshortempty";
                            
                            $('#back_button').attr("href", "query?response=list");
                            $('#to_search_button').attr("href", "query?response=list");
                        }
                        else{
                            $('#back_button').attr("href", "query?id="+this.search+"&response=list");
                            $('#to_search_button').attr("href", "query?id="+this.search+"&response=list");
                        }
                        
                        $.post("/api/search/"+controller+".json",{
                            search_id: this.search
                        },function (response){
                            //console.log(response.clients);
                            if (response.clients != undefined && response.clients.length > 1){ // здесь нужно разбираться, иногда ошибка
                                for (var i = 0; i < response.clients.length; i++){
                                    if (response.clients[i].id == urlparser.getParameter("id") && i < response.clients.length-1){
                                        $('#next_button').attr("href", "client?id="+response.clients[i+1].id+"&search="+client.search);
                                    }
                                    else if (response.clients[i].id == urlparser.getParameter("id") && i === response.clients.length-1){
                                        //$('#next_button').attr("href", "client?id="+response.clients[0].id+"&search="+this.search);
                                        $('#next_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("last_loop_property"));
                                            return false;
                                        });
                                    }
                                    
                                    if (response.clients[i].id == urlparser.getParameter("id") && i > 0){
                                        $('#previous_button').attr("href", "client?id="+response.clients[i-1].id+"&search="+client.search);
                                    }
                                    else if (response.clients[i].id == urlparser.getParameter("id") && i === 0){
                                        //$('#previous_button').attr("href", "client?id="+response.clients[response.clients.length-1].id+"&search="+this.search);
                                        $('#previous_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("first_loop_property"));
                                            return false;
                                        });
                                    }
                                }
                            }    
                            else{
                                $('#next_button').hide();
                                $('#previous_button').hide();
                            }
                            //$('#select_agent').val(property.data["agent_id"]);
                        });
                    }
                    else if (urlparser.getParameter("property") != undefined){
                        $('#back_button').attr("href", "property?id="+urlparser.getParameter("property")+"&action=comparison");
                        $('#comparison_button').attr("disabled", true);
                        $('#comparison_events_a').css("opacity", ".3");
                        this.property_from = urlparser.getParameter("property");
                        
                        $.post("/api/propertycomplist/getproperties.json", {
                            property: this.property_from
                        },function (response){
                            if (response.data.length > 1){ //  здесь нужно разобраться, код иногда косячит
                                var properties = [];
                                
                                for (var z = 0; z < response.data.length; z++){
                                    if (utils.isJSON(response.data[z])){
                                        properties.push(response.data[z]);
                                    }
                                }
                                
                                for (var i = 0; i < properties.length; i++){
                                    if (properties[i].id == urlparser.getParameter("id") && i < properties.length-1){ // пока не конец списка
                                        $('#next_button').attr("href", "client?id="+properties[i+1].id+"&property="+client.property_from);
                                    }
                                    else if (properties[i].id == urlparser.getParameter("id") && i === properties.length-1){ // елси конец списка
                                        //$('#next_button').attr("href", "client?id="+properties[0].id+"&property="+this.property_from);
                                        $('#next_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("last_loop_property"));
                                            return false;
                                        });
                                    }
                                    
                                    if (properties[i].id == urlparser.getParameter("id") && i > 0){ // если не начало списка
                                        $('#previous_button').attr("href", "client?id="+properties[i-1].id+"&property="+client.property_from);
                                    }
                                    else if (properties[i].id == urlparser.getParameter("id") && i === 0){ // если начало списка
                                        //$('#previous_button').attr("href", "client?id="+properties[properties.length-1].id+"&property="+this.property_from);
                                        $('#previous_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("first_loop_property"));
                                            return false;
                                        });
                                    }
                                }
                            }
                            else{
                                $('#next_button').hide();
                                $('#previous_button').hide();
                            }
                            //$('#select_agent').val(property.data["agent_id"]);
                        });
                    }
                    else if (urlparser.getParameter("property_events") != undefined){
                        $('#back_button').attr("href", "property?id="+urlparser.getParameter("property_events")+"&action=comparison_events");
                        $('#comparison_button').attr("disabled", true);
                        $('#comparison_events_a').css("opacity", ".3");
                        this.property_events_from = urlparser.getParameter("property_events");
                        
                        $.post("/api/clientcomp/geteventsforproperty.json", {
                            property: this.property_events_from
                        },function (response){
                            if (response.length > 1){ //  здесь нужно разобраться, код иногда косячит
                                var clients = [];
                                
                                for (var z = 0; z < response.length; z++){
                                    if (utils.isJSON(response[z]) && response[z].id != null){
                                        clients.push(response[z]);
                                    }
                                }
                                
                                for (var i = 0; i < clients.length; i++){
                                    if (clients[i].id == urlparser.getParameter("id") && i < clients.length-1){ // пока не конец списка
                                        $('#next_button').attr("href", "client?id="+clients[i+1].id+"&property_events="+this.property_events_from);
                                    }
                                    else if (clients[i].id == urlparser.getParameter("id") && i === clients.length-1){ // елси конец списка
                                        //$('#next_button').attr("href", "client?id="+clients[0].id+"&property_events="+this.property_events_from);
                                        $('#next_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("last_loop_property"));
                                            return false;
                                        });
                                    }
                                    
                                    if (clients[i].id == urlparser.getParameter("id") && i > 0){ // если не начало списка
                                        $('#previous_button').attr("href", "client?id="+clients[i-1].id+"&property_events="+this.property_events_from);
                                    }
                                    else if (clients[i].id == urlparser.getParameter("id") && i === 0){ // если начало списка
                                        //$('#previous_button').attr("href", "client?id="+clients[clients.length-1].id+"&property_events="+this.property_events_from);
                                        $('#previous_button').attr("href", "#").click(function(){
                                            utils.warningModal(localization.getVariable("first_loop_property"));
                                            return false;
                                        });
                                    }
                                }
                            }
                            else{
                                $('#next_button').hide();
                                $('#previous_button').hide();
                            }
                            //$('#select_agent').val(property.data["agent_id"]);
                        });
                    }
                    else{
                        $('#back_button').hide();
                        $('#to_search_button').hide();
                        $('#next_button').hide();
                        $('#previous_button').hide();
                    }
                }
                else{ // елси объект недвижимости не задан в адресе                    
                    //app.sliders();
                    //app.customCheckbox();
                    $('#next_button').hide();
                    $('#previous_button').hide();
                    $('#back_button').click(function(){
                        window.history.back();
                    });
                }
            }
        //});
        
        if (urlparser.getParameter("id") == undefined){ // объект недвижимости не задан (созадние новой карточки)
            //$.post("/api/agency/getagentslist.json",{
            //},function (response){
                client.agent_list = global_data.agency_getagentslist;
                
                for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                    $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>")
                }
                
                //$('#select_agent').val(property.data["agent_id"]);
            //});
            
            this.newmode();
        }
        else if (urlparser.getParameter("mode") == "collected"){ // если карточка была создарана коллектором
            $('#num_input').val("");
            this.editmode();
            this.mode = 3;
            this.generateHeader();
        }
        
        var a = new Date();
        
        for (var i = 0; i < 100; i++)
            $('#age_from_select').append("<option value="+(a.getFullYear()-i)+">"+(a.getFullYear()-i)+"</option>");
        
        $('#properties_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
            
            if ($(select).val() != null && $(select).val().length === 1){
                client.multiselect_last_option = $(select).val();
            }
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            var select = this;
            
            if ($(select).val() === null)
                $(select).val(client.multiselect_last_option);
            
            //client.reduceMultiSelect("properties_select", 4);
            client.multiSelectToInput('properties_select', 'properties_input');
            client.onMultiInputChange("properties_select", 'property_types');
        });
        
        /*$.post("/api/agency/getprojectslist.json",{
        },function (response){
            $('#select_project').html('<option value="-1"></option>');
            
            for (var i = 0; i < response.length; i++)
                $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>");
        });*/
        
        this.initOwlButtons();
    };
    
    this.generateHeader = function(){
        var client = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : null;
        var property = urlparser.getParameter("property") != undefined ? urlparser.getParameter("property") : null;
        var property_events = urlparser.getParameter("property_events") != undefined ? urlparser.getParameter("property_events") : null;
        var search = urlparser.getParameter("search") != undefined ? urlparser.getParameter("search") : null;
        var header = "";
        
        if (client == null){
            header = '<span locale="new_client_label">'+localization.getVariable("new_client_label")+'</span>';
        }
        else{
            header = '<span locale="client_label">'+localization.getVariable("client_label")+'</span> '+client+' ';
            
            if (property != null){
                header += '<span locale="from_property_label">'+localization.getVariable("from_property_label")+'</span> '+property;
            }
            
            if (property_events != null){
                header += '<span locale="from_property_events_label">'+localization.getVariable("from_property_events_label")+'</span> '+property_events;
            }
            
            if (search != null && search != "default"){
                header += '<span locale="from_search_label">'+localization.getVariable("from_search_label")+'</span> '+search;                
            }
        }
        
        $('#main_header').html(header).hover(function(){
            $('#main_header, #main_header>span').attr("title", $(this).text());
        });
    };
    
    this.get = function(){
        $.post("/api/client/get.json",{
            id: urlparser.getParameter("id")
        },function (response){
            if (response.error != undefined){
                utils.errorModal(response.error.description);
            }
            
            client.data = response;

            if (urlparser.getParameter("action") === "comparison"){
                client.comparison();
            }
            else if (urlparser.getParameter("action") === "comparison_events"){
                propcomp.showEventsModal();
            }
            
            $.post("/api/clientcomplist/getlastcount.json",{
                client: client.data.id
            },function (response){
                if (response != null){
                    $('#brokered_label').text("("+response+")");
                }
            });

            $('#doc_upload_input').fileupload({
                options:{
                    maxFileSize: 1000000
                },
                formData: {
                    client: client.data.id,
                    action: "client_doc"
                },
                add: function(a,b){
                    $('#new_file_name_input').val(client.doc_new_filename_prefix+b.originalFiles[0].name);
                    
                    for (var i = 0; i < b.originalFiles.length; i++){
                        if (b.originalFiles[i].size > 1000000){
                            $('#upload_limit_modal').modal("show");
                        }
                        else{
                            b.submit();
                        }
                    }  
                },
                start: function(){
                    $('#image_loader_div').show();
                },
                done: function (e, data) {
                    client.uploaded_image_id = null;
                    client.uploaded_doc_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    client.onPhotoOrDocChange("doc_upload",  $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });
            
            $('#printing_card_header_div').html("<span>Client for "+(response["ascription"] == 2 ? "sale" : "rent")+", card "+response["id"]+"</span><span style='float:right;'>"+utils.convertTimestampForDatepicker(utils.getNow())+"</span>");
            
            for (var key in response){
                if (response[key] != null && response[key] != "")
                    switch (key) {
                        case "id":
                           $('#num_input').val(response[key]);
                           $('#comparison_events_modal #client_id_span').text(response[key]);
                        break;
                        case "last_propose":
                            if (response[key].error == undefined){
                                $('#last_propose_input').val(utils.convertTimestampForDatepicker(response[key].timestamp));
                                $('#last_propose_from_button').text(response[key].from);
                                //$('#agreement_input').val(response[key].agreement);
                            }
                        break;
                        case "free_number":
                            $('#free_number_input').val(response[key] != 0 ? response[key] : "");
                        break;
                        case "country":
                           placeDetailsByPlaceId(response[key], service_country, $('#country'));
                           client.geoloc.country = response[key];
                        break;
                        /*case "region":
                           placeDetailsByPlaceId(response[key], service_region, $('#administrative_area_level_1'));
                           client.geoloc.region = response[key];
                        break;*/
                        case "city":
                           placeDetailsByPlaceId(response[key], service_city, $('#locality'));
                           client.geoloc.city = response[key];
                           
                           ac.getCityLocales(response[key]);
                        break;
                        case "neighborhood":
                           placeDetailsByPlaceId(response[key], service_neighborhood, $('#neighborhood'));
                           client.geoloc.neighborhood = response[key];
                           ac_synonim.selected.neighborhood = 1;
                        break;
                        case "street":
                            $('#geo_mode_select').val(1);
                            client.setGeoMode(1);
                            var obj = JSON.parse(response[key]);
                            
                            for (var i = 0; i < obj.length; i++){
                                streetDetailsByPlaceId(obj[i], service_route);
                            }
                            
                            client.geoloc.street = obj;
                        break;
                        case "lat":
                           client.geoloc.lat = response[key];
                           falseGeolocateByLatLng(response["lat"], response["lng"]);
                        break;
                        case "lng":
                           client.geoloc.lng = response[key];
                        break;
                        case "contour":
                            $('#geo_mode_select').val(2)
                            client.setGeoMode(2);
                            $('#contour_select').val(response[key]);
                        break;
                        case "ascription":
                            $('#ascription_select').val(response[key]);
                            
                            if (response[key] == 0){
                                $('#comparison_timestamp_offset').val("2_months");
                            }
                            else if (response[key] == 1){
                                $('#comparison_timestamp_offset').val("month");
                            }
                        break;
                        case "status":
                            $('#select_status').val(response[key]);
                        break;
                        case "last_updated":
                            $('#lastupd_input').val(utils.convertTimestampForDatepicker(response[key]));
                        break;
                        case "elevator_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "air_cond_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "parking_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "front_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "no_ground_floor_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "no_last_floor_flag":
                            if (response[key] == 1)
                                $('input.advopt_check[name='+key+']').iCheck('check');
                        break;
                        case "furniture_flag":
                            $('#furniture_select').val(response[key]);
                        break;
                        case "free_from":
                            if (response[key] != 0){
                                $('#freefrom_input').val(utils.convertTimestampForDatepicker(response[key]));
                                $('#freefrom_input').datepicker({ 
                                    dateFormat: "dd/mm/yy"
                                });
                            }
                        break;
                        case "remarks_text":
                            $('#remarks_area').val(response[key]);
                        break;
                        case "email":
                            $('#contact5_input').val(response[key]);
                        break;
                        case "name":
                            $('#name_input').val(response[key]);
                        break;
                        case "agent_id":
                            //$.post("/api/agency/getagentslist.json",{
                            //},function (response){
                                client.agent_list = global_data.agency_getagentslist;
                                
                                for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                                    $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>")
                                }
                                
                                $('#select_agent').val(client.data["agent_id"]);
                            //});
                        break;
                        case "property_types":
                            $('#properties_select').val(JSON.parse(response[key]));
                            //client.multiSelectToInput("properties_select", "properties_input");
                        break;
                        case "currency_id":
                            $('#currency_select').val(response[key]);

                            //$('#price_input_slider').attr("data-slider-value", "["+response["price_from"]+","+response["iPriceTo"]+"]");

                            /*$.post("/api/search/getpricerange.json",{
                                iCurrencyId: response[key]
                            },function (response){

                                $('#price_input_slider').attr("data-slider-value", "["+search.response["iPriceFrom"]+","+search.response["iPriceTo"]+"]");
                                app.sliders();
                            });*/
                            //$('#currency_select').val(JSON.parse(response[key]));
                        break;
                        case "price_from":
                            $('#price_from_input').val(utils.numberWithCommas(response[key]));
                            //$('#price_input').attr("sum", response[key]);
                        break;
                        case "price_to":
                            $('#price_to_input').val(utils.numberWithCommas(response[key]));
                            //$('#price_input').attr("sum", response[key]);
                        break;
                        case "home_size_dims":
                            if (response["home_size_dims"] != null){
                                $('#object_type_select').val(1);
                                $('#homesize_dims_select').val(response["home_size_dims"]);
                                $('#homesize_from_input').val(response["home_size_from"]);
                                $('#homesize_to_input').val(response["home_size_to"] != 0 ? response["home_size_to"] : "");
                            }
                        break;
                        case "lot_size_dims":
                            if (response["lot_size_dims"] != null){
                                $('#object_type_select').val(2);
                                $('#homesize_dims_select').val(response["lot_size_dims"]);
                                $('#homesize_from_input').val(response["lot_size_from"]);
                                $('#homesize_to_input').val(response["lot_size_to"] != 0 ? response["lot_size_to"] : "");
                            }
                        break;
                        case "age_from":
                            $('#age_from_select').val(response[key]);
                        break;
                        case "floor_from": 
                            $('#floors_from_input').val(response[key]);  
                        break;
                        case "floor_to":
                            $('#floors_to_input').val(response[key] != 0 ? response[key] : ""); 
                            //$('#floors_input_slider').attr("data-slider-value", "["+response["iFloorFrom"]+","+response["iFloorTo"]+"]");
                        break;
                        case "rooms_from":
                            $('#rooms_from_count_input').val(response[key] != 0 ? response[key] : "");
                            //$('#floors_input_slider').attr("data-slider-value", "["+response["iFloorFrom"]+","+response["iFloorTo"]+"]");
                        break;
                        case "rooms_to":
                            $('#rooms_to_count_input').val(response[key] != 0 ? response[key] : "");
                            //$('#floors_input_slider').attr("data-slider-value", "["+response["iFloorFrom"]+","+response["iFloorTo"]+"]");
                        break;
                        case "rooms_type":
                            $('#rooms_type_select').val(response[key]);
                        break;
                        case "project_id":
                            $.post("/api/agency/getprojectslist.json",{
                            },function (response){
                                $('#select_project').html('<option value="-1"></option>');
                                
                                for (var i = 0; i < response.length; i++)
                                    $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>")

                                $('#select_project').val(client.data["project_id"]);
                            });
                        break;
                        case "docs":
                            if (response[key].error == undefined){
                                docviewer = new DocViewer(response[key]);
                                uslider.initDocs();
                                client.just_created = 0;
                                docviewer.lockUploadButton();
                            }
                            else{
                                $('#docs_counter_span').html(0);
                            }
                        break;
                        case "history":
                            hist = new History(response[key], 2);
                            //hist.fillShortTable();
                            //imageviewer.getFirstThumb();
                        break;
                        case "contact1":
                            client.changeContactType(1, response[key]);
                            $('#contact1_input').val(response["contact1"]);
                            
                            if ($('#contact1_input').val().trim().length > 0)
                                utils.unlockContactRemark(1);
                        break;
                        case "contact1_remark":
                            $('#contact1_remark_input').val(response[key]);
                        break;
                        case "contact2":
                            client.changeContactType(2, response[key]);
                            $('#contact2_input').val(response["contact2"]);
                            
                            if ($('#contact2_input').val().trim().length > 0)
                                utils.unlockContactRemark(2);
                        break; 
                        case "contact2_remark":
                            $('#contact2_remark_input').val(response[key]);
                        break;
                        case "contact3":
                            client.changeContactType(3, response[key]);
                            $('#contact3_input').val(response["contact3"]);
                            
                            if ($('#contact3_input').val().trim().length > 0)
                                utils.unlockContactRemark(3);
                        break; 
                        case "contact3_remark":
                            $('#contact3_remark_input').val(response[key]);
                        break;
                        case "contact4":
                            client.changeContactType(4, response[key]);
                            $('#contact4_input').val(response["contact4"]);
                            
                            if ($('#contact4_input').val().trim().length > 0)
                                utils.unlockContactRemark(4);
                        break; 
                        case "contact4_remark":
                            $('#contact4_remark_input').val(response[key]);
                        break;
                        case "details":
                            $('#details_area').val(response[key]);
                        break;
                        case "im_editor":
                            if (response[key] == true){
                                client.edit();
                            }
                        break;
                    }
            }
            
            if (urlparser.getParameter("mode") == "collected" && urlparser.getParameter("check") == undefined){
                client.check();
            }
            else{
                client.checkErrors();
            }
            
            //localization.toLocale();
        });
    };
    
    this.checkErrors = function(){ // проверяет карточку на ошибки (отсуствие обязательных данных)
        if (
                (this.data.agent_id == null ||
                this.data.property_types == null ||
                this.data.price_from == null ||
                this.data.price_to == null ||
                this.data.currency_id == null ||
                this.data.ascription == null ||
                this.data.contact1 == null ||
                this.data.status == null ||
                this.data.country == null ||
                this.data.city == null) &&
                this.data.status != 6
        ){
            utils.errorModal(localization.getVariable("errors_on_this_card_fix_them"));
            //utils.errorModal("There're errors on this card. Please fix them possibly.");
            
            if (this.data.agent_id == null){
                //$.post("/api/agency/getagentslist.json",{},function (response){
                    client.agent_list = global_data.agency_getagentslist;
                    $('#select_agent').append("<option></option>");
                    
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>")
                    }
                //});
            }
        }
    };
    
    this.edit = function(){
        $.post("/api/client/tryedit.json",{
            id: this.data.id
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{ 
                client.editmode();
            }
        });
    };
    
    this.save = function(){
        var collected = {};
        
        if (this.mode === 3){
            $('#num_input').val(this.data.id);
            this.changes.temporary = 0;
            collected.temporary = 0;
        }
        
        if (Object.keys(this.changes).length == 0){
            client.viewmode();
            client.unlock();
        }
        else{
            try{
                for (var i = 0; i < this.neccesary.length; i++)
                    if ($('#'+this.neccesary[i]).val().trim().length === 0){
                        utils.hlEmpty(this);
                        throw "Some of neccesary fields (marked by *) are empry!";
                    }
                
                if ($('#neighborhood').val().trim().length > 0 && ac_synonim.selected.neighborhood === 0){
                    $('#neighborhood_not_selected_error').show();
                    $('#neighborhood').focus();
                    return 0;
                }
                
                if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                    $('#street_not_selected_error').show();
                    $('#route_input input.ui-autocomplete-input').focus();
                    return 0;
                }

                $('input').css("background","");
                //$('#street_buttons_block').hide();

                collected.country = this.geoloc.country;
                //collected.region = this.geoloc.region;
                collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : ac_synonim.current_selected.neighborhood) : null;
                collected.city = $('#locality').val().trim().length > 0 ? this.geoloc.city : null;
                //collected.street = this.geoloc.street;
                collected.lat = this.geoloc.lat;
                collected.lng = this.geoloc.lng;
                
                if (this.geo_mode === 1){
                    collected.street = this.geoloc.street != null ? this.geoloc.street : ac_synonim.current_selected.route;
                    collected.contour = null;
                }
                else if (this.geo_mode === 2){
                    collected.contour = $('#contour_select').val() != 0 ? $('#contour_select').val() : null;
                    collected.street = null;
                }
                
                collected.ascription = $('#ascription_select').val();
                collected.status = $('#select_status').val();
                collected.elevator_flag = $('#elevator_check:checked').length;
                collected.air_cond_flag = $('#conditioner_check:checked').length;                    
                collected.parking_flag = $('#parking_check:checked').length;                    
                collected.furniture_flag = $('#furniture_select').val();   
                collected.front_flag = $('#front_check:checked').length; 
                collected.no_last_floor_flag = $('#nolastfloor_check:checked').length;    
                collected.no_ground_floor_flag = $('#nogroundfloor_check:checked').length;    
                collected.remarks_text = $('#remarks_area').val().length > 0 ? $('#remarks_area').val() : null;                                 
                collected.email = $('#contact5_input').val().length > 0 ? $('#contact5_input').val() : null; 
                collected.name = $('#name_input').val().length > 0 ? $('#name_input').val() : null; 
                collected.property_types = $('#properties_select').val();                    
                collected.currency_id = $('#currency_select').val();
                
                if (Number(utils.numberRemoveCommas($('#price_from_input').val())) >= Number(utils.numberRemoveCommas($('#price_to_input').val()))){
                    utils.hlSingleField($("#price_from_input"));
                    utils.hlSingleField($("#price_to_input"));
                    throw "Start price can't be more or equal than finish price!";
                }
                else{
                    utils.unHlSingleField($("#price_from_input"));
                    utils.unHlSingleField($("#price_to_input"));
                }
                
                collected.price_from = utils.numberRemoveCommas($('#price_from_input').val().trim());
                collected.price_to = utils.numberRemoveCommas($('#price_to_input').val().trim());

                if ($('#object_type_select').val() == 1){
                    utils.checkFieldsBothFilled($('#homesize_from_input'), $('#homesize_to_input'), "Fill in home size finish count!", "Fill in home size start count!");
                    utils.checkFieldsFinishNoLessEqualStart($('#homesize_from_input'), $('#homesize_to_input'), "Start home size can't be more or equal than finish home size!");
                    
                    collected.home_size_dims = $('#homesize_from_input').val().trim().length === 0 || $('#homesize_to_input').val().trim().length === 0 || $('#homesize_dims_select').val() == -1 ? null : $('#homesize_dims_select').val();
                    collected.home_size_from = $('#homesize_from_input').val().trim().length === 0 ? null : $('#homesize_from_input').val(); 
                    collected.home_size_to = $('#homesize_to_input').val().trim().length === 0 ? null : $('#homesize_to_input').val(); 
                    collected.lot_size_from = null;
                    collected.lot_size_to = null;
                    collected.lot_size_dims = null;
                }
                else if ($('#object_type_select').val() == 2){
                    utils.checkFieldsBothFilled($('#homesize_from_input'), $('#homesize_to_input'), "Fill in home size finish count!", "Fill in home size start count!");
                    utils.checkFieldsFinishNoLessEqualStart($('#homesize_from_input'), $('#homesize_to_input'), "Start home size can't be more or equal than finish home size!");
                    
                    collected.home_size_dims = null;
                    collected.home_size_from = null; 
                    collected.home_size_to = null;
                    collected.lot_size_from = $('#homesize_from_input').val().trim().length === 0 ? null : $('#homesize_from_input').val(); 
                    collected.lot_size_to = $('#homesize_to_input').val().trim().length === 0 ? null : $('#homesize_to_input').val(); 
                    collected.lot_size_dims = $('#homesize_from_input').val().trim().length === 0 || $('#homesize_to_input').val().trim().length === 0 || $('#homesize_dims_select').val() == -1 ? null : $('#homesize_dims_select').val();
                }

                collected.free_from = $('#freefrom_input').val().length > 0 ? $('#freefrom_input').datepicker("getDate")/1000 : null;                    
                collected.age_from = $('#age_from_select').val() != -1 ? $('#age_from_select').val() : null;   
                
                utils.checkFieldsBothFilled($('#floors_from_input'), $('#floors_to_input'), "Fill in floors finish count!", "Fill in floors start count!");
                utils.checkFieldsFinishNoLessEqualStart($('#floors_from_input'), $('#floors_to_input'), "Floors count can't be more or equal than floor number!");
                
                collected.floor_from = $('#floors_from_input').val().length > 0 ? $('#floors_from_input').val() : null;                    
                collected.floor_to = $('#floors_to_input').val().length > 0 ? $('#floors_to_input').val() : null;                    
                
                utils.checkFieldsBothFilled($('#rooms_from_count_input'), $('#rooms_to_count_input'), "Fill in rooms finish count!", "Fill in rooms start count!");
                utils.checkFieldsFinishNoLessEqualStart($('#rooms_from_count_input'), $('#rooms_to_count_input'), "Start rooms count can't be more or equal than finish rooms count!");
                
                collected.rooms_type = ($('#rooms_to_count_input').val().trim().length !== 0 || $('#rooms_from_count_input').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_type_select').val() : null; 
                collected.rooms_from = $('#rooms_from_count_input').val() != 0 && $('#rooms_from_count_input').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_from_count_input').val() : null; 
                collected.rooms_to = $('#rooms_to_count_input').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_to_count_input').val() : null; 
                
                collected.project_id = $('#select_project').val() != -1 ? $('#select_project').val() : null;                   
                collected.contact1_remark = $('#contact1_remark_input').val().length > 0 ? $('#contact1_remark_input').val() : null;                    
                collected.contact1 = $('#contact1_input').val().length > 0 ? $('#contact1_input').val() : null;                    
                collected.contact2_remark = $('#contact2_remark_input').val().length > 0 ? $('#contact2_remark_input').val() : null;                    
                collected.contact2 = $('#contact2_input').val().length > 0 ? $('#contact2_input').val() : null;                    
                collected.contact3_remark = $('#contact3_remark_input').val().length > 0 ? $('#contact3_remark_input').val() : null;                    
                collected.contact3 = $('#contact3_input').val().length > 0 ? $('#contact3_input').val() : null;                    
                collected.contact4_remark = $('#contact4_remark_input').val().length > 0 ? $('#contact4_remark_input').val() : null;                   
                collected.contact4 = $('#contact4_input').val().length > 0 ? $('#contact4_input').val() : null;
                collected.details = $('#details_area').val().length > 0 ? $('#details_area').val() : null;
                collected.free_number = $('#free_number_input').val().length > 0 ? $('#free_number_input').val() : null;
                
                utils.htmlSpinner("save_button");
                
                $.post("/api/client/set.json",{
                    id: this.data.id,
                    data: JSON.stringify(collected)
                },function (response){
                    utils.removeHtmlSpinner("save_button");
                    
                    if (response.error != undefined){
                        utils.errorModal(response.error.description);
                    }
                    else{ 
                        client.viewmode();
                        showSuccess(localization.getVariable("client_saved"));
                        hist.update(client.data.id, 2);
                    }
                });

                $.post("/api/client/sethistory.json",{
                    id: this.data.id,
                    data: JSON.stringify(this.changes)
                },function (response){
                    if (response.error != undefined)
                        utils.errorModal(response.error.description);
                    else client.changes = {};
                });
            }
            catch(error){
                utils.errorModal(error);
            }
        }
    };
    
    this.saveOnEnter = function(){
        if (this.newcard === 1)
            this.create();
        else this.save();
    };
    
    this.hlEmpty = function(){
        for (var i = 0; i < this.neccesary.length; i++)
            if ($('#'+this.neccesary[i]).val().trim().length === 0)
                $('#'+this.neccesary[i]).css({background: "#f2dede"});
            else $('#'+this.neccesary[i]).css("background","");
    };
    
    this.create = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++)
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    this.hlEmpty();
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            
            if (this.data == null && this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            $('input').css("background","");
            //$('#street_buttons_block').hide();
            
            collected.country = this.geoloc.country;
            //collected.region = this.geoloc.region;
            collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood) : null;
            collected.city = $('#locality').val().trim().length > 0 ? this.geoloc.city : null;
            //collected.street = this.geoloc.street;
            collected.lat = this.geoloc.lat;
            collected.lng = this.geoloc.lng;
            
            if (this.geo_mode === 1){
                collected.street = this.geoloc.street != null ? this.geoloc.street : synonim.current_selected.route;
                collected.contour = null;
            }
            else if (this.geo_mode === 2){
                collected.contour = $('#contour_select').val() != 0 ? $('#contour_select').val() : null;
                collected.street = null;
            }
            
            collected.ascription = $('#ascription_select').val();
            collected.status = $('#select_status').val();    
            collected.elevator_flag = $('#elevator_check:checked').length;
            collected.air_cond_flag = $('#conditioner_check:checked').length;                    
            collected.parking_flag = $('#parking_check:checked').length;                    
            collected.furniture_flag = $('#furniture_select').val();   
            collected.front_flag = $('#front_check:checked').length; 
            collected.no_last_floor_flag = $('#nolastfloor_check:checked').length;    
            collected.no_ground_floor_flag = $('#nogroundfloor_check:checked').length;    
            collected.remarks_text = $('#remarks_area').val().length > 0 ? $('#remarks_area').val() : null;                                    
            collected.email = $('#contact5_input').val().length > 0 ? $('#contact5_input').val() : null;
            collected.name = $('#name_input').val().length > 0 ? $('#name_input').val() : null;
            collected.property_types = $('#properties_select').val();                    
            collected.currency_id = $('#currency_select').val();      
            
            if (Number(utils.numberRemoveCommas($('#price_from_input').val())) >= Number(utils.numberRemoveCommas($('#price_to_input').val()))){
                utils.hlSingleField($("#price_from_input"));
                utils.hlSingleField($("#price_to_input"));
                throw "Start price can't be more or equal than finish price!";
            }
            else{
                utils.unHlSingleField($("#price_from_input"));
                utils.unHlSingleField($("#price_to_input"));
            }
            
            collected.price_from = utils.numberRemoveCommas($('#price_from_input').val().trim());
            collected.price_to = utils.numberRemoveCommas($('#price_to_input').val().trim());                
            
            if ($('#object_type_select').val() == 1){
                utils.checkFieldsBothFilled($('#homesize_from_input'), $('#homesize_to_input'), "Fill in home size finish count!", "Fill in home size start count!");
                utils.checkFieldsFinishNoLessEqualStart($('#homesize_from_input'), $('#homesize_to_input'), "Start home size can't be more or equal than finish home size!");
                
                collected.home_size_dims = $('#homesize_from_input').val().trim().length === 0 || $('#homesize_to_input').val().trim().length === 0 || $('#homesize_dims_select').val() == -1 ? null : $('#homesize_dims_select').val();
                collected.home_size_from = $('#homesize_from_input').val().length > 0 ? $('#homesize_from_input').val() : null; 
                collected.home_size_to = $('#homesize_to_input').val().length > 0 ? $('#homesize_to_input').val() : null; 
                collected.lot_size_from = null;
                collected.lot_size_to = null;
                collected.lot_size_dims = null;
            }
            else if ($('#object_type_select').val() == 2){
                utils.checkFieldsBothFilled($('#homesize_from_input'), $('#homesize_to_input'), "Fill in home size finish count!", "Fill in home size start count!");
                utils.checkFieldsFinishNoLessEqualStart($('#homesize_from_input'), $('#homesize_to_input'), "Start home size can't be more or equal than finish home size!");
                
                collected.home_size_dims = null;
                collected.home_size_from = null; 
                collected.home_size_to = null;
                collected.lot_size_from = $('#homesize_from_input').val().length > 0 ? $('#homesize_from_input').val() : null;
                collected.lot_size_to = $('#homesize_to_input').val().length > 0 ? $('#homesize_to_input').val() : null;
                collected.lot_size_dims = $('#homesize_from_input').val().trim().length === 0 || $('#homesize_to_input').val().trim().length === 0 ? null : $('#homesize_dims_select').val();
            }
            
            collected.free_from = $('#freefrom_input').val().length > 0 ? $('#freefrom_input').datepicker("getDate")/1000 : null;                    
            collected.age_from = $('#age_from_select').val() != -1 ? $('#age_from_select').val() : null;
            
            utils.checkFieldsBothFilled($('#floors_from_input'), $('#floors_to_input'), "Fill in floors finish count!", "Fill in floors start count!");
            utils.checkFieldsFinishNoLessEqualStart($('#floors_from_input'), $('#floors_to_input'), "Floors count can't be more or equal than floor number!");
            
            collected.floor_from = $('#floors_from_input').val().length > 0 ? $('#floors_from_input').val() : null;                    
            collected.floor_to = $('#floors_to_input').val().length > 0 ? $('#floors_to_input').val() : null;                    
            
            utils.checkFieldsBothFilled($('#rooms_from_count_input'), $('#rooms_to_count_input'), "Fill in rooms finish count!", "Fill in rooms start count!");
            utils.checkFieldsFinishNoLessEqualStart($('#rooms_from_count_input'), $('#rooms_to_count_input'), "Start rooms count can't be more or equal than finish rooms count!");
            
            collected.rooms_type = ($('#rooms_to_count_input').val().trim().length !== 0 || $('#rooms_from_count_input').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_type_select').val() : null; 
            collected.rooms_from = $('#rooms_from_count_input').val() != 0 && $('#rooms_from_count_input').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_from_count_input').val() : null; 
            collected.rooms_to = $('#rooms_to_count_input').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_to_count_input').val() : null; 
            
            collected.project_id = $('#select_project').val() != -1 ? $('#select_project').val() : null;
            collected.contact1_remark = $('#contact1_remark_input').val().length > 0 ? $('#contact1_remark_input').val() : null;                    
            collected.contact1 = $('#contact1_input').val().length > 0 ? $('#contact1_input').val() : null;                    
            collected.contact2_remark = $('#contact2_remark_input').val().length > 0 ? $('#contact2_remark_input').val() : null;                    
            collected.contact2 = $('#contact2_input').val().length > 0 ? $('#contact2_input').val() : null;                    
            collected.contact3_remark = $('#contact3_remark_input').val().length > 0 ? $('#contact3_remark_input').val() : null;                    
            collected.contact3 = $('#contact3_input').val().length > 0 ? $('#contact3_input').val() : null;                    
            collected.contact4_remark = $('#contact4_remark_input').val().length > 0 ? $('#contact4_remark_input').val() : null;                   
            collected.contact4 = $('#contact4_input').val().length > 0 ? $('#contact4_input').val() : null;
            collected.details = $('#details_area').val().length > 0 ? $('#details_area').val() : null;
            collected.free_number = $('#free_number_input').val().length > 0 ? $('#free_number_input').val() : null;
            
            $.post("/api/client/createnew.json",{
                id: this.temporary_id,
                data: JSON.stringify(collected)
            },function (response){
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    for (var i = 0; i < client.form_buttons_to_block.length; i++)
                        $('#'+client.form_buttons_to_block[i]).attr("disabled", false);
                    
                    $('#ascription_select').attr("disabled", true);
                    $('#select_status').attr("disabled", true);
                    $('#newcard_button').attr("disabled", false);
                    client.newcard = 0;
                    client.just_created = 1;
                    client.temporary_id = null;
                    client.viewmode();
                    showSuccess(localization.getVariable("client_successfully_created"));
                    urlparser.setParameter("id", response);
                    client.get();
                }
            });

            /*$.post("/api/property/sethistory.json",{
                id: this.data.id,
                data: JSON.stringify(this.changes)
            },function (response){
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else property.changes = {};
            });*/
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.changeContactType = function(contact, type){ // type: 0 - phone, 1 - sms, 2 - whatsapp
        $('#contact'+contact+'_input').attr("type", type);
        
        switch (Number(type)) {
            case 0:
               $('#contact_'+contact+' button').html('<i class="fa fa-phone"></i> Phone <span class="caret"></span>');
               $('#contact_'+contact+' ul').html('<li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 2); property.changeContactType('+contact+', 2);">WhatsApp</a></li><li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 1); property.changeContactType('+contact+', 1);">SMS</a></li>');
            break;
            case 1:
               $('#contact_'+contact+' button').html('<i class="fa fa-envelope-o"></i> SMS <span class="caret"></span>');
               $('#contact_'+contact+' ul').html('<li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 2); property.changeContactType('+contact+', 2);">WhatsApp</a></li><li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 0); property.changeContactType('+contact+', 0);">Phone</a></li>');
            break;
            case 2:
               $('#contact_'+contact+' button').html('<i class="fa fa-whatsapp"></i> WhatsApp <span class="caret"></span>');
               $('#contact_'+contact+' ul').html('<li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 0); property.changeContactType('+contact+', 0);">Phone</a></li><li><a href="javascript:void(0)" onclick="property.onContactTypeChange('+contact+', 1); property.changeContactType('+contact+', 1);">SMS</a></li>');
            break;
        }       
    };
    
    this.reduceMultiSelect = function(multiselect_id, maxlength){
        var element = $('#'+multiselect_id);
        var new_options = [];
        var options = element.val();

        if (options.length > maxlength)
          var new_options = options.slice(options.length-maxlength,options.length);

        if (new_options.length) 
            element.val(new_options);
    };
    
    this.multiSelectToInput = function(multiselect_id, input_id){
        var multiselect = $('#'+multiselect_id);
        var input = $('#'+input_id);
        var options = multiselect.val();
        var input_string = "";
        
        if (options === null)
            input_string = "";
        else for (var i = 0; i < options.length; i++)
            input_string += $('#'+multiselect_id+' option[value="'+options[i]+'"]').text()+(i != options.length-1 ? ", " : "");
        
        input.val(input_string);
    };
    
    this.onMultiInputChange = function(input_id, parameter){
        this.setJSONchange(parameter, $('#'+input_id).val());
    };
    
    this.onAdvoptChange = function(){
        var obj = [];
        $('input.advopt_check:checked').each(function(){
            obj.push($(this).val());
        });
        
        if (this.newcard !== 1 && this.changes.advopts == undefined){
            this.fixChangeTime();
            this.changes.advopts = {old: obj};
            //this.data[parameter] = value;
        }
        //else this.setChange("directions", null);
    };
    
    this.setJSONchange = function(parameter, value){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: JSON.parse(this.data[parameter]), new: value};
            //this.data[parameter] = value;
        }
    };
    
    this.onPriceChange = function(input, parameter){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: utils.numberRemoveCommas(this.data[parameter]), new: utils.numberRemoveCommas($(input).val().trim())};
        }
    };
    
    this.onPriceKeyUp = function(element){
        var price_value = utils.numberRemoveCommas($(element).val());
        $(element).val(utils.numberWithCommas(price_value));
    };
    
    this.onRoomsFromKeyUp = function(){
        var value = $('#rooms_from_count_input').val().trim();
        
        if (value.match(/^\d+(\.)?(5)?$/g) != null){
            $('#rooms_from_count_input').val(value);
        }
        else{
            $('#rooms_from_count_input').val(value.substr(0, value.length-1));
        }
    };
    
    this.onRoomsToKeyUp = function(){
        var value = $('#rooms_to_count_input').val().trim();
        
        if (value.match(/^\d+(\.)?(5)?$/g) != null){
            $('#rooms_to_count_input').val(value);
        }
        else{
            $('#rooms_to_count_input').val(value.substr(0, value.length-1));
        }
    };
    
    this.onSizeKeyUp = function(field_id){
        var size_value = utils.numberRemoveCommas($('#'+field_id).val().trim());
        $('#'+field_id).val(utils.numberWithCommas(size_value));
    };
    
    this.onInputChange = function(input, parameter){
        this.setChange(parameter, $(input).val().trim());
    };
    
    this.onRemarksChange = function(input, parameter){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: 1};
        }
    };
    
    this.setChange = function(parameter, value){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: this.data[parameter], new: value};
            //this.data[parameter] = value;
        }
    };
    
    this.saveContactRemark = function(input, parameter){
        $.post("/api/client/savecontactremark.json",{
            client_id: this.temporary_id != null ? this.temporary_id : this.data.id,
            parameter: parameter,
            value: $(input).val()
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
        });
    };
    
    this.onPhotoOrDocChange = function(parameter, value){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: value};
        }
    };
    
    this.onGeolocChange = function(input){
        if (this.newcard !== 1){
            var id = $(input).attr("id");
            var place_name = $(input).attr("place_name");
            
            this.fixChangeTime();
            this.changes[id] = {old: place_name};
        }
    };
    
    this.setGeolocOldChange = function(parameter, value){
        this.fixChangeTime();
        
        if (parameter === "route")
            parameter = "street";
        else if (parameter === "locality")
            parameter = "city";
        this.changes[parameter] = {old: value};
    };
    
    this.setGeolocNewChange = function(parameter, value){
        this.fixChangeTime();
        
        if (parameter === "route")
            parameter = "street";
        else if (parameter === "locality")
            parameter = "city";
        this.changes[parameter].new = value;
    };
    
    this.changeGeoMode = function(){
        this.geo_mode = Number($('#geo_mode_select').val());
        
        switch (this.geo_mode){ // 1 - streets, 2 - contour
            case 1:
                $('#geo_mode_select').val(1);
                $('#contour_select_wrapper').hide();
                $('#streets_select_wrapper').show();
                
                if (this.newcard !== 1){
                    this.fixChangeTime();
                    this.changes["search_mode"] = {old: 1};
                }
            break;
            case 2:
                $('#geo_mode_select').val(2);
                $('#contour_select_wrapper').show();
                $('#streets_select_wrapper').hide();
                //$('#street_buttons_block').hide();
                
                if (this.newcard !== 1){
                    this.fixChangeTime();
                    this.changes["search_mode"] = {old: 2};
                }
                
                $.post("/api/contour/list.json",{
                },function (response){
                    if (response.length > 0){
                        $('#contour_select > .old').remove();
                        
                        for (var i = 0; i < response.length; i++)
                            $('#contour_select').append('<option class="old" value="'+response[i].id+'">'+response[i].title+'</option>');
                        
                        $('#contour_select').val(client.data != null && client.data.contour != null ? client.data.contour : 0);
                    }
                });
            break;
        }
    };
    
    this.setGeoMode = function(mode){
        this.geo_mode = mode;
        
        switch (this.geo_mode){ // 1 - streets, 2 - contour
            case 1:
                $('#geo_mode_select').val(1);
                $('#contour_select_wrapper').hide();
                $('#streets_select_wrapper').show();
            break;
            case 2:
                $('#geo_mode_select').val(2);
                $('#contour_select_wrapper').show();
                $('#streets_select_wrapper').hide();
                //$('#street_buttons_block').hide();
                
                $.post("/api/contour/list.json",{
                },function (response){
                    if (response.length > 0){
                        $('#contour_select > .old').remove();
                        
                        for (var i = 0; i < response.length; i++)
                            $('#contour_select').append('<option class="old" value="'+response[i].id+'">'+response[i].title+'</option>');
                        
                        $('#contour_select').val(client.data != null && client.data.contour != null ? client.data.contour : 0);
                    }
                });
            break;
        }
    };
    
    this.changeObjectType = function(){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes["object_type"] = {old: this.object_type};
        }
           
        this.object_type = Number($('#object_type_select').val());
    };
    
    this.changeRoomsType = function(){
        if (this.newcard !== 1 && this.data.rooms_type != null){
            this.fixChangeTime();
            this.changes.rooms_type = {old: this.data.rooms_type};
        }
           
        this.rooms_type = Number($('#rooms_type_select').val());
    };
    
    this.onContactTypeChange = function(contact, new_type){
        this.fixChangeTime();
        this.changes["contact"+contact+"_type"] = {old: $('#contact'+contact+'_input').attr("type"), new: new_type};
    };
    
    this.removePhoto = function(){
        this.fixChangeTime();
        $.post("/api/property/removephoto.json",{
            id: $('#image_wrapper_0 img').attr("id")
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{ 
                property.initImageViewer();
            }
        });
    };
    
    this.removeDoc = function(){
        this.fixChangeTime();
        $.post("/api/client/removedoc.json",{
            id: $('#docviewer').attr("doc_id")
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{ 
                client.initDocViewer();
            }
        });
    };
    
    this.showMultiSelect = function(input_id, selector_id){
        this.focused_input_id = input_id;
        this.showed_multiselect_id = selector_id;
        $('#'+selector_id).show();
    };
    
    this.showStreetBlock = function(){
        $('#street_buttons_block').show();
        utils.lightField($('#route'));
        $('#route').focus();
    };
    
    this.propose = function(){
        this.fixChangeTime();
        $.post("/api/client/propose.json",{
            client_id: this.data.id,
            agreement_num: $('#agreement_number_input').val().trim()
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
            else{ 
                showSuccess('Client proposed, agreement saved to documents!');            
            
                $.post("/api/clientdoc/savecomparison.json",{
                    agreement_name: $('#agreement_number_input').val().trim(),
                    agreement_id: response,
                    items: JSON.stringify(client.properties_parsed),
                    client: client.data.id
                },function (response){
                    if (response.error != undefined)
                      showErrorMessage(response.error.description);
                    else client.initDocViewer();
                });
            }
        });
    };
    
    this.fixChangeTime = function(){
        this.last_change = utils.getNow();
    };
    
    this.checkChanges = function(){
        if (this.mode === 2 && (utils.getNow() - this.last_change > 600)){
            this.viewmode();
            this.unlock();
            clearInterval(this.changes_interval);
            utils.warningModal(localization.getVariable("warning_card_closed_after_600"));
        }
    };
    
    this.viewmode = function(){
        this.mode = 1;
        
        if (this.newcard == 0 ){
            $('#route_input').tagit("destroy");
        }
        
        $('#route_input').tagit({
            allowSpaces: true,
            beforeTagRemoved: function(event, ui) {
                client.removeStreet(ui.tag.attr("id"));
            },
            readOnly: true
        }).css("background", "rgba(85, 107, 141, 0.19)");
        
        $('#route_input input.ui-autocomplete-input').focus(function(){
            geolocate();
        });
        
        /*$('#route_input').tagit({
            beforeTagRemoved: function(event, ui) {
                client.removeStreet(ui.tag.attr("id"));
            },
            readOnly: true
        }).css("background", "rgba(85, 107, 141, 0.19)");
        
        $('#route_input input').focus(function(){
            geolocate(); 
            //client.showStreetBlock();
        }).keypress(function (evt) {
            evt.preventDefault();
        });*/
        
        for (var i = 0; i < this.form_elements.length; i++)
            $('#'+this.form_elements[i]).attr("disabled", true);
        
        for (var i = 0; i < this.form_elements_classes.length; i++){
            $('.'+this.form_elements_classes[i]).attr("disabled", true);
        }
        
        for (var i = 0; i < this.form_checkboxes.length; i++)
            $('#'+this.form_checkboxes[i]).iCheck('disable');       
        
        //app.customCheckbox();
        $('#save_button').hide();
        $('#edit_button').show();        
    };
    
    this.newmode = function(){
        $.post("/api/client/createtemporary.json",{
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                    $('#save_button').attr("disabled", true);
                    //$('#back_button').attr("disabled", true);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else client.temporary_id = response;
            
            $('#doc_upload_input').fileupload({
                options:{
                    maxFileSize: 1000000
                },
                formData: {
                    client: client.temporary_id,
                    action: "client_doc"
                },
                add: function(a,b){
                    $('#new_file_name_input').val(client.doc_new_filename_prefix+b.originalFiles[0].name);
                    
                    for (var i = 0; i < b.originalFiles.length; i++){
                        if (b.originalFiles[i].size > 1000000){
                            $('#upload_limit_modal').modal("show");
                        }
                        else{
                            b.submit();
                        }
                    }  
                },
                start: function(){
                    $('#image_loader_div').show();
                },
                done: function (e, data) {
                    client.uploaded_image_id = null;
                    client.uploaded_doc_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    client.onPhotoOrDocChange("doc_upload", $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });
            
            
        });
        
        for (var i = 0; i < this.form_buttons_to_block.length; i++)
            $('#'+this.form_buttons_to_block[i]).attr("disabled", true);
        
        $('#ascription_select').attr("disabled", false);
        $('#select_status').attr("disabled", false);
        this.editmode();
    };
    
    this.editmode = function(){
        this.mode = 2;
        
        //if (this.newcard == 0){ 
            $('#route_input').tagit("destroy");
        //}
        
        $('#route_input').tagit({
            allowSpaces: true,
            beforeTagRemoved: function(event, ui) {
                client.removeStreet(ui.tag.attr("id"));
            }
        }).css("background", "#fff");
        
        $('#route_input input.ui-autocomplete-input').attr({
            ac_types: "address",
            geotype: "route",
            onfocus: "geolocate();ac.search(this);synonim.search(this);",
            onkeyup: "ac.search(this);synonim.search(this);",
            locale_placeholder: "start_typing_here"
        });
        
        //localization.toLocale();
        $('#route_input input.ui-autocomplete-input').unbind("blur");
        
        /*$('#route_input').tagit({
            beforeTagRemoved: function(event, ui) {
                client.removeStreet(ui.tag.attr("id"));
            }
        }).css("background", "#fff");
        
        $('#route_input input').focus(function(){
            geolocate(); 
            //client.showStreetBlock();
        }).keypress(function (evt) {
            evt.preventDefault();
        });*/
        
        for (var i = 0; i < this.form_elements.length; i++)
            $('#'+this.form_elements[i]).attr("disabled", false);
        
        for (var i = 0; i < this.form_elements_classes.length; i++){
            $('.'+this.form_elements_classes[i]).attr("disabled", false);
        }
        
        for (var i = 0; i < this.form_checkboxes.length; i++)
            $('#'+this.form_checkboxes[i]).iCheck('enable'); 
        
        //app.customCheckbox();
        $('#save_button').show();
        $('#edit_button').hide();
        
        this.last_change = utils.getNow();
        
        if (this.newcard !== 1)
            this.changes_interval = setInterval("client.checkChanges()", 1000);
    };
    
    this.unlock = function(){
        $.post("/api/client/unlock.json",{
            id: this.data.id
        },function (response){
            if (response.error != undefined)
                utils.errorModal(response.error.description);
        });
    };
    
    this.justtest = function(){
        //console.log("testing");
    };
    
    this.showCopyModal = function(ascription){
        if (Object.keys(this.changes).length !== 0){
            $('#save_modal .modal-body').text("There're unsaved changes. Copy card anyway?");
            $('#save_modal').modal('show');
            $('#yes_button').click({ascription:ascription},function(){
                $('#save_modal').modal('hide');
                property.copy(ascription);
            });
        }else this.copy(ascription);
        
    };
    
    this.copy = function(ascription){
        $.post("/api/property/copy.json",{
            iPropertyId: this.data.id,
            ascription: ascription
        },function (response){
            if (response.error != undefined)
                utils.errorModal(response.error.description);
            else{ 
                utils.successModal("Card copied. You can access it by button below.");
                $('#open_copied_card_a').attr("href", "property?id="+response);
            }
        });
    };
    
    this.comparison = function(){
        $('.modal-header #client_number_span, #client_number_for_print_span').html(this.data.id);
        $('#comparison_modal').modal("show");
        $('#comparison_table, .comparison_limits').hide();
        $('.comparison_loader').show();
        this.properties_parsed = [];
        this.properties = null;
        
        $.post("/api/property/getlistbyclient.json",{
            client_id: this.data.id//,
            //mode: null,
            //from: $('#comparison_timestamp_offset').val()
        },function (response){
            client.properties = response.data;
            $('#comparison_table').show();
            $('.comparison_limits').hide();
            $('.comparison_loader').hide();
            $('#comparison_table td').parent().remove();
            $('#comparison_limits_count_span').text(client.properties.length);
            
            //####################### get and set last comparison date #######################//
            
            if (response.type == "last"){
                $.post("/api/clientcomplist/getlastdate.json",{
                    client: client.data.id
                },function (response){
                    if (response != null){
                        clientcomp.last_date = response;
                        $('.comparison_brokering_date').show();
                        $('#comparison_last_brokering_date_span').text(utils.convertTimestampForDatepicker(response));
                        $('#comparison_modal_header_first_span')
                                .attr("locale", "last_comparison_properties_list")
                                .text(localization.getVariable("last_comparison_properties_list"));
                        $('#new_brokering_hint_span').show();
                    }

                    //clientcomp.propose();
                });
            }
            
            if (client.properties.length > 0){
                $('#mass_hide_comparison_button, #print_comparison_a, #comparison_delete_checked_button').attr("disabled", false);
                
                if (client.properties.length < response.total){
                    $('.comparison_limits').show().css("display", "inline");
                    $('#comparison_limits_total_span').text(response.total);
                }
                
                $('#property_results_area').show();
                clientcomp.generateList();
                
                //####################### get and set last comparison date #######################//
                
                if (response.type == "last"){
                    $.post("/api/clientcomplist/getlastdate.json",{
                        client: client.data.id
                    },function (response){
                        if (response != null){
                            $('.comparison_date_td').each(function(){
                                if ($(this).text() == 0){
                                    $(this).text(utils.convertTimestampForDatepicker(response));
                                }
                            });
                        }

                        //clientcomp.propose();
                    });
                }
                else if (response.type == "new"){
                    $('.comparison_date_td').each(function(){
                        if ($(this).text() == 0){
                            $(this).text(utils.convertTimestampForDatepicker(utils.getNow()));
                        }
                    });
                }
                
                //####################### search by contour ######################################//
                
                /*if (client.geo_mode == 2 && $('#contour_select').val() != 0){
                    $.post("/api/contour/getforlist.json",{
                        id: $('#contour_select').val()
                    },function (result){
                        if (result.error != undefined)
                            showErrorMessage(result.error.description);
                        else{
                            //$('#contour_id').html(result.title);
                            var coords = JSON.parse(result.data);
                            var polygon_tmp = new google.maps.Polygon({
                                paths: coords,
                                strokeWeight: 0,
                                fillOpacity: 0.45,
                                editable: false
                            });
                            var properties_tmp = [];
                            
                            for (var i = 0; i < client.properties.length; i++){
                                var latLng = new google.maps.LatLng(client.properties[i].lat, client.properties[i].lng);
                                
                                if (google.maps.geometry.poly.containsLocation(latLng, polygon_tmp)){
                                    properties_tmp.push(client.properties[i]);
                                    //$('span[property_card="'+client.properties[i].id+'"]').parent().parent().hide();
                                    //client.removeComparisonClient(i);
                                }
                            }
                            
                            client.properties = properties_tmp;
                            client.properties_parsed = [];
        
                            $('#comparison_table td').parent().remove();

                            if (client.properties.length > 0){
                                $('#property_results_area').show();
                                clientcomp.generateList();

                                /*$.post("/api/clientdoc/preparecomparisonforprint.json",{
                                    items: JSON.stringify(client.properties_parsed),
                                    client: client.data.id
                                },function (response){
                                    if (response.error != undefined)
                                        showErrorMessage(response.error.description);
                                    //else $('#print_comparison_a').attr("href", "https://docs.google.com/viewer?url=http://topreal.top/storage/"+response)
                                });*/

                                /*$.post("/api/agency/getagentslist.json",{
                                },function (result){
                                    client.agent_list = result;
                                    
                                    for (var i = 0; i < result.length; i++){
                                        if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                                            $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                                    }
                                });*/
                            /*}
                            else{
                                $('#no_clients_warning').show();
                                $('#comparison_table').hide();
                            }
                            //$('#search_entries_founded_span').html($('#property_results_table tbody').children(':visible').length-1);
                        }
                    });
                }
                
                //################################################################################//
                
                /*$.post("/api/clientdoc/preparecomparisonforprint.json",{
                    items: JSON.stringify(client.properties_parsed),
                    client: client.data.id
                },function (response){
                    if (response.error != undefined)
                        showErrorMessage(response.error.description);
                    //else $('#print_comparison_a').attr("href", "https://docs.google.com/viewer?url=http://topreal.top/storage/"+response)
                });*/
                
                /*$.post("/api/agency/getagentslist.json",{
                },function (result){
                    client.agent_list = result;
                    
                    for (var i = 0; i < result.length; i++){
                        if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                            $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                    }
                });*/
            }
            else{
                $('#no_clients_warning').show();
                $('#comparison_table').hide();
                $('#mass_hide_comparison_button, #print_comparison_a, #comparison_delete_checked_button').attr("disabled", true);
                
                if (response.type == "last" && clientcomp.refreshed == false){
                    clientcomp.refreshed = true;
                    $('#no_clients_warning').hide();
                    clientcomp.refresh();
                }
            }
        });
    };
    
    this.lastComparison = function(){
        $('.modal-header #client_number_span, #client_number_for_print_span').html(this.data.id);
        $('#comparison_modal').modal("show");
        $('#comparison_table, .comparison_limits').hide();
        $('.comparison_loader').show();
        this.properties_parsed = [];
        this.properties = null;
        
        $.post("/api/clientcomplist/getproperties.json",{
            client: this.data.id
        },function (response){
            client.properties = response.data;
            $('#comparison_table').show();
            $('.comparison_limits').hide();
            $('.comparison_loader').hide();
            $('#comparison_table td').parent().remove();
            $('#comparison_limits_count_span').text(client.properties.length);
            
            if (client.properties.length > 0){             
                if (client.properties.length < response.total){
                    $('.comparison_limits').show().css("display", "inline");
                    $('#comparison_limits_total_span').text(response.total);
                }
                
                $('#property_results_area').show();
                clientcomp.generateList();
                
                //####################### search by contour ######################################//
                
                /*if (client.geo_mode == 2 && $('#contour_select').val() != 0){
                    $.post("/api/contour/getforlist.json",{
                        id: $('#contour_select').val()
                    },function (result){
                        if (result.error != undefined)
                            showErrorMessage(result.error.description);
                        else{
                            //$('#contour_id').html(result.title);
                            var coords = JSON.parse(result.data);
                            var polygon_tmp = new google.maps.Polygon({
                                paths: coords,
                                strokeWeight: 0,
                                fillOpacity: 0.45,
                                editable: false
                            });
                            var properties_tmp = [];
                            
                            for (var i = 0; i < client.properties.length; i++){
                                var latLng = new google.maps.LatLng(client.properties[i].lat, client.properties[i].lng);
                                
                                if (google.maps.geometry.poly.containsLocation(latLng, polygon_tmp)){
                                    properties_tmp.push(client.properties[i]);
                                    //$('span[property_card="'+client.properties[i].id+'"]').parent().parent().hide();
                                    //client.removeComparisonClient(i);
                                }
                            }
                            
                            client.properties = properties_tmp;
                            client.properties_parsed = [];
        
                            $('#comparison_table td').parent().remove();

                            if (client.properties.length > 0){
                                $('#property_results_area').show();
                                clientcomp.generateList();

                                /*$.post("/api/clientdoc/preparecomparisonforprint.json",{
                                    items: JSON.stringify(client.properties_parsed),
                                    client: client.data.id
                                },function (response){
                                    if (response.error != undefined)
                                        showErrorMessage(response.error.description);
                                    //else $('#print_comparison_a').attr("href", "https://docs.google.com/viewer?url=http://topreal.top/storage/"+response)
                                });*/

                                /*$.post("/api/agency/getagentslist.json",{
                                },function (result){
                                    client.agent_list = result;
                                    
                                    for (var i = 0; i < result.length; i++){
                                        if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                                            $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                                    }
                                });*/
                            /*}
                            else{
                                $('#no_clients_warning').show();
                                $('#comparison_table').hide();
                            }
                            //$('#search_entries_founded_span').html($('#property_results_table tbody').children(':visible').length-1);
                        }
                    });
                }*/
                
                //################################################################################//
                
                /*$.post("/api/clientdoc/preparecomparisonforprint.json",{
                    items: JSON.stringify(client.properties_parsed),
                    client: client.data.id
                },function (response){
                    if (response.error != undefined)
                        showErrorMessage(response.error.description);
                    //else $('#print_comparison_a').attr("href", "https://docs.google.com/viewer?url=http://topreal.top/storage/"+response)
                });*/
                
                /*$.post("/api/agency/getagentslist.json",{
                },function (result){
                    client.agent_list = result;
                    
                    for (var i = 0; i < result.length; i++){
                        if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                            $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                    }
                });*/
            }
            else{
                $('#no_clients_warning').show();
                $('#comparison_table').hide();
            }
        });
    };
    
    this.addStreet = function(){
        if ($("#route_input input.ui-autocomplete-input").val().trim().length !== 0){
            this.geoloc.street.push(this.geoloc.street_tmp);
            this.geoloc.street_objects.push(this.geoloc.street_object_tmp);
            $("#route_input").tagit("createTag", this.geoloc.street_object_tmp.name, this.geoloc.street_tmp);
            this.onGeolocChange($("#route_input input.ui-autocomplete-input")[0]);
            
            $("#route_input input.ui-autocomplete-input").val("").focus();
        }
    };
    
    this.removeStreet = function(place_id){
        var result = [];
        
        for (var i = 0; i < this.geoloc.street.length; i++){
            if (this.geoloc.street[i] != place_id){
                result.push(this.geoloc.street[i]);
            }
        }
        
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes["geoloc"] = {old: 1};
        }
        
        this.geoloc.street = result;
    };
    
    this.createCalendarEvent = function(){
        var title = $('#event_title_input').val().trim();
        var start_date = $('#event_start_input').val().trim(); 
        var start_time = $('#event_start_time_select').val().trim();
        var end_date = $('#event_end_input').val().trim(); 
        var end_time = $('#event_end_time_select').val().trim();
        
        if (title.length !== 0 && start_date.length !== 0 && end_date.length !== 0){
            createSimpleEvent(title, start_date+"T"+start_time, end_date+"T"+end_time);
        }
    };
    
    this.setUploadedFileTitle = function(){
        if ($('#new_file_name_input').val().trim().length !== 0){
            $('#uploaded_doc_title_'+this.uploaded_doc_id).text($('#new_file_name_input').val().trim());
            
            $.post("/api/clientdoc/settitle.json",{
                id: client.uploaded_doc_id,
                title: $('#new_file_name_input').val().trim()
            },function (response){
                if (response.error != undefined){
                    showErrorMessage(response.error.description);
                }
                else{
                    $('#file_upload_modal').modal('hide');
                    showSuccess(localization.getVariable("document_successfully_uploaded"));
                }
            });
        }
        else{ 
            $('#new_file_name_input').focus();
        }
    };
    
    this.print = function(){
        $('.advopt_check:checked').each(function(){
            $('#'+$(this).attr("id")+'_wrapper').removeClass("empty");
        });
        
        window.print();
    };
    
    this.check = function(){
        if (this.data.error == undefined){
            $.post("/api/search/check.json",{
                object_type: "client",
                object_id: this.data.id
            },function (response){
                if (response.error != undefined)
                    showErrorMessage(response.error.description);
                else{ 
                    if (response == 0){
                        if (urlparser.getParameter("mode") == "collected"){
                            return 0;
                        }
                        
                        utils.successModal("<span locale='no_same_phone'>There are no the same phone cards.</span>");
                        //localization.toLocale();
                        $('#open_copied_card_a').hide();
                    }
                    else{
                        if (urlparser.getParameter("mode") == "collected"){
                            location.href = "query?id="+response+"&response=list&client="+client.data.id;
                        }
                        else{
                            location.href = "query?id="+response+"&response=list";
                        }
                    }
                }
            });
        }
    };
    
    this.createEmail = function(){
        if (this.newcard === 1){
            return 0;
        }
        
        var address = this.data.email;
        var text = "";
        var subj = $('label[locale="card_option_label"]').text()+" "+$('#num_input').val();

        text += $('#contact1_input').val()+", ";
        text += $('#contact2_input').val()+", ";
        text += $('#contact3_input').val()+", ";
        text += $('#contact4_input').val()+", ";
        text += $('label[locale="card_option_label"]').text()+" ";
        text += $('#num_input').val()+", ";
        text += $('#properties_input').val()+", ";
        text += $('#price_from_input').val()+" - "+$('#price_to_input').val();
        text += $('#currency_select option:selected').text()+", ";
        text += $('#rooms_from_count_input').val()+" - "+$('#rooms_to_count_input').val();
        text += $('#rooms_count_input_label').text()+", ";
        text += $('#object_type_select option:selected').text()+" ";
        text += $('#homesize_from_input').val()+" - "+$('#homesize_to_input').val();
        text += $('#homesize_dims_select option:selected').text()+", ";
        text += $('#locality').val()+", ";
        text += $('#route').val()+", ";
        text += $('#select_agent_label').text()+" ";
        text += $('#select_agent').val()+" ";

        //$('#property_results_table tr:visible').children().children('.card_id').each(function(){
            //text += $(this).text()+"\n";
        //});

        //console.log(text);

        //var formattedBody = "FirstLine \n Second Line \n Third Line";
        var mailToLink = "mailto:"+address+"?subject="+encodeURIComponent(subj)+"&body=" + encodeURIComponent(text);
        $('#at_button').attr("href", mailToLink);
    };
    
    this.getPropositions = function(){
        if (client.data.last_propose.from > 0){
            $.post("/api/client/getpropositions.json",{
                id: urlparser.getParameter("id")
            },function (response){
                if (response.error != undefined)
                    utils.errorModal(response.error.description);

                $('#propositions_table tbody').html("");
                $('#propositions_modal').modal("show");
                
                for (var i = 0; i < response.length; i++){
                    $('#propositions_table').append('<tr><td class="proposition_agent" agent='+response[i].user+'></td><td>'+response[i].agreement+'</td><td>'+utils.convertTimestampForDatepicker(response[i].timestamp)+'</td></tr>');
                }
                
                //$.post("/api/agency/getagentslist.json",{
                //},function (result){
                    client.agent_list = response;
                    
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        if ($('.proposition_agent[agent='+global_data.agency_getagentslist[i].id+']').length !== 0)
                            $('.proposition_agent[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                    }
                //});
            });
        }
    };
    
    this.showInOwl = function(){
        owl.showCardOnly("client", client.data.id);
    };
    
    this.showCalendarEventModal = function(){
        var event_title = this.data.name != null ? this.data.name : "";
    
        for (var i = 1; i <= 4; i++){
            if (this.data["contact"+i] != null && this.data["contact"+i].length > 0){
                event_title += (i === 1 ? " " : "/")+this.data["contact"+i];
            }
        }

        $('#event_title_input').val(event_title+" "+$('#route').val().trim());
        $('#to_cal_modal').modal('show');
    };
    
    this.reinitDocs = function(){
        $.post("/api/client/getdocs.json",{
            client_id: this.data!= null ? this.data.id : client.temporary_id
        },function (response){
            docviewer = new DocViewer(response);
            docviewer.lockUploadButton();
            uslider.initDocs();
        });
    };
    
    this.openRemoveDocDialog = function(doc_id){
        $('#delete_confirm_yes_button').attr("onclick", "client.removeDoc("+doc_id+")");
        $('#delete_confirm_modal').modal("show");
    };
    
    this.removeDoc = function(doc_id){
        this.fixChangeTime();
        $('#uploaded_doc_'+doc_id).css("opacity", "0.2");
        $('#upload_doc_'+doc_id+'_button').children(".fa").removeClass("fa-times").addClass("fa-refresh");
        $('#upload_doc_'+doc_id+'_button').attr("onclick", "client.restoreDoc("+doc_id+")");
        $('#delete_confirm_modal').modal("hide");
        
        $.post("/api/client/removedoc.json",{
            id: doc_id
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{ 
                client.onPhotoOrDocChange("doc_delete", docviewer.getNameById(response));
                docviewer.docs_counter--;
                docviewer.unlockUploadButton();
            }
        });
    };
    
    this.restoreDoc = function(doc_id){
        this.fixChangeTime();
        $('#uploaded_doc_'+doc_id).css("opacity", "1");
        $('#upload_doc_'+doc_id+'_button').children(".fa").removeClass("fa-refresh").addClass("fa-times");
        $('#upload_doc_'+doc_id+'_button').attr("onclick", "client.openRemoveDocDialog("+doc_id+")");
        
        $.post("/api/client/restoredoc.json",{
            id: doc_id
        }, null);
    };
    
    this.loaderStart = function(){
        $('.card_loader, .card_buttons_loader').show();
        
        if ($('#card_panel_div').height() > $('.card_loader').height()){
            $('.card_loader').height($('#card_panel_div').height());
        }
    };
    
    this.loaderStop = function(){
        $('.card_loader, .card_buttons_loader').hide();
    };
    
    this.bindEnterEvents = function(){
        var events = {
            price_from_input: "client.saveOnEnter()",
            price_to_input: "client.saveOnEnter()",
            free_number_input: "client.saveOnEnter()",
            name_input: "client.saveOnEnter()",
            contact5_input: "client.saveOnEnter()",
            contact1_input: "client.saveOnEnter()",
            contact2_input: "client.saveOnEnter()",
            contact3_input: "client.saveOnEnter()",
            contact4_input: "client.saveOnEnter()",
            homesize_from_input: "client.saveOnEnter()",
            homesize_to_input: "client.saveOnEnter()",
            floors_from_input: "client.saveOnEnter()",
            floors_to_input: "client.saveOnEnter()",
            rooms_from_count_input: "client.saveOnEnter()",
            rooms_to_count_input: "client.saveOnEnter()",
            event_title_input: "client.createCalendarEvent()",
            new_file_name_input: "client.setUploadedFileTitle()"
        };

        for (var key in events){
            $('#'+key).attr({
                "data-onenter-func": events[key],
                onkeypress: "utils.onEnter(event, this)"
            });
        }
    };
    
    this.initOwlButtons = function(){
        $.post("/api/owl/initcard.json", null,
        function (response){
            if (response == "mobile_client"){
                for (var i = 1; i < 5; i++){
                    $('#owl_button_phone_'+i).attr("onclick", "owl.appCallNumber('client', "+i+")");
                    $('#owl_button_sms_'+i).attr("onclick", "owl.openAppSendSMSmodal('client', "+i+")");
                }
            }
            else if (response == "app_install"){
                for (var i = 1; i < 5; i++){
                    $('#owl_button_phone_'+i).attr("onclick", "owl.openAppInstallModal()");
                    $('#owl_button_sms_'+i).attr("onclick", "owl.openAppInstallModal()");
                }
            }
        });
    };
}