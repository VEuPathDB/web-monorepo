<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<imp:pageFrame title="${wdkModel.displayName} : Infrastructure"
               banner="Infrastructure">

<div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc3/infrastructure.html"); 
    });
</script> 

</imp:pageFrame>
