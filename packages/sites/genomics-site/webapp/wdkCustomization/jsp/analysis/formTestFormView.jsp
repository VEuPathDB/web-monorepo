<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <style>
        .testFormInputGroup { margin:4px; border:1px solid #cccccc; border-radius:7px; padding:5px; display:inline-block; }
      </style>
      <div style="text-align:center">
        <h3 style="text-align:center">Analysis Form Tester</h3>
        <p>
          <em>Below are examples of each input type we support.<br/>
          This form confirms that we can re-populate the values of each.</em>
        </p>
        <form>
          <div class="testFormInputGroup">
            <input type="checkbox" name="checkbox1"/> Checkbox 1<br/>
            <input type="checkbox" name="checkbox2"/> Checkbox 2<br/>
            <input type="checkbox" name="checkbox3"/> Checkbox 3<br/>
          </div>
          <div class="testFormInputGroup">
            <c:forEach var="option" items="${viewModel.selectOptions}">
              <input type="checkbox" name="checkbox4" value="${option.value}"/> Checkbox 4, ${option.name}<br/>
            </c:forEach>
          </div>
          <div class="testFormInputGroup">
            <c:forEach var="option" items="${viewModel.selectOptions}">
              <input type="radio" name="radio1" value="${option.value}"/> Radio 1, ${option.name}<br/>
            </c:forEach>
          </div>
          <div class="testFormInputGroup">
            Hidden 1: <input type="hidden" name="hidden1"/><br/>
            Text 1: <input type="text" name="text1"/><br/>
            Password 1: <input type="password" name="password1"/><br/>
            Textarea 1: <textarea name="textarea1" rows="4" cols="20"/><br/>
          </div>
          <div class="testFormInputGroup">
            Select 1 (single):
            <select name="sel1" size="1">
              <c:forEach var="option" items="${viewModel.selectOptions}">
                <option value="${option.value}">${option.name}</option>
              </c:forEach>
            </select><br/>
            Select 2 (single):
            <select name="sel2" size="5">
              <c:forEach var="option" items="${viewModel.selectOptions}">
                <option value="${option.value}">${option.name}</option>
              </c:forEach>
            </select><br/>
            Select 3 (multiple):
            <select name="sel3" size="5" multiple="multiple">
              <c:forEach var="option" items="${viewModel.selectOptions}">
                <option value="${option.value}">${option.name}</option>
              </c:forEach>
            </select><br/>
          </div>
          <div class="testFormInputGroup">
            <input type="submit" value="Submit"/>
          </div>
        </form>
      </div>
    </body>
  </html>
</jsp:root>
