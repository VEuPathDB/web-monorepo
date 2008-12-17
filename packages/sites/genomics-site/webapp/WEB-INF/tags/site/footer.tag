<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
 <c:if test="${fn:containsIgnoreCase(dispModelName, 'ApiDB')}">
     <c:set var="dispModelName" value="EupathDB" />
</c:if>

<div align="center">

<div id="footer">
    <a href="http://www.eupathdb.org"><img src="../assets/images/eupathdblink.png" alt="Link to EuPathDB homepage" width="144" height="25" align="right" /></a>	&copy;2008  The EuPath Project Team:: 
    <a href="http://www.cryptodb.org">${dispModelName}.org</a> <br />
    <c:if test="${fn:containsIgnoreCase(dispModelName, 'TriTrypDB')}">
       Trypanosome images are care of the Tarleton Research Group <br />
    </c:if>
    <c:if test="${fn:containsIgnoreCase(dispModelName, 'CrtptoDB')}">
	Cryptosporidium images are care of the Center for Disease Control <br />
    </c:if>
    Please <a href="http://www.${dispModelName}.org/${dispModelName}/help.jsp">Contact Us</a> with any questions or concerns.
</div>

</div>
</body>
</html>
