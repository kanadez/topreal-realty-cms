function Quotes(){
    this.opened = 0;
    this.selected = [];
    this.page = 0;
    this.editing = 0;
    
    this.init = function(){
        /*$.post("/api/quotes/get.json", {}, function (response){
            for (var i = 0; i < response.length; i++){
                $('#quotes_table #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
                $('#quotes_table_2 #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
                $('#quotes_table_3 #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
            }
        });*/
        var response = global_data.quotes_get;
        
        for (var i = 0; i < response.length; i++){
                $('#quotes_table #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
                $('#quotes_table_2 #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
                $('#quotes_table_3 #td'+response[i].cell).html('<input id="quote'+response[i].id+'" value="'+response[i].data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response[i].id+'" class="quote_label">'+response[i].data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response[i].id+')"><i class="fa fa-pencil"></i></a>' : ""));
            }
    };
    
    this.open = function(){
        $('#add_quote_button, #back_quote_button, #forward_quote_button').show();
        $('#quote_button, #quotes_title_span, #quotes_help_tip_span+span').hide();
        $('#quotes_table').show().animate({opacity: "1"}, 200, function(){
            //$('#quote_button').attr({locale: "cancel", onclick: "quotes.close()"});
            //localization.toLocale();
        });
    };
    
    this.close = function(){
        $('#add_quote_button, #back_quote_button, #forward_quote_button').hide();
        $('#quote_button, #quotes_title_span, #quotes_help_tip_span+span').show();
        $('#quotes_help_tip_span+span').css("display", "inline");
        $('#quotes_table, #quotes_table_2, #quotes_table_3').animate({opacity: "0"}, 200, function(){
            //$('#quote_button').attr({locale: "quotes", onclick: "quotes.open()"});
            //localization.toLocale();
            $('#quotes_table, #quotes_table_2, #quotes_table_3').hide();
        });
    };
    
    this.check = function(){
        this.removeInput();
        
        if ($('.quote_checkbox:checked').length == 0){
            $('#add_quote_button').attr({locale: "cancel", onclick: "quotes.close()"}).text(localization.getVariable("cancel"));
        }
        else{
            $('#add_quote_button').attr({locale: "add_button", onclick: "quotes.insert()"}).text(localization.getVariable("add_button"));
        }
    };
    
    this.insert = function(){
        this.removeInput();
        
        document.getElementById("remarks_area").value += "\n";
        
        $('.quote_checkbox:checked').each(function(){
            document.getElementById("remarks_area").value += $(this).val()+" ";
        });
        
        property.onRemarksChange(null, "remarks_text");
        this.close();
    };
    
    this.addInput = function(span){
        if (user.type != 0 && user.type != 2){
            utils.errorModal("<span locale='quote_add_error'>Only agency host is able to add quotes.</span>");
            
            return 0;
        }
        
        this.removeInput();
        $(span).parent().html('<input id="new_quote_input" locale_placeholder="type_n_press_enter" maxlength="100" onkeypress="return quotes.addQuote(event)" placeholder="'+localization.getVariable("type_n_press_enter")+'" />').css("text-align", "center");
        $('#new_quote_input').focus();
    };
    
    this.removeInput = function(){
        if ($('#new_quote_input').length > 0){
            $('#new_quote_input').parent().html('<span locale="add_quote" onclick="quotes.addInput(this)">'+localization.getVariable("add_quote")+'</span>');
        }
    };
    
    this.addQuote = function(e){
        if (e.keyCode == 13 && $('#new_quote_input').val().trim().length > 0){
            $.post("/api/quotes/add.json", {
                cell: $('#new_quote_input').parent().attr("cell"),
                data: $('#new_quote_input').val().trim()
            }, function (response){
                $('#new_quote_input').parent()
                    .html('<input id="quote'+response.id+'" value="'+response.data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response.id+'" class="quote_label">'+response.data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response.id+')"><i class="fa fa-pencil"></i></a>' : ""))
                    .css("text-align", "left");
            });
            
            return false;
        }
    };
    
    this.back = function(){
        if (this.page === 1){
            this.page = 0;
            $('#quotes_table').show().animate({opacity: 1}, 200);
            $('#quotes_table_2').hide().animate({opacity: 0}, 50);
            $('#back_quote_button').attr("disabled", true).addClass("quotes_disabled_button");
            $('#forward_quote_button').attr("disabled", false).removeClass("quotes_disabled_button");
        }
        else if (this.page === 2){
            this.page = 1;
            $('#quotes_table_2').show().animate({opacity: 1}, 200);
            $('#quotes_table_3').hide().animate({opacity: 0}, 50);
            //$('#back_quote_button').attr("disabled", true);
            $('#forward_quote_button').attr("disabled", false).removeClass("quotes_disabled_button");
        }
    };
    
    this.forward = function(){
        if (this.page === 0){
            this.page = 1;
            $('#quotes_table').hide().animate({opacity: 0}, 50);
            $('#quotes_table_2').show().animate({opacity: 1}, 200);
            $('#back_quote_button').attr("disabled", false).removeClass("quotes_disabled_button");
            //$('#forward_quote_button').attr("disabled", true);
        }
        else if (this.page === 1){
            this.page = 2;
            $('#quotes_table_2').hide().animate({opacity: 0}, 50);
            $('#quotes_table_3').show().animate({opacity: 1}, 200);
            //$('#back_quote_button').attr("disabled", false);
            $('#forward_quote_button').attr("disabled", true).addClass("quotes_disabled_button");
        }
    };
    
    this.edit = function(id){
        var td = $('#quote'+id).parent();
        var data = td.children("label").text();
        
        if (this.editing === 0){
            this.editing = 1;
            td.html('<input id="edit_quote_input" quote_id="'+id+'" value="'+data+'" locale_placeholder="type_n_press_enter" maxlength="100" onkeypress="return quotes.saveQuote(event)" placeholder="'+localization.getVariable("type_n_press_enter")+'" /><a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.saveQuoteByButton()"><i class="fa fa-floppy-o"></i></a>').css("text-align", "center");
            $('#edit_quote_input').focus();
        }
    };
    
    this.saveQuote = function(e){
        if (e.keyCode == 13){
            $.post("/api/quotes/save.json", {
                id: $('#edit_quote_input').attr("quote_id"),
                data: $('#edit_quote_input').val().trim()
            }, function (response){
                if (response == -1){
                    $('#edit_quote_input').parent()
                        .html('<span locale="add_quote" onclick="quotes.addInput(this)">'+localization.getVariable("add_quote")+'</span>')
                        .css("text-align", "center");
                }
                else{
                    $('#edit_quote_input').parent()
                        .html('<input id="quote'+response.id+'" value="'+response.data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response.id+'" class="quote_label">'+response.data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response.id+')"><i class="fa fa-pencil"></i></a>' : ""))
                        .css("text-align", "left");
                }   

                quotes.editing = 0;
            });
            
            return false;
        }
    };
    
    this.saveQuoteByButton = function(){
        $.post("/api/quotes/save.json", {
            id: $('#edit_quote_input').attr("quote_id"),
            data: $('#edit_quote_input').val().trim()
        }, function (response){
            if (response == -1){
                $('#edit_quote_input').parent()
                    .html('<span locale="add_quote" onclick="quotes.addInput(this)">'+localization.getVariable("add_quote")+'</span>')
                    .css("text-align", "center");
            }
            else{
                $('#edit_quote_input').parent()
                    .html('<input id="quote'+response.id+'" value="'+response.data+'" onchange="quotes.check()" class="quote_checkbox" type="checkbox" /><label for="quote'+response.id+'" class="quote_label">'+response.data+'</label>'+(user.type == 0 || user.type == 2 ? '<a class="quote_edit_a" href="javascript:void(0)" onclick="quotes.edit('+response.id+')"><i class="fa fa-pencil"></i></a>' : ""))
                    .css("text-align", "left");
            }   

            quotes.editing = 0;
        });

        return false;
    };
}