/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function History(object, type){ // объект для работы с историей изменений (недвижимости, клиента и т.д.), type = тип (1-property 2-client) 
    this.data = object;
    this.form_options = null;
    
    this.fillShortTable = function(){
        if (this.data.error == undefined)
            for (var i = 0; i < 2; i++){
                if (this.parseChanges(this.data[i].changes) != null){
                    $('#history_short_table').append("<tr id='row_"+this.data[i].id+"'><td id='timestamp_cell'>"+utils.convertTimestampForDatepicker(this.data[i].timestamp)+"</td><td id='agent_cell' "+(property.data.stock == 0 || property.data.foreign_stock == 0 ? "" : "locale='stock'")+">"+this.data[i].name+"</td><td colspan='2' id='changes_cell'>"+this.parseChanges(this.data[i].changes)+"</td><tr>");
                }
            }
        else $('#history_short_table').append("<tr><td colspan='4' style='text-align: center;'>"+this.data.error.description+"</td></tr>");
    
        localization.toLocale();
    };
    
    this.fillFullTable = function(){
        $('#history_full_table td').parent().remove();
        
        for (var i = 0; i < this.data.length; i++){
            var stock_value = "";
            
            if (location.pathname === "/property"){
                stock_value = property.data.stock == 0 || property.data.foreign_stock == 0 ? "" : "locale='stock'";
            }
            /*else{ // открыть когда сделаю сток на клиенте
                var stock_value = client.data.stock == 0 || client.data.foreign_stock == 0 ? "" : "locale='stock'";
            }*/
            
            if (this.parseChanges(this.data[i].changes) != null){
                $('#history_full_table').append(
                    "<tr id='row_"+this.data[i].id+"'>\n\
                        <td id='timestamp_cell'>"+utils.convertTimestampForDatepicker(this.data[i].timestamp)+"</td>\n\
                        <td id='agent_cell' "+stock_value+">"+this.data[i].name+"</td>\n\
                        <td id='changes_cell'>"+this.parseChanges(this.data[i].changes)+"</td>\n\
                    <tr>");
            }
        }
        
        $('#history_full_table').tablesorter();
        localization.toLocale();
        utils.removeHtmlSpinner("history_modal h4");
    };
    
    this.parseChanges = function(object){
        var response_string = "";
        var object = JSON.parse(object);
        
        if (type == 1)
            this.form_options = property.form_options;
        else this.form_options = client.form_options;
        
        for (var key in object){
            if (key != "undefined"){
                switch (key) {
                    case "types":
                        var old_obj = object[key].old;
                        response_string += "<span locale='property_label'></span>"+": ";

                        for (var i = 0; i < old_obj.length; i++)
                            response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.property_type[old_obj[i]]+"'></span>";

                        response_string += "; ";
                    break;
                    case "property_types":
                        var old_obj = object[key].old;
                        response_string += "<span locale='property_label'></span>"+": ";

                        for (var i = 0; i < old_obj.length; i++)
                            response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.property_type[old_obj[i]]+"'></span>";

                        response_string += "; ";
                    break;
                    case "ascription":
                        response_string += "<span locale='ascription_span'></span>"+": "+"<span locale='"+this.form_options.ascription[object[key].old]+"'></span>"+"; ";
                    break;
                    case "geoloc":
                        response_string += "<span locale='geoloc'></span>; ";
                    break;
                    case "country":
                        response_string += "<span locale='country'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "locality":
                        response_string += "<span locale='city'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "neighborhood":
                        response_string += "<span locale='hood_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "route":
                        response_string += "<span locale='street'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "dimensions":
                        if (this.form_options.dimension[object[key].old] != undefined){
                            response_string += "<span locale='dimensions_span'></span>"+": "+this.form_options.dimension[object[key].old]["short_title"]+"; ";
                        }
                        else{
                            response_string += "<span locale='error_parsing_changed'></span>";
                        }
                    break;
                    case "home_dims":
                        if (object[key].old != null && this.form_options.dimension[object[key].old] != undefined){
                            response_string += "<span locale='dimensions_span'></span>"+": "+this.form_options.dimension[object[key].old]["short_title"]+"; ";     
                        }
                        else{
                            response_string += "<span locale='error_parsing_changed'></span>";
                        }
                    break;
                    case "lot_dims":
                        if (object[key].old != null && this.form_options.dimension[object[key].old] != undefined){
                            response_string += "<span locale='dimensions_span'></span>"+": "+this.form_options.dimension[object[key].old]["short_title"]+"; ";
                        }
                        else{
                            response_string += "<span locale='error_parsing_changed'></span>";
                        }
                    break;
                    case "home_size_dims":
                        if (this.form_options.dimension[object[key].old] != undefined){
                            response_string += "<span locale='dimensions_span'></span>"+": "+this.form_options.dimension[object[key].old]["short_title"]+"; ";
                        }
                        else{
                            response_string += "<span locale='error_parsing_changed'></span>";
                        }
                    break;
                    case "lot_size_dims":
                        if (this.form_options.dimension[object[key].old] != undefined){
                            response_string += "<span locale='dimensions_span'></span>"+": "+this.form_options.dimension[object[key].old]["short_title"]+"; ";
                        }
                        else{
                            response_string += "<span locale='error_parsing_changed'></span>";
                        }
                    break;
                    case "lot_size":
                        response_string += "<span locale='lot_area_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "home_size":
                        response_string += "<span locale='home_area_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "home_size_from":
                        response_string += "<span locale='home_size_from_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "home_size_to":
                        response_string += "<span locale='home_size_to_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "lot_size_from":
                        response_string += "<span locale='lot_size_from_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "lot_size_to":
                        response_string += "<span locale='lot_size_to_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "object_type":
                        response_string += "<span locale='object_type'></span>"+": "+this.parseObjectType(object[key].old)+"; ";
                    break;
                    case "rooms_from_count":
                        response_string += "<span locale='rooms_from_count_span'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "rooms_to_count":
                        response_string += "<span locale='rooms_to_count_span'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "rooms_type":
                        response_string += "<span locale='rooms_type'></span>"+": "+this.parseRoomsType(object[key].old)+"; ";
                    break;
                    case "currency_id":
                        response_string += "<span locale='currency_span'></span>"+": "+this.form_options.currency[object[key].old].symbol+"; ";                 
                    break;
                    case "elevator_flag":
                        response_string += "<span locale='elevator_option_label'></span>"+": "+this.parseFlag(object[key].old)+"; ";                 
                    break;
                    case "parking_flag":
                        response_string += "<span locale='parking_option_label'></span>"+": "+this.parseFlag(object[key].old)+"; ";                 
                    break;
                    case "furniture_flag":
                        response_string += "<span locale='furniture_label'></span>"+": "+this.parseFlag(object[key].old)+"; ";                 
                    break;
                    case "air_cond_flag":
                        response_string += "<span locale='air_cond_option_label'></span>"+": "+this.parseFlag(object[key].old)+"; ";                 
                    break;
                    case "project_id":
                        response_string += "<span locale='project_label'></span>"+": <span class='history_project_span' project_id='"+object[key].old+"'></span>; ";

                        $.post("/api/agency/getproject.json",{
                            project_id: object[key].old
                        },function (response){
                            $('.history_project_span[project_id="'+response.id+'"]').html(response.title);
                        });
                    break;
                    case "agent_id":
                        response_string += "<span locale='agent_label'></span>"+": <span class='history_agent_span' agent_id='"+object[key].old+"'></span>; ";

                        $.post("/api/agency/getagentslist.json",{},function (response){
                            for (var i = 0; i < response.length; i++){
                                if ($('.history_agent_span[agent_id="'+response[i].id+'"]').length !== 0)
                                    $('.history_agent_span[agent_id="'+response[i].id+'"]').text(response[i].name);
                            }
                            $('.history_agent_span[project_id="'+response.id+'"]').html(response.title);
                        });
                    break;
                    case "price":
                        response_string += "<span locale='price_label'></span>"+": "+utils.numberWithCommas(object[key].old)+"; ";                 
                    break;
                    case "price_from":
                        response_string += "<span locale='price_from_span'></span>"+": "+utils.numberWithCommas(object[key].old)+"; ";                 
                    break;
                    case "price_to":
                        response_string += "<span locale='price_to_span'></span>"+": "+utils.numberWithCommas(object[key].old)+"; ";                 
                    break;
                    case "contact1_type":
                        response_string += "<span locale='contact1_label'></span>"+": "+this.parseContactType(object[key].old)+"; ";                 
                    break;
                    case "contact2_type":
                        response_string += "<span locale='contact2_label'></span>"+": "+this.parseContactType(object[key].old)+"; ";                 
                    break;
                    case "contact3_type":
                        response_string += "<span locale='contact3_label'></span>"+": "+this.parseContactType(object[key].old)+"; ";                 
                    break;
                    case "contact4_type":
                        response_string += "<span locale='contact4_label'></span>"+": "+this.parseContactType(object[key].old)+"; ";                 
                    break;
                    case "last_sign":
                        response_string += "<span locale='last_sign_span'></span>"+": "+utils.convertTimestampForDatepicker(object[key].old[0])+"; ";                 
                    break;
                    case "last_proposed":
                        response_string += "<span locale='last_proposed_label'></span>"+": "+utils.convertTimestampForDatepicker(object[key].old[0])+" <span locale='agreement_option_label'></span> "+object[key].old[1]+"; ";                 
                    break;
                    case "remarks_text":
                        if (object[key].old == 1)
                            response_string += "<span locale='remarks_label'></span>"+": <span locale='edited'>edited</span>; ";                 
                    break;
                    case "details_text":
                        if (object[key].old == 1)
                            response_string += "<span locale='details_label'></span>"+": <span locale='edited'>edited</span>; ";                 
                    break;
                    case "free_from":
                        if (object[key].old != null && object[key].old != 0)
                            response_string += "<span locale='free_from_span'></span>"+": "+utils.convertTimestampForDatepicker(object[key].old)+"; ";
                        else response_string += "<span locale='free_from_span'></span>"+": <span locale='empty'>empty</span>; ";
                    break;
                    case "created":
                        response_string += "<span locale='created_span'></span>"+": "+utils.convertTimestampForDatepicker(object[key].old)+"; ";
                    break;
                    case "directions":
                        var new_obj = object[key].new;
                        var old_obj = object[key].old;
                        response_string += "<span locale='directions_label'></span>"+": ";

                        /*if (new_obj.length > 0)
                            for (var i = 0; i < new_obj.length; i++)
                                response_string += (!i ? "" : ", ")+property.form_options.direction[new_obj[i]];
                        else response_string += "empty";*/

                        //response_string += ", old: ";

                        if (old_obj != null)
                            for (var i = 0; i < old_obj.length; i++)
                                response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.direction[old_obj[i]]+"'></span>";
                        else response_string += "<span locale='empty'>empty</span>";

                        response_string += "; ";
                    break;
                    case "advopts":
                        var new_obj = object[key].new;
                        var old_obj = object[key].old;


                            response_string += "<span locale='advopts_span'></span>"+": ";

                            /*if (new_obj.length > 0)
                                for (var i = 0; i < new_obj.length; i++)
                                    response_string += (!i ? "" : ", ")+property.form_options.direction[new_obj[i]];
                            else response_string += "empty";*/

                            //response_string += ", old: ";
                            if (old_obj.length > 0){
                                if (old_obj != null){
                                    for (var i = 0; i < old_obj.length; i++){
                                        response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.advopts[old_obj[i]]+"'></span>";
                                    }
                                }
                                else{ 
                                    response_string += "<span locale='empty'>empty</span>";
                                }
                            }
                            else{
                                response_string += "<span locale='empty'>empty</span>";
                            }

                            response_string += "; ";
                    break;
                    case "statuses":
                        var new_obj = object[key].new;
                        var old_obj = object[key].old;
                        response_string += "<span locale='status_label'></span>"+": ";

                        for (var i = 0; i < old_obj.length; i++)
                            response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.status[old_obj[i]]+"'></span>";

                        response_string += "; ";
                    break;
                    case "views":
                        var new_obj = object[key].new;
                        var old_obj = object[key].old;
                        response_string += "<span locale='view_label'></span>"+": ";

                        if (old_obj != null)
                            for (var i = 0; i < old_obj.length; i++)
                                response_string += (!i ? "" : ", ")+"<span locale='"+this.form_options.view[old_obj[i]]+"'></span>";
                        else response_string += "<span locale='empty'>empty</span>";

                        response_string += "; ";
                    break;
                    case "floor_from":
                        response_string += "<span locale='floor_from_span'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "floor_to":
                        response_string += "<span locale='floor_to_span'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "floors_count":
                        response_string += "<span locale='floors_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "rooms_count":
                        response_string += "<span locale='rooms_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "bedrooms_count":
                        response_string += "<span locale='bedrooms_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "bathrooms_count":
                        response_string += "<span locale='bathrooms'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "house_number":
                        response_string += "<span locale='house_num_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "flat_number":
                        response_string += "<span locale='flat_num_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "age":
                        response_string += "<span locale='age_label'></span>"+": "+(object[key].old != 0 && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "name":
                        response_string += "<span locale='name_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "contact1":
                        response_string += "<span locale='contact1_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "contact2":
                        response_string += "<span locale='contact2_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "contact3":
                        response_string += "<span locale='contact3_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "contact4":
                        response_string += "<span locale='contact4_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "email":
                        response_string += "<span locale='email_option_label'></span>"+": "+(object[key].old != "" && object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "stock":
                        response_string += "<span locale='stock'></span>"+": "+this.parseFlag(object[key].old)+"; ";
                    break;
                    case "photo_upload":
                        if (object[key].old != null){
                            response_string += "<span locale='photo_uploaded'></span>: "+object[key].old+"; ";
                        }
                        else{
                            response_string += "<span locale='photo_uploaded'></span>; ";
                        }
                    break;
                    case "doc_upload":
                        if (object[key].old != null){
                            response_string += "<span locale='doc_uploaded'></span>: "+object[key].old+"; ";
                        }
                        else{
                            response_string += "<span locale='doc_uploaded'></span>; ";
                        }
                    break;
                    case "photo_delete":
                        if (object[key].old != null){
                            response_string += "<span locale='photo_deleted'></span>: "+object[key].old+"; ";
                        }
                        else{
                            response_string += "<span locale='photo_deleted'></span>; ";
                        }
                    break;
                    case "doc_delete":
                        if (object[key].old != null){
                            response_string += "<span locale='doc_deleted'></span>: "+object[key].old+"; ";
                        }
                        else{
                            response_string += "<span locale='doc_deleted'></span>; ";
                        }
                    break;
                    case "agreement":
                        response_string += "<span locale='agreement_option_label'></span>"+": "+(object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                    case "contour":
                        response_string += "<span locale='contour_option'></span>"+": "+(object[key].old != null ? '<span class="hist_contour_span" data-contour-id="'+object[key].old+'"></span>' : "<span locale='empty'>empty</span>")+"; ";
                        
                        $.post("/api/contour/list.json", {}, function (response){
                            for (var i = 0; i < response.length; i++){
                                $('.hist_contour_span[data-contour-id="'+response[i].id+'"]').text(response[i].title);
                            }
                        });
                    break;
                    case "search_mode":
                        response_string += "<span locale='search_by'></span>"+": "+this.parseSearchMode(object[key].old)+"; ";
                    break;
                    default:
                        response_string += key+": "+(object[key].old != null ? object[key].old : "<span locale='empty'>empty</span>")+"; ";
                    break;
                }
            }
            else{
                response_string = null;
            }
        }
        
        return response_string;
    };
    
    this.parseFlag = function(value){
        if (value == 1){
            return "<span locale='yes'>Yes</span>";
        }
        else if (value == 0){
            return "<span locale='no'>No</span>";
        }
        else{
            return "<span locale='empty'>empty</span>";
        }
    };
    
    this.parseRoomsType = function(value){
        if (value == 1){
            return "<span locale='rooms_label'>Rooms</span>";
        }
        else if (value == 2){
            return "<span locale='bedrooms_label'>Bedrooms</span>";
        }
        else{
            return "<span locale='empty'>empty</span>";
        }
    };
    
    this.parseObjectType = function(value){
        if (value == 1){
            return "<span locale='home_option'></span>";
        }
        else if (value == 2){
            return "<span locale='lot_option'></span>";
        }
        else{
            return "<span locale='empty'>empty</span>";
        }
    };
    
    this.parseSearchMode = function(value){
        if (value == 2){
            return "<span locale='streets_option'></span>";
        }
        else if (value == 1){
            return "<span locale='contour_noregister_span'></span>";
        }
        else{
            return "<span locale='empty'>empty</span>";
        }
    };
    
    this.parseContactType = function(value){
        if (value == 0)
            return "Phone";
        else if (value == 1)
            return "SMS";
        else if (value == 2)
            return "WhatsApp";
    };
    
    this.expand = function(object){
        $('#history_modal').modal('show');
        utils.htmlSpinner("history_modal h4");
        
        $.post("/api/property/gethistoryajax.json",{
            id: 1
        },function (){
            hist.fillFullTable(); 
        });
               
    };
    
    this.update = function(id, type){
        $.post("/api/"+(type == 1 ? "property" : "client")+"/gethistoryajax.json",{
                id: id
            },function (response){
                console.log(response);
                hist.data = response;
            });
    };
}