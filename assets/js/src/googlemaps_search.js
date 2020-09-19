// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var placeSearch, infowindow, autocomplete_country, service_country, autocomplete_region, service_region, autocomplete_city, service_city, autocomplete_neighborhood, service_neighborhood, autocomplete_route, service_route;
var componentForm = {
    route: 'short_name',
    locality: 'short_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    neighborhood: 'long_name'
};
var place_ids_from_group_details = []; // сюда кладем айдишки мест при групповом чении для списка поиска
var search_service_buffer = null; // буфер для сервиса геокодинга

function initAutocomplete() {
    infowindow = new google.maps.InfoWindow();
    service_country = new google.maps.places.PlacesService(document.getElementById('country'));
    autocomplete_country = new google.maps.places.Autocomplete(
      (document.getElementById('country')),
      {types: ['(regions)']});
    autocomplete_country.addListener('place_changed', fillInCountry);
    
    /*service_region = new google.maps.places.PlacesService(document.getElementById('administrative_area_level_1'));
    autocomplete_region = new google.maps.places.Autocomplete(
      (document.getElementById('administrative_area_level_1')),
      {types: ['(regions)']});
    autocomplete_region.addListener('place_changed', fillInRegion);*/
    
    service_city = new google.maps.places.PlacesService(document.getElementById('locality'));
    autocomplete_city = new google.maps.places.Autocomplete(
      (document.getElementById('locality')),
      {types: ['(cities)']});
    autocomplete_city.addListener('place_changed', fillInCity);
    
    service_neighborhood = new google.maps.places.PlacesService(document.getElementById('neighborhood'));
    /*autocomplete_neighborhood = new google.maps.places.Autocomplete(
      (document.getElementById('neighborhood')),
      {types: ['geocode']});
    autocomplete_neighborhood.addListener('place_changed', fillInNeighborhood);*/
    
    service_route = new google.maps.places.PlacesService(document.getElementById('route'));
    /*autocomplete_route = new google.maps.places.Autocomplete(
      (document.getElementById('route')),
      {types: ['address']});
    autocomplete_route.addListener('place_changed', fillInRoute);*/
}

function fillInAll(autocomplete) {
    var place = autocomplete.getPlace();

    for (var component in componentForm) {
        document.getElementById(component).value = '';
        document.getElementById(component).disabled = false;
    }

    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
        }
    }
}

function fillInCountry() {
    var place = autocomplete_country.getPlace();
    document.getElementById("country").value = '';
    document.getElementById("country").value = place.address_components[0]["long_name"];
    search.geoloc.country = place.place_id;
    var country_short_name = place.address_components[0]["short_name"];;
    //autocomplete_region.setOptions({componentRestrictions: {country: country_short_name}});
    autocomplete_city.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_neighborhood.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_route.setOptions({componentRestrictions: {country: country_short_name}});
    
    if (search.geoloc.lat == null){
        search.geoloc.lat = autocomplete_country.getPlace().geometry.location.lat();
    }
    
    if (search.geoloc.lng == null){
        search.geoloc.lng = autocomplete_country.getPlace().geometry.location.lng();
    }
    //fillInAll(autocomplete_country);
    //console.log("country selected");
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_country.getPlace().geometry.location.lat(),
        autocomplete_country.getPlace().geometry.location.lng(),
        place.place_id
    );
}

/*function fillInRegion() {
    var place = autocomplete_region.getPlace();
    document.getElementById("administrative_area_level_1").value = '';
    document.getElementById("administrative_area_level_1").value = place.address_components[0]["long_name"];
    search.geoloc.region = place.place_id;
    
    //fillInAll(autocomplete_region);
}*/

function fillInCity(){
    var place = autocomplete_city.getPlace();
    
    /*if (place.types[0] != "locality"){
        $('#street_wrapper, #hood_wrapper').hide();
    }
    else{
        $('#street_wrapper, #hood_wrapper').show();
    }*/
    ac.getCityLocales(place.place_id);
    
    $.post("/api/geo/getforlocales.json",{
        place_id: place.place_id
    }, function (response){
        search.geoloc.city_locales = response;
    });
    
    ac.geolocation = {
        lat: autocomplete_city.getPlace().geometry.location.lat(),
        lng: autocomplete_city.getPlace().geometry.location.lng()
    };
    
    document.getElementById("locality").value = '';
    document.getElementById("locality").value = place.address_components[0]["long_name"];
    //search.geoloc.city = {};
    search.geoloc.city = place.place_id;
    search.current_city = place.place_id;
    search.geoloc.lat = autocomplete_city.getPlace().geometry.location.lat(); 
    search.geoloc.lng = autocomplete_city.getPlace().geometry.location.lng();
    //fillInAll(autocomplete_city);
    //console.log("city selected");
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_city.getPlace().geometry.location.lat(),
        autocomplete_city.getPlace().geometry.location.lng(),
        place.place_id
    );
    
    if ($('#locality').val().trim().length > 0){
        $('#neighborhood').attr({disabled: false, placeholder: ""});
        $('#route_input input.ui-autocomplete-input').attr({disabled: false, placeholder: localization.getVariable("start_typing_here")});
        $('#route_input').css("background", "#fff");
    }
}

function fillInNeighborhood() {
    var place = autocomplete_neighborhood.getPlace();
    document.getElementById("neighborhood").value = '';
    document.getElementById("neighborhood").value = place.address_components[0]["long_name"];
    console.log(place);
    search.geoloc.neighborhood = place.place_id;
    
    if (search.geoloc.lat == null){ 
        search.geoloc.lat = autocomplete_neighborhood.getPlace().geometry.location.lat();
    }
    
    if (search.geoloc.lng == null){ 
        search.geoloc.lng = autocomplete_neighborhood.getPlace().geometry.location.lng();
    }
    
    //fillInAll(autocomplete_neighborhood);
    //console.log("hood selected");
    $('#neighborhood_not_selected_error').hide();
    synonim.reset();
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_neighborhood.getPlace().geometry.location.lat(),
        autocomplete_neighborhood.getPlace().geometry.location.lng(),
        place.place_id
    );
}

function fillInRoute() {
    //if (search.geoloc.lat == null) search.geoloc.lat = autocomplete_route.getPlace().geometry.location.lat();
    //if (search.geoloc.lng == null) search.geoloc.lng = autocomplete_route.getPlace().geometry.location.lng();
    //fillInAll(autocomplete_route);
    //console.log("route selected");
    var place = autocomplete_route.getPlace();
    document.getElementById("route").value = '';
    document.getElementById("route").value = place.address_components[0]["long_name"];
    search.geoloc.street_tmp = place.place_id;
    search.geoloc.street_object_tmp = place;
    
    $('#street_not_selected_error').hide();
    synonim.reset();
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_route.getPlace().geometry.location.lat(),
        autocomplete_route.getPlace().geometry.location.lng(),
        place.place_id
    );

}

function geolocate() {
    if ($('#locality').val().trim().length !== 0)
        falseGeolocate();
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocomplete_country.setBounds(circle.getBounds());
        //autocomplete_region.setBounds(circle.getBounds());
        autocomplete_city.setBounds(circle.getBounds());
        ac.geolocation = geolocation;
      });
    }
}

function falseGeolocate() {
    if (autocomplete_city.getPlace() != undefined){
        var geolocation = {
            lat: autocomplete_city.getPlace().geometry.location.lat(),
            lng: autocomplete_city.getPlace().geometry.location.lng()
        };
        var circle = new google.maps.Circle({
            center: geolocation,
            radius: 6000
        });

        //autocomplete_neighborhood.setBounds(circle.getBounds());
        ac.geolocation = geolocation;
        //autocomplete_route.setBounds(circle.getBounds());
    }
}

function falseGeolocateByLatLng(lat, lng) {
    //console.log(lat, lng);
    if (lat != undefined && lng != undefined){
        var geolocation = {
          lat: Number(lat),
          lng: Number(lng)
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: 3000
        });

        autocomplete_city.setBounds(circle.getBounds());
        //autocomplete_neighborhood.setBounds(circle.getBounds());
        //autocomplete_route.setBounds(circle.getBounds());
        ac.geolocation = geolocation;
    }
}

function placeDetailsByPlaceId(placeid, service, input) {
    if (placeid == null){
        return;
    }
    
    if (placeid.length > 11){
        service.getDetails({placeId: placeid}, function (place, status) {
            /*if (service_city == service){
                if (place.types[0] != "locality"){
                    $('#street_wrapper, #hood_wrapper').hide();
                }
                else{
                    $('#street_wrapper, #hood_wrapper').show();
                }
            }*/
            
            if (status == google.maps.places.PlacesServiceStatus.OK){
                input.val(place.name);
                search.lightNotEmpty();
                //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
                //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
            }
        });
    }
    else{
        synonim.autoInsert(placeid, input);
        search.lightNotEmpty();
    }
}

/*function placeDetailsByPlaceIdNoAutocomplete(placeid, service, properties_key){ // версия для сортировки списка выдачи
    if (placeid.length > 11){
        service.getDetails({placeId: placeid}, function (place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK && response_list.properties[properties_key] != undefined){
                $('#property_'+response_list.properties[properties_key].id+'_list_tr .geoloc_span[placeid="'+placeid+'"]').text(place.name);
                response_list.street_names.push([properties_key, place.name.toLowerCase()]);
            }
            else{
                response_list.street_names.push([properties_key, ""]);
            }
        });
    }
    else{
        synonim.autoInsertNoInput(placeid);
    } 
}*/

function placeDetailsByPlaceIdNoAutocomplete(placeid, service, properties_key){
    search_service_buffer = service;
    
    if (placeid == null){
        return;
    }
    
    if (placeid.length > 11){
        $.post("/api/googleac/getshortname.json",{
            placeid: placeid
        }, function(response){
            if (utils.isJSON(response)){
                $('.geoloc_span[placeid="'+response.placeid+'"]').text(response.short_name+(response.synonim != null ? " ("+response.synonim+")" : ""));
            }
            else{
                search_service_buffer.getDetails({placeId: response}, function (place, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK){
                        $('.geoloc_span[placeid="'+response+'"]').text(place.name);
                        //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
                        //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
                        
                        $.post("/api/acsynonim/getbyplaceid.json",{
                            place_id: response
                        }, function(response2){
                            if (response2 != false && response2[1] != null){
                                //var tmp = $('.geoloc_span[placeid="'+response2[0]+'"]').text();
                                if ($('.geoloc_span[placeid="'+response2[0]+'"]').children("span.list_synonim").length === 0){
                                    $('.geoloc_span[placeid="'+response2[0]+'"]').append(" (<span class='list_synonim'>"+response2[1]+"</span>)");
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        synonim.autoInsertNoInput(placeid);
    }
}

function placeDetailsByPlaceIdNoAutocompleteGroup(street_googleac, service, properties_key){
    search_service_buffer = service;
    
    if (street_googleac == null){
        return false;
    }
    
    for (var i = 0; i < street_googleac.places.length; i++){
        if (utils.isJSON(street_googleac.places[i])){
            $('.geoloc_span[placeid="'+street_googleac.places[i].placeid+'"]').text(street_googleac.places[i].short_name);
            //(street_googleac.synonim != null ? " ("+street_googleac.synonim+")" : "")
        }
    }
    
    for (var i = 0; i < street_googleac.synonims.length; i++){
        if (utils.isJSON(street_googleac.synonims[i])){
            $('.geoloc_span[placeid="'+street_googleac.synonims[i].id+'"]').text(street_googleac.synonims[i].text);
        }
    }
    
    for (var i = 0; i < street_googleac.places_synonims.length; i++){
        if (utils.isJSON(street_googleac.places_synonims[i])){
            var text = $('.geoloc_span[placeid="'+street_googleac.places_synonims[i].place_id+'"]').text();
            $('.geoloc_span[placeid="'+street_googleac.places_synonims[i].place_id+'"]').append(" ("+street_googleac.places_synonims[i].text+")");
        }
    }
    
    $('span.geoloc_span').each(function(){
        if ($(this).text().length == 0){
            var placeid = $(this).attr("placeid");
            place_ids_from_group_details.push(placeid);
        }
    });
    
    var unique_place_ids = [];
    
    $.each(place_ids_from_group_details, function(i, el){
        if($.inArray(el, unique_place_ids) === -1) unique_place_ids.push(el);
    });
    
    utils.addGooglePlaceBackend(unique_place_ids);
    //utils.addGooglePlaceLatLngBackend(unique_place_ids);
    
    
    /*search_service_buffer.getDetails({placeId: placeid}, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK){
            $('.geoloc_span[placeid="'+place.place_id+'"]').text(place.name);
            utils.addGooglePlace(place.place_id, placeid, place.name, place.formatted_address);
            utils.addGooglePlaceLatLng(place.geometry.location, place.place_id, placeid);

            /*$.post("/api/acsynonim/getbyplaceid.json",{
                place_id: response
            }, function(response2){
                if (response2 != false && response2[1] != null){
                    //var tmp = $('.geoloc_span[placeid="'+response2[0]+'"]').text();
                    if ($('.geoloc_span[placeid="'+response2[0]+'"]').children("span.list_synonim").length === 0){
                        $('.geoloc_span[placeid="'+response2[0]+'"]').append(" (<span class='list_synonim'>"+response2[1]+"</span>)");
                    }
                }
            });*/
    //    }
    //});
}


function streetDetailsByPlaceId(placeid, service) {
    if (placeid == null){
        return false;
    }
    
    if (placeid.length > 11){
        service.getDetails({placeId: placeid}, function (place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK){
                $("#route_input").tagit("createTag", place.name+'&nbsp;<span class="ac_synonim_badge tag_synonim_text" place_id="'+placeid+'"></span>', placeid);
                synonim.renewTags();
                ac_synonim.getByPlaceID(placeid);
                utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
                utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
            }
        });
    }
    else{
        synonim.autoInsertTag(placeid);
    }
}