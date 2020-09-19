function HelpTip(){ // этот класс отвечает за вывод справки к инпуту при наведении на иконку рядом
    this.inapp = false;
    
    this.init = function(){ // инициализирует все типы на странице для страницы регистрации
        $('.help_tip_subject').each(function(){
            $(this).after('<span data-toggle="tooltip" '+
                ($(this).attr("tip-placement") != undefined ? "data-placement='"+$(this).attr("tip-placement")+"'" : "")+
                ' class="help_tip" title="'+localization.getVariable($(this).attr("tip"))+'"></span>');
            help_tip.setZindex(this);
        });
        
        $('.help_tip_label_subject').each(function(){
            $(this).after('<span data-toggle="tooltip" '+
                ($(this).attr("tip-placement") != undefined ? "data-placement='"+$(this).attr("tip-placement")+"'" : "")+
                ' class="help_tip_label" title="'+localization.getVariable($(this).attr("tip"))+'"></span>');
            help_tip.setZindex(this);
        });
        
        $('.help_tip_span_subject').each(function(){
            $(this).after('<span data-toggle="tooltip" '+
                ($(this).attr("tip-placement") != undefined ? "data-placement='"+$(this).attr("tip-placement")+"'" : "")+
                ' class="help_tip_span" title="'+localization.getVariable($(this).attr("tip"))+'"></span>');
        
            if ($(this).attr("top") != undefined){
                $(this).next().css("margin-top", $(this).attr("top"));
            }
            
            if ($(this).attr("left") != undefined){
                $(this).next().css("margin-left", $(this).attr("left"));
            }
            
            help_tip.setZindex(this);
        });
        
        $('.help_tip, .help_tip_span, .help_tip_label').tooltip(); 
    };
    
    this.initInapp = function(){ // инициализирует все типы на странице внутри аппликации (отличается от предыдушего)
        this.inapp = true;
        
        $('.help_tip_subject').each(function(){
            $(this).after('<span data-toggle="tooltip" '+
                ($(this).attr("tip-placement") != undefined ? "data-placement='"+$(this).attr("tip-placement")+"'" : "")+
                ' class="help_tip" title="'+localization.getVariable($(this).attr("tip"))+'"></span>');
            
            if ($(this).hasClass("tip_slipped")){
                $(this).next().css("margin-top", "-31px");
            }
            
            help_tip.setZindex(this);
        });
        
        $('.help_tip_span_subject').each(function(){
            $(this).after('<span data-toggle="tooltip" '+
                ($(this).attr("tip-placement") != undefined ? "data-placement='"+$(this).attr("tip-placement")+"'" : "")+
                ' class="help_tip_span" title="'+localization.getVariable($(this).attr("tip"))+'"></span>');
            
            if ($(this).attr("top") != undefined){
                $(this).next().css("margin-top", $(this).attr("top"));
            }
            
            if ($(this).attr("left") != undefined){
                $(this).next().css("margin-left", $(this).attr("left"));
            }
            
            help_tip.setZindex(this);
        });
        
        $('.help_tip, .help_tip_span, .help_tip_label').tooltip(); 
    };
    
    this.remove = function(parent_id){
        if ($('#'+parent_id).next().attr("class") == "help_tip_span"){
            $('#'+parent_id).next().remove();
        }
    };
    
    this.add = function(parent_id){
        var parent = $('#'+parent_id);
        
        if (this.inapp){
            if (utils.stringContains(parent.attr("class"), "help_tip_subject")){
                parent.after('<span data-toggle="tooltip" '+(parent.attr("tip-placement") != undefined ? "data-placement='"+parent.attr("tip-placement")+"'" : "")+' class="help_tip" title="'+localization.getVariable(parent.attr("tip"))+'"></span>');

                if (parent.hasClass("tip_slipped")){
                    parent.next().css("margin-top", "-31px");
                }
            }
            else if (utils.stringContains(parent.attr("class"), "help_tip_span_subject")){
                parent.after('<span data-toggle="tooltip" '+(parent.attr("tip-placement") != undefined ? "data-placement='"+parent.attr("tip-placement")+"'" : "")+' class="help_tip_span" title="'+localization.getVariable(parent.attr("tip"))+'"></span>');
            }
        }
        else{
            
        }
        
        parent.next().tooltip();
    };
    
    this.setZindex = function(tip){
        if ($(tip).attr("zindex") != undefined){
            $(tip).next().css("z-index", $(tip).attr("zindex"));
        }
    };
}