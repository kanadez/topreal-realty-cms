var localization = new Localization();
var urlparser = new URLparser(); // парсер урл-адреса
var utils = new Utils();
var help_tip = new HelpTip();
var stock = new Stock();
var server_origin = "localhost:8080";
var user = new User();
var owl = new Owl();
var tools = new Tools();
var order = new Order();
var orderexp = new OrderExpired();
var subscription = new Subscription();
var overflowed_selects = [
    "collector_1_select",
    "collector_2_select",
    "collector_3_select"
];

$(document).ajaxStop(function() {
    utils.setSelectsOverflows(overflowed_selects);
});

$(document).ready(function(){
    createAuthTimer();
    localization.init();
    help_tip.initInapp();
    app.customCheckbox();
    stock.init();
    $('.feedback').feedback();
    
    $.post("/api/defaults/getlocale.json",{
    },function (response){
        subscription.defaults.locale = response;
    });
    
    localization.toLocale();
    subscription.initBalance();
});