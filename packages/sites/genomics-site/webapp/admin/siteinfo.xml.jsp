<%@
    page contentType="text/xml" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="api" uri="http://apidb.org/taglib"
%><%@ 
    taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions"
%><%@
    taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml"
%><api:wdkRecord 
    name="UtilityRecordClasses.SiteInfo"
/><api:wdkUserDB 
    var="cache"
/><api:orclSvcAliases 
    servicename="${wdkRecord.attributes['service_name'].value}" var='appdbAliases'
/><api:orclSvcAliases 
    servicename="${cache.dbInfo['service_name']}" var='userdbAliases'
/><api:modelConfig 
    var="modelConfig"
/><api:commentConfig
    var="commentConfig"
/><c:set 
    var="dateFormatStr" value="EEE dd MMM yyyy h:mm a"
/><c:choose><c:when 
    test="${param.path != null && param.path != ''}"
><c:set 
    var="path" value="${param.path}"
/></c:when><c:otherwise><c:set 
    var="path" value="/"
/></c:otherwise></c:choose><c:set 
    var="xml"
><?xml version="1.0" encoding="UTF-8"?>
<wdk>
  <modelname>${applicationScope.wdkModel.name}</modelname>
  <modelversion>${applicationScope.wdkModel.version}</modelversion>
  <databases>
    <appdb>
      <servicename>${wdkRecord.attributes['service_name'].value}</servicename>
      <instancename>${wdkRecord.attributes['instance_name'].value}</instancename>
      <globalname>${wdkRecord.attributes['global_name'].value}</globalname>
      <aliases><c:forEach var="a" items="${appdbAliases.nameArray}">
        <alias>${a}</alias></c:forEach>
      </aliases>
    </appdb>
    <userdb>
      <servicename>${cache.dbInfo['service_name']}</servicename>
      <instancename>${cache.dbInfo['instance_name']}</instancename>
      <globalname>${cache.dbInfo['global_name']}</globalname>
      <aliases><c:forEach var="a" items="${userdbAliases.nameArray}">
        <alias>${a}</alias></c:forEach>
      </aliases>
    </userdb>
  </databases>
  <modelconfig>
    <c:forEach 
        var="section" items="${modelConfig.props}"
    ><${fn:toLowerCase(section.key)}><c:forEach 
        var="cfg" items="${section.value}"
    ><${fn:toLowerCase(cfg.key)}>${fn:escapeXml(cfg.value)}</${fn:toLowerCase(cfg.key)}>
    </c:forEach>
        </${fn:toLowerCase(section.key)}>
    </c:forEach>
  </modelconfig>
  <commentconfig>
    <c:forEach 
        var="cfg" items="${commentConfig.props}"
    ><${fn:toLowerCase(cfg.key)}>${fn:escapeXml(cfg.value)}</${fn:toLowerCase(cfg.key)}>
    </c:forEach>
  </commentconfig>
  <modelprop>
    <c:forEach 
        var="prop" items="${applicationScope.wdkModel.properties}"
    ><${fn:toLowerCase(fn:replace(prop.key, '_', ''))}>${fn:escapeXml(prop.value)}</${fn:toLowerCase(fn:replace(prop.key, '_', ''))}>
    </c:forEach>
  </modelprop>
</wdk>
</c:set
><c:choose
><c:when 
    test="${param.value != null}"
><c:set 
    var="xslt"
><xsl:stylesheet 
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text"/>
    <xsl:template match="*">
        <xsl:value-of select="${path}"/>
      </xsl:template>
    </xsl:stylesheet></c:set
><x:transform 
    doc="${xml}" xslt="${xslt}"
/></c:when
><c:otherwise
><c:set var="xslt">
<xsl:stylesheet 
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
      xmlns:xalan="http://xml.apache.org/xslt">
  <xsl:strip-space elements="*" />
  <xsl:output method="xml" indent="yes" xalan:indent-amount="2"/>
    <xsl:template match="*">
        <xsl:copy-of select="${path}"/>
    </xsl:template>
</xsl:stylesheet
></c:set
><x:transform 
    doc="${xml}" xslt="${xslt}"
/></c:otherwise
></c:choose>