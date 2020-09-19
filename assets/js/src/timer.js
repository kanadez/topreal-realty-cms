// ###################################### timer functions for OWL ############################# //

var totalSeconds = 0;
var net_error_loader = new Image();
net_error_loader.src = "assets/img/loader.gif";

function setTime(){
    ++totalSeconds;
    document.getElementById("seconds").innerHTML = pad(totalSeconds%60);
    document.getElementById("minutes").innerHTML = pad(parseInt(totalSeconds/60));
}

function pad(val){
    var valString = val + "";
    
    if(valString.length < 2)
        return "0" + valString;
    else
        return valString;
}

function createTimer(){
    return setInterval(setTime, 1000);
}

function destroyTimer(timer_id){
    if (timer_id != null){
        clearInterval(timer_id);
        totalSeconds = 0;
    }
}

// ###################################### timer functions for authorization ############################# //

var auth_counter = 0;
var auth_timer = null;
var session_continued = false;

function createAuthTimer(){
    auth_timer = setInterval(setAuthTime, 10000); // раз в 10 секунд
}

function setAuthTime(){
    if (auth_counter < 720){ // если меньше 720 по 10 секунд, т.е. 2 часов. длля теста 6
        if (auth_counter > 712 && !session_continued){ // для теста 3
            $('#session_finish_modal').modal("show");
        }
        
        auth_counter++;
        
        //$.post("/api/user/setseen.json", {}, null);
        
        jQuery.ajax({
            type: 'POST',
            url: "/api/user/setseen.json",
            timeout: 20000,
            success: function(response){
                hideNetErrorDummy();
                
                if (response == "mobile_authorized"){
                    showMobileAuthorizedModal();
                }
                else{
                    hideMobileAuthorizedModal();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                //showNetErrorDummy();
            }
        });
    }
    else{
        destroyAuthTimer();
    }
}

function destroyAuthTimer(){
    if (auth_timer != null){
        clearInterval(auth_timer);
        auth_timer = null;
        auth_counter = 0;
        location.href = "login?logout";
    }
}

function continueSession(){
    auth_counter = 0;
    session_continued = true;
    $('#session_finish_modal').modal("hide");
}

function showNetErrorDummy(){
    $('#net_error_modal').modal("show");
    $('#net_error_loader_div').append(net_error_loader);
    $('div.modal-backdrop').unbind("click");
}

function hideNetErrorDummy(){
    $('#net_error_modal').modal("hide");
}

function showMobileAuthorizedModal(){
    $('#mobile_auth_error_modal').modal("show");
    $('div.modal-backdrop').unbind("click");
}

function hideMobileAuthorizedModal(){
    $('#mobile_auth_error_modal').modal("hide");
}

function formatDuration(time){
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    var hours = Math.floor(time / 3600);
    
    return (hours > 0 ? (new Array(2+1).join('0')+hours).slice(-2)+":" : "")+(new Array(2+1).join('0')+minutes).slice(-2)+":"+(new Array(2+1).join('0')+seconds).slice(-2);
}