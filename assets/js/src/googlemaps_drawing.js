var drawingManager; // объект рисовальщика контурв
var selectedShape; // выбранный контур. в нашем случае любой контур, т.к. в одно время может быть только 1 контур
var map; // карта
var markerCluster = null;
var polygon = null; // полигон контура
var polygon2;
var polygon3; // сюда кладется реальный полигон (НЕ координаты) для ф-ии showAllMarkers()
var markers = [];
var markers_not_showed_counter = 0; // счетчик скрытых маркеров (например, с нулевыми координатами)
var before_exit = 0; // флаг, по которому запрашивается сохранение контура перед переходом в лист
var new_was_created = 0;
var reduced_selected = 0; 
var drawing = 0;
var over30key = 0; // ключ для показа маркеров если их больше 30
var direction = "f"; // направление слайдинга маркеров если больше 30. f = forward, b - backward
var step = 30; // шаг показа маркеров если их больше 30
var overstep = 0; // оверстеп при повороте направления
var step_shape = null; // полигон для прорисовки маркеров в контуре если больше 30
var current_polygon_coords = null;

function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(false);
}

function deleteSelectedShape() {
    if (search.data != null){
        search.data.contour = null;
    }
    
    $('#geo_mode_select').val(2);
    search.changeGeoMode();
    
    if (polygon !== null){
        showAllMarkers();
        polygon.clear();
        polygon = null;
        
        if (selectedShape){
            selectedShape.setMap(null);
        }
    }
    
    if (drawing === 0){
        drawingManager.setOptions({
            drawingMode: google.maps.drawing.OverlayType.POLYGON
        });
        drawing = 1;
        $('#save_contour_button').hide();
        //fitMarkers();
    }
    
    $('#search_entries_founded_span').text(markers.length);
}

function initMap(lat, lng) {
    map = new google.maps.Map(document.getElementById('draw_polygon_area_div'), {
        zoom: 12,
        center: new google.maps.LatLng(lat, lng)
    });
    
    getContour();

    var polyOptions = {
        strokeColor: '#00000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#000000',
        fillOpacity: 0.1,
        editable: false
    };
    // Creates a drawing manager attached to the map that allows the user to draw
    // markers, lines, and shapes.
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        drawingControlOptions: {
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        markerOptions: {
          draggable: true
        },
        polylineOptions: {
          editable: false
        },
        rectangleOptions: polyOptions,
        circleOptions: polyOptions,
        polygonOptions: polyOptions,
        map: map
    });
    
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        drawing = 0;
        
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            $('#save_contour_button').show();
            
            if (location.pathname == "/query" && search.data == null){
                //$('#save_contour_button').hide();
            }
            
            polygon = e.overlay.getPaths();
            polygon3 = e.overlay;
            current_polygon_coords = getPolygonCoords(polygon);
            drawingManager.setDrawingMode(null);
            drawingManager.setOptions({
                drawingControl: false
            });
            
            if (search.data === null){
                var polygon_center_lat = getPolygonCenter(current_polygon_coords).lat();
                var polygon_center_lng = getPolygonCenter(current_polygon_coords).lng();
                openInfoWindow(polygon_center_lat, polygon_center_lng, "contour_on_empty_search_msg");
            }

            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
            setSelection(newShape);
            step_shape = newShape;
            
            clearMarkers();
            
            if (response_map.data != null){
                /*if (response_map.data.length > 30){
                    showNext30MarkerWithinPolygon();
                }
                else */if (response_map.data.length > 0){
                    for (var i = 0; i < response_map.data.length; i++){
                        var currency_id = response_map.data[i].currency_id;
                        
                        if (currency_id != null && response_map.data[i].price != null){
                            setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+response_map.form_options.currency[currency_id]["symbol"], response_map.data[i].id, newShape, response_map.data[i].statuses);
                        }
                    }
                    
                    /*if (markers.length == 200){
                        utils.warningModal("<span locale='too_gig_contour'></span>");
                        localization.toLocale();
                    }*/
                    
                    $('#search_entries_founded_span').text(markers.length);
                    $('#search_entries_marked_span').text(0);
                    response_map.selected_property = [];
                }
            }
            
            new_was_created = 1;
            
            clearMarkerCluster();
            markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        }
    });
    

    // Clear the current selection when the drawing mode is changed, or when the
    // map is clicked.
    //google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    //google.maps.event.addListener(map, 'click', clearSelection);
    draw_new_contour_event = google.maps.event.addDomListener(document.getElementById('draw_new_button'), 'click', deleteSelectedShape);
}

function setMarkerWithinPolygon(lat, lng, text, property, polygon, status){
    if (lat != null && lng != null && lat > 0 && lng > 0){
        var latLng = new google.maps.LatLng(lat, lng);

        if (google.maps.geometry.poly.containsLocation(latLng, polygon)){
            setMapMarker(latLng, text, property, status);
        }
    }
}

function setMarker(lat, lng, text, property, status){
    var latLng = new google.maps.LatLng(lat, lng);
    
    setMapMarker(latLng, text, property, status);
}

function clearMarkers(){
    if (markers.length > 0){
        for(var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        
        markers = [];
    }
}

function reduceMarkers(){
    if (response_map.selected_property.length > 0){
        reduced_selected = 1;
        $('#unreduce_button').show().unbind("click").click(function(){
            showAllMarkers();
        });
        //$('#reduce_button').hide();
        var markers_tmp = [];
        
        for(var i = 0; i < markers.length; i++){
            if (markers[i].labelClass != "maplabel_selected"){
                markers[i].setMap(null);
            }
            else{
                markers_tmp.push(markers[i]);
            }
        }
        
        markers = markers_tmp;
        clearMarkerCluster();
        markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        
        response_map.saveSelected();
    }
}

function showAllMarkers(){
    reduced_selected = 0;
    response_map.selected = null;
    markers_not_showed_counter = 0;
    $('#unreduce_button').hide();
    $('#map_unmark_all_button').hide();
    $('#map_mark_all_button').show();
    response_map.selected_property = [];
    $('#search_entries_marked_span').html(response_map.selected_property.length);
    clearMarkers();
    
    if (response_map.data != null && response_map.data.length > 0){
        for (var i = 0; i < response_map.data.length; i++){
            var currency_id = response_map.data[i].currency_id;
            var latLng = new google.maps.LatLng(response_map.data[i].lat, response_map.data[i].lng);

            if (currency_id != null && response_map.data[i].price != null){
                if (polygon == null){
                    setMapMarker(latLng, utils.numberWithCommas(response_map.data[i].price)+" "+response_map.form_options.currency[currency_id]["symbol"], response_map.data[i].id, response_map.data[i].statuses);
                }
                else{
                    setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+response_map.form_options.currency[currency_id]["symbol"], response_map.data[i].id, polygon3, response_map.data[i].statuses);
                }
            }
        }
        
        clearMarkerCluster();
        markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }
}

function markAllMarkers(){
    response_map.selected_property = [];
    
    for (var i = 0; i < markers.length; i++){
        markers[i].setOptions({labelClass: "maplabel_selected"});
        response_map.selected_property.push(markers[i].markerID);
        $('#search_entries_marked_span').html(response_map.selected_property.length);
    }
    
    $('#map_unmark_all_button').show();
    $('#map_mark_all_button').hide();
    response_map.saveSelected();
}

function setMapMarker(latLng, text, property, status){
    if (latLng.lat() === 0 || latLng.lng() === 0){
        markers_not_showed_counter++;
        $('#hidden_wrapper').show();
        $('#search_entries_hidden_span').text(markers_not_showed_counter);
        
        //if (response_map.data.length < 30){
        //    $('#search_entries_showed_span').text(response_map.data.length-markers_not_showed_counter);
        //}
        
        return -1;
    }
    
    var marker = new MarkerWithLabel({
        position: latLng,
        map: map,
        icon: status == 5 || status == 7 ? "assets/img/broker_marker.png" : "",
        labelContent: text,
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: "maplabel", // the CSS class for the label
        markerID: property,
        labelStyle: {opacity: 0.75}
    });

    /*var iw1 = new google.maps.InfoWindow({
        content: "Home For Sale"
      });

    google.maps.event.addListener(marker1, "click", function (e) { iw1.open(response_map.map, this); });*/

    google.maps.event.addListener(marker, "click", function(e){ 
        var exist = 0;

        for (var i = 0; i < response_map.selected_property.length; i++){
            if (response_map.selected_property[i] == property){
                response_map.selected_property[i] = null;
                marker.setOptions({labelClass: "maplabel"});
                exist = 1;
            }
        }
        
        if (!exist){
            marker.setOptions({labelClass: "maplabel_selected"});
            response_map.selected_property[i] = property;
        }
        
        var tmp = [];
            
        for (var i = 0; i < response_map.selected_property.length; i++){
            if (response_map.selected_property[i] != null){
                tmp.push(response_map.selected_property[i]);
            }
        }
        
        // показываем кол-во выделенных карточек. работает правильно.
        $('#search_entries_marked_span').html(tmp.length);
        
        response_map.selected_property = tmp;
        response_map.saveSelected();
    });
    
    google.maps.event.addListener(marker, "dblclick", function(e){ 
        location.href = "property?id="+marker.markerID+(search.data != null ? "&search="+search.data.id : "&search=default")+"&response=map";
    });
    
    markers.push(marker);
    //console.log(polygon);
    
    if (polygon == null){
        fitMarkers();
    }
    else{
        fitContour();
    }
}

function fitMarkers(){
    if (markers.length === 0){
        return 0;
    }
    
    if (polygon !== null){
        return 0;
    }
    
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }

    map.fitBounds(bounds);
}

function fitContour(){
    if (polygon === null){
        return 0;
    }
    
    var a = polygon.getArray()[0];
    var b = [];
    
    //console.log(a);

    for (var i = 0; i < a.j.length; i++){
        b.push(a.j[i]);
    }
    
    //console.log(b);

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < b.length; i++) {
        bounds.extend(b[i]);
    }

    map.fitBounds(bounds);
}

function selectMarker(property){ //  выбирает маркет автоматически на основе ИД недвижимости
    var exist = 0;
    var marker = findMarker(property);

    for (var i = 0; i < response_map.selected_property.length; i++){
        if (response_map.selected_property[i] == property){
            response_map.selected_property[i] = null;
            marker.setOptions({labelClass: "maplabel"});
            exist = 1;
        }
    }
    if (!exist){
        marker.setOptions({labelClass: "maplabel_selected"});
        response_map.selected_property[i] = property;
    }

    var tmp = [];

    for (var i = 0; i < response_map.selected_property.length; i++){
        if (response_map.selected_property[i] != null){
            tmp.push(response_map.selected_property[i]);
        }
    }

    response_map.selected_property = tmp;
    response_map.saveSelected();
}

function findMarker(property){
    for (var i = 0; i < markers.length; i++){
        if (markers[i].markerID == property){
            return markers[i];
        }
    }
}

function openSaveContourModal(){
    if (polygon != null){
        $('#contour_save_request_modal').modal("hide");
        $.post("/api/contour/list.json",{
            search: search.data != null ? search.data.id : search.temporary_id
        },function (response_map){
            if (response_map.length > 0){
                $('#saved_contours_modal').modal('show');
                $('#contours_list_table tbody').html('<tr><td></td><td><span class="contour_author_span" agent="'+user.id+'"></span></td><td><input id="contour_name_input" onkeypress="utils.onEnter(event, this)" data-onenter-func="createContour()" maxlength="20" style="width:100%;" /></td><td style="text-align:center"><button id="contour_create_button" onclick="createContour()" type="button" class="btn btn-primary"><i class="fa fa-save"></i></button></td></tr>');

                for (var i = 0; i < response_map.length; i++){
                    if (response_map[i].temporary == 0){
                        $('#contours_list_table tbody').append('<tr><td><input type="checkbox" style="display:none;" data-contour-id="'+response_map[i].id+'" class="saved_contours_export_checkbox"/></td><td><span class="contour_agent_span" agent="'+response_map[i].author+'"></span></td><td><span id="contour_'+response_map[i].id+'_title_span">'+response_map[i].title+'</span></td><td style="text-align:center"><button id="contour_create_button" onclick="rewriteContour('+response_map[i].id+')" type="button" class="btn btn-primary"><i class="fa fa-save"></i></button></td></tr>');
                    }
                }
                
                $.post("/api/agency/getagentslist.json",{
                },function (result){
                    for (var i = 0; i < result.length; i++){
                        if ($('.contour_agent_span[agent='+result[i].id+']').length !== 0)
                            $('.contour_agent_span[agent='+result[i].id+']').text(result[i].name);
                    }
                });
            }
            else{
                $('#save_contour_modal').modal('show');
            }
        });
    }
}

function openSavedContoursModal(){
    $.post("/api/contour/list.json",{
        search: search.data != null ? search.data.id : search.temporary_id
    },function (response_map){
        if (response_map.length > 0){
            $('#saved_contours_modal').modal('show');
            $('#contours_list_table tbody').html("");
            
            var open_contour_function = search.response_type === "map" ? "openContour" : "openMyContourOnList";

            for (var i = 0; i < response_map.length; i++)
                $('#contours_list_table tbody').append('<tr>\n\
                    <td>\n\
                        <input type="checkbox" style="display:none;" data-contour-id="'+response_map[i].id+'" class="saved_contours_export_checkbox"/>\n\
                    </td>\n\
                    <td>\n\
                        <span class="contour_agent_span" agent="'+response_map[i].author+'"></span>\n\
                    </td>\n\
                    <td>\n\
                        <span id="contour_'+response_map[i].id+'_title_span">'+response_map[i].title+'</span>\n\
                        <input id="contour_'+response_map[i].id+'_title_input" onkeypress="utils.onEnter(event, this)" data-onenter-func="saveContourTitle('+response_map[i].id+')" maxlength="100" value="'+response_map[i].title+'" style="display:none;width:100%;" />\n\
                    </td>\n\
                    <td style="text-align:center">\n\
                        <button id="contour_'+response_map[i].id+'_title_save_button" onclick="saveContourTitle('+response_map[i].id+')" type="button" style="display:none;" class="btn btn-primary">\n\
                            <i class="fa fa-floppy-o"></i>\n\
                        </button>\n\
                        <button id="contour_'+response_map[i].id+'_title_edit_button" onclick="editContourTitle('+response_map[i].id+')" type="button" style="'+((user.id != response_map[i].author && (user.type == 3 || user.type == 1)) ? "display:none" : "")+'" class="btn btn-primary">\n\
                            <i class="icon-pencil"></i>\n\
                        </button>\n\
                        <button id="contour_'+response_map[i].id+'_delete_button" onclick="deleteContour('+response_map[i].id+')" type="button" style="'+((user.id != response_map[i].author && (user.type == 3 || user.type == 1)) ? "display:none" : "")+'" class="btn btn-primary">\n\
                            <i class="icon-close"></i>\n\
                        </button>\n\
                        <button id="contour_'+response_map[i].id+'_restore_button" onclick="restoreContour('+response_map[i].id+')" type="button" style="display:none" class="btn btn-primary">\n\
                            <i class="fa fa-refresh"></i>\n\
                        </button>\n\
                        <button id="contour_open_button" onclick="'+open_contour_function+'('+response_map[i].id+')" type="button" class="btn btn-primary">\n\
                            <i class="fa fa-folder"></i>\n\
                        </button>\n\
                    </td>\n\
                </tr>');

            $.post("/api/agency/getagentslist.json",{
            },function (result){
                for (var i = 0; i < result.length; i++){
                    if ($('.contour_agent_span[agent='+result[i].id+']').length !== 0)
                        $('.contour_agent_span[agent='+result[i].id+']').text(result[i].name);
                }
            });
        }
        else{
            utils.warningModal(localization.getVariable("no_contours"));
        }
    });
}

function openPreContoursModal(){
    //if (search.current_city != null){
        $.post("/api/contour/prelist.json",{
            city: search.current_city != null && $('#locality').val().trim().length > 0 ? search.current_city : ""
        },function (response_map){
            if (response_map.length > 0){
                $('#pre_contours_modal').modal('show');
                $('#pre_contours_list_table tbody').html("");

                var open_contour_function = search.response_type === "map" ? "openPreContour" : "openPreContourOnList";
                var column_length = response_map.length/3;
                var first_column = [];
                var second_column = [];
                var third_column = [];
                
                for (var i = 0; i < response_map.length; i++){
                    $('#pre_contours_list_table tbody').append('<tr class="row'+i+'"></tr>');
                    
                    if (i < column_length && response_map[i] != undefined){
                        first_column.push(response_map[i]);
                    }
                    else if (i < column_length*2 && response_map[i] != undefined){
                        second_column.push(response_map[i]);
                    }
                    else if (i < column_length*3 && response_map[i] != undefined){
                        third_column.push(response_map[i]);
                    }
                    
                    /*if (response_map[i] != undefined){
                        $('#pre_contours_list_table tbody tr.row'+i).append('<td class="hl_pointer" onclick="'+open_contour_function+'('+response_map[i].id+')">\n\
                                <span id="contour_'+response_map[i].id+'_title_span">'+response_map[i].title+'</span>\n\
                            </td>');
                    }
                    
                    if (response_map[i+1] != undefined){
                        $('#pre_contours_list_table tbody tr.row'+i).append('<td class="hl_pointer" onclick="'+open_contour_function+'('+response_map[i+1].id+')">\n\
                                <span id="contour_'+response_map[i+1].id+'_title_span">'+response_map[i+1].title+'</span>\n\
                            </td>');
                    }
                    
                    if (response_map[i+2] != undefined){
                        $('#pre_contours_list_table tbody tr.row'+i).append('<td class="hl_pointer" onclick="'+open_contour_function+'('+response_map[i+2].id+')">\n\
                                <span id="contour_'+response_map[i+2].id+'_title_span">'+response_map[i+2].title+'</span>\n\
                            </td>');
                    }
                    
                    i += 2;*/
                }
                
                for (var i = 0; i < response_map.length; i++){
                    $('#pre_contours_list_table tbody tr.row'+i).append((first_column[i] != undefined ? '<td class="hl_pointer" onclick="'+open_contour_function+'('+first_column[i].id+')"><span id="contour_'+first_column[i].id+'_title_span">'+first_column[i].title+'</span></td>' : "")+
                    (second_column[i] != undefined ? '<td class="hl_pointer" onclick="'+open_contour_function+'('+second_column[i].id+')"><span id="contour_'+second_column[i].id+'_title_span">'+second_column[i].title+'</span></td>' : "")+
                    (third_column[i] != undefined ? '<td class="hl_pointer" onclick="'+open_contour_function+'('+third_column[i].id+')"><span id="contour_'+third_column[i].id+'_title_span">'+third_column[i].title+'</span></td>' : ""));
                }
            }
            else{
                utils.warningModal(localization.getVariable("no_precontours"));
            }
        });
    //}
    //else{
    //    utils.warningModal(localization.getVariable("set_city_to_change"));
    //}
}

function editContourTitle(contour_id){
    $('#contour_'+contour_id+'_title_span').hide();
    $('#contour_'+contour_id+'_title_input').show();
    $('#contour_'+contour_id+'_title_save_button').show();
    $('#contour_'+contour_id+'_title_edit_button').hide();
}

function saveContourTitle(contour_id){
    $.post("/api/contour/savetitle.json",{
        id: contour_id,
        title: $('#contour_'+contour_id+'_title_input').val()
    },function (response){
        if (response.error != undefined)
             showErrorMessage(response.error.description);
        else{
            $('#contour_'+response.id+'_title_span').show().text(response.title);
            $('#contour_'+response.id+'_title_input').hide().val(response.title);
            $('#contour_'+response.id+'_title_save_button').hide();
            $('#contour_'+response.id+'_title_edit_button').show();
        }
    });
};

function deleteContour(contour_id){
    $.post("/api/contour/delete.json",{
        id: contour_id
    },function (response){
        if (response.error != undefined)
            utils.errorModal(localization.getVariable(response.error.description));
        else{
            $('#contour_'+response+'_delete_button').hide();
            $('#contour_'+response+'_restore_button').show();
        }
    });
};

function restoreContour(contour_id){
    $.post("/api/contour/restore.json",{
        id: contour_id
    },function (response){
        if (response.error != undefined)
             showErrorMessage(response.error.description);
        else{
            $('#contour_'+response+'_delete_button').show();
            $('#contour_'+response+'_restore_button').hide();
        }
    });
};

function createContour(){
    if ($('#contour_name_input').val().trim().length > 0)
        $.post("/api/contour/createnew.json",{
            search_id: response_map.search_id || null,
            contour_title: $('#contour_name_input').val().trim(),
            contour_data: function(){
                var a = polygon.getArray()[0];
                var b = [];

                for (var i = 0; i < a.j.length; i++){
                    b.push({"lat": a.j[i].lat(), "lng": a.j[i].lng()});
                }
                
                fitContour();

                return JSON.stringify(b);
            },
            city: search.current_city
        },function (result){
            if (result.error != undefined)
                utils.errorModal(result.error.description);
            else{
                showSuccess(localization.getVariable("contour_saved"));
                $('#save_contour_modal').modal('hide');
                $('#saved_contours_modal').modal('hide');
                new_was_created = 0;
                
                if (before_exit === 1){
                    location.href = "query?id="+response_map.search_id+(response_map.selected != null ? "&selected="+response_map.selected : "")+"&response=map";
                }
            }
        });

    //for (var i = 0; i < this.form_buttons_to_block.length; i++)
        //$('#'+this.form_buttons_to_block[i]).attr("disabled", true);
}

function createTemporaryContour(search){
    $.post("/api/contour/createnewtmp.json",{
        search_id: search,
        contour_data: function(){
            var a = polygon.getArray()[0];
            var b = [];

            for (var i = 0; i < a.j.length; i++){
                b.push({"lat": a.j[i].lat(), "lng": a.j[i].lng()});
            }

            //fitContour();

            return JSON.stringify(b);
        },
        city: search.current_city
    }, null);
}

function rewriteContour(id){
    $.post("/api/contour/set.json",{
        contour_id: id,
        search_id: response_map.search_id || null,
        contour_data: function(){
            var a = polygon.getArray()[0];
            var b = [];

            for (var i = 0; i < a.j.length; i++){
                b.push({"lat": a.j[i].lat(), "lng": a.j[i].lng()});
            }
            
            //console.log(b);

            return JSON.stringify(b);
        },
        city: search.current_city
    },function (result){
        if (result.error != undefined)
            utils.errorModal(result.error.description);
        else{
            showSuccess(localization.getVariable("contour_rewrited"));
            $('#save_contour_modal').modal('hide');
            $('#saved_contours_modal').modal('hide');
            new_was_created = 0;
            
            if (before_exit === 1){
                location.href = "query?id="+response_map.search_id+(response_map.selected != null ? "&selected="+response_map.selected : "")+"&response=map";
            }
        }
    });

    //for (var i = 0; i < this.form_buttons_to_block.length; i++)
        //$('#'+this.form_buttons_to_block[i]).attr("disabled", true);
}

function getContour(){
    if (response_map.data.length > 0){      
        $.post("/api/contour/get.json",{
            search_id: response_map.search_id != -1 ? response_map.search_id : location.pathname != "/map" ? search.defaults.search.id : null
        },function (result){
            if (result == null){
                clearMarkers();

                /*if (response_map.data.length > 30){
                    showNext30Marker();
                }
                else */if (response_map.data.length > 0){
                    for (var i = 0; i < response_map.data.length; i++){
                        var currency_id = response_map.data[i].currency_id;
                        
                        if (global_data.search_getselectedonmap != null){
                            var selected_on_map = JSON.parse(global_data.search_getselectedonmap.data);
                            var property_id = Number(response_map.data[i].id);
                            var property_price = response_map.data[i].price;

                            if (currency_id != null && property_price != null){
                                if (selected_on_map.indexOf(property_id) != -1){
                                    setMarker(
                                        response_map.data[i].lat, 
                                        response_map.data[i].lng, 
                                        utils.numberWithCommas(property_price)+" "+response_map.form_options.currency[currency_id]["symbol"], 
                                        response_map.data[i].id, response_map.data[i].statuses
                                    );
                                }
                            }
                        }
                        else{
                            var property_id = Number(response_map.data[i].id);
                            var property_price = response_map.data[i].price;

                            if (currency_id != null && property_price != null){
                                setMarker(
                                    response_map.data[i].lat, 
                                    response_map.data[i].lng, 
                                    utils.numberWithCommas(property_price)+" "+response_map.form_options.currency[currency_id]["symbol"], 
                                    response_map.data[i].id, response_map.data[i].statuses
                                );                                
                            }
                        }
                    }
                }
            }
            else{
                drawingManager.setDrawingMode(null);
                var coords = current_polygon_coords = JSON.parse(result);
                var polygon_tmp = new google.maps.Polygon({
                    paths: coords,
                    strokeColor: '#000000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#000000',
                    fillOpacity: 0.1,
                    editable: false
                });
                polygon_tmp.setMap(map);
                polygon = polygon_tmp.getPaths();
                polygon3 = polygon_tmp;
                google.maps.event.addListener(polygon, 'click', function() {
                    setSelection(polygon);
                });
                step_shape = polygon_tmp;

                clearMarkers();

                /*if (response_map.data.length > 30){
                    showNext30MarkerWithinPolygon();
                }
                else */if (response_map.data.length > 0){
                    for (var i = 0; i < response_map.data.length; i++){
                        var currency_id = response_map.data[i].currency_id;
                        
                        if (currency_id != null && response_map.data[i].price != null){
                            setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+response_map.form_options.currency[currency_id]["symbol"], response_map.data[i].id, polygon_tmp, response_map.data[i].statuses);
                        }
                    }
                    
                    /*if (markers.length == 200){
                        utils.warningModal("<span locale='too_gig_contour'></span>");
                        localization.toLocale();
                    }*/
                    
                    $('#search_entries_founded_span').text(markers.length);
                }
                
                if ($('#contour_select').val() == 0){
                    $('#save_contour_button').show();
                }
            }
            
            //############# deleting contour if New Contour clicked from list ################//
            
            if (urlparser.getParameter("action") === "new_contour" && !user.isGuest()){
                deleteSelectedShape();
            }
            
            //####################### applying selected-on-map ###############################//
            selectMarkersFromList();
            /*if (urlparser.getParameter("selected") != undefined){
                $.post("/api/search/getselectedonmap.json",{
                    id: urlparser.getParameter("selected")
                },function (result){
                    if (result.error != undefined)
                        showErrorMessage(result.error.description);
                    else{
                        var obj = JSON.parse(result.data);

                        for (var i = 0; i < response_map.data.length; i++){
                            var exist = 0;

                            for (var m = 0; m < obj.length; m++){
                                if (obj[m] == response_map.data[i].id){
                                    exist++;
                                }
                            }

                            if (exist != 0){
                                //console.log('span[property_card="'+obj[m]+'"]');
                                selectMarker(response_map.data[i].id);
                                //$('span[property_card="'+response_map.properties[i].id+'"]').parent().parent().show();
                            }
                        }

                        if (result.reduced == 1)
                            reduceMarkers();
                    }
                });
            }*/
            
            fitContour();
            clearMarkerCluster();
            markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            user.initGuestMapTips();
            
            if (response_map.single_property != null){
                map.setZoom(18);
            }
        });
    }
}

function openPreContour(id){
    $.post("/api/contour/copy.json",{
        id: id,
        search: search.data != null ? search.data.id : search.temporary_id
    }, function(response){
        var contour_id = response[0];
        var contour_title = response[1];
        
        search.geo_mode = 2;
        $('#geo_mode_select').val(2);
        search.changeGeoMode();
        openContour(contour_id);
        $('#contour_select').append('<option class="old" value="'+contour_id+'">'+contour_title+'</option>');
        $('#contour_select').val(contour_id);
        $('#pre_contours_modal').modal("hide");
    });
}

function openContour(id){
    drawing = 0;
    $('#saved_contours_modal').modal('hide');
    deleteSelectedShape();
    
    if (search.data == null){
        openContourOnList(id);
    }
    else{
        search.data.contour = id;
    }
    
    $.post("/api/contour/getbyid.json",{
        id: id
    },function (result){
        if (result.error != undefined)
            showErrorMessage(result.error.description);
        else{
            drawingManager.setDrawingMode(null);
            var coords = JSON.parse(result);
            var polygon_tmp = new google.maps.Polygon({
                paths: coords,
                strokeColor: '#000000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#000000',
                fillOpacity: 0.1,
                editable: false
            });
            polygon_tmp.setMap(map);
            drawing = 0;
            polygon = polygon_tmp.getPaths();
            polygon3 = polygon_tmp;
            google.maps.event.addListener(polygon, 'click', function() {
                setSelection(polygon);
            });
            step_shape = polygon_tmp;

            clearMarkers();

            if (response_map.data != null){
                /*if (response_map.data.length > 30){
                    showNext30MarkerWithinPolygon();
                }
                else*/ if (response_map.data.length > 0){
                    for (var i = 0; i < response_map.data.length; i++){
                        var currency_id = response_map.data[i].currency_id;
                        
                        if (currency_id != null && response_map.data[i].price != null){
                            setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+response_map.form_options.currency[currency_id]["symbol"], response_map.data[i].id, polygon_tmp, response_map.data[i].statuses);
                        }
                    }
                    
                    /*if (markers.length == 200){
                        utils.warningModal("<span locale='too_gig_contour'></span>");
                        localization.toLocale();
                    }*/
                    
                    $('#search_entries_founded_span').text(markers.length);
                }
            }
            
            fitContour();
            
            clearMarkerCluster();
            markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            user.initGuestMapTips();
        }
    });
}

function openPreContourOnList(id){
    $.post("/api/contour/copy.json",{
        id: id,
        search: search.data != null ? search.data.id : search.temporary_id
    }, function(response){
        var contour_id = response[0];
        var contour_title = response[1];
        
        search.geo_mode = 2;
        $('#geo_mode_select').val(2);
        search.changeGeoMode();
        $('#contour_select').append('<option class="old" value="'+contour_id+'">'+contour_title+'</option>');
        $('#contour_select').val(contour_id);
        openContourOnList(contour_id);
        $('#pre_contours_modal').modal("hide");
    });
}

function openMyContourOnList(id){
    search.geo_mode = 2;
    $('#geo_mode_select').val(2);
    search.changeGeoMode();
    $('#contour_select').val(id);
    openContourOnList(id);
}

function openContourOnList(id){
    $('#saved_contours_modal').modal('hide');
    
    if (search.temporary_id !== null){
        search.query();
    }
    else{ 
        search.updateList();
    }
}

function showNext30MapMarker(){
    changeDirectionForward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key+step > response_map.data.length ? response_map.data.length : over30key+step;
    over30key += overstep;

    $('#search_entries_showed_span').html(over30key+" - "+top_border);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30MapMarker()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30MapMarker()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key; i < top_border; i++){
        var currency_id = response_map.data[i].currency_id;
        var latLng = new google.maps.LatLng(response_map.data[i].lat, response_map.data[i].lng);

        setMapMarker(latLng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function showNext30Marker(){
    changeDirectionForward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key+step > response_map.data.length ? response_map.data.length : over30key+step;
    over30key += overstep;
    
    $('#search_entries_showed_span').html(over30key+" - "+top_border);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30Marker()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30Marker()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key; i < top_border; i++){
        var currency_id = response_map.data[i].currency_id;
        setMarker(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function showNext30MarkerWithinPolygon(){
    changeDirectionForward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key+step > response_map.data.length ? response_map.data.length : over30key+step;
    over30key += overstep;

    $('#search_entries_showed_span').html(over30key+" - "+top_border);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30MarkerWithinPolygon()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30MarkerWithinPolygon()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key; i < top_border; i++){
        var currency_id = response_map.data[i].currency_id;
        setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, step_shape, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function showPrevious30MapMarker(){
    changeDirectionBackward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key-step < 0 ? 0 : over30key-step;
    over30key -= overstep;

    $('#search_entries_showed_span').html(top_border+" - "+over30key);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30MapMarker()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30MapMarker()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key-1; i >= top_border; i--){
        var currency_id = response_map.data[i].currency_id;
        var latLng = new google.maps.LatLng(response_map.data[i].lat, response_map.data[i].lng);

        setMapMarker(latLng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function showPrevious30Marker(){
    changeDirectionBackward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key-step < 0 ? 0 : over30key-step;
    over30key -= overstep;
    
    $('#search_entries_showed_span').html(top_border+" - "+over30key);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30Marker()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30Marker()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key-1; i >= top_border; i--){
        var currency_id = response_map.data[i].currency_id;
        setMarker(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function showPrevious30MarkerWithinPolygon(){
    changeDirectionBackward();
    markers_not_showed_counter = 0;
    $('#hidden_wrapper').hide();
    var top_border = over30key-step < 0 ? 0 : over30key-step;
    over30key -= overstep;

    $('#search_entries_showed_span').html(top_border+" - "+over30key);
    //$('#over30_wrapper').show();
    $('#show_next_30_button').attr("onclick", "showNext30MarkerWithinPolygon()");
    $('#show_previous_30_button').attr("onclick", "showPrevious30MarkerWithinPolygon()");
    disableSlideButtons(top_border);
    clearMarkers();

    for (var i = over30key-1; i >= top_border; i--){
        var currency_id = response_map.data[i].currency_id;
        setMarkerWithinPolygon(response_map.data[i].lat, response_map.data[i].lng, utils.numberWithCommas(response_map.data[i].price)+" "+(currency_id != null ? response_map.form_options.currency[currency_id]["symbol"] : ""), response_map.data[i].id, step_shape, response_map.data[i].statuses);
    }

    over30key = top_border;
}

function disableSlideButtons(top_border){
    if (top_border === response_map.data.length){
        $('#show_next_30_button').attr("disabled", true);
    }
    else{
        $('#show_next_30_button').attr("disabled", false);
    }
    
    if (top_border == 0 || over30key == 0){
        $('#show_previous_30_button').attr("disabled", true);
    }
    else{
        $('#show_previous_30_button').attr("disabled", false);
    }
}

function changeDirectionForward(){
    if (direction === "b"){
        direction = "f";
        step = 60;
        overstep = 30;
    }
    else if (direction === "f"){
        step = 30;
        overstep = 0;
    }
}

function changeDirectionBackward(){
    if (direction === "f"){
        direction = "b";
        step = 60;
        overstep = 30;
    }
    else if (direction === "b"){
        step = 30;
        overstep = 0;
    }
}

function clearMarkerCluster(){
    if (markerCluster != null){
        markerCluster.setMap(null);
        markerCluster = null;
    }
}

function rad(x) {
    return x*Math.PI/180;
}

function findCenterClosestMarker() {
    var lat = map.getCenter().lat();
    var lng = map.getCenter().lng();
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
    
    for (var i = 0; i < markers.length; i++){
        var mlat = markers[i].position.lat();
        var mlng = markers[i].position.lng();
        var dLat  = rad(mlat - lat);
        var dLong = rad(mlng - lng);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        distances[i] = d;
        
        if (closest == -1 || d < distances[closest]) {
            closest = i;
        }
    }
    
    return markers[closest];    
}

function getPolygonCenter(coords){
    var bounds = new google.maps.LatLngBounds();
    var polygonCoords = [];
    
    for (var i = 0; i < coords.length; i++){
        polygonCoords.push(new google.maps.LatLng(coords[i].lat, coords[i].lng));
    }

    for (var i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }
    
    return bounds.getCenter();
}

function getPolygonCoords(polygon){
    var a = polygon.getArray()[0];
    var b = [];

    for (var i = 0; i < a.j.length; i++){
        b.push({"lat": a.j[i].lat(), "lng": a.j[i].lng()});
    }
    
    return b;
}

function openInfoWindow(lat, lng, message_locale_var){
    var coords_latlng = new google.maps.LatLng(lat, lng);
    var infoWnd = new google.maps.InfoWindow({
        content : "<div style='direction:"+(localization.isArabian() ? "rtl" : "ltr")+";'>"+localization.getVariable(message_locale_var)+"</div>",
        position : coords_latlng,
        disableAutoPan: true,
        maxWidth: 200
    });

    infoWnd.open(map);
}

function selectMarkersFromList(){
    var selected_list = urlparser.getParameter("selected");
    
    if (selected_list != undefined){
        $.post("/api/search/getselectedonmap.json",{
            id: selected_list
        },function (result){
            if (result.error != undefined){
                showErrorMessage(result.error.description);
            }
            else{
                var selected = JSON.parse(result.data);
                
                for (var i = 0; i < selected.length; i++){
                    selectMarkerFromList(selected[i]);
                }
                
                reduceMarkers();
            }
        });
    }
}

function selectMarkerFromList(property){
    var exist = false;
    var marker = findMarker(property);
    
    for (var i = 0; i < response_map.selected_property.length; i++){
        if (response_map.selected_property[i] == property){
            response_map.selected_property[i] = null;
            marker.setOptions({labelClass: "maplabel"});
            exist = true;
        }
    }

    if (!exist){
        marker.setOptions({labelClass: "maplabel_selected"});
        response_map.selected_property[i] = property;
    }

    var tmp = [];

    for (var i = 0; i < response_map.selected_property.length; i++){
        if (response_map.selected_property[i] != null){
            tmp.push(response_map.selected_property[i]);
        }
    }

    // показываем кол-во выделенных карточек. работает правильно.
    $('#search_entries_marked_span').html(tmp.length);

    response_map.selected_property = tmp;
}