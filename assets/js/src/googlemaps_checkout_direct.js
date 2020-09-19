// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var placeSearch, infowindow, autocomplete_country, service_country, autocomplete_region, service_region, autocomplete_city, service_city, autocomplete_neighborhood, service_neighborhood, autocomplete_route, service_route;
var componentForm = {
    locality_service: 'short_name',
    country_service: 'long_name'
};

function initGoogleMaps() {
    infowindow = new google.maps.InfoWindow();
    service_country = new google.maps.places.PlacesService(document.getElementById('country_service')); 
    service_city = new google.maps.places.PlacesService(document.getElementById('locality_service'));
}

function placeDetailsByPlaceId(placeid, service){
    service.getDetails({placeId: placeid}, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK)
            $('.geoloc_span[placeid="'+placeid+'"]').text(place.name);
    });
}

function placeDetailsByPlaceIdNoAutocomplete(placeid, service){
    service.getDetails({placeId: placeid}, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK)
            $('.geoloc_span[placeid="'+placeid+'"]').text(place.name);
    });
}