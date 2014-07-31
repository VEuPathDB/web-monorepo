<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0" xmlns:jsp="http://java.sun.com/JSP/Page">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <div>
        <a name="userdb"/>
        <hr/>
        <h2>User Database</h2>
        <a href="#appdb">Jump to AppDB</a>
        <hr/>
        <pre>
${wdkModel.model.userDb.unclosedConnectionInfo}
        </pre>
      </div>
      <div>
        <a name="appdb"/>
        <hr/>
        <h2>Application Database</h2>
        <a href="#userdb">Jump to UserDB</a>
        <hr/>
        <pre>
${wdkModel.model.appDb.unclosedConnectionInfo}
        </pre>
      </div>
    </body>
  </html>
</jsp:root>
