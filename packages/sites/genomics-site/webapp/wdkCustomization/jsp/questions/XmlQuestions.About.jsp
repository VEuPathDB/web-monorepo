<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<imp:pageFrame title="${wdkModel.displayName} : About"
                 banner="About"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="About"
                 division="About">

<div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc3/${wdkModel.displayName}/about.html"); 
    });
</script> 

</imp:pageFrame>
