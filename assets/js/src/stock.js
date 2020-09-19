function Stock(){ // объект для работы со стоком
    this.setDefaults = function(){ // функция которая зависимо от дифолта устанавливает кнопку стока в шапке в нужное положение
        /*$.post("/api/defaults/getstock.json",{
        },function (response){
            stock.default = response;
            stock.toggleHeaderButton(response);
        });*/
        
        stock.default = global_data.defaults_getstock;
        stock.toggleHeaderButton(global_data.defaults_getstock);
    };
    
    this.toggleHeaderButton = function(flag){ // функция которая устанавливает кнопку стока в шапке в нужное положение
        if (flag == 0){
            $('#stock_a span').removeClass("stock-icon-white").addClass("not_stock-icon-white");
            $('#stock_a').attr("href", "#turn_on_stock_modal");
        }
        else{
            $('#stock_a span').removeClass("not_stock-icon-white").addClass("stock-icon-white");
            $('#stock_a').attr("href", "#turn_off_stock_modal");
        }
        
        this.init();
    };
    
    this.toggle = function(value){ // перекключатель стока
        $.post("/api/search/togglestock.json",{
            value: value
        }, function(response){
            if (response.error == undefined){
                $('#turn_on_stock_modal, #turn_off_stock_modal').modal("hide");
                
                if (response == 1){
                    utils.successModal("Stock successfully turned on!");
                }
                else{
                    utils.successModal("Stock successfully turned off!");
                }
                
                stock.toggleHeaderButton(response);
            }
        });
        
        localization.toLocale(); 
    };
    
    this.init = function(){ // инициализация
        /*$.post("/api/stock/checkpayed.json", null, function(response){ // читает оплачен сток или нет. елси оплачен, блокирует все кнопки управления        
            if (response == 0){
                $('#stock_a').css({opacity: 0.3, cursor: "default"}).attr("href", "");
                
                if (location.pathname == "/query"){
                    $('#stock_check').iCheck("disable");
                }
            }
            else{
                $('#turn_on_stock_label').removeClass("help_tip_label_subject");
                    
                if ($('#turn_on_stock_label').next().length > 0){
                    $('#turn_on_stock_label').next().remove();
                }
            }
        });*/
        
        var response = global_data.stock_checkpayed;
        
        if (response == 0){
            $('#stock_a').css({opacity: 0.3, cursor: "default"}).attr("href", "");

            if (location.pathname == "/query"){
                $('#stock_check').iCheck("disable");
            }
        }
        else{
            $('#turn_on_stock_label').removeClass("help_tip_label_subject");

            if ($('#turn_on_stock_label').next().length > 0){
                $('#turn_on_stock_label').next().remove();
            }
        }
    };
}