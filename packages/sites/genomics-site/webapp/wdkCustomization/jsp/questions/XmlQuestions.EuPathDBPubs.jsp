<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : EuPathDB Publications"
                 banner="EuPathDB Publications"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="EuPathDB Publications"
                 division="EuPathDB Publications">

<div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc3/eupathPubs.html"); 
    });
</script> 

</imp:pageFrame>
