<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<div> <!-- Wrapper so jQuery handles this properly. -->
  <div id="Workspace">
    <site:Results  strategy="${wdkStrategy}"/>
  </div>
</div>


