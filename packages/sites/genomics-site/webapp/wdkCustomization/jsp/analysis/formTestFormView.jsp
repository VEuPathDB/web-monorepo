<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <style>
        .testFormInputGroup { margin:4px; border:1px solid #cccccc; border-radius:7px }
      </style>
      <div>
        <h3>Analysis Form Tester</h3>
        <p>
          <em>Below are examples of each input type we support.<br/>
          This form confirms that we can re-populate the values of each.</em>
        </p>
        <form>
          <div class="testFormInputGroup">
            <input type="checkbox" name="cbx1"/> Checkbox 1<br/>
            <input type="checkbox" name="cbx2"/> Checkbox 2<br/>
            <input type="checkbox" name="cbx3"/> Checkbox 3<br/>
          </div>
          <div class="testFormInputGroup">
            <input type="radio" name="rad1"/> Radio 1<br/>
            <input type="radio" name="rad2"/> Radio 2<br/>
            <input type="radio" name="rad3"/> Radio 3<br/>
          </div>
          <div class="testFormInputGroup">
            Hidden: <input type="hidden" name="hdn1"/><br/>
            Text: <input type="text" name="txt1"/><br/>
            Password: <input type="password" name="pwd1"/><br/>
            Textarea: <textarea name="texta1" rows="4" cols="20"/><br/>
          </div>
          <div class="testFormInputGroup">
            Select 1 (single):
            <select name="sel1" size="1">
              <option value="val1">Value 1</option>
              <option value="val2">Value 2</option>
              <option value="val3">Value 3</option>
            </select><br/>
            Select 2 (single):
            <select name="sel2" size="1">
              <option value="val1">Value 1</option>
              <option value="val2">Value 2</option>
              <option value="val3">Value 3</option>
            </select><br/>
            Select 3 (multiple):
            <select name="sel3" size="5" multiple="multiple">
              <option value="val1">Value 1</option>
              <option value="val2">Value 2</option>
              <option value="val3">Value 3</option>
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
