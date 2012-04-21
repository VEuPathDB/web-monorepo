	var a = null;
	var b = null;
	var region_color = ["#0000FF","#C80064"];
	function Diagram(name,ele){
		this.name = name;
		this.c = ele;
		this.cxt = $(this.c);//this.c.getContext('2d');
		this.type = $("#span_" + name + "_type").val();
		this.scale = null; // Scale is an integer for number of nucleotides per 1px.
		this.feature = null; // deafult length of the feature.
		this.region = null;
		this.center = null;
		this.draw = false;
		this.singlepoint = false;
	}
	
	function initWindow(){ 
		prepCanvas();
		attachHandlers();
		//Should find a way to eliminate this call.
		// updateStepNumberReferences(); //This gets called again later, by the wizard mechanism
		initOutputOptions();
	}

	function attachHandlers(){
		$("#submitButton").unbind('click').click(function(){
			if ($("#span_output").val() === 'a' || $("#span_output").val() === 'b') {
				// Enable params before the form action (callWizard()) is hit, so that
				// they will be included in the serialization performed in parseInputs()
				$(".offsetOptions input, .offsetOptions select").removeAttr("disabled");
				// Make sure the sentence gets sent to the backend.
				$("#span_sentence").val($("div.span-step-text.bottom").html());
				return true;
			}
			else {
				alert("You must select what to return: IDs from which step?");
				return false;
			}
		});
		$(".offsetOptions select, .offsetOptions input").change(function(){
			var id = $(this).attr('id');
			var group = id.substring(id.lastIndexOf("_") + 1);
			if (!(id === 'span_begin_offset_' + group && $("input[name='upstream_region_" + group + "']:checked").length == 0) &&
				!(id === 'span_end_offset_' + group && $("input[name='downstream_region_" + group + "']:checked").length == 0)) {
				$("input[name*='region_" + group + "'][value='custom']").click();
			}
			redraw(true,group);
			$(this).keypress();
		});
		$("input[name*='upstream_region_'], input[name*='downstream_region_']").blur(function(){
			var group = $(this).attr('name');
			group = group.substring(group.indexOf("region_")+7);
			if ($(this).attr("name").indexOf('upstream') >=0) {
				$("#span_begin_offset_" + group).val($(this).val()).change();
			}
			else if ($(this).attr("name").indexOf('downstream') >= 0) {
				$("#span_end_offset_" + group).val($(this).val()).change();
			}
			else {
				// TODO: Error case
			}
		});
		$("#spanLogicParams input[type='text']").keydown(function(event){
			if(event.keyCode == 13 && event.currentTarget.id != 'submitButton') {
				event.preventDefault();
				$(this).change();
			}
		});
		$("#span_output").change(function(){
			$(".span_output").text($("option:selected",this).text());
			updateStepReferences();
		});
		$("#span_operation").change(function(){
			var selectedOperation = $(this).val();
			$(".operation-help div").removeAttr('class').addClass("operation SPAN " + selectedOperation);
			$(".span_operation").text($("option:selected",this).text());
		});
		$("#span_strand").change(function(){
			$(".span_strand").text($("option:selected",this).text());
		});
	}
	function initOutputOptions(){
		$("#span_output option[value='a']").text(
			$("#span_a_type").val() + " from Step " + $("#span_a_num").text());
		$("#span_output option[value='b']").text(
			$("#span_b_type").val() + " from Step " + $("#span_b_num").text());

                // if the previous selection is upstream/downstream, need to 
                // set the length before restoring the radio button.
                var regions = ['a', 'b'];
                for(var i = 0; i < regions.length; i ++) {
                    var selection = $("input[id='region_"+ regions[i] + "_default']").val();
                    if (selection == 'upstream') {
                        var length = $("input#span_begin_offset_" + regions[i] + "_default").val();
                        $("input[name='upstream_region_" + regions[i] + "']").val(length);
                    } else if (selection == 'downstream') {
                        var length = $("input#span_end_offset_" + regions[i] + "_default").val();
                        $("input[name='downstream_region_" + regions[i] + "']").val(length);
                    }
                }


		$("input[id$='_default']").each(function(){
			var target = $(this).attr("id");
			target = target.substring(0,target.indexOf("_default"));
			if ($("input[type=radio]#" + target).length > 0)
				$("#" + target + "[value='" + $(this).val() + "']").click();
			else
				$("#" + target).val($(this).val());
		});
		$("input[type=radio][name^='value(region_']:checked").click();
		$("#span_output").change();
		$("#span_operation").change();
		$("#span_strand").change();
	}
	function updateStepReferences(){
		var output = $("#span_output").val();
		var outputType = $("#span_" + output + "_type").val();
		var outputNum = $("#span_" + output + "_num").text();
		if (outputType) {
			var comparison = $("#span_output option[value!='" + output + "'][value!='none']").val();
			var comparisonType = $("#span_" + comparison + "_type").val();
			var comparisonNum = $("#span_" + comparison + "_num").text();
			$(".comparison_type").text(comparisonType);
			$(".comparison_num").text(comparisonNum);
			$(".outputRegion").removeClass("region_"+comparison).addClass("region_"+output);
			$(".comparisonRegion").removeClass("region_"+output).addClass("region_"+comparison);
			// Swap the output and comparison groups if needed
			if ($("#outputGroup #group_" + output).length === 0) {
				var comparisonGroup = $("#outputGroup .regionParams");
				$("#outputGroup").html($("#comparisonGroup .regionParams"));
				$("#comparisonGroup").html(comparisonGroup);
				updateRegionLabels();
				var contains = $("#span_operation option[value='" + output + "_contain_" + comparison + "']");
				var contained = $("#span_operation option[value='" + comparison + "_contain_" + output + "']");
				var containsText = contains.text();
				var containedText = contained.text();
 				contains.text(containedText);
				contained.text(containsText);
				attachHandlers(); // Switching contents seems to disable the handlers, need to reattach them
			}
		}
		else {
			// No longer an error, since there's a "Select output" option
			//alert("There was an error updating the span logic form.  Please notify us using the 'Contact Us' form.");
		}
	}
	function updateRegionParams(ele){
		var button = $(ele);
		var group = button.attr('name');
		group = group.substring(group.indexOf("_")+1,group.indexOf(")"));
		var offsetOptions = $("#set_" + group + "Fields .offsetOptions");
		switch (button.val()) {
		case 'exact':
			$("input[name='upstream_region_" + group + "']").attr("disabled","true");
			$("input[name='downstream_region_" + group + "']").attr("disabled","true");
			$("#span_begin_" + group).val("start");
			$("#span_begin_offset_" + group).val("0");
			$("#span_end_" + group).val("stop");
			$("#span_end_offset_" + group).val("0").change();
			break;
		case 'upstream':
			$("input[name='upstream_region_" + group + "']").removeAttr("disabled");
			$("input[name='downstream_region_" + group + "']").attr("disabled","true");
			$("#span_begin_" + group).val("start");
			$("#span_begin_direction_" + group).val("-");
			$("#span_end_" + group).val("start");
			$("#span_end_direction_" + group).val("-");
			$("#span_end_offset_" + group).val("1");
			$("input[name='upstream_region_" + group + "']").blur();
			break;
		case 'downstream':
			$("input[name='upstream_region_" + group + "']").attr("disabled","true");
			$("input[name='downstream_region_" + group + "']").removeAttr("disabled");
			$("#span_begin_" + group).val("stop");
			$("#span_begin_direction_" + group).val("+");
			$("#span_begin_offset_" + group).val("1");
			$("#span_end_" + group).val("stop");
			$("#span_end_direction_" + group).val("+");
			$("input[name='downstream_region_" + group + "']").blur();
			break;
		case 'custom':
			$("#span_begin_offset_" + group + ",#span_end_offset_" + group).unbind('blur');
			$("input[name='upstream_region_" + group + "']").attr("disabled","true");
			$("input[name='downstream_region_" + group + "']").attr("disabled","true");
			$("#span_end_offset_" + group).change();
			break
		default:
			// TODO: Error case
			break;
		}
		updateRegionLabels();
	}
	function updateRegionLabels() {
		var outputRegion = $("#outputGroup input[type=radio][name^='value(region_']:checked").val();
		$(".outputRegion").text(outputRegion + " region");
		var comparisonRegion = $("#comparisonGroup input[type=radio][name^='value(region_']:checked").val();
		$(".comparisonRegion").text(comparisonRegion + " region");
	}
	function prepCanvas(){
		a = new Diagram("a",document.getElementById('scale_a'));
		prepDynamicSpans(a, 0);
		b = new Diagram("b",document.getElementById('scale_b'));
		prepDynamicSpans(b, 1);
	}
	function drawRect(cxt,x1,y1,x2,y2,a,b,diaLength,type){	
		rect = document.createElement("div");
		if (x2 < 1) x2 *= 100;
		$(rect).css({
			"position":"relative",
			"top":y1,
			"left":x1,
			"width":x2,
			"height":y2,
			"background-color":a
		});	
		if(x2 >= 0) {
			start = document.createElement("div");
			stop = document.createElement("div");
			regiontext = document.createElement("div");
			$(start).css({
				"display":"inline",
				"position":"absolute",
				"bottom":"-12px",
				"left":"15px"
				});
			$(regiontext).css({
				"display":"inline",
				"position":"absolute",
				"bottom":"-12px",
				"left":"15px"
				});
			$(stop).css({
				"display":"inline",
				"position":"absolute",
				"top":"-2px",
				"left":(x2 - 12)   //was  35  for "stop" 
				});
			if(b){
				$(regiontext).html("Region");
				$(regiontext).css({"font-size":"90%","white-space":"nowrap"});
				$(start).css({"background-color":b,"top":"-3px","height":"9px","width":"2px","left":"-2px"});
				$(stop).css({"background-color":b,"top":"-3px","height":"9px","width":"2px","left":x2});
				if (diaLength == 1) {
					$(rect).css({"left":(x1 + 3)});
				}

			}else{
				$(start).html(type);
				$(start).css({"font-size":"90%","white-space":"nowrap"});
				if (diaLength > 1 && x2 > 1.6)
					$(stop).append('<img height="15" src="wdk/images/whitearrow.png" />');
				if (diaLength == 1) {
					$(stop).css({"top":"-6px","left":(x2 - 16)});
					$(stop).append('<img height="18" src="wdk/images/diamond.png" />');
				}
			}
			
			$(rect).append(start).append(stop).append(regiontext);  
		}

		cxt.append(rect);
	}
    // unit: base pairs
	function prepDynamicSpans(dia, i){
		dia.width = dia.cxt.innerWidth();
		dia.height =  dia.cxt.innerHeight();
		dia.center = dia.width / 2;
		dia.scale = 10;
		dia.feature = new Object();
		if (dia.name == "a") dia.feature.length = feature_length_a;
		else dia.feature.length = feature_length_b;
		dia.feature.loc = new Object();
		dia.region = new Object();
		setFeature(dia);
		drawFeature(dia);
		setRegion(dia, i);
		drawRegion(dia);
	}
	function drawFeature(dia){
		feat = dia.feature;
		cxt = dia.cxt;
		if(feat.loc.x < 0) {feat.loc.x = 0;}
		if(feat.loc.x + feat.width > dia.width) {feat.width = dia.width - feat.loc.x - 1;}
		drawRect(cxt,feat.loc.x,feat.loc.y,feat.width,feat.height,"#646464", false,dia.feature.length,dia.type);
	}
	function drawFeatureText(dia){
		dia.cxt.fillText("Feature", center - 20, dia.feature.loc.y+15);
	}
	function drawRegionText(dia){
		var i = (dia.name == "a") ? 0 : 1;
		var ba = document.getElementsByName('upstreamAnchor')[i].value;
		var bs = document.getElementsByName('upstreamSign')[i].value;
		var bo = parseInt(document.getElementsByName('upstreamOffset')[i].value);
		var ea = document.getElementsByName('downstreamAnchor')[i].value;
		var es = document.getElementsByName('downstreamSign')[i].value;
		var eo = parseInt(document.getElementsByName('downstreamOffset')[i].value);
		var vs = (ba == "Start") ? feature.loc.x : feature.loc.x + region.width;
		var ve = (ea == "Start") ? feature.loc.x : feature.loc.x + region.width;
		vs = (bs == 'plus') ? vs + (bo) : vs - (bo); 
		ve = (es == 'plus') ? ve + (eo) : ve - (eo);
		printlength = Math.abs(ve - vs);
		region = dia.region;
		scale = dia.scale;
		cxt = dia.cxt;
		t = ve + " - " + vs + " = " + printlength + "bp";
		if(t == '0bp') t = '1bp';
		if(region.start.x < region.end.x)
			cxt.fillText(t, (region.start.x + region.width / 2) - 20, region.start.y-5);
		else
			cxt.fillText(t, (region.end.x + region.width / 2) - 20, region.start.y-5);
	}
	function setFeature(dia){
		s = dia.scale;
		l = dia.feature.length;
		feature = dia.feature;
		center = dia.center;
		
		var botPad = 25;
		feature.width = (l / s);    
		feature.height = 11;
		var dx1 = center - feature.width/2;
		var dy1 = dia.height - (botPad + feature.height);
		feature.loc.x = dx1;
		feature.loc.y = dy1;
	}
	function drawRegion(dia){
		i = (dia.name == "a") ? 0 : 1; 
		cxt = dia.cxt;
		region = dia.region;
		drawRect(cxt,region.start.x,region.start.y,region.width,region.height,region_color[i],region_color[i],dia.feature.length);
	}
	function setRegion(dia){
		i = 0;
		region = dia.region;
		feature = dia.feature;
		scale = dia.scale;
		dn = dia.name.toLowerCase();
		var ba = $("select[name*='span_begin_"+dn+"']")[i].value;//document.getElementsByName('upstreamAnchor')[i].value;
		var bs = $("select[name*='span_begin_direction_"+dn+"']")[i].value;//document.getElementsByName('upstreamSign')[i].value;
		var bo = parseInt($("input[name*='span_begin_offset_"+dn+"']")[i].value);//parseInt(document.getElementsByName('upstreamOffset')[i].value);
		var ea = $("select[name*='span_end_"+dn+"']")[i].value;//document.getElementsByName('downstreamAnchor')[i].value;
		var es = $("select[name*='span_end_direction_"+dn+"']")[i].value;//document.getElementsByName('downstreamSign')[i].value;
		var eo = parseInt($("input[name*='span_end_offset_"+dn+"']")[i].value);//parseInt(document.getElementsByName('downstreamOffset')[i].value);
		dia.singlepoint = Single(dia,ba,bs,bo,ea,es,eo);
		region.height = 3;  //45
		region.width = (feature.length > 1) ? feature.length / scale : 0;   //10;
		var vs = (ba == "start") ? feature.loc.x : feature.loc.x + region.width;
		var ve = (ea == "start") ? feature.loc.x : feature.loc.x + region.width;
		vs = (bs == '+') ? vs + (bo/scale) : vs - (bo/scale); 
		ve = (es == '+') ? ve + (eo/scale) : ve - (eo/scale);
		region.width = Math.round(ve - vs);
		if(region.width < 0){
			region.width = Math.abs(region.width);
			ve = vs;
			vs = vs - region.width;
		}
		region.start = new Object();
		region.start.x = Math.round(vs);
		region.start.y = feature.loc.y - 34; //40
		region.end = new Object();
		region.end.x = Math.round(ve);
		region.end.y = region.start.y;
	}
	function Single(dia,ba,bs,bo,ea,es,eo){
		if(ba == ea && bs == es && bo == eo) return true;
		if(ba == ea && bo == 0 && eo == 0) return true;
		if(ba != ea && bs != es && eo == dia.feature.length / 2 && bo == dia.feature.length / 2) return true;
		if((es == 'minus' && eo == dia.feature.length && bo == 0) || (bs == 'plus' && bo == dia.feature.length && eo == 0)) return true;
		return false;
	}
	function checkMargins(dia){
		singlepoint = dia.singlepoint;
		dia.draw = false;
		
		rs_fe = Math.abs(dia.region.start.x - (dia.feature.loc.x + dia.feature.width));
		fs_re = Math.abs(dia.feature.loc.x - (dia.region.start.x + dia.region.width));
		maxWidth = Math.max(rs_fe,fs_re,Math.abs(dia.feature.width),Math.abs(dia.region.width));
		
		if(maxWidth >= dia.width){ // Zoom out
			dia.scale = dia.scale * 5;
			redraw(false,dia);
			return;
		}
		if(dia.region.start.x < 0 || dia.region.end.x < 0){ // move right
			if(dia.region.start.x < 0 ) dif = Math.abs(dia.region.start.x);
			else if(dia.region.end.x < 0 ) dif = Math.abs(dia.region.end.x);
			dia.center = dia.center + dif + 10;
			redraw(false,dia);
			return;
		}else if(dia.region.start.x > dia.width || dia.region.end.x > dia.width){ // move left
			if(dia.region.end.x > dia.width) dif = Math.abs(dia.region.end.x - dia.width);
			else if(dia.region.start.x > dia.width) dif = Math.abs(dia.region.start.x - dia.width);
			dia.center = dia.center - dif - 10;
			redraw(false,dia);
			return;
		}	
		dia.draw = true;
	}
	function redraw(fromPage, dia){
		if(dia.name == undefined){
			dia = eval("("+dia+")");
		}
		i = (dia.name == "a") ? 0 : 1;
		cxt = dia.cxt;
		center = dia.center;
		scale = dia.scale;
		feature = dia.feature;
		c = dia.c;
		if(fromPage){
			dia.center = center = dia.width / 2;
			dia.scale = scale = 10;
		}
		setFeature(dia);
		setRegion(dia);
		checkMargins(dia);
		singlepoint = false;
		if(dia.draw){
			dia.cxt.html("");
			drawFeature(dia);
			drawRegion(dia);
			dia.draw = false;
		}
	}
