function Contact(){
    this.errors = 0;
    
    this.sendMessage = function(){
        if (!this.isCredentialsEmpty()){
            utils.htmlSpinner("send_message_button");
            
            $.post("/api/contact/send.json",{
                email: $('#contact_email_input').val().trim(),
                subject: $('#contact_form .icheck:checked').val(),
                message: $('#message_textarea').val().trim(),
                locale: localization.locale_value,
                username: user.name
            },function (response){
                utils.removeHtmlSpinner("send_message_button");
                
                if (response.error != undefined || response == false){
                    showErrorMessage(response.error.message);
                }
                else if (response == true){
                    $('#contact_form').hide();
                    $('#send_message_button').hide();
                    $('#response_div').show();
                }
            });
        }
    };
    
    this.isCredentialsEmpty = function(){
        this.errors = 0;
        
        if ($('#contact_email_input').val().length === 0){
           this.errors++;
           this.highlightField($('#contact_email_input'));
        }
        
        if ($('#message_textarea').val().length === 0){
           this.errors++;
           this.highlightField($('#message_textarea'));
        }
        
        return this.errors;
     };
   
    this.highlightField = function(field){
        field.css({background:"#c6123d"});
        field.animate({backgroundColor: "rgba(255,255,255,1)"}, 1000);
    };
}