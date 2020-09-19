function Owl(){
    this.data = null;
    this.locked = false; // флаг блокировки совы, например во время звонка по етелефону
    this.session_timer = null;
    this.session_event = null;
    this.subject_type = null;
    this.subject_card = null;
    this.subject_name = null;
    this.subject_phone = null;
    this.subject_remark = null;
    this.session_timestamp = null;
    this.session_time = null;
    this.session_date = null;
    this.session_started = 0;    
    this.neccesary = [
        "owl_search_input_from",
        "owl_search_input_to"
    ];
    this.sorted = 0; // 0 - down, 1 - up
    this.group_mode = 0;
    this.filter_mode = 0; 
    
    this.init = function(){
        $('#owl_search_input_from').datepicker({ dateFormat: 'dd-mm' });
        $('#owl_search_input_to').datepicker({ dateFormat: 'dd-mm' });
    };
    
    this.startSession = function(subject, event, contact){
        if (contact != null && $('#contact'+contact+'_input').val().trim().length === 0 || this.session_started === 1){
            return 0;
        }
        
        this.session_event = event;
        this.session_started = 1;
        var event_icon = "fa-phone";
        var event_direction = "❯";
        var session_data = "";
        this.subject_name = $('#name_input').val().trim();
        this.subject_phone = contact == null ? null : $('#contact'+contact+'_input').val().trim();
        this.session_timestamp = utils.getNow();
        this.session_time = utils.getNowInTime();
        this.session_date = utils.convertTimestampForDatepicker(this.session_timestamp);
        
        $('#owl_table').html("");
        
        if ($('.sidebar-mini').length && contact != null){
            $('#main-wrapper').removeClass("sidebar-mini");
        }
        
        this.subject_type = subject;
        switch (subject){
            case "client":
                this.subject_card = client.data.id;
            break;
            case "property":
                this.subject_card = property.data.id;
            break;
        }
        
        switch (event){
            case "call-out":
                event_icon = "fa-phone";
                event_direction = "❯";
            break;
            case "sms-out":
                event_icon = "fa-envelope-o";
                event_direction = "❯";
            break;
            case "email-out":
                event_icon = "fa-at";
                event_direction = "❯";
            break;
            case "call-in":
                event_icon = "fa-phone";
                event_direction = "❮";
            break;
            case "sms-in":
                event_icon = "fa-envelope-o";
                event_direction = "❮";
            break;
            case "email-in":
                event_icon = "fa-at";
                event_direction = "❮";
            break;
            case "appointment":
                event_icon = "fa-calendar-check-o";
                event_direction = "❯";
            break;
            case "property-inspection":
                event_icon = "fa-eye";
                event_direction = "❯";
            break;
        }
        
        if (contact != null){
            session_data = "<span class='owl_agent' agent='"+user.id+"'></span>"+" ❯ "+this.subject_name+", <a href='"+this.subject_type+"?id="+this.subject_card+"'><span locale='"+this.subject_type+"_card'>"+localization.getVariable(this.subject_type+"_card")+"</span> "+this.subject_card+"</a>, "+this.session_date+" "+this.session_time+", "+"<a href='javascript:void(0)' onclick=\"owl.check('"+this.subject_phone+"')\">"+this.subject_phone+"</a>";
        }
        else{
            session_data = "<span class='owl_agent' agent='"+user.id+"'></span>"+", <a href='"+this.subject_type+"?id="+this.subject_card+"'><span locale='"+this.subject_type+"_card'>"+localization.getVariable(this.subject_type+"_card")+"</span> "+this.subject_card+"</a>, "+this.session_date+" "+this.session_time;
        }
        
        $('#owl_table').append('<tr class="owl_new_event" event="'+event+'"><td width="10%"><span class="event_icon"><i class="fa '+event_icon+'"></i></span></td><td width="5%">'+event_direction+'</td><td id="session_data_td" width="73%">'+session_data+' <span id="minutes">00</span><span id="semicolon_span">:</span><span id="seconds">00</span><span id="duration_span"></span></td><td width="1%"><button id="stop_session_button" onclick="owl.stopSession()" type="button" class="btn btn-danger btn_narrow"><i></i></button></td></tr>');
        this.getSessions();
        
        if ((event === "call-in" || event === "call-out") && contact != null){
            this.session_timer = createTimer();
            this.lock();
        }
        else{
            this.stopSession();
        }
        
        $.post("/api/agency/getagentslist.json",{
        },function (result){
            for (var i = 0; i < result.length; i++){
                if ($('.owl_agent[agent='+result[i].id+']').length !== 0){
                    $('.owl_agent[agent='+result[i].id+']').text(result[i].name);
                }
            }
        });
    };
    
    this.startSessionFromResponse = function(subject_type, subject_id, event, contact, name){
        debugger
        if (contact.length === 0 || this.session_started === 1){
            return false;
        }
        
        this.session_event = event;
        this.session_started = 1;
        var event_icon = "fa-phone";
        var event_direction = "❯";
        var session_data = "";
        this.subject_name = name;
        this.subject_phone = contact;
        this.session_timestamp = utils.getNow();
        this.session_time = utils.getNowInTime();
        this.session_date = utils.convertTimestampForDatepicker(this.session_timestamp);
        
        $('#owl_table').html("");
        
        if ($('.sidebar-mini').length){
            $('#main-wrapper').removeClass("sidebar-mini");
        }
        
        this.subject_type = subject_type;
        this.subject_card = subject_id;
        
        switch (event){
            case "call-out":
                event_icon = "fa-phone";
                event_direction = "❯";
            break;
            case "sms-out":
                event_icon = "fa-envelope-o";
                event_direction = "❯";
            break;
            case "email-out":
                event_icon = "fa-at";
                event_direction = "❯";
            break;
            case "call-in":
                event_icon = "fa-phone";
                event_direction = "❮";
            break;
            case "sms-in":
                event_icon = "fa-envelope-o";
                event_direction = "❮";
            break;
            case "email-in":
                event_icon = "fa-at";
                event_direction = "❮";
            break;
            case "appointment":
                event_icon = "fa-calendar-check-o";
                event_direction = "❯";
            break;
            case "property-inspection":
                event_icon = "fa-eye";
                event_direction = "❯";
            break;
        }
        
        if (contact.length > 0){
            session_data = "<span class='owl_agent' agent='"+user.id+"'></span>"+" ❯ "+this.subject_name+", <a href='"+this.subject_type+"?id="+this.subject_card+"'><span locale='"+this.subject_type+"_card'>"+localization.getVariable(this.subject_type+"_card")+"</span> "+this.subject_card+"</a>, "+this.session_date+" "+this.session_time+", "+"<a href='javascript:void(0)' onclick=\"owl.check('"+this.subject_phone+"')\">"+this.subject_phone+"</a>";
        }
        else{
            session_data = "<span class='owl_agent' agent='"+user.id+"'></span>"+", <a href='"+this.subject_type+"?id="+this.subject_card+"'><span locale='"+this.subject_type+"_card'>"+localization.getVariable(this.subject_type+"_card")+"</span> "+this.subject_card+"</a>, "+this.session_date+" "+this.session_time;
        }
        
        $('#owl_table').append('<tr class="owl_new_event" event="'+event+'"><td width="10%"><span class="event_icon"><i class="fa '+event_icon+'"></i></span></td><td width="5%">'+event_direction+'</td><td id="session_data_td" width="73%">'+session_data+' <span id="minutes">00</span><span id="semicolon_span">:</span><span id="seconds">00</span><span id="duration_span"></span></td><td width="1%"><button id="stop_session_button" onclick="owl.stopSession()" type="button" class="btn btn-danger btn_narrow"><i></i></button></td></tr>');
        this.getSessions();
        
        if ((event === "call-in" || event === "call-out") && contact.length > 0){
            this.session_timer = createTimer();
            this.lock();
        }
        else{
            this.stopSession();
        }
        
        $.post("/api/agency/getagentslist.json",{
        },function (result){
            for (var i = 0; i < result.length; i++){
                if ($('.owl_agent[agent='+result[i].id+']').length !== 0){
                    $('.owl_agent[agent='+result[i].id+']').text(result[i].name);
                }
            }
        });
    };
    
    this.stopSession = function(){
        destroyTimer(this.session_timer);
        this.unlock();
        
        $('#minutes').hide();
        $('#seconds').hide();
        $('#semicolon_span').hide();
        
        if (this.session_event == "call-in" || this.session_event == "call-out"){
            $('#duration_span').html(formatDuration(Number(utils.getNow())-Number(this.session_timestamp)));
        }
        
        $('#stop_session_button').hide();
        
        /*$('#stop_session_button')
            .attr("onclick","owl.createCalendarEvent()")
            .children()
            .removeClass("icon-hourglass")
            .addClass("fa")
            .addClass("fa-calendar");
        */
       
        $.post("/api/owl/savesession.json",{
            event_type: this.session_event,
            subject_type: this.subject_type,
            card: this.subject_card,
            subject_name: this.subject_name,
            subject_contact: this.subject_phone,
            subject_remark: this.subject_remark,
            duration: utils.getNow()-this.session_timestamp,
            timestamp: this.session_timestamp
        },function (response){
            owl.session_started = 0;
            owl.subject_remark = null;
            //var event_icon = "fa-phone";
            //session_data = owl.subject_name+" "+owl.session_date+" "+owl.session_time+" "+owl.subject_phone+" "+(utils.getNow()-this.session_timestamp)+"sec";
            //$('#owl_table').append('<tr><td width="10%"><button id="at_button" type="button" class="btn btn-default btn_narrow" ><i class="fa '+event_icon+'"></i></button></td><td width="5%">❯</td><td id="session_data_td" width="73%">'+session_data+'</td></tr>');
            
            $.post("/api/owl/unsettemp.json",{
                event: response
            }, null);
        });
    };
    
    this.getSessions = function(){
        $('#owl_back_to_full_button').hide();
        
        //$.post(this.group_mode === 0 ? "/api/owl/getsessions.json" : "/api/owl/getsessionsforall.json",{
        //},function (response){
            var response = this.group_mode === 0 ? global_data.owl_getsessions : global_data.getsessionsforall;
        
            if (response.error != undefined)
                utils.errorModal(response.error.description);
            else{
                this.data = response;
                
                if (this.data.length === 0 && this.session_started === 0){
                    $('#owl_table').append('<tr><td width="100%" class="dummy_td">No sessions yet.</td></tr><tr><td width="100%" class="dummy_td">Use buttons above.</td></tr>');
                }
                else{ 
                    for (var i = 0; i < this.data.length; i++){
                        switch (this.data[i].event_type){
                            case "call-out":
                                var event_icon = "fa-phone";
                                var event_direction = "❯";
                                var duration = formatDuration(this.data[i].duration);
                            break;
                            case "sms-out":
                                var event_icon = "fa-envelope-o";
                                var event_direction = "❯";
                                var duration = "";
                            break;
                            case "email-out":
                                var event_icon = "fa-at";
                                var event_direction = "❯";
                                var duration = "";
                            break;
                            case "call-in":
                                var event_icon = "fa-phone";
                                var event_direction = "❮";
                                var duration = formatDuration(this.data[i].duration);
                            break;
                            case "sms-in":
                                var event_icon = "fa-envelope-o";
                                var event_direction = "❮";
                                var duration = "";
                            break;
                            case "email-in":
                                var event_icon = "fa-at";
                                var event_direction = "❮";
                                var duration = "";
                            break;
                            case "appointment":
                                var event_icon = "fa-calendar-check-o";
                                var event_direction = "❯";
                                var duration = "";
                            break;
                            case "property-inspection":
                                var event_icon = "fa-eye";
                                var event_direction = "❯";
                                var duration = "";
                            break;
                        }
                    
                        var session_time = utils.getTimeFromTimestamp(this.data[i].timestamp);
                        var session_date = ", "+utils.convertTimestampForDatepicker(this.data[i].timestamp);
                        var session_data = "";
                        var subject_name = this.data[i].subject_name != null && this.data[i].subject_name.length > 0 ? " ❯ "+this.data[i].subject_name : "";
                        var subject_card = this.data[i].card != null ? ", <a href='"+this.data[i].subject_type+"?id="+this.data[i].card+"'><span locale='"+this.data[i].subject_type+"_card'>"+localization.getVariable(this.data[i].subject_type+"_card")+"</span> "+this.data[i].card+"</a>" : "";
                        var subject_remark = this.data[i].subject_remark != null && this.data[i].subject_remark.length > 0 ? ", "+this.data[i].subject_remark : "";

                        if (this.data[i].subject_contact != null && this.data[i].subject_contact.length > 0){                          
                            session_data = "<span class='owl_agent' agent='"+this.data[i].agent+"'></span>"+subject_name+subject_card+session_date+" "+session_time+", <a href='javascript:void(0)' onclick=\"this.check('"+this.data[i].subject_contact+"')\">"+this.data[i].subject_contact+"</a> "+duration+" <span style='opacity:0.5'>"+subject_remark+"</span>";
                        }
                        else{
                            session_data = "<span class='owl_agent' agent='"+this.data[i].agent+"'></span>"+subject_card+session_date+" "+session_time;
                        }
                        
                        $('#owl_table').append('<tr '+(i%2 === 0 ? "class='hl'": "")+' owl_item_id="'+this.data[i].id+'" owl_card_id="'+this.data[i].card+'" owl_subject_type="'+this.data[i].subject_type+'"><td width="10%"><span class="event_icon"><i class="fa '+event_icon+'"></span></td><td width="5%">'+event_direction+'</td><td '+(i === 0 && this.session_started === 0 ? "" : "colspan='2' style='padding-right: 15px;'")+' id="session_data_td" width="73%">'+session_data+'</td>'+(i === 0 && this.session_started === 0 ? '<td width="1%"><button style="display:none" id="to_calendar_session_button" onclick="this.createCalendarEvent()" type="button" class="btn btn-default btn_narrow" ><i class="fa fa-calendar"></i></button></td>' : '')+'</tr>');
                    }
                }
                
                //$.post("/api/agency/getagentslist.json",{
                //},function (result){
                    for (var i = 0; i < global_data.agency_getagentslist.length; i++){
                        if ($('.owl_agent[agent='+global_data.agency_getagentslist[i].id+']').length !== 0){
                            $('.owl_agent[agent='+global_data.agency_getagentslist[i].id+']').text(global_data.agency_getagentslist[i].name);
                        }
                    }
                //});
            }
        //});
    };
    
    this.showSessionForm = function(subject, event){
        if (this.session_started === 1)
            return 0;
        
        this.session_started = 1;
        
        switch (event){
            case "call-out":
                var event_string = "out call";
            break;
            case "sms-out":
                var event_string = "out sms";
            break;
            case "email-out":
                var event_string = "out email";
            break;
            case "call-in":
                var event_string = "in call";
            break;
            case "sms-in":
                var event_string = "in sms";
            break;
            case "email-in":
                var event_string = "in email";
            break;
        }
                    
        $('#owl_table').html('<tr><td width="100%">Create '+event_string+' session:</td></tr><tr><td width="100%"><input id="new_session_name" class="new_session_data" placeholder="Client name" maxlength="100" style="width:48%;"/><input id="new_session_contact" placeholder="Client contact" maxlength="50" class="new_session_data" style="width:46.7%;margin-left:11px"/></td></tr><tr><td width="100%"><input id="new_session_remark" placeholder="Remark" maxlength="40" class="new_session_data" style="width:98%;"/></td></tr><tr><td width="100%"><button id="new_session_start_button" type="button" class="btn btn-primary">Create session</button><button id="new_session_cancel_button" type="button" onclick="owl.hideSessionForm()" class="btn btn-default">Cancel</button></td></tr>');
        $('#new_session_start_button').click({event:event, subject:subject},function(e){
            if ($('#new_session_name').val().trim().length === 0 || $('#new_session_contact').val().trim().length === 0)
                return 0;
            
            owl.session_event = e.data.event;
            var event_icon = "fa-phone";
            var event_direction = "❯";
            var session_data = "";
            owl.subject_name = $('#new_session_name').val().trim();
            owl.subject_phone = $('#new_session_contact').val().trim();
            owl.subject_remark = $('#new_session_remark').val().trim();
            owl.session_timestamp = utils.getNow();
            owl.session_time = utils.getNowInTime();
            owl.session_date = utils.convertTimestampForDatepicker(owl.session_timestamp);
            owl.subject_type = e.data.subject;
            
            $('#owl_table').html("");
            owl.getSessions();
            
            switch (e.data.subject){
                case "client":
                    owl.subject_card = client.data.id;
                break;
                case "property":
                    owl.subject_card = property.data.id;
                break;
            }

            switch (event){
                case "call-out":
                    event_icon = "fa-phone";
                    event_direction = "❯";
                break;
                case "sms-out":
                    event_icon = "fa-envelope-o";
                    event_direction = "❯";
                break;
                case "email-out":
                    event_icon = "fa-at";
                    event_direction = "❯";
                break;
                case "call-in":
                    event_icon = "fa-phone";
                    event_direction = "❮";
                break;
                case "sms-in":
                    event_icon = "fa-envelope-o";
                    event_direction = "❮";
                break;
                case "email-in":
                    event_icon = "fa-at";
                    event_direction = "❮";
                break;
            }

            session_data = owl.subject_name+" "+owl.session_date+" "+owl.session_time+" "+owl.subject_phone;
            $('#owl_table').append('<tr><td width="10%"><span class="event_icon"><i class="fa '+event_icon+'"></i></span></td><td width="5%">'+event_direction+'</td><td id="session_data_td" width="73%">'+session_data+' <span id="minutes">00</span><span id="semicolon_span">:</span><span id="seconds">00</span><span id="duration_span"></span><span style="opacity:0.5"> '+owl.subject_remark+'</span></td><td width="1%"><button id="stop_session_button" onclick="owl.stopSession()" type="button" class="btn btn-default btn_narrow" ><i class="fa fa-stop-circle"></i></button></td></tr>');

            if (event === "call-in" || event === "call-out")
                owl.session_timer = createTimer();
            else
                owl.stopSession();
        });
    };
    
    this.hideSessionForm = function(){
        this.session_started = 0;
        $('#owl_table').html("");
        owl.getSessions();
    };
    
    this.createCalendarEvent = function(){
        if (this.session_event != null){
            switch (owl.session_event){
                case "call-out":
                    var event_string = "out call";
                break;
                case "sms-out":
                    var event_string = "out sms";
                break;
                case "email-out":
                    var event_string = "out email";
                break;
                case "call-in":
                    var event_string = "in call";
                break;
                case "sms-in":
                    var event_string = "in sms";
                break;
                case "email-in":
                    var event_string = "in email";
                break;
            }
            
            var session_time = owl.session_time;
            var session_date = utils.convertTimestampForGoogleCalendar(owl.session_timestamp);
            var title = event_string+" to "+owl.subject_name+", "+owl.subject_type+" card "+owl.subject_card+", "+session_date+" "+owl.session_time+", "+owl.subject_phone+" "+owl.subject_remark;
        }
        else{
            switch (this.data[0].event_type){
                case "call-out":
                    var event_string = "out call";
                break;
                case "sms-out":
                    var event_string = "out sms";
                break;
                case "email-out":
                    var event_string = "out email";
                break;
                case "call-in":
                    var event_string = "in call";
                break;
                case "sms-in":
                    var event_string = "in sms";
                break;
                case "email-in":
                    var event_string = "in email";
                break;
            }
            
            var session_time = utils.getTimeFromTimestamp(this.data[0].timestamp);
            var session_date = utils.convertTimestampForGoogleCalendar(this.data[0].timestamp);
            var title = event_string+" to "+this.data[0].subject_name+", "+this.data[0].subject_type+" card "+this.data[0].card+", "+session_date+" "+session_time+", "+this.data[0].subject_contact+" "+(this.data[0].subject_remark != null ? this.data[0].subject_remark : "");
        }
        
        var start_date = session_date; 
        var start_time = session_time+":00";
        var end_date = session_date; 
        var end_time = session_time+":00";
        
        createSimpleEvent(title, start_date+"T"+start_time, end_date+"T"+end_time);
    };
    
    this.phoneCall = function(span){
        alert("calling "+$(span).text());
    };
    
    this.showBetween = function(){          
        var from_timestamp = $('#owl_search_input_from').val().trim().length > 0 ? $('#owl_search_input_from').datepicker('getDate')/1000 : null;
        var to_timestamp = $('#owl_search_input_to').val().trim().length > 0 ? $('#owl_search_input_to').datepicker('getDate')/1000 : null;
        $('#owl_table tr').show();
        $('#owl_back_to_full_button').show();
        //$('input').css("background","");

        for (var i = 0; i < owl.data.length; i++){
            if (from_timestamp !== null && to_timestamp !== null){
                if (owl.data[i].timestamp < from_timestamp || owl.data[i].timestamp > to_timestamp){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            else if (from_timestamp !== null && to_timestamp === null){
                if (owl.data[i].timestamp < from_timestamp){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            else if (from_timestamp === null && to_timestamp !== null){
                if (owl.data[i].timestamp > to_timestamp){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            else if (from_timestamp === null && to_timestamp === null){
                $('#owl_back_to_full_button').hide();
                return 0;
            }
        }
    };
    
    this.showFullList = function(){
        $('#owl_table tr').show();
        $('#owl_back_to_full_button').hide();
    };
    
    this.showCalls = function(){
        if (this.filter_mode === 1){
            $('#owl_table tr, .owl_new_event').show();
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_show_calls_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{       
            $('#owl_table tr, .owl_new_event').show();
            
            $('#owl_show_calls_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;
            
            for (var i = 0; i < owl.data.length; i++){
                if (owl.data[i].event_type !== "call-in" && owl.data[i].event_type !== "call-out"){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            
            if ($('.owl_new_event').attr("event") !== "call-in" && $('.owl_new_event').attr("event") !== "call-out"){
                $('.owl_new_event').hide();
            }
        }
    };
    
    this.showSMSes = function(){
        if (this.filter_mode === 1){
            $('#owl_table tr, .owl_new_event').show();
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_show_sms_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{       
            $('#owl_table tr, .owl_new_event').show();
            
            $('#owl_show_sms_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;

            for (var i = 0; i < owl.data.length; i++){
                if (owl.data[i].event_type !== "sms-in" && owl.data[i].event_type !== "sms-out"){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            
            if ($('.owl_new_event').attr("event") !== "sms-in" && $('.owl_new_event').attr("event") !== "sms-out"){
                $('.owl_new_event').hide();
            }
        }
    };
    
    this.showEmails = function(){
        if (this.filter_mode === 1){
            $('#owl_table tr, .owl_new_event').show();
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_show_emails_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{       
            $('#owl_table tr, .owl_new_event').show();
            
            $('#owl_show_emails_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;

            for (var i = 0; i < owl.data.length; i++){
                if (owl.data[i].event_type !== "email-in" && owl.data[i].event_type !== "email-out"){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            
            if ($('.owl_new_event').attr("event") !== "email-in" && $('.owl_new_event').attr("event") !== "email-out"){
                $('.owl_new_event').hide();
            }
        }
    };
    
    this.showAppointments = function(){
        if (this.filter_mode === 1){
            $('#owl_table tr, .owl_new_event').show();
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_show_appointments_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{       
            $('#owl_table tr, .owl_new_event').show();
            
            $('#owl_show_appointments_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;

            for (var i = 0; i < owl.data.length; i++){
                if (owl.data[i].event_type !== "appointment"){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            
            if ($('.owl_new_event').attr("event") !== "appointment"){
                $('.owl_new_event').hide();
            }
        }
    };
    
    this.showInspections = function(){
        if (this.filter_mode === 1){
            $('#owl_table tr, .owl_new_event').show();
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_show_inspections_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{       
            $('#owl_table tr, .owl_new_event').show();
            
            $('#owl_show_inspections_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;

            for (var i = 0; i < owl.data.length; i++){
                if (owl.data[i].event_type !== "property-inspection"){
                    $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
                }
            }
            
            if ($('.owl_new_event').attr("event") !== "property-inspection"){
                $('.owl_new_event').hide();
            }
        }
    };
    
    this.showCardOnly = function(subject_type, card){
        //console.log(subject_type);
        //console.log(card);
        $('#owl_table tr').show();
        $('#owl_back_to_full_button').show();

        for (var i = 0; i < owl.data.length; i++){
            if (owl.data[i].subject_type != subject_type || owl.data[i].card != card){
                $('#owl_table tr[owl_item_id="'+owl.data[i].id+'"]').hide();
            }
        }
        
        if ($('.sidebar-mini').length){
            $('#main-wrapper').removeClass("sidebar-mini");
        }
    };
    
    this.sortByDate = function(){
        var obj = {};
        var result = [];
        
        for (var i = 0; i < this.data.length; i++){
            obj[i] = Number(this.data[i].timestamp);
        }
        
        var tuples = [];

        for (var key in obj) tuples.push([key, obj[key]]);

        tuples.sort(function(a, b) {
            a = a[1];
            b = b[1];

            if (owl.sorted === 0){
                return a < b ? -1 : (a > b ? 1 : 0);                
            }
            else{
                return a > b ? -1 : (a < b ? 1 : 0);                
            }
        });
        
        if (this.filter_mode === 1){
            this.filter_mode = 0;
            $('.owl_tumbler').removeClass("btn-default_active").addClass("btn-default");
            $('#owl_sort_date_button').removeClass("btn-default_active").addClass("btn-default");
        }
        else{
            $('#owl_sort_date_button').addClass("btn-default_active").removeClass("btn-default");
            this.filter_mode = 1;
        }
        
        if (owl.sorted === 0){
            owl.sorted = 1;            
        }
        else{
            owl.sorted = 0;               
        }

        for (var i = 0; i < tuples.length; i++) {
            var key = tuples[i][0];
            var value = tuples[i][1];

            result.push(key);
        }
        
        $('#owl_table').html("");
        
        for (var z = 0; z < result.length; z++){
            for (var i = 0; i < owl.data.length; i++){
                if (i == result[z]){
                    switch (owl.data[i].event_type){
                        case "call-out":
                            var event_icon = "fa-phone";
                            var event_direction = "❯";
                            var duration = formatDuration(owl.data[i].duration);
                        break;
                        case "sms-out":
                            var event_icon = "fa-envelope-o";
                            var event_direction = "❯";
                            var duration = "";
                        break;
                        case "email-out":
                            var event_icon = "fa-at";
                            var event_direction = "❯";
                            var duration = "";
                        break;
                        case "call-in":
                            var event_icon = "fa-phone";
                            var event_direction = "❮";
                            var duration = formatDuration(owl.data[i].duration);
                        break;
                        case "sms-in":
                            var event_icon = "fa-envelope-o";
                            var event_direction = "❮";
                            var duration = "";
                        break;
                        case "email-in":
                            var event_icon = "fa-at";
                            var event_direction = "❮";
                            var duration = "";
                        break;
                        case "appointment":
                            var event_icon = "fa-calendar-check-o";
                            var event_direction = "❯";
                            var duration = "";
                        break;
                        case "property-inspection":
                            var event_icon = "fa-eye";
                            var event_direction = "❯";
                            var duration = "";
                        break;
                    }

                    var session_time = utils.getTimeFromTimestamp(owl.data[i].timestamp);
                    var session_date = utils.convertTimestampForDatepicker(owl.data[i].timestamp);
                    var session_data = "<span class='owl_agent' agent='"+owl.data[i].agent+"'></span>"+" ❯ "+owl.data[i].subject_name+", <a href='"+owl.data[i].subject_type+"?id="+owl.data[i].card+"'>"+owl.data[i].subject_type+" card "+owl.data[i].card+"</a>, "+session_date+" "+session_time+", "+owl.data[i].subject_contact+" "+duration+" <span style='opacity:0.5'>"+owl.data[i].subject_remark+"</span>";
                    $('#owl_table').append('<tr '+(i%2 === 0 ? "class='hl'": "")+' owl_item_id="'+owl.data[i].id+'"><td ><span class="event_icon"><i class="fa '+event_icon+'"></span></td><td >'+event_direction+'</td><td '+(i === 0 && owl.session_started === 0 ? "" : "colspan='2' style='padding-right: 15px;'")+' id="session_data_td">'+session_data+'</td>'+(i === 0 && owl.session_started === 0 ? '<td width="1%"><button style="display:none" id="to_calendar_session_button" onclick="owl.createCalendarEvent()" type="button" class="btn btn-default btn_narrow" ><i class="fa fa-calendar"></i></button></td>' : '')+'</tr>');
                }
            }
        }
        
        $.post("/api/agency/getagentslist.json",{
        },function (result){
            for (var i = 0; i < result.length; i++){
                if ($('.owl_agent[agent='+result[i].id+']').length !== 0){
                    $('.owl_agent[agent='+result[i].id+']').text(result[i].name);
                }
            }
        });
    };
    
    this.switchGroupMode = function(){    
        if (this.group_mode === 1){
            this.group_mode = 0;
            $('#owl_group_switch_button').children("i").removeClass("fa-venus").addClass("fa-venus-double");
        }
        else{
            this.group_mode = 1;
            $('#owl_group_switch_button').children("i").removeClass("fa-venus-double").addClass("fa-venus");
        }
        
        $('#owl_table').html("");
        this.getSessions();
    };
    
    this.lock = function(){
        this.locked = true;
        $('#owl_backdrop_div').show();
        $('.theme-default .sidebar-left').css("z-index", 9999);
        $('.sidebar-header button, .sidebar-header input').attr("disabled", true);
        $('#toggle-left').unbind().click(function(){
            owl.showHangupDialog();
        });
    };
    
    this.unlock = function(){
        this.locked = false;
        $('#owl_backdrop_div').hide();
        $('.theme-default .sidebar-left').css("z-index", 999);
        $('.sidebar-header button, .sidebar-header input').attr("disabled", false);
        $('#toggle-left').unbind().on('click', function() {
            var bodyEl = $('#main-wrapper');
            ($(window).width() > 767) ? $(bodyEl).toggleClass('sidebar-mini'): $(bodyEl).toggleClass('sidebar-opened');
        });
    };
    
    this.showHangupDialog = function(){
        $('#owl_hangup_modal').modal("show");
    };
    
    this.bindEnterEvents = function(){
        var events = {
            owl_search_input_from: "owl.showBetween()",
            owl_search_input_to: "owl.showBetween()"
        };

        for (var key in events){
            $('#'+key).attr({
                "data-onenter-func": events[key],
                onkeypress: "utils.onEnter(event, this)"
            });
        }
    };
    
    this.appCallNumber = function(subject, contact){
        if (contact != null && $('#contact'+contact+'_input').val().trim().length === 0 || this.session_started === 1){
            return 0;
        }
        
        if (utils.getCookie("app_call_number_hint_cancelled") == undefined){
            $('#app_call_number_hint_modal').modal("show");
        }
        
        this.session_event = "call-out";
        this.session_started = 1;
        this.subject_name = $('#name_input').val().trim();
        this.subject_phone = contact == null ? null : $('#contact'+contact+'_input').val().trim();
        this.session_timestamp = utils.getNow();
        this.session_time = utils.getNowInTime();
        this.session_date = utils.convertTimestampForDatepicker(this.session_timestamp);
        
        this.subject_type = subject;
        switch (subject){
            case "client":
                this.subject_card = client.data.id;
            break;
            case "property":
                this.subject_card = property.data.id;
            break;
        }
        
        $.post("/api/owl/createsession.json",{
            event_type: this.session_event,
            subject_type: this.subject_type,
            card: this.subject_card,
            subject_name: this.subject_name,
            subject_contact: this.subject_phone
            //duration: utils.getNow()-this.session_timestamp,
            //timestamp: this.session_timestamp
        },function (response){
            owl.session_started = 0;
            owl.subject_remark = null;
        });
        
        /*$.post("/api/fcm/sendmsg.json",{
            action: "call_number",
            data: $('#contact1_input').val().trim()
        }, function(response){
            console.log(response);
        });*/
    };
    
    this.appCallNumberFromResponse = function(subject_type, subject_id, subject_phone, subject_name){
        if (subject_phone.length === 0 || this.session_started === 1){
            utils.errorModal(localization.getVariable("auth_error_msg_label"));
            
            return false;
        }
        
        //if (utils.getCookie("app_call_number_hint_cancelled") == undefined){
           $('#app_call_number_hint_modal').modal("show");
        //}
        
        this.session_event = "call-out";
        this.session_started = 1;
        this.subject_name = subject_name;
        this.subject_phone = subject_phone;
        this.session_timestamp = utils.getNow();
        this.session_time = utils.getNowInTime();
        this.session_date = utils.convertTimestampForDatepicker(this.session_timestamp);
        
        this.subject_type = subject_type;
        this.subject_card = subject_id;
        
        $.post("/api/owl/createsession.json",{
            event_type: this.session_event,
            subject_type: this.subject_type,
            card: this.subject_card,
            subject_name: this.subject_name,
            subject_contact: this.subject_phone
            //duration: utils.getNow()-this.session_timestamp,
            //timestamp: this.session_timestamp
        },function (response){
            owl.session_started = 0;
            owl.subject_remark = null;
        });
        
        /*$.post("/api/fcm/sendmsg.json",{
            action: "call_number",
            data: $('#contact1_input').val().trim()
        }, function(response){
            console.log(response);
        });*/
    };
    
    this.openAppSendSMSmodal = function(subject, contact){
        $('#send_sms_button').attr("onclick", "owl.appSendSMS(\""+subject+"\", "+contact+")");
        $('#send_sms_modal').modal("show");
        $('#sms_text_input').val("").focus();
    };
    
    this.appSendSMS = function(subject, contact){
        if (contact != null && $('#contact'+contact+'_input').val().trim().length === 0 || this.session_started === 1){
            return 0;
        }
        
        this.session_event = "sms-out";
        this.session_started = 1;
        this.subject_name = $('#name_input').val().trim();
        this.subject_phone = contact == null ? null : $('#contact'+contact+'_input').val().trim();
        this.session_timestamp = utils.getNow();
        this.session_time = utils.getNowInTime();
        this.session_date = utils.convertTimestampForDatepicker(this.session_timestamp);
        
        this.subject_type = subject;
        switch (subject){
            case "client":
                this.subject_card = client.data.id;
            break;
            case "property":
                this.subject_card = property.data.id;
            break;
        }
        
        $.post("/api/owl/createsession.json",{
            event_type: this.session_event,
            subject_type: this.subject_type,
            card: this.subject_card,
            subject_name: this.subject_name,
            subject_contact: this.subject_phone,
            sms_text: $('#sms_text_input').val().trim()
            //duration: utils.getNow()-this.session_timestamp,
            //timestamp: this.session_timestamp
        },function (response){
            owl.session_started = 0;
            owl.subject_remark = null;
            //$('#sms_text_hint_span').css("color", "orange");
            //$('#send_sms_button').attr("disabled", true);
            $('#send_sms_modal').modal("hide");
            
            var warning_text = localization.getVariable("push_sms_send_button");
            warning_text += "<p><br>";
            warning_text += localization.getVariable("if_nothing_happens_sms");
            utils.warningModal(warning_text);
        });
        
        /*$.post("/api/fcm/sendmsg.json",{
            action: "call_number",
            data: $('#contact1_input').val().trim()
        }, function(response){
            console.log(response);
        });*/
    };
    
    this.appCallNumberHintCancel = function(){
        utils.setCookie("app_call_number_hint_cancelled", 1, {expires: 315360000});
        $('#app_call_number_hint_modal').modal("hide");
    };
    
    this.openAppInstallModal = function(){
        $('#app_install_first_modal').modal("show");
    };
    
    this.openSecondAppInstallModal = function(){
        $('#app_install_first_modal').modal("hide");
        $('#app_install_second_modal').modal("show");
    };
    
    this.setNoSmartphone = function(){
        $.post("/api/owl/setnosmart.json", null, function(){
            var object_type = location.pathname == "/property" ? "property" : "client";
            
            for (var i = 1; i < 5; i++){
                $('#owl_button_phone_'+i).attr("onclick", "owl.startSession('"+object_type+"', 'call-out', "+i+")");
                $('#owl_button_sms_'+i).attr("onclick", "owl.startSession('"+object_type+"', 'sms-out', "+i+")");
            }
        });
        $('#app_install_first_modal').modal("hide");
        $('#owl_no_smart_modal').modal("show");
    };
    
    this.setNoSmartphoneFromResponse = function(){
        $.post("/api/owl/setnosmart.json", null, function(){
            var object_type = "property";//location.pathname == "/property" ? "property" : "client";
            
            for (var i = 0; i < response_list.properties.length; i++){
                $('#call_button_property_'+response_list.properties[i].id).attr("onclick", "owl.startSessionFromResponse('"+object_type+"', '"+response_list.properties[i].id+"', 'call-out', '"+response_list.properties[i].contact1+"', '"+response_list.properties[i].name+"')"); //subject_type, subject_id, event, contact, name
            }
        });
        $('#app_install_first_modal').modal("hide");
        $('#owl_no_smart_modal').modal("show");
    };
    
    this.openThirdAppInstallModal = function(){
        $('#app_install_second_modal').modal("hide");
        $('#app_install_third_modal').modal("show");
    };
    
    this.sendAppEmailLink = function(){
        var email = $('#app_install_third_modal_email_input').val().trim();
        
        if (email.length > 0){
            $.post("/api/owl/sendapplink.json", {
                email: email
            }, function(){
                $('#app_install_third_modal').modal("hide");
                utils.successModal(localization.getVariable("check_y_inbox"));
            });
        }
    };
    
    this.check = function(phone_number){
        var type = "property";
        var id = "1";
        
        if (location.pathname == "/property"){
            id = property.data.id;
        }
        else if (location.pathname == "/client"){
            type = "client";
            id = client.data.id;
        }
        
        $.post("/api/owl/check.json",{
            phone: phone_number,
            object_id: id,
            object_type: type
        },function (response){
            if (response.error != undefined)
                showErrorMessage(response.error.description);
            else{
                if (response == 0){
                    utils.warningModal(localization.getVariable("no_such_phone_cards_sorry"));
                }
                else{
                    location.href = "query?id="+response+"&response=list";
                }
            }
        });
    };
    
    this.init();
    this.bindEnterEvents();
    this.getSessions();
}