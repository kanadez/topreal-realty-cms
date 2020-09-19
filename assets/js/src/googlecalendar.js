// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '937558785482-fii0bbal3jlphs7ivdg8oamn7819dfbp.apps.googleusercontent.com';

var SCOPES = "https://www.googleapis.com/auth/calendar";

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': true
    }, handleAuthResult);
    
    bindCalendarEnterEvents();
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        //$('#auth_success_alert').show();
        authorizeDiv.style.display = 'none';
        $('#to_cal_form').css({textAlign: "left"});
        $('.calendar_event_field').show();
        loadCalendarApi();
        $('#cal_query_from_input').datepicker({ dateFormat: 'yy-mm-dd' });
        $('#cal_query_to_input').datepicker({ dateFormat: 'yy-mm-dd' });
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        $('.calendar_event_field').hide();
        $('#to_cal_form').css({textAlign: "center"});
        authorizeDiv.style.display = 'inline';
    }
}

function handleAuthClickResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        $('#auth_success_alert').show();
        authorizeDiv.style.display = 'none';
        $('#to_cal_form').css({textAlign: "left"});
        $('.calendar_event_field').show();
        loadCalendarApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        $('#auth_alert_alert').show();
        $('.calendar_event_field').hide();
        $('#to_cal_form').css({textAlign: "center"});
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthClickResult);
    return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', function(){
        $('.calendar_event_field').show();
        $('#authorize-div').hide();
        $('#to_cal_form').css({textAlign: "left"});
    });
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
/*function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        var events = resp.items;
        appendPre('Upcoming events:');

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                  when = event.start.date;
                }
                appendPre(event.summary + ' (' + when + ')')
          }
        } else {
            appendPre('No upcoming events found.');
        }
    });
}*/

function createSimpleEvent(summary, start, end) {
    var event = {
        'summary': summary, 
        //'location': '800 Howard St., San Francisco, CA 94103',
        //'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': start,//'2016-05-28T09:00:00-07:00'
            'timeZone': jstz.determine().name()
        },
        'end': {
            'dateTime': end,//'2016-05-28T17:00:00-07:00'
            'timeZone': jstz.determine().name()
        }
        //'recurrence': [
            //'RRULE:FREQ=DAILY;COUNT=2'
        //]
        //'attendees': [
            //{'email': 'lpage@example.com'},
            //{'email': 'sbrin@example.com'}
        //],
        //'reminders': {
            //'useDefault': false,
            //'overrides': [
                //{'method': 'email', 'minutes': 24 * 60},
                //{'method': 'popup', 'minutes': 10}
            //]
        //}
    };

    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });

    request.execute(function(event) {
        showSuccess(localization.getVariable("event_added_to_your_calendar"));
        $('#to_cal_modal').modal('hide');
        
        if (primary_email === null){
            location.reload();
        }
        else{
            $('#calendar_iframe').attr("src", "https://calendar.google.com/calendar/embed?showTitle=0&mode=WEEK&height=480&wkst=1&bgcolor=%23FFFFFF&src="+encodeURIComponent(primary_email)+"&color=%232F6309&ctz="+encodeURIComponent(jstz.determine().name()));
        }
    });
}

function searchEvent(){
    var start_date = $('#cal_query_from_input').val().trim(); 
    var start_time = "00:00:00";
    var end_date = $('#cal_query_to_input').val().trim(); 
    var end_time = "23:00:00";
    
    if ($('#cal_query_input').val().trim().length === 0){
        return 0;
    }
    
    if (start_date.length !== 0 && end_date.length !== 0){
        var request = gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'q': $('#cal_query_input').val().trim(),
            'timeMin': start_date+"T"+start_time+"Z",
            'timeMax': end_date+"T"+end_time+"Z",
            //'timeZone': jstz.determine().name()
        });
    }
    else if (start_date.length === 0 && end_date.length !== 0){
        var request = gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'q': $('#cal_query_input').val().trim(),
            //'timeMin': start_date+"T"+start_time+"Z",
            'timeMax': end_date+"T"+end_time+"Z",
            //'timeZone': jstz.determine().name()
        });
    }
    else if (start_date.length !== 0 && end_date.length === 0){
        var request = gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'q': $('#cal_query_input').val().trim(),
            'timeMin': start_date+"T"+start_time+"Z",
            //'timeMax': end_date+"T"+end_time+"Z",
            //'timeZone': jstz.determine().name()
        });
    }
    else if (start_date.length === 0 && end_date.length === 0){
        var request = gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'q': $('#cal_query_input').val().trim()
            //'timeMin': start_date+"T"+start_time+"Z",
            //'timeMax': end_date+"T"+end_time+"Z",
            //'timeZone': jstz.determine().name()
        });
    }
    
    request.execute(function(event) {
        $('#calendar_search_results').html("");
        
        if (event.items.length === 0){
            $('#nothing_found_h4').show();
            $('#finded_events_h4').hide();
            $('#calendar_search_results').html("");
        }
        else{
            for (var i = 0; i < event.items.length; i++){
                //console.log(event.items)
                $('#nothing_found_h4').hide();
                $('#finded_events_h4').show();
                $('#calendar_search_results').append("<br>"+(i+1)+") <a href='javascript:void(0)' onclick='showEventDay(\""+event.items[i].created.substr(0, 10)+"\")'>"+event.items[i].summary+"</a>");
            }
        }
    });
}

function showEventDay(date){
    //console.log();
    $('#calendar_iframe').attr("src", "https://calendar.google.com/calendar/embed?showTitle=0&mode=WEEK&height=480&wkst=1&bgcolor=%23FFFFFF&src="+encodeURIComponent(primary_email)+"&color=%232F6309&ctz="+encodeURIComponent(jstz.determine().name())+"&dates="+date.replace(/\D+/g,"")+"%2F"+date.replace(/\D+/g,""));
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function openCalendarModal(){
    $('#to_cal_modal').modal('show');
}

function hourForward(){
    var key = Number($('#event_start_time_select option:selected').attr("key"));
    $('#event_end_time_select').val(key != 23 ? (key <= 8 ? "0"+(key+1) : key+1)+":00:00" : "00:00:00");
}

function hourForwardForEvent(){
    var time = $('#add_event_start_time_select').val();
    var hour = Number(time.split(":")[0]);
    var minute = time.split(":")[1];
    var last_time = hour != 23 ? (hour <= 8 ? "0"+(hour+1) : hour+1)+":"+minute : "00:00";
    $('#add_event_end_time_select').val(last_time);
}

function bindCalendarEnterEvents(){
    var events = {
        cal_query_input: "searchEvent()",
        cal_query_from_input: "searchEvent()",
        cal_query_to_input: "searchEvent()"
    };

    for (var key in events){
        $('#'+key).attr({
            "data-onenter-func": events[key],
            onkeypress: "utils.onEnter(event, this)"
        });
    }
}