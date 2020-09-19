function Subscription(){
    this.defaults = {};
    
    this.init = function(){
        this.checkRemaining();
    };
    
    this.checkRemaining = function(){ // проверяет сколько осталось до конца подписки, если меньше недели выдает алерт
        /*$.post("/api/subscription/checkremaining.json",{
        },function (response){
            if (
                    (response.status == 1 && utils.getCookie("subsc_warning_last_showed") == undefined) || 
                    (response.status == 1 && utils.getNow() - utils.getCookie("subsc_warning_last_showed") > 86400)
                ){
                $('#subsc_warning_modal .modal-body').html(response.days_left+" <span locale='days_left_for_subscription'>days left for you subscription expired!</span>");
                $('#subsc_warning_modal').modal('show');
            }
            
            if (response.status == 1){
                $('#improve_account_a').attr({href: "balance?status=4", locale : "buy_new_subscr"});
            }
        });*/
        
        var response = global_data.subscription_checkremaining;
        
        if (
                (response.status == 1 && utils.getCookie("subsc_warning_last_showed") == undefined) || 
                (response.status == 1 && utils.getNow() - utils.getCookie("subsc_warning_last_showed") > 86400)
            ){
            $('#subsc_warning_modal .modal-body').html(response.days_left+" <span locale='days_left_for_subscription'>days left for you subscription expired!</span>");
            $('#subsc_warning_modal').modal('show');
        }

        if (response.status == 1){
            $('#improve_account_a').attr({href: "balance?status=4", locale : "buy_new_subscr"});
        }
    };
    
    this.initBalance = function(){ // инициализация на странице balance. для каждого случая своя
        if (urlparser.getParameter("status") != undefined){
            if (urlparser.getParameter("status") == "1"){
                $('#5_days_over_form').show();
                
                $.post("/api/subscription/checkcancelled.json", {}, function (response){
                    if (response == 0 && urlparser.getParameter("cancel") == "Failure"){
                        $('#5_days_over_form .cant_cancel_div').show();
                    }
                });
            }
            else if (urlparser.getParameter("status") == "2"){
                $('#60_days_over_form').show();
                
                $.post("/api/subscription/checkcancelled.json", {}, function (response){
                    if (response == 0 && urlparser.getParameter("cancel") == "Failure"){
                        $('#60_days_over_form .cant_cancel_div').show();
                    }
                });
            }
            else if (urlparser.getParameter("status") == "3"){
                $('#expired_form').show();
            }
            else if (urlparser.getParameter("status") == "4"){
                $('#balance_lack_wrapper_div').css("padding", "20px 0");
                $('#pay_form, \n\
                    #payment_buttons_form,\n\
                    #instalments_wrapper,\n\
                    #period_wrapper'
                ).show();
                
                $.post("/api/subscriptionexpired/checkexisting.json", {}, function (response){
                    if (response != null){
                        $('#pay_form, #order_buttons_block_div').hide();
                        $('#new_subscr_bought_already_div').show();
                    }
                });
        
                $('input.icheck').iCheck({
                    checkboxClass: 'icheckbox_flat-grey',
                    radioClass: 'iradio_flat-grey'
                });

                $('.icheck').on('ifClicked', function(event) {
                    if (event.target.id === "direct_checkbox"){
                        $('#paypal_buynow_button').hide();
                        $('#paypal_subscription_button').hide();
                        $('#instalments_period_select').val(0).attr("disabled", true);
                    }
                    else if (event.target.id === "paypal_checkbox"){
                        if ($('#instalments_period_select').val() == 0){
                            $('#paypal_buynow_button').show();
                            $('#paypal_subscription_button').hide();
                            $('#total_wrapper').show();
                        }
                        else if ($('#instalments_period_select').val() == 1){
                            $('#paypal_subscription_button').show();
                            $('#paypal_buynow_button').hide();
                            $('#total_wrapper').hide();
                        }

                        $('#instalments_period_select').attr("disabled", false);
                    }
                });
                
                $.post("/api/payment/createexpired.json",{
                }, function(response){
                    order.tmp_id = response;
                    $('.invoice').val(response);
                    order.initBalanceExpired();
                });
            }
            else if (urlparser.getParameter("status") == "5"){
                $('#balance_lack_wrapper_div').css("padding", "20px 0");
                $('#prolong_form, #payment_buttons_form').show();
                $('input.icheck').iCheck({
                    checkboxClass: 'icheckbox_flat-grey',
                    radioClass: 'iradio_flat-grey'
                });

                $('.icheck').on('ifClicked', function(event) {
                    if (event.target.id === "direct_checkbox"){
                        $('#paypal_buynow_button').hide();
                        $('#paypal_subscription_button').hide();
                    }
                    else if (event.target.id === "paypal_checkbox"){
                        $.post("/api/subscription/getmonthly.json",{
                        },function (response){
                            if (response == 0){
                                $('#paypal_buynow_button').show();
                                $('#paypal_subscription_button').hide();
                            }
                            else if (response == 1){
                                $('#paypal_subscription_button').show();
                                $('#paypal_buynow_button').hide();
                            }
                        });
                    }
                });
                
                $.post("/api/subscription/getmonthly.json",{
                },function (response){
                    if (response == 0){
                        $('#paypal_buynow_button').show();
                        $('#paypal_subscription_button').hide();
                    }
                    else if (response == 1){
                        $('#paypal_subscription_button').show();
                        $('#paypal_buynow_button').hide();
                    }
                });
                
                $.post("/api/payment/createprolong.json",{
                }, function(response){
                    order.tmp_id = response;
                    $('.invoice').val(response);
                    order.initBalanceProlong();
                });
            }
            else if (urlparser.getParameter("status") == "6"){
                $('#balance_lack_wrapper_div').css("padding", "20px 0");
                $('#instalments_period_select').attr("disabled", true).val(0);
                $('#subscription_form_header').attr("locale", "set_improve_parameters").addClass("bottom20");
                $('#subscription_remaining_wrapper_div').show();
                $('#subscription_form_header_description').hide();
                $('#subscription_period_select').html("");
                
                for (var i = 0; i <= 12; i++){
                    $('#subscription_period_select').append('<option locale="'+(i == 0 ? "dont_expand" : i+'_months')+'" value="'+i+'" title="">'+i+' months</option>');
                }
                
                $.post("/api/subscription/checkremainingnoalert.json",{
                }, function(response){
                    $('#subscription_remaining_span').text(utils.convertTimestampForDatepicker(response));
                });
                
                localization.toLocale();
                $('#pay_form, #payment_buttons_form').show();
                $('input.icheck').iCheck({
                    checkboxClass: 'icheckbox_flat-grey',
                    radioClass: 'iradio_flat-grey'
                });

                $('.icheck').on('ifClicked', function(event) {
                    if (event.target.id === "direct_checkbox"){
                        $('#paypal_buynow_button').hide();
                        $('#paypal_subscription_button').hide();
                        $('#instalments_period_select').val(0).attr("disabled", true);
                    }
                    else if (event.target.id === "paypal_checkbox"){
                        if ($('#instalments_period_select').val() == 0){
                            $('#paypal_buynow_button').show();
                            $('#paypal_subscription_button').hide();
                        }
                        else if ($('#instalments_period_select').val() == 1){
                            $('#paypal_subscription_button').show();
                            $('#paypal_buynow_button').hide();
                        }

                        $('#instalments_period_select').attr("disabled", false);
                    }
                });
                
                $.post("/api/payment/createimprove.json",{
                }, function(response){
                    order.tmp_id = response.payment;
                    order.improve_id = response.improve;
                    $('.invoice').val(response.payment);
                    order.initBalanceImprove();
                });
            }
            
            $.post("/api/user/getmytype.json", null, function(response){
                if (response != 0 && response != 2){
                    $('#balance_lack_wrapper_div').children().hide();
                    $('#lack_form_for_agent').show();
                }
            });
            
            $('.account_lack_days_left_span').text(urlparser.getParameter("remaining"));
            $('.account_lack_days_passed_span').text(urlparser.getParameter("passed"));
        }
        else{
            $('#error_div').show();
        }
        
        localization.toLocale();
    };
    
    this.setShowed = function(){ // задает флаг в куки о том что сутки алерт конца подписки не надо показывать
        utils.setCookie("subsc_warning_last_showed", utils.getNow(), {expires: 315360000});
    };
    
    this.close = function(){
        $.post("/api/subscription/cancelpayments.json", null, function(response){
            $('#confirm_account_close_modal').modal("hide");
            $('#confirm_account_close_result_modal').modal("show");
            
            if (response == "Success"){
                $('#confirm_account_close_result_modal .message1').show();
                $('#confirm_account_close_result_modal .message2').hide();
            }
            else{
                $('#confirm_account_close_result_modal .message1').hide();
                $('#confirm_account_close_result_modal .message2').show();
            }
        });
    };
}