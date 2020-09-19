var localization = new Localization();
var property = new Property(); // объект недвижимости
var urlparser = new URLparser(); // парсер урл-адреса
var synonim = new Synonim("property"); // оюъект для работы с системой гео-синонимов
var ac = new Autocomplete("property");
var ac_synonim = new AutocompleteSynonim("property");
var user = new User();
var clientcomp = new ClientComparison();
var propcomp = new PropertyComparison();
var property_event = new PropertyEvent();
var uslider = new UploadsSlider();
var help_tip = new HelpTip();
var quotes = new Quotes();
var utils = new Utils(); // утилиты общего назначения
var imageviewer = null; // объект вьювера изображений 
var docviewer = null; // объект вьювера документов
var hist = null; // объект Истории. данные парсятся после получения общего списка валют водном из шагов property.get
var owl = new Owl();
var subscription = new Subscription();
var stock = new Stock();
var localization = new Localization();
var tools = new Tools();

$(document).click(function(e){
    var target = $(e.target);
    if (!target.is('#'+property.focused_input_id) && !target.is('#'+property.showed_multiselect_id) && !target.is('#'+property.showed_multiselect_id+' option')) $('#'+property.showed_multiselect_id).hide();

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
            !target.is('.ac_synonim-container') && 
            !target.is('.ac_synonim-item') &&
            !target.is('.ac_synonim-icon') &&
            !target.is('.ac_synonim-icon-new') &&
            !target.is('.ac_synonim-item-query') && 
            !target.is('.ac_synonim-matched') && 
            !target.is('#ac_new_synonim_input') &&
            !target.is('#synonim_error_modal .modal-footer > button') &&
            !target.is('#synonim_error_modal .modal-footer')
    ){
        $('.ac_synonim-container').hide();
    }
    
    if (
            !target.is('.autocomplete-container') && 
            !target.is('.autocomplete-item') &&
            !target.is('.autocomplete-icon') &&
            !target.is('.autocomplete-item-query') && 
            !target.is('.autocomplete-matched') &&
            !target.is('.ac_synonim-container') && 
            !target.is('.ac_synonim-item') &&
            !target.is('.ac_synonim-icon') &&
            !target.is('.ac_synonim-icon-new') &&
            !target.is('.ac_synonim-item-query') && 
            !target.is('.ac_synonim-matched') &&
            !target.is('#ac_new_synonim_input') &&
            !target.is('#synonim_error_modal .modal-footer > button') &&
            !target.is('#synonim_error_modal .modal-footer')
    ){
        $('.autocomplete-container').hide();
    }
    
    if (
            !target.is('#stock_type_dropdown_ul') && 
            !target.is('#stock_type_dropdown_ul > li') &&
            !target.is('#stock_type_dropdown_ul > li > a')
    ){
        $('#stock_type_dropdown_ul').hide();
    }
}); 

$(document).ajaxStop(function() {
    property.multiSelectToInput("properties_select", "properties_input");
    property.multiSelectToInput("view_select", "view_input");
    property.createEmail();
    property.loaderStop();
});

function Property(){
    this.temporary_id = null;
    this.data = null;
    this.agent_list = null;
    this.defaults = {};
    this.search = null;
    this.clients = null;
    this.clients_parsed = [];
    this.client_from = null; // клиент, с компарижна которого открыта недвижимость
    this.geoloc = {};
    this.form_options = {};
    this.changes = {};
    this.last_change = null;
    this.changes_interval = null;
    this.focused_input_id = "properties_input";
    this.showed_multiselect_id = "properties_select";
    this.mode = 1;// 1 - view mode, 2 - edit mode, 3 - collected mode
    this.newcard = 1;
    this.just_created = 0; // флаг факта создания карточки, устанавлениется от создания и до reload
    this.stock_type = 0; // тип, с которым переводится недвижимость в сток (если переводтся)
    this.uploaded_doc_id = null;
    this.uploaded_image_id = null;
    this.image_new_filename_prefix = "";
    this.doc_new_filename_prefix = "";
    this.block_saving = true; // флаг, блокирует сохранение если не заполнено хотя бы одно обязательное поле
    this.form_elements = [
        "properties_input",
        "properties_select",
        "price_input",
        "currency_select",
        "status_select",
        "floors_from_input",
        "floors_count_input",
        //"floors_to_input",
        "rooms_count_input",
        "bedrooms_count_input",
        "age_select",
        "name_input",
        "contact1_input",
        //"contact1_remark_input",
        "contact2_input",
        //"contact2_remark_input",
        "contact3_input",
        //"contact3_remark_input",
        "contact4_input",
        //"contact4_remark_input",
        "contact5_input",
        "country",
        "administrative_area_level_1",
        "locality",
        "neighborhood",
        "route",
        "house_input",
        "flat_input",
        "homesize_input",
        "lotsize_input",
        "freefrom_input",
        "select_project",
        "elevator_select",
        "aircond_select",
        "parking_select",
        "furniture_select",
        "view_input",
        "view_select",
        "directions_input",
        "home_dims_select",
        "lot_dims_select",
        "remarks_area",
        "del_picture_button",
        "add_picture_button",
        "photo_upload_input",
        "del_doc_button",
        "add_doc_button",
        "doc_upload_input",
        "free_number_input",
        "bathrooms_count_input",
        "quote_button"
    ];
    
    this.form_elements_classes = [
        "delete_upload_button"
    ];
    
    this.form_checkboxes = [
        "stock_check",
        "s_direction_check",
        "w_direction_check",
        "n_direction_check",
        "e_direction_check",
        "all_direction_check"
    ];
    
    this.neccesary_tmp = null; // используется для переконтовки neccessary
    this.neccesary = [
        "properties_input",
        "price_input",
        "contact1_input",
        "country",
        "locality",
        "route",
        "house_input"
    ];
    
    this.form_buttons_to_block = [
        "newcard_button",
        "to_search_button",
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
        "new_button",
        "utils_button"
    ];
    
    this.initImageViewer = function(){
        $.post("/api/"+(this.data != null && this.data.stock == 1 ? "stock" : "property")+"/getphotos.json",{
            iPropertyId: this.temporary_id !== null ? this.temporary_id : this.data.id
        },function (response){
            if (property.newcard == 1){
                property.data = {};
            }
            
            property.data.photos = response;
            imageviewer = new ImageViewer(response, 0);
            imageviewer.showLast();
        });
    };
    
    this.initDocViewer = function(){
        $.post("/api/"+(this.data != null && this.data.stock == 1 ? "stock" : "property")+"/getdocs.json",{
            iPropertyId: this.temporary_id !== null ? this.temporary_id : this.data.id
        },function (response){
            if (property.newcard == 1) property.data = {};
            property.data.docs = response;
            docviewer = new DocViewer(response, 0);
            docviewer.showLast();
        });
    };
    
    this.setupForm = function(){
        this.loaderStart();
        this.viewmode();
        localization.init();
        subscription.init();
        app.customCheckbox();
        help_tip.initInapp();
        quotes.init();
        initAutocomplete();
        this.generateHeader();
        $('.feedback').feedback();
        $(window).on('popstate', function() {
            if (gallery != null){
                gallery.close();
            }
        });
        this.bindEnterEvents();
        
        /*$.post("/api/defaults/get.json",{
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
            else{
                property.defaults = response;

                if (urlparser.getParameter("id") == undefined){
                    for (var key in property.defaults){
                        switch (key) {
                            
                        }
                    }
                }
            }
        });*/
        
        stock.setDefaults();
        stock.init();
        
        //$.post("/api/tools/getstockcounter.json", null,
        //function (response){
            var tip = $('#stock_counter_tip_span');
            var to_replace = tip.attr("title");
            var replaced = to_replace.replace("36,000", utils.numberWithCommas(global_data.tools_getstockcounter));
            $('#stock_counter_tip_span + span').attr("title", replaced);
        //});
        
        $('#save_button').click(function(){
            if (property.newcard === 1){
                property.create();
            }
            else{ 
                property.save();
            }
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
        
        $('#add_event_start_input').datepicker({ dateFormat: "yy-mm-dd" });
        $('#add_event_end_input').datepicker({  dateFormat: "yy-mm-dd" });
        $('#add_event_start_input').datepicker('setDate', new Date());
        $('#add_event_end_input').datepicker('setDate', new Date());
        $('#add_event_end_time_select').val("01:00:00");
        //$('#event_start_time_select').change(function(){
            //$(this).
        //});
        //#########################################################################//
        
        $('.direction_check').on('ifClicked', function(){property.onDirectionsChange();});
        $('#all_direction_check').on('ifClicked', function(){property.onDirectionsChange();});
        $('#stock_check').on('ifClicked', function(){
            property.onStockChange();
            
            /*if (
                    $('#stock_check:checked').length === 0 && 
                    (
                        ($('#route').val().trim().length > 0 &&
                        property.geoloc.street != undefined &&
                        property.geoloc.street.length <= 11 && 
                        property.geoloc.street.length > 0) 
                        ||
                        ($('#neighborhood').val().trim().length > 0 &&
                        property.geoloc.neighborhood != undefined &&
                        property.geoloc.neighborhood.length <= 11 && 
                        property.geoloc.neighborhood.length > 0)
                        ||
                        synonim.collectHood(property) !== null ||
                        synonim.collectRoute(property) !== null
                    )
                ){
                utils.warningModal("You can't set stock to property with self-created street or neighborhood. Please change it to Google Maps locations.");
            }*/
            
            if (
                    $('#select_agent').val() != 0 && // не Сток
                    $('#stock_check:checked').length === 0 && // не чекнуто Сток
                    $('#status_select').val() != 0 &&
                    $('#status_select').val() != 5 &&
                    $('#status_select').val() != 7 &&
                    $('#status_select').val() != 9
                ){
                utils.warningModal(localization.getVariable("cant_set_stock_current_status"));
            }
        });
        
        $('#all_direction_check').on('ifChecked', function(){
            $('.direction_check').iCheck('check');
            //property.onDirectionsChange();
        });
        
        $('#all_direction_check').on('ifUnchecked', function(){
            $('.direction_check').iCheck('uncheck');
            //property.onDirectionsChange();
        });
        
        //$.post("/api/property/getformoptions.json",{
        //},function (response){
            var response = global_data.property_getformoptions;
        
            if (response.error != undefined)
                utils.errorModal(response.error.description);
            else{
                this.form_options = response;
                
                for (var key in this.form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#ascription_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                            
                            if (urlparser.getParameter("ascription") != undefined && this.newcard === 1)
                                if (urlparser.getParameter("ascription") == "sale")
                                    $('#ascription_select').val(0);
                                else if (urlparser.getParameter("ascription") == "rent")
                                    $('#ascription_select').val(1);
                        break;
                        case "property_type":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#properties_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                        break;
                        case "status":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#status_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                            
                            if (user.id == 4){ // если Гость
                                $('#status_select option').attr("disabled", true);
                                
                                if (urlparser.getParameter("mode") == "collected"){
                                    $('#status_select option[value=0]').attr("disabled", false);
                                    //$('#status_select').val(0);
                                }
                                else if (urlparser.getParameter("id") == undefined){
                                    $('#status_select option[value=6]').attr("disabled", false);
                                    $('#status_select').val(6);
                                }
                            }
                        break;
                        case "view":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#view_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
                        break;
                        case "dimension":
                            for (var i = 0; i < this.form_options[key].length; i++){
                                $('#home_dims_select').append("<option locale='"+this.form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i]["locale"])+"</option>");
                                $('#lot_dims_select').append("<option locale='"+this.form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i]["locale"])+"</option>");
                                
                                if ($('#home_dims_select').val() == -1){
                                    $('#home_dims_select').val(5);
                                }
                                
                                if ($('#lot_dims_select').val() == -1){
                                    $('#lot_dims_select').val(5);
                                }
                            }
                        break;
                        case "direction":
                            for (var i = 0; i < this.form_options[key].length; i++)
                                $('#directions_select').append("<option locale='"+this.form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(this.form_options[key][i])+"</option>");
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
                                            $('#home_dims_select, #lot_dims_select').val(response[key]);
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
                    this.newcard = 0;
                    this.get();
                    this.initNavigationButtons();
                }
                else{ // елси объект недвижимости не задан в адресе                    
                    //app.sliders();
                    //app.customCheckbox();
                    $('#back_button').click(function(){
                        window.history.back();
                    });
                    $('#next_button').hide();
                    $('#previous_button').hide();
                }
            }
        //});
        
        if (urlparser.getParameter("id") == undefined){ // объект недвижимости не задан (созадние новой карточки)
            $.post("/api/agency/getagentslist.json",{
            },function (response){
                for (var i = 0; i < response.length; i++)
                    $('#select_agent').append("<option value="+response[i].id+">"+response[i].name+"</option>")

                //$('#select_agent').val(property.data["agent_id"]);
            });
            
            this.newmode();
        }
        else if (urlparser.getParameter("mode") == "collected"){ // если карточка была создарана коллектором
            $('#num_input').val("");
            this.editmode();
            this.mode = 3;
            this.generateHeader();
        }
        else if (urlparser.getParameter("mode") == "view_stock" && !user.isFirstAgency()){ // если карточка была создарана коллектором
            this.viewmode();
            //this.mode = 3;
            $('\
                #edit_button, \n\
                #in_owl_button, \n\
                #previous_button, \n\
                #next_button, \n\
                #utils_button, \n\
                #new_button, \n\
                #comparison_button,\n\
                .contact_buttons_block > button,\n\
                #at_button\n\
            ').attr("disabled", true);
            $('label.control-label').css("color", "rgb(89,89,89)");
            $('\
                #card_panel_div > div.panel-body, \n\
                #buttons_panel_div, \n\
                #vip_pageblock_div, \n\
                .white_label,\n\
                #contact1_remark_input,\n\
                #contact2_remark_input,\n\
                #contact3_remark_input,\n\
                #contact4_remark_input\n\
            ').css("background", "rgb(240,240,240)");
            $('#main-wrapper').css("background", "white");
            $('.white_label').removeClass("white_label");
            $('#main_header_panel').css("background", "#b1fffb");
            this.generateHeader();
        }
        
        var a = new Date();
        
        for (var i = 0; i < 100; i++){
            $('#age_select').append("<option value="+(a.getFullYear()-i)+">"+(a.getFullYear()-i)+"</option>");
        }
        
        $('#properties_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
            
            if ($(select).val() != null && $(select).val().length === 1){
                property.multiselect_last_option = $(select).val();
            }
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            var select = this;
            
            if ($(select).val() === null)
                $(select).val(property.multiselect_last_option);
            
            property.reduceMultiSelect("properties_select", 4);
            property.multiSelectToInput('properties_select', 'properties_input');
            property.onMultiInputChange("properties_select", 'types');
            property.unlockNecessary();
        });
        
        $('#view_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            property.multiSelectToInput('view_select', 'view_input');
            property.onMultiInputChange("view_select", 'views');
        });
        
        /*$.post("/api/agency/getprojectslist.json",{
        },function (response){
            $('#select_project').html('<option value="-1"></option>');
            
            for (var i = 0; i < response.length; i++)
                $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>");
        });*/
        
        /*$('#directions_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            property.multiSelectToInput('directions_select', 'directions_input');
            property.onMultiInputChange("directions_select", 'directions');
        });*/
                                                            
        //$.post("api/user/getmytype.json", {}, function (response){
            if (global_data.getmytype == 0 || global_data.getmytype == 2){
                this.form_elements.push("select_agent");
            }
        //});
        
        this.initOwlButtons();
        
        var now = new Date();
        var next_hour = now.getHours() == 23 ? "00" : utils.leadZero(now.getHours()+1, 2);
        $('#add_event_start_time_select').val(next_hour+":00");
        hourForwardForEvent();
    };
    
    this.initOwlButtons = function(){
        $.post("/api/owl/initcard.json", null,
        function (response){
            if (response == "mobile_client"){
                for (var i = 1; i < 5; i++){
                    $('#owl_button_phone_'+i).attr("onclick", "owl.appCallNumber('property', "+i+")");
                    $('#owl_button_sms_'+i).attr("onclick", "owl.openAppSendSMSmodal('property', "+i+")");
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
    
    this.generateHeader = function(){
        var property = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : null;
        var client = urlparser.getParameter("client") != undefined ? urlparser.getParameter("client") : null;
        var client_events = urlparser.getParameter("client_events") != undefined ? urlparser.getParameter("client_events") : null;
        var search = urlparser.getParameter("search") != undefined && urlparser.getParameter("search") !== "default" ? urlparser.getParameter("search") : null;
        var header = "";
        
        if (property == null){
            header = '<span locale="new_property_label">'+localization.getVariable("new_property_label")+'</span>';
        }
        else{
            var locale = urlparser.getParameter("mode") == "view_stock" ? "stock_property" : "property_label";
            
            header = '<span locale="'+locale+'">'+localization.getVariable(locale)+'</span> '+(this.mode !== 3 ? property : "")+' ';
            
            if (client != null){
                header += '<span locale="from_client_label">'+localization.getVariable('from_client_label')+'</span> '+client;
            }
            
            if (client_events != null){
                header += '<span locale="from_client_events_label">'+localization.getVariable('from_client_events_label')+'</span> '+client_events;
            }
            
            if (search != null){
                header += '<span locale="from_search_label">'+localization.getVariable('from_search_label')+'</span> '+search;
            }
            
            if (this.mode === 3){
                header += '<span locale="from_collector">'+localization.getVariable('from_collector')+'</span>';
            }
        }
        
        $('#main_header').html(header).hover(function(){
            $('#main_header, #main_header>span').attr("title", $(this).text());
        });
    };
    
    this.get = function(){
        $.post("/api/property/get.json",{
            iPropertyId: urlparser.getParameter("id"),
            mode: urlparser.getParameter("mode")
        },function (response){
            if (response.error != undefined){
                utils.errorModal(response.error.description);
            }
            
            property.data = response;
            property.agent_list = response.agents_list;
            
            property.viewmode();
             
            if (urlparser.getParameter("action") === "comparison"){
                property.comparison();
            }
            else if (urlparser.getParameter("action") === "comparison_events"){
                clientcomp.showEventsModal();
            }
            
            $('#map_button').attr("href", "map?property="+property.data.id);
            $('#photo_upload_input').fileupload({
                formData: {
                    property: property.data.id,
                    action: "photo"
                },
                add: function(a,b){
                    $('#new_file_name_input').val(property.image_new_filename_prefix+b.originalFiles[0].name);
                    b.submit();
                },
                start: function(){
                    $('#image_loader_div').show();
                },
                done: function (e, data) {
                    property.uploaded_doc_id = null;
                    property.uploaded_image_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    property.onPhotoOrDocChange("photo_upload", $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });
            
            $.post("/api/propertycomplist/getlastcount.json",{
                property: property.data.id
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
                    property: property.data.id,
                    action: "property_doc"
                },
                add: function(a,b){
                    $('#new_file_name_input').val(property.doc_new_filename_prefix+b.originalFiles[0].name);
                    
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
                    property.uploaded_image_id = null;
                    property.uploaded_doc_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    property.onPhotoOrDocChange("doc_upload", $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });
            
            $('#printing_card_header_div').html("<span>Property for "+(response["ascription"] == 0 ? "sale" : "rent")+", card "+response["id"]+"</span><span style='float:right;'>"+utils.convertTimestampForDatepicker(utils.getNow())+"</span>");
            
            for (var key in response){
                if (response[key] != null && response[key] != ""){
                    switch (key) {
                        case "id":
                           if (property.mode !== 3){
                               $('#num_input').val(response[key]);
                               $('#comparison_events_modal #property_id_span').text(response[key]);
                           }
                        break;
                        case "stock":
                            if (response[key] == 1){
                                $('#stock_check').iCheck('check');
                                
                                //$('#status_select option').hide();
                                //$('#status_select option[value=0]').show();
                                //$('#status_select option[value=5]').show();
                                //$('#status_select option[value=7]').show();
                                //$('#status_select option[value=9]').show();
                                
                                if (urlparser.getParameter("mode") == "collected"){
                                    $('#stock_check').iCheck('disable');
                                    $('#stock_check_wrapper')
                                        .addClass("animated_tip")
                                        .addClass("warning")
                                        .addClass("expand")
                                        .attr({
                                            locale_data_title: "cant_remove_collected_from_stock",
                                            "data-title": localization.getVariable("cant_remove_collected_from_stock")
                                        });
                                }
                                
                                $('#stock_badge_wrapper').show();
                                $('#stock_badge_date_span').text(utils.getDateOnlyFromTimestamp(property.data.timestamp));
                                
                                if (property.data.foreign_stock == 1){
                                    $('#stock_badge_span').text(localization.getVariable("just_copied")+" "+localization.getVariable("from_stock"));
                                }
                                else{
                                    $('#stock_badge_span').text(localization.getVariable("just_copied")+" "+localization.getVariable("to_stock"));
                                }
                            }
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
                           property.geoloc.country = response[key];
                        break;
                        /*case "region":
                           placeDetailsByPlaceId(response[key], service_region, $('#administrative_area_level_1'));
                           property.geoloc.region = response[key];
                        break;*/
                        case "city":
                           placeDetailsByPlaceId(response[key], service_city, $('#locality'));
                           property.geoloc.city = response[key];
                           ac.getCityLocales(response[key]);
                        break;
                        case "neighborhood":
                           placeDetailsByPlaceId(response[key], service_neighborhood, $('#neighborhood'));
                           property.geoloc.neighborhood = response[key];
                           ac_synonim.selected.neighborhood = 1;
                        break;
                        case "street":
                           placeDetailsByPlaceId(response[key], service_route, $('#route'));
                           property.geoloc.street = response[key];
                           ac_synonim.selected.route = 1;
                        break;
                        case "lat":
                           property.geoloc.lat = response[key];
                           falseGeolocateByLatLng(response["lat"], response["lng"]);
                           
                           if (response["lat"] == 0 && response["lng"] == 0){
                               $('#map_button').hide();
                           }
                        break;
                        case "lng":
                           property.geoloc.lng = response[key];
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
                        case "statuses":
                            $('#status_select').val(response[key]);
                            property.onStatusChange();
                            property.setHouseNumFree();
                        break;
                        case "home_dims":
                            if (response[key] != null){
                                $('#home_dims_select').val(response[key]);
                                $('#homesize_input').val(response["home_size"] != 0 ? response["home_size"] : "");
                            }
                        break;
                        case "lot_dims":
                            if (response[key] != null){
                                $('#lot_dims_select').val(response[key]);
                                $('#lotsize_input').val(response["lot_size"] != 0 ? response["lot_size"] : "");
                            }
                        break;
                        case "last_updated":
                            var date = utils.convertTimestampForDatepicker(response[key]);
                            $('#main_header').append(", "+localization.getVariable("last_update_label")+" "+date);
                            //$('#lastupd_input').val(utils.convertTimestampForDatepicker(response[key]));
                        break;
                        case "elevator_flag":
                            $('#elevator_select').val(response[key]);
                        break;
                        case "air_cond_flag":
                            $('#aircond_select').val(response[key]);
                        break;
                        case "parking_flag":
                            $('#parking_select').val(response[key]);
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
                        case "directions":
                            var obj = JSON.parse(response[key]);
                        
                            for (var i = 0; i < obj.length; i++)
                                $('input.direction_check[name='+obj[i]+']').iCheck('check');
                            
                            if (obj.length === 4)
                                $('#all_direction_check').iCheck('check');
                            //$('#directions_select').val(JSON.parse(response[key]));
                            //property.multiSelectToInput("directions_select", "directions_input");
                        break;
                        case "remarks_text":
                            $('#remarks_area').val(response[key]);
                        break;
                        case "name":
                            $('#name_input').val(response[key]);
                        break;
                        case "email":
                            $('#contact5_input').val(response[key]);
                        break;
                        case "agent_id":
                            if (response["stock"] == 0 || (response["stock"] == 1 && response["foreign_stock"] == 0)){                                
                                for (var i = 0; i < property.agent_list.length; i++){
                                    $('#select_agent').append("<option value="+property.agent_list[i].id+">"+property.agent_list[i].name+"</option>");
                                }

                                $('#select_agent').val(property.data["agent_id"]);
                            }
                            else{
                                $('#select_agent').append("<option locale='stock' value='0'>Stock</option>");
                                $('#select_agent').val(0);
                                
                                if (property.form_elements[property.form_elements.length-1] === "select_agent"){
                                    property.form_elements.pop();
                                }
                            }
                        break;                    
                        case "house_number":
                            $('#house_input').val(response[key] != 0 ? response[key] : "");
                        break;
                        case "flat_number":
                            $('#flat_input').val(response[key] != 0 ? response[key] : "");
                        break;
                        case "types":
                            $('#properties_select').val(JSON.parse(response[key]));
                            property.multiSelectToInput("properties_select", "properties_input");
                            property.unlockNecessary();
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
                        case "price":
                            $('#price_input').val(utils.numberWithCommas(response[key]));
                            //$('#price_input').attr("sum", response[key]);
                        break;
                        case "price_before":
                            if (response[key].error == undefined && response[key].price != null && property.form_options.currency[response[key].currency] != undefined)
                                $('#price_before_input').val(utils.convertTimestampForDatepicker(response[key].timestamp)+" "+utils.numberWithCommas(response[key].price)+" "+property.form_options.currency[response[key].currency].symbol);
                        break;
                        case "views":
                            $('#view_select').val(JSON.parse(response[key]));
                            property.multiSelectToInput("view_select", "view_input");
                        break;
                        case "age":
                            $('#age_select').val(response[key]);
                        break;
                        case "floor_from":
                            $('#floors_from_input').val(response[key]);
                        break;
                        case "floors_count":
                            $('#floors_count_input').val(response[key] != 0 ? response[key] : "");
                        break;
                        case "rooms_count":
                            $('#rooms_count_input').val(response[key]);
                            //$('#floors_input_slider').attr("data-slider-value", "["+response["iFloorFrom"]+","+response["iFloorTo"]+"]");
                        break;
                        case "bedrooms_count":
                            $('#bedrooms_count_input').val(response[key]);
                        break;
                        case "bathrooms_count":
                            $('#bathrooms_count_input').val(response[key]);
                        break;
                        case "project_id":
                            /*$.post("/api/agency/getprojectslist.json",{
                            },function (response){
                                $('#select_project').html('<option value="-1"></option>');
                                
                                for (var i = 0; i < response.length; i++)
                                    $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>")

                                $('#select_project').val(property.data["project_id"]);
                            });*/
                        break;                    
                        case "photos":
                            imageviewer = new ImageViewer(response[key], 0);
                            uslider.initImages();
                            property.just_created = 0;
                            imageviewer.lockUploadButton();
                            //imageviewer.getFirstThumb();
                        break;
                        case "docs":
                            if (response[key].error == undefined){
                                docviewer = new DocViewer(response[key]);
                                //imageviewer.getFirstThumb();
                                uslider.initDocs();
                                property.just_created = 0;
                                docviewer.lockUploadButton();
                            }
                            else{
                                $('#docs_counter_span').html(0);
                            }
                        break;
                        case "history":
                            hist = new History(response[key], 1);
                            //hist.fillShortTable();
                            //imageviewer.getFirstThumb();
                        break;
                        case "contact1":
                            property.changeContactType(1, response[key]);
                            $('#contact1_input').val(response["contact1"]);
                            
                            if ($('#contact1_input').val().trim().length > 0)
                                utils.unlockContactRemark(1);
                        break;
                        case "contact1_remark":
                            $('#contact1_remark_input').val(response[key]);
                        break;
                        case "contact2":
                            property.changeContactType(2, response[key]);
                            $('#contact2_input').val(response["contact2"]);
                            
                            if ($('#contact2_input').val().trim().length > 0)
                                utils.unlockContactRemark(2);
                        break; 
                        case "contact2_remark":
                            $('#contact2_remark_input').val(response[key]);
                        break;
                        case "contact3":
                            property.changeContactType(3, response[key]);
                            $('#contact3_input').val(response["contact3"]);
                            
                            if ($('#contact3_input').val().trim().length > 0)
                                utils.unlockContactRemark(3);
                        break; 
                        case "contact3_remark":
                            $('#contact3_remark_input').val(response[key]);
                        break;
                        case "contact4":
                            property.changeContactType(4, response[key]);
                            $('#contact4_input').val(response["contact4"]);
                            
                            if ($('#contact4_input').val().trim().length > 0)
                                utils.unlockContactRemark(4);
                        break; 
                        case "contact4_remark":
                            $('#contact4_remark_input').val(response[key]);
                        break;
                        case "im_editor":
                            if (response[key] == true){
                                property.edit();
                            }
                        break;
                        case "external_new":
                            $('#new_ad_warning_wrapper').show();
                            $('#new_ad_warning_date_span').text(utils.getDateOnlyFromTimestamp(response[key][0]));
                            $('#new_ad_warning_wrapper a').attr("href", response[key][1]);
                        break;
                        case "events":
                            var events = response[key];
                            
                            for (var e = 0; e < events.length; e++){
                                $('#'+events[e].event).text(utils.getDateOnlyFromTimestamp(events[e].start));
                                //$('a.'+events[e].event).attr("onclick", "");//.css("opacity", "0.5");
                            }
                        break;
                    }
                }
            }
            
            if (response["external_new"] == null){
                $('#new_ad_warning_wrapper').hide();
            }
            
            if (urlparser.getParameter("mode") == "collected" && urlparser.getParameter("check") == undefined){
                property.check();
            }
            else{
                property.checkErrors();
            }
            
            property.setCollectedLinks();
            //localization.toLocale();
        });
    };
    
    this.checkErrors = function(){ // проверяет карточку на ошибки (отсуствие обязательных данных)
        if (
                (this.data.agent_id == null ||
                this.data.types == null ||
                this.data.price == null ||
                //this.data.currency_id == null ||
                this.data.ascription == null ||
                this.data.contact1 == null ||
                this.data.statuses == null ||
                this.data.country == null ||
                this.data.city == null) &&
                this.data.statuses != 6
        ){
            //utils.errorModal(localization.getVariable("errors_on_this_card_fix_them"));
            utils.errorModal(localization.getVariable("errors_on_this_card_fix_them"));
            
            if (this.data.agent_id == null){
                $.post("/api/agency/getagentslist.json",{},function (response){
                    $('#select_agent').append("<option></option>");
                    
                    for (var i = 0; i < response.length; i++){
                        $('#select_agent').append("<option value="+response[i].id+">"+response[i].name+"</option>")
                    }
                });
            }
        }
    };
    
    this.edit = function(){
        $.post("/api/property/tryedit.json",{
            iPropertyId: this.data.id
        },function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    if (user.id == 4){
                        $('#try_now_property_forbidden_edit_modal').modal("show");
                    }
                    else{
                        utils.accessErrorModal(response.error.description);
                    }
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{ 
                property.editmode();
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
            property.viewmode();
            property.unlock();
        }
        else{
            try{
                if (this.neccesary !== null){
                    for (var i = 0; i < this.neccesary.length; i++){
                        if ($('#'+this.neccesary[i]).val().trim().length === 0 && this.block_saving === true){
                            if ((this.neccesary[i] === "route" || this.neccesary[i] === "house_input") && urlparser.getParameter("mode") === "collected"){
                                $('#create_card_nevertheless_button').show();
                            }
                            else{
                                $('#create_card_nevertheless_button').hide();
                            }
                            
                            if (urlparser.getParameter("mode") === undefined){
                                $('#create_card_tested_button').show();
                                $('#create_card_nevertheless_button').hide();
                            }

                            utils.hlEmpty(this);
                            throw localization.getVariable("nessecary_field_empty");
                        }
                    }
                }

                $('input').css("background","");
                
                if (
                        $('#stock_check:checked').length === 1 && 
                        (
                            ($('#route').val().trim().length > 0 &&
                            this.geoloc.street != undefined &&
                            this.geoloc.street.length <= 11 && 
                            this.geoloc.street.length > 0) 
                            ||
                            ($('#neighborhood').val().trim().length > 0 &&
                            this.geoloc.neighborhood != undefined &&
                            this.geoloc.neighborhood.length <= 11 && 
                            this.geoloc.neighborhood.length > 0) 
                            ||
                            ac_synonim.collectHood(this) !== null ||
                            ac_synonim.collectRoute(this) !== null
                        )
                ){
                    utils.warningModal(localization.getVariable("cant_set_synonim_to_stock"));
                    return 0;
                }
                
                if ( //
                        urlparser.getParameter("mode") !== "collected" && // если открыто НЕ из коллектора
                        this.data.stock == 0 && // не на стоке
                        $('#stock_check:checked').length === 1 && // и чекнуто Сток (создаем новый)
                        $('#status_select').val() != 0 && // то запрет на неверные статусы
                        $('#status_select').val() != 5 &&
                        $('#status_select').val() != 7 &&
                        $('#status_select').val() != 9
                ){
                    utils.warningModal(localization.getVariable("cant_set_stock_current_status"));
                    return 0;
                }
                else if ( //
                        urlparser.getParameter("mode") === "collected" && // если открыто из коллектора
                        $('#select_agent').val() != 0 && // агент = НЕ Сток (Я собрал из коллектора)
                        $('#stock_check:checked').length === 1 && // и чекнуто Сток (помещаем в сток)
                        $('#status_select').val() != 0 && // то запрет на неверные статусы
                        $('#status_select').val() != 5 &&
                        $('#status_select').val() != 7 &&
                        $('#status_select').val() != 9
                ){
                    utils.warningModal(localization.getVariable("cant_set_stock_current_status"));
                    return 0;
                }
                
                if (
                        $('#neighborhood').val().trim().length > 0 && 
                        ac_synonim.selected.neighborhood === 0 && 
                        ac_synonim.confirmed.neighborhood == 0 &&
                        ac.selected.neighborhood === 0 &&
                        ac.confirmed.neighborhood == 0 &&
                        this.changes.neighborhood != undefined
                ){
                    $('#new_synonim_create_message_1').attr("locale", "new_hood_synonim_create_message_1");
                    $('#new_synonim_name_span').text($('#neighborhood').val().trim());
                    $('#new_synonim_create_message_2').attr("locale", "new_hood_synonim_create_message_2");
                    $('#new_synonim_warning_modal').modal("show");
                    $('#close_button').attr("onclick", "property.synonimNotConfirmed('neighborhood')");
                    $('#create_new_synonim_button').attr("onclick", "ac_synonim.confirmCreating('neighborhood')").attr("locale", "create_new_hood");
                    //localization.toLocale();
                    return 0;
                } 

                if (
                        $('#route').val().trim().length > 0 && 
                        ac_synonim.selected.route === 0 && 
                        ac_synonim.confirmed.route == 0 &&
                        ac.selected.route === 0 && 
                        ac.confirmed.route == 0 && 
                        this.changes.route != undefined
                ){
                    $('#new_synonim_create_message_1').attr("locale", "new_street_synonim_create_message_1");
                    $('#new_synonim_name_span').text($('#route').val().trim());
                    $('#new_synonim_create_message_2').attr("locale", "new_street_synonim_create_message_2");
                    $('#new_synonim_warning_modal').modal("show");
                    $('#close_button').attr("onclick", "property.synonimNotConfirmed('route')");
                    $('#create_new_synonim_button').attr("onclick", "ac_synonim.confirmCreating('route')").attr("locale", "create_new_street");;
                    //localization.toLocale();
                    return 0;
                }
                
                $('#new_synonim_warning_modal').modal("hide");
                ac_synonim.confirmed = {  // подтверждения для создания синонимв
                    route: 0, 
                    neighborhood: 0 
                };
                
                this.data.stock = $('#stock_check:checked').length; // обновляем значение стока на карточке динамически

                collected.stock = $('#stock_check:checked').length;
                collected.stock_type = this.stock_type;
                collected.country = this.geoloc.country;
                //collected.region = this.geoloc.region;
                collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : ac_synonim.current_selected.neighborhood) : null;
                collected.new_hood_synonim = ac_synonim.collectHood();
                collected.city = this.geoloc.city;
                collected.street = this.geoloc.street != null ? this.geoloc.street : ac_synonim.current_selected.route;
                
                if ($('#route').val().trim().length === 0 && this.block_saving === false){
                    collected.street = "";
                }
                
                collected.new_street_synonim = ac_synonim.collectRoute();
                collected.lat = this.geoloc.lat;
                collected.lng = this.geoloc.lng;
                collected.ascription = $('#ascription_select').val();
                collected.statuses = $('#status_select').val();
                collected.elevator_flag = $('#elevator_select').val();
                collected.air_cond_flag = $('#aircond_select').val();                    
                collected.parking_flag = $('#parking_select').val();                    
                collected.furniture_flag = $('#furniture_select').val();    
                collected.facade_flag = $('#view_select').val() !== null && $('#view_select').val()[0] == 0 ? 1 : 0;
                collected.ground_floor_flag = $('#floors_from_input').val().trim().length != 0 && $('#floors_from_input').val().trim() == 1 ? 1 : 0;
                collected.last_floor_flag = $('#floors_count_input').val().trim().length != 0 && $('#floors_from_input').val().trim() == $('#floors_count_input').val().trim() ? 1 : 0;
                var obj = [];
                $('input.direction_check:checked').each(function(){
                  obj.push($(this).val());
                });
                collected.directions = obj.length === 0 ? null : obj;                   
                collected.remarks_text = $('#remarks_area').val().length > 0 ? $('#remarks_area').val() : null;                    
                collected.name = $('#name_input').val().length > 0 ? $('#name_input').val() : null;                   
                collected.email = $('#contact5_input').val().length > 0 ? $('#contact5_input').val() : null;                    
                collected.agent_id = $('#select_agent').val();
                //collected.agent_id = property.data.agent_id;
                collected.house_number = $('#house_input').val().length > 0 ? $('#house_input').val() : null;                   
                collected.flat_number = $('#flat_input').val().length > 0 ? $('#flat_input').val() : null;                    
                collected.types = $('#properties_select').val();                    
                collected.currency_id = $('#currency_select').val();
                collected.price = utils.numberRemoveCommas($('#price_input').val().trim());                    
                collected.views = $('#view_select').val();                    
                collected.home_size = $('#homesize_input').val().trim().length != 0 && $('#homesize_input').val().trim() != 0 && $('#home_dims_select').val() != -1 ? $('#homesize_input').val().trim() : null;                    
                collected.lot_size = $('#lotsize_input').val().trim().length != 0 && $('#lotsize_input').val().trim() != 0 && $('#lot_dims_select').val() != -1 ? $('#lotsize_input').val().trim() : null;  
                collected.home_dims = collected.home_size != null && $('#home_dims_select').val() != -1 ? $('#home_dims_select').val() : null;
                collected.lot_dims = collected.lot_size != null && $('#lot_dims_select').val() != -1 ? $('#lot_dims_select').val() : null;
                collected.free_from = $('#freefrom_input').val().length > 0 ? $('#freefrom_input').datepicker("getDate")/1000 : null;               
                collected.age = $('#age_select').val() != -1 ? $('#age_select').val() : null;                   
                
                //utils.checkFieldsBothFilled($('#floors_from_input'), $('#floors_count_input'), "Fill in floors count!", "Fill in floor number!");
                utils.checkFieldsFinishNoLessStart($('#floors_from_input'), $('#floors_count_input'), "Floors count can't be less than floor number!");
                utils.checkFieldsFinishNoLessStart($('#bedrooms_count_input'), $('#rooms_count_input'), "Rooms count can't be less than bedrooms count!");
                
                collected.floor_from = $('#floors_from_input').val().length > 0 ? $('#floors_from_input').val() : null;        
                collected.floors_count = $('#floors_count_input').val().length > 0 ? $('#floors_count_input').val() : null;        
                //collected.floor_to = $('#floors_to_input').val();                    
                collected.rooms_count = $('#rooms_count_input').val().length > 0 ? $('#rooms_count_input').val() : null; 
                collected.bedrooms_count = $('#bedrooms_count_input').val().length > 0 ? $('#bedrooms_count_input').val() : null; 
                collected.bathrooms_count = $('#bathrooms_count_input').val().length > 0 ? $('#bathrooms_count_input').val() : null; 
                //collected.project_id = $('#select_project').val() != -1 ? $('#select_project').val() : null;                   
                collected.contact1_remark = $('#contact1_remark_input').val().length > 0 ? $('#contact1_remark_input').val() : null;                    
                collected.contact1 = $('#contact1_input').val().length > 0 ? $('#contact1_input').val() : null;                    
                collected.contact2_remark = $('#contact2_remark_input').val().length > 0 ? $('#contact2_remark_input').val() : null;                    
                collected.contact2 = $('#contact2_input').val().length > 0 ? $('#contact2_input').val() : null;                    
                collected.contact3_remark = $('#contact3_remark_input').val().length > 0 ? $('#contact3_remark_input').val() : null;                    
                collected.contact3 = $('#contact3_input').val().length > 0 ? $('#contact3_input').val() : null;                    
                collected.contact4_remark = $('#contact4_remark_input').val().length > 0 ? $('#contact4_remark_input').val() : null;                   
                collected.contact4 = $('#contact4_input').val().length > 0 ? $('#contact4_input').val() : null;
                collected.free_number = $('#free_number_input').val().length > 0 ? $('#free_number_input').val() : null;
                
                utils.htmlSpinner("save_button");
                
                $.post("/api/property/set.json",{
                    id: this.data.id,
                    data: JSON.stringify(collected),
                    collected: urlparser.getParameter("mode") === "collected" ? 1 : 0
                },function (response){
                    utils.removeHtmlSpinner("save_button");
                    
                    if (response.error != undefined){
                        utils.errorModal(response.error.description);
                    }
                    else{ 
                        property.data.stock = 0;
                        property.data.foreign_stock = 0;
                        property.viewmode();
                        showSuccess(localization.getVariable("property_saved"));                        
                    }
                });

                $.post("/api/property/sethistory.json",{
                    id: this.data.id,
                    data: JSON.stringify(this.changes)
                },function (response){
                    if (response.error != undefined){
                        utils.errorModal(response.error.description);
                    }
                    else{
                        property.changes = {};
                        hist.update(property.data.id, 1);
                    }
                });
            }
            catch(error){
                utils.errorModal(error);
            }
        }
    };
    
    this.saveOnEnter = function(){
        if (this.newcard === 1){
            this.create();
        }
        else{ 
            this.save();
        }
    };
    
    this.create = function(){
        var collected = {};
        
        try{
            if (this.neccesary !== null){
                for (var i = 0; i < this.neccesary.length; i++){
                    if ($('#'+this.neccesary[i]).val().trim().length === 0){
                        if (urlparser.getParameter("mode") === undefined){
                            $('#create_card_tested_button').show();
                            $('#create_card_nevertheless_button').hide();
                        }
                        
                        utils.hlEmpty(this);
                        throw localization.getVariable("nessecary_field_empty");
                    }
                }
            }
            
            $('input').css("background","");
            
            if (
                    $('#stock_check:checked').length === 1 && 
                    (
                        ($('#route').val().trim().length > 0 &&
                        this.geoloc.street != undefined &&
                        this.geoloc.street.length <= 11 && 
                        this.geoloc.street.length > 0) 
                        ||
                        ($('#neighborhood').val().trim().length > 0 &&
                        this.geoloc.neighborhood != undefined &&
                        this.geoloc.neighborhood.length <= 11 && 
                        this.geoloc.neighborhood.length > 0)
                        ||
                        ac_synonim.collectHood(this) !== null ||
                        ac_synonim.collectRoute(this) !== null
                    )
            ){
                utils.warningModal(localization.getVariable("cant_set_synonim_to_stock"));
                return 0;
            }
            
            if (
                    $('#stock_check:checked').length === 1 &&
                    $('#status_select').val() != 0 &&
                    $('#status_select').val() != 5 &&
                    $('#status_select').val() != 7 &&
                    $('#status_select').val() != 9
                ){
                utils.warningModal(localization.getVariable("cant_set_stock_current_status"));
                return 0;
            }
            
            if (
                    $('#neighborhood').val().trim().length > 0 && 
                    ac_synonim.selected.neighborhood === 0 && 
                    ac_synonim.confirmed.neighborhood == 0 &&
                    ac.selected.neighborhood === 0 &&
                    ac.confirmed.neighborhood == 0
            ){
                $('#new_synonim_create_message_1').attr("locale", "new_hood_synonim_create_message_1");
                $('#new_synonim_name_span').text($('#neighborhood').val().trim());
                $('#new_synonim_create_message_2').attr("locale", "new_hood_synonim_create_message_2");
                $('#new_synonim_warning_modal').modal("show");
                $('#close_button').attr("onclick", "property.synonimNotConfirmed('neighborhood')");
                $('#create_new_synonim_button').attr("onclick", "ac_synonim.confirmCreating('neighborhood')").attr("locale", "create_new_hood");
                //localization.toLocale();
                return 0;
            }

            if (
                    $('#route').val().trim().length > 0 && 
                    ac_synonim.selected.route === 0 && 
                    ac_synonim.confirmed.route == 0 &&
                    ac.selected.route === 0 && 
                    ac.confirmed.route == 0
            ){
                $('#new_synonim_create_message_1').attr("locale", "new_street_synonim_create_message_1");
                $('#new_synonim_name_span').text($('#route').val().trim());
                $('#new_synonim_create_message_2').attr("locale", "new_street_synonim_create_message_2");
                $('#new_synonim_warning_modal').modal("show");
                $('#close_button').attr("onclick", "property.synonimNotConfirmed('route')");
                $('#create_new_synonim_button').attr("onclick", "ac_synonim.confirmCreating('route')").attr("locale", "create_new_street");;
                //localization.toLocale();
                return 0;
            }
            
            $('#new_synonim_warning_modal').modal("hide");
            ac_synonim.confirmed = {  // подтверждения для создания синонимв
                route: 0, 
                neighborhood: 0 
            };
            
            collected.stock = $('#stock_check:checked').length;
            collected.stock_type = this.stock_type;
            collected.country = this.geoloc.country;
            //collected.region = this.geoloc.region;
            collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : ac_synonim.current_selected.neighborhood) : null;
            collected.new_hood_synonim = ac_synonim.collectHood();
            collected.city = this.geoloc.city;
            collected.street = this.geoloc.street != null ? this.geoloc.street : ac_synonim.current_selected.route;
            collected.new_street_synonim = ac_synonim.collectRoute();
            collected.lat = this.geoloc.lat;
            collected.lng = this.geoloc.lng;
            collected.ascription = $('#ascription_select').val();
            collected.statuses = $('#status_select').val();
            collected.elevator_flag = $('#elevator_select').val();
            collected.air_cond_flag = $('#aircond_select').val();                    
            collected.parking_flag = $('#parking_select').val();                    
            collected.furniture_flag = $('#furniture_select').val();   
            collected.facade_flag = $('#view_select').val() !== null && $('#view_select').val()[0] == 0 ? 1 : 0;
            collected.ground_floor_flag = $('#floors_from_input').val().trim().length != 0 && $('#floors_from_input').val().trim() == 1 ? 1 : 0;
            collected.last_floor_flag = $('#floors_count_input').val().trim().length != 0 && $('#floors_from_input').val().trim() == $('#floors_count_input').val().trim() ? 1 : 0;
            var obj = [];
            $('input.direction_check:checked').each(function(){
              obj.push($(this).val());
            });
            collected.directions = obj.length === 0 ? null : obj;                   
            collected.remarks_text = $('#remarks_area').val().length > 0 ? $('#remarks_area').val() : null;                    
            collected.name = $('#name_input').val().length > 0 ? $('#name_input').val() : null;                   
            collected.email = $('#contact5_input').val().length > 0 ? $('#contact5_input').val() : null;                    
            collected.agent_id = $('#select_agent').val();  
            //collected.agent_id = property.data.agent_id;
            collected.house_number = $('#house_input').val().length > 0 ? $('#house_input').val() : null;                   
            collected.flat_number = $('#flat_input').val().length > 0 ? $('#flat_input').val() : null;                    
            collected.types = $('#properties_select').val();                    
            collected.currency_id = $('#currency_select').val();                    
            collected.price = utils.numberRemoveCommas($('#price_input').val().trim());                    
            collected.views = $('#view_select').val();                    
            collected.home_size = $('#homesize_input').val().trim().length != 0 && $('#homesize_input').val().trim() != 0 && $('#home_dims_select').val() != -1 ? $('#homesize_input').val().trim() : null;                    
            collected.lot_size = $('#lotsize_input').val().trim().length != 0 && $('#lotsize_input').val().trim() != 0 && $('#lot_dims_select').val() != -1 ? $('#lotsize_input').val().trim() : null;  
            collected.home_dims = collected.home_size != null && $('#home_dims_select').val() != -1 ? $('#home_dims_select').val() : null;
            collected.lot_dims = collected.lot_size != null && $('#lot_dims_select').val() != -1 ? $('#lot_dims_select').val() : null;                   
            collected.free_from = $('#freefrom_input').val().length > 0 ? $('#freefrom_input').datepicker("getDate")/1000 : null;                    
            collected.age = $('#age_select').val() != -1 ? $('#age_select').val() : null;                   
            
            //utils.checkFieldsBothFilled($('#floors_from_input'), $('#floors_count_input'), "Fill in floors count!", "Fill in floor number!");
            utils.checkFieldsFinishNoLessStart($('#floors_from_input'), $('#floors_count_input'), "Floors count can't be less than floor number!");
            
            collected.floor_from = $('#floors_from_input').val().length > 0 ? $('#floors_from_input').val() : null;   
            collected.floors_count = $('#floors_count_input').val().length > 0 ? $('#floors_count_input').val() : null;   
            //collected.floor_to = $('#floors_to_input').val();                    
            collected.rooms_count = $('#rooms_count_input').val().length > 0 ? $('#rooms_count_input').val() : null;  
            collected.bedrooms_count = $('#bedrooms_count_input').val().length > 0 ? $('#bedrooms_count_input').val() : null;  
            collected.bathrooms_count = $('#bathrooms_count_input').val().length > 0 ? $('#bathrooms_count_input').val() : null;  
            //collected.project_id = $('#select_project').val() != -1 ? $('#select_project').val() : null;                   
            collected.contact1_remark = $('#contact1_remark_input').val().length > 0 ? $('#contact1_remark_input').val() : null;                    
            collected.contact1 = $('#contact1_input').val().length > 0 ? $('#contact1_input').val() : null;                    
            collected.contact2_remark = $('#contact2_remark_input').val().length > 0 ? $('#contact2_remark_input').val() : null;                    
            collected.contact2 = $('#contact2_input').val().length > 0 ? $('#contact2_input').val() : null;                    
            collected.contact3_remark = $('#contact3_remark_input').val().length > 0 ? $('#contact3_remark_input').val() : null;                    
            collected.contact3 = $('#contact3_input').val().length > 0 ? $('#contact3_input').val() : null;                    
            collected.contact4_remark = $('#contact4_remark_input').val().length > 0 ? $('#contact4_remark_input').val() : null;                   
            collected.contact4 = $('#contact4_input').val().length > 0 ? $('#contact4_input').val() : null;
            collected.free_number = $('#free_number_input').val().length > 0 ? $('#free_number_input').val() : null;
            
            $.post("/api/property/createnew.json",{
                id: this.temporary_id,
                data: JSON.stringify(collected)
            },function (response){
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    for (var i = 0; i < property.form_buttons_to_block.length; i++)
                        $('#'+property.form_buttons_to_block[i]).attr("disabled", false);
                    
                    $('#ascription_select').attr("disabled", true);
                    $('#newcard_button').attr("disabled", false);
                    property.newcard = 0;
                    property.just_created = 1;
                    property.temporary_id = null;
                    property.viewmode();
                    showSuccess(localization.getVariable("property_successfully_created"));
                    urlparser.setParameter("id", response);
                    property.get();
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
        
        if (multiselect_id == "properties_select" && this.neccesary !== null){
            var updated_options = element.val();
            var tumbler = 0;
            
            for (var i = 0; i < updated_options.length; i++)
                if (updated_options[i] == 20 || updated_options[i] == 16 || updated_options[i] == 17)
                    tumbler = 1;
                    
            if (tumbler === 1){
                this.neccesary = [
                    "properties_input",
                    "price_input",
                    "contact1_input",
                    "country"
                ];

                $('[for="locality"]').text("City:");
                $('[for="route"]').text("Street:");
                $('[for="house_input"]').text("House №:");
            }
            else{
                this.neccesary = [
                    "properties_input",
                    "price_input",
                    "contact1_input",
                    "country",
                    "locality",
                    "route",
                    "house_input"
                ];

                $('[for="locality"]').text("*City:");
                $('[for="route"]').text("*Street:");
                $('[for="house_input"]').text("*House №:");
            }
        }
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
    
    this.onDirectionsChange = function(){
        var obj = [];
        $('input.direction_check:checked').each(function(){
            obj.push($(this).val());
        });
        this.setJSONchange("directions", obj);
        //else this.setChange("directions", null);
    };
    
    this.onStockChange = function(){
        this.setChange("stock", $('#stock_check:checked').length === 1 ? 0 : 1);
        
        if (urlparser.getParameter("mode") == "collected"){
            if ($('#stock_check:checked').length == 1){
                $('#stock_check_wrapper').addClass("animated_tip").addClass("expand");
            }
            else{
                $('#stock_check_wrapper').removeClass("animated_tip").removeClass("expand");
            }
        }
        else{
            if ($('#stock_check:checked').length == 0 && $('#status_select').val() == 0){
                $('#stock_type_dropdown_ul').show();
            }
            else{
                $('#stock_type_dropdown_ul').hide();
                
                if (property.newcard == 0 && property.data.stock == 1){
                    $('#delete_stock_confirm_modal').modal("show");
                }
            }
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
    
    this.onPriceKeyUp = function(){
        var price_value = utils.numberRemoveCommas($('#price_input').val().trim());
        $('#price_input').val(utils.numberWithCommas(price_value));
    };
    
    this.onRoomsKeyUp = function(){
        var value = $('#rooms_count_input').val().trim();
        
        if (value.match(/^\d+(\.)?(5)?$/g) != null){
            $('#rooms_count_input').val(value);
        }
        else{
            $('#rooms_count_input').val(value.substr(0, value.length-1));
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
    
    this.setChange = function(parameter, value){
        if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes[parameter] = {old: this.data[parameter], new: value};
            //this.data[parameter] = value;
        }
    };
    
    this.saveContactRemark = function(input, parameter){
        $.post("/api/property/savecontactremark.json",{
            property_id: this.temporary_id != null ? this.temporary_id : this.data.id,
            parameter: parameter,
            value: $(input).val()
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
        });
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
    
    this.onContactTypeChange = function(contact, new_type){
        this.fixChangeTime();
        this.changes["contact"+contact+"_type"] = {old: $('#contact'+contact+'_input').attr("type"), new: new_type};
    };
    
    this.openRemovePhotoDialog = function(photo_id){
        $('#delete_confirm_yes_button').attr("onclick", "property.removePhoto("+photo_id+")");
        $('#delete_confirm_modal').modal("show");
    };
    
    this.openRemoveDocDialog = function(doc_id){
        $('#delete_confirm_yes_button').attr("onclick", "property.removeDoc("+doc_id+")");
        $('#delete_confirm_modal').modal("show");
    };
    
    this.removePhoto = function(photo_id){
        this.fixChangeTime();
        $('#uploaded_image_'+photo_id).css("opacity", "0.2");
        $('#upload_image_'+photo_id+'_button').children(".fa").removeClass("fa-times").addClass("fa-refresh");
        $('#upload_image_'+photo_id+'_button').attr("onclick", "property.restorePhoto("+photo_id+")");
        $('#delete_confirm_modal').modal("hide");
        
        $.post("/api/property/removephoto.json",{
            id: photo_id
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
                //property.initImageViewer();
                property.onPhotoOrDocChange("photo_delete", imageviewer.getNameById(response));
                imageviewer.images_counter--;
                imageviewer.unlockUploadButton();
            }
        });
    };
    
    this.removeDoc = function(doc_id){
        this.fixChangeTime();
        $('#uploaded_doc_'+doc_id).css("opacity", "0.2");
        $('#upload_doc_'+doc_id+'_button').children(".fa").removeClass("fa-times").addClass("fa-refresh");
        $('#upload_doc_'+doc_id+'_button').attr("onclick", "property.restoreDoc("+doc_id+")");
        $('#delete_confirm_modal').modal("hide");
        
        $.post("/api/property/removedoc.json",{
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
                //property.initDocViewer();
                property.onPhotoOrDocChange("doc_delete", docviewer.getNameById(response));
                docviewer.docs_counter--;
                docviewer.unlockUploadButton();
            }
        });
    };
    
    this.restorePhoto = function(photo_id){
        this.fixChangeTime();
        $('#uploaded_image_'+photo_id).css("opacity", "1");
        $('#upload_image_'+photo_id+'_button').children(".fa").removeClass("fa-refresh").addClass("fa-times");
        $('#upload_image_'+photo_id+'_button').attr("onclick", "property.openRemovePhotoDialog("+photo_id+")");
        
        $.post("/api/property/restorephoto.json",{
            id: photo_id
        }, null);
    };
    
    this.restoreDoc = function(doc_id){
        this.fixChangeTime();
        $('#uploaded_doc_'+doc_id).css("opacity", "1");
        $('#upload_doc_'+doc_id+'_button').children(".fa").removeClass("fa-refresh").addClass("fa-times");
        $('#upload_doc_'+doc_id+'_button').attr("onclick", "property.openRemoveDocDialog("+doc_id+")");
        
        $.post("/api/property/restoredoc.json",{
            id: doc_id
        }, null);
    };
    
    this.showMultiSelect = function(input_id, selector_id){
        this.focused_input_id = input_id;
        this.showed_multiselect_id = selector_id;
        $('#'+selector_id).show();
    };
    
    this.propose = function(){
        this.fixChangeTime();
        $.post("/api/property/propose.json",{
            property_id: this.data.id,
            agreement_num: $('#agreement_number_input').val().trim()
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
            else{ 
                showSuccess('Property proposed, agreement saved to documents!');            
            
                $.post("/api/propertydoc/savecomparison.json",{
                    agreement_name: $('#agreement_number_input').val().trim(),
                    agreement_id: response,
                    items: JSON.stringify(property.clients_parsed),
                    property: property.data.id
                },function (response){
                    if (response.error != undefined)
                      showErrorMessage(response.error.description);
                    else property.initDocViewer();
                });
            }
        });
    };
    
    this.fixChangeTime = function(){
        this.last_change = utils.getNow();
    };
    
    this.checkChanges = function(){
        if ((this.mode === 2 || this.mode === 3) && (utils.getNow() - this.last_change > 600)){
            this.viewmode();
            this.unlock();
            clearInterval(this.changes_interval);
            utils.warningModal(localization.getVariable("warning_card_closed_after_600"));
        }
    };
    
    this.viewmode = function(){
        this.mode = 1;
        
        for (var i = 0; i < this.form_elements.length; i++){
            $('#'+this.form_elements[i]).attr("disabled", true);
        }
        
        for (var i = 0; i < this.form_elements_classes.length; i++){
            $('.'+this.form_elements_classes[i]).attr("disabled", true);
        }
        
        for (var i = 0; i < this.form_checkboxes.length; i++){
            $('#'+this.form_checkboxes[i]).iCheck('disable'); 
        }
        
        //app.customCheckbox();
        $('#save_button').hide();
        $('#edit_button').show();        
    };
    
    this.newmode = function(){
        $.post("/api/property/createtemporary.json",{
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
            else property.temporary_id = response;
            
            $('#photo_upload_input').fileupload({
                formData: {
                    property: property.temporary_id,
                    action: "photo"
                },
                start: function(){
                    $('#image_loader_div').show();
                },
                add: function(a,b){
                    $('#new_file_name_input').val(property.image_new_filename_prefix+b.originalFiles[0].name);
                    b.submit();
                },
                done: function (e, data) {
                    property.uploaded_doc_id = null;
                    property.uploaded_image_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    property.onPhotoOrDocChange("photo_upload", $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });

            $('#doc_upload_input').fileupload({
                options:{
                    maxFileSize: 1000000
                },
                formData: {
                    property: property.temporary_id,
                    action: "property_doc"
                },
                add: function(a,b){
                    $('#new_file_name_input').val(property.doc_new_filename_prefix+b.originalFiles[0].name);
                    
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
                    property.uploaded_image_id = null;
                    property.uploaded_doc_id = data.result;
                    uslider.reinit();
                    $('#image_loader_div').hide();
                    property.onPhotoOrDocChange("doc_upload", $('#new_file_name_input').val());
                    $('#file_upload_modal').modal("show");
               }
            });
        });
        
        for (var i = 0; i < this.form_buttons_to_block.length; i++)
            $('#'+this.form_buttons_to_block[i]).attr("disabled", true);
        
        $('#ascription_select').attr("disabled", false);
        this.editmode();
    };
    
    this.editmode = function(){ 
        this.mode = 2;
        
        for (var i = 0; i < this.form_elements.length; i++){
            $('#'+this.form_elements[i]).attr("disabled", false);
        }
        
        for (var i = 0; i < this.form_elements_classes.length; i++){
            $('.'+this.form_elements_classes[i]).attr("disabled", false);
        }
        
        for (var i = 0; i < this.form_checkboxes.length; i++){
            $('#'+this.form_checkboxes[i]).iCheck('enable'); 
        }
        
        /*if ($('#stock_check:checked').length > 0){
            $('#stock_check').iCheck('disable');
        }*/
        
        if (
                $('#stock_check:checked').length > 0 && 
                (this.data.stock_is_actual == 1 || 
                this.data.foreign_stock == 1 ||
                this.data.foreign_stock_changed == 1)
        ){
            $('#stock_check').iCheck('disable');
            $('#stock_check_wrapper')
                .addClass("animated_tip")
                .addClass("warning")
                .addClass("expand")
                .attr({
                    locale_data_title: "cant_remove_from_stock",
                    "data-title": localization.getVariable("cant_remove_from_stock")
                });
        }
        
        if ($('#stock_check:checked').length > 0 && this.data.collected == 1){
            $('#stock_check').iCheck('disable');
            $('#stock_check_wrapper')
                .addClass("animated_tip")
                .addClass("warning")
                .addClass("expand")
                .attr({
                    locale_data_title: "cant_remove_collected_from_stock",
                    "data-title": localization.getVariable("cant_remove_collected_from_stock")
                });
        }
        
        //app.customCheckbox();
        $('#save_button').show();
        $('#edit_button').hide();
        
        this.last_change = utils.getNow();
        
        if (this.newcard !== 1)
            this.changes_interval = setInterval("property.checkChanges()", 1000);
    };
    
    this.unlock = function(){
        $.post("/api/property/unlock.json",{
            iPropertyId: this.data.id
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
                //utils.successModal("Card copied. You can access it by button below.");
                $('#copy_success_modal .modal-body').html(localization.getVariable("card_copied_successfully"));
                $('#copy_success_modal').modal('show');
                $('#open_copied_card_a').attr("href", "property?id="+response+"&mode=collected&check=cancel");
            }
        });
    };
    
    this.comparison = function(){
        $('.modal-header #property_number_span, #property_number_for_print_span').html(this.data.id);
        $('#comparison_modal').modal("show");
        $('#comparison_table').hide();
        $('.comparison_loader').show();
        this.clients_parsed = [];
        this.clients = null;
        
        $.post("/api/client/getlistbyproperty.json",{
            property_id: this.data.id
        },function (response){
            property.clients = response.data;
            $('#comparison_table').show();
            $('.comparison_limits').hide();
            $('.comparison_loader').hide();
            $('#comparison_table td').parent().remove();
            $('#comparison_limits_count_span').text(property.clients.length);
            
            //####################### get and set last comparison date #######################//
            
            if (response.type == "last"){
                $.post("/api/propertycomplist/getlastdate.json",{
                    property: property.data.id
                },function (response){
                    if (response != null){
                        propcomp.last_date = response;
                        $('.comparison_brokering_date').show();
                        $('#comparison_last_brokering_date_span').text(utils.convertTimestampForDatepicker(response));
                        $('#comparison_modal_header_first_span')
                                .attr("locale", "last_comparison_clients_list")
                                .text(localization.getVariable("last_comparison_clients_list"));
                        $('#new_brokering_hint_span').show();
                    }

                    //clientcomp.propose();
                });
            }
            
            if (property.clients.length > 0){
                $('#mass_hide_comparison_button, #print_comparison_a, #comparison_delete_checked_button').attr("disabled", false);
                
                if (property.clients.length < response.total){
                    $('.comparison_limits').show();
                    $('#comparison_limits_total_span').text(response.total);
                }
                
                propcomp.generateList();
                $('#client_results_area').show();
                
                //####################### get and set last comparison date #######################//
                
                if (response.type == "last"){
                    $.post("/api/propertycomplist/getlastdate.json",{
                        property: property.data.id
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
            }
            else{
                $('#no_clients_warning').show();
                $('#comparison_table').hide();
                $('#mass_hide_comparison_button, #print_comparison_a, #comparison_delete_checked_button').attr("disabled", true);
                
                if (response.type == "last" && propcomp.refreshed == false){
                    propcomp.refreshed = true;
                    $('#no_clients_warning').hide();
                    propcomp.refresh();
                }
            }
        });
    };
    
    this.removeComparisonClient = function(array_key){
        var temp_array = [];
        
        for (var i = 0; i < this.clients.length; i++)
            if (i !== array_key)
                temp_array.push(this.clients[i]);
        
        this.clients = temp_array;
        this.clients_parsed = [];
        
        $('#comparison_table td').parent().remove();
            
        if (property.clients.length > 0){ 
            $('#client_results_area').show();

            for (var i = 0; i < property.clients.length; i++){
                var phones = "";
                var data = "";
                var data_for_print = "";

                if (property.clients[i].contact1 != ""){
                    data_for_print += property.clients[i].contact1+", ";
                    phones += '<span id="contact1_span" client_card="'+property.clients[i].id+'" class="card_phone_not_selected card_phone contact1" ondblclick="owl.phoneCall(this)">'+property.clients[i].contact1+'</span>';
                }
                if (property.clients[i].contact2 != ""){
                    data_for_print += property.clients[i].contact1+", ";
                    phones += ', <span id="contact2_span" client_card="'+property.clients[i].id+'" class="card_phone_not_selected card_phone" ondblclick="owl.phoneCall(this)">'+property.clients[i].contact2+'</span>';
                }
                if (property.clients[i].contact3 != ""){
                    data_for_print += property.clients[i].contact3+", ";
                    phones += ', <span id="contact3_span" client_card="'+property.clients[i].id+'" class="card_phone_not_selected card_phone" ondblclick="owl.phoneCall(this)">'+property.clients[i].contact3+'</span>';
                }
                if (property.clients[i].contact4 != ""){
                    data_for_print += property.clients[i].contact4+", ";
                    phones += ', <span id="contact4_span" client_card="'+property.clients[i].id+'" class="card_phone_not_selected card_phone" ondblclick="owl.phoneCall(this)">'+property.clients[i].contact4+'</span>';
                }

                if (property.clients[i].email != ""){
                    data += "@, ";
                    data_for_print += "@, ";
                }

                var types = JSON.parse(property.clients[i].property_types);
                for (var z = 0; z < types.length; z++){
                    data += "<span locale='"+property.form_options.property_type[types[z]]+"'></span>"+(z === types.length-1 ? "" : "/");
                    data_for_print += property.form_options.property_type[types[z]]+(z === types.length-1 ? "" : "/");
                }

                data += ',&nbsp;<span class="price">'+property.clients[i].price_from+'-'+property.clients[i].price_to+' '+property.form_options.currency[property.clients[i].currency_id]["symbol"]+'</span>';
                data_for_print += ", "+property.clients[i].price_from+'-'+property.clients[i].price_to+' '+property.form_options.currency[property.clients[i].currency_id]["symbol"]+", ";

                if (property.clients[i].rooms_from != 0 && property.clients[i].rooms_to != 0){
                    data += ',&nbsp;'+property.clients[i].rooms_from+'-'+property.clients[i].rooms_to+' <span locale="rooms_noregister_span">rooms</span>';
                    data_for_print += ', '+property.clients[i].rooms_from+'-'+property.clients[i].rooms_to+' rooms';
                }

                if (property.clients[i].home_size_dims != null && property.clients[i].home_size_from != null && property.clients[i].home_size_to != null && property.clients[i].home_size_to != 0){
                    data += ',&nbsp;<span locale="home_noregister_span">home</span> '+property.clients[i].home_size_from+'-'+property.clients[i].home_size_to+" "+property.form_options.dimension[property.clients[i].home_size_dims]["short_title"];
                    data_for_print += ', home '+property.clients[i].home_size_from+'-'+property.clients[i].home_size_to+" "+property.form_options.dimension[property.clients[i].home_size_dims]["short_title"];
                }

                if (property.clients[i].lot_size_dims != null && property.clients[i].lot_size_from != null && property.clients[i].lot_size_to != null && property.clients[i].lot_size_to != 0){
                    data += ',&nbsp;<span locale="lot_noregister_span">lot</span> '+property.clients[i].lot_size_from+'-'+property.clients[i].lot_size_to+" "+property.form_options.dimension[property.clients[i].lot_size_dims]["short_title"];
                    data_for_print += ', lot '+property.clients[i].lot_size_from+'-'+property.clients[i].lot_size_to+" "+property.form_options.dimension[property.clients[i].lot_size_dims]["short_title"];
                }

                //if (response.clients[i].street != ""){
                    //data += ',&nbsp;<span id="'+response.clients[i].street+'"></span>';
                    //placeDetailsByPlaceId(response.clients[i].street, service_route);
                //}

                //if (response.clients[i].street != "" && response.clients[i].house_number != 0)
                    //data += ',&nbsp;'+response.clients[i].house_number;

                //if (response.clients[i].street != "" && response.clients[i].house_number != 0 && response.clients[i].flat_number != 0)
                    //data += ',&nbsp;'+response.clients[i].flat_number;

                data += ',&nbsp;<span locale="agent_noregister_span">agent</span>: <span agent="'+property.clients[i].agent_id+'" class="card_agent"></span>';

                if (property.clients[i].last_updated != null){
                    data += ',&nbsp;<span locale="last_update">last update</span>: '+utils.convertTimestampForDatepicker(property.clients[i].last_updated);
                    data_for_print += ', last update: '+utils.convertTimestampForDatepicker(property.clients[i].last_updated);
                }
                else{ 
                    data += ',&nbsp;<span locale="created_noregister_span">created</span>: '+utils.convertTimestampForDatepicker(property.clients[i].timestamp);
                    data_for_print += ', created: '+utils.convertTimestampForDatepicker(property.clients[i].timestamp);
                }

                property.clients_parsed.push({id: property.clients[i].id, data: data_for_print});

                $('#comparison_table').show().append("<tr id='row_"+property.clients[i].id+"'><td id='timestamp_cell'>"+property.clients[i].id+"</td><td id='changes_cell'>"+phones+", "+data+"</td><td class='centered_td'><a href='client?id="+property.clients[i].id+"' target='_blank' type='button' locale='open_button' class='btn btn-primary comparison_delete_button'>Open</a><button onclick='property.removeComparisonClient("+i+")' type='button' locale='hide_button' class='btn btn-primary comparison_delete_button'>Hide</button></td><tr>");          
                $('#no_properties_warning').hide();
                //localization.toLocale();
            }

            $.post("/api/propertydoc/preparecomparisonforprint.json",{
                items: JSON.stringify(property.clients_parsed),
                property: property.data.id
            },function (response){
                if (response.error != undefined)
                  showErrorMessage(response.error.description);
                else $('#print_comparison_a').attr("href", "https://docs.google.com/viewer?url=http://topreal.top/storage/"+response)
            });

            $.post("/api/agency/getagentslist.json",{
            },function (result){
                for (var i = 0; i < result.length; i++){
                    if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                        $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                }
            });
        }
        else{
            $('#no_properties_warning').show();
            $('#comparison_table').hide();
        }
    };
    
    this.saveComparison = function(){
        /* if (!utils.isEmpty("agreement_number_input")){ // старый код, полноценный
            $.post("/api/property/checkagreement.json",{
                agreement: $('#agreement_number_input').val().trim()
            },function (response){
                if (response > 0)
                    $("#agreement_error_span").text("Agreement already exist!");
                else{
                    $("#agreement_error_span").text("");
                    property.propose();                
                    $('#save_comparison_button').attr("disabled", true);
                    $('#agreement_number_input').attr("disabled", true);
                    $('.comparison_delete_button').attr("disabled", true);
                }
            });
        } */ 
        
        property.propose(); // урезанный                
        $('#save_comparison_button').attr("disabled", true);
        $('#agreement_number_input').attr("disabled", true);
        $('.comparison_delete_button').attr("disabled", true);
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
            if (this.uploaded_doc_id != null){ // если документ
                $('#uploaded_doc_title_'+this.uploaded_doc_id).text($('#new_file_name_input').val().trim());
                
                $.post("/api/propertydoc/settitle.json",{
                    id: this.uploaded_doc_id,
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
            else{ // если изображение
                var image_id = null;
                
                for (var i = 0; i < imageviewer.thumbs.length; i++){
                    if (imageviewer.thumbs[i].image === this.uploaded_image_id){
                        image_id = imageviewer.thumbs[i].id;
                    }
                }
                
                $('#uploaded_image_title_'+image_id).text($('#new_file_name_input').val().trim());
                
                $.post("/api/photo/settitle.json",{
                    property: this.data != null ? this.data.id : this.temporary_id,
                    file: this.uploaded_image_id,
                    title: $('#new_file_name_input').val().trim()
                },function (response){
                    if (response.error != undefined){
                        showErrorMessage(response.error.description);
                    }
                    else{
                        $('#file_upload_modal').modal('hide');
                        showSuccess(localization.getVariable("image_successfully_uploaded"));
                    }
                });
            }
        }
        else{ 
            $('#new_file_name_input').focus();
        }
    };
    
    this.print = function(){
        $('.direction_check:checked').each(function(){
            $('#'+$(this).attr("id")+'_wrapper').removeClass("empty");
        });
        
        window.print();
    };
    
    this.printComparison = function(){
        $.post("/api/propertydoc/preparecomparisonforprint.json",{
            items: JSON.stringify(this.clients_parsed),
            property: this.data.id
        },function (response){
            if (response.error != undefined)
              showErrorMessage(response.error.description);
            //else console.log(response);
        });
    };
    
    this.showImportModal = function(){
        $('#import_modal').modal("show");
    };
    
    this.check = function(){
        if (this.data.error == undefined){
            $.post("/api/search/check.json",{
                object_type: "property",
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
                            location.href = "query?id="+response+"&response=list&property="+property.data.id;
                        }
                        else{
                            location.href = "query?id="+response+"&response=list";
                        }
                    }
                }
            });
        }
    };
    
    this.test = function(argument){
        $.post("/storage/import.php",{
            action: "test",
            address: argument
        },function (response){
            //console.log(response);
        });
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
        text += $('#price_input').val()+" ";
        text += $('#currency_select option:selected').text()+", ";
        text += $('#rooms_count_input').val()+" ";
        text += $('#rooms_count_input_label').text()+", ";     
        text += $('#label[locale="home_area_label"]').text()+" ";
        text += $('#homesize_input').val()+" ";
        text += $('#home_dims_select option:selected').text()+", ";
        text += $('#label[locale="lot_area_label"]').text()+" ";
        text += $('#lotsize_input').val()+" ";
        text += $('#lot_dims_select option:selected').text()+", ";
        text += $('#locality').val()+", ";
        text += $('#route').val()+", ";
        text += $('#house_input').val()+", ";
        text += $('#flat_input').val()+", ";
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
        if (property.data.last_propose.from > 0){
            $.post("/api/property/getpropositions.json",{
                id: urlparser.getParameter("id")
            },function (response){
                if (response.error != undefined)
                    utils.errorModal(response.error.description);

                $('#propositions_table tbody').html("");
                $('#propositions_modal').modal("show");
                
                for (var i = 0; i < response.length; i++){
                    $('#propositions_table').append('<tr><td class="proposition_agent" agent='+response[i].user+'></td><td>'+response[i].agreement+'</td><td>'+utils.convertTimestampForDatepicker(response[i].timestamp)+'</td></tr>');
                }
                
                $.post("/api/agency/getagentslist.json",{
                },function (result){
                    for (var i = 0; i < result.length; i++){
                        if ($('.proposition_agent[agent='+result[i].id+']').length !== 0)
                            $('.proposition_agent[agent='+result[i].id+']').text(result[i].name);
                    }
                });
            });
        }
    };
    
    this.showInOwl = function(){
        owl.showCardOnly("property", property.data.id);
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
    
    this.synonimNotConfirmed = function(input_id){ // срабатывает если создание синонима не подтверждено
        $('#'+input_id).val(""); 
        $('#'+input_id).focus();
        $('#new_synonim_warning_modal').modal("hide");
    };
    
    this.reinitImages = function(){
        $.post("/api/"+(this.data != null && this.data.stock == 1 ? "stock" : "property")+"/getphotos.json",{
            iPropertyId: this.data!= null ? this.data.id : property.temporary_id
        },function (response){
            imageviewer = new ImageViewer(response, 0);
            imageviewer.lockUploadButton();
            uslider.initImages();
        });
    };
    
    this.reinitDocs = function(){
        $.post("/api/"+(this.data != null && this.data.stock == 1 ? "stock" : "property")+"/getdocs.json",{
            iPropertyId: this.data!= null ? this.data.id : property.temporary_id
        },function (response){
            docviewer = new DocViewer(response);
            docviewer.lockUploadButton();
            uslider.initDocs();
        });
    };
    
    this.unlockNecessary = function(){
        if (this.neccesary === null){
            return 0;
        }
        
        var exist = 0;
        
        for (var i = 0; i < $('#properties_select').val().length; i++){
            if (
                    $('#properties_select').val()[i] == 3 || 
                    $('#properties_select').val()[i] == 7 ||
                    $('#properties_select').val()[i] == 9 || 
                    $('#properties_select').val()[i] == 11 ||
                    $('#properties_select').val()[i] == 14 ||
                    $('#properties_select').val()[i] == 17 ||
                    $('#properties_select').val()[i] == 20
                ){
                exist = 1;
            }
        }
        
        if (exist === 0 && this.neccesary.length === 4){
            this.neccesary.push("locality", "route", "house_input");
        }
        else if (exist === 1 && this.neccesary.length === 7){
            this.neccesary = this.neccesary.slice(0, 4);
        }
        
        this.setHouseNumFree();
    };
    
    this.onStatusChange = function(){
        if ($('#status_select').val() == 6 && this.neccesary !== null){
            this.neccesary_tmp = this.neccesary;
            this.neccesary = null;
        }
        else if (this.neccesary_tmp !== null){
            this.neccesary = this.neccesary_tmp;
            this.neccesary_tmp = null;
        }
        
        if ($('#status_select').val() == 5 || $('#status_select').val() == 7 || $('#status_select').val() == 9){
            this.stock_type = $('#status_select').val();
        }
    };
    
    this.setHouseNumFree = function(){
        var exist = 0;
        
        if (this.neccesary === null || this.neccesary.length === 4 || $('#status_select').val() == null){
            return 0;
        }
        
        for (var i = 0; i < $('#status_select').val().length; i++){
            if (
                    $('#status_select').val()[i] == 5 || 
                    $('#status_select').val()[i] == 7
                ){
                exist = 1;
            }
        }
        
        if (exist === 0 && this.neccesary.length === 6){
            this.neccesary.push("house_input");
        }
        else if (exist === 1 && this.neccesary.length === 7){
            this.neccesary = this.neccesary.slice(0, 6);
        }
    };
    
    this.unlockSaving = function(){
        $('#error_modal').modal("hide");
        this.block_saving = false;
        this.save();
        this.block_saving = true;
    };
    
    this.saveTested = function(){
        $('#error_modal').modal("hide");
        $('#status_select').val(6);
        this.onStatusChange();
        
        if (this.newcard === 1){
            this.create();
        }
        else {
            this.save();
        }
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
    
    this.changeStockType = function(type, a){
        this.stock_type = type;
        //$('#status_select').val(type);
        $('#stock_type_dropdown_ul').hide().children().children("a").css("background", "#fff");
        $(a).css("background", "rgba(223, 227, 234, 0.57)");
    };
    
    this.uncheckStock = function(){
        $('#stock_check').iCheck("check");
        $('#delete_stock_confirm_modal').modal("hide");
    };
    
    this.saveStockDeleted = function(){
        $('#delete_stock_confirm_modal').modal("hide");
        
        if (property.newcard === 1){
            property.create();
        }
        else{ 
            property.save();
        }
    };
    
    
    this.bindEnterEvents = function(){
        var events = {
            price_input: "property.saveOnEnter()",
            free_number_input: "property.saveOnEnter()",
            floors_from_input: "property.saveOnEnter()",
            floors_count_input: "property.saveOnEnter()",
            bathrooms_count_input: "property.saveOnEnter()",
            bedrooms_count_input: "property.saveOnEnter()",
            rooms_count_input: "property.saveOnEnter()",
            name_input: "property.saveOnEnter()",
            contact5_input: "property.saveOnEnter()",
            contact1_input: "property.saveOnEnter()",
            contact2_input: "property.saveOnEnter()",
            contact3_input: "property.saveOnEnter()",
            contact4_input: "property.saveOnEnter()",
            house_input: "property.saveOnEnter()",
            flat_input: "property.saveOnEnter()",
            homesize_input: "property.saveOnEnter()",
            lotsize_input: "property.saveOnEnter()",
            new_file_name_input: "property.setUploadedFileTitle()",
            event_title_input: "property.createCalendarEvent()"
        };

        for (var key in events){
            $('#'+key).attr({
                "data-onenter-func": events[key],
                onkeypress: "utils.onEnter(event, this)"
            });
        }
    };
    
    this.setCollectedLinks = function(){
        var disabled_counter = 0;
        
        if (this.data.external_id_hex != null && this.data.external_id_hex != undefined){ // yad2
            var subcat_id = this.data.yad2_subcat_id;
            
            if (this.data.ascription == 0){
                subcat_id = subcat_id != null ? subcat_id : 1;
                $('#collected_picture_a').attr("onclick", "window.open('http://www.yad2.co.il/Nadlan/ViewImage.php?CatID=2&SubCatID="+subcat_id+"&RecordID="+this.data.external_id_hex+"', '', 'width=865,height=700')");
            }
            else if (this.data.ascription == 1){
                subcat_id = subcat_id != null ? subcat_id : 2;
                $('#collected_picture_a').attr("onclick", "window.open('http://www.yad2.co.il/Nadlan/ViewImage.php?CatID=2&SubCatID="+subcat_id+"&RecordID="+this.data.external_id_hex+"', '', 'width=865,height=700')");
            }
        }
        else if (this.data.external_id_winwin != null && this.data.external_id_winwin != undefined){ // winwin
            $('#collected_picture_a').attr("onclick", "window.open('https://www.winwin.co.il/Pages/PopUpMedia.aspx?YMap=True&Img=True&Md=1&NsId=254&ObjId="+this.data.external_id_winwin+"', '', 'width=1000,height=700')");
            $('#collected_picture_a').attr("disabled", true).css("opacity", "1");
        }
        else{
            $('#collected_picture_a').attr("disabled", true).css("opacity", ".3");
            disabled_counter++;
        }
        
        if (this.data.stock == 1 && urlparser.getParameter("mode") != "view_stock" && this.data.foreign_stock == 0){
            $('#collected_open_stock_a').attr("href", "property?id="+this.data.id+"&mode=view_stock");
            $('#collected_open_stock_a').attr("disabled", true).css("opacity", "1");
        }
        else{
            $('#collected_open_stock_a').attr("disabled", true).css("opacity", ".3");
            disabled_counter++;
        }
        
        if (disabled_counter === 2){
            $('#collected_open_stock_a').parent().hide();
            $('.help_tip_span[locale_title="property_stock_hint"]').css("margin-left", "5px");
        }
        else{
            $('#collected_open_stock_a').parent().show();
        }
    };
    
    this.prepareAsync = function(property_id, search_id, search_type){
        urlparser.setParameter("id", property_id);
        urlparser.setParameter(search_type, search_id);
        
        $('input').val("");
        $('select').val("");
        $('textarea').val("");
        $('.icheck').iCheck("uncheck");
        
        this.get();
        this.initNavigationButtons();
        this.generateHeader();
        this.resetImagesAndDocs();
    };
    
    this.initNavigationButtons = function(){
        if ((property.search = urlparser.getParameter("search")) != undefined){
            var response_view = urlparser.getParameter("response") == "map" ? "map" : "list";

            if (urlparser.getParameter("search") === "default"){
                $('#back_button').attr("href", "query?response="+response_view);
                $('#to_search_button').attr("href", "query?response="+response_view);
            }
            else{
                $('#back_button').attr("href", "query?id="+property.search+"&response="+response_view);
                $('#to_search_button').attr("href", "query?id="+property.search+"&response="+response_view);
            }

            //$.post("/api/searchresponse/get.json",{
            //    search_id: property.search
            //},function (response){
                var response = null; 
                
                if (global_data.searchresponse_get != null){
                    response = global_data.searchresponse_get;
                }
                else if (global_data.listresponse_get != null){
                    response = {};
                    response.properties = global_data.listresponse_get.data;
                }
            
                if (response != null && response.properties.length > 1){ //  здесь нужно разобраться, код иногда косячит
                    for (var i = 0; i < response.properties.length; i++){
                        if (response.properties[i] == urlparser.getParameter("id") && i < response.properties.length-1){
                            $('#next_button').attr({
                                onclick: "property.prepareAsync("+response.properties[i+1]+", '"+this.search+"', 'search')",
                                href: "javascript:void(0)"
                            });
                        }
                        else if (response.properties[i] == urlparser.getParameter("id") && i === response.properties.length-1){
                            //$('#next_button').attr("href", "property?id="+response.properties[0]+"&search="+this.search);
                            $('#next_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("last_loop_property"));',
                                href: "javascript:void(0)"
                            });
                        }

                        if (response.properties[i] == urlparser.getParameter("id") && i > 0){
                            $('#previous_button').attr({
                                onclick: "property.prepareAsync("+response.properties[i-1]+", '"+this.search+"', 'search')",
                                href: "javascript:void(0)"
                            });
                        }
                        else if (response.properties[i] == urlparser.getParameter("id") && i === 0){
                            //$('#previous_button').attr("href", "property?id="+response.properties[response.properties.length-1]+"&search="+this.search);
                            $('#previous_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("first_loop_property"))',
                                href: "javascript:void(0)"
                            });
                        }
                    }
                }
                else{
                    $('#next_button').hide();
                    $('#previous_button').hide();
                }
                //$('#select_agent').val(property.data["agent_id"]);
            //});
        }
        else if (urlparser.getParameter("client") != undefined){
            $('#back_button').attr("href", "client?id="+urlparser.getParameter("client")+"&action=comparison");
            $('#comparison_button').attr("disabled", true);
            $('#comparison_events_a').css("opacity", ".3");
            property.client_from = urlparser.getParameter("client");

            $.post("/api/clientcomplist/getproperties.json", {
                client: property.client_from
            },function (response){
                if (response.data.length > 1){ //  здесь нужно разобраться, код иногда косячит
                    var clients = [];

                    for (var z = 0; z < response.data.length; z++){
                        if (utils.isJSON(response.data[z])){
                            clients.push(response.data[z]);
                        }
                    }

                    for (var i = 0; i < clients.length; i++){
                        if (clients[i].id == urlparser.getParameter("id") && i < clients.length-1){ // пока не конец списка
                            $('#next_button').attr("href", "property?id="+clients[i+1].id+"&client="+property.client_from);
                        }
                        else if (clients[i].id == urlparser.getParameter("id") && i === clients.length-1){ // елси конец списка
                            //$('#next_button').attr("href", "property?id="+clients[0].id+"&client="+property.client_from);
                            $('#next_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("last_loop_property"))',
                                href: "javascript:void(0)"
                            });
                        }

                        if (clients[i].id == urlparser.getParameter("id") && i > 0){ // если не начало списка
                            $('#previous_button').attr("href", "property?id="+clients[i-1].id+"&client="+property.client_from);
                        }
                        else if (clients[i].id == urlparser.getParameter("id") && i === 0){ // если начало списка
                            //$('#previous_button').attr("href", "property?id="+clients[clients.length-1].id+"&client="+property.client_from);
                            $('#previous_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("first_loop_property"))',
                                href: "javascript:void(0)"
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
        else if (urlparser.getParameter("client_events") != undefined){
            $('#back_button').attr("href", "client?id="+urlparser.getParameter("client_events")+"&action=comparison_events");
            $('#comparison_button').attr("disabled", true);
            $('#comparison_events_a').css("opacity", ".3");
            property.client_events_from = urlparser.getParameter("client_events");

            $.post("/api/propertycomp/geteventsforproperty.json", {
                client: property.client_events_from
            },function (response){
                if (response.length > 1){ //  здесь нужно разобраться, код иногда косячит
                    var properties = [];

                    for (var z = 0; z < response.length; z++){
                        if (utils.isJSON(response[z])){
                            properties.push(response[z]);
                        }
                    }

                    for (var i = 0; i < properties.length; i++){
                        if (properties[i].id == urlparser.getParameter("id") && i < properties.length-1){ // пока не конец списка
                            $('#next_button').attr("href", "property?id="+properties[i+1].id+"&client_events="+property.client_events_from);
                        }
                        else if (properties[i].id == urlparser.getParameter("id") && i === properties.length-1){ // елси конец списка
                            //$('#next_button').attr("href", "property?id="+properties[0].id+"&client_events="+property.client_events_from);
                            $('#next_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("last_loop_property"))',
                                href: "javascript:void(0)"
                            });
                        }

                        if (properties[i].id == urlparser.getParameter("id") && i > 0){ // если не начало списка
                            $('#previous_button').attr("href", "property?id="+properties[i-1].id+"&client_events="+property.client_events_from);
                        }
                        else if (properties[i].id == urlparser.getParameter("id") && i === 0){ // если начало списка
                            //$('#previous_button').attr("href", "property?id="+properties[properties.length-1].id+"&client_events="+property.client_events_from);
                            $('#previous_button').attr({
                                onclick: 'utils.warningModal(localization.getVariable("first_loop_property"))',
                                href: "javascript:void(0)"
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
        else if (urlparser.getParameter("mode") == "view_stock"){
            $('#back_button').attr("href", "property?id="+urlparser.getParameter("id"));
        }
        else if ((this.list = urlparser.getParameter("list")) != undefined){
            var response_view = urlparser.getParameter("response") == "map" ? "map" : "list";
            var response = null; 
            
            $('#back_button').attr("href", "query?list="+this.list);
            $('#to_search_button').attr("href", "query?list="+this.list);

            if (global_data.listresponse_get != null){
                response = {};
                response.properties = global_data.listresponse_get.data;
            }
            
            if (response != null && response.properties.length > 1){ //  здесь нужно разобраться, код иногда косячит
                for (var i = 0; i < response.properties.length; i++){
                    if (response.properties[i].id == urlparser.getParameter("id") && i < response.properties.length-1){
                        $('#next_button').attr({
                            onclick: "property.prepareAsync("+response.properties[i+1].id+", '"+this.list+"', 'list')",
                            href: "javascript:void(0)"
                        });
                    }
                    else if (response.properties[i].id == urlparser.getParameter("id") && i === response.properties.length-1){
                        $('#next_button').attr({
                            onclick: 'utils.warningModal(localization.getVariable("last_loop_property"));',
                            href: "javascript:void(0)"
                        });
                    }

                    if (response.properties[i].id == urlparser.getParameter("id") && i > 0){
                        $('#previous_button').attr({
                            onclick: "property.prepareAsync("+response.properties[i-1].id+", '"+this.list+"', 'list')",
                            href: "javascript:void(0)"
                        });
                    }
                    else if (response.properties[i].id == urlparser.getParameter("id") && i === 0){
                        $('#previous_button').attr({
                            onclick: 'utils.warningModal(localization.getVariable("first_loop_property"))',
                            href: "javascript:void(0)"
                        });
                    }
                }
            }
            else{
                $('#next_button').hide();
                $('#previous_button').hide();
            }
        }
        else{
            $('#back_button').hide();
            $('#to_search_button').hide();
            $('#next_button').hide();
            $('#previous_button').hide();
        }
    };
    
    this.resetImagesAndDocs = function(){
        $('#vip_content_wrapper_div').html("");
        
        for (var i = 0; i < 3; i++){
            $('#vip_content_wrapper_div').append(
                '<div class="gallery_element_box_empty">\n\
                    <div class="gallery_element_box_img_wrapper">\n\
                        <span locale="no_image">'+localization.getVariable("no_image")+'</span>\n\
                    </div>\n\
                </div>'
            );
        }
    };
    
    this.addToEvents = function(event){
        $('#to_events_modal').modal("show");
        
        property_event.reinit();
        property_event.setEvent(event);
        var event_title = this.data["contact1"]+" "+(event != "event_notification" ? localization.getVariable(event) : "");
        
        $('#add_event_title_input').val(event_title);
        $('#to_event_modal').modal('show');
    };
}