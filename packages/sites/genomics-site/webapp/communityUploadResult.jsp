<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<html>

<head>
<title>Success</title>
</head>

<body>

<c:set value="${requestScope.fileName}" var="fileName"/>


<p align="center"><font size="5" color="#000080">File Successfully Received</font></p>

<%
String fileName=(String)request.getAttribute("fileName");
%>


File: ${fileName}<%=fileName%>
</body>

</html>
