$(document).ready(function(){
    $.post("/api/pricing/get.json",{
    },function (response){
        if (response.error != undefined)
            utils.errorModal(response.error.description);
        else{ 
            console.log(response);
            
            for (var key in response){
                $('#pricing_table tbody #'+key).text(response[key]);
            }
        }
    });
});