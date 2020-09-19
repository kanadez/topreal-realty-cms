/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function DocViewer(docs){ 
    this.docs = docs;
    this.thumbs = [];
    this.fulls = [];
    this.thumb_key = 0;
    this.docs_counter = docs.length;
    
    this.init = function(){
        /*if (this.docs.length > 0 && this.docs != null){
            $('#docviewer').attr("src", "http://docs.google.com/viewer?url=http://"+location.host+"/storage/"+this.docs[this.thumb_key].location+"&embedded=true");
            $('#docviewer').attr("doc_id", this.docs[this.thumb_key].id);
            $('#docs_count_span').html(this.docs.length);
            $('#doc_name_div').html(this.docs[this.thumb_key].name != null ? this.docs[this.thumb_key].name : "");
            $('#doc_zoom_div').attr("href", "http://docs.google.com/viewer?url=http://"+location.host+"/storage/"+this.docs[this.thumb_key].location);
        }*/
        
        $('#docs_counter_span').html(this.docs.length);
    };
    
    this.init();
    
    this.slideThumbRight = function(){
        this.thumb_key--;
      
        if (this.thumb_key === -1 )
            this.thumb_key = this.docs.length-1;
        
        $('#docviewer').attr("src", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location+"&embedded=true");
        $('#docviewer').attr("doc_id", this.docs[this.thumb_key].id);
        $('#doc_name_div').html(this.docs[this.thumb_key].name != null ? this.docs[this.thumb_key].name : "");
        $('#doc_zoom_div').attr("href", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location);
    };
    
    this.slideThumbLeft = function(){
        this.thumb_key++;
      
        if (this.thumb_key == this.docs.length)
            this.thumb_key = 0;
        
        $('#docviewer').attr("src", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location+"&embedded=true");
        $('#docviewer').attr("doc_id", this.docs[this.thumb_key].id);
        $('#doc_name_div').html(this.docs[this.thumb_key].name != null ? this.docs[this.thumb_key].name : "");
        $('#doc_zoom_div').attr("href", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location);
    };
    
    this.showLast = function(){
        this.thumb_key = this.docs.length-1;
        
        $('#docviewer').attr("src", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location+"&embedded=true");
        $('#docviewer').attr("doc_id", this.docs[this.thumb_key].id);
        $('#doc_name_div').html(this.docs[this.thumb_key].name != null ? this.docs[this.thumb_key].name : "");
        $('#doc_zoom_div').attr("href", "https://docs.google.com/viewer?url=https://"+location.host+"/storage/"+this.docs[this.thumb_key].location);
    };
    
    this.showFull = function(){
        //$('#doc_full_viewer').attr("src", "http://docs.google.com/viewer?url=http://"+location.host+"/storage/"+this.docs[this.thumb_key].location+"&embedded=true");
        //$('#doc_full_viewer').attr("doc_id", this.docs[this.thumb_key].id);
        //$('#doc_title').html(this.docs[this.thumb_key].name != null ? this.docs[this.thumb_key].name : "");
        //$('#doc_full_modal').modal("show");
    };
    
    this.lockUploadButton = function(){
        if (this.docs_counter >= 5){
            $('#doc_upload_input').hide();
            $('#add_doc_button').bind("click", function(){
                utils.warningModal(localization.getVariable("docs_upload_limit_warning"));
            });
        }
    };
    
    this.unlockUploadButton = function(){
        if (this.docs_counter < 5){
            $('#doc_upload_input').show();
            $('#add_doc_button').unbind("click");
        }
    };
    
    this.getNameById = function(id){
        for (var i = 0; i < this.docs.length; i++){
            if (this.docs[i].id == id){
                return this.docs[i].name;
            }
        }
        
        return null;
    };
}