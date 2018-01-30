<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<div
  data-restriction-type="search"
  data-record-class="${requestScope.wdkQuestion.recordClass.fullName}"
  data-controller="wdk.dataRestriction.restrictionController">
  <wdk:questionForm />
</div>
