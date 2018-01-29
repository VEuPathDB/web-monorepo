<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ attribute name="analysis"
              required="true"
              type="org.gusdb.wdk.model.analysis.StepAnalysis"
              description="The Analysis To Display As Tile"
%>
<%@ attribute name="recordClassName"
              required="false"
              description="The parent question's RecordClassName"
%>

<div data-controller="wdk.dataRestriction.restrictionController" data-record-class="${recordClassName}" style="flex:1">
  <wdk:stepAnalysisTile
    analysis="${analysis}"
    recordClassName="${recordClassName}"
  />
</div>
