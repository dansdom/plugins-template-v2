// test jQuery plugin

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.TestPlugin = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "testPlugin";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.TestPlugin.settings, options);
		this.init();
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.TestPlugin.settings = {
		'myBgColor': 'red',
		'MyBorderColor': 'blue',
		'boxHeight': '60px'
	};
	
	// plugin functions go here
	$.TestPlugin.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var myObject = this;
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			this.element.bind('click.'+this.namespace, function() {
				myObject.styleBox();
			});
			
			// mouseover function
			this.element.bind('mouseover.'+this.namespace, function()
			{
				myObject.moveUp();
			});
			
			this.element.bind('mouseout.'+this.namespace, function()
			{
				myObject.moveBack();
			});
			
			this.element.bind('test.'+this.namespace, function(event)
			{
				console.log("namespace: "+event.namespace);
				//return event.namespace;
			});
			
		},
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		styleBox : function() {
			this.element.css("background", this.options.myBgColor);
			this.element.css("border", "1px solid " + this.options.MyBorderColor);
		},
		moveUp : function() {
			this.element.animate({"height": this.options.boxHeight}, 1000);
		},
		moveBack : function() {
			this.element.animate({height: "50px"}, 1000);
		},
		destroy : function() {
			//console.log("unbinding namespaced events");
			this.el.unbind("." + this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.testPlugin = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "pluginName",
			args;
		
		// if the argument is a string representing a plugin method then test which one it is
		if ( typeof options === 'string' ) {
			// define the arguments that the plugin function call may make 
			args = Array.prototype.slice.call( arguments, 1 );
			// iterate over each object that the function is being called upon
			this.each(function() {
				// test the data object that the DOM element that the plugin has for the DOM element
				var pluginInstance = $.data(this, pluginName);
				
				// if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
				if (!pluginInstance) {
					alert("The plugin has not been initialised yet when you tried to call this method: " + options);
					return;
				}
				// if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
				if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
					alert("the plugin contains no such method: " + options);
					return;
				}
				// apply the method that has been called
				else {
					pluginInstance[options].apply(pluginInstance, args);
				}
			});
			
		}
		// initialise the function using the arguments as the plugin options
		else {
			// initialise each instance of the plugin
			this.each(function() {
				// define the data object that is going to be attached to the DOM element that the plugin is being called on
				var pluginInstance = $.data(this, pluginName);
				// if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
				if (pluginInstance) {
					pluginInstance.option(options);
					// initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
					//pluginInstance.init(callback);
				}
				// initialise a new instance of the plugin
				else {
					$.data(this, pluginName, new $.TestPlugin(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
