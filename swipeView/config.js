seajs.config({
	alias:{
		'zepto':'zepto.min.js'
		},
	plugins:['shim'],
	
	shim:{
		'zepto':{
			exports:'Zepto'
		},
		'swipeview':{
			exports:'SwipeView'
		}
	}
});