<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:api="http://apidb.org/taglib">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <c:set var="adminEmailProp" value="${wdkModel.model.modelConfig.adminEmail}"/>
  <c:set var="adminEmailProp" value="${fn:replace(adminEmailProp,' ','')}"/>
  <c:set var="adminEmailList" value="${fn:split(adminEmailProp,',')}"/>
  <c:set var="currentUserEmail" value="${sessionScope.wdkUser.email}"/>
  <c:set var="validUser" value="${false}"/>
  <c:forEach var="item" items="${adminEmailList}">
    <c:if test="${item eq currentUserEmail}">
      <c:set var="validUser" value="${true}"/>
    </c:if>
  </c:forEach>
  <html>
    <body>
      <c:if test="${validUser}">
        <c:set var="instanceList" value="${api:getAllDatabaseInstances()}"/>
        <a name="top"/>
        <h2>Database Instances Instantiated in this JVM</h2>
        <ul>
          <c:forEach var="db" items="${instanceList}">
            <li><a href="#${db.key}">${db.key}</a></li>
          </c:forEach>
        </ul>
        <c:forEach var="db" items="${instanceList}">
          <div>
            <a name="${db.key}"/>
            <hr/>
            <h2>Database Instance: ${db.key}</h2>
            <a href="#top">Back to Top</a>
            <hr/>
            <pre>
${db.value.unclosedConnectionInfo}
            </pre>
          </div>
        </c:forEach>
      </c:if>
      <c:if test="${not validUser}">
        <h2>Permission Denied.  You must log in as an admin to access this functionality.</h2>
      </c:if>
    </body>
  </html>
</jsp:root>
