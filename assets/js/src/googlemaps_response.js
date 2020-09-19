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

function initGoogleMaps() {
    infowindow = new google.maps.InfoWindow();
    service_country = new google.maps.places.PlacesService(document.getElementById('country')); 
    service_city = new google.maps.places.PlacesService(document.getElementById('locality'));  
    service_neighborhood = new google.maps.places.PlacesService(document.getElementById('neighborhood'));
    service_route = new google.maps.places.PlacesService(document.getElementById('route'));
}

function placeDetailsByPlaceId(placeid, service){
    service.getDetails({placeId: placeid}, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK){
            $('.geoloc_span[placeid="'+placeid+'"]').text(place.name);
            utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
            utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
        }
    });
}

function placeDetailsByPlaceIdNoAutocomplete(placeid, service){
    if (placeid.length > 11){
        service.getDetails({placeId: placeid}, function (place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK){
                $('.geoloc_span[placeid="'+placeid+'"]').text(place.name);
                utils.addGooglePlace(place.place_id, place.name, place.formatted_address);
                utils.addGooglePlaceLatLng(place.geometry.location, place.place_id);
            }
        });
    }
    else{
        synonim.autoInsertNoInput(placeid);
    }
}