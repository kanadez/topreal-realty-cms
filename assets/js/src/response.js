//var localization = new Localization();
//var urlparser = new URLparser();
//var utils = new Utils();
//var user = new User();
//var response_list = new Response();
//var owl = new Owl();
//var tools = new Tools();

//$(document).ajaxStop(function() {
    //response_list.createEmail();
//});

function ResponseList(){
    this.search_id = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : -1;
    this.list_id = urlparser.getParameter("list") != undefined ? urlparser.getParameter("list") : -1;
    this.data = null;
    this.clients = null;
    this.properties = null;
    this.form_options = null;
    this.currency_list = null;
    this.property_types = null;
    this.conditions = null;
    this.conditions_parsed = {};
    this.conditions_string = "";
    this.map = null;
    this.selected_property = [];
    this.view_mode = "list";
    this.imageviewers = [];
    this.mode = 2; // 1 - with picture, 2 - no picture 
    this.property_phones = [];
    this.client_phones = [];
    this.selected_cards = [];
    this.reduced = 0;
    this.selected = null; // id списка выбранных в выдаче
    this.all_marked = 0;
    this.over30key = 0; // ключ для показа маркеров если их больше 30
    this.direction = "f"; // направление слайдинга маркеров если больше 30. f = forward, b - backward
    this.step = 10; // шаг показа маркеров если их больше 30
    this.overstep = 0; // оверстеп при повороте направления
    this.sorted = 0; // флаг сортировки списка
    this.sorting_stack = {
        clients: [],
        properties: [],
        properties_external: []
    };
    this.street_names = []; // массив для сортировки срок, названий улиц
    this.touch_open_timer = null; // таймер для открытия недвижимости по задержке нажатия
    this.external_block = false; // тумблер для блокировки открытия внешней карточки без экстеншна
    this.collecting_forbidden = null; // тумблер для блокировки сбора данных если нет прав
    this.no_results = false; // становится тру если результаты поиска пустые
    
    this.init = function(){
        this.search_id = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : -1;
        this.list_id = urlparser.getParameter("list") != undefined ? urlparser.getParameter("list") : -1;
    
        $('#property_results_area').show();
        this.showButtons();
        
        $('#sorting_group').click(function(){
            if (urlparser.getParameter("id") == undefined){
                utils.warningModal(localization.getVariable("search_to_sort"));
            }
        });
        
        //this.search_id = urlparser.getParameter("search");
        //initGoogleMaps();
        
        //############## getting common user defaults ##########################//
        
        /*$.post("/api/defaults/get.json",{
        },function (result){
            if (result.error != undefined)
                showErrorMessage(result.error.description);
            else{
                response_list.defaults = result;
                
                for (var key in response_list.defaults){
                    switch (key) {
                        case "locale":
                            if (response_list.defaults[key] != null)
                                localization.setLocale(response_list.defaults[key]);
                            else localization.setDefault();
                        break;

                    }
                }
            }
        });*/
        
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
        
        //$.post("/api/search/getqueryformoptions.json",{
        //},function (result){
            var result = global_data.search_getqueryformoptions;
        
            if (result.error != undefined)
                utils.errorModal(response_list.error.description);
            else{
                response_list.form_options = result;
                
                /*for (var key in response_list.form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#ascription_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]+"</option>");
                        break;
                        case "property_type":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#properties_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]+"</option>");
                        break;
                        case "status":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#status_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]+"</option>");
                        break;
                        case "view":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#view_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]+"</option>");
                        break;
                        case "dimension":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#dims_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]["short_title"]+"</option>");
                        break;
                        case "direction":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#directions_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]+"</option>");
                        break;
                        case "currency":
                            for (var i = 0; i < response_list.form_options[key].length; i++)
                                $('#currency_select').append("<option value='"+i+"'>"+response_list.form_options[key][i]["symbol"]+"</option>");
                        break;
                    }
                }*/
                
                if (response_list.search_id !== -1){
                    response_list.get();
                }
                else if (urlparser.getParameter("list") == undefined){
                    //response_list.getEmpty();
                    $('#property_results_area').removeClass("response_list_loader");
                    $('#property_results_area').addClass("no_results_wrapper");
                    this.showOnboarding();
                }
                //else if (response_list.list_id !== -1)
                    //response_list.getList();
                
                //localization.toLocale();
            }
        //});
    };
    
    this.reInit = function(){ // init(), только уже асинхронно
        this.search_id = urlparser.getParameter("id");
        this.list_id = urlparser.getParameter("list");
        this.property_phones = [];
        this.client_phones = [];
        
        $('#search_entries_marked_span').text(0);
        $('#my_last_search_span, #my_first_search_span').hide();
        $('#no_name_span').show();
        $('#search_name_span').hide();
        $('#no_name_span > .search_date').text("("+utils.convertTimestampToDateTime(utils.getNow())+")");
    
        $('#property_results_area').show();
        this.hideOnboarding();
        this.showButtons();
        response_list.get();
    };
    
    this.showButtons = function(){
        $('#draw_polygon_area_div').hide();
        $('#saved_contours_button').show();
        //$('#mark_all_button').show();
        $('#output_group').show();
        $('#sorting_group').show();
        $('#del_card_button').show();
        $('#new_card_button').show();
        $('#switch_to_list_button').show();
        $('#list_average_button').show();
        $('#list_reduce_button').show();
        $('#to_calendar_button').show();
    };
    
    this.noResults = function(){
        this.no_results = true;
        this.hideOnboarding();
        
        if (urlparser.getParameter("id") == undefined){
            $('#property_results_area').addClass("no_results_wrapper");
            $('#property_results_area .no_results_empty_text_div').show();
        }
        else{
            $('#property_results_area').addClass("no_results_wrapper");
            $('#property_results_area .no_results_text_div').show();
        }
    };
    
    this.resultsHere = function(){
        if (this.no_results){
            $('#property_results_area').removeClass("no_results_wrapper");
            $('#property_results_area .no_results_empty_text_div, #property_results_area .no_results_text_div').hide();
            this.hideOnboarding();
            this.no_results = false;
        }
    };
    
    this.get = function(){
        $.post("/api/search/getshort.json",{
            search_id: this.search_id
        }, this.showResults);
    };
    
    this.getEmpty = function(){
        $.post("/api/search/getshortempty.json", {}, this.showResults);
    };
    
    this.showResults = function(result){
        response_list.properties = result.properties;
        response_list.clients = result.clients;
        response_list.conditions = result.conditions;
        response_list.street_googleac = result.street_googleac;

        $('#draw_new_button').unbind("click");
        $('#draw_new_button').click(function(){
            response_list.drawContour();
        });

        if (response_list.clients.length === 0){
            //$('#back_button').attr("href","query?id="+response_list.conditions.id);
            $('#switch_to_list_button').attr({href: response_list.search_id != -1 ? "query?id="+response_list.conditions.id+"&response=map" : "query?response=map"}).children("span").attr({locale: "to_map"});
            $('#switch_to_list_button').children("i").addClass("fa-globe").removeClass("fa-list");
            //localization.toLocale();
        }
        else{
            $('#switch_to_list_button').hide();
        }

        if (result.properties.length === 0 && result.clients.length === 0){
            if (search.data == null || search.data.default_search == 0){
                $('#save_search_button').hide();
            }
            
            $('#list_average_button').hide();
            $('#list_reduce_button').hide();
            //$('#switch_to_list_button').hide();
            $('#to_calendar_button').hide();
            //$('#mark_all_button').hide();
            $('#output_group').hide();
            $('#sorting_group').click(function(){
                utils.warningModal(localization.getVariable("search_to_sort"));
            }).children("ul").hide();
            $('#del_card_button').hide();
            
            response_list.noResults();
        }
        else{
            response_list.resultsHere();
        }

        if (result.properties.length === 0){
            //$('#property_results_area').hide();
            //response_list.noResults();
        }

        $('#stock_check_wrapper').show();
        
        /*
        for (var key in response_list.conditions)
            if (response_list.conditions[key] != null && response_list.conditions[key] != "")
                switch (key) {
                    case "city":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "lat":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "lng":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "neighborhood":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "street":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "ascription":
                        response_list.conditions_parsed[key] = "<span locale='"+response_list.form_options.ascription[response_list.conditions[key]]+"'></span>";
                    break;
                    case "status":
                        var object = JSON.parse(response_list.conditions[key]);
                        response_list.conditions_parsed[key] = "<span locale='"+response_list.form_options.status[object[0]]+"'></span>";

                        if (object.length > 1)
                            for (var i = 1; i < object.length; i++){
                                response_list.conditions_parsed[key] += "/"+"<span locale='"+response_list.form_options.status[object[i]]+"'></span>";
                            }
                    break;
                    case "furniture":
                        response_list.conditions_parsed[key] = "<span locale='furniture_noregister_span'>furniture</span>: "+(response_list.conditions[key] == 0 ? "<span locale='no'>no</span>" : "<span locale='yes'>yes</span>");
                    break;
                    case "property":
                        var object = JSON.parse(response_list.conditions[key]);
                        response_list.conditions_parsed[key] = "<span locale='"+response_list.form_options.property_type[object[0]]+"'></span>";

                        if (object.length > 1)
                            for (var i = 1; i < object.length; i++){
                                response_list.conditions_parsed[key] += "/"+"<span locale='"+response_list.form_options.property_type[object[i]]+"'></span>";
                            }
                    break;
                    case "price_from":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "price_to":
                        response_list.conditions_parsed[key] = "-"+response_list.conditions[key];
                    break;
                    case "currency":
                        response_list.conditions_parsed[key] = response_list.form_options.currency[response_list.conditions[key]]["symbol"];
                    break;
                    case "object_type":
                        if (response_list.conditions[key] == 2) // 1 - house, 2 - flat
                            response_list.conditions_parsed[key] = "<span locale='lot_noregister_span'>lot</span>";
                        else response_list.conditions_parsed[key] = "<span locale='home_noregister_span'>home</span>";
                    break;    
                    case "object_size_from":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "object_size_to":
                        response_list.conditions_parsed[key] = "-"+response_list.conditions[key];
                    break;
                    case "object_dimensions":
                        response_list.conditions_parsed[key] = "<span locale='"+response_list.form_options.dimension[response_list.conditions[key]]["locale"]+"'>"+response_list.form_options.dimension[response_list.conditions[key]]["short_title"]+"</span>";
                    break;
                    case "age_from":
                        response_list.conditions_parsed[key] = "<span locale='built_noregister_span'>built</span> "+response_list.conditions[key];
                    break;
                    case "age_to":
                        response_list.conditions_parsed[key] = "-"+response_list.conditions[key];
                    break;
                    case "floors_from":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "floors_to":
                        response_list.conditions_parsed[key] = "-"+response_list.conditions[key]+" <span locale='floors_noregister_span'>floors</span>";
                    break;
                    case "rooms_from":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "rooms_to":
                        response_list.conditions_parsed[key] = "-"+response_list.conditions[key]+" <span locale='rooms_noregister_span'>rooms</span>";
                    break;
                    case "project":
                        response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;  
                    case "history_type":
                        if (response_list.conditions[key] == 0)
                            response_list.conditions_parsed[key] = "<span locale='lastupd_noregister_span'>last update</span>:";
                        else if (response_list.conditions[key] == 1)
                            response_list.conditions_parsed[key] = "<span locale='free_noregister_span'>free from</span>:";
                        else if (response_list.conditions[key] == 2)
                            response_list.conditions_parsed[key] = "<span locale='in_out_call'>in/out call</span>:";
                        else if (response_list.conditions[key] == 3)
                            response_list.conditions_parsed[key] = "<span locale='email_in_out'>e-Mail in/out</span>:";
                        else if (response_list.conditions[key] == 4)
                            response_list.conditions_parsed[key] = "<span locale='sms_in_out'>SMS in/out</span>:";
                        else if (response_list.conditions[key] == 5)
                            response_list.conditions_parsed[key] = "<span locale='last_propose_span'>last propose</span>:";
                    break;
                    case "history_from":
                        response_list.conditions_parsed[key] = utils.convertTimestampForDatepicker(response_list.conditions[key]);
                    break;
                    case "history_to":
                        response_list.conditions_parsed[key] = utils.convertTimestampForDatepicker(response_list.conditions[key]);
                    break;
                    case "parking":
                        response_list.conditions_parsed[key] = "<span locale='parking_noregister_span'>parking</span>";
                    break;
                    case "facade":
                        response_list.conditions_parsed[key] = "<span locale='facade_noregister_span'>facade</span>";
                    break;
                    case "air_cond":
                        response_list.conditions_parsed[key] = "<span locale='air_cond_noregister_span'>air conditioner</span>";
                    break;
                    case "elevator":
                        response_list.conditions_parsed[key] = "<span locale='elevator_noregister_span'>elevator</span>";
                    break;
                    case "no_ground_floor":
                        response_list.conditions_parsed[key] = "<span locale='no_ground_floor_noregister_span'>no ground floor</span>";
                    break;
                    case "no_last_floor":
                        response_list.conditions_parsed[key] = "<span locale='no_last_floor_noregister_span'>no last floor</span>";
                    break;
                    case "special_by":
                        switch (response_list.conditions[key]) {
                            case "0":
                               response_list.conditions_parsed[key] = "<span locale='by_text_span'>by text:</span>";
                            break;
                            case "1":
                               response_list.conditions_parsed[key] = "<span locale='by_agreement_span'>by greement №:</span>";
                            break;
                            case "2":
                               response_list.conditions_parsed[key] = "<span locale='by_card_span'>by card:</span>";
                            break;
                            case "3":
                               response_list.conditions_parsed[key] = "<span locale='by_phone_span'>by phone:</span>";
                            break;
                            case "4":
                               response_list.conditions_parsed[key] = "<span locale='by_email_span'>by e-Mail:</span>";
                            break;
                        }
                    break;
                    case "special_argument":
                        if (response_list.conditions["special_by"] == "5"){
                            var parsed_argument = JSON.parse(response_list.conditions["special_argument"]);
                            response_list.conditions_parsed["special_by"] = "by "+parsed_argument.object_type+" card "+parsed_argument.object_id+" phone(s):";
                            response_list.conditions_parsed[key] = "";

                            for (var i = 0; i < parsed_argument.phones.length; i++)
                                response_list.conditions_parsed[key] += (i !== 0 ? ", " : "")+parsed_argument.phones[i];

                            $('#back_button').attr("href", parsed_argument.object_type+"?id="+parsed_argument.object_id);
                        }
                        else response_list.conditions_parsed[key] = response_list.conditions[key];
                    break;
                    case "contour":
                        response_list.conditions_parsed[key] = "<span locale='contour_noregister_span'>contour</span>";
                    break;
                }

        if (response_list.conditions.type == 1){
            if (response_list.conditions_parsed.ascription !== undefined) $('#search_conditions_span').append(response_list.conditions_parsed.ascription);
            if (response_list.conditions_parsed.status !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.status);
            if (response_list.conditions_parsed.floors_from !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.floors_from+response_list.conditions_parsed.floors_to);
            if (response_list.conditions_parsed.rooms_from !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.rooms_from+response_list.conditions_parsed.rooms_to);
            if (response_list.conditions_parsed.property !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.property);
            if (response_list.conditions_parsed.age_from !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.age_from+response_list.conditions_parsed.age_to);
            if (response_list.conditions_parsed.object_size_from !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.object_size_from+response_list.conditions_parsed.object_size_to+" "+response_list.conditions_parsed.object_dimensions+" "+response_list.conditions_parsed.object_type);
            if (response_list.conditions_parsed.contour !== undefined){
                $('#search_conditions_span').append(", <span locale='contour_noregister_span'>contour</span>: <span id='contour_id'></span>");
            }
            if (response_list.conditions_parsed.city !== undefined) {
                $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_list.conditions_parsed.city+"'></span>");
                placeDetailsByPlaceIdNoAutocomplete(response_list.conditions_parsed.city, service_city);
            }
            if (response_list.conditions_parsed.neighborhood !== undefined) {
                $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_list.conditions_parsed.neighborhood+"'></span>");
                placeDetailsByPlaceIdNoAutocomplete(response_list.conditions_parsed.neighborhood, service_neighborhood);
            }
            if (response_list.conditions_parsed.street !== undefined) {
                $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_list.conditions_parsed.street+"'></span>");
                placeDetailsByPlaceIdNoAutocomplete(response_list.conditions_parsed.street, service_route);
            }
            if (response_list.conditions_parsed.price_from !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.price_from+response_list.conditions_parsed.price_to+" "+response_list.conditions_parsed.currency);
            if (response_list.conditions_parsed.project !== undefined) {
                $('#search_conditions_span').append(", <span locale='project_noregister_span'>project</span>: <span id='conditions_project'></span>");
                $.post("/api/agency/getprojectslist.json",{
                },function (result){
                    for (var i = 0; i < result.length; i++)
                        if (response_list.conditions_parsed.project == result[i].id)
                            $('#conditions_project').text(result[i].title);
                });
            }
            if (response_list.conditions_parsed.furniture !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.furniture);
            if (response_list.conditions_parsed.parking !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.parking);
            if (response_list.conditions_parsed.facade !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.facade);
            if (response_list.conditions_parsed.air_cond !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.air_cond);
            if (response_list.conditions_parsed.elevator !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.elevator);
            if (response_list.conditions_parsed.no_ground_floor !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.no_ground_floor);
            if (response_list.conditions_parsed.no_last_floor !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.no_last_floor);
            if (response_list.conditions_parsed.history_type !== undefined) $('#search_conditions_span').append(", "+response_list.conditions_parsed.history_type+" "+response_list.conditions_parsed.history_from+" - "+response_list.conditions_parsed.history_to);
        }
        else{
            if (response_list.conditions_parsed.special_by !== undefined) 
                $('#search_conditions_span').append(response_list.conditions_parsed.special_by+" "+response_list.conditions_parsed.special_argument);
        }
        */

        $('#search_entries_founded_span, #search_entries_showed_span').html(response_list.properties.length+response_list.clients.length);
        $('#switch_to_list_button').attr("disabled", false);
        $('#stock_check').iCheck("enable");
        $('#over30_wrapper').hide();

        //############# creating list with pictures

        /*for (var i = 0; i < response_list.property_list.length; i++){
            var currency_id = response_list.property_list[i]["iCurrencyId"];
            response_list.setMapMarker(response_list.property_list[i]["_iLat"], response_list.property_list[i]["_iLng"], response_list.property_list[i]["iPrice"]+" "+response_list.currency_list[currency_id]["symbol"], response_list.property_list[i]["iPropertyId"]);
            if ((response_list.property_list[i]["iFloorFrom"] == response_list.property_list[i]["iFloorTo"]) && response_list.property_list[i]["iFloorsCount"] != "")
                var floors_string = response_list.property_list[i]["iFloorFrom"]+"/"+response_list.property_list[i]["iFloorsCount"];
            else
                var floors_string = response_list.property_list[i]["iFloorFrom"]+"-"+response_list.property_list[i]["iFloorTo"]

            $('#list_results_area').append('<div class="col-md-2"><div class="panel panel-default"><div class="panel-body">\n\<div class="viewer_image_wrapper"><div class="viewer_left_arrow" onclick="response_list.imageviewers['+i+'].slideThumbLeft()"></div><div id="image_wrapper_'+i+'"><img src="/storage/5h78f333.jpg" /></div><div class="viewer_right_arrow" onclick="response_list.imageviewers['+i+'].slideThumbRight()"></div></div><div id="description_wrapper" class="desc_wrapper"><span class="price">'+response_list.property_list[i]["iPrice"]+' '+response_list.currency_list[currency_id]["symbol"]+'</span><div class="desc_legend"><br>'+response_list.property_list[i]["_sCityTitle"]+', '+response_list.property_list[i]["_sStreetTitle"]+'<br>'+response_list.property_list[i]["iRoomsCount"]+' rooms, '+floors_string+' floor<br>'+response_list.property_list[i]["iHomeSize"]+' s.m.</div></div> <div class="row card_buttons_wrapper"><div class="col-md-2"><div class="radio card_check"><input id="s_direction_check" class="icheck direction_check" type="checkbox" value="0" name="0" /></div></div><div class="col-md-10"><a id="at_button" href="property?id='+(i+1)+'" type="button" class="btn btn-default btn-block" >Open card</a></div></div></div></div></div>');
            response_list.imageviewers.push(new ImageViewer(response_list.property_list[i]["aPhotos"], i));
        }*/

        if (response_list.properties.length > 0){
            $('#client_results_area').hide();
            $('#property_results_area').show();
            
            var trynow_agency_id = 69;
            
            if (user.agency_data.id != undefined && user.agency_data.id == trynow_agency_id){
                if (response_list.properties.length > 9 || result.external_were_sliced == true){
                    $('#property_results_table').append('<tr>\n\
                        <td colspan="2">\n\
                            <div class="alert alert-warning alert-dismissable">\n\
                                <strong><span locale="note">'+localization.getVariable("note")+'</span>&nbsp;</strong>\n\
                                <span locale="only_part_showed">'+localization.getVariable("only_part_showed")+'</span>&#160;<span id="response_total_count_span"></span>&#160;<span locale="try_now_no_more_0_response_message">'+localization.getVariable("try_now_no_more_0_response_message")+'</span>\n\
                            </div>\n\
                        </td>\n\
                    </tr>');

                    $.post("/api/search/getresultscount.json",{
                        search: search.data == null ? search.defaults.search.id : search.data.id
                    }, function(response){
                        $('#response_total_count_span').html(response);
                    });
                }
            }
            else{
                if (response_list.properties.length > 99 || result.external_were_sliced == true){
                    $('#property_results_table').append('<tr>\n\
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
            }

            $('#property_results_table').append('<tr class="mark_all_check">\n\
                <td class="left_padding_5 top_padding_5">\n\
                    <input id="property_all_check" class="icheck" type="checkbox"/>\n\
                </td>\n\
                <td>\n\
                    <label locale="mark_all_button" class="white_label" for="property_all_check">'+localization.getVariable("mark_all_button")+'</label>&#160;&#160;&#160;&#160;\n\
                    <div id="legend_wrapper" style="display:none;"><span locale="legend" class="left_header">'+localization.getVariable("legend")+'</span>&#160;<i class="fa fa-caret-right"></i></span>&#160;<span locale="foreign_stock_property_legend">'+localization.getVariable("foreign_stock_property_legend")+'</span>,&#160;<i class="fa fa-caret-left"></i></span>&#160;<span locale="my_stock_property_legend">'+localization.getVariable("my_stock_property_legend")+'</span></div>\n\
                </td>\n\
            </tr>');

            $('#mark_all_checkbox_expanded_wrapper')
                .html('<input id="property_expanded_all_check" class="icheck" type="checkbox"/>')
                .css("padding-top", "7px");
            localization.setArabian();
            
            $('#property_all_check, #property_expanded_all_check').on('ifClicked', function(event){
                response_list.markAll();
            });

            //if (response_list.properties.length < 10){ // вывод недвижимостей пагинацией если больше 10, пока отключено,т.к. влиеяет на многие другие ф-ии, и это надо прорабатывать 
                for (var i = 0; i < response_list.properties.length; i++){
                    var phones = "";
                    var buffer = "";
                    var data = "";
                    var data_expanded = "";
                    
                    if (response_list.properties[i].stock == 1){
                        //data = buffer = response_list.properties[i].foreign_stock == 1 ? "<i class='fa fa-caret-right'></i>&#160;" : "<i class='fa fa-caret-left'></i>&#160;";
                        //data = buffer = "";
                        //data_expanded += "<td>"+buffer+"</td>";
                        buffer = "";
                    }
                    else{
                        //data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    var types = JSON.parse(response_list.properties[i].types);
                    
                    if (types != null){
                        for (var z = 0; z < types.length; z++){
                            var tmp = "<span locale='"+response_list.form_options.property_type[types[z]]+"'>"+localization.getVariable(response_list.form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
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
                    
                    if (response_list.properties[i].city_text != "" && response_list.properties[i].city_text != null && response_list.properties[i].source != undefined){
                        data += buffer = ',&nbsp;<span class="geoloc_span">'+response_list.properties[i].city_text+'</span>';
                    }
                    
                    var street_is_not_empty = false;
                    
                    if (response_list.properties[i].street != "" && response_list.properties[i].street != null){
                        data += ',&nbsp;<i class="fa fa-map-marker"></i>&nbsp;<span class="geoloc_span" property="'+response_list.properties[i].id+'" placeid="'+response_list.properties[i].street+'"></span>';
                        buffer = '<span class="geoloc_span" property="'+response_list.properties[i].id+'" placeid="'+response_list.properties[i].street+'"></span>';
                        street_is_not_empty = true;
                        //placeDetailsByPlaceIdNoAutocompleteGroup(response_list.street_googleac, service_route, i);
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
                        data_expanded += "<td>"+buffer+"</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    data += "<table style='"+(response_list.properties[i].source == undefined ? "width:100%" : "width:50%")+"'><tr>";
                    
                    if (response_list.properties[i].currency_id != null){
                        data += '<td>'+response_list.form_options.currency[response_list.properties[i].currency_id]["symbol"]+'&nbsp;<span class="price">'+utils.numberWithCommas(response_list.properties[i].price)+'</span></td>';
                        buffer = utils.numberWithCommas(response_list.properties[i].price)+' '+response_list.form_options.currency[response_list.properties[i].currency_id]["symbol"];
                        data_expanded += "<td>"+buffer+"</td>";
                        buffer = "";
                    }
                    else{
                        data += "<td></td>";
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.properties[i].rooms_count != 0 && response_list.properties[i].rooms_count != null){
                        data += '<td><i class="fa fa-bed"></i>&nbsp;'+response_list.properties[i].rooms_count+"</td>";
                        data_expanded += "<td>"+response_list.properties[i].rooms_count+"</td>";
                    }
                    else{
                        data += "<td></td>";
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.properties[i].floors_count != null || response_list.properties[i].floor_from != null){
                        var floor_from = response_list.properties[i].floor_from != undefined && response_list.properties[i].floor_from != null ? response_list.properties[i].floor_from : "?";
                        var floors_string = floor_from+(response_list.properties[i].floors_count != null ? "/"+response_list.properties[i].floors_count : "");
                        data += '<td><i class="fa fa-building"></i>&nbsp;'+floors_string+"</td>";
                        data_expanded += "<td>"+floors_string+"</td>";
                    }
                    else{
                        data += "<td></td>";
                        data_expanded += "<td></td>";
                    }
                    
                    if (response_list.properties[i].types == "[7]" || response_list.properties[i].types == "[11]"){
                        if (response_list.properties[i].lot_dims != null && response_list.properties[i].lot_size != null){
                            var lot_size_value = response_list.properties[i].lot_size+" "+"<span locale='"+response_list.form_options.dimension[response_list.properties[i].lot_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[response_list.properties[i].lot_dims]["locale"]);
                            data += '<td><b>S</b></span> '+lot_size_value+"</span></td>";
                            data_expanded += "<td>"+lot_size_value+"</td>";
                        }
                        else{
                            data += "<td></td>";
                            data_expanded += "<td></td>";
                            buffer = "";
                        }
                    }
                    else{
                        if (response_list.properties[i].home_dims != null && response_list.properties[i].home_size != null){
                            var home_size_value = response_list.properties[i].home_size+" "+"<span locale='"+response_list.form_options.dimension[response_list.properties[i].home_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[response_list.properties[i].home_dims]["locale"]);
                            data += '<td><i class="fa fa-home"></i>&nbsp;'+home_size_value+"</span></td>";
                            data_expanded += "<td>"+home_size_value+"</td>";
                        }
                        else{
                            data += "<td></td>";
                            data_expanded += "<td></td>";
                            buffer = "";
                        }
                    }
                    
                    data += "</tr><tr>";
                    
                    if (response_list.properties[i].source == undefined){
                        var agent_value = '<span  class="card_agent">'+(response_list.properties[i].stock == 0 || response_list.properties[i].foreign_stock == 0 ? response_list.properties[i].name : localization.getVariable("stock"))+'</span>';
                        
                        if (response_list.properties[i].name != null){
                            data += '<td><i class="fa fa-user"></i>&nbsp;'+agent_value+'</td>';
                            data_expanded += "<td>"+agent_value+"</td>";
                        }
                    }
                        
                    if (response_list.properties[i].contact1 != "" && response_list.properties[i].contact1 != null){
                        var tmp = '<span id="contact1_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone contact1" ><!--ondblclick="owl.phoneCall(this); return false;"-->'+response_list.properties[i].contact1+'</span>';
                        phones += tmp;
                        buffer = tmp;
                    }
                    
                    /*
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
                    */
                   
                    if (response_list.properties[i].source != undefined){
                        data += "<td></td>";
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    data += phones.length == 0 ? "" : "<td><i class='fa fa-phone'></i>&nbsp;"+phones;
                    data_expanded += "<td>"+buffer.substr(0, buffer.length-2)+"</td>";
                    buffer = "";
                    
                    if (response_list.properties[i].email != "" && response_list.properties[i].email != null){
                        data += ", @";
                        data_expanded += "<td>@</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    data += "</td>";

                    if (response_list.properties[i].last_updated != null){
                        var lastupd_value = utils.convertTimestampForDatepicker(response_list.properties[i].last_updated);
                        data += '<td><i class="fa fa-thumb-tack"></i>&nbsp;</span> '+lastupd_value+'</td>';
                        data_expanded += "<td>"+lastupd_value+"</td>";
                    }
                    else if (response_list.properties[i].timestamp != null){
                        var timestamp_value = utils.convertTimestampForDatepicker(response_list.properties[i].timestamp);
                        data += '<td><i class="fa fa-thumb-tack"></i>&nbsp;</span> '+timestamp_value+'</td>';
                        data_expanded += "<td>"+timestamp_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }

                    var call_button = '<td id="call_button_property_'+response_list.properties[i].id+'" onclick="owl.startSessionFromResponse(\'property\', \''+response_list.properties[i].id+'\', \'call-out\', \''+response_list.properties[i].contact1+'\', \''+response_list.properties[i].name+'\')" class="call_button"><i class="fa fa-phone"></i></td>';

                    if (global_data.owl_initcard == "mobile_client"){
                        call_button = '<td id="call_button_property_'+response_list.properties[i].id+'" onclick="owl.appCallNumberFromResponse(\'property\', '+response_list.properties[i].id+', \''+response_list.properties[i].contact1+'\', \''+response_list.properties[i].name+'\')" class="call_button"><i class="fa fa-phone"></i></td>';
                    }
                    else if (global_data.owl_initcard == "app_install"){
                        call_button = '<td id="call_button_property_'+response_list.properties[i].id+'" onclick="owl.openAppInstallModal()" class="call_button"><i class="fa fa-phone"></i></td>'
                    }

                    $('#property_results_table').append('<tr id="property_'+response_list.properties[i].id+'_list_tr" class="'+response_list.getPropertyType(response_list.properties[i])+' card_not_selected '+(i%2 === 0 ? "hl" : "")+'" onmousedown="response_list.openOnTouch('+response_list.properties[i].id+', \''+response_list.filterDefaultSearch()+'\', this, \'property\')">\n\
                        <td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="property_'+response_list.properties[i].id+'_check" class="icheck list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        <td onclick=\'response_list.onPropertyDblClick('+i+')\'>'+data+'\n\
                            <td><span class="card_id" style="'+(response_list.properties[i].source != undefined ? "display:none" : "")+'">\n\
                                <span>№</span>\n\
                                '+response_list.properties[i].id+'\
                            </span></td></tr></table>\n\
                            '+call_button+'\n\
                        </td>');
                    
                    $('#property_results_table_expanded').append('<tr id="property_'+response_list.properties[i].id+'_list_tr_expanded" class="'+response_list.getPropertyType(response_list.properties[i])+' card_not_selected '+(i%2 === 0 ? "odd" : "")+'" onclick=\'location.href="property?id='+response_list.properties[i].id+'&search='+response_list.filterDefaultSearch()+'"\' onmousedown="response_list.openOnTouch('+response_list.properties[i].id+', \''+response_list.filterDefaultSearch()+'\', this, \'property\')">\n\
                        <td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="property_'+response_list.properties[i].id+'_check_expanded" class="icheck_transparent list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        '+data_expanded+',\n\
                        <td><span class="card_id" style="'+(response_list.properties[i].source != undefined ? "display:none" : "")+'">\n\
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
                
                placeDetailsByPlaceIdNoAutocompleteGroup(response_list.street_googleac, service_route, i);
                
                //$.tablesorter.defaults.widgets = ['zebra']; 
                $('#property_results_table_expanded').tableHeadFixer();
                //$('#property_results_table_expanded').tablesorter();
                
                //localization.toLocale();
            /*}
            else{
                $('#show_next_30_button').click(function(){
                    response_list.showNext30Properties();
                }).attr("locale", "show_next_15");

                $('#show_previous_30_button').click(function(){
                    response_list.showPrevious30Properties();
                }).attr("locale", "show_previous_15");;

                response_list.showNext30Properties();
            }*/

            //####################### search by contour ######################################//

            /*if (response_list.conditions["contour"] != null && response_list.conditions["contour"] != ""){
                $.post("/api/contour/getforlist.json",{
                    id: response_list.conditions["contour"]
                },function (result){
                    if (result.error != undefined)
                        showErrorMessage(result.error.description);
                    else{
                        $('#contour_id').html(result.title);
                        var coords = JSON.parse(result.data);
                        var polygon_tmp = new google.maps.Polygon({
                            paths: coords,
                            strokeWeight: 0,
                            fillOpacity: 0.45,
                            editable: false
                        });

                        for (var i = 0; i < response_list.properties.length; i++){
                            var latLng = new google.maps.LatLng(response_list.properties[i].lat, response_list.properties[i].lng);

                            if (!google.maps.geometry.poly.containsLocation(latLng, polygon_tmp)){
                                $('span[property_card="'+response_list.properties[i].id+'"]').parent().parent().hide();
                            }
                        }

                        $('#search_entries_founded_span, #search_entries_showed_span').html($('#property_results_table tbody').children(':visible').length-1 < 200 ? $('#property_results_table tbody').children(':visible').length-1 : 200);
                        $('#switch_to_list_button').attr("disabled", false);
                        $('#stock_check').iCheck("enable");
                        $('#over30_wrapper').hide();
                    }
                });
            }*/

            //################################################################################//

            //####################### applying selected-on-map ###############################//

            if (urlparser.getParameter("selected") != undefined){
                response_list.selected = urlparser.getParameter("selected");
                $.post("/api/search/getselectedonmap.json",{
                    id: urlparser.getParameter("selected")
                },function (result){
                    if (result.error != undefined)
                        showErrorMessage(result.error.description);
                    else{
                        var obj = JSON.parse(result.data);

                        for (var i = 0; i < response_list.properties.length; i++){
                            var exist = 0;

                            for (var m = 0; m < obj.length; m++){
                                if (obj[m] == response_list.properties[i].id){
                                    exist++;
                                }
                            }

                            if (exist != 0){
                                //console.log('span[property_card="'+obj[m]+'"]');
                                response_list.selectById(response_list.properties[i]);
                                //$('span[property_card="'+response_list.properties[i].id+'"]').parent().parent().show();
                            }
                        }

                        if (result.reduced == 1)
                            response_list.reduce();
                    }
                });
            }

            //################################################################################//

            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                var result = global_data.agency_getagentslist;
            
                for (var i = 0; i < result.length; i++){
                    if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                        $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                }

                //response_list.createEmail()
            //});
        }

        if (response_list.clients.length > 0){
            $('#client_results_area').show();
            
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

            $('#client_results_table').html("").append('<tr class="mark_all_check">\n\
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

            //if (response_list.clients.length < 30){
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
                            var tmp = "<span locale='"+response_list.form_options.property_type[types[z]]+"'>"+localization.getVariable(response_list.form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
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
                        data += buffer = ',&nbsp;<span class="price">'+utils.numberWithCommas(response_list.clients[i].price_from)+' - '+utils.numberWithCommas(response_list.clients[i].price_to)+' '+response_list.form_options.currency[response_list.clients[i].currency_id]["symbol"]+'</span>';
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
                        data += ',&nbsp;<span locale="home_noregister_span">'+localization.getVariable("home_noregister_span")+'</span> '+home_size_value+" <span locale='"+response_list.form_options.dimension[response_list.clients[i].home_size_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[response_list.clients[i].home_size_dims]["locale"])+"</span>";
                        data_expanded += "<td>"+home_size_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (response_list.clients[i].lot_size_dims != null && response_list.clients[i].lot_size_from != null && response_list.clients[i].lot_size_to != null && response_list.clients[i].lot_size_to != 0){
                        var lot_size_value = response_list.clients[i].lot_size_from+'-'+response_list.clients[i].lot_size_to;
                        data += ',&nbsp;<span locale="lot_noregister_span">'+localization.getVariable("lot_noregister_span")+'</span> '+lot_size_value+" <span locale='"+response_list.form_options.dimension[response_list.clients[i].lot_size_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[response_list.clients[i].lot_size_dims]["locale"])+"</span>";
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
                    
                    $('#client_results_table').append('<tr id="client_'+response_list.clients[i].id+'_list_tr" class="card_not_selected '+(i%2 == 0 ? "hl" : "")+'" onmousedown="response_list.openOnTouch('+response_list.clients[i].id+', \''+response_list.filterDefaultSearch()+'\', this, \'client\')">\n\
                        <td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="client_'+response_list.clients[i].id+'_check" class="icheck list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        <td onclick=\'location.href="client?id='+response_list.clients[i].id+'&search='+response_list.filterDefaultSearch()+'"\'>'+phones+',&nbsp;\n\
                            <span class="card_id">\n\
                                <span locale="card_noregister_span">'+localization.getVariable("card_noregister_span")+'</span>&nbsp'+response_list.clients[i].id+'</span>,&nbsp'+data+'\n\
                        </td>');
                    
                    $('#client_results_table_expanded').append('<tr id="client_'+response_list.clients[i].id+'_list_tr_expanded" class="card_not_selected '+(i%2 === 0 ? "odd" : "")+'" onclick=\'location.href="client?id='+response_list.clients[i].id+'&search='+response_list.filterDefaultSearch()+'"\' onmousedown="response_list.openOnTouch('+response_list.clients[i].id+', \''+response_list.filterDefaultSearch()+'\', this, \'client\')">\n\
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
            /*}
            else{
                response_list.showNext30Clients();
            }*/

            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                var result = global_data.agency_getagentslist;
            
                for (var i = 0; i < result.length; i++){
                    if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                        $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                }

                //response_list.createEmail();
            //});
            
            //localization.toLocale();
        }

        $('#switch_to_map_button').attr("href", "map?search="+response_list.search_id+(response_list.selected != null ? "&selected="+response_list.selected : ""));

        app.customCheckbox();

        if (location.pathname === "/query"){
            search.initStockCheckbox();
            stock.init();
        }

        $('#property_results_area').removeClass("response_list_loader");
        
        search.toggleExpanded();
    };
    
    this.getPropertyType = function(property){
        if (property.source != undefined){
            return "external_property "+property.source;
        }
        else{
            if (property.stock == 1){
                if (property.foreign_stock == 1){
                    return "stock_property";
                }
                else{
                    return "regular_property";
                }
            }
            else{
                return "regular_property";
            }
        }
    };
    
    this.onPropertyDblClick = function(property_array_key){
        var p = this.properties[property_array_key];
        
        if (p.source != undefined){
            if (this.collecting_forbidden == null || this.collecting_forbidden == 1){
                if ((this.external_block == null || this.external_block) && !user.isGuest()){
                    $('#open_external_if_not_installed_extension_a').attr("href", p.query+"&topreal_external_property="+p.id+"&external_id="+p.external_id);
                    $('#show_on_external_first_choice_modal').modal("show");
                    //tools.openInstallCollectorDialog();
                }
                else{
                    window.open(p.query+"&topreal_external_property="+p.id+"&external_id="+p.external_id, '_blank');    
                }
            }
            else{
                /*var collecting_forbidden_cookie = utils.getCookie("collecting_forbidden_closed");
                
                if (collecting_forbidden_cookie != undefined && collecting_forbidden_cookie == 1){
                    window.open(p.query, '_blank');
                }
                else{
                    $('#on_collecting_forbidden_property_a').attr("href", p.query);
                    $('#on_collecting_forbidden_modal').modal("show");
                }*/

                window.open(p.query+"&topreal_external_property="+p.id+"&external_id="+p.external_id, '_blank');                
            }
        }
        else{
            this.showOpenLoader();
            location.href = "property?id="+p.id+"&search="+this.filterDefaultSearch();
            //$('#open_for_editing_a').attr("href", "property?id="+p.id+"&search="+this.filterDefaultSearch());
            //openPropertyQuickModal(p.id);
        }
        
        $('#property_'+p.id+'_list_tr > *').css({"color": "purple", "font-weight": "bold"});
    };

    this.disableSlideButtonsForProperties = function(top_border){
        if (top_border === this.properties.length){
            $('#show_next_30_button').attr("disabled", true);
        }
        else{
            $('#show_next_30_button').attr("disabled", false);
        }

        if (top_border == 0 || this.over30key == 0){
            $('#show_previous_30_button').attr("disabled", true);
        }
        else{
            $('#show_previous_30_button').attr("disabled", false);
        }
    };

    this.changeDirectionForward = function(){
        if (this.direction === "b"){
            this.direction = "f";
            this.step = 20;
            this.overstep = 10;
        }
        else if (this.direction === "f"){
            this.step = 10;
            this.overstep = 0;
        }
    };

    this.changeDirectionBackward = function(){
        if (this.direction === "f"){
            this.direction = "b";
            this.step = 20;
            this.overstep = 10;
        }
        else if (this.direction === "b"){
            this.step = 10;
            this.overstep = 0;
        }
    };
    
    this.getList = function(){
        $.post("/api/responselist/get.json",{
            id: this.list_id
        },function (result){
            $('#list_name_span').text(result.title);
            response_list.properties = result.data;
            $('#property_results_area').show();
            $('#over30_wrapper, #founded_wrapper_div').hide();

            for (var i = 0; i < response_list.properties.length; i++){
                var phones = response_list.properties[i].stock == 1 && response_list.properties[i].foreign_stock == 1 ? "<span class='stock-icon-black stock_icon'></span>&#160;" : "";
                var data = "";
                if (response_list.properties[i].contact1 != "")
                    phones += '<span id="contact1_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone contact1"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact1+'</span>';
                if (response_list.properties[i].contact2 != null)
                    phones += ', <span id="contact2_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact2+'</span>';
                if (response_list.properties[i].contact3 != null)
                    phones += ', <span id="contact3_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact3+'</span>';
                if (response_list.properties[i].contact4 != null)
                    phones += ', <span id="contact4_span" property_card="'+response_list.properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+response_list.properties[i].contact4+'</span>';

                if (response_list.properties[i].email != null)
                    data += "@, ";

                var types = JSON.parse(response_list.properties[i].types);
                
                for (var z = 0; z < types.length; z++){
                    data += "<span locale='"+response_list.form_options.property_type[types[z]]+"'></span>"+(z === types.length-1 ? "" : "/");
                }
                
                data += ',&nbsp;<span class="price">'+response_list.properties[i].price+' '+response_list.form_options.currency[response_list.properties[i].currency_id]["symbol"]+'</span>';

                if (response_list.properties[i].rooms_count != null)
                    data += ',&nbsp;'+response_list.properties[i].rooms_count+' <span locale="rooms_noregister_span">rooms</span>';

                if (response_list.properties[i].home_size != null && response_list.properties[i].home_dims != null)
                    data += ',&nbsp;<span locale="home_noregister_span">home</span> '+response_list.properties[i].home_size+" <span locale='"+response_list.form_options.dimension[response_list.properties[i].home_dims]["locale"]+"'>"+response_list.form_options.dimension[response_list.properties[i].home_dims]["short_title"]+"</span>";
                   
                if (response_list.properties[i].lot_size != null && response_list.properties[i].lot_dims != null)
                    data += ',&nbsp;<span locale="home_noregister_span">lot</span> '+response_list.properties[i].lot_size+" <span locale='"+response_list.form_options.dimension[response_list.properties[i].lot_dims]["locale"]+"'>"+response_list.form_options.dimension[response_list.properties[i].lot_dims]["short_title"]+"</span>";

                if (response_list.properties[i].street != null){
                    data += ',&nbsp;<span class="geoloc_span" property="'+response_list.properties[i].id+'" placeid="'+response_list.properties[i].street+'"></span>';
                    placeDetailsByPlaceIdNoAutocomplete(response_list.properties[i].street, service_route, i);
                }

                if (response_list.properties[i].street != null && response_list.properties[i].house_number != null)
                    data += '&nbsp;'+response_list.properties[i].house_number;

                if (response_list.properties[i].street != null && response_list.properties[i].house_number != null && response_list.properties[i].flat_number != null)
                    data += '/'+response_list.properties[i].flat_number;

                data += ',&nbsp;<span locale="agent_noregister_span">agent</span>: <span '+(response_list.properties[i].stock == 0 || response_list.properties[i].foreign_stock == 0 ? ' class="card_agent" agent="'+response_list.properties[i].agent_id+'"' : "locale='stock'")+'></span>';

                if (response_list.properties[i].last_updated != null)
                    data += ',&nbsp;<span locale="last_update">last update</span>: '+utils.convertTimestampForDatepicker(response_list.properties[i].last_updated);
                else if (response_list.properties[i].timestamp != null) data += ',&nbsp;<span locale="created_noregister_span">created</span>: '+utils.convertTimestampForDatepicker(response_list.properties[i].timestamp);

                $('#property_results_table').append('<tr id="property_'+response_list.properties[i].id+'_list_tr" '+(i%2 == 0 ? "class='hl'" : "")+'>\n\
                    <td>\n\
                        <span class="list_item_number">'+(i+1)+') </span>\n\
                    </td>\n\
                    <td>'+phones+'&nbsp;\n\
                        <span class="card_id">\n\
                            <span locale="card_noregister_span">card</span>\n\
                             '+response_list.properties[i].id+'\
                        </span>,&nbsp;'+data+'\
                    </td>');
            
                $('#property_results_area').removeClass("response_list_loader");
            }

            //$.post("/api/agency/getagentslist.json",{
            //},function (result){
                var result = global_data.agency_getagentslist;
            
                for (var i = 0; i < result.length; i++){
                    if ($('.card_agent[agent='+result[i].id+']').length !== 0)
                        $('.card_agent[agent='+result[i].id+']').text(result[i].name);
                }
                
                //localization.toLocale();
            //});

            //localization.toLocale();
        });
    };
    
    this.selectPropertyPhone = function(span, card){ // span - clicked phone span, card - id of property of clicked card
        var index = -1;
        
        for (var i = 0; i < this.property_phones.length; i++){ // перебираем уже выбранные ранее карточки и находим выбранный номер, кладем его индекс в index
            if (this.property_phones[i].card == card){
                index = i;
            }
        }
        
        for (var i = 0; i < this.property_phones.length; i++){ // перебираем заново и если такая карточка (НЕ телефон) уже выбрана, удаляем и снимаем выделение
            if (this.property_phones[i].card === card){
                this.property_phones.splice(i, 1);            
                //$('span[property_card='+card+']').addClass("card_phone_not_selected").removeClass("card_phone_selected");
                $('#property_'+card+'_list_tr').children('td').removeClass("hl_yellow")
                $('#property_'+card+'_list_tr').removeClass("card_selected").addClass("card_not_selected");
                $('#property_'+card+'_list_tr_expanded').children("td").removeClass("hl_yellow");
                $('#property_'+card+'_list_tr_expanded').removeClass("card_selected").addClass("card_not_selected");
                $('#property_'+card+'_check').iCheck('uncheck');
                $('#property_'+card+'_check_expanded').iCheck('uncheck');
            }
        }
        
        if (index === -1){ // если не было найдено текущего телефона в выбранных, то кладем его в массив и выделяем карточку
            this.property_phones.push({card: card});
            //$(span).addClass("card_phone_selected").removeClass("card_phone_not_selected");
            $('#property_'+card+'_list_tr').children('td').addClass("hl_yellow");
            $('#property_'+card+'_list_tr').removeClass("card_not_selected").addClass("card_selected");
            $('#property_'+card+'_list_tr_expanded').children("td").addClass("hl_yellow");
            $('#property_'+card+'_list_tr_expanded').removeClass("card_not_selected").addClass("card_selected");
            $('#property_'+card+'_check').iCheck('check');
            $('#property_'+card+'_check_expanded').iCheck('check');
        }
        else{ // если телефон был найден, вырезаем его и снимаем выделение
            //if (index > -1)
                //this.phones.splice(index, 1);
            
            //$(span).addClass("card_phone_not_selected").removeClass("card_phone_selected");
            $('#property_'+card+'_list_tr').children('td').removeClass("hl_yellow");
            $('#property_'+card+'_list_tr').removeClass("card_selected").addClass("card_not_selected");
            $('#property_'+card+'_list_tr_expanded').children("td").removeClass("hl_yellow");
            $('#property_'+card+'_list_tr_expanded').removeClass("card_selected").addClass("card_not_selected");
            $('#property_'+card+'_check').iCheck('uncheck');
            $('#property_'+card+'_check_expanded').iCheck('uncheck');
        }
        
        if (this.property_phones.length || this.client_phones.length){ // показываем кол-во выделенных карточек. работает правильно.
            $('#marked_wrapper').show();
            $('#search_entries_marked_span').html(this.property_phones.length+this.client_phones.length);
        }
        else{
            $('#search_entries_marked_span').html(0);
            //$('#marked_wrapper').hide();
        }
        
        this.saveSelected();
    };
    
    this.selectClientPhone = function(span, card){ // span - clicked phone span, card - id of property of clicked card
        var index = -1;
        
        for (var i = 0; i < this.client_phones.length; i++) // перебираем уже выбранные ранее карточки и находим выбранный номер, кладем его индекс в index
            if (this.client_phones[i].card == card)
                index = i;
        
        for (var i = 0; i < this.client_phones.length; i++) // перебираем заново и если такая карточка (НЕ телефон) уже выбрана, удаляем и снимаем выделение
            if (this.client_phones[i].card === card){
                this.client_phones.splice(i, 1);            
                //$('span[client_card='+card+']').addClass("card_phone_not_selected").removeClass("card_phone_selected");
                $('span[client_card='+card+']').parent().parent().removeClass("hl_yellow").removeClass("card_selected").addClass("card_not_selected");
                $('#client_results_table_expanded span[client_card='+card+']').parent().parent().children("td").removeClass("hl_yellow");
                $('#client_'+card+'_check').iCheck('uncheck');
                $('#client_'+card+'_check_expanded').iCheck('uncheck');
            }
        
        if (index === -1){ // если не было найдено текущего телефона в выбранных, то кладем его в массив и выделяем карточку
            this.client_phones.push({card: card});
            //$(span).addClass("card_phone_selected").removeClass("card_phone_not_selected");
            $('span[client_card='+card+']').parent().parent().addClass("hl_yellow").addClass("card_selected").removeClass("card_not_selected");
            $('#client_results_table_expanded span[client_card='+card+']').parent().parent().children("td").addClass("hl_yellow");
            $('#client_'+card+'_check').iCheck('check');
            $('#client_'+card+'_check_expanded').iCheck('check');
        }
        else{ // если телефон был найден, вырезаем его и снимаем выделение
            //if (index > -1)
                //this.phones.splice(index, 1);
            
            //$(span).addClass("card_phone_not_selected").removeClass("card_phone_selected");
            $('span[client_card='+card+']').parent().parent().removeClass("hl_yellow").removeClass("card_selected").addClass("card_not_selected");
            $('#client_results_table_expanded span[client_card='+card+']').parent().parent().children("td").removeClass("hl_yellow");
            $('#client_'+card+'_check').iCheck('uncheck');
            $('#client_'+card+'_check_expanded').iCheck('uncheck');
        }
        
        if (this.property_phones.length || this.client_phones.length){ // показываем кол-во выделенных карточек. работает правильно.
            $('#marked_wrapper').show();
            $('#search_entries_marked_span').html(this.property_phones.length+this.client_phones.length);
        }else{
            $('#search_entries_marked_span').html(0);
            //$('#marked_wrapper').hide();
        }
    };
    
    this.markAll = function(){
        this.client_phones = [];
        this.property_phones = [];
        
        if (this.reduced === 1){
            this.reduce();
        }
        
        if (this.all_marked === 0){
            //$('#unmark_all_button').show();
            //$('#mark_all_button').hide();
            $('.card_selected').addClass("card_not_selected").removeClass("card_selected");
            
            if (this.clients != null){
                $('#client_all_check').iCheck('check');
                $('#client_expanded_all_check').iCheck('check');
                
                for (var i = 0; i < this.clients.length; i++){
                    this.client_phones.push({card: Number(this.clients[i].id)});
                    $('#client_'+this.clients[i].id+'_check').iCheck('check');
                    $('#client_'+this.clients[i].id+'_check_expanded').iCheck('check');
                }
            }
            
            if (this.properties != null){
                $('#property_all_check').iCheck('check');
                $('#property_expanded_all_check').iCheck('check');
                
                for (var i = 0; i < this.properties.length; i++){
                    this.property_phones.push({card: Number(this.properties[i].id)});
                    $('#property_'+this.properties[i].id+'_check').iCheck('check');
                    $('#property_'+this.properties[i].id+'_check_expanded').iCheck('check');
                }
            }

            $('.card_not_selected').addClass("card_selected").addClass("hl_yellow").removeClass("card_not_selected");
            $('#property_results_table_expanded .card_selected').children("td").addClass("hl_yellow");
            $('#client_results_table_expanded .card_selected').children("td").addClass("hl_yellow");
            this.all_marked = 1;
            //$('#mark_all_button').text("Unmark all");
        }
        else if (this.all_marked === 1){
            //$('#unmark_all_button').hide();
            //$('#mark_all_button').show();
            $('.card_selected').removeClass("hl_yellow").removeClass("card_selected").addClass("card_not_selected");
            $('#property_results_table_expanded .card_not_selected').children("td").removeClass("hl_yellow");
            $('#client_results_table_expanded .card_not_selected').children("td").removeClass("hl_yellow");
            $('.list_icheck').iCheck("uncheck");
            $('#client_all_check').iCheck('uncheck');
            $('#property_all_check').iCheck('uncheck');
            $('#property_expanded_all_check').iCheck('uncheck');
            $('#client_expanded_all_check').iCheck('uncheck');
            this.all_marked = 0;
            //$('#mark_all_button').text("Mark all");
        }
        
        $('#search_entries_marked_span').html(this.property_phones.length+this.client_phones.length);
    };
    
    this.reduce = function(){
        if (this.reduced === 0 && $('.hl_yellow').length > 0){
            this.reduced = 1;
            $('.card_not_selected').hide();
            $('.card_selected').show();
            //$('#unreduce_button').show();
            $('#list_reduce_button > span').text(localization.getVariable("unreduce"));
            
            if (response_list.client_phones.length === 0){
                $('#client_results_area').hide();
            }
            
            if (response_list.property_phones.length === 0 && response_list.client_phones.length > 0){
                $('#property_results_area').hide();
            }
            
            if (response_list.property_phones.length === 0){
                //response_list.noResults();
            }
        }
        else if (this.reduced === 1){
            this.reduced = 0;
            $('.card_not_selected').show();
            //$('#unreduce_button').hide();
            $('#list_reduce_button > span').text(localization.getVariable("reduce_button"));
            
            if (response_list.clients.length > 0){
                $('#client_results_area').show();
            }
            
            if (response_list.properties.length > 0){
                $('#property_results_area').show().removeClass("no_results_wrapper");
            }
        }
        
        this.saveSelected();
    };
    
    this.selectById = function(property){
        this.property_phones.push({card: Number(property.id)});
        //$('.contact1[property_card="'+property.id+'"]').addClass("card_phone_selected").removeClass("card_phone_not_selected");
        $('#property_'+property.id+'_list_tr').children('td').addClass("hl_yellow");
        $('#property_'+property.id+'_list_tr').removeClass("card_not_selected").addClass("card_selected");
        $('#property_'+property.id+'_check').iCheck('check');
        
        if (this.property_phones.length || this.client_phones.length){ // показываем кол-во выделенных карточек. работает правильно.
            $('#search_entries_marked_span').html(this.property_phones.length+this.client_phones.length);
        }
        else{
            $('#search_entries_marked_span').html(0);
        }
    };
    
    this.initMap = function(center_lat, center_lng){
        
        var myLatLng = {lat: center_lat, lng: center_lng};
        this.map = new google.maps.Map(document.getElementById('map-markers'), {
          zoom: 8,
          center: myLatLng
        });
    };
    
    this.setMapMarker = function(lat, lng, text, property){
        var latLng = new google.maps.LatLng(lat, lng);
        var marker = new MarkerWithLabel({
            position: latLng,
            map: this.map,
            labelContent: text,
            labelAnchor: new google.maps.Point(22, 0),
            labelClass: "maplabel", // the CSS class for the label
            labelStyle: {opacity: 0.75}
        });
        
        //console.log(marker);
        
        /*var iw1 = new google.maps.InfoWindow({
            content: "Home For Sale"
          });
          
        google.maps.event.addListener(marker1, "click", function (e) { iw1.open(response_list.map, this); });*/
          
        google.maps.event.addListener(marker, "click", function(e){ 
            var exist = 0;
            
            for (var i = 0; i < response_list.selected_property.length; i++){
                if (response_list.selected_property[i] == property){
                    response_list.selected_property[i] = null;
                    marker.setOptions({labelClass: "maplabel"});
                    exist = 1;
                }
            }
            if (!exist){
                marker.setOptions({labelClass: "maplabel_selected"});
                response_list.selected_property[i] = property;
            }
            
        });
    };
    
    this.placeDetailsByPlaceId = function(placeid){
        $('#main-wrapper').append("<input id='maps_input_invisible' style='display:none' />");
        var service = new google.maps.places.PlacesService(document.getElementById('maps_input_invisible'));
        service.getDetails({placeId: placeid}, function (place, status) {
            //if (status == google.maps.places.PlacesServiceStatus.OK)
                //console.log(place);
        });
    };
    
    this.createCalendarEvent = function(){
        if ($('#event_title_input').val().trim().length !== 0)
            $.post("/api/responselist/createnew.json",{
                title: $('#event_title_input').val().trim(),
                data: function(){
                    var cards = [];
                    
                    if (response_list.property_phones.length > 0){
                        for (var i = 0; i < response_list.property_phones.length; i++){
                            cards.push(response_list.property_phones[i].card);
                        }
                    }
                    else{
                        for (var i = 0; i < response_list.client_phones.length; i++){
                            cards.push(response_list.client_phones[i].card);
                        }
                    }
                    
                    return JSON.stringify(cards);
                },
                type: response_list.property_phones.length > 0 ? "properties" : "clients"
            },function (result){
                var title = $('#event_title_input').val().trim() + " http://topreal.top/query?list="+result;
                var start_date = $('#event_start_input').val().trim(); 
                var start_time = $('#event_start_time_select').val().trim();
                var end_date = $('#event_end_input').val().trim(); 
                var end_time = $('#event_end_time_select').val().trim();

                //if (title.length !== 0 && start_date.length !== 0 && end_date.length !== 0){
                    createSimpleEvent(title, start_date+"T"+start_time, end_date+"T"+end_time);
                //}
            });
    };
    
    this.createNewList = function(){
        if ($('#list_title_input').val().trim().length > 0){
            for (var i = 0; i < search.saved_lists.length; i++){
                if ($('#list_title_input').val().trim() == search.saved_lists[i].title){
                    $('#title_alert').show();
                    
                    return 0;
                }
            }
            
            $('#title_alert').hide();
            
            $.post("/api/responselist/createnew.json",{
                title: $('#list_title_input').val().trim(),
                data: function(){
                    var cards = [];
                    
                    if (response_list.property_phones.length > 0){
                        for (var i = 0; i < response_list.property_phones.length; i++){
                            cards.push(response_list.property_phones[i].card);
                        }
                    }
                    else{
                        for (var i = 0; i < response_list.client_phones.length; i++){
                            cards.push(response_list.client_phones[i].card);
                        }
                    }
                    
                    return JSON.stringify(cards);
                },
                type: this.property_phones.length > 0 ? "properties" : "clients"
            },function (result){
                if (result != false){
                    showSuccess(localization.getVariable("list_created_successfully"));
                    search.getSavedLists();
                }
                else{
                    $('#create_list_error_alert').show();
                }
            });
        }
    };
    
    this.rewriteList = function(id){
        $.post("/api/responselist/rewrite.json",{
            id: id,
            data: function(){
                var cards = [];

                if (response_list.property_phones.length > 0){
                    for (var i = 0; i < response_list.property_phones.length; i++){
                        cards.push(response_list.property_phones[i].card);
                    }
                }
                else{
                    for (var i = 0; i < response_list.client_phones.length; i++){
                        cards.push(response_list.client_phones[i].card);
                    }
                }

                return JSON.stringify(cards);
            },
            type: this.property_phones.length > 0 ? "properties" : "clients"
        },function (result){
            if (result != false){
                showSuccess(localization.getVariable("list_rewrited_successfully"));
                search.getSavedLists();
            }
            else{
                $('#create_list_error_alert').show();
            }
        });
    };
    
    this.print = function(){
        if (this.property_phones.length === 0 && this.client_phones.length === 0){
            $('#print_modal').modal("show");
        }
        else if (this.property_phones.length + this.client_phones.length > 21){
            //utils.warningModal(localization.getVariable("print_more_than_5_pages_warning"));
            $('#print_warning_modal').modal("show");
        }
        else{
            window.print();
        }
    };
    
    this.exportToCSV = function(){
        var properties = [];
        var clients = [];
        
        if (this.property_phones.length !== 0)
            for (var i = 0; i < this.property_phones.length; i++)
                properties.push(this.property_phones[i].card);
        
        if (this.client_phones.length !== 0)
            for (var i = 0; i < this.client_phones.length; i++)
                clients.push(this.client_phones[i].card);
        
        $.post("/api/search/exporttocsv.json",{
            properties: properties.length !== 0 ? JSON.stringify(properties) : null,
            clients: clients.length !== 0 ? JSON.stringify(clients) : null
        },function (result){
            if (result.error != undefined)
                if (result.error.code == 501){
                    utils.accessErrorModal(result.error.description);
                }
                else{
                    utils.errorModal(result.error.description);
                }
            else{
                $('#export_modal_header').html(localization.getVariable("data_export"));
            
                if (result.properties != null && result.clients != null){
                    $('#export_modal_body').html(localization.getVariable("can_download_exported_data")+"<p>");
                    $('#export_modal_body').append('<a target="_blank" class="btn btn-primary" type="button" href="storage/'+result.properties+'">'+localization.getVariable("download_properties")+'</a>');
                    $('#export_modal_body').append(' <a target="_blank" class="btn btn-primary" type="button" href="storage/'+result.clients+'">'+localization.getVariable("download_clients")+'</a>');
                }
                else if (result.properties != null){
                    $('#export_modal_body').html(localization.getVariable("can_download_exported_data")+"<p>");
                    $('#export_modal_body').append('<a target="_blank" class="btn btn-primary" type="button" href="storage/'+result.properties+'">'+localization.getVariable("download_properties")+'</a>');
                }else if (result.clients != null){
                    $('#export_modal_body').html(localization.getVariable("can_download_exported_data")+"<p>");
                    $('#export_modal_body').append('<a target="_blank" class="btn btn-primary" type="button" href="storage/'+result.clients+'">'+localization.getVariable("download_clients")+'</a>');
                }
                else{
                    $('#export_modal_body').html(localization.getVariable("no_selected_caption"));
                }

                $('#export_success_modal').modal("show");
            }
        });
    };
    
    this.average = function(){
        var sum = {price: 0, floors: 0, rooms: 0, home: 0, lot: 0};
        var average = {price: 0, floors: 0, rooms: 0, home: 0, lot: 0};
        $('#avegare_list_table tbody').html("");
        $('#average_modal_header_properties_counter').text(this.property_phones.length);
        
        /*if (this.property_phones.length == 0){ // среднее среди всех
            var divider = {
                price: 0,
                rooms: 0,
                home: 0, 
                sq_price: 0,
                lot: 0
            };
            
            for (var i = 0; i < this.properties.length; i++){
                sum.price += this.convertToUSD(this.properties[i]);
                divider.price = this.properties[i].price != null && this.properties[i].price != 0 ? divider.price+1 : divider.price;
                sum.rooms += Number(this.properties[i].rooms_count);
                divider.rooms = this.properties[i].rooms_count != null && this.properties[i].rooms_count != 0 ? divider.rooms+1 : divider.rooms;
                sum.home += this.convertToSqMeters(this.properties[i], 1);
                divider.home = this.properties[i].home_size != null && this.properties[i].home_size != 0 ? divider.home+1 : divider.home;
                sum.lot += this.convertToSqMeters(this.properties[i], 2);
                divider.lot = this.properties[i].lot_size != null && this.properties[i].lot_size != 0 ? divider.lot+1 : divider.lot;
            }
            
            for (var key in divider){
                if (divider[key] === 0) divider[key]++;
            }
            
            average.price = Math.ceil(sum.price/divider.price);
            average.rooms = Math.round(sum.rooms/divider.rooms, 1);
            average.home = Math.ceil(sum.home/divider.home);
            average.sq_price = Math.round(average.price/average.home);
            average.lot = Math.ceil(sum.lot/divider.lot);
        }*/
        
        if (this.property_phones.length > 0){ // среднее среди выделенных
            var divider = {
                price: 0,
                rooms: 0,
                home: 0, 
                sq_price: 0,
                lot: 0
            };
            
            for (var i = 0; i < this.property_phones.length; i++){
                var property_tmp;
                
                for(z = 0; z < this.properties.length; z++){
                    if (this.properties[z].id == this.property_phones[i].card){
                        property_tmp = this.properties[z];
                    }
                }
                
                sum.price += this.convertToUSD(property_tmp);
                divider.price = property_tmp.price != null && property_tmp.price != 0 ? divider.price+1 : divider.price;
                sum.rooms += Number(property_tmp.rooms_count);
                divider.rooms = property_tmp.rooms_count != null && property_tmp.rooms_count != 0 ? divider.rooms+1 : divider.rooms;
                sum.home += this.convertToSqMeters(property_tmp, 1);
                divider.home = property_tmp.home_size != null && property_tmp.home_size != 0 ? divider.home+1 : divider.home;
                sum.lot += this.convertToSqMeters(property_tmp, 2);
                divider.lot = property_tmp.lot_size != null && property_tmp.lot_size != 0 ? divider.lot+1 : divider.lot;
            }
            
            for (var key in divider){
                if (divider[key] === 0) divider[key]++;
            }
            
            average.price = Math.ceil(sum.price/divider.price);
            average.rooms = Math.round(sum.rooms/divider.rooms, 1);
            average.home = Math.ceil(sum.home/divider.home);
            average.sq_price = Math.round(average.price/average.home);
            average.lot = Math.ceil(sum.lot/divider.lot);
        
            $('#avegare_list_table').append('<tr><td>'+utils.numberWithCommas(average.price)+' '+this.form_options.currency[0].symbol+'</td><td>'+utils.numberWithCommas(average.sq_price)+' '+this.form_options.currency[0].symbol+'</td><td>'+average.rooms+'</td><td>'+average.home+' <span locale="'+this.form_options.dimension[5].locale+'">'+localization.getVariable(this.form_options.dimension[5].locale)+'</span></td></tr>');
            $('#average_modal').modal("show");
        }
        else{
            utils.warningModal(localization.getVariable("no_selected_caption"));
        }
    };
    
    this.convertToUSD = function(property){
        return property.price/this.form_options.currency[property.currency_id].exchange;
    };
    
    this.convertToSqMeters = function(property, object_type){ // object_type: 1 = home, 2 = lot
        if (object_type === 1 && property.home_dims != null){
            return property.home_size*this.form_options.dimension[property.home_dims].exchange;
        }
        else if (object_type === 2 && property.lot_dims != null){
            return property.lot_size*this.form_options.dimension[property.lot_dims].exchange;
        }
        else return 0;
    };
    
    this.createNewCard = function(){
        $('#new_card_modal').modal("show");
    };
    
    this.openDeleteModal = function(){
        if (user.id == 1){
            $('#delete_stock_modal').modal("show");
            return false;
        }
        
        $('#delete_card_modal').modal("show");
        $('#delete_error_alert').hide();
        $('#delete_success_alert').hide();
        $('#delete_not_all_success_alert').hide();
        
        if (this.property_phones.length === 0 && this.client_phones.length === 0){
            $('#no_selected_warning_alert').show();
            $('#before_delete_warning_alert').hide();
            $('#delete_modal_close_button').hide();
            $('#delete_modal_ok_button').show();
            $('#delete_modal_yes_button').hide();
        }
        else{
            $('#no_selected_warning_alert').hide();
            $('#before_delete_warning_alert').show();
            $('#delete_modal_close_button').show();
            $('#delete_modal_ok_button').hide();
            $('#delete_modal_yes_button').show();
        }
    };
    
    this.delete = function(){
        if (this.property_phones.length !== 0){
            $.post("/api/property/delete.json",{
                properties: JSON.stringify(this.property_phones)
            },function (result){
                $('#no_selected_warning_alert').hide();
                $('#before_delete_warning_alert').hide();
                $('#delete_modal_close_button').show();
                $('#delete_modal_ok_button').hide();
                $('#delete_modal_yes_button').hide();
                
                if (result.error != undefined){
                    $('#delete_error_alert').show();
                    
                    //if (result.error.code != 501){
                        $('#delete_error_alert').html(result.error.description);
                    //}
                }
                else{
                    if (result.length < $('.card_selected').length){
                        $('#delete_not_all_success_alert').show();
                        
                        for (var i = 0; i < result.length; i++){
                            $('#property_'+result[i]+'_list_tr').remove();
                        }
                    }
                    else{
                        $('#delete_success_alert').show();
                        $('.card_selected').remove();
                    }
                }
            });
        }
        
        if (this.client_phones.length !== 0){
            $.post("/api/client/delete.json",{
                clients: JSON.stringify(this.client_phones)
            },function (result){
                $('#no_selected_warning_alert').hide();
                $('#before_delete_warning_alert').hide();
                $('#delete_modal_close_button').show();
                $('#delete_modal_ok_button').hide();
                $('#delete_modal_yes_button').hide();
                
                if (result.error != undefined){
                    $('#delete_error_alert').show();
                    
                    //if (result.error.code != 501){
                        $('#delete_error_alert').html(result.error.description);
                    //}
                }
                else{
                    $('#delete_success_alert').show();
                }
            });
        }
    };
    
    this.deleteExternalCard = function(){
        if (this.property_phones.length !== 0){
            $.post("/api/propertyext/deletelist.json",{
                properties: JSON.stringify(this.property_phones)
            },function (result){
                utils.successModal(localization.getVariable("delete_success_label"));
            });
        }
    };
    
    this.removeStock = function(remove_mode){
        if (this.property_phones.length !== 0){
            $.post("/api/property/deletestock.json",{
                properties: JSON.stringify(this.property_phones),
                remove_mode: remove_mode 
            },function (result){
                if (result.error != undefined){
                    $('#stock_delete_error_alert').show();
                    $('#stock_delete_error_alert').html(result.error.description);
                }
                else{
                    $('#stock_delete_success_alert').show();
                    $('.card_selected').remove();
                }
            });
        }
        
        if (this.client_phones.length !== 0){
            $.post("/api/client/delete.json",{
                clients: JSON.stringify(this.client_phones)
            },function (result){
                if (result.error != undefined){
                    $('#delete_error_alert').show();
                    $('#delete_error_alert').html(result.error.description);
                }
                else{
                    $('#delete_success_alert').show();
                }
            });
        }
    };
    
    this.createEmail = function(address){
        var text = $('#search_conditions_span').text()+":\n\n";
        var subj = $('#search_conditions_span').text();
        
        $('#property_results_table tr:visible').children().children('.card_id').each(function(){
            text += $(this).text()+"\n";
        });
        
        //console.log(text);
        
        //var formattedBody = "FirstLine \n Second Line \n Third Line";
        var mailToLink = "mailto:"+address+"?subject="+encodeURIComponent(subj)+"&body=" + encodeURIComponent(text);
        $('#email_a').attr("href", mailToLink);
    };
    
    /*this.sort = function(parameter){
        switch (parameter) {
            case "date": 
                var obj = {};
                
                for (var i = 0; i < this.properties.length; i++){
                    obj[i] = Number(this.properties[i].last_updated != null ? this.properties[i].last_updated : this.properties[i].timestamp);
                }
                
                this.sortPropertiesByNumber(obj);
                
                var obj = {};
                
                for (var i = 0; i < this.clients.length; i++){
                    obj[i] = Number(this.clients[i].last_updated != null ? this.clients[i].last_updated : this.clients[i].timestamp);
                }
                
                this.sortClientsByNumber(obj);
            break;
            case "street": 
                var obj = {};
                
                for (var i = 0; i < this.properties.length; i++){
                    obj[i] = this.properties[i].street_name != undefined ? this.properties[i].street_name : "";
                }
                
                this.sortPropertiesByString(obj);
            break;
            case "house": 
                var obj = {};
                
                for (var i = 0; i < this.properties.length; i++){
                    obj[i] = Number(this.properties[i].house_number);
                }
                
                this.sortPropertiesByNumber(obj);
            break;
            case "price": 
                var obj = {};
                
                for (var i = 0; i < this.properties.length; i++){
                    obj[i] = Number(this.properties[i].price_converted);
                }
                
                this.sortPropertiesByNumber(obj);
                
                var obj = {};
                
                for (var i = 0; i < this.clients.length; i++){
                    obj[i] = Number(this.clients[i].price_converted);
                }
                
                this.sortClientsByNumber(obj);
            break;
            case "city": 
                
            break;
        }
    };
    */
    
    this.sort = function(parameter){
        $.post("/api/search/addsort.json",{
            search: this.search_id,
            by: parameter
        }, function(result){
            location.reload();
        });
    };
    
    this.sortPropertiesByNumber = function(obj){
        var result = [];
        
        if (this.properties.length === 0){
            return 0;
        }
        
        var tuples = [];

        for (var key in obj) tuples.push([key, obj[key]]);

        tuples.sort(function(a, b) {
            a = a[1];
            b = b[1];

            if (response_list.sorted === 0){
                return a < b ? -1 : (a > b ? 1 : 0);                
            }
            else{
                return a > b ? -1 : (a < b ? 1 : 0);                
            }
        });
        
        if (this.sorted === 0){
            this.sorted = 1;            
        }
        else{
            this.sorted = 0;               
        }
        
        console.log(tuples);

        for (var i = 0; i < tuples.length; i++) {
            var key = tuples[i][0];
            var value = tuples[i][1];

            result.push(key);
        }
        
        $('#property_all_check, .list_icheck').iCheck('destroy');
        
        $('#property_results_table').html("");
        
        $('#property_results_table').append('<tr class="mark_all_check">\n\
            <td class="left_padding_5 top_padding_5">\n\
                <input id="property_all_check" class="icheck" type="checkbox"/>\n\
            </td>\n\
        </tr>');

        $('#property_all_check').on('ifClicked', function(event){
            response_list.markAll();
        });

        for (var z = 0; z < result.length; z++){
            for (var i = 0; i < this.sorting_stack.properties.length; i++){
                if (i == result[z]){
                    $('#property_results_table').append(this.sorting_stack.properties[i]);
                    this.sorting_stack.properties[i].removeClass("hl");
                    
                    if (z % 2 === 0){
                        this.sorting_stack.properties[i].addClass("hl");
                    }
                    
                    $('#property_'+response_list.properties[i].id+'_check').on(
                        'ifClicked', 
                        {property: response_list.properties[i].id},
                        function(event){
                            response_list.selectPropertyPhone(document.getElementById("property_"+event.data.property+"_list_tr"), Number(event.data.property));
                    });
                }
            }
        }
        
        app.customCheckbox();
    };
    
    this.sortClientsByNumber = function(obj){
        var result = [];
        
        if (this.clients.length === 0){
            return 0;
        }
        
        var tuples = [];

        for (var key in obj) tuples.push([key, obj[key]]);

        tuples.sort(function(a, b) {
            a = a[1];
            b = b[1];

            if (response_list.sorted === 0){
                return a < b ? -1 : (a > b ? 1 : 0);                
            }
            else{
                return a > b ? -1 : (a < b ? 1 : 0);                
            }
        });
        
        if (this.sorted === 0){
            this.sorted = 1;            
        }
        else{
            this.sorted = 0;               
        }

        for (var i = 0; i < tuples.length; i++) {
            var key = tuples[i][0];
            var value = tuples[i][1];

            result.push(key);
        }
        
        $('#client_all_check, .list_icheck').iCheck('destroy');
        $('#client_results_table').html("").append('<tr class="mark_all_check">\n\
            <td class="left_padding_5 top_padding_5">\n\
                <input id="client_all_check" class="icheck" type="checkbox"/>\n\
            </td>\n\
        </tr>');

        $('#client_all_check').on('ifClicked', function(event){
            response_list.markAll();
        });

        for (var z = 0; z < result.length; z++){
            for (var i = 0; i < this.sorting_stack.clients.length; i++){
                if (i == result[z]){
                    $('#client_results_table').append(this.sorting_stack.clients[i]);
                    this.sorting_stack.clients[i].removeClass("hl");
                    
                    if (z % 2 === 0){
                        this.sorting_stack.clients[i].addClass("hl");
                    }
                    
                    $('#client_'+response_list.clients[i].id+'_check').on(
                        'ifClicked', 
                        {client: response_list.clients[i].id},
                        function(event){
                            response_list.selectClientPhone(document.getElementById("client_"+event.data.client+"_list_tr"), Number(event.data.client));
                    });
                }
            }
        }
        
        app.customCheckbox();
    };
    
    this.sortPropertiesByString = function(obj){
        var result = [];
        
        if (this.properties.length === 0){
            return 0;
        }
        
        var tuples = [];

        for (var key in obj) tuples.push([key, obj[key]]);

        tuples = utils.sortString(response_list.street_names, function(x){return x[1]})
        console.log(tuples);
        if (this.sorted === 0){
            this.sorted = 1;            
        }
        else{
            this.sorted = 0;               
        }

        for (var i = 0; i < tuples.length; i++) {
            var key = tuples[i][0];
            var value = tuples[i][1];

            result.push(key);
        }
        
        $('#property_all_check, .list_icheck').iCheck('destroy');
        
        $('#property_results_table').html("");
        
        $('#property_results_table').append('<tr class="mark_all_check">\n\
            <td class="left_padding_5 top_padding_5">\n\
                <input id="property_all_check" class="icheck" type="checkbox"/>\n\
            </td>\n\
        </tr>');

        $('#property_all_check').on('ifClicked', function(event){
            response_list.markAll();
        });

        for (var z = 0; z < result.length; z++){
            for (var i = 0; i < this.sorting_stack.properties.length; i++){
                if (i == result[z]){
                    $('#property_results_table').append(this.sorting_stack.properties[i]);
                    this.sorting_stack.properties[i].removeClass("hl");
                    
                    if (z % 2 === 0){
                        this.sorting_stack.properties[i].addClass("hl");
                    }
                    
                    $('#property_'+response_list.properties[i].id+'_check').on(
                        'ifClicked', 
                        {property: response_list.properties[i].id},
                        function(event){
                            response_list.selectPropertyPhone(document.getElementById("property_"+event.data.property+"_list_tr"), Number(event.data.property));
                    });
                }
            }
        }
        
        app.customCheckbox();
    };

    this.filterDefaultSearch = function(){
        if (urlparser.getParameter("id") != undefined){
            return this.conditions.id;
        }
        else{
            return "default";
        }
    };
    
    this.openOnTouch = function(id, search, tr, item_type){
        return false;
        
        if ($(tr).children("button").length === 0){
            if (localization.isArabian()){
                $(tr).append('<button class="btn btn-primary touch_tr_open_rtl" onclick="location.href=\''+item_type+'?id='+id+'&search='+search+'\'"><i class="fa fa-folder"></i></button>');
            }
            else{
                $(tr).append('<button class="btn btn-primary touch_tr_open_ltr" onclick="location.href=\''+item_type+'?id='+id+'&search='+search+'\'"><i class="fa fa-folder"></i></button>');
            }
        }
    };
    
    this.setCollectingForbiddenClosed = function(element){
        utils.setCookie("collecting_forbidden_closed", 1, {expires: 315360000});
        $('#on_collecting_forbidden_modal').modal("hide");
        window.open($('#on_collecting_forbidden_property_a').attr("href"), '_blank');
    };
    
    this.refresh = function(){
        if (this.property_phones.length === 0 && this.client_phones.length === 0){
            $('#no_selected_cards_modal').modal("show");
        }
        else{
            utils.htmlSpinner("refresh_button");
            
            var property_phones_parsed = [];
            
            for (var i = 0; i < this.property_phones.length; i++){
                var card_id = this.property_phones[i].card;
                
                if ($('#property_'+card_id+'_list_tr').hasClass("external_property")){
                    property_phones_parsed.push({card: card_id, external: 1});
                }
                else{
                    property_phones_parsed.push({card: card_id, external: 0});
                }
            }
            
            $.post("/api/responselist/refresh.json",{
                properties: JSON.stringify(property_phones_parsed),
                clients: JSON.stringify(this.client_phones)
            }, function(result){
                var properties = result.properties;
                var clients = result.clients;
                
                for (var i = 0; i < properties.length; i++){
                    var phones = "";
                    var buffer = "";
                    var data = "";
                    var data_expanded = "";
                    
                    if (properties[i].stock == 1){
                        data = buffer = "";
                        data_expanded += "<td>"+buffer+"</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    var types = JSON.parse(properties[i].types);
                    
                    if (types != null){
                        for (var z = 0; z < types.length; z++){
                            var tmp = "<span locale='"+response_list.form_options.property_type[types[z]]+"'>"+localization.getVariable(response_list.form_options.property_type[types[z]])+"</span>"+(z === types.length-1 ? "" : "/");
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
                    
                    if (properties[i].currency_id != null){
                        data += buffer = ',&nbsp;<span class="price">'+utils.numberWithCommas(properties[i].price)+' '+response_list.form_options.currency[properties[i].currency_id]["symbol"]+'</span>';
                        data_expanded += "<td>"+buffer.substr(7)+"</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    var street_is_not_empty = false;
                    
                    if (properties[i].street != "" && properties[i].street != null){
                        data += buffer = ',&nbsp;<span class="geoloc_span" property="'+properties[i].id+'" placeid="'+properties[i].street+'"></span>';
                        street_is_not_empty = true;
                        placeDetailsByPlaceIdNoAutocomplete(properties[i].street, service_route);
                    }

                    if (
                            properties[i].street != "" && 
                            properties[i].street != null && 
                            properties[i].house_number != 0 && 
                            properties[i].house_number != null
                    ){
                        var tmp = '&nbsp;<span class="house_number">'+properties[i].house_number+"</span>"
                        data += tmp;
                        buffer += tmp;
                    }
                    
                    if (
                            properties[i].street != "" && 
                            properties[i].street != null && 
                            properties[i].house_number != 0 && 
                            properties[i].flat_number != 0 && 
                            properties[i].house_number != null && 
                            properties[i].flat_number != null
                    ){
                        var tmp = '<span class="flat_number">/'+properties[i].flat_number+"</span>";
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
                    
                    if (properties[i].home_dims != null && properties[i].home_size != null){
                        var home_size_value = properties[i].home_size+" "+"<span locale='"+response_list.form_options.dimension[properties[i].home_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[properties[i].home_dims]["locale"]);
                        data += ',&nbsp;<span locale="home_noregister_span">'+localization.getVariable("home_noregister_span")+'</span> '+home_size_value+"</span>";
                        data_expanded += "<td>"+home_size_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (properties[i].lot_dims != null && properties[i].lot_size != null){
                        var lot_size_value = properties[i].lot_size+" "+"<span locale='"+response_list.form_options.dimension[properties[i].lot_dims]["locale"]+"'>"+localization.getVariable(response_list.form_options.dimension[properties[i].lot_dims]["locale"]);
                        data += ',&nbsp;<span locale="lot_noregister_span">'+localization.getVariable("lot_noregister_span")+'</span> '+lot_size_value+"</span>";
                        data_expanded += "<td>"+lot_size_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (properties[i].floors_count != null || properties[i].floor_from != null){
                        var floor_from = properties[i].floor_from != undefined && properties[i].floor_from != null ? properties[i].floor_from : "?";
                        var floors_string = floor_from+(properties[i].floors_count != null ? "/"+properties[i].floors_count : "");
                        data_expanded += "<td>"+floors_string+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                    }
                    
                    if (properties[i].rooms_count != 0 && properties[i].rooms_count != null){
                        data += ',&nbsp;'+properties[i].rooms_count+' <span locale="rooms_noregister_span">'+localization.getVariable("rooms_noregister_span")+'</span>';
                        data_expanded += "<td>"+properties[i].rooms_count+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    if (properties[i].source ==  undefined){
                        var agent_value = '<span '+(properties[i].stock == 0 || properties[i].foreign_stock == 0 ? 'agent="'+properties[i].agent_id+'"' : "locale='stock'")+' class="card_agent">'+localization.getVariable("stock")+'</span>';
                        data += ',&nbsp;<span locale="agent_noregister_span">'+localization.getVariable("agent_noregister_span")+'</span>: '+agent_value;
                        data_expanded += "<td>"+agent_value+"</td>";
                    }
                        
                    if (properties[i].contact1 != "" && properties[i].contact1 != null){
                        var tmp = '<span id="contact1_span" property_card="'+properties[i].id+'" class="card_phone_not_selected card_phone contact1" ><!--ondblclick="owl.phoneCall(this); return false;"-->'+properties[i].contact1+'</span>, ';
                        phones += tmp;
                        buffer = tmp;
                    }
                    
                    if (properties[i].contact2 != "" && properties[i].contact2 != null){
                        var tmp = '<span id="contact2_span" property_card="'+properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+properties[i].contact2+'</span>, ';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    if (properties[i].contact3 != "" && properties[i].contact3 != null){
                        var tmp = '<span id="contact3_span" property_card="'+properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+properties[i].contact3+'</span>, ';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    if (properties[i].contact4 != "" && properties[i].contact4 != null){
                        var tmp = '<span id="contact4_span" property_card="'+properties[i].id+'" class="card_phone_not_selected card_phone"><!--ondblclick="owl.phoneCall(this)"-->'+properties[i].contact4+'</span>, ';
                        phones += tmp;
                        buffer += tmp;
                    }
                    
                    if (properties[i].source != undefined){
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    data += ", "+phones;
                    data_expanded += "<td>"+buffer.substr(0, buffer.length-2)+"</td>";
                    buffer = "";
                    
                    if (properties[i].email != "" && properties[i].email != null){
                        data += "@, ";
                        data_expanded += "<td>@</td>";
                        buffer = "";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }

                    if (properties[i].last_updated != null){
                        var lastupd_value = utils.convertTimestampForDatepicker(properties[i].last_updated);
                        data += '&nbsp<span locale="lastupd_noregister_span">'+localization.getVariable("lastupd_noregister_span")+'</span>: '+lastupd_value;
                        data_expanded += "<td>"+lastupd_value+"</td>";
                    }
                    else if (properties[i].timestamp != null){
                        var timestamp_value = utils.convertTimestampForDatepicker(properties[i].timestamp);
                        data += '&nbsp;<span locale="created_noregister_span">'+localization.getVariable("created_noregister_span")+'</span>: '+timestamp_value;
                        data_expanded += "<td>"+timestamp_value+"</td>";
                    }
                    else{
                        data_expanded += "<td></td>";
                        buffer = "";
                    }
                    
                    var pid = properties[i].id;

                    $('#property_'+pid+'_list_tr').html(
                        '<td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="property_'+pid+'_check" class="icheck list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        <td>'+data+'\n\
                            <span class="card_id" style="'+(properties[i].source != undefined ? "display:none" : "")+'">\n\
                                ,&nbsp;<span locale="card_noregister_span">'+localization.getVariable("card_noregister_span")+'</span>\n\
                                '+(properties[i].internal_id != undefined && properties[i].internal_id != null ? properties[i].internal_id : pid)+'\
                            </span>\
                        </td>');
                    $('#property_'+pid+'_list_tr').attr({
                            //"onclick": "response_list.selectPropertyPhone(this, "+pid+")",
                            "onclick": "location.href = 'property?id="+properties[i].internal_id+"&search="+response_list.filterDefaultSearch()+"'"
                            //"onmousedown": 'response_list.openOnTouch('+pid+', '+search.data.id+', this, "property")'
                    });
                    
                    $('#property_'+pid+'_list_tr_expanded').html(
                        '<td class="left_padding_5 top_padding_5">\n\
                            <span class="list_item_number">'+(i+1)+') </span>\n\
                            <input id="property_'+pid+'_check_expanded" class="icheck_transparent list_icheck" type="checkbox"/>\n\
                        </td>\n\
                        '+data_expanded+',\n\
                        <td><span class="card_id" style="'+(properties[i].source != undefined ? "display:none" : "")+'">\n\
                                '+pid+'\
                            </span>\
                        </td></tr>');
                    $('#property_'+pid+'_list_tr_expanded').attr({
                            //"onclick": "response_list.selectPropertyPhone(this, "+pid+")",
                            "onclick": "location.href = 'property?id="+properties[i].internal_id+"&search="+response_list.filterDefaultSearch()+"'"
                            //"onmousedown": 'response_list.openOnTouch('+pid+', '+search.data.id+', this, "property")'
                    });
                    
                    if (properties[i].internal_id != undefined && properties[i].internal_id != null){
                        $('#property_'+pid+'_list_tr').removeClass("external_property");
                    }
                    
                    $('#property_'+pid+'_check, #property_'+pid+'_check_expanded').on(
                        'ifClicked', 
                        {property: pid},
                        function(event){
                            response_list.selectPropertyPhone(document.getElementById("property_"+event.data.property+"_list_tr"), Number(event.data.property));
                    });
                    
                    /*if (properties[i].internal_id != undefined && properties[i].internal_id != null){
                        $('#property_'+pid+'_list_tr')
                            .attr({
                                id: '#property_'+properties[i].internal_id+'_list_tr',
                                onclick: 'response_list.selectPropertyPhone(this, '+properties[i].internal_id+')',
                                onmousedown: 'response_list.openOnTouch('+properties[i].internal_id+', '+(search.data != null ? search.data.id : search.defaults.search.id)+', this, "property")'
                            })
                            .removeClass("external_property");
                        
                        for (var t = 0; t < response_list.properties.length; t++){
                            if (response_list.properties[t].id == properties[i].id){
                                response_list.properties[t] = properties[i];
                                response_list.properties[t].id = properties[i].internal_id;
                            }
                        }
                    }*/
                    
                    if (properties[i].foreign_stock == 1){
                        $('#property_'+pid+'_list_tr').addClass("stock_property");
                    }
                    else{
                        $('#property_'+pid+'_list_tr').removeClass("stock_property");
                    }
                    
                    app.customCheckboxBySelector('#property_'+pid+'_check');
                    app.customCheckboxBySelector('#property_'+pid+'_check_expanded');
                    $('#property_'+pid+'_check, #property_'+pid+'_check_expanded').iCheck("check");
                    
                    if (properties[i].internal_id != undefined && properties[i].internal_id != null){
                        $('#property_'+pid+'_list_tr').addClass("external_property");
                    }
                }
                
                for (var i = 0; i < clients.length; i++){
                    
                }
                
                //app.customCheckbox();
                utils.removeHtmlSpinner("refresh_button");
            });
        }
    };
    
    this.showOnboarding = function(){
        $('.search_onboarding').show();
        $('#property_results_area').addClass('property_results_wrapper_onboarding');
    };
    
    this.hideOnboarding = function(){
        $('.search_onboarding').hide();
        $('#property_results_area').removeClass('property_results_wrapper_onboarding').removeClass('no_results_wrapper');
    };
    
    this.showOpenLoader = function(){
        var container = $('#property_results_table_wrapper');
        var loader = $('<div></div>', {class: "list_card_open_loader"});        

        container.css("overflow", "hidden");
        container.scrollTop(0);
        container.append(loader);        
    };
    
    this.saveSelected = function(){
        if (this.property_phones.length > 0){
            var parsed = [];
            
            for (var i = 0; i < this.property_phones.length; i++){
                parsed.push(this.property_phones[i].card);
            }
            
            $.post("/api/search/saveselectedonmap.json",{
                data: JSON.stringify(parsed),
                reduced: this.reduced
            },function (result){
                response_list.selected = result;
                $('#switch_to_list_button').attr("href", "query?id="+response_list.search_id+"&selected="+response_list.selected+"&response=map");
            });
            
            
        }
        else{
            response_list.selected = null;
            $('#switch_to_list_button').attr("href", "query?id="+response_list.search_id+"&response=map");
        }
    };
    
    this.drawContour = function(){
        if (search.response_type == "list"){
            this.showOpenLoader();
            location.href = this.search_id != -1 ? "query?id="+this.conditions.id+"&response=map&action=new_contour" : "query?response=map&action=new_contour";
        }
        else{
            deleteSelectedShape();
        }
    };
}