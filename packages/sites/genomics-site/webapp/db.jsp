<%--
return database alias from the connectionUrl defined in model-config.xml 
--%><%@ 
    taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions"
%><%@
    taglib prefix="api" uri="http://apidb.org/taglib"
%><c:catch
><api:wdkRecord 
    name="UtilityRecordClasses.SiteInfo"
/><api:modelConfig 
    var="modelConfig"
/>${fn:substringAfter(modelConfig.props['appDb']['connectionUrl'], "@")}</c:catch>
