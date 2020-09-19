/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//var test_a = ["563f2f1725d3f.jpg","563f2f1e76c85.jpg","563f2f232e6b8.jpg"];

function ImageViewer(images, item){
    this.images = images;
    this.thumbs = [];
    this.fulls = [];
    this.thumb_key = 0;
    this.images_counter = images.length; // счетчик изображений, инкрементируется при аплоаде и декрементируется при удалении
    
    this.stretch = function(){
        if ($('#image_wrapper_'+item+' img').width() < 150){
            $('#image_wrapper_'+item+' img').css({height:"auto"});
        }
        else{
            $('#image_wrapper_'+item+' img').css({height:"100%"});
        }
    };
    
    this.init = function(){
        for (var i = 0; i < this.images.length; i++){
            var obj = {
                src: "/storage/"+this.images[i].full_image,
                w: this.images[i].image_width != null && this.images[i].image_width != 0 ? this.images[i].image_width : 1024,
                h: this.images[i].image_height != null && this.images[i].image_height != 0 ? this.images[i].image_height : 768
            };

            this.fulls.push(obj);
            this.thumbs.push(this.images[i]);
        }
        //$('#image_wrapper_'+item).html(this.thumbs[0]);
        $('#photos_counter_span').html(this.thumbs.length);
        //this.stretch();
    };
    
    this.init();
    
    this.slideThumbRight = function(){
        this.thumb_key--;
      
        if (this.thumb_key === -1 )
            this.thumb_key = this.thumbs.length-1;
        
        $('#image_wrapper_'+item).html(this.thumbs[this.thumb_key]);
        this.stretch();
    };
    
    this.slideThumbLeft = function(){
        this.thumb_key++;
      
        if (this.thumb_key == this.thumbs.length)
            this.thumb_key = 0;
        
        $('#image_wrapper_'+item).html(this.thumbs[this.thumb_key]);
        this.stretch();
    };
    
    this.showLast = function(){
        this.thumb_key = this.thumbs.length-1;        
        $('#image_wrapper_'+item).html(this.thumbs[this.thumb_key]);
        this.stretch();
    };
    
    this.lockUploadButton = function(){
        if (this.images_counter >= 5){
            $('#photo_upload_input').hide();
            $('#add_picture_button').bind("click", function(){
                utils.warningModal(localization.getVariable("images_upload_limit_warning"));
            });
        }
    };
    
    this.unlockUploadButton = function(){
        if (this.images_counter < 5){
            $('#photo_upload_input').show();
            $('#add_picture_button').unbind("click");
        }
    };
    
    this.getNameById = function(id){
        console.log(id);
        
        for (var i = 0; i < this.images.length; i++){
            if (this.images[i].image == id){
                return this.images[i].name;
            }
        }
        
        return null;
    };
}

//+++++++++++++++++++++++++ PhotoSwipe code ++++++++++++++++++++++++++++++//
var gallery = null; // PhotoSwipe object

var openPhotoSwipe = function(index) {
    var pswpElement = document.querySelectorAll('.pswp')[0];

    // build items array
    var items = imageviewer.fulls;
    
    // define options (if needed)
    var options = {
             // history & focus options are disabled on CodePen        
        history: false,
        focus: false,

        showAnimationDuration: 100,
        hideAnimationDuration: 100,
        bgOpacity: 0.8,
        fullscreenEl: false,
        shareEl: false,
        index: index
        
    };
    
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
    window.history.pushState('forward', null, '');
};

//########################## OLD CODE ################################//

function _Viewer(image_links, photo){ // вьювер фотографий профиля
   this.h = screen.height;
   this.w = screen.width;
   this.image_links = image_links;
   this.key = photo;
   
   this.showScreenRes = function(){
      //console.log(this.h+"x"+this.w);
   };
   
   this.show = function(){
      //this.key = photo;
      var form = $("<div />", {id: "viewer"});
      var photo_wrapper = $("<div />", {id: "photo_wrapper"});
      var close_button = $("<button />", {id: "close_button"});
      var loader = $("<img />", {id: "loader", src: "img/ajax-loader.gif"});
      
      form.height(this.h);
      form.width(this.w);
      photo_wrapper.height(this.h);
      photo_wrapper.width(this.w);
      photo_wrapper.hide();
      close_button.click(function(){
         viewer.close();
      });
      loader.offset({top:this.h/2, left:this.w/2});
      //swipearea_right = $("<div />", {id: "swipe_area_right", class: "viewer-swipe-area"});
      swipearea_left = $("<div />", {id: "swipe_area_left", class: "viewer-swipe-area"});
      //swipearea_right.width(this.w/4).height(this.h);
      swipearea_left.width(this.w).height(this.h);
      swipearea_left.swipe({
        swipeStatus:function(event, phase, direction, distance, duration, fingers){
                if (phase=="move" && direction =="right"){
                   viewer.swipeRight();
                   return false;
                }

                if (phase=="move" && direction =="left"){
                   viewer.swipeLeft();
                   return false;
                }

                if (phase=="move" && direction =="up"){
                   viewer.close();
                   return false;
                }

                $('#photo_wrapper').hide();
                $('#loader').show();
        }
    });
      form.append(photo_wrapper);
      form.append(loader);
      form.append(close_button);
      //form.append(swipearea_right);
      form.append(swipearea_left);
      
      $(document.body).css({height: "100%",overflow: "hidden"});
      $(document.body).append(form);
      
      var image = new Image();
      image.id = "photo"+this.key;
      image.src = "catalog/"+this.image_links[this.key];
      image.onload = this.onImageLoad;
      
      photo_wrapper.html(image);
   };
   
   this.onImageLoad = function(a){
      //console.log(a.target.id)
      $('#photo_wrapper').show();
      var image = $("#"+a.target.id);
      image.css({"width":viewer.w+"px"});
      image.offset({top:viewer.h/2-image.height()/2});
      $('#loader').hide();
   };
   
   this.swipeLeft = function(){
      this.key++;
      
      if (this.key == this.image_links.length)
         this.key = 0;
         
      var image = new Image();
      image.id = "photo"+this.key;
      image.src = "catalog/"+this.image_links[this.key];
      image.onload = this.onImageLoad;
      $('#photo_wrapper').html(image);
   };
   
   this.swipeRight = function(){
      this.key--;
      
      if (this.key === -1 )
         this.key = this.image_links.length-1;
         
      var image = new Image();
      image.id = "photo"+this.key;
      image.src = "catalog/"+this.image_links[this.key];
      image.onload = this.onImageLoad;
      $('#photo_wrapper').html(image);
   };
   
   this.getThumbs = function(){
       return thumbs;
   };
   
   this.getFull = function(){
       return full;
   };
   
   this.close = function(){
      $('#viewer').remove();
   };
}

function showPhotoViewer(profile, photo){ // init photo viewer for another user
   var links = [];
   
   for (var i = 0; i < profiles[current_profile].photos.length; i++){
      links.push(profiles[current_profile].photos[i].photo);
   }

   viewer = new Viewer(links, photo);
   viewer.show();
}