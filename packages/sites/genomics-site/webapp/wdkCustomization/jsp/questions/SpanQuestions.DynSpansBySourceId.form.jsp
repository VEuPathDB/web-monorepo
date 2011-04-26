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
-->
</style>

<table id="span-location">
  <tr>
    <td width="450">
      <site:question/>
    </td>
    <td id="span-control" width="200">
      <p>Please choose a region/segment on the left and add it to the search list.</p>
      <br />
      <div style="text-align:center">
        &#8658;
        <input id="span-compose" type="button" name="compose" value="Add Location" />
        &#8658;
      </div> 
      <br />
      <p>the length of each region/segment is limited to 100Kbps, and the end
        location cannot be smaller than start.</p>
    </td>
    <td width="400">
      <div>Or, you can enter a comma-separated list of genomic segments directly in the box below.
        The format of a segment is as the following:
      </div>
      <br />
      <div align="center"><font color="blue"><b>sequence_id:start-end:strand</b></font></div>
      <br />
      <div>
        Here are some examples: TGME49_chrIa:10000-10500:f, Pf3D7_04:100-200:r
      </div>
      <br />
      <div id="span-search-list">

      </div>
    </td>
  </tr>
</table>
