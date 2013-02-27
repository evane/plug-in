define(function(require,exports,modules){
	var $=require('zepto');
	var css=require('./style.css');
	var data=require('./data');
	var SwipeView=require('./swipeview');

	var initSwipe = function(param){
		var banner,el,i,page;
		if(param.length>0){
			banner = new SwipeView('#banner',{nummberOfPages:param.length});
			for(i=0;i<3;i++){
				page = i==0?param.length-1:i-1;
				var html = '<img style="border:1px solid #BCBCBC" src="'+param[page].pic_url+'" width="366" height="509" />';
				banner.masterPages[i].innerHTML= html;
			}
			banner.onFlip(function(){
				var el, upcoming,i;
				console.log($);
				console.log($('.pic_seq .current'));
				$('.pic_seq .current').removeClass('current');
				$('.pic_seq i').eq(banner.pageIndex).attr('class','current');
				for(i=0;i<3;i++){
					upcoming = banner.masterPages[i].dataset.upcomingPageIndex;
					if(upcoming != banner.masterPages[i].dataset.pageIndex){
						banner.masterPages[i].innerHTML = '<img style="border:1px solid #BCBCBC" src="'+parme[upcoming]+'" width="366" height="509" />';
					}
				}
			});	
		}
	};
	
	initSwipe(data.app_pic);
})