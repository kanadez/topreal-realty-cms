var primary_email = null;

/**
 * Handler for the signin callback triggered after the user selects an account.
 */
function onSignInCallback(resp) {
    
    if (resp.status.signed_in == false){
        $('#gConnect').children('div').css({width:"108px", height:"31px"});
        $('#gConnect').children().children().css({width:"108px", height:"31px"});
    }
    else{
        gapi.client.load('plus', 'v1', apiClientLoaded);
        $('#calendar_iframe').show();
        $('#calendar_panel').show();
        $('#gplus_auth_panel').hide();
    }
}

/**
 * Sets up an API call after the Google API client loads.
 */
function apiClientLoaded() {
    gapi.client.plus.people.get({userId: 'me'}).execute(handleEmailResponse);
}

/**
 * Response callback for when the API client receives a response.
 *
 * @param resp The API response object with the user email and profile information.
 */
function handleEmailResponse(resp) {
    for (var i=0; i < resp.emails.length; i++)
        if (resp.emails[i].type === 'account'){ 
            primary_email = resp.emails[i].value;
            $('#calendar_title_email_span').html(primary_email);
        }
    
    //document.getElementById('responseContainer').value = 'Primary email: ' + primaryEmail + '\n\nFull Response:\n' + JSON.stringify(resp); 
    
    $('#calendar_iframe').attr("src", "https://calendar.google.com/calendar/embed?showTitle=0&mode=WEEK&height=380&wkst=1&bgcolor=%23FFFFFF&src="+encodeURIComponent(primary_email)+"&color=%232F6309&ctz="+encodeURIComponent(jstz.determine().name()));
}