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
    neighborhood: 'short_name'
};

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
        property.setGeolocOldChange(component, document.getElementById(component).value);
        document.getElementById(component).value = '';
        document.getElementById(component).disabled = false;
    }

    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            //console.log(place);
            document.getElementById(addressType).value = val;
            //property.geoloc[addressType] = place.place_id;
            property.setGeolocNewChange(addressType, document.getElementById(addressType).value);
        }
    }
    
    //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
    //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
}

function fillInCountry() {
    var place = autocomplete_country.getPlace();
    document.getElementById("country").value = '';
    document.getElementById("country").value = place.address_components[0]["long_name"];
    property.geoloc.country = place.place_id;
    var country_short_name = place.address_components[0]["short_name"];
    //autocomplete_region.setOptions({componentRestrictions: {country: country_short_name}});
    autocomplete_city.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_neighborhood.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_route.setOptions({componentRestrictions: {country: country_short_name}});
    
    //fillInAll(autocomplete_country);
    //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
    //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
    
    ac.geolocation = {
        lat: autocomplete_city.getPlace().geometry.location.lat(),
        lng: autocomplete_city.getPlace().geometry.location.lng()
    };
}

/*function fillInRegion() {
    var place = autocomplete_region.getPlace();
    document.getElementById("administrative_area_level_1").value = '';
    document.getElementById("administrative_area_level_1").value = place.address_components[0]["long_name"];
    property.geoloc.region = place.place_id;
    
    fillInAll(autocomplete_region);
}*/

function fillInCity() {
    var place = autocomplete_city.getPlace();
    document.getElementById("locality").value = '';
    document.getElementById("locality").value = place.address_components[0]["long_name"];
    property.geoloc.city = place.place_id;
    ac.getCityLocales(place.place_id);
    //fillInAll(autocomplete_city);
    //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
    //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
}

function fillInNeighborhood() {
    var place = autocomplete_neighborhood.getPlace();
    document.getElementById("neighborhood").value = '';
    document.getElementById("neighborhood").value = place.address_components[0]["long_name"];
    property.geoloc.neighborhood = place.place_id;
    
    synonim.selected.neighborhood = 1;
    synonim.reset();
    //fillInAll(autocomplete_neighborhood);
    
    //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
    //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
}

function fillInRoute() {
    var place = autocomplete_route.getPlace();
    document.getElementById("route").value = '';
    document.getElementById("route").value = place.address_components[0]["long_name"];
    //property.geoloc.street = place.place_id;
    property.onGeolocChange(document.getElementById("route"), 'geoloc')
    property.geoloc.street = place.place_id;
    property.geoloc.lat = autocomplete_route.getPlace().geometry.location.lat();
    property.geoloc.lng = autocomplete_route.getPlace().geometry.location.lng();
    
    synonim.selected.route = 1;
    synonim.reset();
    
    //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
    //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
    //fillInAll(autocomplete_route);
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
      });
      
      ac.geolocation = geolocation;
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
        //autocomplete_route.setBounds(circle.getBounds());
        ac.geolocation = geolocation;
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
          radius: 6000
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
            if (status == google.maps.places.PlacesServiceStatus.OK){
                input.val(place.name).attr({place_name: place.name, place_id: place.place_id}).addClass("ac_synonim_input");
                //ac_synonim.getByPlaceIDForInput(place.place_id);
                property.createEmail();
                //utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
                //utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
            }
        });
    }
    else{
        synonim.autoInsert(placeid, input);
    }
}

function placeDetailsByPlaceIdNoAutocomplete(placeid, service){
    if (placeid == null){
        return;
    }
    
    service.getDetails({placeId: placeid}, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK){
            $('.geoloc_span[placeid="'+placeid+'"]').text(place.name);
            utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
            utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
        }
    });
}