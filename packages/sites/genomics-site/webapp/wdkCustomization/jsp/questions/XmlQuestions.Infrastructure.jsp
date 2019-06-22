<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>
<c:set var="banner" value="${xmlAnswer.question.displayName}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : Infrstructure"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Infrastructure"
                 division="Infrastructure">



<div id="includedContent"></div>

<script> 
    $(function(){
      $("#includedContent").load("https://qa.community.eupathdb.org/eupathdbpubs.html"); 
    });
</script> 

</imp:pageFrame>
