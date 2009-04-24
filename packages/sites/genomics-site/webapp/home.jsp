<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<%-- header includes menubar and announcements tags --%>
<%-- refer is used to determine which announcements are shown --%>
<site:header refer="home"/>

<site:DQG />
<site:sidebar />
<site:footer  refer="home"/>
