var localization = new Localization();
var server_origin = "localhost:8080";
var utils = new Utils();
var urlparser = new URLparser();
var user = new User();
var synonim = new Synonim("search");
var ac_synonim = new AutocompleteSynonim("search");
var ac = new Autocomplete("search"); // ac, т.к. autocomlete где-то уже используется
var exinput_sii = new ExternalInputSII();
var exinput_ii = new ExternalInputII();
var exinput_ss = new ExternalInputSS();
var help_tip = new HelpTip();
var owl = new Owl();
var response_map = new ResponseMap();
var response_list = new ResponseList();
var subscription = new Subscription();
var stock = new Stock();
var search = new Search();
var query_form_options = {};
var response_type = urlparser.getParameter("response") != undefined ? urlparser.getParameter("response") : null;
var tools = new Tools();
var contact = new Contact();

/*$(window).bind('beforeunload',function(){
   if (response_list.property_phones.length > 0 || response_list.client_phones.length > 0){
        alert("456");
        return;
    }
});*/

$(document).click(function(e){
    var target = $(e.target);
    
    if (
            !target.is('#'+search.focused_input_id) && 
            !target.is('#'+search.showed_multiselect_id) && 
            !target.is('#'+search.showed_multiselect_id+' option')
    ){
        $('.hidden_select').hide();
        search.focused_input_id = null;
        search.showed_multiselect_id = null;
        //$('#'+search.showed_multiselect_id).hide();
    }
    
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
    
    /*if ( //  сокрытие поля ввода улицы при блёре
            !target.is('#street_buttons_block')
            && !target.is('#streets_select_wrapper')
            && !target.is('#route_wrapper_div')
            && !target.is('#add_street_button_wrapper_div')
            && !target.is('#route_input') 
            && !target.is('#route') 
            && !target.is('#add_street_button')
            && !target.is('.ui-autocomplete-input')
            && !target.is('.synonim-container')
            && !target.is('.synonim-item')
            && !target.is('.synonim-icon')
            && !target.is('.synonim-item-query')
            && !target.is('.synonim-matched')
            && !target.is('.synonim_logo')
            && !target.is('#list_search_button')
            && !target.is('.fa-search')
            && !target.is('#search_button_text')
            && !target.is('.tagit-label')
            && !target.is('.tagit-choice')
            && !target.is('.ui-icon')
            && !target.is('#street_wrapper')
            && !target.is('.tagit-new')
            && !target.is('#street_not_selected_error')
    ){ 
        $('#street_buttons_block').hide();
    }*/
    
    if (
            !target.is('.external_input') && 
            !target.is('.external_input select') &&
            !target.is('.external_input input') &&
            !target.is('.external_input_input') &&
            !target.is('.external_input_ii') &&
            !target.is('.external_input_ii input') &&
            !target.is('.external_input_ss') && 
            !target.is('.external_input_ss select') &&
            // datepicker controls
            !target.is('.external_input_ss select') &&
            !target.is('.ui-datepicker-days-cell-over') &&
            !target.is('.ui-state-default') &&
            !target.is('.ui-datepicker-next') &&
            !target.is('.ui-datepicker-prev') &&
            !target.is('.ui-icon')
    ){
        exinput_sii.hide();
        exinput_ii.hide();
        exinput_ss.hide();
    }
});

$(document).ajaxStop(function() {
    search.multiSelectToInput("properties_select", "properties_input");
    search.multiSelectToInput("status_select", "status_input");
    response_list.createEmail();
    utils.setSelectsOverflows(search.overflowed_selects);
    //localization.toLocale();
});

function Search(){
    this.data = null;
    this.geoloc = {}; 
    this.geoloc.street = [];
    this.geoloc.street_objects = [];
    this.geoloc.city_locales = []; // названия города на всех локалях (для поиска по городу)
    this.current_city = null; // текущий город для предустановленных контуров
    this.temporary_id = null;
    this.temporary_title = null;
    this.mode = 1; // 1 - new, 2 - edit
    this.neccesary = [
        "ascription_select",
        "country"
    ];
    this.overflowed_selects = [
        "geo_mode_select",
        "object_type_select",
        "history_select",
        "special_by_select"
    ];
    this.geo_mode = 1;
    this.streets_mode = 1; // 1 - ac, 2 - synonim
    this.defaults = {};
    this.response_type = urlparser.getParameter("response") != undefined ? urlparser.getParameter("response") : "list";
    //this.stock = 0; // флаг, состояние стока. берется из дифолта (только для нового поиска) и сохраняется при каждом изменении туда
    this.saved_lists = null;
    this.list_expanded = false;
    this.external_not_ordered = false;
    this.external_property_for_comparison = null; // сюда пишем недвижимость для сравнения при сборе и проверке по номеру телефона
    
    this.setupQueryForm = function(){
        localization.init();
        subscription.init();
        app.customCheckbox();
        //autosize($('#route'));
        help_tip.initInapp();
        $('#route').next().css("margin-right", "-19px");
        help_tip.remove("synonim_route");
        stock.init();
        stock.setDefaults();
        $('.feedback').feedback();
        this.clearing();
        this.bindEnterEvents();
        
        /*$.post("/api/defaults/getlocale.json",{
        },function (response){
            search.defaults.locale = response;
        });*/
        
        search.defaults.locale = global_data.defaults_getlocale;
        
        /*$.post("/api/defaults/getsac.json",{
        },function (response){
            if (response == 1){
                $('#synonim_cant_see_alert').hide();
                $('#synonim_cant_see_alert_tip').show();
            }
            else{
                $('#synonim_cant_see_alert').show();
                $('#synonim_cant_see_alert_tip').hide();
            }
        });*/
        
        if (global_data.defaults_getsac == 1){
            $('#synonim_cant_see_alert').hide();
            $('#synonim_cant_see_alert_tip').show();
        }
        else{
            $('#synonim_cant_see_alert').show();
            $('#synonim_cant_see_alert_tip').hide();
        }
        
        /*$.post("/api/defaults/getstock.json",{
        },function (response){
            if (response == 1){
                $('#stock_check').iCheck("check");
            }
        });*/
        
        if (global_data.defaults_getstock == 1){
            $('#stock_check').iCheck("check");
        }
        
        //############## get contours list ###############################//
        
        //$.post("/api/contour/list.json", {
        //    search: search.data != null ? search.data.id : search.temporary_id
        //}, function (response){
            var response = global_data.contour_list;
        
            if (response.length > 0){
                $('#contour_select > .old').remove();

                for (var i = 0; i < response.length; i++){
                    if (response[i].temporary == 0){
                        $('#contour_select').append('<option class="old" value="'+response[i].id+'">'+response[i].title+'</option>');
                    }
                }

                $('#contour_select').val(-1);
            }
        //});
        
        //############## getting form options ############################//
        
        //$.post("/api/search/getqueryformoptions.json",{
        //},function (response){
            var response = global_data.search_getqueryformoptions;
        
            if (response.error != undefined)
                $('#error_'+response.error.code).show();
            else{
                query_form_options = response;
                
                // получение данных для формы поиска
                for (var key in query_form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < query_form_options[key].length; i++){
                                $('#ascription_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                            }
                            
                            $('#ascription_select').append("<optgroup label='"+localization.getVariable("realtors_in_sources")+"'></optgroup>");
                            $('#ascription_select > optgroup').append("<option value='4'>"+localization.getVariable("sale")+"</option>");
                            $('#ascription_select > optgroup').append("<option value='5'>"+localization.getVariable("rent")+"</option>");
                            $('#ascription_select > optgroup option, #ascription_select > optgroup').css("background", "#ffd39e");
                        break;
                        case "status":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#status_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                            
                            if (user.isGuest()){
                                $('#status_select > option[value=8]').attr("disabled", true);
                            }
                        break;    
                        case "property_type":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#properties_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                        break;
                        
                        case "dimension":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#object_size_dims_select').append("<option locale='"+query_form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i]["locale"])+"</option>");
                        break;
                        case "history_type":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#history_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                            
                            $('#history_select option[locale="proposed"]').hide();
                            $('#history_select').append("<option locale='agreement_option_label' value='9'>"+localization.getVariable("agreement_option_label")+"</option>");
                            
                            /*$.post("api/user/getmytype.json", {}, function (response){
                                if (response == 0 || response == 2){
                                    $('#history_select').append("<option locale='agent_label' value='7'></option>"); 
                                }
                            });*/
                        break;
                        case "currency":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#currency_select').append("<option value='"+i+"'>"+query_form_options[key][i]["symbol"]+"</option>");
                        break;
                    }

                }
                
                // получение данных для быстрой недвиж
                for (var key in query_form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_ascription_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                        break;
                        case "status":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_status_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                            
                            if (user.isGuest()){
                                $('#qp_status_select > option[value=8]').attr("disabled", true);
                            }
                        break;    
                        case "property_type":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_properties_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                        break;
                        case "currency":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_currency_select').append("<option value='"+i+"'>"+query_form_options[key][i]["symbol"]+"</option>");
                        break;
                        case "view":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_view_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                        break;
                        case "dimension":
                            for (var i = 0; i < query_form_options[key].length; i++){
                                $('#qp_home_dims_select').append("<option locale='"+query_form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i]["locale"])+"</option>");
                                $('#qp_lot_dims_select').append("<option locale='"+query_form_options[key][i]["locale"]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i]["locale"])+"</option>");
                                
                                if ($('#qp_home_dims_select').val() == -1){
                                    $('#qp_home_dims_select').val(5);
                                }
                                
                                if ($('#qp_lot_dims_select').val() == -1){
                                    $('#qp_lot_dims_select').val(5);
                                }
                            }
                        break;
                        case "direction":
                            for (var i = 0; i < query_form_options[key].length; i++)
                                $('#qp_directions_select').append("<option locale='"+query_form_options[key][i]+"' value='"+i+"'>"+localization.getVariable(query_form_options[key][i])+"</option>");
                        break;
                    }

                }
                
                exinput_sii.parseAll();
                
                if (urlparser.getParameter("id") != undefined){
                    search.get();
                }
                else if (urlparser.getParameter("list") != undefined){
                    $('#history_dates_input_from').datepicker({ 
                        dateFormat: "dd/mm/yy",
                        onSelect: function(){
                            search.lightNotEmpty();
                        }
                     });

                    $('#history_dates_input_to').datepicker({ 
                        dateFormat: "dd/mm/yy",
                        onSelect: function(){
                            search.lightNotEmpty();
                        }
                    });
                    search.list_id = urlparser.getParameter("list");
                    search.getList();
                }
                else{
                    $('#history_dates_input_from').datepicker({ 
                        dateFormat: "dd/mm/yy",
                        onSelect: function(){
                            search.lightNotEmpty();
                        }
                     });

                    $('#history_dates_input_to').datepicker({ 
                        dateFormat: "dd/mm/yy",
                        onSelect: function(){
                            search.lightNotEmpty();
                        }
                    });
                }
                
                //############## getting common user defaults ##########################//
        
                //$.post("/api/search/getempty.json",{
                //},function (response){
                    var response = global_data.search_getempty;
                    
                    search.defaults.search = response;
                    
                    if (search.data == null || search.data.currency == null){
                        $('#currency_select').val(response["currency"]);
                    }
                    
                    if (search.data == null || search.data.object_dimensions == null){
                        $('#object_size_dims_select').val(response["object_dimensions"]);
                    }
                    
                    if (urlparser.getParameter("id") == undefined){
                        $('#my_last_search_span').show();
                        $('#no_name_span').hide();
                        $('#draw_new_button').click(function(){
                            utils.warningModal(localization.getVariable("find_to_draw_contour_warnning"));
                        });
                        
                        for (var key in response){
                            if (response[key] != null){
                                switch (key) {
                                    case "country":
                                        if ($('#country').val().trim().length === 0){
                                            placeDetailsByPlaceId(response[key], service_country, $('#country'));
                                            search.geoloc.country = response[key];
                                        }
                                    break;
                                    case "city":
                                        if ($('#locality').val().trim().length === 0){
                                            placeDetailsByPlaceId(response[key], service_city, $('#locality'));
                                            search.geoloc.city = response[key];
                                            ac.getCityLocales(response[key]);
                                            search.current_city = response[key];
                                        }
                                    break;
                                    case "lat":
                                        if (search.geoloc.lat == undefined){
                                            search.geoloc.lat = response[key];
                                        }
                                    break;
                                    case "lng":
                                        if (search.geoloc.lng == undefined){
                                            search.geoloc.lng = response[key];
                                        }
                                    break;
                                    case "neighborhood":
                                        placeDetailsByPlaceId(response[key], service_neighborhood, $('#neighborhood'));
                                    break;
                                    case "street":
                                        $('#geo_mode_select').val(1);
                                        search.changeGeoMode();
                                        help_tip.remove("streets_mode_help_tip_span");

                                        var obj = JSON.parse(response[key]);

                                        for (var i = 0; i < obj.length; i++){
                                            streetDetailsByPlaceId(obj[i], service_route);
                                        }

                                        search.geoloc.street = obj;
                                    break;
                                    case "contour":
                                        $('#geo_mode_select').val(2);
                                        search.changeGeoMode();
                                        $('#contour_select').val(response[key]);
                                        
                                        if ($('#contour_select').val() == null){
                                            $('#contour_select').val(0);
                                        }
                                    break;
                                    case "ascription":
                                        $('#ascription_select').val(response[key]);
                                    break;
                                    case "status":
                                        $('#status_select').val(JSON.parse(response[key]));
                                        //console.log($('#status_select option:selected').text());
                                        search.multiSelectToInput("status_select", "status_input");
                                        //console.log($('#status_input').val());
                                    break;
                                    /*case "agent":
                                        //$.post("/api/agency/getagentslist.json",{
                                        //},function (response){
                                            var response = global_data.agency_getagentslist;
                                        
                                            $('#select_agent > option').remove();
                                            
                                            for (var i = 0; i < response.length; i++){
                                                $('#select_agent').append("<option value="+response[i].id+">"+response[i].name+"</option>")
                                            }
                                            
                                            $('#select_agent').val(0);
                                            user.lockAgentSelect();
                                            //$('#select_agent').val(search.data["agent"]);
                                            //$('#select_agent_wrapper').show();
                                            //$('#history_wrapper').hide();
                                            //$('#history_select').val(7);
                                        //});
                                    break;*/
                                    case "property":
                                        $('#properties_select').val(JSON.parse(response[key]));
                                        //console.log($('#properties_select option:selected').text());
                                        search.multiSelectToInput("properties_select", "properties_input");
                                    break;
                                    case "currency":
                                        $('#currency_select').val(response[key]);
                                    break;
                                    case "price_from":
                                        $('#price_from_input').val(response[key]);
                                        search.onPriceFromKeyUp();
                                    break;
                                    case "price_to":
                                        $('#price_to_input').val(response[key]);
                                        search.onPriceToKeyUp();
                                    break;
                                    case "history_type":
                                        $('#history_select').val(response[key]);
                                        $('#history_dates_input_from').val(response["history_from"] != 0 && response["history_from"] != null ? utils.convertTimestampForDatepicker(response["history_from"]) : "");
                                        $('#history_dates_input_to').val(response["history_to"] != 0 && response["history_to"] != null ? utils.convertTimestampForDatepicker(response["history_to"]) : "");

                                        $('#history_dates_input_from').datepicker({ 
                                            dateFormat: "dd/mm/yy",
                                            onSelect: function(){
                                                search.lightNotEmpty();
                                            }
                                         });

                                        $('#history_dates_input_to').datepicker({ 
                                            dateFormat: "dd/mm/yy",
                                            onSelect: function(){
                                                search.lightNotEmpty();
                                            }
                                        });
                                    break;
                                    case "history_interval":
                                        var now = utils.getNow();
                                        var date_from = now-response[key];

                                        $('#history_dates_input_from').val(utils.convertTimestampForDatepicker(date_from));
                                        $('#history_dates_input_to').val(utils.convertTimestampForDatepicker(now));
                                    break;
                                    case "free_number_from":
                                        $('#free_number_input_from').val(response[key]);
                                    break;
                                    case "free_number_to":
                                        $('#free_number_input_to').val(response[key]);
                                    break;
                                    case "rooms_type":
                                        $('#rooms_type_select').val(response[key]);
                                    break;
                                    case "rooms_from":
                                        $('#rooms_input_from').val(response[key]);
                                    break;
                                    case "rooms_to":
                                        $('#rooms_input_to').val(response[key]);
                                        //$('#rooms_input_slider').attr("data-slider-value", "["+response["iRoomsFrom"]+","+response["iRoomsTo"]+"]");
                                    break;
                                    case "object_dimensions":
                                        $('#object_size_dims_select').val(response[key]);
                                    break;
                                    case "object_type":
                                        $('#object_type_select').val(response[key]);
                                    break;
                                    case "object_size_from":
                                        $('#object_size_input_from').val(response[key]);
                                    break;
                                    case "object_size_to":
                                        $('#object_size_input_to').val(response[key]);
                                    break;
                                    case "age_from":
                                        $('#age_input_from').val(response[key]);
                                    break;
                                    case "age_to":
                                        $('#age_input_to').val(response[key]);
                                    break;
                                    case "floors_from":
                                        $('#floors_input_from').val(response[key]);
                                    break;
                                    case "floors_to":
                                        $('#floors_input_to').val(response[key]);
                                    break;
                                    case "furniture":
                                        $('#furniture_select').val(response[key]);
                                    break;
                                    case "parking":
                                        $('#parking_advopt_check').iCheck('check');
                                    break;
                                    case "no_last_floor":
                                        $('#nolastfloor_advopt_check').iCheck('check');
                                    break;
                                    case "no_ground_floor":
                                        $('#nogroundfloor_advopt_check').iCheck('check');
                                    break;
                                    case "facade":
                                        $('#front_advopt_check').iCheck('check');
                                    break;
                                    case "elevator":
                                        $('#elevator_advopt_check').iCheck('check');
                                    break;
                                    case "air_cond":
                                        $('#aircond_advopt_check').iCheck('check');
                                    break;
                                    case "project":
                                        $.post("/api/agency/getprojectslist.json",{
                                        },function (response){
                                            for (var i = 0; i < response.length; i++)
                                                $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>")

                                            $('#select_project').val(search.defaults.search["project"]);
                                        });
                                    break;
                                    case "special_by":
                                        $('#special_argument_input').attr("disabled", false);
                                        $('#special_query_button').attr("disabled", false).show();
                                        //$('#list_search_button').attr("disabled", true);
                                        //$('#map_search_button').attr("disabled", true);
                                        $('#special_by_select').val(response[key]);
                                    break;
                                    case "special_argument":
                                        if (response["special_by"] != 5){
                                            $('#special_argument_input').val(response[key]);
                                        }
                                        else{
                                            $('#special_argument_input').attr("disabled", true);
                                            $('#special_query_button').attr("disabled", true).hide();
                                        }
                                    break;
                                    case "timestamp":
                                        $('#my_last_search_span > .search_date').text("("+utils.convertTimestampToDateTime(response[key])+")");
                                    break;
                                    case "default_search":
                                        if (response[key] == 1){
                                            $('#no_name_span, #my_last_search_span').hide();
                                            $('#my_first_search_span').show();
                                        }
                                    break;
                                }
                            }
                        }

                        falseGeolocateByLatLng(search.geoloc.lat, search.geoloc.lng);
                        //initMap(Number(search.geoloc.lat), Number(search.geoloc.lng));
                        
                        exinput_ii.parseAll();
                        exinput_sii.parseAll();
                        //localization.toLocale();
                        //response_map.showButtons();
                        //$('#switch_to_list_button').hide();
                    }
                    
                    if (response_type == "map"){
                        response_map.init();
                    }
                    else{
                        response_list.init();
                    }
                    
                    //if (urlparser.getParameter("id") == undefined){
                        //response_list.get(search.defaults.search.id);
                    //}
                //});
            }
        //});
        
        if (urlparser.getParameter("id") == undefined){ // объект поиска не задан (созадние новой карточки)
            //$.post("/api/agency/getagentslist.json",{
            //},function (response){
                var response = global_data.agency_getagentslist;
            
                $('#select_agent > option').remove();
                
                for (var i = 0; i < response.length; i++){
                    $('#select_agent').append("<option value="+response[i].id+">"+response[i].name+"</option>");
                }
                
                $('#select_agent').val(0);
                user.lockAgentSelect();
            //});

            /*$.post("/api/agency/getprojectslist.json",{
            },function (response){
                for (var i = 0; i < response.length; i++)
                    $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>");
            });*/
            
            this.newmode();
        }
        
        //if (this.newcard == 0 )$('#route_input').tagit("destroy");
        $('#route_input').tagit({
            allowSpaces: true,
            beforeTagRemoved: function(event, ui) {
                search.removeStreet(ui.tag.attr("id"));
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

        /*$('#route_input input').focus(function(){
            geolocate(); 
            search.showStreetBlock();
        }).keypress(function (evt) {
            evt.preventDefault();
        });*/
        
        $('#synonim_cant_see_alert').on('close.bs.alert', function(){
            $('#synonim_cant_see_alert_tip').show();
            
            $.post("/api/defaults/set.json",{
                parameter: "synonim_alert_closed",
                value: 1
            }, null);
        });
        
        $('#history_select').change(function(){
            if ($('#history_select').val() == 9){
                $('#free_number_wrapper').show();
                $('#history_wrapper, #select_agent_wrapper').hide();
            }
            /*else if ($('#history_select').val() == 7){
                $('#select_agent_wrapper').show();
                $('#history_wrapper, #free_number_wrapper').hide();
            }*/
            else{
                $('#history_wrapper').show();
                $('#free_number_wrapper, #select_agent_wrapper').hide();
            }
        });
        
        $('#list_search_button').click(function(){
            /*if (search.geoloc.city === undefined && $('#locality').val().trim().length > 0){
                $('#city_not_selected_error').show();
                $('#locality').focus();
                return 0;
            }*/
            
            /*if (search.data == null && search.geoloc.street === undefined && $('#route').val().trim().length > 0 && synonim.current_selected.route == null){
                $('#street_not_selected_error').show();
                $('#route').focus();
                return 0;
            }*/
            
            search.find();
        });
        
        $('#special_query_button').click(function(){
            search.findSpecial();
        });
        
        $('#map_search_button').click(function(){
            if (search.temporary_id !== null)
                search.map();
            else search.updateMap();
        });
        
        $('#properties_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            search.multiSelectToInput('properties_select', 'properties_input');
        });
        
        $('#status_select').mousedown(function(e){
            e.preventDefault();
            var select = this;
            var scroll = select.scrollTop;
            e.target.selected = !e.target.selected;
            setTimeout(function(){select.scrollTop = scroll;}, 0);
            $(select).focus();
        }).mousemove(function(e){
            e.preventDefault();
        }).mouseup(function(){
            search.multiSelectToInput('status_select', 'status_input');
        });
        
        var a = new Date();
        
        for (var i = 0; i < 100; i++){
            $('#age_input_from').append("<option value="+(a.getFullYear()-i)+">"+(a.getFullYear()-i)+"</option>");            
        }
        
        for (var i = 0; i < 110; i++){
            $('#age_input_to').append("<option value="+(a.getFullYear()+10-i)+">"+(a.getFullYear()+10-i)+"</option>");
        }
        
        $('#import_contours_select_input').fileupload({
            formData:{
                action: "contours"
            },
            add: function(a,b){
                //$('#import_spinner_i').show();
                b.submit();
            },
            done: function (e, data) {
                $('#import_contours_done_span').show();
                //$('#import_spinner_i').hide();
           }
        });
        
        if (this.response_type == "map"){
            $('#search_form_toggler').hide();
        }
        
        $("#saved_contours_modal .modal-content")
            .draggable({
                handle: ".draggable_header"
            })
            .resizable();

        /*$.post("/api/agency/getexternalstatus.json", null, function (response){
            if (response == 1){ // заказано и НЕ гость
                $('#external_checks_wrapper').show();
                
                if (urlparser.getParameter("id") == undefined){
                    $('#yad2_check, #winwin_check').attr("checked", true);
                }
            }
            else if (response == 2){ // НЕ заказано и НЕ гость
                $('#external_checks_wrapper').show();
                search.external_not_ordered = true;
            }
            else{ // гость
                $('#external_checks_wrapper').hide();
            }
        });*/
        
        $.post("/api/permission/is.json",{
            action: "use_data_collecting"
        },function (response){
            response_list.collecting_forbidden = response;
        });
        
        $('.search_form_wrapper input').change(function(){
            search.lightNotEmpty();
        });
        
        $('.search_form_wrapper select').click(function(){            
            search.lightNotEmpty();
        });
        
        $('.search_form_wrapper .icheck').on("ifClicked", function(event){
            search.lightNotEmpty();
        });
        
        $('#switch_to_list_button').click(function(){
            utils.htmlSpinner("switch_to_list_button");
        });
        
        $('#locale_select').unbind("change").change(function(){
            if (response_list.property_phones.length > 0 || response_list.client_phones.length > 0){
                $('#selected_on_unload_modal').modal("show");
                
                return;
            }
            
            localization.changeLocale($(this).val());
        });
    };
    
    this.initStockCheckbox = function(){ // инициализирует чек стока, нужна потому как вызывается поздно и везде
        $('#stock_check').on("ifToggled", function(event){
            if (search.data == null && search.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if (search.data == null){
                return 0;
            }
            
            if (search.data.type == 1){
                if (search.temporary_id !== null){
                    search.query();
                }
                else{ 
                    search.updateList();
                }
            }
            else if (search.data.type == 2){
                if (search.temporary_id !== null){
                    search.specialQuery();
                }
                else{ 
                    search.updateSpecial();
                }
            }
        });
        
        $('#yad2_check, #winwin_check').on("ifToggled", function(event){
            if (search.external_not_ordered == true){
                $('#external_not_ordered_modal').modal("show");
                return false;
            }
            
            if (search.data == null){
                return false;
            }
            
            if (search.data.type == 1){
                if (search.temporary_id !== null){
                    search.query();
                }
                else{ 
                    search.updateList();
                }
            }
            else if (search.data.type == 2){
                if (search.temporary_id !== null){
                    search.specialQuery();
                }
                else{ 
                    search.updateSpecial();
                }
            }
        });
    };
    
    this.find = function(){ // выполняет поиск по заданным параметрам
        utils.htmlSpinner("list_search_button");
        exinput_sii.hide();
        exinput_ii.hide();
        exinput_ss.hide();
        
        $('#client_results_area').hide();
        
        if (this.temporary_id !== null){
            this.query();
        }
        else{ 
            this.updateList();
        }
    };
    
    this.findSpecial = function(){ // выполняет Спец. поиск
        utils.htmlSpinner("special_query_button");
        
        if (this.temporary_id !== null){
            this.specialQuery();
        }
        else{ 
            this.updateSpecial();
        }
    };
    
    this.editTitle = function(search_id){
        $('#search_'+search_id+'_title_span').hide();
        $('#search_'+search_id+'_title_input').show();
        $('#search_'+search_id+'_title_save_button').show();
        $('#search_'+search_id+'_title_edit_button').hide();
    };
    
    this.saveTitle = function(search_id){
        var title = $('#search_'+search_id+'_title_span').text();
        $('#search_name_input').val(title);
        this.setTitle();
        
        if (this.data != null){
            if (this.data.id != search_id){
                $.post("/api/search/delete.json",{
                    id: search_id
                },function (response){
                    if (response.error != undefined){
                        showErrorMessage(response.error.description);
                    }
                });
            }
        }
        else{
            $.post("/api/search/delete.json",{
                id: search_id
            },function (response){
                if (response.error != undefined){
                    showErrorMessage(response.error.description);
                }
            });
        }
    };
    
    this.delete = function(search_id){
        $.post("/api/search/delete.json",{
            id: search_id
        },function (response){
            if (response.error != undefined)
                 showErrorMessage(response.error.description);
            else{
                $('#search_'+response+'_delete_button').hide();
                $('#search_'+response+'_restore_button').show();
            }
        });
    };
    
    this.restore = function(search_id){
        $.post("/api/search/restore.json",{
            id: search_id
        },function (response){
            if (response.error != undefined)
                 showErrorMessage(response.error.description);
            else{
                $('#search_'+response+'_delete_button').show();
                $('#search_'+response+'_restore_button').hide();
            }
        });
    };
    
    this.deleteList = function(list_id){
        $.post("/api/responselist/delete.json",{
            id: list_id
        },function (response){
            if (response.error != undefined){
                showErrorMessage(response.error.description);
            }
            else{
                $('#list_'+response+'_delete_button').hide();
                $('#list_'+response+'_restore_button').show();
            }
        });
    };
    
    this.restoreList = function(list_id){
        $.post("/api/responselist/restore.json",{
            id: list_id
        },function (response){
            if (response.error != undefined){
                showErrorMessage(response.error.description);
            }
            else{
                $('#list_'+response+'_delete_button').show();
                $('#list_'+response+'_restore_button').hide();
            }
        });
    };
    
    this.getSearchesList = function(){
        $.post("/api/search/list.json",{
        },function (response){
            $('#searches_list_table tbody').html("");
            
            if (response.length === 0){
                $('#searches_list_table').hide();
                $('#saved_searches_modal .no_results').show();
            }

            for (var i = 0; i < response.length; i++){
                $('#searches_list_table').append('<tr '+(response[i].default_search == 1 ? "class='hl_yellow_light'" : "")+'>\n\
                    <td>\n\
                        <span class="search_agent_span" agent="'+response[i].author+'"></span>\n\
                    </td>\n\
                    <td>\n\
                        <span id="search_'+response[i].id+'_title_span">'+response[i].title+'</span>\n\
                        <input id="search_'+response[i].id+'_title_input" onkeypress="utils.onEnter(event, this)" data-onenter-func="search.saveTitle('+response[i].id+')" maxlength="20" value="'+response[i].title+'" style="display:none;width:100%;" />\n\
                    </td>\n\
                    <td style="text-align:center">\n\
                        <button id="search_'+response[i].id+'_title_save_button" onclick="search.saveTitle('+response[i].id+')" type="button" style="display:none;" class="btn btn-primary">\n\
                            <i class="fa fa-floppy-o"></i>\n\
                        </button>\n\
                        <button id="search_'+response[i].id+'_title_edit_button" onclick="search.editTitle('+response[i].id+')" type="button" style="'+((user.id != response[i].author && (user.type == 3 || user.type == 1)) || response[i].default_search == 1 ? "display:none" : "")+'" class="btn btn-primary">\n\
                            <i class="icon-pencil"></i>\n\
                        </button>\n\
                        <button id="search_'+response[i].id+'_delete_button" onclick="search.delete('+response[i].id+')" type="button" style="'+((user.id != response[i].author && (user.type == 3 || user.type == 1)) || response[i].default_search == 1 ? "display:none" : "")+'" class="btn btn-primary">\n\
                            <i class="icon-close"></i>\n\
                        </button>\n\
                        <button id="search_'+response[i].id+'_restore_button" onclick="search.restore('+response[i].id+')" type="button" style="display:none" class="btn btn-primary">\n\
                            <i class="fa fa-refresh"></i>\n\
                        </button>\n\
                        <a href="query?id='+response[i].id+'&response='+search.response_type+'" type="button" class="btn btn-primary">\n\
                            <i class="fa fa-folder-open"></i>\n\
                        </a>\n\
                    </td>\n\
                </tr>');
            }
            
            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                var result = global_data.agency_getagentslist;
            
                for (var i = 0; i < result.length; i++){
                    if ($('.search_agent_span[agent='+result[i].id+']').length !== 0){
                        $('.search_agent_span[agent='+result[i].id+']').text(result[i].name);
                    }
                }
                
                user.lockAgentSelect();
            //});
        });
    };
    
    this.getSearchesListForSave = function(){
        $.post("/api/search/list.json",{
        },function (response){
            $('#save_search_list_table tbody > .for_delete').remove();

            for (var i = 0; i < response.length; i++){
                $('#save_search_list_table').append('<tr class="for_delete">\n\
                    <td>\n\
                        <span class="search_agent_span" agent="'+response[i].author+'"></span>\n\
                    </td>\n\
                    <td>\n\
                        <span id="search_'+response[i].id+'_title_span">'+response[i].title+'</span>\n\
                    </td>\n\
                    <td style="text-align:center">\n\
                        <button id="search_'+response[i].id+'_title_save_button" onclick="search.saveTitle('+response[i].id+')" type="button" class="btn btn-primary">\n\
                            <i class="fa fa-floppy-o"></i>\n\
                        </button>\n\
                    </td>\n\
                </tr>');
            }
            
            /*$.post("/api/agency/getagentslist.json",{
            },function (result){
                for (var i = 0; i < result.length; i++){
                    if ($('.search_agent_span[agent='+result[i].id+']').length !== 0){
                        $('.search_agent_span[agent='+result[i].id+']').text(result[i].name);
                    }
                }
                
                user.lockAgentSelect();
            });*/
        
            for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                if ($('.search_agent_span[agent='+global_data.agency_getagentslist[i].id+']').length !== 0){
                    $('.search_agent_span[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                }
            }

            user.lockAgentSelect();
        });
    };
    
    this.getSavedLists = function(){
        $.post("/api/responselist/getall.json",{
        },function (response){
            $('#lists_list_table tbody').html("");

            for (var i = 0; i < response.length; i++){
                $('#lists_list_table').append('<tr>\n\
                    <td>\n\
                        <span class="search_agent_span" agent="'+response[i].author+'"></span>\n\
                    </td>\n\
                    <td>\n\
                        <span id="list_'+response[i].id+'_title_span">'+response[i].title+'</span>\n\
                    </td>\n\
                    <td style="text-align:center">\n\
                        <button id="list_'+response[i].id+'_delete_button" onclick="search.deleteList('+response[i].id+')" type="button" class="btn btn-primary">\n\
                            <i class="icon-close"></i>\n\
                        </button>\n\
                        <button id="list_'+response[i].id+'_restore_button" onclick="search.restoreList('+response[i].id+')" type="button" style="display:none" class="btn btn-primary">\n\
                            <i class="fa fa-refresh"></i>\n\
                        </button>\n\
                        <a href="query?list='+response[i].id+'" type="button" class="btn btn-primary">\n\
                            <i class="fa fa-folder-open"></i>\n\
                        </a>\n\
                    </td>\n\
                </tr>');
            }
            
            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                    if ($('.search_agent_span[agent='+global_data.agency_getagentslist[i].id+']').length !== 0){
                        $('.search_agent_span[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                    }
                }
            //});
        });
    };
    
    this.getSavedListsForSave = function(){
        $.post("/api/responselist/getall.json",{
        },function (response){
            search.saved_lists = response;
            $('#lists_list_table tbody').html('<tr><td><span class="list_author_span" agent="'+user.id+'"></span></td><td><input id="list_title_input" onkeypress="utils.onEnter(event, this)" data-onenter-func="response_list.createNewList()" maxlength="20" style="width:100%;" /></td><td style="text-align:center"><button id="list_create_button" onclick="response_list.createNewList()" type="button" class="btn btn-primary"><i class="fa fa-save"></i></button></td></tr>');

            for (var i = 0; i < response.length; i++){
                $('#lists_list_table').append('<tr>\n\
                    <td>\n\
                        <span class="list_author_span" agent="'+response[i].author+'"></span>\n\
                    </td>\n\
                    <td>\n\
                        <span id="list_'+response[i].id+'_title_span">'+response[i].title+'</span>\n\
                    </td>\n\
                    <td style="text-align:center">\n\
                        <button id="list_create_button" onclick="response_list.rewriteList('+response[i].id+')" type="button" class="btn btn-primary">\n\
                            <i class="fa fa-save"></i>\n\
                        </button>\n\
                    </td>\n\
                </tr>');
            }
            
            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                    if ($('.list_author_span[agent='+global_data.agency_getagentslist[i].id+']').length !== 0){
                        $('.list_author_span[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                    }
                }
            //});
        });
    };
    
    this.get = function(){
        this.mode = 2;
        
        $.post("/api/search/get.json",{
            search_id: urlparser.getParameter("id")
        },function (response){
            search.data = response;
            
            if (search.data.type == 2 && search.data.special_by == 5){
                $('#history_back_button').show();
            }
            
            if (search.data.special_by != null){
                $('#search_name_label').text(localization.getVariable("special_search_h2")+":");
            }
            
            for (var key in response){
                if (response[key] != null){
                    switch (key) {
                        case "country":
                            placeDetailsByPlaceId(response[key], service_country, $('#country'));
                            search.geoloc.country = response[key];
                        break;
                        case "city":
                            placeDetailsByPlaceId(response[key], service_city, $('#locality'));
                            search.geoloc.city = response[key];
                            ac.getCityLocales(response[key]);
                            search.current_city = response[key];
                        break;
                        case "stock":
                            if (response[key] == 1){
                                $('#stock_check').iCheck("check");
                            }
                            else{
                                $('#stock_check').iCheck("uncheck");
                            }
                        break;
                        case "external":
                            var a = JSON.parse(response[key]);
                            
                            for (var y = 0; y < a.length; y++){
                                $('#'+a[y]+'_check').iCheck("check");            
                            }
                        break;
                        case "ascription":
                            $('#ascription_select').val(response[key]);
                        break;
                    }
                    
                    if (response["type"] == 1){
                        switch (key) {
                            case "title":
                                $('#no_name_span').hide();
                                $('#search_name_span').text(response[key]);
                            break;
                            case "neighborhood":
                                placeDetailsByPlaceId(response[key], service_neighborhood, $('#neighborhood'));
                                search.geoloc.neighborhood = response[key];
                            break;
                            case "street":
                                $('#geo_mode_select').val(1);
                                search.changeGeoMode();
                                help_tip.remove("streets_mode_help_tip_span");
                                //placeDetailsByPlaceId(response[key], service_route, $('#route'));

                                var obj = JSON.parse(response[key]);

                                for (var i = 0; i < obj.length; i++){
                                    streetDetailsByPlaceId(obj[i], service_route);
                                }

                                search.geoloc.street = obj;
                            break;
                            case "lat":
                                search.geoloc.lat = response[key];
                                search.geoloc.lng = response["lng"];
                                falseGeolocateByLatLng(response["lat"], response["lng"]);
                            break;
                            case "contour":
                                $('#geo_mode_select').val(2);
                                search.changeGeoMode();
                                $('#contour_select').val(response[key]);
                                
                                if ($('#contour_select').val() == null){
                                    $('#contour_select').val(0);
                                }
                            break;
                            case "status":
                                $('#status_select').val(JSON.parse(response[key]));
                                //console.log($('#status_select option:selected').text());
                                search.multiSelectToInput("status_select", "status_input");
                                //console.log($('#status_input').val());
                            break;
                            /*case "agent":
                                //$.post("/api/agency/getagentslist.json",{
                                //},function (response){
                                    $('#select_agent > option').remove();
                                    
                                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                                        $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>")
                                    }
                                    
                                    $('#select_agent').val(search.data["agent"]);
                                    user.lockAgentSelect();
                                    //$('#select_agent_wrapper').show();
                                    //$('#history_wrapper').hide();
                                    //$('#history_select').val(7);
                                //});
                            break;*/
                            case "property":
                                $('#properties_select').val(JSON.parse(response[key]));
                                //console.log($('#properties_select option:selected').text());
                                search.multiSelectToInput("properties_select", "properties_input");
                            break;
                            case "currency":
                                $('#currency_select').val(response[key]);
                            break;
                            case "price_from":
                                $('#price_from_input').val(response[key]);
                                search.onPriceFromKeyUp();
                            break;
                            case "price_to":
                                $('#price_to_input').val(response[key]);
                                search.onPriceToKeyUp();
                            break;
                            case "history_type":
                                $('#history_select').val(response[key]);
                                $('#history_dates_input_from').val(response["history_from"] != 0 && response["history_from"] != null ? utils.convertTimestampForDatepicker(response["history_from"]) : "");
                                $('#history_dates_input_to').val(response["history_to"] != 0 && response["history_to"] != null ? utils.convertTimestampForDatepicker(response["history_to"]) : "");

                                $('#history_dates_input_from').datepicker({ 
                                    dateFormat: "dd/mm/yy"
                                 });

                                $('#history_dates_input_to').datepicker({ 
                                    dateFormat: "dd/mm/yy"
                                });
                            break;
                            case "free_number_from":
                                $('#free_number_input_from').val(response[key]);
                                $('#history_select').val(9);
                                $('#free_number_wrapper').show();
                                $('#history_wrapper').hide();
                            break;
                            case "free_number_to":
                                $('#free_number_input_to').val(response[key]);
                                $('#history_select').val(9);
                                $('#free_number_wrapper').show();
                                $('#history_wrapper').hide();
                            break;
                            case "rooms_type":
                                $('#rooms_type_select').val(response[key]);
                            break;
                            case "rooms_from":
                                $('#rooms_input_from').val(response[key]);
                            break;
                            case "rooms_to":
                                $('#rooms_input_to').val(response[key]);
                                //$('#rooms_input_slider').attr("data-slider-value", "["+response["iRoomsFrom"]+","+response["iRoomsTo"]+"]");
                            break;
                            case "object_dimensions":
                                $('#object_size_dims_select').val(response[key]);
                            break;
                            case "object_type":
                                $('#object_type_select').val(response[key]);
                            break;
                            case "object_size_from":
                                $('#object_size_input_from').val(response[key]);
                            break;
                            case "object_size_to":
                                $('#object_size_input_to').val(response[key]);
                            break;
                            case "age_from":
                                $('#age_input_from').val(response[key]);
                            break;
                            case "age_to":
                                $('#age_input_to').val(response[key]);
                            break;
                            case "floors_from":
                                $('#floors_input_from').val(response[key]);
                            break;
                            case "floors_to":
                                $('#floors_input_to').val(response[key]);
                            break;
                            case "house_num":
                                $('#house_num_input').val(response[key]);
                            break;
                            case "furniture":
                                $('#furniture_select').val(response[key]);
                            break;
                            case "parking":
                                $('#parking_advopt_check').iCheck('check');
                            break;
                            case "no_last_floor":
                                $('#nolastfloor_advopt_check').iCheck('check');
                            break;
                            case "no_ground_floor":
                                $('#nogroundfloor_advopt_check').iCheck('check');
                            break;
                            case "facade":
                                $('#front_advopt_check').iCheck('check');
                            break;
                            case "elevator":
                                $('#elevator_advopt_check').iCheck('check');
                            break;
                            case "air_cond":
                                $('#aircond_advopt_check').iCheck('check');
                            break;
                            case "project":
                                $.post("/api/agency/getprojectslist.json",{
                                },function (response){
                                    for (var i = 0; i < response.length; i++)
                                        $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>")

                                    $('#select_project').val(search.data["project"]);
                                });
                            break;
                            case "sort_by":
                                $('#sort_by_date_a > i').removeClass("fa").removeClass("fa-arrow-down");
                                
                                if (response["sort_desc"] == 1){
                                    $('#sort_by_'+response[key]+'_a > i').addClass("fa").addClass("fa-arrow-down");
                                }
                                else{
                                    $('#sort_by_'+response[key]+'_a > i').addClass("fa").addClass("fa-arrow-up");
                                }
                            break;
                            case "timestamp":
                                $('#no_name_span > .search_date').text("("+utils.convertTimestampToDateTime(response[key])+")");
                            break;
                        }
                    }
                    else if (response["type"] == 2){
                        switch (key) {
                            case "special_by":
                                $('#special_argument_input').attr("disabled", false);
                                $('#special_query_button').attr("disabled", false).show();
                                //$('#list_search_button').attr("disabled", true);
                                //$('#map_search_button').attr("disabled", true);
                                $('#special_by_select').val(response[key]);
                            break;
                            case "special_argument":
                                if (response["special_by"] != 5){
                                    $('#special_argument_input').val(response[key]);
                                }
                                else{
                                    $('#check_items_wrapper_div').show();
                                    
                                    if (urlparser.getParameter("property") != undefined){
                                        $('#back_to_collected_card_a').show().attr("href", "property?id="+urlparser.getParameter("property")+"&mode=collected&check=cancel");
                                        $('#update_collected_card_a, #back_to_the_list_a').show();
                                        $.post("/api/property/getexternal.json",{
                                            id: urlparser.getParameter("property")
                                        },function (response){
                                            if (response == null){
                                                $('#update_collected_card_a').hide();
                                                return false;
                                            }
                                            
                                            var external_property = response;
                                            search.external_property_for_comparison = response;
                                            var phones = "";
                                            var buffer = "";
                                            var data = "";
                                            var data_expanded = "";

                                            if (external_property.stock == 1){
                                                data = buffer = "";
                                                data_expanded += "<td>"+buffer+"</td>";
                                                buffer = "";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            var types = JSON.parse(external_property.types);

                                            if (types != null){
                                                for (var z = 0; z < types.length; z++){
                                                    var tmp = "<span locale='"+query_form_options.property_type[types[z]]+"'>"+localization.getVariable(query_form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
                                                    data += tmp;
                                                    buffer += tmp;
                                                }

                                                data_expanded += "<td>"+buffer+"</td>";
                                                buffer = "";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.currency_id != null){
                                                data += buffer = ',&nbsp;<span class="price">'+utils.numberWithCommas(external_property.price)+' '+query_form_options.currency[external_property.currency_id]["symbol"]+'</span>';
                                                data_expanded += "<td>"+buffer.substr(7)+"</td>";
                                                buffer = "";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            var street_is_not_empty = false;

                                            if (external_property.street != "" && external_property.street != null){
                                                data += buffer = ',&nbsp;<span class="geoloc_span" property="'+external_property.id+'" placeid="'+external_property.street+'"></span>';
                                                street_is_not_empty = true;
                                                placeDetailsByPlaceIdNoAutocomplete(external_property.street, service_route);
                                            }

                                            if (
                                                    external_property.street != "" && 
                                                    external_property.street != null && 
                                                    external_property.house_number != 0 && 
                                                    external_property.house_number != null
                                            ){
                                                var tmp = '&nbsp;<span class="house_number">'+external_property.house_number+"</span>"
                                                data += tmp;
                                                buffer += tmp;
                                            }

                                            if (
                                                    external_property.street != "" && 
                                                    external_property.street != null && 
                                                    external_property.house_number != 0 && 
                                                    external_property.flat_number != 0 && 
                                                    external_property.house_number != null && 
                                                    external_property.flat_number != null
                                            ){
                                                var tmp = '<span class="flat_number">/'+external_property.flat_number+"</span>";
                                                data += tmp;
                                                buffer += tmp;
                                            }

                                            if (street_is_not_empty){
                                                data_expanded += "<td>"+buffer.substr(7)+"</td>";
                                                buffer = "";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.home_dims != null){
                                                var home_size_value = external_property.home_size+" "+"<span locale='"+query_form_options.dimension[external_property.home_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[external_property.home_dims]["locale"]);
                                                data += ',&nbsp;<span locale="home_noregister_span">'+localization.getVariable("home_noregister_span")+'</span> '+home_size_value+"</span>";
                                                data_expanded += "<td>"+home_size_value+"</td>";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.lot_dims != null){
                                                var lot_size_value = external_property.lot_size+" "+"<span locale='"+query_form_options.dimension[external_property.lot_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[external_property.lot_dims]["locale"]);
                                                data += ',&nbsp;<span locale="lot_noregister_span">'+localization.getVariable("lot_noregister_span")+'</span> '+lot_size_value+"</span>";
                                                data_expanded += "<td>"+lot_size_value+"</td>";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.floors_count != null || external_property.floor_from != null){
                                                var floor_from = external_property.floor_from != undefined && external_property.floor_from != null ? external_property.floor_from : "?";
                                                var floors_string = floor_from+(external_property.floors_count != null ? "/"+external_property.floors_count : "");
                                                data_expanded += "<td>"+floors_string+"</td>";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                            }

                                            if (external_property.rooms_count != 0 && external_property.rooms_count != null){
                                                data += ',&nbsp;'+external_property.rooms_count+' <span locale="rooms_noregister_span">'+localization.getVariable("rooms_noregister_span")+'</span>';
                                                data_expanded += "<td>"+external_property.rooms_count+"</td>";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.source ==  undefined){
                                                var agent_value = '<span '+(external_property.stock == 0 || external_property.foreign_stock == 0 ? 'agent="'+external_property.agent_id+'"' : "locale='stock'")+' class="card_agent">'+localization.getVariable("stock")+'</span>';
                                                data += ',&nbsp;<span locale="agent_noregister_span">'+localization.getVariable("agent_noregister_span")+'</span>: '+agent_value;
                                                data_expanded += "<td>"+agent_value+"</td>";
                                            }

                                            if (external_property.contact1 != "" && external_property.contact1 != null){
                                                var tmp = '<span id="contact1_span" property_card="'+external_property.id+'" class="card_phone_not_selected card_phone contact1" ><!--ondblclick="owl.phoneCall(this); return false;"-->'+external_property.contact1+'</span>, ';
                                                phones += tmp;
                                                buffer = tmp;
                                            }

                                            if (external_property.contact2 != "" && external_property.contact2 != null){
                                                var tmp = '<span id="contact2_span" property_card="'+external_property.id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+external_property.contact2+'</span>, ';
                                                phones += tmp;
                                                buffer += tmp;
                                            }

                                            if (external_property.contact3 != "" && external_property.contact3 != null){
                                                var tmp = '<span id="contact3_span" property_card="'+external_property.id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+external_property.contact3+'</span>, ';
                                                phones += tmp;
                                                buffer += tmp;
                                            }

                                            if (external_property.contact4 != "" && external_property.contact4 != null){
                                                var tmp = '<span id="contact4_span" property_card="'+external_property.id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+external_property.contact4+'</span>, ';
                                                phones += tmp;
                                                buffer += tmp;
                                            }

                                            if (external_property.source != undefined){
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            data += ", "+phones;
                                            data_expanded += "<td>"+buffer.substr(0, buffer.length-2)+"</td>";
                                            buffer = "";

                                            if (external_property.email != "" && external_property.email != null){
                                                data += "@, ";
                                                data_expanded += "<td>@</td>";
                                                buffer = "";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            if (external_property.last_updated != null){
                                                var lastupd_value = utils.convertTimestampForDatepicker(external_property.last_updated);
                                                data += '&nbsp<span locale="lastupd_noregister_span">'+localization.getVariable("lastupd_noregister_span")+'</span>: '+lastupd_value;
                                                data_expanded += "<td>"+lastupd_value+"</td>";
                                            }
                                            else if (external_property.timestamp != null){
                                                var timestamp_value = utils.convertTimestampForDatepicker(external_property.timestamp);
                                                data += '&nbsp;<span locale="created_noregister_span">'+localization.getVariable("created_noregister_span")+'</span>: '+timestamp_value;
                                                data_expanded += "<td>"+timestamp_value+"</td>";
                                            }
                                            else{
                                                data_expanded += "<td></td>";
                                                buffer = "";
                                            }

                                            $('#external_card_for_comparison_div').html(
                                                '<td>'+data+'\n\
                                                    <span class="card_id" style="'+(external_property.source != undefined ? "display:none" : "")+'">\n\
                                                        ,&nbsp;<span locale="card_noregister_span">'+localization.getVariable("card_noregister_span")+'</span>\n\
                                                        '+external_property.id+'\
                                                    </span>\
                                                </td>').show();
                                        
                                            $('#external_card_for_comparison_title_span').show();
                                        });
                                    }else if (urlparser.getParameter("client") != undefined){
                                        $('#check_items_wrapper_div > span').attr("locale", "same_phone_client_list").text(localization.getVariable("same_phone_client_list"));
                                        $('#client_results_table_wrapper > span').hide();
                                        $('#back_to_collected_card_from_client_a').show().attr("href", "client?id="+urlparser.getParameter("client")+"&mode=collected&check=cancel");
                                    }
                                    
                                    $('#special_argument_input').attr("disabled", true);
                                    $('#special_query_button').attr("disabled", true).hide();
                                    $('#founded_wrapper_div').hide();
                                    $('#left_side_panel_div').css("opacity", "0.3");
                                    $('#left_side_panel_div input, #left_side_panel_div select').focus(function(){
                                        search.focusSearchFromList();
                                    });
                                    $('#right_side_panel_div').css({background:"#f2da7a"});
                                    $('#right_side_panel_div').animate({backgroundColor: "rgba(0,0,0,0)"}, 5000);
                                }
                            break;
                        }
                    }
                }
            }
            
            if (search.data.agent == null)
                //$.post("/api/agency/getagentslist.json",{
                //},function (response){
                    $('#select_agent > option').remove();
                
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>");
                    }
                    
                    $('#select_agent').val(0);
                    user.lockAgentSelect();
                //});
                
            /*if (search.data.project == null)
                $.post("/api/agency/getprojectslist.json",{
                },function (response){
                    for (var i = 0; i < response.length; i++)
                        $('#select_project').append("<option value="+response[i].id+">"+response[i].title+"</option>")
                });
            */                                                                                                                                                                                
                
            if (search.data.history_from == null || search.data.history_to){
                $('#history_dates_input_from').datepicker({ 
                    dateFormat: "dd/mm/yy",
                    onSelect: function(){
                        search.lightNotEmpty();
                    }
                 });

                $('#history_dates_input_to').datepicker({ 
                    dateFormat: "dd/mm/yy",
                    onSelect: function(){
                        search.lightNotEmpty();
                    }
                });
            }
            
            if (search.data.city == null){
                $('#neighborhood').attr({disabled: true, locale_placeholder: "set_city_to_change"});
                $('#route_input input.ui-autocomplete-input').attr({disabled: true, locale_placeholder: "set_city_to_change"});
                $('#route_input').css("background", "rgba(85, 107, 141, 0.19)");
            }
            
            //localization.toLocale();
            exinput_sii.parseAll();
            exinput_ii.parseAll();
            exinput_ss.parseAll();
            search.lightNotEmpty();
        });
    };
    
    this.focusSearchFromList = function(){
        $('#left_side_panel_div form').animate({opacity: 1}, 200);
    };
    
    this.getAsync = function(){
        this.mode = 2;
        
        $.post("/api/search/get.json",{
            search_id: urlparser.getParameter("id")
        },function (response){
            search.data = response;
            
            if (search.data.agent == null){
                //$.post("/api/agency/getagentslist.json",{
                //},function (response){
                    $('#select_agent > option').remove();
                
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        $('#select_agent').append("<option value="+global_data.agency_getagentslist[i].id+">"+global_data.agency_getagentslist[i].name+"</option>");
                    }
                    
                    $('#select_agent').val(0);
                    user.lockAgentSelect();
                //});
            }
            
            
            if (response_type == "map"){
                //response_map.reInit();
                utils.htmlSpinner("list_search_button");
                location.reload();
            }
            else{
                response_list.reInit();
            }
        });
    };
    
    this.getList = function(){
        $.post("/api/responselist/get.json",{
            id: this.list_id
        },function (result){
            response_list.init();
            $('#del_card_button').hide();
            $('#over30_wrapper, #founded_wrapper_div').hide();
            $('#left_side_panel_div form').css("opacity", "0.3");
            $('#list_items_wrapper_div').show();
            $('#left_side_panel_div input, #left_side_panel_div select').focus(function(){
                search.focusSearchFromList();
            });
            $('#saved_list_title_span').text(result.title);
            
            if (result.type == "properties"){ // строим список из недвижимости
                $('#property_results_table_wrapper span').first().attr("locale", "list_items");
                //localization.toLocale();
                response_list.properties = result.data;
                $('#saved_list_items_count_span').text(response_list.properties.length);
                $('#property_results_area').show();

                $('#property_results_table').append('<tr class="mark_all_check">\n\
                    <td class="left_padding_5 top_padding_5">\n\
                        <input id="property_all_check" class="icheck" type="checkbox"/>\n\
                    </td>\n\
                </tr>');

                $('#mark_all_checkbox_expanded_wrapper')
                    .html('<input id="property_expanded_all_check" class="icheck" type="checkbox"/>')
                    .css("padding-top", "7px");

                localization.setArabian();

                $('#property_all_check, #property_expanded_all_check').on('ifClicked', function(event){
                    response_list.markAll();
                });

                for (var i = 0; i < response_list.properties.length; i++){
                    var phones = "";
                        var buffer = "";
                        var data = "";
                        var data_expanded = "";

                        if (response_list.properties[i].stock == 1){
                            data = buffer = response_list.properties[i].foreign_stock == 1 ? "<i class='fa fa-caret-right'></i>&#160;" : "<i class='fa fa-caret-left'></i>&#160;";
                            data_expanded += "<td>"+buffer+"</td>";
                            buffer = "";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        var types = JSON.parse(response_list.properties[i].types);

                        if (types != null){
                            for (var z = 0; z < types.length; z++){
                                var tmp = "<span locale='"+query_form_options.property_type[types[z]]+"'>"+localization.getVariable(query_form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
                                data += tmp;
                                buffer += tmp;
                            }

                            data_expanded += "<td>"+buffer+"</td>";
                            buffer = "";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        if (response_list.properties[i].currency_id != null){
                            data += buffer = ',&nbsp;<span class="price">'+utils.numberWithCommas(response_list.properties[i].price)+' '+query_form_options.currency[response_list.properties[i].currency_id]["symbol"]+'</span>';
                            data_expanded += "<td>"+buffer.substr(7)+"</td>";
                            buffer = "";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        var street_is_not_empty = false;

                        if (response_list.properties[i].street != "" && response_list.properties[i].street != null){
                            data += buffer = ',&nbsp;<span class="geoloc_span" property="'+response_list.properties[i].id+'" placeid="'+response_list.properties[i].street+'"></span>';
                            street_is_not_empty = true;
                            placeDetailsByPlaceIdNoAutocomplete(response_list.properties[i].street, service_route, i);
                        }

                        if (
                                response_list.properties[i].street != "" && 
                                response_list.properties[i].street != null && 
                                response_list.properties[i].house_number != 0 && 
                                response_list.properties[i].house_number != null
                        ){
                            var tmp = '&nbsp;<span class="house_number">'+response_list.properties[i].house_number+"</span>"
                            data += tmp;
                            buffer += tmp;
                        }

                        if (
                                response_list.properties[i].street != "" && 
                                response_list.properties[i].street != null && 
                                response_list.properties[i].house_number != 0 && 
                                response_list.properties[i].flat_number != 0 && 
                                response_list.properties[i].house_number != null && 
                                response_list.properties[i].flat_number != null
                        ){
                            var tmp = '<span class="flat_number">/'+response_list.properties[i].flat_number+"</span>";
                            data += tmp;
                            buffer += tmp;
                        }

                        if (street_is_not_empty){
                            data_expanded += "<td>"+buffer.substr(7)+"</td>";
                            buffer = "";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        if (response_list.properties[i].home_dims != null){
                            var home_size_value = response_list.properties[i].home_size+" "+"<span locale='"+query_form_options.dimension[response_list.properties[i].home_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[response_list.properties[i].home_dims]["locale"]);
                            data += ',&nbsp;<span locale="home_noregister_span">'+localization.getVariable("home_noregister_span")+'</span> '+home_size_value+"</span>";
                            data_expanded += "<td>"+home_size_value+"</td>";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        if (response_list.properties[i].lot_dims != null){
                            var lot_size_value = response_list.properties[i].lot_size+" "+"<span locale='"+query_form_options.dimension[response_list.properties[i].lot_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[response_list.properties[i].lot_dims]["locale"]);
                            data += ',&nbsp;<span locale="lot_noregister_span">'+localization.getVariable("lot_noregister_span")+'</span> '+lot_size_value+"</span>";
                            data_expanded += "<td>"+lot_size_value+"</td>";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        if (response_list.properties[i].floors_count != null || response_list.properties[i].floor_from != null){
                            var floors_string = response_list.properties[i].floor_from+(response_list.properties[i].floors_count != null ? "/"+response_list.properties[i].floors_count : "");
                            data_expanded += "<td>"+floors_string+"</td>";
                        }
                        else{
                            data_expanded += "<td></td>";
                        }

                        if (response_list.properties[i].rooms_count != 0 && response_list.properties[i].rooms_count != null){
                            data += ',&nbsp;'+response_list.properties[i].rooms_count+' <span locale="rooms_noregister_span">'+localization.getVariable("rooms_noregister_span")+'</span>';
                            data_expanded += "<td>"+response_list.properties[i].rooms_count+"</td>";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        var agent_value = '<span '+(response_list.properties[i].stock == 0 || response_list.properties[i].foreign_stock == 0 ? 'agent="'+response_list.properties[i].agent_id+'"' : "locale='stock'")+' class="card_agent">'+localization.getVariable("stock")+'</span>';
                        data += ',&nbsp;<span locale="agent_noregister_span">'+localization.getVariable("agent_noregister_span")+'</span>: '+agent_value;
                        data_expanded += "<td>"+agent_value+"</td>";

                        if (response_list.properties[i].contact1 != "" && response_list.properties[i].contact1 != null){
                            var tmp = '<span id="contact1_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone contact1" ><!--ondblclick="owl.phoneCall(this); return false;"-->'+response_list.properties[i].contact1+'</span>, ';
                            phones += tmp;
                            buffer = tmp;
                        }

                        if (response_list.properties[i].contact2 != "" && response_list.properties[i].contact2 != null){
                            var tmp = '<span id="contact2_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact2+'</span>, ';
                            phones += tmp;
                            buffer += tmp;
                        }

                        if (response_list.properties[i].contact3 != "" && response_list.properties[i].contact3 != null){
                            var tmp = '<span id="contact3_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact3+'</span>, ';
                            phones += tmp;
                            buffer += tmp;
                        }

                        if (response_list.properties[i].contact4 != "" && response_list.properties[i].contact4 != null){
                            var tmp = '<span id="contact4_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact4+'</span>, ';
                            phones += tmp;
                            buffer += tmp;
                        }

                        data += ", "+phones;
                        data_expanded += "<td>"+buffer.substr(0, buffer.length-2)+"</td>";
                        buffer = "";

                        if (response_list.properties[i].email != "" && response_list.properties[i].email != null){
                            data += "@, ";
                            data_expanded += "<td>@</td>";
                            buffer = "";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        if (response_list.properties[i].last_updated != null){
                            var lastupd_value = utils.convertTimestampForDatepicker(response_list.properties[i].last_updated);
                            data += '&nbsp<span locale="lastupd_noregister_span">'+localization.getVariable("lastupd_noregister_span")+'</span>: '+lastupd_value;
                            data_expanded += "<td>"+lastupd_value+"</td>";
                        }
                        else if (response_list.properties[i].timestamp != null){
                            var timestamp_value = utils.convertTimestampForDatepicker(response_list.properties[i].timestamp);
                            data += '&nbsp;<span locale="created_noregister_span">'+localization.getVariable("created_noregister_span")+'</span>: '+timestamp_value;
                            data_expanded += "<td>"+timestamp_value+"</td>";
                        }
                        else{
                            data_expanded += "<td></td>";
                            buffer = "";
                        }

                        $('#property_results_table').append('<tr id="property_'+response_list.properties[i].id+'_list_tr" class="card_not_selected '+(i%2 === 0 ? "hl" : "")+'" onclick="response_list.selectPropertyPhone(this, '+response_list.properties[i].id+')" ondblclick=\'location.href="property?id='+response_list.properties[i].id+'&list='+search.list_id+'"\'>\n\
                            <td class="left_padding_5 top_padding_5">\n\
                                <span class="list_item_number">'+(i+1)+') </span>\n\
                                <input id="property_'+response_list.properties[i].id+'_check" class="icheck list_icheck" type="checkbox"/>\n\
                            </td>\n\
                            <td>'+data+',\n\
                                <span class="card_id">\n\
                                    <span locale="card_noregister_span">'+localization.getVariable("card_noregister_span")+'</span>\n\
                                    '+response_list.properties[i].id+'\
                                </span>\
                            </td>');

                        $('#property_results_table_expanded').append('<tr id="property_'+response_list.properties[i].id+'_list_tr_expanded" class="card_not_selected '+(i%2 === 0 ? "odd" : "")+'" onclick="response_list.selectPropertyPhone(this, '+response_list.properties[i].id+')" ondblclick=\'location.href="property?id='+response_list.properties[i].id+'&list='+search.list_id+'"\'>\n\
                            <td class="left_padding_5 top_padding_5">\n\
                                <span class="list_item_number">'+(i+1)+') </span>\n\
                                <input id="property_'+response_list.properties[i].id+'_check_expanded" class="icheck_transparent list_icheck" type="checkbox"/>\n\
                            </td>\n\
                            '+data_expanded+',\n\
                            <td><span class="card_id">\n\
                                    '+response_list.properties[i].id+'\
                                </span>\
                            </td></tr>');

                        $('#property_'+response_list.properties[i].id+'_check, #property_'+response_list.properties[i].id+'_check_expanded').on(
                            'ifClicked', 
                            {property: response_list.properties[i].id},
                            function(event){
                                response_list.selectPropertyPhone(document.getElementById("property_"+event.data.property+"_list_tr"), Number(event.data.property));
                        });

                        response_list.sorting_stack.properties.push($('#property_'+response_list.properties[i].id+'_list_tr'));
                }
            }
            else{ // строим список из клиентов
                response_list.clients = result.data;
                
                $('#client_results_area').show();
                $('#saved_list_items_count_span').text(response_list.clients.length);
            
                if (response_list.clients.length > 99){
                    $('#client_results_table').append('<tr>\n\
                        <td colspan="2">\n\
                            <div class="alert alert-warning alert-dismissable">\n\
                                <strong><span locale="note">'+localization.getVariable("note")+'</span>&nbsp;</strong>\n\
                                <span locale="only_part_showed">'+localization.getVariable("only_part_showed")+'</span>&#160;<span id="response_total_count_span"></span>&#160;<span locale="no_more_200_response_message2">'+localization.getVariable("no_more_200_response_message2")+'</span>\n\
                            </div>\n\
                        </td>\n\
                    </tr>');

                    $.post("/api/search/getresultscount.json",{
                        search: search.data == null ? search.defaults.search.id : search.data.id
                    }, function(response){
                        $('#response_total_count_span').html(response);
                    });
                }

                $('#client_results_table').append('<tr class="mark_all_check">\n\
                    <td class="left_padding_5 top_padding_5">\n\
                        <input id="client_all_check" class="icheck" type="checkbox"/>\n\
                    </td>\n\
                    <td>\n\
                        <label locale="mark_all_button" class="white_label" for="client_all_check">'+localization.getVariable("mark_all_button")+'</label>&#160;&#160;&#160;&#160;\n\
                    </td>\n\
                </tr>');

                $('#client_mark_all_checkbox_expanded_wrapper')
                    .html('<input id="client_expanded_all_check" class="icheck" type="checkbox"/>')
                    .css("padding-top", "7px");

                /*$('#mark_all_checkbox_expanded_wrapper')
                    .html('<input id="client_expanded_all_check" class="icheck" type="checkbox"/>')
                    .css("padding-top", "7px");*/

                localization.setArabian();

                $('#client_all_check, #client_expanded_all_check').on('ifClicked', function(event){
                    response_list.markAll();
                });

                for (var i = 0; i < response_list.clients.length; i++){
                    var phones = "";
                    var buffer = "";
                    var data = "";
                    var data_expanded = "";
                    
                    if (response_list.clients[i].contact1 != "" && response_list.clients[i].contact1 != null){
                        var tmp = '<span id="contact1_span" client_card="'+response_list.clients[i].id+'" class="card_phone_not_selected card_phone contact1">'+response_list.clients[i].contact1+'</span>';
                        phones += tmp;
                        buffer = tmp;
                    }
                    
                    if (response_list.clients[i].contact2 != "" && response_list.clients[i].contact2 != null){
                        var tmp = ', <span id="contact2_span" client_card="'+response_list.clients[i].id+'" class="card_phone_not_selected card_phone">'+response_list.clients[i].contact2+'</span>';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    if (response_list.clients[i].contact3 != "" && response_list.clients[i].contact3 != null){
                        var tmp = ', <span id="contact3_span" client_card="'+response_list.clients[i].id+'" class="card_phone_not_selected card_phone">'+response_list.clients[i].contact3+'</span>';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    if (response_list.clients[i].contact4 != "" && response_list.clients[i].contact4 != null){
                        var tmp = ', <span id="contact4_span" client_card="'+response_list.clients[i].id+'" class="card_phone_not_selected card_phone">'+response_list.clients[i].contact4+'</span>';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    //data += ", "+phones;
                    data_expanded += "<td>"+buffer.substr(0, buffer.length-2)+"</td>";
                    buffer = "";
                    
                    if (response_list.clients[i].email != "" && response_list.clients[i].email != null){
                        data += "@, ";
                        data_expanded += "<td>@</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }

                    var types = JSON.parse(response_list.clients[i].property_types);
                    
                    if (types != null){
                        for (var z = 0; z < types.length; z++){
                            var tmp = "<span locale='"+query_form_options.property_type[types[z]]+"'>"+localization.getVariable(query_form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
                            data += tmp;
                            buffer += tmp;
                        }
                        
                        data_expanded += "<td>"+buffer+"</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }

                    if (response_list.clients[i].currency_id != null){
                        data += buffer = ',&nbsp;<span class="price">'+utils.numberWithCommas(response_list.clients[i].price_from)+' - '+utils.numberWithCommas(response_list.clients[i].price_to)+' '+query_form_options.currency[response_list.clients[i].currency_id]["symbol"]+'</span>';
                        data_expanded += "<td>"+buffer.substr(7)+"</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.clients[i].rooms_from != null && response_list.clients[i].rooms_to != 0 && response_list.clients[i].rooms_to != null){
                        data += ',&nbsp;'+response_list.clients[i].rooms_from+'-'+response_list.clients[i].rooms_to+' <span locale="rooms_noregister_span">'+localization.getVariable("rooms_noregister_span")+'</span>';
                        data_expanded += "<td>"+response_list.clients[i].rooms_from+'-'+response_list.clients[i].rooms_to+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.clients[i].home_size_dims != null && response_list.clients[i].home_size_from != null && response_list.clients[i].home_size_to != null && response_list.clients[i].home_size_to != 0){
                        var home_size_value = response_list.clients[i].home_size_from+'-'+response_list.clients[i].home_size_to;
                        data += ',&nbsp;<span locale="home_noregister_span">'+localization.getVariable("home_noregister_span")+'</span> '+home_size_value+" <span locale='"+query_form_options.dimension[response_list.clients[i].home_size_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[response_list.clients[i].home_size_dims]["locale"])+"</span>";
                        data_expanded += "<td>"+home_size_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.clients[i].lot_size_dims != null && response_list.clients[i].lot_size_from != null && response_list.clients[i].lot_size_to != null && response_list.clients[i].lot_size_to != 0){
                        var lot_size_value = response_list.clients[i].lot_size_from+'-'+response_list.clients[i].lot_size_to;
                        data += ',&nbsp;<span locale="lot_noregister_span">'+localization.getVariable("lot_noregister_span")+'</span> '+lot_size_value+" <span locale='"+query_form_options.dimension[response_list.clients[i].lot_size_dims]["locale"]+"'>"+localization.getVariable(query_form_options.dimension[response_list.clients[i].lot_size_dims]["locale"])+"</span>";
                        data_expanded += "<td>"+lot_size_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    //if (response_list.clients[i].street != ""){
                        //data += ',&nbsp;<span id="'+response_list.clients[i].street+'"></span>';
                        //placeDetailsByPlaceId(response_list.clients[i].street, service_route);
                    //}

                    //if (response_list.clients[i].street != "" && response_list.clients[i].house_number != 0)
                        //data += ',&nbsp;'+response_list.clients[i].house_number;

                    //if (response_list.clients[i].street != "" && response_list.clients[i].house_number != 0 && response_list.clients[i].flat_number != 0)
                        //data += ',&nbsp;'+response_list.clients[i].flat_number;
                    var agent_value = '<span agent="'+response_list.clients[i].agent_id+'" class="card_agent"></span>';
                    data += ',&nbsp;<span locale="agent_noregister_span">'+localization.getVariable("agent_noregister_span")+'</span>: '+agent_value; 
                    data_expanded += "<td>"+agent_value+"</td>";
                    
                    if (response_list.clients[i].last_updated != null){
                        var lastupd_value = utils.convertTimestampForDatepicker(response_list.clients[i].last_updated);
                        data += ',&nbsp;<span locale="last_update">'+localization.getVariable("last_update")+'</span>: '+utils.convertTimestampForDatepicker(response_list.clients[i].last_updated);
                        data_expanded += "<td>"+lastupd_value+"</td>";
                    }
                    else if (response_list.clients[i].timestamp != null){
                        var timestamp_value = utils.convertTimestampForDatepicker(response_list.clients[i].timestamp);
                        data += ',&nbsp;<span locale="created_noregister_span">'+localization.getVariable("last_update")+'</span>: '+utils.convertTimestampForDatepicker(response_list.clients[i].timestamp);
                        data_expanded += "<td>"+timestamp_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    $('#client_results_table').append('<tr id="client_'+response_list.clients[i].id+'_list_tr" class="card_not_selected '+(i%2 == 0 ? "hl" : "")+'" onclick="response_list.selectClientPhone(this, '+response_list.clients[i].id+')" ondblclick=\'location.href="client?id='+response_list.clients[i].id+'&search='+response_list.filterDefaultSearch()+'"\'>\n\
                        <td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="client_'+response_list.clients[i].id+'_check" class="icheck list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        <td>'+phones+',&nbsp;\n\
                            <span class="card_id">\n\
                                <span locale="card_noregister_span">'+localization.getVariable("card_noregister_span")+'</span>&nbsp'+response_list.clients[i].id+'</span>,&nbsp'+data+'\n\
                        </td>');
                    
                    $('#client_results_table_expanded').append('<tr id="client_'+response_list.clients[i].id+'_list_tr_expanded" class="card_not_selected '+(i%2 === 0 ? "odd" : "")+'" onclick="response_list.selectClientPhone(this, '+response_list.clients[i].id+')" ondblclick=\'location.href="client?id='+response_list.clients[i].id+'&search='+response_list.filterDefaultSearch()+'"\'>\n\
                        <td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="client_'+response_list.clients[i].id+'_check_expanded" class="icheck_transparent list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        '+data_expanded+',\n\
                        <td><span class="card_id">\n\
                                '+response_list.clients[i].id+'\
                            </span>\
                        </td></tr>');
                    
                    $('#client_results_table_expanded').tableHeadFixer();

                    $('#client_'+response_list.clients[i].id+'_check, #client_'+response_list.clients[i].id+'_check_expanded').on(
                        'ifClicked', 
                        {client: response_list.clients[i].id},
                        function(event){
                            response_list.selectClientPhone(document.getElementById("client_"+event.data.client+"_list_tr"), Number(event.data.client));
                    });

                    response_list.sorting_stack.clients.push($('#client_'+response_list.clients[i].id+'_list_tr'));
                }
            }

            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                    if ($('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').length !== 0){
                        $('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                    }
                }
                
                //localization.toLocale();
                
                //$('#right_side_panel_div').css({background:"rgba(198,18,61,0.2)"});
                //$('#right_side_panel_div').animate({backgroundColor: "rgba(0,0,0,0)"}, 3000);
            //});
            
            app.customCheckbox();
            //localization.toLocale();
            $('#property_results_table_expanded').tableHeadFixer();
            $('#property_results_area').removeClass("response_list_loader");
        });
    };
    
    this.query = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    utils.hlEmpty(this);
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            }
            
            if (this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 1;
            if (this.geoloc.country !== "") collected.country = this.geoloc.country;
            collected.neighborhood = this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood;
            //if ($('#neighborhood').val().trim().length === 0) collected.neighborhood = null;
            if (this.geoloc.city !== "") collected.city = this.geoloc.city;
            if ($('#locality').val().trim().length === 0) collected.city = null;
            if (this.geoloc.lat !== "") collected.lat = this.geoloc.lat;
            if (this.geoloc.lng !== "") collected.lng = this.geoloc.lng;
            
            /*if (this.geo_mode == 1){ // 1 - street, 2 - contour
                collected.street = this.geoloc.street != null ? this.geoloc.street : synonim.current_selected.route;
                //collected.new_street_synonim = synonim.collectRoute(this);
            }
            else if (this.geo_mode === 2 && $('#contour_select').val() != 0){
                collected.contour = $('#contour_select').val();
            }
            else if (this.geo_mode === 2 && $('#contour_select').val() == 0 && (this.geoloc.country == undefined || this.geoloc.city == undefined)){
                throw "Fill at least country and city!";
            }*/
            
            if (this.geo_mode === 1){
                collected.street = this.geoloc.street.length > 0 ? this.geoloc.street : null;
                collected.contour = null;
            }
            else{
                collected.contour = $('#contour_select').val() != 0 && $('#contour_select').val() != -1 ? $('#contour_select').val() : null;
                collected.street = null;
            }
            
            if ($('#ascription_select').val() != null) collected.ascription = $('#ascription_select').val();
            collected.status = $('#status_select').val();            
            if ($('#elevator_advopt_check:checked').length !== 0) collected.elevator = 1;
            if ($('#aircond_advopt_check:checked').length !== 0) collected.air_cond = 1;                    
            if ($('#parking_advopt_check:checked').length !== 0) collected.parking = 1;
            if ($('#nogroundfloor_advopt_check:checked').length > 0) collected.no_ground_floor = 1;
            if ($('#nolastfloor_advopt_check:checked').length > 0) collected.no_last_floor = 1;
            if ($('#furniture_select').val().trim().length !== 0) collected.furniture = $('#furniture_select').val();                   
            if ($('#select_agent').val() != 0) collected.agent = $('#select_agent').val();                    
            
            if (($('#object_size_input_from').val().trim().length !== 0 || $('#object_size_input_to').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0){
                collected.object_size_from = $('#object_size_input_from').val() != 0 && $('#object_size_input_from').val().trim().length !== 0 ? $('#object_size_input_from').val() : null; 
                collected.object_size_to = $('#object_size_input_to').val().trim().length !== 0 ? $('#object_size_input_to').val() : null; 
                collected.object_dimensions = $('#object_size_dims_select').val();
                collected.object_type = $('#object_type_select').val(); 
            }
            
            if (
                    $('#history_select').val().trim().length !== 0 && 
                    ($('#history_dates_input_from').val().trim().length !== 0 || 
                    $('#history_dates_input_to').val().trim().length !== 0) ||
                    ($('#free_number_input_from').val().trim().length !== 0 || 
                    $('#free_number_input_to').val().trim().length !== 0)
                ){
                if ($('#history_select').val() != 9){
                    $('#free_number_input_from, #free_number_input_to').val("");
                }
                else{
                    $('#history_dates_input_from, #history_dates_input_to').val("");
                }
                
                collected.history_from = $('#history_dates_input_from').datepicker("getDate")/1000;
                collected.history_to = $('#history_dates_input_to').datepicker("getDate")/1000;
                collected.history_type = $('#history_select').val();
            }
            
            if (
                    collected.city == null && 
                    utils.isEmpty(collected.history_from) &&
                    utils.isEmpty(collected.history_to)
            ){
                var d = new Date();
                var three_days_seconds = 259200;
                
                collected.history_from = Math.floor(d/1000)-three_days_seconds;
                collected.history_to = Math.floor(d/1000);
                collected.history_type = 0;
                
                utils.warningModal(localization.getVariable("too_mush_in_israel"));
            }
            
            if ($('#properties_select').val() !== null) collected.property = $('#properties_select').val();                    
            if ($('#price_from_input').val().trim().length !== 0 && $('#price_to_input').val().trim().length !== 0) collected.currency = $('#currency_select').val();                    
            if ($('#price_from_input').val().trim().length !== 0) collected.price_from = utils.numberRemoveCommas($('#price_from_input').val().trim());   
            if ($('#price_to_input').val().trim().length !== 0) collected.price_to = utils.numberRemoveCommas($('#price_to_input').val().trim());                       
            if ($('#free_number_input_from').val().trim().length !== 0) collected.free_number_from = $('#free_number_input_from').val().trim();   
            if ($('#free_number_input_to').val().trim().length !== 0) collected.free_number_to = $('#free_number_input_to').val().trim(); 
            if ($('#age_input_from').val().trim().length !== 0) collected.age_from = $('#age_input_from').val();
            if ($('#age_input_to').val().trim().length !== 0) collected.age_to = $('#age_input_to').val();
            if ($('#floors_input_from').val().trim().length !== 0) collected.floors_from = $('#floors_input_from').val();                    
            if ($('#floors_input_to').val().trim().length !== 0) collected.floors_to = $('#floors_input_to').val();  
            if ($('#house_num_input').val().trim().length !== 0) collected.house_num = $('#house_num_input').val();  
            
            if (($('#rooms_input_from').val().trim().length !== 0 || $('#rooms_input_to').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0){
                collected.rooms_from = $('#rooms_input_from').val();  
                collected.rooms_to = $('#rooms_input_to').val();
                collected.rooms_type = $('#rooms_type_select').val();
            }
            
            if ($('#select_project').val().trim().length !== 0) collected.project = $('#select_project').val();                   

            $.post("/api/search/createnew.json",{
                id: this.temporary_id,
                data: JSON.stringify(collected)
            },function (response){
                response_list.hideOnboarding();
                utils.removeHtmlSpinner("list_search_button");
                
                if (response.error != undefined){
                    utils.errorModal(response.error.description);
                }
                else{ 
                    if ($('#contour_select').val() == 0 && polygon != null && $('#geo_mode_select').val() == 2){
                        createTemporaryContour(response);
                    }
                    
                    //location.href = "query?id="+response+"&response="+search.response_type;
                    search.temporary_id = null;
                    urlparser.setParameter("id", response);
                    urlparser.setParameter("response", search.response_type);
                    $('#property_results_table tbody tr, #property_results_table_expanded tbody tr').remove();
                    response_list.properties = null;
                    $('#property_results_area').addClass("response_list_loader");
                    $('#property_results_area .no_results_empty_text_div, #property_results_area .no_results_text_div').hide();
                    
                    search.getAsync();
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.map = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    utils.hlEmpty(this);
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            }
            
            if (this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 1;
            if (this.geoloc.country !== "") collected.country = this.geoloc.country;
            if (this.geoloc.neighborhood !== "") collected.neighborhood = this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood;
            if (this.geoloc.city !== "") collected.city = this.geoloc.city;
            if (this.geoloc.lat !== "") collected.lat = this.geoloc.lat;
            if (this.geoloc.lng !== "") collected.lng = this.geoloc.lng;
            
            if (this.geo_mode == 1){ // 1 - street, 2 - contour
                collected.street = this.geoloc.street != null ? this.geoloc.street : synonim.current_selected.route;
                //collected.new_street_synonim = synonim.collectRoute(this);
            }
            else if (this.geo_mode === 2 && $('#contour_select').val() != 0 && $('#contour_select').val() != -1){
                collected.contour = $('#contour_select').val();
            }
            else if (this.geo_mode === 2 && $('#contour_select').val() == 0 && (this.geoloc.country == undefined)){
                throw "Fill at least country!";
            }
            
            if ($('#ascription_select').val() != null) collected.ascription = $('#ascription_select').val();
            collected.status = $('#status_select').val();            
            if ($('#elevator_advopt_check:checked').length !== 0) collected.elevator = 1;
            if ($('#aircond_advopt_check:checked').length !== 0) collected.air_cond = 1;                    
            if ($('#parking_advopt_check:checked').length !== 0) collected.parking = 1;                    
            if ($('#furniture_select').val().trim().length !== 0) collected.furniture = $('#furniture_select').val();                   
            if ($('#select_agent').val() != 0) collected.agent = $('#select_agent').val();                    
            
            if (($('#object_size_input_from').val().trim().length !== 0 || $('#object_size_input_to').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0){
                collected.object_size_from = $('#object_size_input_from').val() != 0 && $('#object_size_input_from').val().trim().length !== 0 ? $('#object_size_input_from').val() : null;
                collected.object_size_to = $('#object_size_input_to').val().trim().length !== 0 ? $('#object_size_input_to').val() : null; 
                collected.object_dimensions = $('#object_size_dims_select').val();
                collected.object_type = $('#object_type_select').val(); 
            }
            
            if (
                    $('#history_select').val().trim().length !== 0 && 
                    ($('#history_dates_input_from').val().trim().length !== 0 || 
                    $('#history_dates_input_to').val().trim().length !== 0) ||
                    ($('#free_number_input_from').val().trim().length !== 0 || 
                    $('#free_number_input_to').val().trim().length !== 0)
                ){
                if ($('#history_select').val() != 9){
                    $('#free_number_input_from, #free_number_input_to').val("");
                }
                else{
                    $('#history_dates_input_from, #history_dates_input_to').val("");
                }
                
                collected.history_from = $('#history_dates_input_from').datepicker("getDate")/1000;
                collected.history_to = $('#history_dates_input_to').datepicker("getDate")/1000;
                collected.history_type = $('#history_select').val(); 
            }
            
            if ($('#properties_select').val() !== null) collected.property = $('#properties_select').val();                    
            if ($('#price_from_input').val().trim().length !== 0 && $('#price_to_input').val().trim().length !== 0) collected.currency = $('#currency_select').val();                    
            if ($('#price_from_input').val().trim().length !== 0) collected.price_from = utils.numberRemoveCommas($('#price_from_input').val().trim());   
            if ($('#price_to_input').val().trim().length !== 0) collected.price_to = utils.numberRemoveCommas($('#price_to_input').val().trim());                       
            if ($('#free_number_input_from').val().trim().length !== 0) collected.free_number_from = $('#free_number_input_from').val().trim();   
            if ($('#free_number_input_to').val().trim().length !== 0) collected.free_number_to = $('#free_number_input_to').val().trim();
            if ($('#age_input_from').val().trim().length !== 0) collected.age_from = $('#age_input_from').val();
            if ($('#age_input_to').val().trim().length !== 0) collected.age_to = $('#age_input_to').val();
            if ($('#floors_input_from').val().trim().length !== 0) collected.floors_from = $('#floors_input_from').val();                    
            if ($('#floors_input_to').val().trim().length !== 0) collected.floors_to = $('#floors_input_to').val();   
            if ($('#house_num_input').val().trim().length !== 0) collected.house_num = $('#house_num_input').val();   
            
            if (($('#rooms_input_from').val().trim().length !== 0 || $('#rooms_input_to').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0){
                collected.rooms_from = $('#rooms_input_from').val();  
                collected.rooms_to = $('#rooms_input_to').val();
                collected.rooms_type = $('#rooms_type_select').val();
            }
            
            if ($('#select_project').val().trim().length !== 0) collected.project = $('#select_project').val();                   

            $.post("/api/search/createnew.json",{
                id: this.temporary_id,
                data: JSON.stringify(collected)
            },function (response){
                //console.log(response);
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    location.href = "map?search="+response;
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.updateList = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    utils.hlEmpty(this);
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            }
            
            if (this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 1;
            collected.country = $('#country').val().trim().length != "" ? this.geoloc.country : null;
            collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood) : null;
            collected.city = $('#locality').val().trim().length != "" ? this.geoloc.city : null;
            collected.lat = this.geoloc.lat != "" ? this.geoloc.lat : null;
            collected.lng = this.geoloc.lng != "" ? this.geoloc.lng : null;
            
            if (this.geo_mode === 1){
                collected.street = this.geoloc.street.length > 0 ? this.geoloc.street : null;
                collected.contour = null;
            }
            else{
                collected.contour = $('#contour_select').val() != 0 && $('#contour_select').val() != -1 ? $('#contour_select').val() : null;
                collected.street = null;
            }
            
            collected.ascription = $('#ascription_select').val();
            collected.status = $('#status_select').val();            
            collected.elevator = $('#elevator_advopt_check:checked').length !== 0 ? 1 : null;
            collected.air_cond = $('#aircond_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.parking = $('#parking_advopt_check:checked').length !== 0 ? 1 : null;
            collected.no_last_floor = $('#nolastfloor_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.no_ground_floor = $('#nogroundfloor_advopt_check:checked').length !== 0 ? 1 : null;
            collected.furniture = $('#furniture_select').val().trim().length !== 0 ? $('#furniture_select').val() : null;                   
            collected.agent = $('#select_agent').val() != 0 ? $('#select_agent').val() : null;                    
            collected.object_type = ($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_type_select').val() : null; 
            collected.object_size_from = $('#object_size_input_from').val() != 0 && $('#object_size_input_from').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_from').val() : null; 
            collected.object_size_to = $('#object_size_input_to').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_to').val() : null; 
            collected.object_dimensions = $('#object_size_dims_select').val();//($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_dims_select').val() : null;
            
            if ($('#history_select').val() != 9){
                $('#free_number_input_from, #free_number_input_to').val("");
            }
            else{
                $('#history_dates_input_from, #history_dates_input_to').val("");
            }
            
            collected.history_type = 
                ($('#history_dates_input_to').val().trim().length !== 0 || 
                $('#history_dates_input_from').val().trim().length !== 0 ||
                $('#free_number_input_from').val().trim().length !== 0 || 
                $('#free_number_input_to').val().trim().length !== 0) && 
                $('#history_select').val().trim().length !== 0 ? $('#history_select').val() : null; 
            collected.history_from = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_from').datepicker("getDate")/1000 : null; 
            collected.history_to = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_to').datepicker("getDate")/1000 : null; 
            
            if (
                    $('#locality').val().trim().length == 0 && 
                    utils.isEmpty(collected.history_from) &&
                    utils.isEmpty(collected.history_to)
            ){
                var d = new Date();
                var three_days_seconds = 259200;
                
                collected.history_from = Math.floor(d/1000)-three_days_seconds;
                collected.history_to = Math.floor(d/1000);
                collected.history_type = 0;
                
                utils.warningModal(localization.getVariable("too_mush_in_israel"));
            }
            
            collected.property = $('#properties_select').val();                    
            collected.currency = $('#currency_select').val();                    
            collected.price_from = $('#price_from_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_from_input').val().trim()) : null;   
            collected.price_to = $('#price_to_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_to_input').val().trim()) : null;                       
            collected.free_number_from = $('#free_number_input_from').val().trim().length !== 0 ? $('#free_number_input_from').val().trim() : null;   
            collected.free_number_to = $('#free_number_input_to').val().trim().length !== 0 ? $('#free_number_input_to').val().trim() : null;
            collected.age_from = $('#age_input_from').val().trim().length !== 0 ? $('#age_input_from').val() : null;
            collected.age_to = $('#age_input_to').val().trim().length !== 0 ? $('#age_input_to').val() : null;
            collected.floors_from = $('#floors_input_from').val().trim().length !== 0 ? $('#floors_input_from').val() : null;                    
            collected.floors_to = $('#floors_input_to').val().trim().length !== 0 ? $('#floors_input_to').val() : null;      
            collected.house_num = $('#house_num_input').val().trim().length !== 0 ? $('#house_num_input').val() : null;      
            collected.rooms_type = ($('#rooms_input_to').val().trim().length !== 0 || $('#rooms_input_from').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_type_select').val() : null; 
            collected.rooms_from = $('#rooms_input_from').val() != 0 && $('#rooms_input_from').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_from').val() : null; 
            collected.rooms_to = $('#rooms_input_to').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_to').val() : null; 
            collected.project = $('#select_project').val().trim().length !== 0 ? $('#select_project').val() : null;                   
            collected.special_by = $('#special_by_select').val().length !== 0 ? $('#special_by_select').val() : null;
            collected.special_argument = $('#special_argument_input').val().trim().length !== 0 ? $('#special_argument_input').val() : null;

            $.post("/api/search/update.json",{
                id: this.data.id,
                data: JSON.stringify(collected)
            },function (response){
                utils.removeHtmlSpinner("list_search_button");
                
                if (response.error != undefined){
                    utils.errorModal(response.error.description);
                }
                else{ 
                    if ($('#contour_select').val() == 0 && polygon != null && $('#geo_mode_select').val() == 2){
                        createTemporaryContour(response);
                    }
                    
                    //location.href = "query?id="+response+"&response="+search.response_type;
                    urlparser.setParameter("id", response);
                    urlparser.setParameter("response", search.response_type);
                    $('#property_results_table tbody tr, #property_results_table_expanded tbody tr').remove();
                    response_list.properties = null;
                    $('#property_results_area').addClass("response_list_loader");
                    $('#property_results_area .no_results_empty_text_div, #property_results_area .no_results_text_div').hide();
                    
                    search.getAsync();
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.updateMap = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    utils.hlEmpty(this);
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            }
            
            if (this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 1;
            collected.country = $('#country').val().trim().length != "" ? this.geoloc.country : null;
            collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood) : null;
            collected.city = $('#locality').val().trim().length != "" ? this.geoloc.city : null;
            collected.lat = this.geoloc.lat != "" ? this.geoloc.lat : null;
            collected.lng = this.geoloc.lng != "" ? this.geoloc.lng : null;
            
            if (this.geo_mode === 1){
                collected.street = this.geoloc.street.length > 0 ? this.geoloc.street : null;
                collected.contour = null;
            }
            else{
                collected.contour = $('#contour_select').val() != 0 && $('#contour_select').val() != -1 ? $('#contour_select').val() : null;
                collected.street = null;
            }
            
            collected.ascription = $('#ascription_select').val();
            collected.status = $('#status_select').val();            
            collected.elevator = $('#elevator_advopt_check:checked').length !== 0 ? 1 : null;
            collected.air_cond = $('#aircond_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.parking = $('#parking_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.furniture = $('#furniture_select').val().trim().length !== 0 ? $('#furniture_select').val() : null;                   
            collected.agent = $('#select_agent').val() != 0 ? $('#select_agent').val() : null;
            collected.object_type = ($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_type_select').val() : null; 
            collected.object_size_from = $('#object_size_input_from').val() != 0 && $('#object_size_input_from').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_from').val() : null; 
            collected.object_size_to = $('#object_size_input_to').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_to').val() : null; 
            collected.object_dimensions = $('#object_size_dims_select').val();//($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_dims_select').val() : null;
            
            if ($('#history_select').val() != 9){
                $('#free_number_input_from, #free_number_input_to').val("");
            }
            else{
                $('#history_dates_input_from, #history_dates_input_to').val("");
            }
            
            collected.history_type = 
                ($('#history_dates_input_to').val().trim().length !== 0 || 
                $('#history_dates_input_from').val().trim().length !== 0 ||
                $('#free_number_input_from').val().trim().length !== 0 || 
                $('#free_number_input_to').val().trim().length !== 0) && 
                $('#history_select').val().trim().length !== 0 ? $('#history_select').val() : null; 
            collected.history_from = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_from').datepicker("getDate")/1000 : null; 
            collected.history_to = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_to').datepicker("getDate")/1000 : null; 
            collected.property = $('#properties_select').val();                    
            collected.currency = $('#currency_select').val();                    
            collected.price_from = $('#price_from_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_from_input').val().trim()) : null;   
            collected.price_to = $('#price_to_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_to_input').val().trim()) : null;                       
            collected.free_number_from = $('#free_number_input_from').val().trim().length !== 0 ? $('#free_number_input_from').val().trim() : null;   
            collected.free_number_to = $('#free_number_input_to').val().trim().length !== 0 ? $('#free_number_input_to').val().trim() : null;
            collected.age_from = $('#age_input_from').val().trim().length !== 0 ? $('#age_input_from').val() : null;
            collected.age_to = $('#age_input_to').val().trim().length !== 0 ? $('#age_input_to').val() : null;
            collected.floors_from = $('#floors_input_from').val().trim().length !== 0 ? $('#floors_input_from').val() : null;                    
            collected.floors_to = $('#floors_input_to').val().trim().length !== 0 ? $('#floors_input_to').val() : null;  
            collected.house_num = $('#house_num_input').val().trim().length !== 0 ? $('#house_num_input').val() : null;  
            collected.rooms_type = ($('#rooms_input_to').val().trim().length !== 0 || $('#rooms_input_from').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_type_select').val() : null; 
            collected.rooms_from = $('#rooms_input_from').val() != 0 && $('#rooms_input_from').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_from').val() : null; 
            collected.rooms_to = $('#rooms_input_to').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_to').val() : null; 
            collected.project = $('#select_project').val().trim().length !== 0 ? $('#select_project').val() : null;                   

            $.post("/api/search/update.json",{
                id: this.data.id,
                data: JSON.stringify(collected)
            },function (response){
                utils.removeHtmlSpinner("list_search_button");
                
                if (response.error != undefined){
                    utils.errorModal(response.error.description);
                }
                else{ 
                    if ($('#contour_select').val() == 0 && polygon != null && $('#geo_mode_select').val() == 2){
                        createTemporaryContour(response);
                    }
                    
                    location.href = "map?search="+response;
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.set = function(){
        var collected = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().trim().length === 0){
                    utils.hlEmpty(this);
                    throw "Some of neccesary fields (marked by *) are empry!";
                }
            }
            
            if (this.geoloc.neighborhood === undefined && $('#neighborhood').val().trim().length > 0 && synonim.current_selected.neighborhood == null){
                $('#neighborhood_not_selected_error').show();
                $('#neighborhood').focus();
                return 0;
            }
            
            if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                $('#street_not_selected_error').show();
                $('#route_input input.ui-autocomplete-input').focus();
                return 0;
            }
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 1;
            collected.title = this.mode === 1 ? this.temporary_title : this.data.title;
            collected.country = $('#country').val().trim().length != "" ? this.geoloc.country : null;
            collected.neighborhood = $('#neighborhood').val().trim().length > 0 ? (this.geoloc.neighborhood != null ? this.geoloc.neighborhood : synonim.current_selected.neighborhood) : null;
            collected.city = $('#locality').val().trim().length != "" ? this.geoloc.city : null;
            collected.lat = this.geoloc.lat != "" ? this.geoloc.lat : null;
            collected.lng = this.geoloc.lng != "" ? this.geoloc.lng : null;
            
            if (this.geo_mode === 1){
                collected.street = this.geoloc.street.length > 0 ? this.geoloc.street : null;
                collected.contour = null;
            }
            else{
                collected.contour = $('#contour_select').val() != 0 && $('#contour_select').val() != -1 ? $('#contour_select').val() : null;
                collected.street = null;
            }
            
            collected.ascription = $('#ascription_select').val();
            collected.status = $('#status_select').val();            
            collected.elevator = $('#elevator_advopt_check:checked').length !== 0 ? 1 : null;
            collected.air_cond = $('#aircond_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.parking = $('#parking_advopt_check:checked').length !== 0 ? 1 : null;                    
            collected.furniture = $('#furniture_select').val().trim().length !== 0 ? $('#furniture_select').val() : null;                   
            collected.agent = $('#select_agent').val() != 0 ? $('#select_agent').val() : null;                    
            collected.object_type = ($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_type_select').val() : null; 
            collected.object_size_from = $('#object_size_input_from').val() != 0 && $('#object_size_input_from').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_from').val() : null; 
            collected.object_size_to = $('#object_size_input_to').val().trim().length !== 0 && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_input_to').val() : null; 
            collected.object_dimensions = $('#object_size_dims_select').val();//($('#object_size_input_to').val().trim().length !== 0 || $('#object_size_input_from').val().trim().length !== 0) && $('#object_type_select').val().trim().length !== 0 ? $('#object_size_dims_select').val() : null;
            
            if ($('#history_select').val() != 9){
                $('#free_number_input_from, #free_number_input_to').val("");
            }
            else{
                $('#history_dates_input_from, #history_dates_input_to').val("");
            }
            
            collected.history_type = 
                ($('#history_dates_input_to').val().trim().length !== 0 || 
                $('#history_dates_input_from').val().trim().length !== 0 ||
                $('#free_number_input_from').val().trim().length !== 0 || 
                $('#free_number_input_to').val().trim().length !== 0) && 
                $('#history_select').val().trim().length !== 0 ? $('#history_select').val() : null; 
            collected.history_from = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_from').datepicker("getDate")/1000 : null; 
            collected.history_to = ($('#history_dates_input_to').val().trim().length !== 0 || $('#history_dates_input_from').val().trim().length !== 0) && $('#history_select').val().trim().length !== 0 ? $('#history_dates_input_to').datepicker("getDate")/1000 : null; 
            collected.property = $('#properties_select').val();                    
            collected.currency = $('#currency_select').val();                    
            collected.price_from = $('#price_from_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_from_input').val().trim()) : null;   
            collected.price_to = $('#price_to_input').val().trim() != 0 ? utils.numberRemoveCommas($('#price_to_input').val().trim()) : null;                       
            collected.free_number_from = $('#free_number_input_from').val().trim().length !== 0 ? $('#free_number_input_from').val().trim() : null;   
            collected.free_number_to = $('#free_number_input_to').val().trim().length !== 0 ? $('#free_number_input_to').val().trim() : null;
            collected.age_from = $('#age_input_from').val().trim().length !== 0 ? $('#age_input_from').val() : null;
            collected.age_to = $('#age_input_to').val().trim().length !== 0 ? $('#age_input_to').val() : null;
            collected.floors_from = $('#floors_input_from').val().trim().length !== 0 ? $('#floors_input_from').val() : null;                    
            collected.floors_to = $('#floors_input_to').val().trim().length !== 0 ? $('#floors_input_to').val() : null;
            collected.house_num = $('#house_num_input').val().trim().length !== 0 ? $('#house_num_input').val() : null;
            collected.rooms_type = ($('#rooms_input_to').val().trim().length !== 0 || $('#rooms_input_from').val().trim().length !== 0) && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_type_select').val() : null; 
            collected.rooms_from = $('#rooms_input_from').val() != 0 && $('#rooms_input_from').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_from').val() : null; 
            collected.rooms_to = $('#rooms_input_to').val().trim().length !== 0 && $('#rooms_type_select').val().trim().length !== 0 ? $('#rooms_input_to').val() : null; 
            collected.project = $('#select_project').val().trim().length !== 0 ? $('#select_project').val() : null;
            collected.special_by = $('#special_by_select').val().length !== 0 ? $('#special_by_select').val() : null;
            collected.special_argument = $('#special_argument_input').val().trim().length !== 0 ? $('#special_argument_input').val() : null;

            $.post("/api/search/set.json",{
                id: this.mode == 1 ? this.temporary_id : this.data.id,
                data: JSON.stringify(collected)
            },function (response){
                $('#save_search_modal').modal('hide');
                
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    search.temporary_id = null;
                    search.mode = 2;
                    urlparser.setParameter("id", response);
                    urlparser.setParameter("response", search.response_type);
                    showSuccess(localization.getVariable("search_saved"));
                    search.get();
                    
                    if ($('#contour_select').val() == 0 && polygon != null && $('#geo_mode_select').val() == 2){
                        createTemporaryContour(response);
                    }
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.newmode = function(){
        $.post("/api/search/createtemporary.json",{
        },function (response){
            if (response.error != undefined)
                utils.errorModal(response.error.description);
            else search.temporary_id = response;
        });
        
        //for (var i = 0; i < this.form_buttons_to_block.length; i++)
            //$('#'+this.form_buttons_to_block[i]).attr("disabled", true);
    };
    
    this.onPriceFromKeyUp = function(){
        var price_value = utils.numberRemoveCommas($('#price_from_input').val());
        $('#price_from_input').val(utils.numberWithCommas(price_value));
    };
    
    this.onPriceToKeyUp = function(){
        var price_value = utils.numberRemoveCommas($('#price_to_input').val());
        $('#price_to_input').val(utils.numberWithCommas(price_value));
    };
    
    this.onPriceKeyUp = function(){
        var price_value = utils.numberRemoveCommasOnly($('#price_exinput_input').val());
        $('#price_exinput_input').val(utils.numberWithCommasNoTrim(price_value));
    };
    
    this.onRoomsFromKeyUp = function(){
        var rooms_value = utils.floatReplaceComma($('#rooms_input_from').val());
        $('#rooms_input_from').val(rooms_value);
    };
    
    this.onRoomsToKeyUp = function(){
        var rooms_value = utils.floatReplaceComma($('#rooms_input_to').val());
        $('#rooms_input_to').val(rooms_value);
    };
    
    this.focused_input_id = null;
    this.showed_multiselect_id = null;
    
    this.showMultiSelect = function(input_id, selector_id){
        if (this.showed_multiselect_id != null){
            $('#'+this.showed_multiselect_id).hide();
        }
        
        this.focused_input_id = input_id;
        this.showed_multiselect_id = selector_id;
        $('#'+selector_id).show();
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
    
    this.save = function(){
        this.getSearchesListForSave();
        $('#save_search_modal').modal('show');
    };
    
    this.setTitle = function(){
        if ($('#search_name_input').val().trim().length !== 0){
            if (this.mode === 2){ 
                this.data.title = $('#search_name_input').val().trim();
            }
            else if (this.mode === 1){ 
                this.temporary_title = $('#search_name_input').val().trim();
            }
            
            if (this.mode === 2){
                if (this.data.title == null){
                    $('#save_search_modal').modal('show');
                }
                else if ($('#special_by_select').val().length === 0){
                    this.set();
                }
                else{ 
                    this.setSpecial();
                }
            }
            else if (this.mode === 1){
                if (this.temporary_title == null){
                    $('#save_search_modal').modal('show');
                }
                else if ($('#special_by_select').val().length === 0){
                    this.set();
                }
                else{ 
                    this.setSpecial();
                }
            }
            
            $('#search_name_input').val("");
        }
        else{
            $('#search_name_input').focus();
        }
    };
    
    this.openSaved = function(){
        this.getSearchesList();
        $('#saved_searches_modal').modal('show');
    };
    
    this.openSavedLists = function(){
        this.getSavedLists();
        $('#saved_lists_modal').modal('show');
        $('#title_alert').hide();
    };
    
    this.openSaveListModal = function(){
        if (response_list.property_phones.length > 0 && response_list.client_phones.length > 0){
            utils.warningModal(localization.getVariable("only_prop_or_client_list"));
        }
        else if (response_list.property_phones.length === 0 && response_list.client_phones.length === 0){
            $('#no_selected_cards_modal').modal('show');
        }
        else{
            this.getSavedListsForSave();
            $('#saved_lists_modal').modal('show');
            $('#title_alert').hide();
        }
    };
    
    this.changeGeoMode = function(){
        this.geo_mode = Number($('#geo_mode_select').val());
        
        /*if ($('#geo_mode_select').val() == 2){
            $('#contour_group, #draw_new_button').show();
        }
        else{
            $('#contour_group, #draw_new_button').hide();
        };*/
        
        switch (this.geo_mode){ // 1 - streets, 2 - contour
            case 1:
                $('#geo_mode_select').val(1);
                $('#contour_select_wrapper').hide();
                $('#streets_select_wrapper').show();
                help_tip.add("streets_mode_help_tip_span");
                //help_tip.remove("contour_select");
            break;
            case 2:
                $('#geo_mode_select').val(2);
                $('#contour_select_wrapper').show();
                $('#streets_select_wrapper').hide();
                $('#street_buttons_block').hide();
                help_tip.remove("streets_mode_help_tip_span");
                //help_tip.add("contour_select");
                
                //$.post("/api/contour/list.json",{
                //    search: search.data != null ? search.data.id : search.temporary_id
                //},function (response){
                    var response = global_data.contour_list;
                
                    if (response.length > 0){
                        $('#contour_select > .old').remove();
                        
                        for (var i = 0; i < response.length; i++){
                            if (response[i].temporary == 0){
                                $('#contour_select').append('<option class="old" value="'+response[i].id+'">'+response[i].title+'</option>');
                            }
                        }
                        
                        if (urlparser.getParameter("action") == "new_contour"){
                            $('#contour_select').val(0);
                        }
                        else if (this.data != null && $('#contour_select option[value='+this.data.contour+']').length === 1){
                            $('#contour_select').val(this.data != null && this.data.contour != null ? this.data.contour : 0);
                        }
                        else if (this.data == null && this.defaults.search.contour != null){
                            $('#contour_select').val(this.defaults.search.contour);
                        }
                        //else if ((this.data == null || this.data.contour == null) && this.defaults.search.contour == null){
                            //$('#contour_select').val(-1);
                            //console.log(5)
                        //}
                        else{
                            $('#contour_select').val(0);
                        }
                    }
                //});
            break;
        }
    };
    
    this.openContoursDropdown = function(){
        $('#contour_button').dropdown("toggle");
    };
    
    this.onGeoModeChange = function(){
        if (this.geo_mode == 2){            
            setTimeout("search.openContoursDropdown()", 200);                       
        }
    };
    
    this.changeStreetsMode = function(){
        this.streets_mode = Number($('#streets_mode_select').val());
        
        /*if ($('#geo_mode_select').val() == 2){
            $('#contour_group, #draw_new_button').show();
        }
        else{
            $('#contour_group, #draw_new_button').hide();
        };*/
        
        switch (this.streets_mode){ // 1 - streets, 2 - contour
            case 2:
                $('#streets_mode_select').val(2);
                $('#synonim_route').show();
                $('#route').val("").hide();
                //help_tip.remove("streets_mode_help_tip_span");
                //help_tip.add("synonim_route");
                $('#synonim_route').next().css("margin-right", "-19px");
            break;
            case 1:
                $('#streets_mode_select').val(1);
                $('#synonim_route').val("").hide();
                $('#route').show();
                //help_tip.remove("synonim_route");
                //help_tip.add("streets_mode_help_tip_span");
                $('#route').next().css("margin-right", "-19px");
            break;
        }
    };
    
    this.onSpecialByChange = function(){
        if ($('#special_by_select').val().length > 0){ 
            $('#special_argument_input').attr("disabled", false);
            $('#special_query_button').attr("disabled", false).show();
            //$('#list_search_button').attr("disabled", true);
            //$('#map_search_button').attr("disabled", true);
        }
        else{
            $('#special_argument_input').attr("disabled", true);
            $('#special_query_button').attr("disabled", true).hide();
        }
    };
    
    this.specialQuery = function(){
        var collected = {};
        
        try{
            if ($('#special_by_select').val().length === 0 || $('#special_argument_input').val().trim().length === 0)
                throw "Input both data type and query!";
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 2;
            if (this.geoloc.country !== "") collected.country = this.geoloc.country;
            if (this.geoloc.city !== "") collected.city = this.geoloc.city;
            collected.ascription = $('#ascription_select').val();
            collected.special_by = $('#special_by_select').val();
            collected.special_argument = $('#special_argument_input').val();
            
            $.post("/api/search/createnew.json",{
                id: this.temporary_id,
                data: JSON.stringify(collected)
            },function (response){
                //console.log(response);
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    location.href = "query?id="+response+"&response="+search.response_type;
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.updateSpecial = function(){
        var collected = {};
        
        try{
            if ($('#special_by_select').val().length === 0 || $('#special_argument_input').val().trim().length === 0)
                throw "Input both data type and query!";
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 2;
            collected.country = $('#country').val().trim().length != "" ? this.geoloc.country : null;
            collected.city = $('#locality').val().trim().length != "" ? this.geoloc.city : null;
            collected.ascription = $('#ascription_select').val();
            collected.special_by = $('#special_by_select').val().length !== 0 ? $('#special_by_select').val() : null;
            collected.special_argument = $('#special_argument_input').val().trim().length !== 0 ? $('#special_argument_input').val() : null;

            $.post("/api/search/update.json",{
                id: this.data.id,
                data: JSON.stringify(collected)
            },function (response){
                //console.log(response);
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    location.href = "query?id="+response+"&response="+search.response_type;
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.setSpecial = function(){
        var collected = {};
        
        try{
            if ($('#special_by_select').val().length === 0 || $('#special_argument_input').val().trim().length === 0)
                throw "Input both data type and query!";
            
            collected.stock = $('#stock_check:checked').length;
            collected.external = this.getExternalValues();
            collected.type = 2;
            collected.country = $('#country').val().trim().length != "" ? this.geoloc.country : null;
            collected.city = $('#locality').val().trim().length != "" ? this.geoloc.city : null;
            collected.ascription = $('#ascription_select').val();
            collected.title = this.mode === 1 ? this.temporary_title : this.data.title;
            collected.special_by = $('#special_by_select').val().length !== 0 ? $('#special_by_select').val() : null;
            collected.special_argument = $('#special_argument_input').val().trim().length !== 0 ? $('#special_argument_input').val() : null;
            
            $.post("/api/search/set.json",{
                id: this.mode == 1 ? this.temporary_id : this.data.id,
                data: JSON.stringify(collected)
            },function (response){
                $('#save_search_modal').modal('hide');
                
                if (response.error != undefined)
                    utils.errorModal(response.error.description);
                else{ 
                    search.temporary_id = null;
                    search.mode = 2;
                    urlparser.setParameter("id", response);
                    urlparser.setParameter("response", search.response_type);
                    showSuccess(localization.getVariable("search_saved"));
                    search.get();
                }
            });
        }
        catch(error){
            utils.errorModal(error);
        }
    };
    
    this.createNewCard = function(){
        $('#new_card_modal').modal("show");
    };
    
    this.addStreet = function(){
        if (this.streets_mode === 1){ // Google улица
            if ($("#route_input input.ui-autocomplete-input").val().trim().length !== 0 && this.geoloc.street_tmp != undefined && this.geoloc.street_tmp != null){
                this.geoloc.street.push(this.geoloc.street_tmp);
                this.geoloc.street_objects.push(this.geoloc.street_object_tmp);
                this.geoloc.street_tmp = null;
            }
            else{
                if ($('#route_input input.ui-autocomplete-input').val().trim().length > 0){
                    $('#street_not_selected_error').show();
                    $('#route_input input.ui-autocomplete-input').focus();
                    return 0;
                }
            }
        }
        else if (this.streets_mode === 2){ // синоним
            if ($("#route_input input.ui-autocomplete-input").val().trim().length !== 0 && this.geoloc.street_tmp != undefined && this.geoloc.street_tmp != null){
                this.geoloc.street.push(this.geoloc.street_tmp);
                this.geoloc.street_objects.push(this.geoloc.street_object_tmp);
                $("#route_input input.ui-autocomplete-input").val("");
                this.geoloc.street_tmp = null;
                $('#street_not_selected_error').hide();
            }
            else{
                if ($("#route_input input.ui-autocomplete-input").val().trim().length > 0){
                    $('#street_not_selected_error').show();
                    $("#route_input input.ui-autocomplete-input").focus();
                    return 0;
                }
            }
        }
        
        this.lightNotEmpty();
    };
    
    this.removeStreet = function(place_id){
        var result = [];
        
        for (var i = 0; i < this.geoloc.street.length; i++){
            if (this.geoloc.street[i] != place_id){
                result.push(this.geoloc.street[i]);
            }
        }
        
        /*if (this.newcard !== 1){
            this.fixChangeTime();
            this.changes["geoloc"] = {old: 1};
        }*/
        
        this.geoloc.street = result;
        this.lightNotEmpty();
    };
    
    this.showStreetBlock = function(){
        $('#street_buttons_block').show();
        utils.lightField($('#route'));
        $('#route').focus();
    };
    
    this.unhideSynonimAlert = function(){
        $('#synonim_cant_see_alert_tip').hide();
        $('#synonim_cant_see_alert').show();
            
        $.post("/api/defaults/set.json",{
            parameter: "synonim_alert_closed",
            value: 0
        }, null);
    };
    
    this.hideSynonimAlert = function(){
        $('#synonim_cant_see_alert_tip').show();
        $('#synonim_cant_see_alert').hide();
            
        $.post("/api/defaults/set.json",{
            parameter: "synonim_alert_closed",
            value: 1
        }, null);
    };
    
    this.onAgentChange = function(){
        if ($('#select_agent').val() == 0){
            $('#history_select').val(0);
        }
    };
    
    this.checkCityExisting = function(){
        if ($('#locality').val().trim().length === 0){
            $('#neighborhood').attr({disabled: true, placeholder: localization.getVariable("set_city_to_change")});
            $('#route_input input.ui-autocomplete-input').attr({disabled: true, placeholder: localization.getVariable("set_city_to_change")});
            $('#route_input').css({"background": "rgba(85, 107, 141, 0.19)", "font-weight": "bold"});
        }
    };
    
    this.clearing = function(){ // делает уборки в агентстве, нпример, удаляет старые аукционные карточки
        //$.post("/api/search/clearing.json", null, null);
    };
    
    this.bindEnterEvents = function(){
        var events = {
            dims_exinput_input: "search.find()",
            house_num_input: "search.find()",
            periods_exinput_input: "search.find()",
            status_input: "search.find()",
            properties_input: "search.find()",
            price_exinput_input: "search.find()",
            floors_exinput_input: "search.find()",
            rooms_exinput_input: "search.find()",
            age_exinput_input: "search.find()",
            special_argument_input: "search.findSpecial()",
            search_name_input: "search.setTitle()",
            try_now_enter_email_input: "tools.sendTryNowEnterEmail()",
            try_now_code_input: "tools.sendTryNowEnterCode()"
            
        };

        for (var key in events){
            $('#'+key).attr({
                "data-onenter-func": events[key],
                onkeypress: "utils.onEnter(event, this)"
            });
        }
    };
    
    this.contoursImportTurnCheckboxes = function(){
        if ($('.saved_contours_export_checkbox:visible').length === 0){
            $('.saved_contours_export_checkbox').show();
        }
        else{
            $('.saved_contours_export_checkbox').hide();
        }
    };
    
    this.contours_colected = [];
    this.exportContours = function(){
        $('.saved_contours_export_checkbox:checked').each(function(){
            search.contours_colected.push($(this).data("contour-id"));
        });
        
        $.post("/api/search/tryexportcontours.json",{
            password: MD5($('#export_contours_password_input').val()),
            contours: JSON.stringify(search.contours_colected)
        }, function(response){
            if (response != -1){
                $('#export_contours_password_input').hide();
                $('#export_contours_donwload_a').show().attr("href", "storage/"+response);
            }
        });
        
    };
    
    this.importContoursSendPass = function(){
        $.post("/api/search/tryimportcontours.json",{
            password: MD5($('#import_contours_password_input').val())
        }, function(response){
            if (response != -1){
                $('#import_contours_password_input').hide();
                $('#import_contours_select_input').show();
            }
        });
        
    };
    
    this.toggleExpanded = function(){ // проверяет, сохранено ли в куках состояние списка результатов выдачи и включает если было включено
        if (utils.getCookie("list_expanded") != undefined && utils.getCookie("list_expanded") == "true"){
            this.expandList();
        }
    };
    
    this.expandList = function(){
        if (!this.list_expanded){ // разворачиваем
            $('#left_side_panel_div > div:first-child').hide();
            $('#left_side_panel_div').css({"width": "0", "padding": 0});
            $('#right_side_panel_div').removeClass("col-md-6 col-lg-6").addClass("col-md-12 col-lg-12");
            $('#search_form_toggler').css("left", "0px");
            $('#search_form_toggler').toggleClass("changed");
            
            if (response_list.properties != null && response_list.properties.length > 0){
                $('#property_results_table').hide();
                $('#property_results_table_expanded').show();
            }
            
            if (response_list.clients != null && response_list.clients.length > 0){
                $('#client_results_table').hide();
                $('#client_results_table_expanded').show();
                $('#client_results_table_wrapper > span:first-child').hide();
            }
            
            $('#stock_check_wrapper').css({"float": "right", "margin-right": "10px"});
            $('#finded_counters_wrapper').css("clear", "none");
            $('#sorting_group').css("float", "right");
            utils.setCookie("list_expanded", true, {expires: 315360000});
            this.list_expanded = true;
        }
        else{ // сворачиваем
            $('#left_side_panel_div > div:first-child').show();
            $('#left_side_panel_div').css({"width": screen.width > 1023 ? "50%" : "100%", "padding": "0 15px"});
            $('#right_side_panel_div').removeClass("col-md-12 col-lg-12").addClass("col-md-6 col-lg-6");
            $('#search_form_toggler').css("left", "97%");
            $('#search_form_toggler').toggleClass("changed");
            
            if (response_list.properties != null && response_list.properties.length > 0){
                $('#property_results_table').show();
                $('#property_results_table_expanded').hide();
            }
            
            if (response_list.clients != null && response_list.clients.length > 0){
                $('#client_results_table').show();
                $('#client_results_table_expanded').hide();
                $('#client_results_table_wrapper > span:first-child').show();
            }
            
            $('#stock_check_wrapper').css({"float": "left", "margin-right": "0px"});
            $('#finded_counters_wrapper').css("clear", "both");
            $('#sorting_group').css("float", "left");
            utils.setCookie("list_expanded", false, {expires: 315360000});
            this.list_expanded = false;
        }
    };
    
    this.getExternalValues = function(){
        var response = [];
        
        if ($('.external_check:checked').length > 0){
            $('.external_check:checked').each(function(){
               response.push($(this).attr("name"));
            });
        }
        else{
            response = null;
        }
        
        return response;
    };
    
    this.tryUpdateCollectedCard = function(){
        if (response_list.property_phones.length === 0){
            $('#no_selected_cards_modal').modal("show");
        }
        else{
            this.updateCollectedCard();
        }
    };
    
    this.updateCollectedCard = function(){
        if (this.external_property_for_comparison != null){
            //debugger;
            var p = this.external_property_for_comparison;
            var p_types = p.types.replace(/\"/g, "");
            var no_corresponding_card = true;
            
            for (var i = 0; i < response_list.property_phones.length; i++){
                var array_key = utils.getJSONValueKey(response_list.properties, "id", response_list.property_phones[i].card);
                var property = response_list.properties[array_key];
                var list_types = property.types.replace(/\"/g, "");
                
                if (
                        (p.city == property.city || p.city_text == property.city_text) &&
                        (p.street == property.street || p.street_text == property.street_text) &&
                        p.rooms_count == property.rooms_count &&
                        p_types == list_types &&
                        p.floors_count == property.floors_count
                ){
                    no_corresponding_card = false;
                    this.updateCollectedAnyway(property.id, p.id);
                }
            }
            
            if (no_corresponding_card){
                $('#no_corresponding_card_update_button').unbind("click");
                $('#no_corresponding_card_update_button').click({pid: property.id, epid: p.id},function(e){
                    search.updateCollectedAnyway(e.data.pid, e.data.epid);
                    $('#no_corresponding_card_warning_modal').modal("hide");
                });
                $('#no_corresponding_card_warning_modal').modal("show");
            }
        }
    };
    
    this.updateCollectedAnyway = function(property_id, ex_property_id){
        $.post("/api/property/updatefromexternal.json",{ // там же делаем связку
            property: property_id,
            external_property: ex_property_id
        }, function(){
            utils.successModal(localization.getVariable("ext_card_already_exist_success"));                        
        });
    };
    
    this.lightNotEmpty = function(){
        $('.search_form_wrapper input, .search_form_wrapper select').each(function(){
            if ($(this).val() != null && $(this).val().length > 0){
                $(this).addClass("not_empty");
            }
            else{
                $(this).removeClass("not_empty");
            }
        });
        
        if (this.geoloc.street.length > 0){
            $('#route_input').css("background", "#faffbd");
        }
        else{
            $('#route_input').css("background", "white");
        }
        
        /*$('.search_form_wrapper .icheck:checked').each(function(){
            $(this).parent().css("background-color", "#faffbd");
        });
        
        $('.search_form_wrapper .icheck:unchecked').each(function(){
            $(this).parent().css("background-color", "rgba(0,0,0,0)");
        });*/
    };
    
    this.clearForm = function(){
        var untouchable = [
            "country",
            "locality",
            "ascription_select",
            "geo_mode_select",
            "object_type_select",
            "history_select",
            "rooms_type_select",
            "object_size_dims_select",
            "currency_select"
        ];

        $('#status_select').val(null);
        $('#properties_select').val(null);
        $('.search_form_wrapper .icheck').iCheck("uncheck");        
        $('#route_input').tagit("removeAll");
        this.geoloc.street = [];

        $('.search_form_wrapper input, .search_form_wrapper select').each(function(){
            if (untouchable.indexOf($(this).attr("id")) === -1){
                $(this).val("");
            }
        });
        
        this.lightNotEmpty();
    };
    
    this.onAscriptionChange = function(){
        if ($('#ascription_select').val() == 4){
            $('#ascription_select').val(0);
            utils.openInNewTab("http://www.yad2.co.il/Nadlan/sales.php");
        }
        else if ($('#ascription_select').val() == 5){
            $('#ascription_select').val(1);
            utils.openInNewTab("http://www.yad2.co.il/Nadlan/rent.php");
        }
    };
    
    this.onContourSelectChange = function(){
        if ($('#contour_select').val() == 0){
            if (urlparser.getParameter("id") == undefined){
                utils.warningModal(localization.getVariable("find_to_draw_contour_warnning"));
            }
            else{
                response_list.drawContour();
            }
        }
    };
}