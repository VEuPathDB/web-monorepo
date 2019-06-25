<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : External Links"
                 banner="External Links"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="External Links"
                 division="External Links">

<div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc3/${wdkModel.displayName}/externalLinks.html"); 
    });
</script> 

</imp:pageFrame>
