<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%--############# Access URL Params ############--%>
<c:set var="nodeList"  value="${param.nodeList}" />
<c:set var="pathwayId" value="${param.pathway}" />
<c:set var="projectId" value="${param.model}" />

<base target="_parent" />

   <!-- StyleSheets provided by WDK -->
<imp:wdkStylesheets refer="window"/>

    <!-- JavaScript provided by WDK -->
<imp:wdkJavascripts refer="window"/>

<!-- br>EC NUMS:${nodeList} AND ${pathwayId}<br -->

    <style>
            /* The Cytoscape Web container must have its dimensions set. */
            html, body { height: 100%; width: 100%; padding: 0; margin: 0; }
            #cytoscapeweb { width: 100%; height: 100%; }
            .link { text-decoration: underline; color: #0b94b1; cursor: pointer; }
        </style>


 <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
 <style>
#draggable {z-index:10000;margin-left:18px;position:absolute;margin-top: 400px; background-color:white;border:1px solid black; border-radius:5px; width: 300px; padding: 0.5em; }
#cytoscapeweb { border:1px solid black; border-radius:5px;  }
</style>

<script>
$(function() {
$( "#draggable" ).draggable({ iframeFix: '#cytoscapeweb embed' });
});
</script>

<div id="draggable" style="">
  <p>Click on nodes for more info.  
<BR>Nodes highlighted in <font color="red">red</font> are EC numbers that we have mapped to at least one gene.
<BR>The nodes, as well as this info box, can be repositioned by dragging.
</div>
<div>
<BR><center><B>NOTE: </B>IDs of previous Query Result are in <font color="#00FF00">green</font>.</center>
<BR><BR>
</div>




<%--
The value of data-node-list is available in JavaScript:

  var nodeList = $("#cytoscapeweb").data('node-list');

This is a convenient way to pass params to javascript code without worrying about
calling functions at the right time.
--%>

<div id="cytoscapeweb" data-node-list="${nodeList}">
  Cytoscape Web will replace the contents of this div with your graph.
 </div>

 <div>
<BR><a href="/common/downloads/pathwayFiles/${pathwayId}.xgmml">XGMML data file</a>
</div>
 <div align="right">
<a href="http://cytoscapeweb.cytoscape.org/">
    <img src="http://cytoscapeweb.cytoscape.org/img/logos/cw_s.png" alt="Cytosca
pe Web"/></a>
</div>
<br>
<br />
<!-- CYTOSCAPE end-->


<!-- Flash embedding utility (needed to embed Cytoscape Web) -->
 <script type="text/javascript" src="/js/AC_OETags.min.js"></script>
        
<!-- Cytoscape Web JS API (needed to reference org.cytoscapeweb.Visualization) -->
 <script type="text/javascript" src="/js/cytoscapeweb.min.js"></script> 

 <imp:script src="wdkCustomization/js/records/PathwayRecordClasses.PathwayRecordClass.js"/>


<!-- CYTOSCAPE start-->
<script type="text/javascript">
  // get xgmml and draw the visualization
  $(function() {
    drawVisualization("${pathwayId}");
  });
</script>        

