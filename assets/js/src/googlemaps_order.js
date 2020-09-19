// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var placeSearch, infowindow, autocomplete_country, service_country, autocomplete_region, service_region, autocomplete_city, service_city, autocomplete_neighborhood, service_neighborhood, autocomplete_route, service_route;
var componentForm = {
    //route: 'short_name',
    locality: 'short_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name'
};

function initAutocomplete() {
    infowindow = new google.maps.InfoWindow();
    service_country = new google.maps.places.PlacesService(document.getElementById('country'));
    autocomplete_country = new google.maps.places.Autocomplete(
      (document.getElementById('country')),
      {types: ['(regions)']});
    autocomplete_country.addListener('place_changed', fillInCountry);
    
    service_region = new google.maps.places.PlacesService(document.getElementById('administrative_area_level_1'));
    autocomplete_region = new google.maps.places.Autocomplete(
      (document.getElementById('administrative_area_level_1')),
      {types: ['(regions)']});
    autocomplete_region.addListener('place_changed', fillInRegion);
    
    service_city = new google.maps.places.PlacesService(document.getElementById('locality'));
    autocomplete_city = new google.maps.places.Autocomplete(
      (document.getElementById('locality')),
      {types: ['(cities)']});
    autocomplete_city.addListener('place_changed', fillInCity);
    
    /*service_neighborhood = new google.maps.places.PlacesService(document.getElementById('neighborhood'));
    autocomplete_neighborhood = new google.maps.places.Autocomplete(
      (document.getElementById('neighborhood')),
      {types: ['geocode']});
    autocomplete_neighborhood.addListener('place_changed', fillInNeighborhood);*/
    
    /*service_route = new google.maps.places.PlacesService(document.getElementById('route'));
    autocomplete_route = new google.maps.places.Autocomplete(
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
    order.geoloc.country = place.place_id;
    var country_short_name = place.address_components[0]["short_name"];;
    //autocomplete_region.setOptions({componentRestrictions: {country: country_short_name}});
    //*стока ниже не должна быть закоментирована, это временно, надо перевести регистрацию на свой Autocomplete 
    //autocomplete_city.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_neighborhood.setOptions({componentRestrictions: {country: country_short_name}});
    //autocomplete_route.setOptions({componentRestrictions: {country: country_short_name}});
    if (order.geoloc.lat == null) order.geoloc.lat = autocomplete_country.getPlace().geometry.location.lat();
    if (order.geoloc.lng == null) order.geoloc.lng = autocomplete_country.getPlace().geometry.location.lng();
    
    order.changeRegisterGeolocData("country");
    
    $('#country_not_selected_error').hide();
    //fillInAll(autocomplete_country);
    
    /*synonim.reset();
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_country.getPlace().geometry.location.lat(),
        autocomplete_country.getPlace().geometry.location.lng(),
        place.place_id
    );*/
}

function fillInRegion() {
    var place = autocomplete_region.getPlace();
    document.getElementById("administrative_area_level_1").value = '';
    document.getElementById("administrative_area_level_1").value = place.address_components[0]["long_name"];
    order.geoloc.region = place.place_id;
    
    order.changeRegisterGeolocData("region");
    //fillInAll(autocomplete_region);
    
    synonim.reset();
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_region.getPlace().geometry.location.lat(),
        autocomplete_region.getPlace().geometry.location.lng(),
        place.place_id
    );
    
    $('#region_not_selected_error').hide();
}

function fillInCity() {
    var place = autocomplete_city.getPlace();
    document.getElementById("locality").value = '';
    document.getElementById("locality").value = place.address_components[0]["long_name"];
    //order.geoloc.city = {};
    order.geoloc.city = place.place_id;
    order.geoloc.lat = autocomplete_city.getPlace().geometry.location.lat();
    order.geoloc.lng = autocomplete_city.getPlace().geometry.location.lng();
    
    order.changeRegisterGeolocData("city");
    //fillInAll(autocomplete_city);
    
    synonim.reset();
    synonim.addGooglePlace(
        place.address_components[0].short_name, 
        place.formatted_address, 
        autocomplete_city.getPlace().geometry.location.lat(),
        autocomplete_city.getPlace().geometry.location.lng(),
        place.place_id
    );
    
    $('#city_not_selected_error').hide();
}

/*function fillInNeighborhood() {
    var place = autocomplete_neighborhood.getPlace();
    document.getElementById("neighborhood").value = '';
    document.getElementById("neighborhood").value = place.address_components[0]["long_name"];
    order.geoloc.neighborhood = place.place_id;
    if (order.geoloc.lat == null) order.geoloc.lat = autocomplete_neighborhood.getPlace().geometry.location.lat();
    if (order.geoloc.lng == null) order.geoloc.lng = autocomplete_neighborhood.getPlace().geometry.location.lng();
    //fillInAll(autocomplete_neighborhood);
}*/

function fillInRoute() {
    var place = autocomplete_route.getPlace();
    document.getElementById("route").value = '';
    document.getElementById("route").value = place.name;
    order.geoloc.street = place.place_id;
    if (order.geoloc.lat == null) order.geoloc.lat = autocomplete_route.getPlace().geometry.location.lat();
    if (order.geoloc.lng == null) order.geoloc.lng = autocomplete_route.getPlace().geometry.location.lng();
    
    order.changeRegisterGeolocData("street");
    //fillInAll(autocomplete_route);
    //console.log(place);
    
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
    if ($('#locality').val().trim().length !== 0){
        //falseGeolocate();
    }
    else if (navigator.geolocation){
        showGeolocBackdrop();
        
        navigator.geolocation.getCurrentPosition(function(position){
            utils.setCookie("geoloc_request_closed", 1,  {expires: 315360000});
            
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            order.geoloc.lat = geolocation.lat;
            order.geoloc.lng = geolocation.lng;
            
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            
            hideAllowGeolocRequest();
            
            $.post("/api/geo/getaddressbylatlng.json", {
                lat: geolocation.lat,
                lng: geolocation.lng,
                locale: $('#locale_select').val()
            }, function(response){
               for (var i = 0; i < response.length; i++){
                   switch (response[i].types[0]){
                        case "street_address":
                           $('#route').val(response[i].address_components[1].short_name+" "+response[i].address_components[0].short_name);
                           order.geoloc.street = response[i].place_id;
                        break;
                        case "administrative_area_level_2":
                            var exist = false;
                            
                            for (var z = 0; z < response.length; z++){
                                if (response[z].types[0] == "locality"){
                                    exist = true;
                                }
                            }
                            
                            if (!exist){
                                $('#locality').val(response[i].address_components[0].short_name);
                                order.geoloc.city = response[i].place_id;
                            }
                        break;
                        case "locality":
                            $('#locality').val(response[i].address_components[0].short_name);
                            order.geoloc.city = response[i].place_id;
                        break;
                        case "administrative_area_level_1":
                            $('#administrative_area_level_1').val(response[i].address_components[0].short_name);
                            order.geoloc.region = response[i].place_id; 
                        break;
                        case "country":
                            $('#country').val(response[i].address_components[0].long_name);
                            order.geoloc.country = response[i].place_id;
                            order.setLocale(response[i].address_components[0].short_name);
                        break;
                        case "postal_code":
                            $('#zipcode').val(response[i].address_components[0].long_name);
                        break;
                   }
               }
            });
            
            autocomplete_country.setBounds(circle.getBounds());
            //autocomplete_region.setBounds(circle.getBounds());
            autocomplete_city.setBounds(circle.getBounds());
        }, function(){
            utils.setCookie("geoloc_request_closed", 1, {expires: 315360000});
            hideAllowGeolocRequest();
        });
    }
}

function showGeolocBackdrop(){
    if (utils.getCookie("geoloc_request_closed") != undefined){
        return false;
    }

    var form = $("<div />", {id: "geoloc_backdrop_div", class: "backdrop"});

    form.height(screen.height);
    form.width(screen.width);
    form.click(function(){
        hideAllowGeolocRequest();
    });

    var arrow = $("<img />", {class: "curved_arrow_top", src: "assets/img/curved_arrow_top.png"});
    var text = '<span id="allow_geoloc_request_span" class="wow pulse" style="color: #fff;" locale="allow_geoloc_us">'+$('#allow_geoloc_request_input').val()+'</span>';

    arrow.click(function(){
        hideAllowGeolocRequest();
    });

    form.append(arrow);
    form.append(text);

    $('#allow_geoloc_request_span').click(function(){
        hideAllowGeolocRequest();
    });
    
    $(document.body).css({height: "100%", overflow: "hidden"});
    $(document.body).append(form);
    
    if (utils.getNavigatorLang() === "he"){
        $('.curved_arrow_top').css({left: screen.width - 250+"px"}).attr("src", "assets/img/curved_arrow_top_arabic.png");
        $('#allow_geoloc_request_span').css({left: screen.width - 850+"px"});
    }
    
    if (utils.getNavigator("ie") || utils.getNavigator("edge")){
        $('.curved_arrow_top').css({left: screen.width/2 + 250+"px", top: "281px"}).attr("src", "assets/img/curved_arrow_bottom_right.png");
        $('#allow_geoloc_request_span').css({left: screen.width/2-340+"px"});
    }
    
    if (utils.getNavigator("opera")){
        $('.curved_arrow_top').css({left: screen.width/2+"px", top: "180px"}).attr("src", "assets/img/curved_arrow_top_arabic.png");
        $('#allow_geoloc_request_span').css({left: screen.width/2-390+"px", top: "341px", width: "400px"});
    }
};

function hideAllowGeolocRequest(){
    $('#geoloc_backdrop_div').animate({opacity: 0}, 300, function(){
        $('#geoloc_backdrop_div').hide();
        $(document.body).css({height: "auto",overflow: "scroll"});
    });
}

function falseGeolocate() {
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

        autocomplete_neighborhood.setBounds(circle.getBounds());
        //autocomplete_route.setBounds(circle.getBounds());
    }
}

function placeDetailsByPlaceId(placeid, service, input) {
    if (placeid != null && placeid != undefined){
        service.getDetails({placeId: placeid}, function (place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK)
                input.val(place.name);
        });
    }
}