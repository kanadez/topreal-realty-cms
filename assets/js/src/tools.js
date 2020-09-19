function Tools(){
    this.data = {};
    this.try_now_enter_email = null; // почтовый адрес для входа в try now
    
    this.init = function(){
        $('#import_csv_select_input').fileupload({
            formData:{
                action: "property"
            },
            add: function(a,b){
                $('#import_spinner_i').show();
                b.submit();
            },
            done: function (e, data) {
                var obj = JSON.parse(data.result);
                
                if (obj.error != undefined){
                    $('#import_csv_success_alert').hide();
                    $('#import_csv_warning_alert').hide();
                    $('#import_csv_error_alert').show();
                }
                else{
                    $('#import_csv_error_alert').hide();
                    $('#import_csv_success_alert').show();
                    $('#import_csv_result_caption').html("");
                    
                    for (var i = 0; i < obj.length; i++)
                        if (Number(obj[i].errors) != 0){
                            $('#import_csv_success_alert').hide();
                            $('#import_csv_error_alert').hide();
                            $('#import_csv_warning_alert').show();
                            
                            if (obj[i].property != undefined){
                                $('#import_csv_result_caption').append('<a target="_blank" href="property?id='+obj[i].property+'">'+obj[i].property+'</a>'+(i === obj.length-1 ? "" : ", "));
                            }
                            else{
                                $('#import_csv_result_caption').append('<a target="_blank" href="client?id='+obj[i].client+'">'+obj[i].client+'</a>'+(i === obj.length-1 ? "" : ", "));
                            }
                        }
                    
                    //$('#import_csv_caption').html("");
                }
                
                $('#import_spinner_i').hide();
           }
        });
        
        if (utils.getNavigator("chrome")){
            this.checkChromeExtensionExist();
        }
    };
    
    this.officeInfo = function(){
        utils.htmlSpinner("office_info_modal h4");
        $('#office_info_modal').modal("show");
        $.post("/api/tools/getofficeinfo.json", {}, function (response){
            tools.data.office_info = response;
            //console.log(response);
            $('#number_td').html(response.id);
            $('#agency_name_span').html(response.title);
            $('#agency_name_input').val(response.title);
            $('#country_td').attr("placeid", response.country);
            placeDetailsByPlaceIdNoAutocomplete(response.country, service_country);
            $('#main_agent_email_span').html(response.main_agent_email);
            $('#main_agent_email_input').val(response.main_agent_email);
            $('#main_agent_fullname_span').html(response.main_agent_name);
            $('#main_agent_fullname_input').val(response.main_agent_name);
            $('#agency_address_span').html(response.address);
            $('#agency_address_input').val(response.address);
            //placeDetailsByPlaceIdNoAutocomplete(response.address, service_route);
            $('#agency_address_input').val(response.address);
            $('#agency_phone_span').html(response.phone);
            $('#agency_phone_input').val(response.phone);
            $('#agency_email_span').html(response.email);
            $('#agency_email_input').val(response.email);
            $('#days_left_td').html(utils.convertTimestampForDatepicker(response.days_left));
            
            var subsc_from_moment = moment(utils.getDateOnlyFromTimestampForMoment(response.payments_days_left.from)); 
            var subsc_from_moment_plus_period = subsc_from_moment.add(response.payments_days_left.period, 'month');
            $('#payment_days_left_td').html(subsc_from_moment_plus_period.format("DD/MM/YYYY"));
            $('#agents_total_td').html(response.agents_total);
            //$('#data_collecting_td').html(response.collectors);
            $('#property_sale_cards_total_td').html(response.property_sale_cards_total);
            $('#property_rent_cards_total_td').html(response.property_rent_cards_total);
            $('#client_sale_cards_total_td').html(response.client_sale_cards_total);
            $('#client_rent_cards_total_td').html(response.client_rent_cards_total);
            $('#cards_in_stock_total_td').html(response.stock_cards_total);
            //$('#cards_in_stock_collected_during_subsc_td').html(response.stock_cards_subsc+'<span style="color:#FF9037;">*</span>');
            $('#agents_in_work_total_td').html(response.agents_in_work);//???
            $('#phone_from_app_td').html("<span locale='yes'>yes</span>");
            
            if (response.new_subsc_bought != null){
                $('#new_subsc_bought_alert').show();
                $('#new_subsc_bought_date').text(utils.convertTimestampForDatepicker(response.days_left));
            }
            
            $('#office_info_table span.editable').hover(
                function(){
                    $(this).next('i').show();
                },
                function(){
                    $(this).next('i').hide();
                });
            
            localization.toLocale();
            utils.removeHtmlSpinner("office_info_modal h4");
        });
    };
    
    this.editOfficeInfoParameter = function(parameter){
        $('#'+parameter+'_span').hide();
        $('#'+parameter+'_input').show();
        $('#save_'+parameter+'_button').show();
        $('#edit_'+parameter+'_button').hide();
    };
    
    this.saveOfficeInfoParameter = function(e, parameter){
        if (e.keyCode == 13 && $('#'+parameter+'_input').val().trim().length > 0){
            $('#'+parameter+'_span').show().text($('#'+parameter+'_input').val());
            $('#'+parameter+'_input').hide();
            
            $.post("/api/tools/saveofficeinfoparameter.json",{
                parameter: parameter,
                value: $('#'+parameter+'_input').val().trim()
            },function (response){
                if (response != null && response.error != undefined)
                     showErrorMessage(localization.getVariable(response.error.description));
                else if (response != null){
                    showSuccess(localization.getVariable("office_info_parameter_saved"));
                }
            });
            
            return false;
        }
    };
    
    this.saveOfficeInfoAgentName = function(){
        if ($('#main_agent_fullname_input').val().trim().length > 0){
            $.post("/api/tools/saveofficeinfoagentname.json",{
                agent_id: this.data.office_info.main_agent,
                agent_name: $('#main_agent_fullname_input').val().trim()
            },function (response){
                if (response.error != undefined)
                     showErrorMessage(response.error.description);
                else{
                    $('#'+response.parameter+'_span').show().text(response.value);
                    $('#'+response.parameter+'_input').hide().val(response.value);
                    $('#save_'+response.parameter+'_button').hide();
                    $('#edit_'+response.parameter+'_button').show();
                }
            });
        }
    };
    
    this.dataImport = function(){
        $('#import_modal').modal("show");
    };
    
    this.agents = function(){
        $.post("/api/permission/getforallagents.json",{},
        function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.accessErrorModal(response.error.description);
                }
                else{
                    utils.errorModal(response.error.description);
                }
            }
            else{
                $('#agents_modal').modal("show");
                this.data.permissions = response;
                $('#agents_table td.agent').remove();
                
                for (var i = 0; i < response.length; i++){
                    if (i === 0)
                        var root = 1;
                    else root = 0;
                    //console.log(response);
                    
                    //$('#agents_table thead tr').append("<td class='agent' width='100'></td>");
                    $('#agents_user_name_tr').append('<td class="agent" id="agent_'+i+'_name_td"><span id="agent_'+i+'_name_span" style="cursor:pointer;" onclick="tools.editAgentName('+i+')">'+response[i].name+'</span><input style="display:none;width:80%;" id="agent_'+i+'_name_input" onblur="tools.saveAgentName('+i+','+response[i].user+')" value="'+response[i].name+'" /></td>');
                    $('#agents_password_tr').append('<td class="agent"><button id="" onclick="tools.changePasswordWithoutCheck('+response[i].user+')" type="button" locale="change_button" class="btn btn-primary">Change</button></td>');
                    $('#agents_email_tr').append('<td class="agent" id="agent_'+i+'_email_td"><span id="agent_'+i+'_email_span" style="cursor:pointer;" onclick="tools.editAgentEmail('+i+')">'+response[i].email+'</span><input style="display:none;width:80%;" id="agent_'+i+'_email_input" onblur="tools.saveAgentEmail('+i+','+response[i].user+')" value="'+response[i].email+'" /></td>');
                    //$('#agents_password_tr').append(response[i].password); // ???
                    //$('#agents_default_search_tr').append("<td class='agent'><select id=\"agent_"+i+"_default_search_select\" class=\"default_search_select\" onchange=\"tools.changeAgentDefaults(this, 'search', "+response[i].user+")\"><option locale='select_dearch' value='0'>Select search</option></select></td>");
                    //$('#agents_default_locale_tr').append("<td class='agent'><select id=\"agent_"+i+"_default_locale_select\" onchange=\"tools.changeAgentDefaults(this, 'locale', "+response[i].user+")\"><option locale='select_locale' value='0'>Select locale</option></select></td>");
                    $('#agents_delete_card_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_delete_card_perm_select\" onchange=\"tools.changeAgentPermission(this, 'delete_card', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_delete_card_perm_select').val(response[i].delete_card);
                    $('#agents_new_card_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_new_card_perm_select\" onchange=\"tools.changeAgentPermission(this, 'new_card', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_new_card_perm_select').val(response[i].new_card);
                    $('#agents_edit_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_edit_perm_select\" onchange=\"tools.changeAgentPermission(this, 'edit', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_edit_perm_select').val(response[i].edit);
                    $('#agents_export_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_export_perm_select\" onchange=\"tools.changeAgentPermission(this, 'export', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_export_perm_select').val(response[i].export);
                    $('#agents_edit_card_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_edit_card_perm_select\" onchange=\"tools.changeAgentPermission(this, 'edit_another_card', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_edit_card_perm_select').val(response[i].edit_another_card);
                    $('#agents_edit_agent_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_edit_agent_perm_select\" onchange=\"tools.changeAgentPermission(this, 'edit_agent', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_edit_agent_perm_select').val(response[i].edit_agent);
                    $('#agents_use_data_collecting_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_use_data_collecting_perm_select\" onchange=\"tools.changeAgentPermission(this, 'use_data_collecting', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_use_data_collecting_perm_select').val(response[i].use_data_collecting);
                    //$('#agents_projects_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_projects_perm_select\" onchange=\"tools.changeAgentPermission(this, 'projects', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    //$('#agent_'+i+'_projects_perm_select').val(response[i].projects);
                    $('#agents_del_doc_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_del_doc_perm_select\" onchange=\"tools.changeAgentPermission(this, 'delete_document', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_del_doc_perm_select').val(response[i].delete_document);
                    $('#agents_del_pic_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_del_pic_perm_select\" onchange=\"tools.changeAgentPermission(this, 'delete_picture', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    $('#agent_'+i+'_del_pic_perm_select').val(response[i].delete_picture);
                    //$('#agents_del_agr_perm_tr').append("<td class='agent'><select "+(root === 1 ? "disabled='disabled' class='half_opaque'" : "")+" id=\"agent_"+i+"_del_agr_perm_select\" onchange=\"tools.changeAgentPermission(this, 'delete_agreement', "+response[i].user+")\"><option locale='yes' value='1'>Yes</option><option locale='no' value='0'>No</option></select></td>");
                    //$('#agent_'+i+'_del_agr_perm_select').val(response[i].delete_agreement);
                    $('#agents_work_time_tr').append('<td class="agent"><select id="agent_'+response[i].user+'_work_time_from_select" onchange="tools.changeAgentParameter(this, \'work_time_from\', '+response[i].user+')"><option value="0">00:00</option><option value="1">01:00</option><option value="2">02:00</option><option value="3">03:00</option><option value="4">04:00</option><option value="5">05:00</option><option value="6">06:00</option><option value="7">07:00</option><option value="8">08:00</option><option value="9">09:00</option><option value="10">10:00</option><option value="11">11:00</option><option value="12">12:00</option><option value="13">13:00</option><option value="14">14:00</option><option value="15">15:00</option><option value="16">16:00</option><option value="17">17:00</option><option value="18">18:00</option><option value="19">19:00</option><option value="20">20:00</option><option value="21">21:00</option><option value="22">22:00</option><option value="24">23:00</option></select> - <select id="agent_'+response[i].user+'_work_time_to_select" onchange="tools.changeAgentParameter(this, \'work_time_to\', '+response[i].user+')"><option value="0">00:00</option><option value="1">01:00</option><option value="2">02:00</option><option value="3">03:00</option><option value="4">04:00</option><option value="5">05:00</option><option value="6">06:00</option><option value="7">07:00</option><option value="8">08:00</option><option value="9">09:00</option><option value="10">10:00</option><option value="11">11:00</option><option value="12">12:00</option><option value="13">13:00</option><option value="14">14:00</option><option value="15">15:00</option><option value="16">16:00</option><option value="17">17:00</option><option value="18">18:00</option><option value="19">19:00</option><option value="20">20:00</option><option value="21">21:00</option><option value="22">22:00</option><option value="24">23:00</option></select>');
                }
                
                localization.toLocale();
                
                $.post("/api/agency/getagentsworktime.json",{},
                function (response){
                    for (var i = 0; i < response.length; i++){
                        $('#agent_'+response[i].id+'_work_time_from_select').val(response[i].work_time_from);
                        $('#agent_'+response[i].id+'_work_time_to_select').val(response[i].work_time_to);
                    }
                });
                
                /*$.post("/api/agency/getagencysearches.json",{},
                function (response){
                    if (response.length > 0){
                        for (var i = 0; i < response.length; i++){
                            $('.default_search_select').append('<option value="'+response[i].id+'">'+response[i].title+'</option>');
                        }
                        
                        $.post("/api/defaults/getallsearches.json",{},
                        function (response){
                            this.data.defaults = response;

                            for (var i = 0; i < response.length; i++){
                                $('#agent_'+i+'_default_search_select').val(response[i].search != null ? response[i].search : 0);                    
                                //$('#agent_'+i+'_default_locale_select').val(response[i].locale != null ? response[i].locale : 0);
                            }
                        });
                    }
                    else{
                        $('.default_search_select').parent().html("<span locale='no_searches_create'>No searches, you have to create it.</span>");
                        localization.toLocale();
                    }
                });*/
            }
        });
    };
    
    this.changeAgentDefaults = function(select, parameter, user){
        $.post("/api/defaults/setuser.json",{
            parameter: parameter,
            value: $(select).val(),
            user: user
        },function (response){
            if (response.error != undefined){
                utils.errorModal(response.error.description);
            }
        });
    };
    
    this.changeAgentPermission = function(select, parameter, user){
        $.post("/api/permission/set.json",{
            parameter: parameter,
            value: $(select).val(),
            agent: user
        },function (response){
            if (response.error != undefined){
                utils.errorModal(response.error.description);
            }
        });
    };
    
    this.changeAgentParameter = function(select, parameter, user){
        $.post("/api/agency/setagentparameter.json",{
            parameter: parameter,
            value: $(select).val(),
            agent: user
        },function (response){
            if (response.error != undefined){
                utils.errorModal(response.error.description);
            }
        });
    };
    
    this.changePasswordWithoutCheck = function(agent){
        $('#change_password_without_check_modal').modal("show");
        $('#save_password_without_check_button').unbind("click");
        $('#save_password_without_check_button').click({agent:agent},function(e){
            if ($('#new_password_without_check_input').val().length > 0){
                $.post("/api/agency/setagentparameter.json",{
                    parameter: "password",
                    value: MD5($('#new_password_without_check_input').val()),
                    agent: e.data.agent
                },function (response){
                    if (response.error != undefined){
                        showErrorMessage(response.error.description);
                    }
                    else{
                        showSuccess(localization.getVariable("password_successfully_changed"));
                        $('#change_password_without_check_modal').modal("hide");
                    }
                });
            }
        });
    };
    
    this.changePasswordWithCheck = function(){
        $('#change_password_with_check_modal').modal("show");
        
        $('#save_password_with_check_button').click(function(e){
            var oldpass = MD5($('#old_password_input').val());
            var newpass = MD5($('#new_password_input').val());
            
            if ($('#new_password_input').val().length >= 8 && $('#old_password_input').val().length > 0){
                $.post("/api/user/changemypasswd.json",{
                    old: oldpass,
                    new: newpass
                },function (response){
                    if (response.error != undefined){
                        if (response.error.code == 403){
                            $('#change_my_passwd_error_alert').show().text(localization.getVariable("wrong_old_password"));
                        }
                        else{
                            $('#change_my_passwd_error_alert').show().text(localization.getVariable("contact_error_message"));
                        }
                    }
                    else{
                        showSuccess(localization.getVariable("password_successfully_changed"));
                        $('#change_password_with_check_modal, #change_my_passwd_error_alert').modal("hide");
                    }
                });
            }
            else{
                $('#change_my_passwd_error_alert').show().text(localization.getVariable("password_tip"));
            }
        });
    };
    
    
    this.projects = function(){
        
    };
    
    this.editAgentName = function(key){
        $('#agent_'+key+'_name_span').hide();
        $('#agent_'+key+'_name_input').show().focus();
    };
    
    this.saveAgentName = function(key, user_id){
        $('#agent_'+key+'_name_span').text($('#agent_'+key+'_name_input').val().trim()).show();
        $('#agent_'+key+'_name_input').hide();
        $('#agent_'+key+'_name_edit_button').show();
        $('#agent_'+key+'_name_save_button').hide();
        
        if ($('#agent_'+key+'_name_input').val().length > 0){
            $.post("/api/agency/setagentparameter.json",{
                parameter: "name",
                value: $('#agent_'+key+'_name_input').val().trim(),
                agent: user_id
            },function (response){
                if (response.error != undefined){
                    showErrorMessage(response.error.description);
                }
                else{
                    showSuccess(localization.getVariable("agent_name_saved_successfully"));
                }
            });
        }
    };
    
    this.editAgentEmail = function(key){
        $('#agent_'+key+'_email_span').hide();
        $('#agent_'+key+'_email_input').show().focus();
    };
    
    this.saveAgentEmail = function(key, user_id){
        $('#agent_'+key+'_email_span').text($('#agent_'+key+'_email_input').val().trim()).show();
        $('#agent_'+key+'_email_input').hide();
        $('#agent_'+key+'_email_edit_button').show();
        $('#agent_'+key+'_email_save_button').hide();
        
        if ($('#agent_'+key+'_email_input').val().length > 0){
            $.post("/api/agency/setagentparameter.json",{
                parameter: "email",
                value: $('#agent_'+key+'_email_input').val().trim(),
                agent: user_id
            },function (response){
                if (response.error != undefined){
                    showErrorMessage(response.error.description);
                }
                else{
                    showSuccess(localization.getVariable("agent_email_saved_successfully"));
                }
            });
        }
    };
    
    this.onChromeExtensionInstallSuccess = function(){
        $('#install_collector_modal').modal("hide");
        //tools.openRunCollectorDialog();
        response_list.external_block = false;
        utils.successModal(localization.getVariable("collector_install_success_message"));
        //tools.checkChromeExtensionExist();
    };
    
    this.onChromeExtensionInstallFailure = function(){
        $('#collector_install_error_div').show();
        tools.checkChromeExtensionExist();
    };
    
    this.openInstallCollectorDialog = function(){
        $('#show_on_external_first_choice_modal').modal("hide");
        $('#install_collector_modal').modal("show");
    };
    
    this.openRunCollectorDialog = function(){
        $.post("/api/tools/getcollectors.json", null, function (response){
            if (response.error != undefined){
                if (response.error.code == 501){
                    utils.warningModal(localization.getVariable(response.error.description));
                }
                else{
                    $('#run_collector_modal').modal("show");
                }
                
                if (!user.isGuest()){
                    $('#run_collector_modal #install_collector_body')
                        .html(localization.getVariable(response.error.description))
                        .append('<p><br><a locale="improve_account" target="_blank" class="btn btn-success" href="balance?status=6" role="button">'+localization.getVariable("improve_account")+'</a>');
                }
                else{
                    $('#run_collector_modal #install_collector_body').html(localization.getVariable("contact_error_message"));
                }
            }
            else{
                $('#run_collector_modal').modal("show");
                $('#run_collector_select').html("");

                for (var i = 0; i < response.length; i++){
                    if (response[i] != 0){
                        $('#run_collector_select').append('<option value="'+response[i].id+'" link="'+response[i].link+'">'+response[i].title+'</option>');
                    }
                }

                $('#run_data_collector_a').attr("href", $('#run_collector_select').children('option:selected').attr("link"));
                $('#run_data_collector_a').attr("onclick","");

                $('#run_collector_select').unbind("change").change(function(){
                    $('#run_data_collector_a').attr("href", $(this).children('option:selected').attr("link"));
                    $('#run_data_collector_a').attr("onclick","");
                });
            }
        });
        
        /*$.post("/api/tools/checkusercountry.json",{},
        function (response){
            if (response == "IL" || response == "FR"){
                $('#run_data_collector_a').attr("href", "http://www.yad2.co.il/Nadlan/sales.php");
                $('#run_data_collector_a').attr("onclick","");
            }
            else{
                $('#run_data_collector_a').attr("href", "javascript:void(0)");
                $('#run_data_collector_a').attr("onclick","tools.showCollectorCountryError()");
            }
        });*/
    };
    
    this.showCollectorCountryError = function(){
        $('#run_collector_error_span').show();
    };
    
    this.checkChromeExtensionExist = function(){
        if (location.pathname != "/query" || chrome.runtime == undefined){
            return false;
        }
        
        var extensionId = "oolnpgoehoddpgeeelmfhffaenjlblbh";

        chrome.runtime.sendMessage(extensionId, { message: "installed" }, function (reply) {
            if (reply) {
                if (reply.installed) {
                    if (reply.installed == true) {
                        //$('#install_collector_button').hide();
                        //$('#run_collector_button').show();
                        response_list.external_block = false;
                    }
                    else{ 
                        //$('#install_collector_button').show();
                        //$('#run_collector_button').hide();
                        response_list.external_block = true;
                    }
                }
                else{
                    //$('#install_collector_button').show();
                    //$('#run_collector_button').hide();
                    response_list.external_block = true;
                }
            }
            else{
                //$('#install_collector_button').show();
                //$('#run_collector_button').hide();
                response_list.external_block = true;
            }
        });
    };
    
    this.openContactDialog = function(){
        $('#question_modal').modal("show");
    };
    
    this.sendTryNowEmail = function(){
        if ($('#try_now_email_input').val().trim().length === 0){
            $('#try_now_email_input').focus();
            return 0;
        }
        
        $('#contact5_input').val($('#try_now_email_input').val().trim()).attr("disabled", true);
        
        $.post("/api/tools/savetrynowemail.json",{
            email: $('#try_now_email_input').val().trim(),
            locale: $('#locale_select').val()
        },
        function (response){
            if (response.error != undefined){
                    $('#try_now_get_email_error_div').show();
                }
                else{
                    $('#try_now_save_email_modal').modal("hide");
                    $('#try_now_code_modal').modal("show");
                    $('div.modal-backdrop').unbind("click");
                }
        });
    };
    
    this.sendTryNowCode = function(){
        if ($('#try_now_code_input').val().trim().length === 0){
            $('#try_now_code_input').focus();
            return 0;
        }
        
        $.post("/api/tools/checktrynowcode.json",{
            email: $('#contact5_input').val().trim(),
            code: $('#try_now_code_input').val().trim()
        },
        function (response){
            if (response.error != undefined){
                    $('#try_now_code_error_div').show();
                }
                else{
                    showSuccess(localization.getVariable("right_code_now_create_your_card"));
                    $('#try_now_code_modal').modal("hide");
                    $('#status_select option').attr("disabled", true);
                    $('#status_select option[value=6]').attr("disabled", false);
                    $('#status_select').val(6);
                }
        });
    };
    
    this.validateEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };
    
    this.sendTryNowEnterEmail = function(){
        if ($('#try_now_enter_email_input').val().trim().length > 0){            
            this.try_now_enter_email = $('#try_now_enter_email_input').val().trim();
            
            if (!this.validateEmail(this.try_now_enter_email)){
                utils.lightField($('#try_now_enter_email_input'));
                $('#try_now_enter_email_input').focus();
                
                return false;
            }
            
            utils.htmlSpinner("submit_enter_code");
            
            $.post("/api/tools/savetrynowenteremail.json",{
                email: $('#try_now_enter_email_input').val().trim(),
                name: $('#try_now_enter_name_input').val().trim(),
                phone: $('#try_now_enter_phone_input').val().trim(),
                city: $('#try_now_enter_city_input').val().trim(),
                locale: $('#locale_select').val()
            },
            function (response){
                utils.removeHtmlSpinner("submit_enter_code");

                if (response.error != undefined){
                    //$('#try_now_code_error_div').show();
                }
                else{
                    if (response == 0){
                        location.href = "query?utm_source=direct&utm_term="+tools.try_now_enter_email;
                    }
                    else{
                        //$('#try_now_enter_email_modal').modal("hide");
                        //$('#try_now_code_modal').modal("show");
                        //$('div.modal-backdrop').unbind("click");
                        $('#try_now_code_input').focus();
                        $('#try_now_enter_email_modal .modal-body').css("max-height", "none");
                        $('#code_input_wrapper').animate({height:"+=100px", overflow:"visible"}, 200, function(){
                            $('#submit_enter_code')
                                .attr({onclick: "tools.sendTryNowEnterCode()"})
                                .text(localization.getVariable("submit_code"));
                        });

                    }
                }
            });
        }
        else{
            utils.lightField($('#try_now_enter_email_input'));
            $('#try_now_enter_email_input').focus();
        }
    };
    
    this.sendTryNowEnterCode = function(){
        if ($('#try_now_code_input').val().trim().length === 0){
            $('#try_now_code_input').focus();
            utils.lightField($('#try_now_code_input'));
            
            return false;
        }
        
        utils.htmlSpinner("submit_enter_code");
        
        $.post("/api/tools/checktrynowentercode.json",{
            email: this.try_now_enter_email,
            code: $('#try_now_code_input').val().trim()
        },
        function (response){
            utils.removeHtmlSpinner("submit_enter_code");
            
            if (response.error != undefined){
                $('#try_now_code_error_div').show();
            }
            else{
                location.href = "query?utm_source=direct&utm_term="+tools.try_now_enter_email;
            }
        });
    };
    
    this.init();
}