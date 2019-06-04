<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>
<c:set var="banner" value="${xmlAnswer.question.displayName}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : About"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="AboutAll"
                 division="about">

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 
  <tr><td><h2>Common information for all EuPathDB websites</h2></td></tr>
  <tr>
    <td bgcolor=white valign=top>
      <div id="includedContent"></div>
    </td>
    <td valign=top class=dottedLeftBorder></td> 
  </tr>
</table> 

<script src="jquery.js"></script> 
    <script> 
    $(function(){
      $("#includedContent").load("//devcommunity.eupathdb.org/embedded/help/general/index.html"); 
    });
</script> 

</imp:pageFrame>

