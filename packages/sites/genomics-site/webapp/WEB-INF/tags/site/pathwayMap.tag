<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="pathway"
              description="Restricts output to only this pathway"
%>

<%@ attribute name="projectId"
              description="Project Id for the component"
%>

<%@ attribute name="geneList"
              description="List if genes (subset) for which paiting needs to be done (optional)"
%>

<%@ attribute name="compoundList"
              description="List if compounds (subset) for which paiting needs to be done (optional)"
%>

<map name=pathwayMap>

<c:import url="http://${pageContext.request.serverName}/cgi-bin/getImageMap.pl?model=${projectId}&pathway=${pathway}&geneList=${geneList}&compoundList=${compoundList}" />

</map>


<script type="text/javascript">
// Create the tooltips only when document ready
$(document).ready(function(){
   // Use the each() method to gain access to each elements attributes
   $('area').each(function()
   {
      $(this).qtip(
      {
         content: $(this).attr('alt'), // Use the ALT attribute of the area map
         position: {		
                my: 'top left',  // Position my top left...
		at: 'center', // at the bottom right of...
         },
         hide:  {
            fixed: true // Make it fixed so it can be hovered over
         },
	 style: {
		classes: 'ui-tooltip-green ui-tooltip-rounded'
	 }
      });
   });
});
</script>

