(function ( $ ) {
    $.fn.feedback = function(success, fail) {
    	self=$(this);
		self.find('.dropdown-menu-form').on('click', function(e){e.stopPropagation()})

		self.find('.screenshot').on('click', function(){
			self.find('.cam').removeClass('fa-camera fa-check').addClass('fa-refresh fa-spin');
			html2canvas($(document.body), {
				onrendered: function(canvas) {
					self.find('.screen-uri').val(canvas.toDataURL("image/png"));
					self.find('.cam').removeClass('fa-refresh fa-spin').addClass('fa-check');
				}
			});
		});

		self.find('.do-close').on('click', function(){
			self.find('.dropdown-toggle').dropdown('toggle');
			self.find('.reported, .failed').hide();
			self.find('.report').show();
			self.find('.cam').removeClass('fa-check').addClass('fa-camera');
		    self.find('.screen-uri').val('');
		    self.find('textarea').val('');
		});

		failed = function(){
			self.find('.loading').hide();
			self.find('.failed').show();
			if(fail) fail();
		}
                

		self.find('form').on('submit', function(){
                    self.find('.report').hide();
                    self.find('.loading').show();
                    
                    $.post($(this).attr('action'), $(this).serialize()+"&navigator="+getNavigatorData(), function (response){
                        if (response == "success"){
                            self.find('.loading').hide();
                            self.find('.reported').show();
                        }
                        else{
                            failed();
                        }
                    });
                    
                    /*$.post($(this).attr('action'), , function(){console.log(3)}, 'json')
                        .done(function(res){
                            if (res.result == 'success'){
                                self.find('.loading').hide();
                                self.find('.reported').show();
                            }
                            else{
                                failed();
                            }

                            console.log(1);
                        })*/
                    return false;
		});
	};
}( jQuery ));

function getNavigatorData(){
    navigator.sayswho= (function(){
        var ua= navigator.userAgent, tem, 
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join('+');
    })();

    return navigator.sayswho;
}