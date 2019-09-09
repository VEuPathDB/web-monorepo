<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<imp:pageFrame title="${wdkModel.displayName} : About All"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="AboutAll"
                 division="about">

<h2>Common information for all EuPathDB websites</h2>

<div id="includedContent"></div>

<script> 
    $(function(){
      $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/embedded/help/general/index.html"); 
    });
</script> 

</imp:pageFrame>

