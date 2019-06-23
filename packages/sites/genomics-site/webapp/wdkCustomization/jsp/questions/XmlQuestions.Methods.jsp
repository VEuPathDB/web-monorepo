<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : Methods"
                 banner="Methods"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Methods"
                 division="Methods">

<div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc3/methods.html"); 
    });
</script> 

</imp:pageFrame>
