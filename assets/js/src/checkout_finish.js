var admin_post_url = "admin/post.php";
var urlparser = new URLparser(); // парсер урл-адреса
var utils = new Utils();
var order = new Order();

$(document).ready(function(){
    order.initFinish();
});