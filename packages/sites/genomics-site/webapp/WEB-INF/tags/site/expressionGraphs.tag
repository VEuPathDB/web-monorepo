<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="organism"
              description="Restricts output to only this organism"
%>

<site:profileGraphs organism="${organism}" tableName="ExpressionGraphs"/>
