<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
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
#span-location #span-params { vertical-align: middle; }
#span-location #span-search-list #span_id td { font-weight:bold; }
-->
</style>
<br>
<table id="span-location">
<tr style="font-weight:bold">
<td style=" border-right: 3px double black;" class="h4left" width="30%">1. Build segment IDs</td>
<td style=" border-right: 3px double black;" class="h4left" width="20%">2. Add them to your list</td>
<td class="h4left" width="50%">3. When your list is ready, hit "Get Answer" button below</td>
</tr>
<tr><td></td></tr>
  <tr>
    <td id="span-params" width="30%">
      <site:question nohelp="true"/>
    </td>
    <td id="span-control" width="20%">
      <p><i>Choose a segment on the left and add it to the search list</i></p>
      <br />
      <div style="text-align:center">
        &#8658;
        <input id="span-compose" type="button" name="compose" value="Add Location" />
        &#8658;
      </div> 
      <br />
      <ul style="text-align:left;list-style-type: square;list-style-position:inside;">
	<li><i>The max length of each segment is 100Kbps
	<li><b>End Location</b> cannot be smaller than <b>Start</b></i>
      </ul>
    </td>
    <td width="50%">
      <div><i>In addition, you may enter genomic segments separated by comma, in the box below.
        The format of a segment is:</i>
      </div>
      <br />
      <div align="center">
	<b>sequence_id:start-end:strand</b>
      	<br />
      	<span style="font-size:90%;font-style:italic">(Examples: TGME49_chrIa:10000-10500:f, Pf3D7_04:100-200:r)</span>
      </div>

      <br />
      <div id="span-search-list">

      </div>
    </td>
  </tr>
</table>

<div id="span-extra"></div>

