function OrderExpired(){ // объект заказа новой подписки после окончания старой
    this.was_changed = 0;
    this.agents_list = null; // список агентов, полученный с сервера
    this.agents = null;
    this.agents_to_remove = []; // массив агентов для удаления
    this.agents_to_add = 0;
    this.agents_to_add_total = 0;
    // остальные параметры подписки:
    
    this.openAddAgentsDialog = function(){
        $('#add_expired_agents_modal').modal("show");
    };
    
    this.openRemoveAgentsDialog = function(){
        this.getAgentsList();
        $('#remove_agents_modal').modal("show");
    };
    
    this.removeAgent = function(agent_id){
        this.was_changed = 1;
        this.agents_to_remove.push(agent_id);
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
                    orderexp.agents_list = response;
                    $('#edit_agents_table tbody').html("");

                    for (var i = 0; i < response.length; i++){
                        $('#edit_agents_table tbody').append('<tr agentid="'+response[i].id+'"><td width="100%">'+response[i].name+'</td><td><button style="" locale="remove" class="btn btn-default small_button" onclick="orderexp.removeAgent('+response[i].id+')" type="button" title="">Remove</button></td></tr>');
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
                $('#edit_agents_table tbody').append('<tr agentid="'+this.agents_list[i].id+'"><td width="100%">'+this.agents_list[i].name+'</td><td><button style="" locale="remove" class="btn btn-default small_button" onclick="orderexp.removeAgent('+this.agents_list[i].id+')" type="button" title="">Remove</button></td></tr>');
            }

            localization.toLocale();
        }
    };
    
    this.updateAgentsCount = function(){
        $('#agents_count_span').text(this.agents);
        this.calculate();
        //this.calculateImprove();
    };
    
    this.addAgents = function(){
        this.was_changed = 1;
        this.agents_to_add = Number($('#add_expired_agents_count_select').val());
        this.agents += this.agents_to_add; 
        this.agents_to_add_total += this.agents_to_add; 
        $('#add_expired_agents_modal').modal("hide");
        this.updateAgentsCount();
        //showSuccess("Agents successfully added!");
    };
    
    this.calculate = function(){ // считает подписку для формы оформления новой после окончания
        if (order.pricing == null){
            $.post("/api/pricing/get.json",{
                payment: this.tmp_id
            }, function(response){
                order.pricing = response;
                orderexp.calculate();
            });
        }
        else{
            var base = Number(order.pricing.base);
            var agent = Number(order.pricing.user);
            var collector_yad2 = Number(order.pricing.collector_yad2);
            var collector_winwin = Number(order.pricing.collector_winwin);
            var phone = Number(order.pricing.voip);
            var instalments_ratio = 1+Number(order.pricing.installments)/100; // 10%
            var booking = Number(order.pricing.booking);
            var paypal = Number(order.pricing.paypal)/100;
            var stock_price = Number(order.pricing.stock);

            var months = $('#subscription_period_select').val();
            var agents = this.agents;//this.agents+this.agents_to_add_total-this.agents_to_remove.length;//$('#agents_count_select:visible').length > 0 ? $('#agents_count_select').val() : $('#agents_count_input').val().trim();
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

            var sum = base+agent*agents+stock*stock_price;

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
                order.monthly = (sum/months).toFixed(2);
                $('.monthly_total_span').html(order.monthly+" EUR");
                $('#a3').val(order.monthly);
                $('#srt').val(months);
                $('.invoice').val(order.tmp_id);
            }
            else{
                sum += booking;
                sum += sum*paypal;
                order.monthly = (sum/months).toFixed(2);
                $('.monthly_total_span').html(order.monthly+" EUR");
            }

            order.sum = sum.toFixed(2);
            $('#amount').val(order.sum);
            $('#total_span').html(sum.toFixed(2)+" EUR");
        }
    };
    
    this.save = function(){        
        $.post("/api/payment/updateexpired.json",{
            id: order.tmp_id,
            total: $('#instalments_period_select').val() == 0 ? order.sum : order.monthly,
            monthly: $('#instalments_period_select').val(),
            period: $('#subscription_period_select').val(),
            agents_add: this.agents_to_add_total,
            agents_remove: JSON.stringify(this.agents_to_remove),
            c1: $('#collector_1_select').val(),
            c2: $('#collector_2_select').val(),
            c3: $('#collector_3_select').val(),
            stock: $('#stock_select').val()
        }, null);
    };
}