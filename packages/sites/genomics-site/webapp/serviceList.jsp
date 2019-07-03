<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>


<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<imp:pageFrame banner="${wdkModelDispName}">

<c:set var="margin" value="15px"/>

<!-- this should be read from the model -->
<c:if test="${wdkModelDispName eq 'FungiDB'}">
    	<c:set var="organism" value="Aspergillus clavatus"/>
</c:if>
<c:if test="${wdkModelDispName eq 'AmoebaDB'}">
    	<c:set var="organism" value="Entamoeba dispar"/>
</c:if>
<c:if test="${wdkModelDispName eq 'CryptoDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Cryptosporidium hominis"/>
</c:if>
<c:if test="${wdkModelDispName eq 'EuPathDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Leishmania major,Toxoplasma gondii"/>
</c:if>
<c:if test="${wdkModelDispName eq 'MicrosporidiaDB'}">
        <c:set var="organism" value="Encephalitozoon cuniculi"/>
</c:if>
<c:if test="${wdkModelDispName eq 'PiroplasmaDB'}">
        <c:set var="organism" value="Babesia bovis,Theileria annulata,Theileria parva"/>
</c:if>
<c:if test="${wdkModelDispName eq 'PlasmoDB'}">
        <c:set var="organism" value="Plasmodium falciparum,Plasmodium knowlesi"/>
</c:if>
<c:if test="${wdkModelDispName eq 'ToxoDB'}">
        <c:set var="organism" value="Toxoplasma gondii,Neospora caninum"/>
</c:if>
<c:if test="${wdkModelDispName eq 'GiardiaDB'}">
        <c:set var="organism" value="Giardia Assemblage A,Giardia Assemblage B"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TrichDB'}">
        <c:set var="organism" value="Trichomonas vaginalis"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TriTrypDB'}">
        <c:set var="organism" value="Leishmania braziliensis,Trypanosoma brucei"/>
</c:if>
<c:if test="${wdkModelDispName eq 'HostDB'}">
        <c:set var="organism" value="Homo sapiens"/>
</c:if>

  <div id="includedContent"></div>

<script> 
    $(function(){
     $("#includedContent").load("${wdkModel.model.properties.COMMUNITY_SITE}/brc4/webServices.html"); 
    });
</script> 


</imp:pageFrame>
