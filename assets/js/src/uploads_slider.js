function UploadsSlider(){
    this.step = 200;
    this.w = 154;
    this.finish_margin = null;
    this.start_margin = 0;
    this.move_block = 0;
   
   this.reinit = function(){
        $('#vip_content_wrapper_div').html("");
       
        if (location.pathname == "/property"){
            property.reinitImages();
            property.reinitDocs();
        }
        else if (location.pathname == "/client"){
            client.reinitDocs();
        } 
   };
   
    this.initImages = function(){
        if (imageviewer.thumbs.length > 0 && property.just_created === 0){      
            $('.gallery_element_box_empty').hide();

            for (var i = 0; i < imageviewer.thumbs.length; i++){
                $('#vip_content_wrapper_div').append(
                    '<div id="first_gallery_box_div" class="gallery_element_box">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <img id="uploaded_image_'+imageviewer.thumbs[i].id+'" src="storage/'+imageviewer.thumbs[i].image+'" onload="stretchCatalogPhoto(this)" />\n\
                        </div>\n\
                        <div style="'+(imageviewer.thumbs[i].name == "" ? "display:none;" : "")+'" class="vip_desc_div"><i class="fa fa-picture-o"></i><span id="uploaded_image_title_'+imageviewer.thumbs[i].id+'">'+imageviewer.thumbs[i].name+'</span></div>\n\
                        <div id="image_zoom_div" class="zoom" onclick="openPhotoSwipe('+i+')"></div>\n\
                        <button id="upload_image_'+imageviewer.thumbs[i].id+'_button" type="button" onclick="property.openRemovePhotoDialog('+imageviewer.thumbs[i].id+')" class="btn btn-default delete_upload_button"><i class="fa fa-times"></i></button>\n\
                    </div>');
            }
            
            if (property.mode === 1){
                $('.delete_upload_button').attr("disabled", true);
            }
            
            if (imageviewer.thumbs.length === 1){
                $('#vip_content_wrapper_div').append(
                    '<div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>\n\
                    <div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>');
            }
            else if (imageviewer.thumbs.length === 2){
                $('#vip_content_wrapper_div').append(
                    '<div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>');
            }

            this.finish_margin = $('.gallery_element_box').length*this.w-$('#vip_content_wrapper_div').width();
        }
    };
    
    this.initDocs = function(){
        var just_created_flag = null;
        
        if (location.pathname == "/property"){
            just_created_flag = property.just_created;
        }
        else if (location.pathname == "/client"){
            just_created_flag = client.just_created;
        } 
        
        if (docviewer.docs.length > 0 && just_created_flag === 0){
            $('.gallery_element_box_empty').hide();
            
            if (location.pathname == "/property"){
                var subject = "property";
            }
            else{
                var subject = "client";
            }

            for (var i = 0; i < docviewer.docs.length; i++){
                $('#vip_content_wrapper_div').append(
                    '<div id="first_gallery_box_div" class="gallery_element_box">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <iframe id="uploaded_doc_'+docviewer.docs[i].id+'" height="120" width="150" src="https://docs.google.com/viewer?url=https://'+location.host+'/storage/'+docviewer.docs[i].location+'&embedded=true"></iframe>\n\
                            <a href="https://docs.google.com/viewer?url=https://'+location.host+'/storage/'+docviewer.docs[i].location+'" target="_blank" class="doc_zoom"></a>\n\
                            <div style="'+(docviewer.docs[i].name == null ? "display:none;" : "")+'" class="vip_desc_div"><i class="fa fa-file-text"></i><span id="uploaded_doc_title_'+docviewer.docs[i].id+'">'+docviewer.docs[i].name+'</span></div>\n\
                            <button id="upload_doc_'+docviewer.docs[i].id+'_button" type="button" onclick="'+subject+'.openRemoveDocDialog('+docviewer.docs[i].id+')" class="btn btn-default delete_upload_button"><i class="fa fa-times"></i></button>\n\
                        </div>\n\
                    </div>');
            }
            
            if ((location.pathname == "/property" && property.mode === 1) || (location.pathname == "/client" && client.mode === 1)){
                $('.delete_upload_button').attr("disabled", true);
            }
            
            if (docviewer.docs.length === 1){
                $('#vip_content_wrapper_div').append(
                    '<div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>\n\
                    <div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>');
            }else if (docviewer.docs.length === 2){
                $('#vip_content_wrapper_div').append(
                    '<div class="gallery_element_box_empty">\n\
                        <div class="gallery_element_box_img_wrapper">\n\
                            <span locale="no_image">No image</span>\n\
                        </div>\n\
                    </div>');
            }

            this.finish_margin = $('.gallery_element_box').length*this.w-$('#vip_content_wrapper_div').width();
        }
   };

    this.right = function(){
        if (this.move_block === 0 && $('#first_gallery_box_div').css("margin-left") != undefined){
            this.move_block = 1;
            var margin = Number($('#first_gallery_box_div').css("margin-left").replace("px", ""));

            if (-margin <= this.finish_margin){
                $('#first_gallery_box_div').animate({"marginLeft":"-="+this.step},100, function(){uslider.move_block = 0;});
            }
            else{ 
                this.move_block = 0;
            }
        }
   };
   
   this.left = function(){
      if (this.move_block === 0){
            var margin = Number($('#first_gallery_box_div').css("margin-left").replace("px", ""));

            if (margin <= this.start_margin){
                $('#first_gallery_box_div').animate({"marginLeft":"+="+this.step},100, function(){uslider.move_block = 0;});
            }
            else{ 
                this.move_block = 0;
            }
        }
    };
   
}

function stretchCatalogPhoto(photo){
    var image = $(photo);
    
    if (image.width() < image.height()){
        var ratio = image.height()/image.width();
        image.css({width: "150px", height: 150*ratio+"px"});
    }
    else if (image.width() >= image.height()){ 
        var ratio = image.width()/image.height();
        image.css({width: 120*ratio, height: 120});
    }
}