/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function User(){
    this.id = null;
    this.type = null;
    this.name = null;
    
    this.setMyName = function(){
        /*$.post("/api/user/getmyname.json",{
        },function (response){
            user.name = response;
            $('#header_user_name').text(response);
        });*/
        this.name = global_data.getmyname;
        $('#header_user_name').text(this.name);
    };
    
    this.getMyId = function(){
        /*$.post("/api/user/getmyid.json",{
        },function (response){
            user.id = response;
            
            if (response == 4){
                user.initGuest();
            }
        });*/
        this.id = global_data.getmyid;
        
        if (this.id == 4){
            this.initGuest();
        }
    };
    
    this.getMyContactEmail = function(){
        /*$.post("/api/user/getcontactemail.json",{
        },function (response){
            $('#contact_email_input').val(response);
        });*/
        
        $('#contact_email_input').val(global_data.getcontactemail);
    };
    
    this.getMyType = function(){
        /*$.post("/api/user/getmytype.json",{
        },function (response){
            user.type = response;
            
            if (response != 0 && response != 2 && response != -1){
                $('#agents_button, #improve_account_a, #office_info_button, #ask_a_question_a').hide();
            }
        });*/
        
        this.type = global_data.getmytype;
        
        if (this.type != 0 && this.type != 2 && this.type != -1){
            $('#agents_button, #improve_account_a, #office_info_button, #ask_a_question_a').hide();
        }
    };
    
    this.getMyOfficeInfo = function(){
        /*$.post("/api/user/getmyofficeinfo.json",{
        },function (response){
            user.agency_data = response;
            $('#company_name_span').text(response.company_name);
            $('#company_phone_span').text(response.company_phone);
            $('#company_email_span').text(response.company_email);
            $('#agent_name_span').text(response.user_name);
            
            if (user.agency_data.id == 1){
                $('#del_external_card_button').show();
                $('#external_checks_wrapper').show();
                $('#yad2_check, #winwin_check').attr("checked", true);
            }
        });*/
        
        this.agency_data = global_data.getmyofficeinfo;
        $('#company_name_span').text(this.agency_data.company_name);
        $('#company_phone_span').text(this.agency_data.company_phone);
        $('#company_email_span').text(this.agency_data.company_email);
        $('#agent_name_span').text(this.agency_data.user_name);

        if (this.agency_data.id == 1){
            $('#del_external_card_button').show();
            $('#external_checks_wrapper').show();
            $('#yad2_check, #winwin_check').attr("checked", true);
        }
    };
    
    this.isGuest = function(){
        if (user.id == 4){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.initGuest = function(){
        switch (location.pathname){
            case "/query":
                if (urlparser.getParameter("utm_term") == undefined && utils.getCookie("try_now_email") == undefined){
                    $('#try_now_enter_email_modal').modal("show");
                    $('#try_now_enter_email_input').focus();
                    $('div.modal-backdrop').unbind("click");
                }
                else if (urlparser.getParameter("utm_term") != undefined){
                    utils.setCookie("try_now_email", urlparser.getParameter("utm_term"), {expires: 315360000});
                }
                
                $('#save_search_button,\n\
                    #saved_searches_button,\n\
                    #list_a,\n\
                    #saved_lists_button,\n\
                    #del_card_button,\n\
                    #save_contour_button'
                ).attr("onclick", "").addClass("try_now_disabled_li");
                $('#output_group>ul>li>a').attr("onclick", "").addClass("try_now_disabled_li");
                $('#email_a').attr("href", "");
                $('#client_for_sale_a, #client_for_rent_a').attr("disabled", true);
                
                if (urlparser.getParameter("response") == "map"){
                    /*$('#locale_select').change(function(){
                        location.reload();
                    });*/
                }
            break;
            case "/property":
                $('#history_button, #in_owl_button, #at_button').attr("disabled", true);
                $('.contact_buttons_block>button').unbind("click").attr("onclick", "").click(function(){
                    $('#try_now_forbidden_modal .alert > span').text(localization.getVariable("need_subsc_for_phones_n_sms"));
                    $('#try_now_forbidden_modal').modal("show");
                });
                    
                $('#copy_for_sale_a, \n\
                    #copy_for_rent_a, \n\
                    #history_button').attr("onclick", "").addClass("try_now_disabled_li");
                
                if (urlparser.getParameter("mode") !== "collected"){
                    $('#stock_check').iCheck('disable');
                }
                
                if (urlparser.getParameter("id") == undefined){
                    //$('#try_now_save_email_modal').modal("show");
                    //$('div.modal-backdrop').unbind("click");
                    $('#contact5_input').val(utils.getCookie("try_now_email")).attr("disabled", "true");
                    
                    $.post("/api/tools/guestcount.json",{
                        email: utils.getCookie("try_now_email")
                    },
                    function (response){
                        if (response.error != undefined){
                            $('#try_now_property_forbidden_modal').modal("show");
                            $('div.modal-backdrop').unbind("click");
                        }
                    });
                }
            break;
            case "/client":
                $('#history_button, #in_owl_button, #newcard_button, #at_button').attr("disabled", true);
                $('.contact_buttons_block>button').unbind("click").attr("onclick", "").click(function(){
                    $('#try_now_forbidden_modal .alert > span').text(localization.getVariable("need_subsc_for_phones_n_sms"));
                    $('#try_now_forbidden_modal').modal("show");
                });
                $('#newcard_button').attr("href", "").addClass("try_now_disabled_li");
            break;
        }
        
        $('#office_info_button, \n\
            #data_import_button, \n\
            #agents_button, \n\
            #edit_password_button, \n\
            #ask_a_question_a, \n\
            #improve_account_a'
        ).attr("onclick", "").addClass("try_now_disabled_li");
        $('#improve_account_a').hide();
        
        //$('#header_welcome_wrapper>span, #logout_a').hide();
        $('#office_info_button, #agents_button, #new_account_try_now_a').show();
        
        $('.sidebar-header').children().attr("disabled", true);
        $('#owl_table').hide();
        $("#owl_table_in_try_now").show();
        
        localization.toLocale();
    };
    
    this.initGuestMapTips = function(){
        if (this.id == 4 && markers.length > 0 && location.pathname != "/map"){
            var infoWnd = new google.maps.InfoWindow({
                content : "<div style='direction:"+(localization.isArabian() ? "rtl" : "ltr")+";'>"+localization.getVariable("try_now_map_tip1")+"</div>",
                position : findCenterClosestMarker().position,
                disableAutoPan: true,
                maxWidth: 200
            });
            
            infoWnd.open(map);
        }
    };
    
    this.lockAgentSelect = function(){
        /*$.post("/api/user/lockagent.json", {}, function (response){
            if (response != false){
                $('#select_agent option').each(function(){
                    if ($(this).val() != response && $(this).val() != 0){
                        $(this).attr("disabled", true);
                    }
                });
            }
        });*/
        
        var response = global_data.user_lockagent;
        
        if (response != false){
            $('#select_agent option').each(function(){
                if ($(this).val() != response && $(this).val() != 0){
                    $(this).attr("disabled", true);
                }
            });
        }
    };
    
    this.isFirstAgency = function(){
        if (this.agency_data.id == 1){
            return true;
        }
        else{
            return false;
        }
    };
    
    this.getMyId();
    this.getMyType();
    this.setMyName();
    this.getMyContactEmail();
    this.getMyOfficeInfo();
}