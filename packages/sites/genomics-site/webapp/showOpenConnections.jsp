<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:api="http://apidb.org/taglib">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
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
    </body>
  </html>
</jsp:root>
