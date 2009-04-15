//Inline HTML Tooltip script: By JavaScript Kit: http://www.javascriptkit.com
//Created: July 10th, 08'

var htmltooltip={
	tipclass: 'htmltooltip',
	fadeeffect: [true, 500],
	anchors: [],
	tooltips: new Object, //array to contain references to all tooltip DIVs on the page

	positiontip:function($, ancindex, tipindex, e){
		var anchor=this.anchors[ancindex]
		var tooltip=this.tooltips[tipindex]
		var scrollLeft=window.pageXOffset? window.pageXOffset : this.iebody.scrollLeft
		var scrollTop=window.pageYOffset? window.pageYOffset : this.iebody.scrollTop
		var docwidth=(window.innerWidth)? window.innerWidth-15 : htmltooltip.iebody.clientWidth-15
		var docheight=(window.innerHeight)? window.innerHeight-18 : htmltooltip.iebody.clientHeight-15
		var tipx=anchor.dimensions.offsetx
		var tipy=anchor.dimensions.offsety+anchor.dimensions.h
		tipx=(tipx+tooltip.dimensions.w-scrollLeft>docwidth)? tipx-tooltip.dimensions.w : tipx //account for right edge
		tipy=(tipy+tooltip.dimensions.h-scrollTop>docheight)? tipy-tooltip.dimensions.h-anchor.dimensions.h : tipy //account for bottom edge
		$(tooltip).css({left: tipx, top: tipy})
	},

	showtip:function($, tipindex, e){
		var tooltip=this.tooltips[tipindex]
		//if (this.fadeeffect[0])
		//	$(tooltip).hide().fadeIn(this.fadeeffect[1])
		//else
			$(tooltip).show()
	},

	hidetip:function($, tipindex, e){
		var tooltip=this.tooltips[tipindex]
		//if (this.fadeeffect[0])
		//	$(tooltip).fadeOut(this.fadeeffect[1])
		//else
			$(tooltip).hide()	
	},

	updateanchordimensions:function($){
//		var $anchors=$('*[@rel="'+htmltooltip.tipclass+'"]');
		var $anchors=$('*[rel="'+htmltooltip.tipclass+'"]');
		$anchors.each(function(index){
			this.dimensions={w:this.offsetWidth, h:this.offsetHeight, offsetx:$(this).offset().left, offsety:$(this).offset().top};
		});
	},

	render:function(){
		jQuery(document).ready(function($){
			htmltooltip.iebody=(document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
//			var $anchors=$('*[@rel="'+htmltooltip.tipclass+'"]');
			var $anchors=$('*[rel="'+htmltooltip.tipclass+'"]');
			$anchors.each(function(index){ //find all links with "title=htmltooltip" declaration
				this.dimensions={w:this.offsetWidth, h:this.offsetHeight, offsetx:$(this).offset().left, offsety:$(this).offset().top}; //store anchor dimensions
				var ancpos=$(this).attr('id'); //store index of corresponding tooltip
				this.tippos=ancpos+'_tip';
				var tooltip=$('#'+this.tippos+'.'+htmltooltip.tipclass).get(0); //ref corresponding tooltip
				if (tooltip==null) //if no corresponding tooltip found
					return; //exist
				tooltip.dimensions={w:tooltip.offsetWidth, h:tooltip.offsetHeight};
				$(tooltip).remove().appendTo('body'); //add tooltip to end of BODY for easier positioning
				htmltooltip.tooltips[this.tippos]=tooltip; //store reference to each tooltip
				htmltooltip.anchors[ancpos]=this;
				//htmltooltip.anchors.push(this); //store reference to each anchor
				var $anchor=$(this);
				$anchor.hover(
					function(e){ //onMouseover element
						htmltooltip.updateanchordimensions($);
						htmltooltip.positiontip($, ancpos, this.tippos, e);
						htmltooltip.showtip($, this.tippos, e);
					},
					function(e){ //onMouseout element
						htmltooltip.hidetip($, this.tippos, e);
					}
				)
			})
		})
	}
}

htmltooltip.render()
