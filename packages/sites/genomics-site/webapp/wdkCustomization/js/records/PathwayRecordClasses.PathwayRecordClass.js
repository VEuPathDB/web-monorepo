// id of Cytoscape Web container div
var div_id = "cytoscapeweb";

// initialization options
var options = {
    // where you have the Cytoscape Web SWF
    swfPath: "/swf/CytoscapeWeb",
    // where you have the Flash installer SWF
    flashInstallerPath: "/swf/playerProductInstall"
};

// init and draw
var vis = new org.cytoscapeweb.Visualization(div_id, options);
var presetLayout;


function drawVisualization(pathwayId) {
  $.ajax({
    url: "/common/downloads/pathwayFiles/" + pathwayId + ".xgmml",
    dataType: "text",
    success: function(data){
      vis.draw(options);
      vis.draw({ network: data , layout: 'Preset' });
    },
    error: function(){
      alert("Error loading file");
    }
  });
}



// callback when Cytoscape Web has finished drawing
vis.ready(function() {

	// listener for when nodes and edges are clicked
	vis.addListener("click", "nodes", function(event) {
		// try "mouseover" OR "click"
		handle_click(event);
	    });
                    
	function handle_click(event) {
	    var target = event.target;                         
	    clear();
	    var type = target.data["Type"];

	    if(type == "enzyme") {
		print ("<b>EC Number:  </b> " + target.data["label"]);
		print("");
		print("<b>Enzyme Name:  </b>" + target.data["Description"]);
		print("");
		
		if(target.data["Organisms"]) {
		    var orgs =  target.data["Organisms"].split(",");
		    print("<b>Organism(s): </b>");
		    for(var i in orgs.sort()) {
			print("&nbsp;&nbsp;" + orgs[i]);        
		    }
		    print("");
		    print("<a href='/a/processQuestion.do?questionFullName=GeneQuestions.InternalGenesByEcNumber&array%28organism%29=all&questionSubmit=Get+Answer&array%28ec_number_pattern%29=" + target.data["label"] + "'>Search for Gene(s) By EC Number</a>");
		    print("");

		    if(target.data.image) {
			var link =  target.data.image + '&fmt=png&h=250&w=300' ;
			print("<img src='" + link + "'>");
		    }
                              }
	    } 
	    
	    if(type == "compound") {
		print("<b>Compound ID:</b>  " + target.data["label"] + "<br />");
		
		if(target.data.Description) {
		    print("<b>Name:</b>  " + target.data["Description"] + "<br />");
		}
		print ("<a href='http://www.genome.jp/dbget-bin/www_bget?" + target.data["label"] + "'>View in KEGG</a>");

		if(target.data["CID"]) {
		    print("<a href='/a/showRecord.do?name=CompoundRecordClasses.CompoundRecordClass&project_id=PlasmoDB&source_id=CID:" + target.data["CID"] + "'>View in PlasmoDB</a>");
		}
		if(target.data["SID"]) {
		    print("<a href='http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?sid=" + target.data["SID"] + "'>View on NCBI</a>");
		    print("<img src='http://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?t=l&sid=" + target.data["SID"] + "'>");
		}
	    }

	    if(type == "map") {
		print("<b>Pathway:  </b>" + "<a href='/a/showRecord.do?name=PathwayRecordClasses.PathwayRecordClass&project_id=PlasmoDB&source_id=" + target.data["Description"] + "'>" + target.data["label"] + "</a>");
		print("");
		print("<a href='http://www.genome.jp/dbget-bin/www_bget?" + target.data["Description"] + "'>View in KEGG</a>");
	    }
	}
        
            
	function clear() {
	    document.getElementById("draggable").innerHTML = "";
	}
		 

	function print(msg) {
	    document.getElementById("draggable").innerHTML += msg + "<br />";
	}

	// customTooltip function
	vis["customTooltip"] = function (data) {
	    //  var value = Math.round(100 * data["weight"]) + "%";
	    var value = data["label"];
	    if (data["Description"]) {
		value  = value +  ": " + data["Description"] ;
	    }
	    //if (data["Organisms"]) {
	    //value  = value + "\nOrganisms: " + data["Organisms"];
	    //}
	    return (value);
	};

	// customBorder function : if node has Organisms, then border should be a different color
	vis["customBorder"] = function (data) {
	    var value = data["label"];
	    if (data["Organisms"]) {
		value  = "#FF0000";
	    } else {
		value = "#000000";
	    }		       	     
	    return (value);
	};

	var colorMapper = {
	    attrName: "Type",
	    entries: [ { attrValue: "map", value: "#ccffff" },
		                { attrValue: "enzyme", value: "#ffffcc" },
		                { attrValue: "compound", value: "#0000ff" } ]
	};
		 
	var shapeMapper = {
	    attrName: "Type",
	    entries: [ { attrValue: "map", value: "ROUNDRECT" },
		                { attrValue: "enzyme", value: "SQUARE" },
		                { attrValue: "compound", value: "CIRCLE" } ]
	};

	var sizeMapper = {
	    attrName: "Type",
	    entries: [ { attrValue: "map", value: 'auto' }]
	};

	var widthMapper = {
	    attrName: "Type",
	    entries: [ { attrValue: "enzyme", value: 50 },
		                { attrValue: "compound", value: 15 } ]
	};

	var heightMapper = {
	    attrName: "Type",
	    entries: [{ attrValue: "map", value: 20 },
		                { attrValue: "enzyme", value: 20 },
		                { attrValue: "compound", value: 15 } ]
	};

	var labelPosition = {
	    attrName: "Type",
	    entries: [{attrValue: "compound", value: 'right' } ]
	};

	var labelSize = {
	    attrName: "Type",
	    entries: [{ attrValue: "compound", value: 0 } ],
	};

	// to not show arrowhead for a Reversible reaction
	var edgeArrow= {
	    attrName: "direction",
	    entries: [{ attrValue: "Reversible", value: "NONE" },
		                   { attrValue: "Irreversible", value: "DELTA" }  ]
	};


	var style = {
	    nodes: {
		color: { discreteMapper: colorMapper }, 
		shape: { discreteMapper: shapeMapper }, 
		width : { discreteMapper: widthMapper }, 
		size : { discreteMapper: sizeMapper }, 
		height : { discreteMapper: heightMapper }, 
		borderColor : { customMapper: { functionName:  "customBorder" } }, 
		borderWidth : 1,
		tooltipText : {customMapper:  { functionName: "customTooltip" } },
		labelFontSize : { discreteMapper: labelSize },
	    },
	    edges: {
		color :"#000000", width: 1, 
		targetArrowShape:  { discreteMapper: edgeArrow  },
	    }
	};

	//  node attribute to store the image
	var field = { name: "image", type: "string", defValue: "" };
	vis.addDataField("nodes", field);

	vis.nodeTooltipsEnabled(true);
	vis.visualStyle(style);

	changeExperiment = function(val) {
	    // use bypass to hide labelling of EC num that have heatmap graphs
	    var nodes = vis.nodes();  

	    for (var i in nodes) {
		var n = nodes[i];

		var type =  n.data.Type;

		if(type == ("enzyme") && n.data.Organisms) {
		    var ecNum = n.data.label;

		    if(val) {
			var linkPrefix = '/cgi-bin/dataPlotter.pl?idType=ec&' + val + '&id=' + ecNum;
			var link =  linkPrefix + '&fmt=png&h=20&w=50&compact=1' ;

			style.nodes[n.data.id] = {image:  link,  label: ""}
			n.data.image = linkPrefix;
		    } else {
			style.nodes[n.data.id] = {image:  ""};
			n.data.image = "";
		    }
		    vis.updateData([n]);
		}
	    }

	    vis.nodeTooltipsEnabled(true);
	    vis.visualStyleBypass(style);
	};

	changeLayout = function(val) {
	    var current = vis.layout();
	    if(current.name == "Preset") {
		presetLayout = current;
	    }

	    if(val == "Preset") {
		vis.layout(presetLayout);
	    }
	    else {
		vis.layout(val);
	    }    
	};


	colorNodes = function(val) {
	    //  to color the ec numbers that correspond to a set of genes
	    var nodes = vis.nodes();  

	    for (var i in nodes) {
		var n = nodes[i];
		var type =  n.data.Type;
		var label = n.data.label;

		var nodeArray = val.split(/,/);
		for(var j = 0; j < nodeArray.length; j++) {
		    if(type == ("enzyme") && label == nodeArray[j]  ) {
			style.nodes[n.data.id] = { color: "#00FF00" , border : 2};

			//vis.updateData([n]);
		    } else if (type == ("compound") && label == nodeArray[j]  ) {
			style.nodes[n.data.id] = { color: "#00FF00" };

		    }



		}
	    }
	    vis.nodeTooltipsEnabled(true);
	    vis.visualStyleBypass(style);
	};


	// color EC Numbers, if any specified
	var nodeList = $('#' + div_id).data('node-list');
	colorNodes(nodeList);

	// set the style programmatically
	document.getElementById("color").onclick = function(){
	    vis.visualStyleBypass(style);
	};

    });
// end ready


// Resize cytoscape container to height of viewport
jQuery(function($) {
  function resizeMap() {
    $('#' + div_id).height($(window).height() - 10);
  }

  $(window).on('resize', resizeMap);
  resizeMap();
});
