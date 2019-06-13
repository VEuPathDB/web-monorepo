<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>
<c:set var="banner" value="${xmlAnswer.question.displayName}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

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
      $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/help/general/index.html"); 
    });
</script> 

</imp:pageFrame>

