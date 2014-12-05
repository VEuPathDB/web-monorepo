<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<style TYPE="text/css"> 
	<!-- 
		 #span-location { margin: 0px auto 0px auto; }
		 #span-location #span-control {
		 border-left: 3px double black; 
		 border-right: 3px double black; 
		 vertical-align: middle;
		 text-align: center;
		 padding: 5px;
		 }
		 #span-location #span-params { 
		 vertical-align: top; 
		 border-right: 3px double black;
		 }
     #span-location #span-params, #span-location #span-search-list {
       display: inline-block;
       width: 49%;
     }
     #span-location select, #span-location input {
       max-width: 96%;
     }
		 /* #span-location #span-search-list #span_id td { font-weight:bold; } */
		 #span_id td.disabled,#span_id tr.disabled {
		 cursor:default;
		 }
		-->
</style>
<!-- <br> -->

<div id="span-location">
  <div id="span-params">
    <h4 class="h4left">1. Generate a list of segment IDs</h4>
    <imp:question/>
    <br />
    <div style="text-align:center">
      <span style="font-size:150%">>>></span>
      <input id="span-compose" type="button" name="compose" value="Add Location" />
      <span style="font-size:150%">>>></span>
    </div> 
    <br />
    <ul style="text-align:left;list-style-type: square;list-style-position:inside;">
      <li><i>The max length of each segment is 100Kbps
          <li><b>End Location</b> cannot be smaller than <b>Start</b></i>
    </ul>
  </div>
  <div id="span-search-list">
    <h4 class="h4left">2. When your list is ready, hit button below "Get Answer"</h4>
    <div><i>You may also enter directly genomic segments separated by comma, in the box below.
        The format of a segment is:</i>
    </div>
    <br />
    <div align="center">
      <b>sequence_id:start-end:strand</b>
      <br />
      <span style="font-size:90%;font-style:italic">(Examples: TGME49_chrIa:10000-10500:f, Pf3D7_04:100-200:r)</span>
    </div>
    <br />
  </div>
</div>

<div id="span-extra"></div>
