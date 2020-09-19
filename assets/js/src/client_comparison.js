function ClientComparison(){
    this.data = null; // данные текущего брокеринга
    this.adv_items = []; // дополнительные объекты, получаемые при .refresh()
    this.subject = null; // клиент или недвижимость, для которого будет производиться компарижн
    this.event = null; // событие компарижна
    this.checked_values = null; // выделенные объекты для удаления
    this.editing_row = null;
    this.last_date = null; // дата последнего компарижна
    this.refreshed = false; // переключается когда было сделано обновление компарижна без предложений
    
    this.init = function(){
        this.resetEvent();
        
        if (location.pathname === "/client"){
            this.subject = client;
        }
        else if (location.pathname === "/property"){
            this.subject = property;
        }
    };
    
    this.resetEvent = function(){
        this.event = {
            action_old: null,
            condition_old: null,
            remarks_old: null,
            action_new: null,
            condition_new: null,
            remarks_new: null,
            delete: null
        };
    };
    
    this.refresh = function(){ // добавляет к старому списку новую недвижимость если есть
        $('.comparison_loader').show();
        
        $.post("/api/property/getlistbyclient.json",{
            client_id: this.subject.data.id,
            mode: "new",
            from: $('#comparison_timestamp_offset').val()
        },function (response){
            var adv_items = response.data;
            clientcomp.adv_items = [];
            $('.comparison_limits').hide();
            $('.comparison_loader').hide();
            //$('#comparison_table td').parent().remove();
            $('#comparison_limits_count_span').text(adv_items.length);
            
            if (adv_items.length > 0){
                $('#mass_hide_comparison_button, #print_comparison_a, #comparison_delete_checked_button').attr("disabled", false);
                
                if (adv_items.length < response.total){
                    $('.comparison_limits').show().css("display", "inline");
                    $('#comparison_limits_total_span').text(response.total);
                }
                
                if ($('#comparison_timestamp_offset').val() != 0){
                    clientcomp.subject.properties = adv_items;
                    clientcomp.adv_items = [];
                }
                else{
                    for (var i = 0; i < adv_items.length; i++){
                        var exist = false;

                        for (var z = 0; z < clientcomp.subject.properties.length; z++){
                            if (adv_items[i].id == clientcomp.subject.properties[z].id){
                                exist = true;
                            }
                        }

                        if (!exist){
                            clientcomp.adv_items.push(adv_items[i]);
                        }
                    }
                }
                
                $('#comparison_table > tbody').html("");
                
                for (var i = 0; i < clientcomp.adv_items.length; i++){
                    $('#comparison_table').append(clientcomp.generateListRow(clientcomp.adv_items[i]));
                }
                
                $('#comparison_table>tbody>tr').css({backgroundColor:"#f1cf1f"});
                $('#comparison_table>tbody>tr').animate({backgroundColor: "rgba(0,0,0,0)"}, 6000);
                
                clientcomp.generateList();
                
                $('.comparison_date_td').each(function(){
                    if ($(this).text() == 0){
                        $(this).text(utils.convertTimestampForDatepicker(utils.getNow()));
                    }
                });
                
                //$('#property_results_area').show();
                //clientcomp.generateList();
                
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
            }
        });
    };
    
    this.generateList = function(){
        $('#comparison_finded_span').text(this.subject.properties.length);
        
        for (var i = 0; i < this.subject.properties.length; i++){
            $('#comparison_table').append(this.generateListRow(this.subject.properties[i]));
            
            //<a href='property?id="+this.subject.properties[i].id+"' target='_blank' type='button' locale='open_button' class='btn btn-primary comparison_delete_button'>Open</a>\n\
            $('#no_clients_warning').hide();            
        }
        
        $('#comparison_table').tableHeadFixer();
        $('#comparison_table').tablesorter();
        
        this.getHided();
        this.apply();
        localization.toLocale();
        app.customCheckbox();
        $('.comparison_check_all').parent().attr({
            title: localization.getVariable("mark_all_button"),
            locale_title: "mark_all_button"
        });
        
        $('.comparison_check_all')
                .on('ifChecked', function(event){
                    $('.comparison_check:visible').iCheck('check');
                })
                .on("ifUnchecked", function(event){
                    $('.comparison_check:visible').iCheck('uncheck');
                });
        
        $('.comparison_check')
                .on("ifChecked", function(event){
                    var hl_class = $(event.target).attr("hide_only") == "true" ? "hl_orange" : "hl_yellow";
                    $('#comparison_table #row_'+$(event.target).val()).children("td").addClass(hl_class);
                    $('#comparison_marked_span').text($('.comparison_check:checked').length);
                    $('.comparison_color_hint').show();
                })
                .on("ifUnchecked", function(event){
                    var hl_class = $(event.target).attr("hide_only") == "true" ? "hl_orange" : "hl_yellow";
                    $('#comparison_table #row_'+$(event.target).val()).children("td").removeClass(hl_class);
                    $('#comparison_marked_span').text($('.comparison_check:checked').length);
                    
                    if ($('.comparison_check:checked').length == 0 && $('.hl_green').parent("tr").length === 0){
                        $('.comparison_color_hint').hide();
                    }
                });
    };
    
    this.generateListRow = function(item){
        if (!utils.isJSON(item)){
            return;
        }
        
        //var phones = item.foreign_stock == 1 ? "<i class='fa fa-caret-right'></i>&#160;" : "<i class='fa fa-caret-left'></i>&#160;";
        var data = {};
        var data_for_print = "";

        data.street = "<span class='geoloc_span' placeid='"+item.street+"'></span>&nbsp;<span class='house_number'>"+item.house_number+"</span>";
        placeDetailsByPlaceIdNoAutocomplete(item.street, service_route);
        
        var types = JSON.parse(item.types);
        data.types = "";

        for (var z = 0; z < types.length; z++){
            data.types += "<span locale='"+this.subject.form_options.property_type[types[z]]+"'></span>"+(z === types.length-1 ? "" : "/");
            data_for_print += this.subject.form_options.property_type[types[z]]+(z === types.length-1 ? "" : "/");
        }

        data.price = "";
        data.price += '<span class="price">'+utils.numberWithCommas(item.price)+' '+this.subject.form_options.currency[item.currency_id]["symbol"]+'</span>';
        data_for_print += ", "+item.price+' '+this.subject.form_options.currency[item.currency_id]["symbol"]+", ";

        data.agent = ',&nbsp;<span locale="agent_noregister_span">agent</span>: <span '+(item.stock == 0 || item.foreign_stock == 0 ? 'agent="'+item.agent_id+'"' : "locale='stock'")+' class="card_agent"></span>';

        this.subject.properties_parsed.push({id: item.id, data: data_for_print});

        var action_select_options = "";
        var condition_select_options = "";

        for (var z = 0; z < this.subject.form_options["comparison_action"].length; z++){
            action_select_options += "<option value='"+z+"'>"+localization.getVariable(this.subject.form_options["comparison_action"][z])+"</option>";
        }

        for (var z = 0; z < this.subject.form_options["comparison_condition"].length; z++){
            condition_select_options += "<option value='"+z+"'>"+localization.getVariable(this.subject.form_options["comparison_condition"][z])+"</option>";
        }

        $('#comparison_table').show()
                .append("<tr property='"+item.id+"' ondblclick='clientcomp.openCard("+item.id+")' id='row_"+item.id+"'>\n\
                            <td class='comparison_check_td'><input class='icheck comparison_check' type='checkbox' value='"+item.id+"' name='' /></td>\n\
                            <td class='comparison_types_td'>"+data.types+"</td>\n\
                            <td class='comparison_id_td'>"+item.id+"</td>\n\
                            <td class='comparison_price_td'>"+data.price+"</td>\n\
                            <td class='comparison_street_td'>"+data.street+"</td>\n\
                            <td style='text-align:center;' class='comparison_history_open_td'><button onclick='clientcomp.openHistory("+item.id+")' style='display:none;' title='xsl_locale_open_item_history__' locale_title='open_item_history' type='button' class='btn btn-primary btn_narrow comparison_history_button'><i class='fa fa-folder-open'></i></button></td>\n\
                            <td class='comparison_action_td'><select onchange='clientcomp.addChange(\"action\", this)' disabled>"+action_select_options+"</select></td>\n\
                            <td class='comparison_condition_td'><select onchange='clientcomp.addChange(\"condition\", this)' disabled>"+condition_select_options+"</select></td>\n\
                            <td class='comparison_date_td'>0</td>\n\
                            <td class='comparison_agent_td'></td>\n\
                            <td class='comparison_remarks_td'></td>\n\
                            <td class='comparison_buttons_td'>\n\
                                <button onclick='clientcomp.editRow("+item.id+")' title='xsl_locale_comparison_item_edit__' locale_title='comparison_item_edit' type='button' class='btn btn-primary btn_narrow comparison_edit_button'><i class='fa fa-pencil'></i></button>\n\
                                <button onclick='clientcomp.removeRow("+item.id+")' title='' locale_title='' style='display:none;' type='button' class='btn btn-danger comparison_delete_button'><i class='fa fa-times'></i></button>\n\
                                <button onclick='clientcomp.undoRow()' style='display:none;' type='button' title='xsl_locale_comparison_item_undo__' locale_title='comparison_item_undo' class='btn btn-default btn_narrow comparison_undo_button'><i class='fa fa-undo'></i></button>\n\
                                <button onclick='clientcomp.restoreRow("+item.id+")' title='' locale_title='' style='display:none;' type='button' class='btn btn-default comparison_restore_button'><i class='fa fa-refresh'></i></button>\n\
                            </td>\n\
                        <tr>");
    };
    
    this.openCard = function(id){
        if (this.editing_row === null){
            location.href="property?id="+id+"&client="+this.subject.data.id;
        }
        else{
            utils.warningModal(localization.getVariable("comparison_save_alert"));
        }
    };
    
    this.editRow = function(id){
        if (this.editing_row !== null){
            utils.warningModal(localization.getVariable("comparison_save_alert"));
            
            return false;
        }
        
        this.editing_row = id;
        var remarks_text = $('#comparison_table #row_'+id+' .comparison_remarks_td').text();
        $('#comparison_table #row_'+id).addClass("comparison_editing_tr");
        this.resetEvent();
        this.event.action_old = $('.comparison_editing_tr > .comparison_action_td > select').val();
        this.event.condition_old = $('.comparison_editing_tr > .comparison_condition_td > select').val();
        this.event.remarks_old = remarks_text;
        this.requireSaveRow();
        
        $('.comparison_editing_tr select').attr("disabled", false);
        $('.comparison_editing_tr .comparison_remarks_td').html("<input placeholder='"+localization.getVariable("remark")+"' onkeyup='clientcomp.addChange(\"remarks\", this)' value='"+remarks_text+"'/>");
        $('.comparison_editing_tr .comparison_edit_button').attr({
            onclick: "clientcomp.saveRow()",
            title: localization.getVariable("comparison_item_save")
        });
        $('.comparison_editing_tr .comparison_undo_button').show();
        //$('.comparison_editing_tr .comparison_delete_button').hide();
        $('.comparison_editing_tr .comparison_edit_button > i').removeClass("fa-pencil").addClass("fa-floppy-o");
        //$('.comparison_editing_tr').removeClass("hl").removeClass("hl_green").addClass("hl_yellow");
        $('.comparison_editing_tr').css("box-shadow", "rgb(186, 186, 186) 1px 1px 12px 3px");
        
        if (this.event.action_old == 0){
            $('.comparison_editing_tr > .comparison_condition_td > select').attr("disabled", true);
            $('.comparison_editing_tr > .comparison_remarks_td > input').attr("disabled", true);
            $('.comparison_editing_tr > .comparison_action_td > select').change(function(){
                if ($(this).val() != 0){
                    $('.comparison_editing_tr > .comparison_condition_td > select').attr("disabled", false);
                    $('.comparison_editing_tr > .comparison_remarks_td > input').attr("disabled", false);
                }
                else{
                    $('.comparison_editing_tr > .comparison_condition_td > select').attr("disabled", true);
                    $('.comparison_editing_tr > .comparison_remarks_td > input').attr("disabled", true);
                }
            });
        }
    };
    
    this.saveRow = function(){
        if (
            this.event.action_new == null && 
            this.event.action_old == 0 && 
            this.event.condition_new == null && 
            this.event.condition_old == 0 && 
            this.event.delete == null && 
            this.event.remarks_new == null && 
            this.event.remarks_old == ""
        ){
            this.undoRow();
            return;
        }
        
        if (this.event.action_new != null){
            var subj = this.subject === client ? "client" : "property";
            
            switch (this.event.action_new){
                case "1":
                    owl.startSession(subj, "appointment", null);
                break;
                case "2":
                    owl.startSession(subj, "property-inspection", null);
                break;
                case "3":
                    owl.startSession(subj, "sms-out", null);
                break;
                case "4":
                    owl.startSession(subj, "email-out", null);
                break;
                case "5":
                    owl.startSession(subj, "call-out", null);
                break;
            }
            
            
        }
        
        $.post("/api/clientcomp/addevent.json",{
            client: this.subject.data.id,
            property: $('.comparison_editing_tr').attr("property"),
            event: JSON.stringify(this.event)
        },function (response){
            if (response.error != undefined){
                showErrorMessage(response.error.description);
            }
            else{
                var remarks_text = $('.comparison_editing_tr .comparison_remarks_td > input').val()
                clientcomp.unrequireSaveRow();
                
                $('.comparison_editing_tr select').attr("disabled", true);
                $('.comparison_editing_tr .comparison_remarks_td').html(remarks_text);
                //$('.comparison_editing_tr .comparison_delete_button').show();
                
                if ($('.comparison_editing_tr .comparison_condition_td > select').val() != 0){
                    $('.comparison_editing_tr .comparison_condition_td > select').children(':first-child').attr("disabled", "true");
                    //$('.comparison_editing_tr .comparison_delete_button').hide();
                }
                
                if ($('.comparison_editing_tr .comparison_action_td > select').val() != 0){
                    $('.comparison_editing_tr .comparison_action_td > select').children(':first-child').attr("disabled", "true");
                    //$('.comparison_editing_tr .comparison_delete_button').hide();
                }
                
                $('.comparison_editing_tr .comparison_edit_button').attr({
                    onclick: "clientcomp.editRow("+response+")",
                    title: localization.getVariable("comparison_item_edit")
                });
                $('.comparison_editing_tr .comparison_edit_button > i').removeClass("fa-floppy-o").addClass("fa-pencil");
                $('.comparison_editing_tr .comparison_undo_button').hide();
                
                $('.comparison_editing_tr').css("box-shadow", "none");
                $('.comparison_editing_tr').children("td").addClass("hl_green");
                $('.comparison_editing_tr').removeClass("comparison_editing_tr");
                
                $('.comparison_color_hint').show();
                clientcomp.resetEvent();
                showSuccess(localization.getVariable("brokering_event_saved"));
            }
        });
    };
    
    this.undoRow = function(){
        this.unrequireSaveRow();
        $('.comparison_editing_tr select').attr("disabled", true);
        $('.comparison_editing_tr .comparison_remarks_td').html(this.event.remarks_old);
        $('.comparison_editing_tr .comparison_action_td > select').val(this.event.action_old);
        $('.comparison_editing_tr .comparison_condition_td > select').val(this.event.condition_old);
        $('.comparison_editing_tr .comparison_edit_button').attr("onclick", "clientcomp.editRow("+$('.comparison_editing_tr').attr("property")+")");
        $('.comparison_editing_tr .comparison_edit_button > i').removeClass("fa-floppy-o").addClass("fa-pencil");
        $('.comparison_editing_tr .comparison_undo_button').hide();
        
        if (this.event.condition_old == 0){
            //$('.comparison_editing_tr .comparison_delete_button').show();
        }
        
        $('.comparison_editing_tr').css("box-shadow", "none");
        $('.comparison_editing_tr').removeClass("comparison_editing_tr");
    };
    
    /*this.openRemoveRowDialog = function(id){
        var top = $('#comparison_table #row_'+id).offset().top;
        var height = $('#comparison_table #row_'+id).height();
        var width = $('#comparison_table #row_'+id).width();
        var left = $('#comparison_table #row_'+id).offset().left;
        
        var dialog = $("<div />", {class: "comparison_remove_dialog"}).css({top: top+1+"px", left: left+"px", height: height-1+"px", width: width+1+"px"});
        var buttons_block = "<div class='comparison_remove_buttons_block'>\n\
                                <span>"+localization.getVariable("really_delete")+"</span>\n\
                                <button onclick='clientcomp.removeRow()' type='button' class='btn btn-primary comparison_delete_button'>"+localization.getVariable("yes")+"</button>\n\
                                <button onclick='clientcomp.removeRow()' type='button' class='btn btn-default comparison_delete_button'>"+localization.getVariable("no")+"</button>\n\
                            </div>";
        dialog.append(buttons_block);
        $(document.body).append(dialog);
        $('#comparison_table').parent().scroll(function(){
            $('.comparison_remove_dialog').remove();
        });
    };*/
    
    this.removeRow = function(id){
        this.resetEvent();
        this.event.delete = "delete";
        
        $.post("/api/clientcomp/addevent.json",{
            client: this.subject.data.id,
            property: id,
            event: JSON.stringify(this.event)
        },function (response){
            if (response.error != undefined){
                showErrorMessage(response.error.description);
            }
            else{
                var id = response;
                
                $('#comparison_table #row_'+id).children().animate({opacity: .2}, 500, function(){
                //$('#comparison_table #row_'+id+' .comparison_delete_button').hide();
                $('#comparison_table #row_'+id+' .comparison_restore_button')
                        .show()
                        .css("opacity", 1)
                        .parent().css("opacity", 1);
                $('#comparison_table #row_'+id+' .comparison_edit_button').attr("disabled", true).css("opacity", .2);
            });
            }
        });
        
        //this
        
        /*var temp_array = [];
        
        for (var i = 0; i < this.properties.length; i++)
            if (i !== array_key)
                temp_array.push(this.properties[i]);
        
        this.properties = temp_array;
        this.properties_parsed = [];
        
        $('#comparison_table td').parent().remove();
            
        if (this.properties.length > 0){
            $('#property_results_area').show();
            this.generateList();

            $.post("/api/clientdoc/preparecomparisonforprint.json",{
                items: JSON.stringify(this.subject.properties_parsed),
                client: this.subject.data.id
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
            $('#no_clients_warning').show();
            $('#comparison_table').hide();
        }*/
    };
    
    this.openMassDeleteDialog = function(){
        if (this.editing_row !== null){
            utils.warningModal(localization.getVariable("comparison_save_alert"));
            
            return;
        }
        
        if ($('.comparison_check:checked').length === 0){
            utils.warningModal(localization.getVariable("no_selected_caption"));
        }
        else{
            $('#comparison_delete_confirm_modal').modal("show");
        }
    };
    
    this.deleteChecked = function(){
        this.checked_values = $('.comparison_check:checked').map(function(){
            if ($('#comparison_table #row_'+this.value+' > .comparison_condition_td > select').val() == 0){
                return this.value;
            }
        }).get();
        
        try{
            if ($('.comparison_check:checked').length === 0){
                throw localization.getVariable("no_selected_caption");
            }
            
            /*$('#comparison_delete_confirm_modal').modal("hide");
            utils.successModal(localization.getVariable("comparison_success_delete"));

            for (var i = 0; i < clientcomp.checked_values.length; i++){
                $('#comparison_table #row_'+clientcomp.checked_values[i]).remove();
            }
            
            $('#comparison_finded_span').text($('.comparison_check').length);
            $('#comparison_marked_span').text($('.comparison_check:checked').length);*/

            //clientcomp.checked_values = null;
            
            $.post("/api/clientcomp/massdelete.json",{
                client: this.subject.data.id,
                properties: JSON.stringify(this.checked_values)
            },function (response){
                if (response.error != undefined){
                    showErrorMessage(response.error.description);
                }
                else{
                    $('#comparison_delete_confirm_modal').modal("hide");
                    utils.successModal(localization.getVariable("comparison_success_delete"));
                    
                    for (var i = 0; i < clientcomp.checked_values.length; i++){
                        $('#comparison_table #row_'+clientcomp.checked_values[i]).remove();
                    }
                    
                    $('#comparison_finded_span').text($('.comparison_check').length);
                    $('#comparison_marked_span').text($('.comparison_check:checked').length);
                    
                    if ($('.comparison_check').length < 200){
                        $('.comparison_limits').hide();
                    }
                    
                    clientcomp.checked_values = null;
                }
            });
        }
        catch(error){
            utils.warningModal(error);
        }
    };
    
    this.massHide = function(){
        this.checked_values = $('.comparison_check:checked').map(function(){
            return this.value;
        }).get();
        
        try{
            if ($('.comparison_check:checked').length === 0){
                throw localization.getVariable("no_selected_caption");
            }
            
            $('#mass_hide_comparison_button')
                .attr({
                    onclick: "clientcomp.massUnhide()",
                    title: localization.getVariable("show_hidden"),
                    locale_title: "show_hidden"
                })
                .children("i").removeClass("fa-eye").addClass("fa-eye-slash");
            
            //$('#comparison_delete_confirm_modal').modal("hide");
            //utils.successModal(localization.getVariable("comparison_success_delete"));

            for (var i = 0; i < this.checked_values.length; i++){
                $('#comparison_table #row_'+this.checked_values[i])
                        .addClass("comparison_hidden_row")
                        .animate({opacity: .2}, 900)
                        .children().animate({opacity: .2}, 900, function(){
                            $(this).parent().hide();
                        });
            }
            
            $('#comparison_finded_span').text($('.comparison_check').length);
            $('#comparison_marked_span').text(0);
            $('#comparison_hidden_span').text($('.comparison_hidden_row').length);
            
            $.post("/api/clientcomp/masshide.json",{
                client: this.subject.data.id,
                properties: JSON.stringify(this.checked_values)
            }, null);
        }
        catch(error){
            utils.warningModal(error);
        }
    };
    
    this.massUnhide = function(){
        $('#mass_hide_comparison_button')
            .attr({
                onclick: "clientcomp.massHide()",
                title: localization.getVariable("hide_button"),
                locale_title: "hide_button"
            })
            .children("i").removeClass("fa-eye-slash").addClass("fa-eye");
    
        $('.comparison_hidden_row').each(function(){
            $(this)
                .show()
                .removeClass("comparison_hidden_row")
                .css({opacity: 1})
                .children().css({opacity: 1});
        });

        $('#comparison_finded_span').text($('.comparison_check').length);
        $('#comparison_marked_span').text($('.comparison_check:checked').length);
        $('#comparison_hidden_span').text(0);
        
        $.post("/api/clientcomp/massunhide.json",{
            client: this.subject.data.id
        }, null);
    };
    
    this.restoreRow = function(id){
        this.resetEvent();
        this.event.delete = "restore";
        
        $.post("/api/clientcomp/addevent.json",{
            client: this.subject.data.id,
            property: id,
            event: JSON.stringify(this.event)
        },function (response){
            if (response.error != undefined){
                showErrorMessage(response.error.description);
            }
            else{
                var id = response;
                
                $('#comparison_table #row_'+id).children().css({opacity: 1});
                //$('#comparison_table #row_'+id+' .comparison_delete_button').show();
                $('#comparison_table #row_'+id+' .comparison_restore_button').hide();
                $('#comparison_table #row_'+id+' .comparison_edit_button').attr("disabled", false).css("opacity", 1);
            }
        });
    };
    
    this.requireSaveRow = function(){
        $('div.modal-backdrop, #comparison_modal button.close')
            .unbind("click")
            .attr("onclick", "")
            .click(function(){
                if (clientcomp.editing_row !== null){
                    utils.warningModal(localization.getVariable("comparison_save_alert"));
                }
                else{
                    $('#comparison_modal').modal("hide");
                }
            });
        
        /*$(document).unbind("keyup").keyup(function(e){  // не работает, в любом случае закрывает модал
            var code = e.which; // recommended to use e.which, it's normalized across browsers
            if (code === 27){
                if (clientcomp.editing_row !== null){
                    utils.warningModal(localization.getVariable("comparison_save_alert"));
                }
                else{
                    $('#comparison_modal').modal("hide");
                }
            }
        });*/
    };
    
    this.unrequireSaveRow = function(){
        this.editing_row = null;
        
        $('div.modal-backdrop, #comparison_modal button.close')
            .unbind("click")
            .attr("onclick", "")
            .click(function(){
                $('#comparison_modal').modal("hide");
            });
        
        /*$(document).unbind("keyup").keyup(function(e){ 
            var code = e.which; // recommended to use e.which, it's normalized across browsers
            if (code === 27){
                $('#comparison_modal').modal("hide");
            }
        });*/
    };
    
    
    this.addChange = function(change_type, element){
        switch (change_type){
            case "action":
                this.event.action_new = $(element).val();
            break;
            case "condition":
                this.event.condition_new = $(element).val();
                
                /*if ($(element).val() != 0){
                    $(element).children(':first-child').attr("disabled", "true");
                }*/
            break;
            case "remarks":
                this.event.remarks_new = $(element).val();
            break;
            case "delete":
                //this.event.action_new = $(element).val();
            break;
        }
    };
    
    this.apply = function(){
         $.post("/api/clientcomp/apply.json",{
            client: this.subject.data.id
        },function (response){
            clientcomp.data = response;
            
            for (var i = 0; i < response.length; i++){
                for (var z = 0; z < clientcomp.subject.properties.length; z++){
                    if (clientcomp.subject.properties[z].id == response[i].property){
                        var property = $('#comparison_table #row_'+response[i].property);
                        
                        switch (response[i].event){
                            case "action_change":
                                property.children('.comparison_action_td')
                                        .children('select')
                                        .val(response[i].current_state)
                                        .children(':first-child').attr("disabled", "true");
                                property.children('.comparison_date_td').text(utils.convertTimestampForDatepicker(response[i].timestamp));
                                property.children('.comparison_agent_td').attr("agent_id", response[i].author);
                            break;
                            case "condition_change":
                                property.children('.comparison_condition_td')
                                        .children('select')
                                        .val(response[i].current_state)
                                        .children(':first-child').attr("disabled", "true");
                                property.children('.comparison_date_td').text(utils.convertTimestampForDatepicker(response[i].timestamp));
                                property.children('.comparison_agent_td').attr("agent_id", response[i].author);
                                
                                if (response[i].current_state != 0){
                                    property.children().children('.comparison_history_button').show();
                                    property.children('.comparison_check_td').children().children('input').attr("hide_only", "true");
                                    //property.children('.comparison_check_td').children().hide();
                                    //property.children('.comparison_buttons_td').children('.comparison_delete_button').hide();
                                }
                            break;
                            case "remarks_change":
                                property.children('.comparison_remarks_td').text(response[i].current_state);
                                property.children('.comparison_date_td').text(utils.convertTimestampForDatepicker(response[i].timestamp));
                                property.children('.comparison_agent_td').attr("agent_id", response[i].author);
                            break;
                            case "delete":
                                property.remove();
                                $('#comparison_finded_span').text($('.comparison_check').length);
                            break;
                            case "restore":
                                property.show();
                                property.children('.comparison_date_td').text(utils.convertTimestampForDatepicker(response[i].timestamp));
                                property.children('.comparison_agent_td').attr("agent_id", response[i].author);
                            break;
                        }
                    }
                }
            }
            
            clientcomp.setAgents();
        });
    };
    
    this.setAgents = function(){
        if (this.subject.agent_list !== null){
            $('.comparison_agent_td').each(function(){
                if ($(this).attr("agent_id") != undefined){
                    for (var i = 0; i < clientcomp.subject.agent_list.length; i++){
                        if (clientcomp.subject.agent_list[i].id == $(this).attr("agent_id")){
                            $(this).text(clientcomp.subject.agent_list[i].name);
                        }
                    }
                }
            });
        }
        else{
            $.post("/api/agency/getagentslist.json",{
            },function (response){
                client.agent_list = response;
                clientcomp.setAgents();
            });
        }
    };
    
    this.save = function(){
        /* if (!utils.isEmpty("agreement_number_input")){ // старый код, полноценный
            $.post("/api/client/checkagreement.json",{
                agreement: $('#agreement_number_input').val().trim()
            },function (response){
                if (response > 0)
                    $("#agreement_error_span").text("Agreement already exist!");
                else{
                    $("#agreement_error_span").text("");
                    this.subject.propose();                
                    $('#save_comparison_button').attr("disabled", true);
                    $('#agreement_number_input').attr("disabled", true);
                    $('.comparison_delete_button').attr("disabled", true);
                }
            });
        } */
        
        this.subject.propose(); // урезанный
        $('#save_comparison_button').attr("disabled", true);
        $('#agreement_number_input').attr("disabled", true);
        //$('.comparison_delete_button').attr("disabled", true);
    };
    
    /*this.print = function(){
        $.post("/api/clientdoc/preparecomparisonforprint.json",{
            items: JSON.stringify(this.subject.properties_parsed),
            client: this.subject.data.id
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
        });
    };*/
    
    this.closeModal = function(){
        $('#main-wrapper').show();
        $('#comparison_modal').modal("hide");
    };
    
    this.openHistory = function(id){
        $('#comparison_history_table > tbody').html("");
        var rows = {};
        
        for (var i = this.data.length-1; i >= 0; i--){
            if (
                    this.data[i].property == id &&
                    this.data[i].event != "hide" &&
                    this.data[i].event != "delete"
                ){
                if (rows["t"+this.data[i].timestamp] == undefined){
                    rows["t"+this.data[i].timestamp] = [];
                }
                
                rows["t"+this.data[i].timestamp].push(this.data[i]);
            }
        }
        
        for (var key in rows){
            var row = rows[key];
            var event_value = "";
            var author = "";
            var timestamp = "";
            
            for (var z = 0; z < row.length; z++){
                //var event_localized = null;
                author = row[z].author;
                timestamp = row[z].timestamp;
                
                switch (row[z].event){
                    case "action_change":
                        //event_localized = localization.getVariable("action_changed");
                        event_value += localization.getVariable(this.subject.form_options["comparison_action"][row[z].current_state])+"; ";
                    break;
                    case "condition_change":
                        //event_localized = localization.getVariable("condition_changed");
                        event_value += localization.getVariable(this.subject.form_options["comparison_condition"][row[z].current_state])+"; ";
                    break;
                    case "remarks_change":
                        //event_localized = localization.getVariable("remarks_changed");
                        event_value += row[z].current_state+"; ";
                    break;
                    /*case "delete":
                        event_localized = localization.getVariable("item_deleted");
                    break;
                    case "restore":
                        event_localized = localization.getVariable("item_restored");
                    break;*/
                }
            }
            
            $('#comparison_history_table').append(
                '<tr>\n\
                    <td>'+utils.convertTimestampForDatepicker(timestamp)+'</td>\n\
                    <td class="comparison_agent_td" agent_id="'+author+'"></td>\n\
                    <td>'+event_value+'</td>\n\
                </tr>'
            );
        }
        
        this.setAgents();
        $('#comparison_history_modal').modal("show");
    };
    
    this.propose = function(){
        $.post("/api/clientcomp/propose.json",{
            client: this.subject.data.id
        }, null);
    };
    
    this.preparePrint = function(){
        if ($('.comparison_check').length > 25){
            $('#comparison_print_warning_modal').modal("show");
        }
        else{
            this.print();
        }
    };
    
    this.print = function(){
        $('#comparison_print_warning_modal').modal("hide");
        
        if (window.matchMedia){
            var mediaQueryList = window.matchMedia('print');
            
            mediaQueryList.addListener(function(mql) {
                if (mql.matches){
                    //beforePrint();
                } 
                else{
                    clientcomp.onAfterPrint();
                }
            });
        }
        
        $('#printing_header_section, #printing_card_header_wrapper').css("border", "none");
        $('#comparison_modal .modal-header, #comparison_modal .modal-body').css("border", "none");
        $('#main-wrapper, #printing_card_header_div').hide();
        $('#comparison_modal .modal-dialog').removeClass("modal-dialog-90w").css("width", "100%");
        $('#comparison_modal .modal-body').css("overflow", "visible");
        $('#comparison_table td').css("padding", "4px");
        $('#comparison_table').css("border-top", "none");
        $('#comparison_printing_header').show();
        window.print();
    };
    
    this.onAfterPrint = function(){
        if ($('#comparison_modal:visible').length > 0){
            $('#printing_header_section, #printing_card_header_wrapper').css("border-bottom", "2px solid rgb(0, 0, 0)");
            $('#comparison_modal .modal-header').css("border-bottom", "1px solid rgb(229, 229, 229)");
            $('#comparison_modal .modal-body').css("border-top", "1px solid rgb(229, 229, 229)");
            $('#main-wrapper, #printing_card_header_div').show();
            $('#comparison_modal .modal-dialog').addClass("modal-dialog-90w").css("width", "90%");
            $('#comparison_modal .modal-body').css("overflow", "auto");
            $('#comparison_table td').css("padding", "4px 1px");
            $('#comparison_table').css("border-top", "1px solid rgb(221, 221, 221)");
            $('#comparison_printing_header').hide();
        }
    };
    
    this.getHided = function(){
        $.post("/api/clientcomp/gethided.json",{
            client: this.subject.data.id
        },function (response){
            if (response.length > 0){
                $('#mass_hide_comparison_button')
                    .attr({
                        onclick: "clientcomp.massUnhide()",
                        title: localization.getVariable("show_hidden"),
                        locale_title: "show_hidden"
                    })
                    .children("i").removeClass("fa-eye").addClass("fa-eye-slash");

                for (var i = 0; i < response.length; i++){
                    $('#comparison_table #row_'+response[i].property)
                        .addClass("comparison_hidden_row")
                        .hide();
                }

                $('#comparison_finded_span').text($('.comparison_check').length);
                $('#comparison_marked_span').text(0);
                $('#comparison_hidden_span').text($('.comparison_hidden_row').length);
            }
        });
    };
    
    // ################################# часть для Comparison Event #####################################//
    
    this.showEventsModal = function(){
        if (urlparser.getParameter("client") != undefined){
            return;
        }
        
        $('#comparison_events_modal').modal("show");
        
        // здесь можно будет для разных субъектов параметры запроса формировать заранее
        
        $.post("/api/clientcomp/geteventsforproperty.json",{
            property: this.subject.data.id
        },function (response){
            $('#comparison_events_modal #header_count_span').text(response.length);
            $('#comparison_events_table tbody').html("");
            
            for (var i = 0; i < response.length; i++){
                $('#comparison_events_table').append(clientcomp.generateEventsListRow(response[i]));
                $('#comparison_events_modal #no_clients_warning').hide();            
            }

            $('#comparison_events_table').tableHeadFixer();
            localization.toLocale();
        });
    };
    
    this.generateEventsListRow = function(item){
        if (item.id == null || item == null){
            return;
        }
        //var phones = item.foreign_stock == 1 ? "<i class='fa fa-caret-right'></i>&#160;" : "<i class='fa fa-caret-left'></i>&#160;";
        var data = {};
        data.price = "";
        data.price += utils.numberWithCommas(item.price_from)+" - "+utils.numberWithCommas(item.price_from)+" "+this.subject.form_options.currency[item.currency_id]["symbol"];
        data.agent = '<span agent="'+item.agent_id+'" class="comparison_events_agent"></span>';
        var condition = localization.getVariable(this.subject.form_options["comparison_condition"][item.current_state]);

        $('#comparison_events_table').show()
                .append("<tr property='"+item.id+"' ondblclick='location.href=\"client?id="+item.id+"&property_events="+property.data.id+"\"' id='row_"+item.id+"'>\n\
                            <td class='comparison_types_td'>"+item.name+"</td>\n\
                            <td class='comparison_id_td'>"+item.id+"</td>\n\
                            <td class='comparison_price_td'>"+data.price+"</td>\n\
                            <td class='comparison_condition_td'>"+condition+"</td>\n\
                            <td class='comparison_date_td'>"+utils.convertTimestampForDatepicker(item.timestamp)+"</td>\n\
                            <td class='comparison_agent_td'>"+data.agent+"</td>\n\
                        <tr>");
        
        $.post("/api/agency/getagentslist.json", null, function (result){
            for (var i = 0; i < result.length; i++){
                if ($('.comparison_events_agent[agent='+result[i].id+']').length !== 0){
                    $('.comparison_events_agent[agent='+result[i].id+']').text(result[i].name);
                }
            }
        });
    };
    
    this.init();
}