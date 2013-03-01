/**
 * css3 translate flip
 * -webkit-box
 * @author: horizon
 */

(function (win, undefined) {
 
 	var initializing = false,
		superTest = /horizon/.test(function () {horizon;}) ? /\b_super\b/ : /.*/;
	this.Class = function () {};

	Class.extend = function (prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;

		for (var name in prop) {
			prototype[name] = (typeof prop[name] === 'function' && typeof _super[name] === 'function' && superTest.test(prop[name])) ? (function (name, fn) {
					return function () {
						var temp = this._super;	
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = temp;

						return ret;
					}
				})(name, prop[name]) : prop[name];
		}
		
		function Class () {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}
		Class.prototype = prototype;
		Class.constructor = Class;
		Class.extend = arguments.callee;

		return Class;
	};

	var $support = {
		transform3d: ('WebKitCSSMatrix' in win),
		touch: ('ontouchstart' in win)
	};

	var $E = {
		start: $support.touch ? 'touchstart' : 'mousedown',
		move: $support.touch ? 'touchmove' : 'mousemove',
		end: $support.touch ? 'touchend' : 'mouseup'
	};

	function getTranslate (x) {
		return $support.transform3d ? 'translate3d('+x+'px, 0, 0)' : 'translate('+x+'px, 0)';
	}
	function getPage (event, page) {
		return $support.touch ? event.changedTouches[0][page] : event[page];
	}


	var Css3Flip = Class.extend({
		init: function (selector, conf) {
			var self = this;
			
			if (selector.nodeType && selector.nodeType == 1) {
				self.element = selector;
			} else if (typeof selector == 'string') {
				self.element = document.getElementById(selector) || document.querySelector(selector);
			}
            
            self.element.style.display = '-webkit-box';
			self.element.style.webkitTransitionProperty = '-webkit-transform';
			self.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
			self.element.style.webkitTransitionDuration = '0';
			self.element.style.webkitTransform = getTranslate(0);

			self.conf = conf || {};
			self.touchEnabled = true;
			self.currentPoint = 0;
			self.currentX = 0;

			self.refresh();
			
			// 支持handleEvent
			self.element.addEventListener($E.start, self, false);
			self.element.addEventListener($E.move, self, false);
			document.addEventListener($E.end, self, false);

			return self;
			
		},
		handleEvent: function(event) {
			var self = this;

			switch (event.type) {
				case $E.start:
					self._touchStart(event);
					break;
				case $E.move:
					self._touchMove(event);
					break;
				case $E.end:
					self._touchEnd(event);
					break;
				case 'click':
					self._click(event);
					break;
			}
		},
		refresh: function() {
			var self = this;

			var conf = self.conf;

			// setting max point
			self.maxPoint = conf.point || (function() {
				var childNodes = self.element.childNodes,
					itemLength = 0,
					i = 0,
					len = childNodes.length,
					node;
				for(; i < len; i++) {
					node = childNodes[i];
					if (node.nodeType === 1) {
						itemLength++;
					}
				}
				if (itemLength > 0) {
					itemLength--;
				}
	
				return itemLength;
			})();

			// setting distance
			self.distance = conf.distance || self.element.scrollWidth / (self.maxPoint + 1);

			// setting maxX
			self.maxX = conf.maxX ? - conf.maxX : - self.distance * self.maxPoint;
	
			self.moveToPoint(self.currentPoint);
		},
		hasNext: function() {
			var self = this;
	
			return self.currentPoint < self.maxPoint;
		},
		hasPrev: function() {
			var self = this;
	
			return self.currentPoint > 0;
		},
		toNext: function() {
			var self = this;

			if (!self.hasNext()) {
				return;
			}

			self.moveToPoint(self.currentPoint + 1);
		},
		toPrev: function() {
			var self = this;

			if (!self.hasPrev()) {
				return;
			}

			self.moveToPoint(self.currentPoint - 1);
		},
        moveToPoint: function(point) {
            var self = this;

            self.currentPoint = 
                (point < 0) ? 0 :
                (point > self.maxPoint) ? self.maxPoint :
                parseInt(point);

            self.element.style.webkitTransitionDuration = '500ms';
            self._setX(- self.currentPoint * self.distance)

            var ev = document.createEvent('Event');
            ev.initEvent('css3flip.moveend', true, false);
            self.element.dispatchEvent(ev);
        },
        _setX: function(x) {
            var self = this;

            self.currentX = x;
            self.element.style.webkitTransform = getTranslate(x);
        },
        _touchStart: function(event) {
            var self = this;

            if (!self.touchEnabled) {
                return;
            }

            if (!$support.touch) {
                event.preventDefault();
            }

            self.element.style.webkitTransitionDuration = '0';
            self.scrolling = true;
            self.moveReady = false;
            self.startPageX = getPage(event, 'pageX');
            self.startPageY = getPage(event, 'pageY');
            self.basePageX = self.startPageX;
            self.directionX = 0;
            self.startTime = event.timeStamp;
        },
        _touchMove: function(event) {
            var self = this;

            if (!self.scrolling) {
                return;
            }

            var pageX = getPage(event, 'pageX'),
                pageY = getPage(event, 'pageY'),
                distX,
                newX,
                deltaX,
                deltaY;

            if (self.moveReady) {
                event.preventDefault();
                event.stopPropagation();

                distX = pageX - self.basePageX;
                newX = self.currentX + distX;
                if (newX >= 0 || newX < self.maxX) {
                    newX = Math.round(self.currentX + distX / 3);
                }
                self._setX(newX);

                self.directionX = distX > 0 ? -1 : 1;
            }
            else {
                deltaX = Math.abs(pageX - self.startPageX);
                deltaY = Math.abs(pageY - self.startPageY);
                if (deltaX > 5) {
                    event.preventDefault();
                    event.stopPropagation();
                    self.moveReady = true;
                    self.element.addEventListener('click', self, true);
                }
                else if (deltaY > 5) {
                    self.scrolling = false;
                }
            }

            self.basePageX = pageX;
        },
        _touchEnd: function(event) {
            var self = this;

            if (!self.scrolling) {
                return;
            }

            self.scrolling = false;

            var newPoint = -self.currentX / self.distance;
            newPoint =
                (self.directionX > 0) ? Math.ceil(newPoint) :
                (self.directionX < 0) ? Math.floor(newPoint) :
                Math.round(newPoint);

            self.moveToPoint(newPoint);

            setTimeout(function() {
                self.element.removeEventListener('click', self, true);
            }, 200);
        },
        _click: function(event) {
            var self = this;

            event.stopPropagation();
            event.preventDefault();
        },
        destroy: function() {
            var self = this;

            self.element.removeEventListener(touchStartEvent, self);
            self.element.removeEventListener(touchMoveEvent, self);
            document.removeEventListener(touchEndEvent, self);
        }
		
		
	});

	this.Css3Flip = function (selector, conf) {
		return (this instanceof Css3Flip) ? this.init(selector, conf) : new Css3Flip(selector, conf);
	}
 	
 
 })(window);

