(function(window) {

	var document = window.document;

	/**
	 * 只简单实现了对象的继承
	 * @return {[type]} [description]
	 */
	var assign = function() {
		if(Object.assign) {
			return Object.assign.apply(null, arguments);
		}

		var args = Array.prototype.slice.call(arguments);

		return args.reduce(function(pre, cur) {
			for(var key in cur) {
				pre[key] = cur[key];
			}
			return pre;
		});
	}

	/**
	 * 阻止事件冒泡或者捕获行为
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	var pauseEvent = function(e) {
		
		// 阻止自身的行为
		// 比如我鼠标按下的时候，会选中文字，那就阻止这些行为
		e.preventDefault();
		// ie的阻止默认行为的办法
		e.returnValue = false;

		// 阻止冒泡或者捕获行为
		// 比如我鼠标按下去的时候，整块区域里面只要有一个地方被按到了，那就不用再往下触发按下操作，或往上触发按下操作
		e.stopPropagation();
		// ie中阻止冒泡的办法
		e.cancelBabbel = true;
	}

	/**
	 * 兼容ie，监听事件
	 * 
	 * @param  {[type]}  el        [description]
	 * @param  {[type]}  eventName [description]
	 * @param  {[type]}  event     [description]
	 * @param  {Boolean} isCapture [description]
	 * @return {[type]}            [description]
	 */
	var listen = function(el, eventName, event, isCapture) {
		if(!el.addEventListener) {
			el.attachEvent(eventName, event);
			return function() {
				el.detachEvent(eventName, event);
			}
		} else {
			// console.log(el, eventName);
			el.addEventListener(eventName, event, isCapture);
			return function() {
				el.removeEventListener(eventName, event, isCapture);
			}
		}
	}

	/**
	 * 获取element的style值
	 * 
	 * @param  {[type]} el  [description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	var getStyleValue = function(el, key) {
		return el.currentStyle ? el.currentStyle[key] : document.defaultView.getComputedStyle(el, false)[key];
	}

	/**
	 * TODO
	 * 兼容性处理，ie中border 2px问题
	 * 
	 * 获取element的坐标
	 * 
	 * @param  {[type]} el  [description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	var getElementXY = function(el) {
		return el.getBoundingClientRect();
	}

	/**
	 * 核心Darg construct
	 * @param {[type]} element    要移动的元素
	 * @param {[type]} dragTarget 移动触发控件
	 */
	window.Drag = function(element, dragTarget) {

		if(!element) {
			return;
		}

		// 零食缓存
		this.store = (function() {
			var cache = { 
				currentX: 0,
				currentY: 0,
				top: 0,
				left: 0,
				isDrag: false,
				listeners: []
			};

			return function(key, value) {
				if(arguments.length < 2 && typeof key === 'string') {
					return cache[key];
				}
				if (Object.prototype.toString.call(key) === "[object Object]") {
					assign(cache, key);
					return;
				}
			 	cache[key] = value;
			}
		})();

		// 被拖拽的盒子
		this.dragboxEl = element;
		this.dragTarget = dragTarget;

		return this;
	}

	/**
	 * 鼠标按下的时候触发，没测是否会事件冒泡
	 * 
	 * @param  {[type]} e) {				e       [description]
	 * @return {[type]}    [description]
	 */
	var mousedown = function(e) {
		console.log(e);
		e = e || window.event;

		var cx = e.clientX,
			cy = e.clientY,
			store = this.store,
			dragboxEl = this.dragboxEl,
			nodeShadow = dragboxEl.cloneNode(true),
			boxshaodw = "4px 6px 24px gray",
			rect = getElementXY(dragboxEl);		// 左边和上边的距离

		// 阻止事件触发自身选中文字的效果
		pauseEvent(e);

		assign(nodeShadow.style , {
			opacity: 0.9,
			position: "fixed",
			left: rect.left + "px",
			top: rect.top + "px"
		});

		assign(dragboxEl.style , {
			boxShadow : boxshaodw,
		 	webkitBoxShadow: boxshaodw,
		 	mozBoxShadow: boxshaodw
		})

		dragboxEl.parentElement.appendChild(nodeShadow);

		store({
			left: rect.left,
			top: rect.top,
			nodeShadow: nodeShadow,
			currentX: cx,
			currentY: cy,
			isDrag: true
		});
	}

	/**
	 * 鼠标移动的时候触发，事件冒泡需要处理
	 * 
	 * @param  {[type]} e) {				e       [description]
	 * @return {[type]}    [description]
	 */
	var mousemove = function(e) {

		e = e || window.event;
		var mx = e.clientX,
			my = e.clientY,
			store = this.store,
			offsetX = mx - store('currentX'),
			offsetY = my - store('currentY'),
			nodeShadow = store('nodeShadow');

		if(!store('isDrag')) {
			return;
		}

		nodeShadow.style.left = parseInt(store('left')) + offsetX + 'px';
		nodeShadow.style.top = parseInt(store('top')) + offsetY + 'px';
	}

	/**
	 * 鼠标放开的时候
	 * @param  {[type]} e) {				e       [description]
	 * @return {[type]}    [description]
	 */
	var mouseup = function() {

		var store = this.store,
			nodeShadow = store('nodeShadow'),
			dragboxEl = this.dragboxEl;

		if (!store('isDrag')) {
			return;
		}

		store('isDrag', false);

		dragboxEl.parentElement.removeChild(nodeShadow);
		dragboxEl.style.boxShadow = 'none';
		dragboxEl.style.webkitBoxShadow = 'none';
		dragboxEl.style.mozBoxShadow = 'none';
	}

	/**
	 * 开始监听
	 * @return {[type]} [description]
	 */
	Drag.prototype.startDrag = function startDrag() {
		if(!this.dragTarget) {
			return;
		}

		var rmMouseUp = listen(document, 'mouseup', mouseup.bind(this), true),
			rmMouseMove = listen(document, 'mousemove', mousemove.bind(this), true),
			rmMouseDown = listen(this.dragTarget, 'mousedown', mousedown.bind(this), true),
			listeners = this.store('listeners');

		listeners.push(rmMouseUp);
		listeners.push(rmMouseMove);
		listeners.push(rmMouseDown);
	}

	/**
	 * 关闭监听
	 * @return {[type]} [description]
	 */
	Drag.prototype.stopDrag = function stopDrag() {
		if(!this.dragTarget) {
			return;
		}
		var listeners = this.store('listeners');
		while(listeners && listeners.length) {
			listeners.pop()();
		}
	}

})(window)