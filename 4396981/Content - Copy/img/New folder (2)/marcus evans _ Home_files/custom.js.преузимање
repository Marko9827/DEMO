/* =========================================================
Comment Form
============================================================ */
jQuery(document).ready(function(){
    if(jQuery("#comments-form").length > 0){
	// Validate the contact form
	  jQuery('#comments-form').validate({
	
		// Add requirements to each of the fields
		rules: {
			name: {
				required: true,
				minlength: 2
			},
			email: {
				required: true,
				email: true
			},
			message: {
				required: true,
				minlength: 10
			}
		},
		
		// Specify what error messages to display
		// when the user does something horrid
		messages: {
			name: {
				required: "Please enter your name.",
				minlength: jQuery.format("At least {0} characters required.")
			},
			email: {
				required: "Please enter your email.",
				email: "Please enter a valid email."
			},
			url: {
				required: "Please enter your url.",
				url: "Please enter a valid url."
			},
			message: {
				required: "Please enter a message.",
				minlength: jQuery.format("At least {0} characters required.")
			}
		},
		
		// Use Ajax to send everything to processForm.php
		submitHandler: function(form) {
			jQuery("#submit-comment").attr("value", "Sending...");
			jQuery(form).ajaxSubmit({
				success: function(responseText, statusText, xhr, $form) {
					jQuery("#response").html(responseText).hide().slideDown("fast");
					jQuery("#submit-comment").attr("value", "Comment");
				}
			});
			return false;
		}
	  });
	}
	
	if(jQuery("#contact-form").length > 0){
	// Validate the contact form
	  jQuery('#contact-form').validate({
	
		// Add requirements to each of the fields
		rules: {
			name: {
				required: true,
				minlength: 2
			},
			email: {
				required: true,
				email: true
			},
			message: {
				required: true,
				minlength: 10
			}
		},
		
		// Specify what error messages to display
		// when the user does something horrid
		messages: {
			name: {
				required: "Please enter your name.",
				minlength: jQuery.format("At least {0} characters required.")
			},
			email: {
				required: "Please enter your email.",
				email: "Please enter a valid email."
			},
			url: {
				required: "Please enter your url.",
				url: "Please enter a valid url."
			},
			message: {
				required: "Please enter a message.",
				minlength: jQuery.format("At least {0} characters required.")
			}
		},
		
		// Use Ajax to send everything to processForm.php
		submitHandler: function(form) {
			jQuery("#submit-contact").attr("value", "Sending...");
			jQuery(form).ajaxSubmit({
				success: function(responseText, statusText, xhr, $form) {
					jQuery("#response").html(responseText).hide().slideDown("fast");
					jQuery("#submit-contact").attr("value", "Submit");
				}
			});
			return false;
		}
	  });
	}
});

/* =========================================================
Sub menu
==========================================================*/
//(function($){ //create closure so we can safely use $ as alias for jQuery

//	jQuery(document).ready(function(){

//		// initialise plugin
//		var example = jQuery('#main-menu').superfish({
//			//add options here if required
//		});
//	});

//})(jQuery);

/* =========================================================
Mobile menu
============================================================ */
jQuery(document).ready(function () {
     
    jQuery('#mobile-menu > span').click(function () {
 
        var mobile_menu = jQuery('#toggle-view-menu');
 
        if (mobile_menu.is(':hidden')) {
            mobile_menu.slideDown('300');
            jQuery(this).children('span').html('-');    
        } else {
            mobile_menu.slideUp('300');
            jQuery(this).children('span').html('+');    
        }
    });
	
	jQuery('#toggle-view-menu li').click(function () {
 
        var text = jQuery(this).children('div.menu-panel');
 
        if (text.is(':hidden')) {
            text.slideDown('300');
            jQuery(this).children('span').html('-');    
        } else {
            text.slideUp('300');
            jQuery(this).children('span').html('+');    
        }
		
		jQuery(this).toggleClass('active');
         
    });
 
});

/* =========================================================
Flex Slider
============================================================ */
jQuery(window).load(function(){
  jQuery('.home-slider').flexslider({
	animation: "slide",
	start: function(slider){
	  jQuery('body').removeClass('loading');
	}
  });
  
});

/* =========================================================
HeadLine Scroller
============================================================ */

jQuery(function() {
	var _scroll = {
		delay: 1000,
		easing: 'linear',
		items: 1,
		duration: 0.07,
		timeoutDuration: 0,
		pauseOnHover: 'immediate'
	};
	jQuery('.ticker-1').carouFredSel({
		width: 1000,
		align: false,
		items: {
			width: 'variable',
			height: 40,
			visible: 1
		},
		scroll: _scroll
	});

	//	set carousels to be 100% wide
	jQuery('.caroufredsel_wrapper').css('width', '100%');
});

/* =========================================================
Carousel
============================================================ */
jQuery(window).load(function() {
	
    if( jQuery(".kopa-featured-news-carousel").length > 0){
		jQuery('.kopa-featured-news-carousel').carouFredSel({
			responsive: true,
			prev: '#prev-1',
			next: '#next-1',
			width: '100%',
			scroll: 1,
			pagination: "#pager2",
			auto: false,
			items: {
				width: 249,
				height: 'auto',
				visible: {				
					min: 1,
					max: 3
				}
			}
		});
	}
	
	if( jQuery(".kopa-gallery-carousel").length > 0){
		jQuery('.kopa-gallery-carousel').carouFredSel({
			responsive: true,
			prev: '#prev-1',
			next: '#next-1',
			width: '100%',
			scroll: 1,
			auto: false,
			items: {
				width: 140,
				height: 'auto',
				visible: {				
					min: 1,
					max: 5
				}
			}
		});
	}
});

/* =========================================================
Tabs
============================================================ */
jQuery(document).ready(function() { 
	
	if( jQuery(".tab-content-1").length > 0){   
        //Default Action Product Tab
        jQuery(".tab-content-1").hide(); //Hide all content
        jQuery("ul.tabs-1 li:first").addClass("active").show(); //Activate first tab
        jQuery(".tab-content-1:first").show(); //Show first tab content
        //On Click Event Product Tab
        jQuery("ul.tabs-1 li").click(function() {
            jQuery("ul.tabs-1 li").removeClass("active"); //Remove any "active" class
            jQuery(this).addClass("active"); //Add "active" class to selected tab
            jQuery(".tab-content-1").hide(); //Hide all tab content
            var activeTab = jQuery(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
            jQuery(activeTab).fadeIn(); //Fade in the active content
            return false;
		
        });
    }
	
	if( jQuery(".tab-content-2").length > 0){   
        //Default Action Product Tab
        jQuery(".tab-content-2").hide(); //Hide all content
        jQuery("ul.tabs-2 li:first").addClass("active").show(); //Activate first tab
        jQuery(".tab-content-2:first").show(); //Show first tab content
        //On Click Event Product Tab
        jQuery("ul.tabs-2 li").click(function() {
            jQuery("ul.tabs-2 li").removeClass("active"); //Remove any "active" class
            jQuery(this).addClass("active"); //Add "active" class to selected tab
            jQuery(".tab-content-2").hide(); //Hide all tab content
            var activeTab = jQuery(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
            jQuery(activeTab).fadeIn(); //Fade in the active content
            return false;
		
        });
    }
	
	if( jQuery(".tab-content-3").length > 0){   
        //Default Action Product Tab
        jQuery(".tab-content-3").hide(); //Hide all content
        jQuery("ul.tabs-3 li:first").addClass("active").show(); //Activate first tab
        jQuery(".tab-content-3:first").show(); //Show first tab content
        //On Click Event Product Tab
        jQuery("ul.tabs-3 li").click(function() {
            jQuery("ul.tabs-3 li").removeClass("active"); //Remove any "active" class
            jQuery(this).addClass("active"); //Add "active" class to selected tab
            jQuery(".tab-content-3").hide(); //Hide all tab content
            var activeTab = jQuery(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
            jQuery(activeTab).fadeIn(); //Fade in the active content
            return false;
		
        });
    }
	
});

/* =========================================================
Flickr Feed
============================================================ */
jQuery(document).ready(function(){ 
	jQuery('#flickr-feed-1').jflickrfeed({
		limit: 9,
		qstrings: {
			id: '96184527@N02'
		},
		itemTemplate:
			'<li class="flickr-badge-image">' +
			'<a rel="prettyPhoto[kopa-flickr]" href="{{image}}" title="{{title}}">' +
			'<img src="{{image_s}}" alt="{{title}}" width="58px" height="58px" />' +
			'</a>' +
			'</li>'
	}, function(data) {
			jQuery("a[rel^='prettyPhoto']").prettyPhoto({
			show_title: false,
			deeplinking:false
		}).mouseenter(function(){
			//jQuery(this).find('img').fadeTo(500, 0.6);
		}).mouseleave(function(){
			//jQuery(this).find('img').fadeTo(400, 1);
		});
	});
});


/* =========================================================
prettyPhoto
============================================================ */
jQuery(document).ready(function(){
    init_image_effect();
});

jQuery(window).resize(function(){
    init_image_effect();
});

function init_image_effect(){    

	var view_p_w = jQuery(window).width();
	var pp_w = 500;
	var pp_h = 344;
	
	if(view_p_w <= 479){
		pp_w = '120%';
		pp_h = '100%';
	}
	else if(view_p_w >= 480 && view_p_w <= 599){
		pp_w = '100%';
		pp_h = '170%';
	}
		    
    jQuery("a[rel^='prettyPhoto']").prettyPhoto({
        show_title: false,
        deeplinking:false,
        social_tools:false,
		default_width: pp_w,
		default_height: pp_h
    });    
}

/* =========================================================
Twitter
============================================================ */
jQuery(function(){
	jQuery('#tweets').tweetable({
		username: 'philipbeel',
		time: true,
		rotate: false,
		speed: 4000,
		limit: 2,
		replies: false,
		position: 'append',
		failed: "Sorry, twitter is currently unavailable for this user.",
		html5: true,
		onComplete:function($ul){
			jQuery('time').timeago();
		}
	});
});

/* =========================================================
Scroll bar
============================================================ */
jQuery(window).load(function() {
	mCustomScrollbars();
});

function mCustomScrollbars(){
	/* 
	malihu custom scrollbar function parameters: 
	1) scroll type (values: "vertical" or "horizontal")
	2) scroll easing amount (0 for no easing) 
	3) scroll easing type 
	4) extra bottom scrolling space for vertical scroll type only (minimum value: 1)
	5) scrollbar height/width adjustment (values: "auto" or "fixed")
	6) mouse-wheel support (values: "yes" or "no")
	7) scrolling via buttons support (values: "yes" or "no")
	8) buttons scrolling speed (values: 1-20, 1 being the slowest)
	*/
	if(jQuery("#mcs5_container").length > 0){
		jQuery("#mcs5_container").mCustomScrollbar("horizontal",500,"easeOutCirc",1,"fixed","yes","yes",20);
	}
}

/* function to fix the -10000 pixel limit of jquery.animate */
jQuery.fx.prototype.cur = function(){
    if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
      return this.elem[ this.prop ];
    }
    var r = parseFloat( jQuery.css( this.elem, this.prop ) );
    return typeof r == 'undefined' ? 0 : r;
}

/* function to load new content dynamically */
function LoadNewContent(id,file){
	jQuery("#"+id+" .customScrollBox .horWrapper-content").load(file,function(){
		mCustomScrollbars();
	});
}

/* ---------------------------------------------------------------------- */
/*	Portfolio Filter
 /* ---------------------------------------------------------------------- */
// modified Isotope methods for gutters in masonry
jQuery.Isotope.prototype._getMasonryGutterColumns = function() {
    var gutter = this.options.masonry && this.options.masonry.gutterWidth || 0;
    containerWidth = this.element.width();

    this.masonry.columnWidth = this.options.masonry && this.options.masonry.columnWidth ||
            // or use the size of the first item
            this.jQueryfilteredAtoms.outerWidth(true) ||
            // if there's no items, use size of container
            containerWidth;

    this.masonry.columnWidth += gutter;

    this.masonry.cols = Math.floor((containerWidth + gutter) / this.masonry.columnWidth);
    this.masonry.cols = Math.max(this.masonry.cols, 1);
};

jQuery.Isotope.prototype._masonryReset = function() {
    // layout-specific props
    this.masonry = {};
    // FIXME shouldn't have to call this again
    this._getMasonryGutterColumns();
    var i = this.masonry.cols;
    this.masonry.colYs = [];
    while (i--) {
        this.masonry.colYs.push(0);
    }
};

jQuery.Isotope.prototype._masonryResizeChanged = function() {
    var prevSegments = this.masonry.cols;
    // update cols/rows
    this._getMasonryGutterColumns();
    // return if updated cols/rows is not equal to previous
    return (this.masonry.cols !== prevSegments);
};

jQuery(function() {
    // cache container
    var kp_columnWidth = get_colunm_width();
	var jQuerycontainer = jQuery('#pf-items');
// initialize isotope
    jQuerycontainer.isotope({
        itemSelector: '.element',
		resizable: false,
        masonry: {
            columnWidth: kp_columnWidth,
            gutterWidth: 25
        }
    });

});

jQuery(window).smartresize(function() {
	var kp_columnWidth = get_colunm_width();
	var jQuerycontainer = jQuery('#pf-items');
	jQuerycontainer.isotope({
        // update columnWidth to a percentage of container width
        masonry: {columnWidth: kp_columnWidth}
    });
});

function get_colunm_width() {
    var view_port_w;
    var kp_colunm_width = 248;
    if (self.innerWidth !== undefined)
        view_port_w = self.innerWidth;
    else {
        var D = document.documentElement;
        if (D)
            view_port_w = D.clientWidth;
    }

    if (view_port_w >= 1024 && view_port_w <= 1043) {
        kp_colunm_width = 312;
    }
	else if (view_port_w >= 980 && view_port_w < 1023) {
        kp_colunm_width = 292;
    }
	else if (view_port_w >= 800 && view_port_w < 979) {
        kp_colunm_width = 192;
    }
    else if (view_port_w >= 768 && view_port_w < 799) {
        kp_colunm_width = 192;
    }
    else if (view_port_w >= 640 && view_port_w < 767) {
        kp_colunm_width = 183;
    }
    else if (view_port_w >= 480 && view_port_w < 639) {
        kp_colunm_width = 207;
    }
    else if (view_port_w <= 479) {
        kp_colunm_width = 280;
    }
    return kp_colunm_width;
}

var optionSets = jQuery('#pf-options .pf-option-set'),
        optionLinks = optionSets.find('a');
var jQuerycontainer_pf = jQuery('#pf-items');
optionLinks.click(function() {
    // don't proceed if already selected
    if (jQuery(this).hasClass('selected')) {
        return false;
    }
    var optionSet = jQuery(this).parents('.pf-option-set');
    optionSet.find('.selected').removeClass('selected');
    jQuery(this).addClass('selected');

    // make option object dynamically, i.e. { filter: '.my-filter-class' }
    var options = {},
            key = optionSet.attr('data-option-key'),
            value = jQuery(this).attr('data-option-value');
    // parse 'false' as false boolean
    value = value === 'false' ? false : value;
    options[ key ] = value;
    if (key === 'layoutMode' && typeof changeLayoutMode === 'function') {
        // changes in layout modes need extra logic
        changeLayoutMode($this, options)
    } else {
        // otherwise, apply new options
        jQuerycontainer_pf.isotope(options);
    }

    return false;
});

/* end Portfolio Filter */

/* =========================================================
Accordion
========================================================= */
jQuery(document).ready(function() {
        var acc_wrapper=jQuery('.acc-wrapper');
        if (acc_wrapper.length >0) 
        {
			
            jQuery('.acc-wrapper .accordion-container').hide();
            jQuery.each(acc_wrapper, function(index, item){
                jQuery(this).find(jQuery('.accordion-title')).first().addClass('active').next().show();
				
            });
			
            jQuery('.accordion-title').on('click', function(e) {
                kopa_accordion_click(jQuery(this));
                e.preventDefault();
            });
			
			var titles = jQuery('.accordion-title');
			
			jQuery.each(titles,function(){
				kopa_accordion_click(jQuery(this));
			});
        }
		
});

function kopa_accordion_click (obj) {
	if( obj.next().is(':hidden') ) {
		obj.parent().find(jQuery('.active')).removeClass('active').next().slideUp(300);
		obj.toggleClass('active').next().slideDown(300);
							
	}
jQuery('.accordion-title span').html('+');
	if (obj.hasClass('active')) {
		obj.find('span').first().html('-');			     
	} 
}

/* =========================================================
Single post slider
============================================================ */
jQuery(window).load(function(){
  
  jQuery('.kp-single-carousel').flexslider({
	animation: "slide",
	controlNav: false,
	animationLoop: false,
	slideshow: false,
	itemWidth: 150,
	itemMargin: 10,
	asNavFor: '.kp-single-slider'
  });
  
  jQuery('.kp-single-slider').flexslider({
	animation: "slide",
	controlNav: false,
	animationLoop: false,
	slideshow: false,
	sync: ".kp-single-carousel",
	start: function(slider){
	  jQuery('body').removeClass('loading');
	}
  });
});

/* =========================================================
Toggle Boxes
============================================================ */
jQuery(document).ready(function () {
     
    jQuery('#toggle-view li').click(function (event) {
 		
        var text = jQuery(this).children('div.panel');
 
        if (text.is(':hidden')) {
			jQuery(this).addClass('active');
            text.slideDown('300');
            jQuery(this).children('span').html('-');			     
        } else {
			jQuery(this).removeClass('active');
            text.slideUp('300');
            jQuery(this).children('span').html('+');			   
        }
         
    });
 
});

/* =========================================================
Set height for l-col
============================================================ */
jQuery(document).ready(function () {
	var r_height = jQuery('#main-content .r-col').height();
	var l_height = jQuery('#main-content .l-col').height();

	if (l_height < r_height) {
		jQuery('#main-content .l-col').height(r_height);
	}
	
});

