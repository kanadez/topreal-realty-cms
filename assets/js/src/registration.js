var admin_post_url = "admin/post.php";
var utils = new Utils();
var synonim = new Synonim("order"); // оюъект для работы с системой гео-синонимов
var help_tip = new HelpTip();
var urlparser = new URLparser(); // парсер урл-адреса
var order = new Order();
var overflowed_selects = [
    "collector_1_select",
    "collector_2_select",
    "collector_3_select"
];

$(document).ajaxStop(function() {
    utils.setSelectsOverflows(overflowed_selects);
});

$(document).ready(function(){
    order.init();
    help_tip.init();
    initAutocomplete();    
    
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
        
        order.calculate();
    });
    
    $('#paypal_buynow_button, #paypal_subscription_button').mousedown(function(){
	utils.htmlSpinner('checkout_button');
    });
    
    utils.setPasswordShowButton($("#password_input"), $("#show_password_span"));
    utils.setPasswordShowButton($("#password_again_input"), $("#show_password_again_span"));
});