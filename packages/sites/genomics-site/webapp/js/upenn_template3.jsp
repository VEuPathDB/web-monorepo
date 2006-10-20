<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="headElement">
  <script src="js/AjaxInterpro.js" type="text/javascript"></script>
  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>
</c:set>

<site:header 
             headElement="${headElement}"
             bodyElement="${bodyElement}"/>

            <br>
			
		<table width="70%"  border="0" align="center" cellpadding="0" cellspacing="0">
		
		  <tr>
			<td valign="top">
			<input class="form_box" 
				id="searchBox" 
				value="default" 
				type="text" 
				name="default" 
				size="53" 
				maxlength="120">
				<div id="searchBoxupdate" style="display:none;border:1px solid black;background-color:white;height:125px;overflow:auto;"></div>

			
			<select id="dataDropdownBox" name="select" onChange="loadSelectedData( );">
			  <option value="none">Select Data Type</option>
			  <option value="Panther">Panther</option>
			  <option value="Prints">Prints</option>
			  <option value="Pfam">Pfam</option>
			</select>
			</td>
		  </tr>
		  
		</table>
 
            

            <br>
			
			
