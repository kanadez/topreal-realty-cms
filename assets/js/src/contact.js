var login = new login();
var utils = new Utils();
var localization = new Localization();
var contact = new Contact();
var frontend = function() {
    $(function() {
        //stickyNav();
        //oneNav();
        wow();
        parallax();
        carousel();
        
        localization.init();
        
        /*$.post("/api/defaults/getlocale.json",{
        },function (response){
            if (response == -1){
                localization.getLocale(-1);
            }
            else{
                localization.setLocale(response);
            }
        });*/
        
        $(".signin").click(function(e) {
            e.preventDefault();
            $("fieldset#signin_menu").toggle();
            $(".signin").toggleClass("menu-open");
        });

        $("fieldset#signin_menu").mouseup(function() {
            return false
        });
        $(document).mouseup(function(e) {
            if($(e.target).parent("a.signin").length==0) {
                $(".signin").removeClass("menu-open");
                $("fieldset#signin_menu").hide();
            }
        });
        
        $('#trynow_a').click(function(){
            $.post("/api/login/getkey.json",{
                email: "guest",
                password: MD5("guest")
            },function (response){
                if (response.error != undefined)
                    $('#error_41').show().text(response.error.description);
                else
                    location.href = "/query";
            });
        });
        
        $('input.icheck').iCheck({
            checkboxClass: 'icheckbox_flat-grey',
            radioClass: 'iradio_flat-grey'
        });

    });


    var stickyNav = function() {
        $(".navbar").sticky({
            topSpacing: 0
        });

    };

    var oneNav = function() {
        $("#main-menu").onePageNav({
            currentClass: "active",
            changeHash: !1,
            scrollThreshold: .5,
            scrollSpeed: 750,
            scrollOffset: 40,
            filter: "",
            easing: "swing"
        });

    };

    var wow = function() {
        new WOW().init();
    }

    //.parallax(xPosition, speedFactor, outerHeight) options:
    //xPosition - Horizontal position of the element
    //inertia - speed to move relative to vertical scroll. Example: 0.1 is one tenth the speed of scrolling, 2 is twice the speed of scrolling
    //outerHeight (true/false) - Whether or not jQuery should use it's outerHeight option to determine when a section is in the viewport
    var parallax = function() {
        $('#testimonials').parallax("50%", 0.3);
    }

    var carousel = function() {
        var owl = $("#testimonial-wrapper");
        owl.owlCarousel({
            navigation: false, // Show next and prev buttons
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            items: 1,
            loop: true,
            autoplay: true,
            autoplayTimeout: 1500,
            autoplayHoverPause: true
        });
    }


    //return functions
    return {

    };
}();

function login(){
    this.errors = 0;
    
    this.do = function(){
        if (!this.isCredentialsEmpty()){
            $('#login_spinner_i').css("opacity", 1);
            
            $.post("/api/login/getkey.json",{
                email: $('#email').val(),
                password: MD5($('#password').val())
            },function (response){
                $('#login_spinner_i').css("opacity", 0);
                
                if (response.error != undefined){
                    $('#error_41').show().attr("locale", response.error.description);
                }
                else{
                    location.href = "query";
                }
                
                localization.toLocale();
            });
        }
    };
    
    this.onEnterEvent = function(e){
        e = e || window.event;

        if (e.keyCode === 13) {
            login.do();
        }

        return false;
    };
    
    this.isCredentialsEmpty = function(){
        this.errors = 0;
        
        if ($('#email').val().length === 0){
           this.errors++;
           this.highlightField($('#email'));
        }
        
        if ($('#password').val().length === 0){
           this.errors++;
           this.highlightField($('#password'));
        }

        return this.errors;
     };
   
    this.highlightField = function(field){
        field.css({background:"#c6123d"});
        field.animate({backgroundColor: "rgba(0,0,0,0)"}, 1000);
    };
}

function Contact(){
    this.errors = 0;
    
    this.sendMessage = function(){
        if (!this.isCredentialsEmpty()){
            utils.htmlSpinner("send_message_button");
            
            $.post("/api/contact/send.json",{
                email: $('#contact_email_input').val().trim(),
                subject: $('.icheck:checked').val(),
                message: $('#message_textarea').val().trim(),
                locale: localization.locale_value,
                username: -1
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