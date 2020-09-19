/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function PropertyEvent(){
    this.event = null;
    this.notification_removed = false;
    
    this.reinit = function(){
        this.notification_removed = false;
        $('#to_events_modal .notification').show();
    };
    
    this.create = function(){
        var title = $('#add_event_title_input').val().trim();
        var start_hour = $('#add_event_start_time_select').val().split(":")[0]*3600;
        var end_hour = $('#add_event_end_time_select').val().split(":")[0]*3600;
        var start_minute = $('#add_event_start_time_select').val().split(":")[1]*60;
        var end_minute = $('#add_event_end_time_select').val().split(":")[1]*60;
        var start = $('#add_event_start_input').datepicker("getDate")/1000+start_hour+start_minute;
        var end = $('#add_event_end_input').datepicker("getDate")/1000+end_hour+end_minute;
        var notification = $('#add_event_notification_period_input').val()*60;
        var email = $('#notify_by_email_check:checked').length;
        var property_id = property.data == null ? property.temporary_id : property.data.id;
        
        if (title.length > 0){
            subscribe();
            
            $.post("/api/propertyevent/create.json",{
                property: property_id,
                event: this.event,
                title: title,
                start: start,
                end: end,
                notification: this.notification_removed ? 0 : notification,
                email: email                
            },function (response){
                if (response.error != undefined){
                    utils.errorModal(response.error.description);
                }
                else{
                    $('#'+response.event).text(utils.getDateOnlyFromTimestamp(response.start));
                    //$('a.'+response.event).attr("onclick", "");
                    $('#to_events_modal').modal("hide");
                    utils.successModal(localization.getVariable("event_successfully_created"));
                }
            });
            
            var start_date = $('#add_event_start_input').val();
            var start_time = $('#add_event_start_time_select').val()+":00";
            var end_date = $('#add_event_end_input').val();
            var end_time = $('#add_event_end_time_select').val()+":00";
            
            createSimpleEvent(title+", "+localization.getVariable("card_noregister_span")+" "+property_id, start_date+"T"+start_time, end_date+"T"+end_time);
        }
    };
    
    this.setEvent = function(event){
        this.event = event;
    };
    
    this.removeNotification = function(){
        this.notification_removed = true;
        $('#to_events_modal .notification').hide();
    };
}