function ExternalInputSII(){ // отвечает за работу панели ввода периодических данных, SII = Select + Input + Input
    this.current_id = null;
    this.current_input = null;
    this.current = null;
    
    this.show = function(input){
        if (this.current_input != null && $(input).attr("id") != this.current_input.id){
            this.current.hide();            
        }
        
        exinput_ii.hide();
        exinput_ss.hide();
        
        this.current_id = $(input).attr("exinput");
        this.current_input = $(input);
        this.current = $('#'+this.current_id);
        this.current.css({top: this.current_input.offset().top+this.current_input.outerHeight()-116, left: this.current_input.offset().left-parseInt($('.main-content-wrapper').css('marginLeft'), 10)}).show();
    };
    
    this.hide = function(){
        if ($('.external_input:visible').length > 0){
            $('.external_input').hide();
            this.change();
            this.parseCurrent();
        }
    };
    
    this.change = function(){
        var first_input_val = this.current.children('input').first().val().trim();
        var last_input_val = this.current.children('input').last().val().trim();
        
        var first_no_commas = Number(utils.numberRemoveCommasOnly(first_input_val));
        var last_no_commas = Number(utils.numberRemoveCommasOnly(last_input_val));
        
        if (first_no_commas > last_no_commas && last_no_commas > 0){
            this.current.children('input').first().val(last_input_val);
            this.current.children('input').last().val(first_input_val);
        }
    };
    
    this.parseCurrent = function(){
        var select_val = this.current.children('select').children('option:selected').text();
        var first_input_val = this.current.children('input').first().val().trim();
        var last_input_val = this.current.children('input').last().val().trim();
        
        if (first_input_val.length > 0 && last_input_val.length > 0){ 
            this.current_input.val(first_input_val+" - "+last_input_val+" "+select_val);
        }
        else if (first_input_val.length === 0 && last_input_val.length > 0){
            this.current_input.val("0 - "+last_input_val+" "+select_val);
        }
        else if (last_input_val.length === 0 && first_input_val.length > 0){
            this.current_input.val(first_input_val+" - ∞ "+select_val);
        }
        if (first_input_val.length == 0 && last_input_val.length == 0){ 
            this.current_input.val("");
        }
    };
    
    this.parseAll = function(){
        $('.external_input').each(function(){
            var select_val = $(this).children('select').children('option:selected').text();
            var first_input_val = $(this).children('input').first().val().trim();
            var last_input_val = $(this).children('input').last().val().trim();

            if (first_input_val.length > 0 && last_input_val.length > 0){ 
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - "+last_input_val+" "+select_val);
            }
            else if (first_input_val.length === 0 && last_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val("0 - "+last_input_val+" "+select_val);
            }
            else if (last_input_val.length === 0 && first_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - ∞ "+select_val);
            }
        });
    };
    
    this.syncCurrent = function(){
        var splitted = this.current_input.val().trim().match(/(\d+\,*)+|[a-z]{3}/gi); // /\d+|[^\s]\D{2}/gi - для русского
        var first_input_len =  this.current.children('input').first().attr("maxlength");
        var last_input_len =  this.current.children('input').last().attr("maxlength");
        
        if (splitted != null && splitted.length === 1){
            if (/^(\d+\,*\d+)*$/gi.test(splitted[0]) === true){ // if number
                this.current.children('input').first().val(splitted[0].length <= first_input_len ? splitted[0] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[0]) === true){ // if string
                this.findOption(splitted[0]);
            }
            
            this.current.children('input').last().val(""); 
        }
        else if (splitted != null && splitted.length === 2){
            if (/^(\d+\,*\d+)*$/gi.test(splitted[0]) === true){ // if number
                this.current.children('input').first().val(splitted[0].length <= first_input_len ? splitted[0] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[0]) === true){ // if string
                this.findOption(splitted[0]);
            }
            
            if (/^(\d+\,*\d+)*$/gi.test(splitted[1]) === true){ // if number
                this.current.children('input').last().val(splitted[1].length <= last_input_len ? splitted[1] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[1]) === true){ // if string
                this.findOption(splitted[1]);
            }
        }
        if (splitted != null && splitted.length === 3){
            if (/^(\d+\,*\d+)*$/gi.test(splitted[0]) === true){ // if number
                this.current.children('input').first().val(splitted[0].length <= first_input_len ? splitted[0] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[0]) === true){ // if string
                this.findOption(splitted[0]);
            }
            
            if (/^(\d+\,*\d+)*$/gi.test(splitted[1]) === true){ // if number
                this.current.children('input').last().val(splitted[1].length <= last_input_len ? splitted[1] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[1]) === true){ // if string
                this.findOption(splitted[1]);
            }
            
            if (/^(\d+\,*\d+)*$/gi.test(splitted[2]) === true){ // if number
                this.current.children('input').first().val(splitted[2].length <= first_input_len ? splitted[2] : "");
            }
            else if (/^(\D+)$/gi.test(splitted[2]) === true){ // if string
                this.findOption(splitted[2]);
            }
        }
        else if (splitted == null){
            this.current.children('input').first().val("");
            this.current.children('input').last().val("");
        }
    };
    
    this.findOption = function(value){
        var select = this.current.children('select');
        
        for (var i = 0; i < select.children('option').length; i++){
            if (value.toUpperCase() == $(select.children('option')[i]).text()){
                select.val($(select.children('option')[i]).val());
            }
        }
    };
}

//################################ for input + input ##################################//

function ExternalInputII(){ // отвечает за работу панели ввода периодических данных, II = Input + Input
    this.current_id = null;
    this.current_input = null;
    this.current = null;
    
    this.show = function(input){
        if (this.current_input != null && $(input).attr("id") != this.current_input.id){
            this.current.hide();            
        }
        
        exinput_sii.hide();
        exinput_ss.hide();
        
        this.current_id = $(input).attr("exinput");
        this.current_input = $(input);
        this.current = $('#'+this.current_id);
        this.current.css({top: this.current_input.offset().top+this.current_input.outerHeight()-116, left: this.current_input.offset().left-parseInt($('.main-content-wrapper').css('marginLeft'), 10)}).show();
    };
    
    this.hide = function(){
        if ($('.external_input_ii:visible').length > 0){
            $('.external_input_ii').hide();
            this.change();
            this.parseCurrent();
            search.lightNotEmpty();
        }
    };
    
    this.change = function(){
        if (this.current.children('input').first().data("type") == "date"){
            var first_input_val = this.current.children('input').first().val().trim();
            var last_input_val = this.current.children('input').last().val().trim();

            var first_no_commas = this.current.children('input').first().datepicker("getDate")/1000;
            var last_no_commas = this.current.children('input').last().datepicker("getDate")/1000;

            if (first_no_commas > last_no_commas && last_no_commas > 0){
                this.current.children('input').first().val(last_input_val);
                this.current.children('input').last().val(first_input_val);
            }
        }
        else{
            var first_input_val = this.current.children('input').first().val().trim();
            var last_input_val = this.current.children('input').last().val().trim();

            var first_no_commas = Number(utils.numberRemoveCommasOnly(first_input_val));
            var last_no_commas = Number(utils.numberRemoveCommasOnly(last_input_val));

            if (first_no_commas > last_no_commas && last_no_commas > 0){
                this.current.children('input').first().val(last_input_val);
                this.current.children('input').last().val(first_input_val);
            }
        }
    };
    
    this.parseCurrent = function(){
        var first_input_val = this.current.children('input').first().val().trim();
        var last_input_val = this.current.children('input').last().val().trim();
        
        if (first_input_val.length > 0 && last_input_val.length > 0){ 
            this.current_input.val(first_input_val+" - "+last_input_val);
        }
        else if (first_input_val.length === 0 && last_input_val.length > 0){
            this.current_input.val("0 - "+last_input_val);
        }
        else if (last_input_val.length === 0 && first_input_val.length > 0){
            this.current_input.val(first_input_val+" - ∞");
        }
        if (first_input_val.length == 0 && last_input_val.length == 0){ 
            this.current_input.val("");
        }
    };
    
    this.parseAll = function(){
        $('.external_input_ii').each(function(){
            var first_input_val = $(this).children('input').first().val().trim();
            var last_input_val = $(this).children('input').last().val().trim();

            if (first_input_val.length > 0 && last_input_val.length > 0){ 
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - "+last_input_val);
            }
            else if (first_input_val.length === 0 && last_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val("0 - "+last_input_val);
            }
            else if (last_input_val.length === 0 && first_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - ∞");
            }
        });
    };
    
    this.syncCurrent = function(type){ // type: 1 = numbers, 2 = dates
        var first_input_len =  this.current.children('input').first().attr("maxlength");
        var last_input_len =  this.current.children('input').last().attr("maxlength");
        
        if (type === 1){
            var splitted = this.current_input.val().trim().match(/(\d+\.*)+/gi);
        }
        else if (type === 2){
            var splitted = this.current_input.val().trim().match(/\d{2}\/\d{2}\/\d{4}/gi);
        }
        
        if (splitted != null && splitted.length === 1){
            this.current.children('input').first().val(splitted[0].length <= first_input_len ? splitted[0] : "");
            this.current.children('input').last().val(""); 
        }
        else if (splitted != null && splitted.length === 2){
            this.current.children('input').first().val(splitted[0].length <= first_input_len ? splitted[0] : "");
            this.current.children('input').last().val(splitted[1].length <= last_input_len ? splitted[1] : "");
        }
        else if (splitted == null){
            this.current.children('input').first().val("");
            this.current.children('input').last().val("");
        }
    };
}

//################################ for select + select ##################################//

function ExternalInputSS(){ // отвечает за работу панели ввода периодических данных, SS = Select + Select
    this.current_id = null;
    this.current_input = null;
    this.current = null;
    
    this.show = function(input){
        if (this.current_input != null && $(input).attr("id") != this.current_input.id){
            this.current.hide();
        }
        
        exinput_ii.hide();
        exinput_sii.hide();
        
        this.current_id = $(input).attr("exinput");
        this.current_input = $(input);
        this.current = $('#'+this.current_id);
        this.current.css({top: this.current_input.offset().top+this.current_input.outerHeight()-116, left: this.current_input.offset().left-parseInt($('.main-content-wrapper').css('marginLeft'), 10)}).show();
    };
    
    this.hide = function(){
        if ($('.external_input_ss:visible').length > 0){
            $('.external_input_ss').hide();
            this.change();
            this.parseCurrent();
        }
    };
    
    this.change = function(){
        var first_input_val = this.current.children('select').first().children('option:selected').text().trim();
        var last_input_val = this.current.children('select').last().children('option:selected').text().trim();
        
        var first_no_commas = Number(utils.numberRemoveCommasOnly(first_input_val));
        var last_no_commas = Number(utils.numberRemoveCommasOnly(last_input_val));
        
        if (first_no_commas > last_no_commas && last_no_commas > 0){
            this.current.children('select').first().val(last_input_val);
            this.current.children('select').last().val(first_input_val);
        }
    };
    
    this.parseCurrent = function(){
        var first_input_val = this.current.children('select').first().children('option:selected').text().trim();
        var last_input_val = this.current.children('select').last().children('option:selected').text().trim();
        
        if (first_input_val.length > 0 && last_input_val.length > 0){ 
            this.current_input.val(first_input_val+" - "+last_input_val);
        }
        else if (first_input_val.length === 0 && last_input_val.length > 0){
            this.current_input.val("0 - "+last_input_val);
        }
        else if (last_input_val.length === 0 && first_input_val.length > 0){
            this.current_input.val(first_input_val+" - ∞");
        }
        if (first_input_val.length == 0 && last_input_val.length == 0){ 
            this.current_input.val("");
        }
    };
    
    this.parseAll = function(){
        $('.external_input_ss').each(function(){
            var first_input_val = $(this).children('select').first().children('option:selected').text().trim();
            var last_input_val = $(this).children('select').last().children('option:selected').text().trim();

            if (first_input_val.length > 0 && last_input_val.length > 0){ 
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - "+last_input_val);
            }
            else if (first_input_val.length === 0 && last_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val("0 - "+last_input_val);
            }
            else if (last_input_val.length === 0 && first_input_val.length > 0){
                $('#'+$(this).attr("id")+'_input').val(first_input_val+" - ∞");
            }
        });
    };
    
    this.syncCurrent = function(){
        var splitted = this.current_input.val().trim().match(/\d+|\w+/gi);
        
        if (splitted != null && splitted.length === 1){
            this.findOptionFirst(splitted[0]);
            this.current.children('select').last().val(""); 
        }
        else if (splitted != null && splitted.length === 2){
            this.findOptionFirst(splitted[0]);
            this.findOptionLast(splitted[1]);
        }
        else if (splitted == null){
            this.current.children('select').first().val("");
            this.current.children('select').last().val("");
        }
    };
    
    this.findOptionFirst = function(value){
        var select = this.current.children('select').first();
        
        for (var i = 0; i < select.children('option').length; i++){
            if (value.toUpperCase() == $(select.children('option')[i]).text()){
                select.val($(select.children('option')[i]).val());
            }
        }
    };
    
    this.findOptionLast = function(value){
        var select = this.current.children('select').last();
        
        for (var i = 0; i < select.children('option').length; i++){
            if (value.toUpperCase() == $(select.children('option')[i]).text()){
                select.val($(select.children('option')[i]).val());
            }
        }
    };
}