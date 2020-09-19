//var localization = new Localization();
//var urlparser = new URLparser();
//var utils = new Utils();
//var user = new User();

//var owl = new Owl();
//var tools = new Tools();

function ResponseMap(){
    this.search_id = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : -1;
    this.single_property = urlparser.getParameter("property") != undefined ? urlparser.getParameter("property") : null;
    this.data = null;
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
    this.phones = [];
    this.selected_cards = [];
    this.selected = null; // id списка выбранных на карте
    
    this.init = function(){
        this.search_id = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : -1;
        this.single_property = urlparser.getParameter("property") != undefined ? urlparser.getParameter("property") : null;
        
        localization.init();
        this.showButtons();
        $('.feedback').feedback();
        
        //this.search_id = urlparser.getParameter("search");
        //initGoogleMaps();
        
        //############## getting common user defaults ##########################//
        
        /*$.post("/api/defaults/get.json",{
        },function (result){
            if (result.error != undefined)
                showErrorMessage(result.error.description);
            else{
                response_map.defaults = result;
                
                for (var key in response_map.defaults){
                    switch (key) {
                        case "locale":
                            if (response_map.defaults[key] != null)
                                localization.setLocale(response_map.defaults[key]);
                            else localization.setDefault();
                        break;

                    }
                }
            }
        });*/
        
        //$.post("/api/property/getformoptions.json",{
        //},function (result){
            var result = global_data.property_getformoptions;
        
            if (result.error != undefined)
                utils.errorModal(response_map.error.description);
            else{
                this.form_options = result;
                
                /*for (var key in response_map.form_options){
                    switch (key) {
                        case "ascription":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#ascription_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "property_type":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#properties_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "status":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#status_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "view":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#view_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "dimension":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#dims_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "direction":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#directions_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]+"</option>");
                        break;
                        case "currency":
                            for (var i = 0; i < response_map.form_options[key].length; i++)
                                $('#currency_select').append("<option value='"+i+"'>"+response_map.form_options[key][i]["symbol"]+"</option>");
                        break;
                        default:
                           return 0;
                        break;
                    }
                    
                    localization.toLocale();
                }*/
                
                if (this.single_property != null){
                    this.getSingleProperty();
                }
                else if (this.search_id !== -1){
                    this.get();
                }
                else{
                    this.getEmpty();
                }
            }
        //});
    };
    
    this.reInit = function(){
        this.search_id = urlparser.getParameter("id") != undefined ? urlparser.getParameter("id") : -1;
        this.single_property = urlparser.getParameter("property") != undefined ? urlparser.getParameter("property") : null;
        markers_not_showed_counter = 0;
        
        this.showButtons();
        $('.feedback').feedback();
        response_map.get();
    };
    
    this.showButtons = function(){
        $('#saved_contours_button').show();
        $('#switch_to_list_button').show();
        $('#draw_new_button').show();
        //$('#save_contour_button').show();
        $('#map_average_button').show();
        $('#map_reduce_button').show();
    };
    
    this.get = function(){
        //$.post("/api/search/query.json",{
        //    search_id: this.search_id
        //}, this.showResults);
        if (global_data.search_query != null){
            this.showResults(global_data.search_query);
        }
    };
    
    this.getEmpty = function(){
        //$.post("/api/search/queryempty.json", {}, this.showResults);
        this.showResults(global_data.search_queryempty);
    };
    
    this.showResults = function(result){
        response_map.data = result.properties;
        response_map.conditions = result.conditions;
        //$('#back_button').attr("href","query?id="+response_map.conditions.id);

        if (result.clients.length === 0){
            $('#switch_to_list_button')
                .attr({href: response_map.search_id != -1 ? "query?id="+response_map.conditions.id+"&response=list" : "query"})
                .children("span")
                .attr({locale: "to_list"})
                .text(localization.getVariable("to_list"));
            $('#switch_to_list_button').children("i").addClass("fa-list").removeClass("fa-globe");
            //localization.toLocale();
        }
        else{
            location.href = response_map.search_id != -1 ? "query?id="+response_map.conditions.id+"&response=list" : "query";
        }

        if (result.properties.length === 0 && result.clients.length === 0){
            $('#save_search_button').hide();
            $('#map_average_button').hide();
            $('#map_reduce_button').hide();
            //$('#switch_to_list_button').hide();
            $('#save_contour_button').hide();
            $('#saved_contours_button').hide();
            //$('#draw_new_button').hide();
        }
        else{
            $('#map_mark_all_button').show();
        }

        $('#stock_check_wrapper').show();
        $('#draw_new_button').show();

        for (var key in response_map.conditions)
            if (response_map.conditions[key] != null && response_map.conditions[key] != "")
                switch (key) {
                    case "city":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "lat":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "lng":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "neighborhood":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "street":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "ascription":
                        response_map.conditions_parsed[key] = "<span locale='"+response_map.form_options.ascription[response_map.conditions[key]]+"'></span>";
                    break;
                    case "status":
                        var object = JSON.parse(response_map.conditions[key]);
                        response_map.conditions_parsed[key] = "<span locale='"+response_map.form_options.status[object[0]]+"'></span>";

                        if (object.length > 1)
                            for (var i = 1; i < object.length; i++){
                                response_map.conditions_parsed[key] += "/"+"<span locale='"+response_map.form_options.status[object[i]]+"'></span>";
                            }
                    break;
                    case "furniture":
                        response_map.conditions_parsed[key] = "<span locale='furniture_noregister_span'>furniture</span>: "+(response_map.conditions[key] == 0 ? "<span locale='no'>no</span>" : "<span locale='yes'>yes</span>");
                    break;
                    case "property":
                        var object = JSON.parse(response_map.conditions[key]);
                        response_map.conditions_parsed[key] = "<span locale='"+response_map.form_options.property_type[object[0]]+"'></span>";

                        if (object.length > 1)
                            for (var i = 1; i < object.length; i++){
                                response_map.conditions_parsed[key] += "/"+"<span locale='"+response_map.form_options.property_type[object[i]]+"'></span>";
                            }
                    break;
                    case "price_from":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "price_to":
                        response_map.conditions_parsed[key] = "-"+response_map.conditions[key];
                    break;
                    case "currency":
                        response_map.conditions_parsed[key] = response_map.form_options.currency[response_map.conditions[key]]["symbol"];
                    break;
                    case "object_type":
                        if (response_map.conditions[key] == 2) // 1 - house, 2 - flat
                            response_map.conditions_parsed[key] = "<span locale='lot_noregister_span'>lot</span>";
                        else response_map.conditions_parsed[key] = "<span locale='home_noregister_span'>home</span>";
                    break;    
                    case "object_size_from":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "object_size_to":
                        response_map.conditions_parsed[key] = "-"+response_map.conditions[key];
                    break;
                    case "object_dimensions":
                        response_map.conditions_parsed[key] = "<span locale='"+response_map.form_options.dimension[response_map.conditions[key]]+"'></span>";
                    break;
                    case "age_from":
                        response_map.conditions_parsed[key] = "<span locale='built_noregister_span'>built</span> "+response_map.conditions[key];
                    break;
                    case "age_to":
                        response_map.conditions_parsed[key] = "-"+response_map.conditions[key];
                    break;
                    case "floors_from":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "floors_to":
                        response_map.conditions_parsed[key] = "-"+response_map.conditions[key]+" <span locale='floors_noregister_span'>floors</span>";
                    break;
                    case "rooms_from":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;
                    case "rooms_to":
                        response_map.conditions_parsed[key] = "-"+response_map.conditions[key]+" <span locale='rooms_noregister_span'>rooms</span>";
                    break;
                    case "project":
                        response_map.conditions_parsed[key] = response_map.conditions[key];
                    break;  
                    case "history_type":
                        if (response_map.conditions[key] == 0)
                            response_map.conditions_parsed[key] = "<span locale='lastupd_noregister_span'>last update</span>:";
                        else if (response_map.conditions[key] == 1)
                            response_map.conditions_parsed[key] = "<span locale='free_noregister_span'>free from</span>:";
                    break;
                    case "history_from":
                        response_map.conditions_parsed[key] = utils.convertTimestampForDatepicker(response_map.conditions[key]);
                    break;
                    case "history_to":
                        response_map.conditions_parsed[key] = utils.convertTimestampForDatepicker(response_map.conditions[key]);
                    break;
                    case "parking":
                        response_map.conditions_parsed[key] = "<span locale='parking_noregister_span'>parking</span>";
                    break;
                    case "facade":
                        response_map.conditions_parsed[key] = "<span locale='facade_noregister_span'>facade</span>";
                    break;
                    case "air_cond":
                        response_map.conditions_parsed[key] = "<span locale='air_cond_noregister_span'>air conditioner</span>";
                    break;
                    case "elevator":
                        response_map.conditions_parsed[key] = "<span locale='elevator_noregister_span'>elevator</span>";
                    break;
                    case "no_ground_floor":
                        response_map.conditions_parsed[key] = "<span locale='no_ground_floor_noregister_span'>no ground floor</span>";
                    break;
                    case "no_last_floor":
                        response_map.conditions_parsed[key] = "<span locale='no_last_floor_noregister_span'>no last floor</span>";
                    break;
                    case "special_by":
                        switch (response_map.conditions[key]) {
                            case "0":
                               response_map.conditions_parsed[key] = "<span locale='by_text_span'>by text:</span>";
                            break;
                            case "1":
                               response_map.conditions_parsed[key] = "<span locale='by_agreement_span'>by greement №:</span>";
                            break;
                            case "2":
                               response_map.conditions_parsed[key] = "<span locale='by_card_span'>by card:</span>";
                            break;
                            case "3":
                               response_map.conditions_parsed[key] = "<span locale='by_phone_span'>by phone:</span>";
                            break;
                            case "4":
                               response_map.conditions_parsed[key] = "<span locale='by_email_span'>by e-Mail:</span>";
                            break;
                        }
                    break;
                    case "special_argument":
                        if (response_map.conditions["special_by"] == "5"){
                            var parsed_argument = JSON.parse(response_map.conditions["special_argument"]);
                            response_map.conditions_parsed["special_by"] = "by "+parsed_argument.object_type+" card "+parsed_argument.object_id+" phone(s):";
                            response_map.conditions_parsed[key] = "";

                            for (var i = 0; i < parsed_argument.phones.length; i++)
                                response_map.conditions_parsed[key] += (i !== 0 ? ", " : "")+parsed_argument.phones[i];

                            $('#back_button').attr("href", parsed_argument.object_type+"?id="+parsed_argument.object_id);
                        }
                        else response_map.conditions_parsed[key] = response_map.conditions[key];
                    break; 
                }


        if (response_map.conditions_parsed.ascription !== undefined) $('#search_conditions_span').append(response_map.conditions_parsed.ascription);
        if (response_map.conditions_parsed.status !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.status);
        if (response_map.conditions_parsed.floors_from !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.floors_from+response_map.conditions_parsed.floors_to);
        if (response_map.conditions_parsed.rooms_from !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.rooms_from+response_map.conditions_parsed.rooms_to);
        if (response_map.conditions_parsed.property !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.property);
        if (response_map.conditions_parsed.age_from !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.age_from+response_map.conditions_parsed.age_to);
        if (response_map.conditions_parsed.object_size_from !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.object_size_from+response_map.conditions_parsed.object_size_to+" "+response_map.conditions_parsed.object_dimensions+" "+response_map.conditions_parsed.object_type);
        if (response_map.conditions_parsed.city !== undefined) {
            $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_map.conditions_parsed.city+"'></span>");
            placeDetailsByPlaceIdNoAutocomplete(response_map.conditions_parsed.city, service_city);
        }
        if (response_map.conditions_parsed.neighborhood !== undefined) {
            $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_map.conditions_parsed.neighborhood+"'></span>");
            placeDetailsByPlaceIdNoAutocomplete(response_map.conditions_parsed.neighborhood, service_neighborhood);
        }
        if (response_map.conditions_parsed.street !== undefined) {
            $('#search_conditions_span').append(", <span class='geoloc_span' placeid='"+response_map.conditions_parsed.street+"'></span>");
            placeDetailsByPlaceIdNoAutocomplete(response_map.conditions_parsed.street, service_route);
        }
        if (response_map.conditions_parsed.price_from !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.price_from+response_map.conditions_parsed.price_to+" "+response_map.conditions_parsed.currency);
        if (response_map.conditions_parsed.project !== undefined) {
            $('#search_conditions_span').append(", <span locale='project_noregister_span' >project</span>: <span id='conditions_project'></span>");
            $.post("/api/agency/getprojectslist.json",{
            },function (result){
                for (var i = 0; i < result.length; i++)
                    if (response_map.conditions_parsed.project == result[i].id)
                        $('#conditions_project').text(result[i].title);
            });
        }
        if (response_map.conditions_parsed.furniture !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.furniture);
        if (response_map.conditions_parsed.parking !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.parking);
        if (response_map.conditions_parsed.facade !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.facade);
        if (response_map.conditions_parsed.air_cond !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.air_cond);
        if (response_map.conditions_parsed.elevator !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.elevator);
        if (response_map.conditions_parsed.no_ground_floor !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.no_ground_floor);
        if (response_map.conditions_parsed.no_last_floor !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.no_last_floor);
        if (response_map.conditions_parsed.history_type !== undefined) $('#search_conditions_span').append(", "+response_map.conditions_parsed.history_type+" "+response_map.conditions_parsed.history_from+" to "+response_map.conditions_parsed.history_to);
        if ((search.data != null && search.data.contour == null) || search.defaults.search.contour == null){
            $('#search_entries_founded_span').html(response_map.data.length);
        }
        $('#switch_to_list_button').attr("disabled", false);
        $('#stock_check').iCheck("enable");
        $('#search_entries_marked_span').html(0);
        $('#marked_wrapper').show();

        initMap(Number(response_map.conditions_parsed["lat"]), Number(response_map.conditions_parsed["lng"]));

        //$.post("/api/agency/getagentslist.json",{
        //},function (result){
            for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                if ($('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').length !== 0)
                    $('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
            }
        //});

        //$('#switch_to_list_button').attr("href", "response_map?search="+response_map.search_id);

        app.customCheckbox();
        search.initStockCheckbox();
        //localization.toLocale();
        //search.checkPropertiesLimit(response_map.data);
    };
    
    this.getSingleProperty = function(){
        if (this.single_property != null){
            $('#main_header')
                .html("<span locale='property_label'>Property</span> "+this.single_property+" <span locale='on_map'>on map</span>")
                .hover(function(){
                    $('#main_header, #main_header>span').attr("title", $(this).text());
                });
            $.post("/api/property/get.json",{
                iPropertyId: this.single_property
            },function (result){
                //console.log(result);
                response_map.data = [];
                response_map.data.push(result);
                $('#search_conditions_span').html("<span locale='property_label'></span> "+response_map.data[0].id);
                //$('#search_entries_founded_span + span').hide();
                //$('span[locale="founded_span"]').hide();
                $('#founded_wrapper_div').hide();
                $('#marked_wrapper').hide();
                $('#mark_all_button').attr("disabled", true);
                $('#average_button').attr("disabled", true);
                $('#reduce_button').attr("disabled", true);
                $('#switch_to_list_button').attr("disabled", true);
                //response_map.conditions = result.conditions;
                $('#back_button').attr("href","property?id="+response_map.data[0].id);
                
                initMap(Number(response_map.data[0].lat), Number(response_map.data[0].lng));

                //$.post("/api/agency/getagentslist.json",{
                //},function (result){
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        if ($('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').length !== 0)
                            $('.card_agent[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                    }
                //});
                
                //$('#switch_to_list_button').attr("href", "response_map?search="+response_map.search_id);
        
                app.customCheckbox();
                search.initStockCheckbox();
                //localization.toLocale();
            });
        }
    };
    
    this.placeDetailsByPlaceId = function(placeid){
        $('#main-wrapper').append("<input id='maps_input_invisible' style='display:none' />");
        var service = new google.maps.places.PlacesService(document.getElementById('maps_input_invisible'));
        service.getDetails({placeId: placeid}, function (place, status) {
            //if (status == google.maps.places.PlacesServiceStatus.OK)
                //console.log(place);
        });
    };
    
    this.beforeList = function(){
        if (polygon != null && new_was_created === 1){
            before_exit = 1;
            $('#contour_save_request_modal').modal("show");
            $('#dont_save_button').attr("href", "response_map?search="+response_map.search_id+(response_map.selected != null ? "&selected="+response_map.selected : ""));
        }
        else{
            location.href = "response_map?search="+response_map.search_id+(response_map.selected != null ? "&selected="+response_map.selected : "");
        }
    };
    
    this.saveSelected = function(){
        if (response_map.selected_property.length > 0){
            var parsed = [];
            
            for (var i = 0; i < response_map.selected_property.length; i++){
                if (response_map.selected_property[i] != null){
                    parsed.push(response_map.selected_property[i]);
                }
            }
            
            if (parsed.length > 0 && response_map.search_id != -1){
                $.post("/api/search/saveselectedonmap.json",{
                    data: JSON.stringify(parsed),
                    reduced: reduced_selected
                },function (result){
                    response_map.selected = result;
                    $('#switch_to_list_button').attr("href", "query?id="+response_map.search_id+"&selected="+response_map.selected+"&response=list");
                });
            }
            else{
                response_map.selected = null;
            }
        }
    };
    
    this.average = function(){
        var sum = {price: 0, floors: 0, rooms: 0, home: 0, lot: 0};
        var average = {price: 0, floors: 0, rooms: 0, home: 0, lot: 0};
        $('#avegare_list_table tbody').html("");
        
        if (this.selected_property.length == 0){
            for (var i = 0; i < this.data.length; i++){
                sum.price += this.convertToUSD(this.data[i]); //если цена или валюта == null, возращает 0 !!!
                sum.floors += Number(this.data[i].floors_count);
                sum.rooms += Number(this.data[i].rooms_count);
                sum.home += this.convertToSqMeters(this.data[i], 1);
                sum.lot += this.convertToSqMeters(this.data[i], 2);
            }
            
            average.price = Math.ceil(sum.price/this.data.length);
            average.floors = Math.round(sum.floors/this.data.length);
            average.rooms = Math.round(sum.rooms/this.data.length, 1);
            average.home = Math.ceil(sum.home/this.data.length);
            average.lot = Math.ceil(sum.lot/this.data.length);
        }
        else{
            for (var i = 0; i < this.selected_property.length; i++){
                var property_tmp;
                
                for(z = 0; z < this.data.length; z++){
                    if (this.data[z].id == this.selected_property[i]){
                        property_tmp = this.data[z];
                    }
                }
                
                sum.price += this.convertToUSD(property_tmp); //если цена или валюта == null, возращает 0 !!!
                sum.floors += Number(property_tmp.floors_count);
                sum.rooms += Number(property_tmp.rooms_count);
                sum.home += this.convertToSqMeters(property_tmp, 1);
                sum.lot += this.convertToSqMeters(property_tmp, 2);
            }
            
            average.price = Math.ceil(sum.price/this.selected_property.length);
            average.floors = Math.round(sum.floors/this.selected_property.length);
            average.rooms = Math.round(sum.rooms/this.selected_property.length, 1);
            average.home = Math.ceil(sum.home/this.selected_property.length);
            average.lot = Math.ceil(sum.lot/this.selected_property.length);
        }
        
        $('#avegare_list_table').append('<tr><td>'+average.price+' '+this.form_options.currency[0].symbol+'</td><td>'+average.floors+'</td><td>'+average.rooms+'</td><td>'+average.home+' <span locale="'+this.form_options.dimension[5].locale+'">'+this.form_options.dimension[5].short_title+'</span></td><td>'+average.lot+' <span locale="'+this.form_options.dimension[5].locale+'">'+this.form_options.dimension[5].short_title+'</span></td></tr>');
        $('#average_modal').modal("show");
    };
    
    this.convertToUSD = function(property){
        if (property.price != null && property.currency_id != null){
            return property.price/this.form_options.currency[property.currency_id].exchange;
        }
        else{
            return 0;
        }
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
}