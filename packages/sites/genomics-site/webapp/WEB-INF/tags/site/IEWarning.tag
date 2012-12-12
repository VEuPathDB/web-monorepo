<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page">

  <jsp:directive.attribute name="version" required="true"
      description="Show message for versions of IE less than or equal to this."/>

  <jsp:text><![CDATA[<!--[if lte IE ${version}]>]]></jsp:text>
  <script type="text/javascript">
    jQuery(document).ready(function($) {
      if ($.cookie("api-unsupported")) return;
      // IE needs a moment
      setTimeout(function() {
        $("#wdk-dialog-IE-warning").dialog("open");
      }, 1000);
    });
  </script>
  <jsp:text><![CDATA[<![endif]-->]]></jsp:text>
</jsp:root>
