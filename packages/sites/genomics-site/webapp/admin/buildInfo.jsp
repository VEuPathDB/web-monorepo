<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<h2>Build State</h2>
<p>
  <c:catch var="e">
  <api:properties var="build" propfile="WEB-INF/wdk-model/config/.build.info" />
  
  Last build  was a '<b>${build['!Last.build.component']}</b> 
  <b>${build['!Last.build.initialTarget']}</b>' 
  on <b>${build['!Last.build.timestamp']}</b>
  <a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib('A given build may not refresh all project components. ' + 
        'For example, a \'ApiCommonData/Model install\' does not build any WDK code.<br>' +
        'See Build Details for a cumulative record of past builds.')"
        onmouseout = "return nd();"><sup>[?]</sup></a>

  <br>

  <b><a href="#" style="text-decoration:none" 
        onclick="Effect.toggle('buildtime','blind'); return false">
  Component Build Details &#8593;&#8595;</a></b>

  <div id="buildtime" style="padding: 5px; display: none"><div>
  <font size='-1'>A given build may not refresh all project components.<br>
  The following is a cummulative record of past builds.</font>
  
      <c:set var="i" value="0"/>

      <table border="0" cellspacing="3" cellpadding="2">
      <tr class="secondary3">
      <th align="left"><font size="-2">component</font></th>
      <th align="left"><font size="-2">build time</font></th>
      </tr>
      <c:forEach items="${build}" var="p">
      <c:if test="${fn:contains(p.key, '.buildtime')}">
  
          <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
          </c:choose>
  
          <td><pre>${fn:replace(fn:replace(p.key, ".buildtime", ""), ".", "/")}</pre></td>
          <td><pre>${p.value}</pre></td>
        </tr>
        <c:set var="i" value="${i +  1}"/>
      </c:if>
      </c:forEach>
      </table>
  
  </div></div>

  <p>

  <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('svnstate','blind'); return false">
  Svn Working Directory State &#8593;&#8595;</a></b>
  <div id="svnstate" style="padding: 5px; display: none"><div>
  <font size='-1'>State at build time. Uncommitted files are highlighted. Files may have been committed
  since this state was recorded.</font>
  
      <table class='p' border='1' cellspacing='0'>
      <c:forEach items="${build}" var="p">
      
      <c:if test="${fn:contains(p.key, '.svn.') && p.value != '' && p.value != 'NA' }">
          <c:choose>
          <c:when test="${fn:contains(p.key, '.svn.status')}">
            <c:set var="bgcolor" value="bgcolor='#FFFF99'"/>
            <c:set var="key">
            ${fn:replace(fn:replace(p.key, ".svn.status", " status"), ".", "/")}
            </c:set>
          </c:when>
          <c:otherwise>
            <c:set var="key">
            ${fn:replace(fn:replace(p.key, ".svn.info", ""), ".", "/")}
            </c:set>
          </c:otherwise>          
          </c:choose>
      <tr ${bgcolor}>
          <td><pre>${key}</pre></td>
        <td><pre>${p.value}</pre></td>
      </tr>
          <c:remove var="bgcolor"/>
      </c:if>
      </c:forEach>
      </table>
      
      <p>
      Use the following commands from within your $PROJECT_HOME to switch it to match this site.
      </p>
      <table class='p' border='1' cellspacing='0' cellpadding='5'>
      <tr><td class='monospaced'>
         <c:forEach items="${build}" var="p">
           <c:if test="${fn:contains(p.key, '.svn.info')}">
              <c:set var="svnrevision">
                ${fn:trim(
                    fn:substringAfter(
                        fn:substringBefore(p.value, "Last Changed Rev: "), "Revision: "))}
              </c:set>
              <c:set var="svnbranch">
                ${fn:trim(
                    fn:substringAfter(
                        fn:substringBefore(p.value, "Revision: "), "URL: "))}
              </c:set>
              <c:set var="svnproject">
                ${fn:replace(fn:replace(p.key, ".svn.info", ""), ".", "/")}
              </c:set>
            svn switch -r${svnrevision} ${svnbranch} ${svnproject};<br>
          </c:if>
        </c:forEach>
      </td></tr>
      </table>
  </div></div>

</c:catch>
<c:if test="${e!=null}">
    <font size="-1" color="#CC0033">build info not available (check WEB-INF/wdk-model/config/.build.info)</font>
</c:if>
