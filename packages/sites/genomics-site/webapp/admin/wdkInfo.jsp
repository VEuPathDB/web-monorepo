<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<api:wdkRecord name="UtilityRecordClasses.SiteInfo"/>


<h2>WDK</h2>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<c:catch var="e">
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <tr><td><b>Cache table count</b>:</td><td class="p">${wdkRecord.attributes['cache_count'].value}</td></tr>
</c:if>
</c:catch>
<c:if test="${e!=null}"> 
    <tr><td><font color="red">Cache tables information not available. Did you run wdkCache?</font></td></tr>
</c:if>

<tr><td>&nbsp;</td></tr>

<tr><td>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicommMacro']}">
    <b>LOGIN_DBLINK Macro</b>
    <a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         '@LOGIN_DBLINK@ as defined in WDK Record scope.<br>' +
         '(<i>cf.</i> the \'Available DBLinks\' table.)'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>:
    </td><td  class="p" valign="bottom">
        ${wdkRecord.attributes['apicommMacro'].value}
</c:if>
</td></tr>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicomm_global_name']}">
    <tr><td>
   <b>ApiComm dblink global_name</b>
    <a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <i>select global_name from global_name${wdkRecord.attributes['apicommMacro'].value}</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>:  
    </td><td class="p" valign="bottom"> 
    <c:catch var="e">
        ${wdkRecord.attributes['apicomm_global_name'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">${e}</font>
    </c:if>
    </td></tr>
</c:if>

</table>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
    <tr><td>
      <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('modelconfig','blind'); return false">
  Model Configuration &#8593;&#8595;</a></b>
  <div id="modelconfig" style="padding: 5px; display: none"><div>

        <api:modelConfig var="modelConfig"/>
        <p>
        The following configurations were obtained from the WDK's running instance of the ModelConfig* classes. These generally represent values defined in 
        the <code>model-config.xml</code>, <i>at the time the webapp was loaded</i>,
        although some properties shown may have been added by the WDK's internals. Passwords have been masked in this display.
<pre><c:forEach 
    var="section" items="${modelConfig.props}"
><b>${section.key}</b><blockquote><c:forEach 
    var="cfg" items="${section.value}"
>${cfg.key} = ${fn:escapeXml(cfg.value)}
</c:forEach></blockquote></c:forEach>
</pre>    
      </div></div>
    </td></tr>
</table>
