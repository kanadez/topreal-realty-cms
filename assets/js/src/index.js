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
        
        if (location.hash == "#contact"){
            openContactModal();
        }       
        
        localization.init();
        
        $.post("/api/defaults/getlocale.json",{
        },function (response){
            /*if (response == -1){
                localization.getLocale(-1);
            }
            else{
                localization.setLocale(response);
            }*/
            
            if (location.pathname == "/support"){
                localizeSupport(response);
            }
        });
        
        if ($('.signin').length > 0){
            $('#container').css("right", $(document).width()-$('.signin').offset().left-244+"px");
            $(".signin").click(function(e) {
                e.preventDefault();
                $("fieldset#signin_menu").toggle();
                $(".signin").toggleClass("menu-open");
            });

            $("fieldset#signin_menu").mouseup(function() {
                return false
            });
        }
        
        $('#trynow_a, #try_now_top_button').click(function(){
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
        
        /*$('input.icheck').iCheck({
            checkboxClass: 'icheckbox_flat-grey',
            radioClass: 'iradio_flat-grey'
        });*/

        $('.changeprice').dblclick(function(){
            var price_value = $('#a3').val();
            
            if ($('#instalments_period_select').val() == 0){
                price_value = $('#amount').val();
            }
            
            $('#change_price_modal input.price').val(price_value);
            $('#change_price_modal').modal("show");            
        });
        
        $('#change_price_modal button.change').click(function(){
            var price = $('#change_price_modal input.price').val().trim();
            var password = $('#change_price_modal input.password').val().trim();
            var fullprice = $('#instalments_period_select').val() == 0;
            
            if (price.length > 0 && password.length > 0){
                $.post("/api/registration/changeprice.json",{
                    order_id: order.tmp_id,
                    password: password,
                    price: price
                },function (response){
                    if (response.error != undefined){
                        $('#change_price_modal .fail').show();
                        $('#change_price_modal .success').hide();
                    }
                    else{
                        $('#change_price_modal .fail').hide();
                        $('#change_price_modal .success').show();
                        
                        if (fullprice){
                            $('#amount').val(price);
                            $('.total_span').text(price);
                        }
                        else{
                            $('#a3').val(price);
                            $('.monthly_total_span').text(price);
                        }
                    }
                });
            }
        });
    });
    
    var localizeSupport = function(locale){
        if (locale == "en"){
            location.href = "http://topreal.top/storage/Help-eng.pdf";
        }
        else if (locale == "he"){
            location.href = "http://topreal.top/storage/Help-heb.pdf";
        }
        else{
            location.href = "http://topreal.top/storage/Help-eng.pdf";
        }
    };


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
                
                if (response.error != undefined)
                    $('#error_41').show().attr("locale", response.error.description);
                else
                    location.href = "query";
                
                localization.toLocale();
            });
        }
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
    
    this.onEnterEvent = function(e){
        e = e || window.event;

        if (e.keyCode === 13) {
            login.do();
        }

        return false;
    };
}

function openVideoModal(url){
    $('#video_modal iframe').attr("src", url);
    $('#video_modal').modal("show");
}