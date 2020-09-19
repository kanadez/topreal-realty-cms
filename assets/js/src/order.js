function Order(){
    this.geoloc = {
        city: null,
        country: null,        
        lat: null,
        lng: null,
        region: null,
        street: null
    };
    this.sum = 0; // общая сумма заказа
    this.monthly = 0;// общая сумма заказа разделенная на кол-во месяцев
    this.neccesary = [
        "full_name_input",
        "office_name_input",
        "country",
        "locality",
        "route",
        "phone_input",
        "email_input",
        "password_input",
        "password_again_input"
    ];
    this.duplicate = 0; // флаг наличия дубликата в форме регистрайции
    this.recaptcha_response = false; // ответ рекапчи после прохождения юзером
    this.new_user = null; // id созданного юзера, кладется сюда после успешного рега
    this.new_agency = null; // id созданного агентства
    this.tmp_id = null; // id временной транзакции
    this.improve_id = null; // id временного заказа расширения аккаунта
    this.data = null; // данные заказа, универсальный объект для всех стадий
    this.pricing = null; // сюда кладем цены сс серва
    this.registering_now = 0; // флаг, который 1 если прямо сейчас регаем юзера
    this.was_changed = 0; // флаг меняетя если в калькуляторе юзер что-то поменял
    this.agents = null; // сюда чиитается кол-во агентов агентства для учета в калькуляторе при расширении аккаунта
    this.agents_list = null; // список агентов с сервера для удаления
    this.improve_agents_to_add = 0; // сюда пишется сколько нужно добавить агентов
    this.improve_agents_to_add_total = 0; // сюда пишется сколько нужно добавить агентов всего
    this.improve_agents_to_remove = []; // массив, куда пишутся id агентов, которые надо удаить
    this.agents_more = false; // если агентов больше 10 то включаем true
    
    this.init = function(){ // инит для страницы регистрациии
        if (location.hash == "#signup"){
            $('#register_calculator_modal').modal("show");
        }
        
        this.lockStep("1_1");
        //this.lockStep("2");
        this.lockStep("3");
        
        $('#subscription_period_select').val(12);
        $('#agents_count_select').val(2);
        
        if (utils.getCookie("try_now_email") != undefined && $('#email_input').val().trim().length === 0){
            $('#email_input').val(utils.getCookie("try_now_email"));
        }
        
        $('#instalments_period_select').change(function(){
            order.was_changed = 1;
            order.calculate();
            order.changePPPaymentType();
        });
        
        $('#subscription_period_select').change(function(){
            order.was_changed = 1;
            order.calculate();
        });
        
        $('#agents_count_select').change(function(){
            order.was_changed = 1;
            
            if ($(this).val() === "more"){
                order.agents_more = true;
                $('#agents_count_input').show();
            }
            
            //$('#agents_count_select').attr("disabled", true);
            order.calculate();
        });
        
        $('#agents_count_input').keyup(function(){
            order.was_changed = 1;
            $(this).val(utils.numberRemoveCommas($(this).val()));
            order.calculate();
        });
        
        $('#agents_count_input').change(function(){
            order.was_changed = 1;
            //$('#agents_count_input').attr("disabled", true);
            order.calculate();
        });
        
        $('#collector_1_select').change(function(){
            order.was_changed = 1;
            $('#collector_2_select option').show();
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                $('#collector_2_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
            }
            
            order.calculate();
        });
        
        $('#collector_2_select').change(function(){
            order.was_changed = 1;
            //$('#collector_1_select option').show();
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                //$('#collector_1_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
            }
            
            order.calculate();
        });
        
        $('#collector_3_select').change(function(){
            order.was_changed = 1;            
            order.calculate();
        });
        
        $('#stock_select').change(function(){
            order.was_changed = 1;            
            order.calculate();
        });
        
        $('#appl_tel_select').change(function(){
            order.was_changed = 1;            
            order.calculate();
        });

        $('#collector_2_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        
        order.calculate();
        
        if (urlparser.getParameter("payment") != undefined){ // если открыт уже созданный ранее платеж, парсим и заполняем форму
            this.tmp_id = urlparser.getParameter("payment");
            $('.invoice').val(this.tmp_id);
            
            $.post("/api/registration/getpaymentdata.json",{
                payment: this.tmp_id
            }, function(response){
                if (response.error == undefined){
                    //console.log(response);
                    
                    $('#full_name_input').val(response.name);
                    $('#office_name_input').val(response.agency);
                    placeDetailsByPlaceId(response.country, service_country, $('#country'));
                    placeDetailsByPlaceId(response.region, service_region, $('#administrative_area_level_1'));
                    placeDetailsByPlaceId(response.city, service_city, $('#locality'));
                    //placeDetailsByPlaceId(response.address, service_route, $('#route'));
                    $('#route').val(response.address);
                    $('#zipcode').val(response.zipcode != null ? response.zipcode : "");
                    $('#phone_input').val(response.phone);
                    $('#email_input').val(response.email);
                    $('#instalments_period_select').val(response.monthly);
                    
                    if (response.monthly == 1){
                        $('#paypal_subscription_button').show();
                        $('#paypal_buynow_button').hide();
                        $('.total_wrapper').hide();
                    }
                    else{
                        $('#paypal_buynow_button').show();
                        $('#paypal_subscription_button').hide();
                        $('.total_wrapper').show();
                    }
                    
                    $('#subscription_period_select').val(response.period);
                    $('#agents_count_select').hide();
                    order.agents_more = true;
                    $('#agents_count_input').show().val(response.users);
                    $('#collector_1_select').val(response.c1);
                    $('#collector_2_select').val(response.c2);
                    $('#collector_3_select').val(response.c3);
                    $('#stock_select').val(response.stock);
                    $('#appl_tel_select').val(response.voip);
                    
                    /*if (response.payment_type == 0){
                        $('#paypal_buynow_button').hide();
                        $('#paypal_subscription_button').hide();
                        $('#instalments_period_select').val(0).attr("disabled", true);
                    }
                    else if (response.payment_type == 1){
                        if ($('#instalments_period_select').val() == 0){
                            $('#paypal_buynow_button').show();
                            $('#paypal_subscription_button').hide();
                        }
                        else if ($('#instalments_period_select').val() == 1){
                            $('#paypal_subscription_button').show();
                            $('#paypal_buynow_button').hide();
                        }

                        $('#instalments_period_select').attr("disabled", false);
                    }*/
                    
                    order.unlockStep(2);
                    order.unlockStep(3);
                    
                    //$('#agents_count_select').attr("disabled", true);
                    //$('#agents_count_input').attr("disabled", true);
                    $('#order_buttons_block_div').css({opacity:"0.3"}).children().attr("disabled", true);
                    $('#recaptcha_wrapper_div').css({opacity:"0.3"}).children().attr("disabled", true);
                    $('#agent_id_wrapper').css({opacity:"0.3"}).children().attr("disabled", true);
                    
                    localization.toLocale();
                    order.calculate();
                }
            });
        }
        else if (utils.getCookie("payment_id") != undefined){ // если сохранен созданный ранее платеж в куках, но его нет в УРЛ
            this.tmp_id = utils.getCookie("payment_id");
            $('#new_register_h1').hide();
            $('#continue_register_wrapper').show();
            $('.invoice').val(this.tmp_id);
            
            $.post("/api/registration/getpaymentdata.json",{
                payment: this.tmp_id
            }, function(response){
                if (response.error == undefined){
                    $('#full_name_input').val(response.name);
                    $('#office_name_input').val(response.agency);
                    placeDetailsByPlaceId(response.country, service_country, $('#country'));
                    placeDetailsByPlaceId(response.region, service_region, $('#administrative_area_level_1'));
                    placeDetailsByPlaceId(response.city, service_city, $('#locality'));
                    $('#route').val(response.address);
                    $('#zipcode').val(response.zipcode != null ? response.zipcode : "");
                    $('#phone_input').val(response.phone);
                    $('#email_input').val(response.email);
                    $('#instalments_period_select').val(response.monthly);
                    
                    if (response.monthly == 1){
                        $('#paypal_subscription_button').show();
                        $('#paypal_buynow_button').hide();
                        $('.total_wrapper').hide();
                    }
                    else{
                        $('#paypal_buynow_button').show();
                        $('#paypal_subscription_button').hide();
                        $('.total_wrapper').show();
                    }
                    
                    $('#subscription_period_select').val(response.period);
                    $('#agents_count_select').hide();
                    order.agents_more = true;
                    $('#agents_count_input').show().val(response.users);
                    $('#collector_1_select').val(response.c1);
                    $('#collector_2_select').val(response.c2);
                    $('#collector_3_select').val(response.c3);
                    $('#stock_select').val(response.stock);
                    $('#appl_tel_select').val(response.voip);
                    
                    /*if (response.payment_type == 0){
                        $('#paypal_buynow_button').hide();
                        $('#paypal_subscription_button').hide();
                        $('#instalments_period_select').val(0).attr("disabled", true);
                    }
                    else if (response.payment_type == 1){
                        if ($('#instalments_period_select').val() == 0){
                            $('#paypal_buynow_button').show();
                            $('#paypal_subscription_button').hide();
                        }
                        else if ($('#instalments_period_select').val() == 1){
                            $('#paypal_subscription_button').show();
                            $('#paypal_buynow_button').hide();
                        }

                        $('#instalments_period_select').attr("disabled", false);
                    }*/
                    
                    order.unlockStep(2);
                    order.unlockStep(3);
                    
                    //$('#agents_count_select').attr("disabled", true);
                    //$('#agents_count_input').attr("disabled", true);
                    //$('#order_buttons_block_div').css({opacity:"0.3"}).children().attr("disabled", true);
                    $('#recaptcha_wrapper_div').hide();//css({opacity:"0.3"}).children().attr("disabled", true);
                    $('#agent_id_wrapper').css({opacity:"0.3"}).children().attr("disabled", true);
                    $('.password_input').hide();
                    $('#register_button').attr("onclick", "order.openCheckoutModal();return false;");
                    
                    localization.toLocale();
                    order.calculate();
                }
            });
        }
    };
    
    this.initBalanceExpired = function(){ // инит для страницы создания новой подписки после завршения старой
        $('#paypal_buynow_button, #paypal_subscription_button').mousedown(function(){
            orderexp.save();
        });        
        $('#subscription_period_select').val(12);
        $('#agents_count_span, #add_expired_agents_button, #remove_agents_button').show();
        //$('#subscription_period_select_label').attr("locale", "add_period");
        $('#agents_count_input').hide(); 
        $('#agents_count_select').hide();
        order.agents_more = false;
        
        $('#instalments_period_select').change(function(){
            orderexp.was_changed = 1;
            orderexp.calculate();
            order.changePPPaymentType();
        });
        
        $('#subscription_period_select').change(function(){
            orderexp.was_changed = 1;
            orderexp.calculate();
        });
        
        $('#agents_count_select').change(function(){
            orderexp.was_changed = 1;
            
            if ($(this).val() === "more"){
                $('#agents_count_select').hide();
                order.agents_more = false;
                //$('#agents_count_input').show();
            }
            
            //$('#agents_count_select').attr("disabled", true);
            orderexp.calculate();
        });
        
        $('#agents_count_input').keyup(function(){
            orderexp.was_changed = 1;
            $(this).val(utils.numberRemoveCommas($(this).val()));
            orderexp.calculate();
        });
        
        $('#agents_count_input').change(function(){
            orderexp.was_changed = 1;
            //$('#agents_count_input').attr("disabled", true);
            orderexp.calculate();
        });
        
        $('#collector_1_select').change(function(){
            orderexp.was_changed = 1;
            $('#collector_2_select option').show();
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                $('#collector_2_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
            }
            
            orderexp.calculate();
        });
        
        $('#collector_2_select').change(function(){
            orderexp.was_changed = 1;
            //$('#collector_1_select option').show();
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                //$('#collector_1_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
            }
            
            orderexp.calculate();
        });
        
        $('#collector_3_select').change(function(){
            orderexp.was_changed = 1;            
            orderexp.calculate();
        });
        
        $('#stock_select').change(function(){
            orderexp.was_changed = 1;            
            orderexp.calculate();
        });
        
        $('#appl_tel_select').change(function(){
            orderexp.was_changed = 1;            
            orderexp.calculate();
        });

        $('#collector_2_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        $('.invoice').val(this.tmp_id);

        $.post("/api/payment/get.json",{
            payment: this.tmp_id
        }, function(response){
            if (response.error == undefined){
                $('#instalments_period_select').val(response.monthly);

                if (response.monthly == 1){
                    $('#paypal_subscription_button').show();
                    $('#paypal_buynow_button').hide();
                }
                else{
                    $('#paypal_buynow_button').show();
                    $('#paypal_subscription_button').hide();
                }

                //$('#subscription_period_select').val(response.period);
                $('#agents_count_select').hide();
                order.agents_more = false;
                //$('#agents_count_input').show().val(response.users);
                $('#agents_count_span').text(response.users);
                $('#collector_1_select').val(response.c1);
                $('#collector_2_select').val(response.c2);
                $('#collector_3_select').val(response.c3);
                $('#stock_select').val(response.stock);
                $('#appl_tel_select').val(response.voip);
                orderexp.agents = Number(response.users);

                localization.toLocale();
                //order.calculateExpired();
                orderexp.calculate();
            }
        });
    };
    
    this.initBalanceProlong = function(){ // инит для страницы продления подписки
        $.post("/api/payment/get.json",{
            payment: this.tmp_id
        }, function(response){
            //$('#change_order_details_a').attr("href", "register?payment="+order.tmp_id);

            if (response.error != undefined){
                $('#error_div').show();
                $('#prolong_form, #payment_buttons_form').hide();
            }
            else{
                var collectors = 3;
                
                for (var i = 1; i <= 3; i++){
                    if (response["c"+i] == 0){
                        collectors--;
                    }
                }

                $('#subscription_details_div').html('\n\
                    '+response.period+' <span locale="of"></span> '+response.period_full+' <span locale="months_remaining"></span>, \n\
                    '+(response.monthly == 1 ? ' <span locale="monthly_payment"></span>,' : '')+'\n\
                    '+response.users+' <span locale="of_agents"></span>, \n\
                    '+collectors+' <span locale="of_collectors"></span>\n\
                ');
            
                $('#a3').val(response.total);
                $('#prolong_monthly_total_span').text(response.total);
                $('#srt').val(response.period);
                $('.invoice').val(order.tmp_id);
                $('#amount').val(response.total);

                localization.toLocale();
            }
        });
    };
    
    this.initBalanceImprove = function(){ // инит для страницы расширения существующей подписки
        $('#subscription_period_select').val(12);
        $('#agents_count_span, #add_agents_button').show();
        $('#subscription_period_select_label').attr("locale", "add_period");
        $('#agents_count_input').hide(); 
        $('#agents_count_select').hide();
        order.agents_more = false;
        localization.toLocale();
        
        $('#instalments_period_select').change(function(){
            order.was_changed = 1;
            order.calculateImprove();
            order.changePPPaymentType();
        });
        
        $('#subscription_period_select').change(function(){
            order.was_changed = 1;
            order.calculateImprove();
        });
        
        $('#collector_1_select').change(function(){
            order.was_changed = 1;
            $('#collector_2_select option').show();
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                $('#collector_2_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
            }
            
            order.calculateImprove();
        });
        
        $('#collector_2_select').change(function(){
            order.was_changed = 1;
            $('#collector_3_select option').show();
            
            if ($(this).val() != 0){
                $('#collector_3_select option[value="'+$(this).val()+'"]').hide();
                $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
            }
            
            order.calculateImprove();
        });
        
        $('#collector_3_select').change(function(){
            order.was_changed = 1;            
            order.calculateImprove();
        });
        
        $('#stock_select').change(function(){
            order.was_changed = 1;            
            order.calculateImprove();
        });
        
        $('#appl_tel_select').change(function(){
            order.was_changed = 1;            
            order.calculateImprove();
        });

        $('#collector_2_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        $('#collector_3_select option[value="'+$('#collector_1_select').val()+'"]').hide();
        $('.invoice').val(this.tmp_id);

        $.post("/api/payment/get.json",{
            payment: this.tmp_id
        }, function(response){
            if (response.error == undefined){
                order.data = response;
                
                $('#instalments_period_select').val(response.monthly);

                if (response.monthly == 1){
                    $('#paypal_subscription_button').show();
                    $('#paypal_buynow_button').hide();
                    $('.total_wrapper').hide();
                }
                else{
                    $('#paypal_buynow_button').show();
                    $('#paypal_subscription_button').hide();
                    $('.total_wrapper').show();
                }

                $('#subscription_period_select').val(response.monthly == 1 ? response.period : response.period_full);
                $('#agents_count_span').text(response.users);
                $('#collector_1_select').val(response.c1 == null ? 0 : response.c1);
                $('#collector_2_select').val(response.c2 == null ? 0 : response.c2);
                $('#collector_3_select').val(response.c3 == null ? 0 : response.c3);
                $('#stock_select').val(response.stock);
                $('#appl_tel_select').val(response.voip);
                
                if ($('#collector_1_select').val() != 0){
                    $('#collector_1_select').attr("disabled", true);
                }
                
                if ($('#collector_2_select').val() != 0){
                    $('#collector_2_select').attr("disabled", true);
                }
                
                if ($('#collector_3_select').val() != 0){
                    $('#collector_3_select').attr("disabled", true);
                }
                
                if ($('#stock_select').val() == 1){
                    $('#stock_select').attr("disabled", true);
                }
                
                if ($('#appl_tel_select').val() == 1){
                    $('#appl_tel_select').attr("disabled", true);
                }
                
                order.agents = Number(response.users);

                localization.toLocale();
                order.calculateImprove();
            }
        });
    };
    
    this.openAddAgentsDialog = function(){
        $('#add_agents_modal').modal("show");
    };
    
    this.openRemoveAgentsDialog = function(){
        this.getAgentsList();
        $('#remove_agents_modal').modal("show");
    };
    
    this.removeAgent = function(agent_id){
        this.was_changed = 1;
        this.improve_agents_to_remove.push(agent_id);
        this.agents--;
        var agent_key = utils.getJSONValueKey(this.agents_list, "id", agent_id);
        var new_agents_list = [];
        
        for (var i = 0; i < this.agents_list.length; i++){
            if (agent_key !== -1 && i !== agent_key){
                new_agents_list.push(this.agents_list[i]);
            }
        }
        
        this.agents_list = new_agents_list;
        $('tr[agentid='+agent_id+']').hide();
        this.updateAgentsCount();
    };
    
    this.getAgentsList = function(){
        if (this.agents_list == null){
            $.post("/api/agency/getagentstoedit.json", null, 
            function(response){
                if (response.error == undefined){
                    order.agents_list = response;
                    $('#edit_agents_table tbody').html("");

                    for (var i = 0; i < response.length; i++){
                        $('#edit_agents_table tbody').append('<tr agentid="'+response[i].id+'"><td width="100%">'+response[i].name+'</td><td><button style="" locale="remove" class="btn btn-default small_button" onclick="order.removeAgent('+response[i].id+')" type="button" title="">Remove</button></td></tr>');
                    }

                    localization.toLocale();
                }
                else{
                    utils.errorModal(response.error.description);
                }
            });
        }
        else{
            $('#edit_agents_table tbody').html("");

            for (var i = 0; i < this.agents_list.length; i++){
                $('#edit_agents_table tbody').append('<tr agentid="'+this.agents_list[i].id+'"><td width="100%">'+this.agents_list[i].name+'</td><td><button style="" locale="remove" class="btn btn-default small_button" onclick="order.removeAgent('+this.agents_list[i].id+')" type="button" title="">Remove</button></td></tr>');
            }

            localization.toLocale();
        }
    };
    
    this.updateAgentsCount = function(){
        $('#agents_count_span').text(this.agents);
        this.calculateImprove();
    };
    
    this.addAgents = function(){
        this.was_changed = 1;
        this.improve_agents_to_add = Number($('#add_agents_count_select').val());
        this.agents += this.improve_agents_to_add; 
        this.improve_agents_to_add_total += this.improve_agents_to_add; 
        $('#add_agents_modal').modal("hide");
        this.updateAgentsCount();
        //showSuccess("Agents successfully added!");
    };
    
    this.initDirect = function(){ // инит для страницы оплаты банк-2-банк
        if (urlparser.getParameter("payment") != undefined){
            $('.direct_payment_wrapper').show();
            $('#order_thanks_div').show();
            $('#order_buttons_block_div').show();
            this.tmp_id = urlparser.getParameter("payment");
            
            $.post("/api/registration/getdirectdata.json",{
                payment: this.tmp_id
            }, function(response){
                $('#change_order_details_a').attr("href", "register?payment="+order.tmp_id);
                
                if (response.error != undefined){
                    $('#error_div').show();
                    $('.direct_payment_wrapper').hide();
                    $('#order_thanks_div').hide();
                    $('#order_buttons_block_div').hide();
                }
                else{
                    $('#billing_wrapper #name').text(response.name);
                    $('#billing_wrapper #locality').attr("placeid", response.city);
                    placeDetailsByPlaceIdNoAutocomplete(response.city, service_city);
                    $('#billing_wrapper #country').attr("placeid", response.country);
                    placeDetailsByPlaceIdNoAutocomplete(response.country, service_country);
                    $('#billing_wrapper #zipcode').text(response.zipcode != null ? response.zipcode : "");
                    $('#billing_wrapper #phone').text(response.phone);
                    $('#billing_wrapper #email').text(response.email);
                    $('#order_total_wrapper #total').text(response.total);
                    var collectors = 3;
                    
                    for (var i = 0; i < 3; i++){
                        if (response["c"+i] == 0){
                            collectors--;
                        }
                    }
                    
                    $('#topreal_subscr_details').html('\n\
                        '+response.period+' <span locale="months"></span>, \n\
                        '+(response.monthly == 1 ? ' <span locale="monthly_payment"></span>,' : '')+'\n\
                        '+response.users+' <span locale="of_agents"></span>, \n\
                        '+collectors+' <span locale="of_collectors"></span>\n\
                    ');
                
                    localization.toLocale();
                }
            });
        }
        else{
            $('#error_div').show();
        }
    };
    
    this.initFinish = function(){ // инит для страницы завершения опллаты
        if (urlparser.getParameter("result") != undefined){
            if (urlparser.getParameter("result") == "success"){
                $('#error_div').hide();
                $('#success_wrapper_div').show();
                $('#payment_finish_image_wrapper').show();
                $('#payment_result_span').attr("locale", "payment_success");
                $('#payment_finish_image_wrapper').css("background-image", "url(../../assets/img/payment_success.png)");
                localization.toLocale();
                utils.setCookie("payment_id", 0, {expires: -1});
            }
            else if (urlparser.getParameter("result") == "failed"){
                $('#error_div').hide();
                $('#fail_wrapper_div').show();
                $('#payment_finish_image_wrapper').show();
                $('#payment_result_span').attr("locale", "payment_failed");
                $('#payment_finish_image_wrapper').css("background-image", "url(../../assets/img/payment_fail.png)");
                $('#try_pay_again_a').attr("href", "/#signup");
                localization.toLocale();
            }
            else if (urlparser.getParameter("result") == "direct_finish"){
                $('#error_div').hide();
                $('#fail_wrapper_div').show();
                $('#payment_finish_image_wrapper').show();
                $('#payment_result_span').attr("locale", "register_direct_done");
                $('.checkout_field_span').attr("locale", "payment_direct_success");
                $('#payment_finish_image_wrapper').css("background-image", "url(../../assets/img/direct_success.png)");
                $('#try_pay_again_a').attr("href", "checkout_direct?payment="+utils.getCookie("payment_id")).attr("locale", "get_back_and_read_again");
                localization.toLocale();
            }
        }
        else{
            $('#payment_result_span').attr("locale", "payment_finished");
            $('#error_div').show();
            localization.toLocale();
        }
    };
    
    this.direct = function(){ // перебрасывает на страницу оплаты директа
        if (this.tmp_id != null && $('.icheck:checked').attr("id") == "direct_checkbox"){
            location.href = "checkout_direct?payment="+this.tmp_id;
        }
    };
    
    this.calculate = function(){ // считает подписку на странице регистрации
        if (this.pricing == null){
            $.post("/api/pricing/get.json",{
                payment: this.tmp_id
            }, function(response){
                order.pricing = response;
                order.calculate();
            });
        }
        else{
            var base = Number(this.pricing.base);
            var agent = Number(this.pricing.user);
            var collector_yad2 = Number(this.pricing.collector_yad2);
            var collector_winwin = Number(this.pricing.collector_winwin);
            var phone_price = Number(this.pricing.voip);
            var phone_price_per_agent = Number(this.pricing.voip_per_agent);
            var instalments_ratio = 1+Number(this.pricing.installments)/100; // 10%
            var booking = Number(this.pricing.booking);
            var paypal = Number(this.pricing.paypal)/100;
            var stock_price = Number(this.pricing.stock);
            var discount = Number(this.pricing.discount)/100+1; //  дложно быть заменено на звачение из базы

            var months = $('#subscription_period_select').val();
            var agents = !this.agents_more ? $('#agents_count_select').val() : $('#agents_count_input').val().trim();
            var phone_app = $('#appl_tel_select').val();
            var collector_1 = $('#collector_1_select').val();
            var collector_2 = $('#collector_2_select').val();
            var collector_3 = $('#collector_3_select').val();
            var instalments = $('#instalments_period_select').val();
            var stock = Number($('#stock_select').val());
            
            var getCollectorPrice = function(collector){
                switch (collector){
                    case "1":
                        return Number(order.pricing.collector_yad2);
                    break;
                    case "2":
                        return Number(order.pricing.collector_winwin);
                    break;
                    default:
                        return 1;
                    break;
                }
            };

            /*if (instalments == 1){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').hide();
                }
            }
            else if (instalments == 0){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').show();
                }            
            }*/
            var voip_agents_sum = phone_app == 1 ? phone_price_per_agent*agents : 0;
            var sum = base + agent*agents + stock*stock_price + phone_price*phone_app + voip_agents_sum;

            /*if (phone_app != 0){
                sum += phone;
            }*/
            
            if (collector_1 != 0){
                sum += getCollectorPrice(collector_1);
            }

            if (collector_2 != 0){
                sum += getCollectorPrice(collector_2);
            }

            if (collector_3 != 0){
                sum += getCollectorPrice(collector_3);
            }

            sum *= months;

            if (instalments != 0){ //  если выбрана рассрочка, тогда умножаем сумму на процент
                sum *= instalments_ratio;
                sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/months).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
                $('#a3').val(this.monthly);
                $('#srt').val(months);
                $('.invoice').val(this.tmp_id);
            }
            else{ // если нету, просто считаем месячную сумму для показухи
                sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/months).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
            }

            this.sum = sum.toFixed(2);
            $('#amount').val(this.sum);
            $('.total_span').html(sum.toFixed(2)+" EUR");

            if (this.tmp_id === null){
                if (this.new_agency != null){
                    $.post("/api/payment/createtemporary.json",{
                        agency: this.new_agency,
                        total: instalments == 0 ? this.sum : this.monthly,
                        monthly: $('#instalments_period_select').val(),
                        period: $('#subscription_period_select').val(),
                        users: !order.agent_more ? $('#agents_count_select').val() : $('#agents_count_input').val().trim(),
                        c1: $('#collector_1_select').val(),
                        c2: $('#collector_2_select').val(),
                        c3: $('#collector_3_select').val(),
                        stock: $('#stock_select').val(),
                        voip: $('#appl_tel_select').val()
                        //payment_type: $('.icheck:checked').val()
                    }, function(response){
                        order.tmp_id = response;
                        $('.invoice').val(response);
                        utils.setCookie("payment_id", response, {expires: 315360000});
                    });
                }
            }
            else if (this.was_changed === 1){
                $('.invoice').val(this.tmp_id);
                $.post("/api/payment/updatetemporary.json",{
                    id: this.tmp_id,
                    total: instalments == 0 ? this.sum : this.monthly,
                    monthly: $('#instalments_period_select').val(),
                    period: $('#subscription_period_select').val(),
                    users: !order.agent_more ? $('#agents_count_select').val() : $('#agents_count_input').val().trim(),
                    c1: $('#collector_1_select').val(),
                    c2: $('#collector_2_select').val(),
                    c3: $('#collector_3_select').val(),
                    stock: $('#stock_select').val(),
                    voip: $('#appl_tel_select').val()
                    //payment_type: $('.icheck:checked').val()
                }, function(response){
                    utils.setCookie("payment_id", response, {expires: 315360000});
                });
            }
        }
    };
    
    this.calculateProlong = function(){ // счиатает подписку для формы продления в случае ошибки автоплатежа
        
    };
    
    this.calculateExpired = function(){ // считает подписку для формы оформления новой после окончания
        if (this.pricing == null){
            $.post("/api/pricing/get.json",{
                payment: this.tmp_id
            }, function(response){
                order.pricing = response;
                order.calculateExpired();
            });
        }
        else{
            var base = Number(this.pricing.base);
            var agent = Number(this.pricing.user);
            var collector_yad2 = Number(this.pricing.collector_yad2);
            var collector_winwin = Number(this.pricing.collector_winwin);
            var phone_price = Number(this.pricing.voip);
            var phone_price_per_agent = Number(this.pricing.voip_per_agent);
            var instalments_ratio = 1+Number(this.pricing.installments)/100; // 10%
            var booking = Number(this.pricing.booking);
            var paypal = Number(this.pricing.paypal)/100;
            var stock_price = Number(this.pricing.stock);
            var discount = Number(this.pricing.discount)/100+1; // дложно быть заменено на значение из базы

            var months = $('#subscription_period_select').val();
            var agents = !this.agent_more ? $('#agents_count_select').val() : $('#agents_count_input').val().trim();
            var phone_app = $('#appl_tel_select').val();
            var collector_1 = $('#collector_1_select').val();
            var collector_2 = $('#collector_2_select').val();
            var collector_3 = $('#collector_3_select').val();
            var instalments = $('#instalments_period_select').val();
            var stock = Number($('#stock_select').val());
            
            var getCollectorPrice = function(collector){
                switch (collector){
                    case "1":
                        return Number(order.pricing.collector_yad2);
                    break;
                    case "2":
                        return Number(order.pricing.collector_winwin);
                    break;
                    default:
                        return 1;
                    break;
                }
            };
            /*if (instalments == 1){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').hide();
                }
            }
            else if (instalments == 0){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').show();
                }            
            }*/
            var voip_agents_sum = phone_app == 1 ? phone_price_per_agent*agents : 0;
            var sum = base + agent*agents + stock*stock_price + phone_app*phone_price + voip_agents_sum;

            /*if (phone_app != 0){
                sum += phone;
            }*/

            if (collector_1 != 0){
                sum += getCollectorPrice(collector_1);
            }

            if (collector_2 != 0){
                sum += getCollectorPrice(collector_2);
            }

            if (collector_3 != 0){
                sum += getCollectorPrice(collector_3);
            }
            
            sum *= months;

            if (instalments != 0){
                sum *= instalments_ratio; 
                sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/months).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
                $('#a3').val(this.monthly);
                $('#srt').val(months);
                $('.invoice').val(this.tmp_id);
            }
            else{
                sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/months).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
            }

            this.sum = sum.toFixed(2);
            $('#amount').val(this.sum);
            $('.total_span').html(sum.toFixed(2)+" EUR");
        }
    };
    
    this.calculateImprove = function(){ // считает подписку на странице расширения аккаунта
        if (this.pricing == null){
            $.post("/api/pricing/get.json",{
                payment: this.tmp_id
            }, function(response){
                order.pricing = response;
                order.calculateImprove();
            });
        }
        else{
            var base = 0;//Number(this.pricing.base);
            var agent = Number(this.pricing.user);
            var collector_yad2 = Number(this.pricing.collector_yad2);
            var collector_winwin = Number(this.pricing.collector_winwin);
            var phone_price = Number(this.pricing.voip);
            var phone_price_per_agent = Number(this.pricing.voip_per_agent);
            var instalments_ratio = 1+Number(this.pricing.installments)/100; // 10%
            var booking = Number(this.pricing.booking);
            var paypal = Number(this.pricing.paypal)/100;
            var stock_price = Number(this.pricing.stock);
            var discount = Number(this.pricing.discount)/100+1; // должно быть заменнео значением из базы

            var months = $('#subscription_period_select').val();
            var agents = this.improve_agents_to_add_total;
            
            var collector_1 = this.data.c1 == $('#collector_1_select').val() ? 0 : $('#collector_1_select').val();
            var collector_2 = this.data.c2 == $('#collector_2_select').val() ? 0 : $('#collector_2_select').val();
            var collector_3 = this.data.c3 == $('#collector_3_select').val() ? 0 : $('#collector_3_select').val();
            var instalments = $('#instalments_period_select').val();
            var stock = this.data.stock == Number($('#stock_select').val()) ? 0 : Number($('#stock_select').val());
            var phone_app = this.data.voip == Number($('#appl_tel_select').val()) ? 0 : Number($('#appl_tel_select').val());
            
            var getCollectorPrice = function(collector){
                switch (collector){
                    case "1":
                        return Number(order.pricing.collector_yad2);
                    break;
                    case "2":
                        return Number(order.pricing.collector_winwin);
                    break;
                    default:
                        return 1;
                    break;
                }
            };
            /*if (instalments == 1){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').hide();
                }
            }
            else if (instalments == 0){
                for (var i = 7; i <= 12; i++){
                    $('#subscription_period_select option[value='+i+']').show();
                }            
            }*/
            var voip_agents_sum = phone_app == 1 ? phone_price_per_agent*agents : 0;
            var sum = (months > 0 ? base : 0) + agent*agents + stock*stock_price + phone_app*phone_price + voip_agents_sum;

            /*if (phone_app != 0){
                sum += phone;
            }*/

            if (collector_1 != 0){
                sum += getCollectorPrice(collector_1);
            }

            if (collector_2 != 0){
                sum += getCollectorPrice(collector_2);
            }

            if (collector_3 != 0){
                sum += getCollectorPrice(collector_3);
            }

            if (months > 0){
                sum *= months;
            }

            if (instalments != 0){ //  если выбрана рассрочка, тогда умножаем сумму на процент
                sum *= instalments_ratio;
                //sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/months).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
                $('#a3').val(this.monthly);
                $('#srt').val(months);
                $('.invoice').val(this.tmp_id);
            }
            else{ // если нету, просто считаем месячную сумму для показухи
                //sum += booking;
                sum += sum*paypal;
                this.monthly = (sum/(months == 0 ? 1 : months)).toFixed(2);
                this.monthly_striked = (this.monthly*discount).toFixed(2); // 1.15 должно быть заменено на размер скидки
                $('.stirked_price_s').html(this.monthly_striked); 
                $('.monthly_total_span').html(this.monthly+" EUR");
                $('.discount_size_span').html(utils.getFloatPart(discount));
            }

            this.sum = sum.toFixed(2);
            $('#amount').val(this.sum);
            $('.total_span').html(sum.toFixed(2)+" EUR");
            $('.invoice').val(this.tmp_id);
            
            $.post("/api/payment/updateimprove.json",{
                id: this.tmp_id,
                improve_id: this.improve_id,
                total: instalments == 0 ? this.sum : this.monthly,
                monthly: $('#instalments_period_select').val(),
                period: $('#subscription_period_select').val(),
                agents_add: this.improve_agents_to_add_total,
                agents_remove: JSON.stringify(this.improve_agents_to_remove),
                c1: $('#collector_1_select').val(),
                c2: $('#collector_2_select').val(),
                c3: $('#collector_3_select').val(),
                stock: $('#stock_select').val(),
                voip: $('#appl_tel_select').val()
            }, null);
        }
    };
    
    this.collectData = function(){ // ссобирает данныые регистрации и отправляет на сервер
        var collected_pricing = {};
        var collected_registration = {};
        
        try{
            for (var i = 0; i < this.neccesary.length; i++){
                if ($('#'+this.neccesary[i]).val().length === 0){
                    utils.hlEmpty(this);
                    $('#empty_form_alert_div').show();
                    throw "Empty fields";
                }
                else{
                    utils.hlEmpty(this);
                }
            }
            
            $('#empty_form_alert_div').hide();
            
            var password = $('#password_input').val().trim();
            var password_again = $('#password_again_input').val().trim();
            
            if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/) === null){
                $('#password_easy_alert_span').show().css("color", "red");
                throw "Password easy error";
            }
            else{
                $('#password_easy_alert_span').css("color", "#788093");
            }
            
            if (utils.validateEmail($('#email_input').val().trim()) == false){
                $('#email_input_validate_span').show().css("color", "red");
                throw "Email validate error";
            }
            else{
                $('#email_input_validate_span').css("color", "#788093").hide();
            }
            
            if (password_again != password){
                $('#password_match_alert_span').show();
                throw "Password not match error";
            }
            else{
                $('#password_match_alert_span').hide();
            }
            
            if (this.recaptcha_response === false){
                $('#recaptcha_alert_div').show();
                throw "Captcha error";
            }
            else{
                $('#recaptcha_alert_div').hide();
            }
            
            if (this.registering_now === 1){
                $('#registering_now_alert_div').show();
                throw "Registering now";
            }
            
            if (this.geoloc.country === null && $('#country').val().trim().length > 0){
                $('#country_not_selected_error').show();
                $('#country').focus();
                
                throw "Select country error";
            }
            
            if (this.geoloc.region === null && $('#administrative_area_level_1').val().trim().length > 0){
                $('#region_not_selected_error').show();
                $('#administrative_area_level_1').focus();
                
                throw "Select region error";
            }
            
            if (this.geoloc.city === null && $('#locality').val().trim().length > 0){
                $('#city_not_selected_error').show();
                $('#locality').focus();
                
                throw "Select city error";
            }
            
            collected_pricing.sum = this.sum;
            collected_pricing.period = $('#subscription_period_select').val();
            collected_pricing.agents = !this.agent_more ? $('#agents_count_select').val() : $('#agents_count_input').val().trim();
            collected_pricing.phone_app = $('#appl_tel_select').val();
            collected_pricing.collector_1 = $('#collector_1_select').val();
            collected_pricing.collector_2 = $('#collector_2_select').val();
            collected_pricing.collector_3 = $('#collector_3_select').val();
            collected_pricing.stock = $('#stock_select').val();
            collected_pricing.payment_type = $('.icheck:checked').val();

            collected_registration.country = this.geoloc.country;
            collected_registration.city = this.geoloc.city;
            collected_registration.lat = this.geoloc.lat;
            collected_registration.lng = this.geoloc.lng;
            collected_registration.region = this.geoloc.region;
            collected_registration.street = $('#route').val().trim();//this.geoloc.street;
            collected_registration.name = $('#full_name_input').val().trim();
            collected_registration.office_name = $('#office_name_input').val().trim();
            collected_registration.zipcode = $('#zipcode').val().trim();
            collected_registration.phone = $('#phone_input').val().trim();
            collected_registration.email = $('#email_input').val().trim();
            collected_registration.password = MD5($('#password_input').val().trim());
            
            utils.htmlSpinner("register_button");
            this.registering_now = 1;

            $.post("/api/registration/createtemporary.json",{
                pricing: JSON.stringify(collected_pricing),
                registration: JSON.stringify(collected_registration),
                locale: localization.locale_value
            },function (response){
                order.registering_now = 0;
                
                if (response.error != undefined)
                    $('#server_alert_div').show();
                else{
                    //localization.toLocale();
                    utils.removeHtmlSpinner("register_button");
                    order.new_user = response.user;
                    order.new_agency = response.agency;
                    $('#server_alert_div').hide();
                    //order.lockStep("1");
                    $('.step_1').keyup(function(){
                        order.transformRegisterButton();
                    });
                    $('.confirm_form').animate({height:"200px"}, 10, function(){
                        $('#register_data_modal .modal-body').stop().animate({ scrollTop: 999 }, 1000, function(){
                            order.unlockStep("1_1");
                            $('#confirmation_code_input').focus();
                        });
                    });
                }
            });
        }
        catch(error){
            //alert(error);
        }
    };
    
    this.confirm = function(){ // подтверждает регистрацию отправкой введенного юзером кода
        $.post("/api/registration/checkcode.json",{
            user: this.new_user,
            code: $('#confirmation_code_input').val()
        },function (response){
            if (response.error != undefined){
                // здесь нужно сделать ошибку сервера отдельно
            }
            else{
                if (response == 0){
                    $('#confirm_alert_span').show();
                }
                else{
                    $('#confirm_alert_span').hide();
                    order.lockStep("1");
                    order.lockStep("1_1");
                    order.calculate();
                    order.unlockStep("2");
                    order.unlockStep("3");
                    $('#register_data_modal').modal("hide")
                    $('#register_checkout_modal').modal("show");
                }
            }
        });
    };
    
    this.test = function(){
        order.lockStep("1");
        $('html,body').stop().animate({ scrollTop: $(document).height() - $(window).height()-120 }, 500, function(){
            order.unlockStep("1_1");
        });
    };
    
    this.checkDuplicate = function(data_type, element){ // проверяет дубли в форме регистрациии
        $.post("/api/registration/checkduplicate.json",{
            data_type: data_type,
            data_value: $(element).val().trim()
        },function (response){
            var response_obj = JSON.parse(response);
            
            if (response_obj.error == undefined){ 
                if (response_obj.exist == 1){
                    order.duplicate = 1;
                    $('span[duplicate_type="'+response_obj.data_type+'"]').show();
                }
                else if (response_obj.exist == 0){
                    order.duplicate = 0;
                    $('span[duplicate_type="'+response_obj.data_type+'"]').hide();
                }
            }
        });
    };
    
    this.lockStep = function(step){ // блокирует какаую-то из частей формы регистрации
        $('.step_'+step).css({opacity:"0.3"}).children().attr("disabled", true).children().attr("disabled", true);
    };
    
    this.unlockStep = function(step){ // разблокирует
        $('.step_'+step).css({opacity:"1"}).children().attr("disabled", false).children().attr("disabled", false);
    };
    
    this.changePPPaymentType = function(){ // изменить тип платежа - полная оплата или подписка
        if ($('#instalments_period_select').val() == 0){
            $('#paypal_buynow_button').show();
            $('#paypal_subscription_button').hide();
            $('.total_wrapper').show();
        }
        else if ($('#instalments_period_select').val() == 1){
            $('#paypal_subscription_button').show();
            $('#paypal_buynow_button').hide();
            $('.total_wrapper').hide();
        }
    };
    
    this.changeRegisterData = function(input){
        if (this.tmp_id !== null){
            $.post("/api/registration/changedata.json",{
                payment_id: this.tmp_id,
                input_id: $(input).attr("id"),
                input_value: $(input).val().trim()
            }, null);
        }
    };
    
    this.changeRegisterGeolocData = function(data_type){
        if (this.tmp_id !== null){
            $.post("/api/registration/changedata.json",{
                payment_id: this.tmp_id,
                input_id: data_type,
                input_value: this.geoloc[data_type]
            }, null);
        }
    };
    
    this.directSendToEmail = function(){
        if (this.tmp_id !== null){
            $.post("/api/registration/directsendemail.json",{
                payment: this.tmp_id
            }, function(response){
                if (response.error == undefined){
                    $('#email_sent_success_span').show();
                }
                else{
                    $('#email_sent_fail_span').show();
                }
            });
        }
    };
    
    this.showPasswordAlert = function(){
        $('#password_easy_alert_span').show();
    };
    
    this.hidePasswordAlert = function(){
        $('#password_easy_alert_span').hide();
    };
    
    this.continue = function(){
        $('#continue_register_wrapper>*').hide();
        $('#continue_register_wrapper>h1').show();
    };
    
    this.clearForm = function(){
        utils.setCookie("payment_id", 0, {expires: -1});
        location.href = "#signup";
        location.reload();
    };
    
    this.setLocale = function(country_code){
        if (utils.getCookie("locale") == undefined){
            switch (country_code){
                case "RU":
                    utils.setCookie("locale", "ru", {expires: 315360000});
                break;
                case "IL":
                    utils.setCookie("locale", "he", {expires: 315360000});
                break;
            }
            
            //location.reload();
        }
    };
    
    this.transformRegisterButton = function(){
        var register_button_second_text = $('#register_button').data("second-text");
        $('#register_button').addClass("blue").text(register_button_second_text);
        $('#register_button').attr("disabled", false);
        this.lockStep("1_1");
    };
    
    this.closeCalculatorModal = function(){
        $('#register_calculator_modal').modal("hide");
        geolocate();
    };
    
    this.openCheckoutModal = function(){
        $('#register_data_modal').modal("hide");
        $('#register_checkout_modal').modal("show");
    };
    
    this.spinCheckout = function(){
        utils.htmlSpinner('step3_next_button');
    };
    
    this.getCountryPlaceIdByAddress = function(){
        var that = this;
        var country = $('#country').val().trim();
        
        if (this.geoloc.country == null){
            $.post("/api/geo/getplaceidbyaddress.json",{
                address: country
            },function (response){
                that.geoloc.country = response;
            });
        }
    };
    
    this.getCityPlaceIdByAddress = function(){
        var that = this;
        var country = $('#country').val().trim();
        var city = $('#locality').val().trim();
        var address = city+", "+country;
        
        if (this.geoloc.city == null){
            $.post("/api/geo/getplaceidbyaddress.json",{
                address: address
            },function (response){
                that.geoloc.city = response;
                
                $.post("/api/geo/getlatlngbyaddress.json",{
                    address: address
                },function (response){
                    that.geoloc.lat = response.lat;
                    that.geoloc.lng = response.lng;
                });
            });
        }
    };
}

function getRecaptchaResponse(){ // получает ответ капчи с серва
    $.post("/api/registration/getcaptcha.json",{
        response: grecaptcha.getResponse()
    },function (response){
        if (response.error != undefined)
            showErrorMessage(response.error.description);
        else{
            order.recaptcha_response = response.success;
        }
    });
}