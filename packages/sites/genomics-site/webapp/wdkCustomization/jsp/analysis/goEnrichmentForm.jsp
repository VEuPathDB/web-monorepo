<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <div style="text-align:center">
        <style>
          .go-form-table td {
            text-align: left;
            vertical-align: top;
          }
          .go-form-table span {
            display: inline-block;
            margin-top: 4px;
          }
        </style>
        <form>
          <table class="go-form-table" style="margin:0px auto">
            <tr>
              <td><span>P-Value Cutoff <span style="color:blue;font-size:0.95em;font-family:monospace">(0.0, 1.0]</span></span></td>
              <td><input type="text" name="pValueCutoff" size="10"/></td>
            </tr>
            <tr>
              <td><span>GO Associations Sources</span></td>
              <td>
                <c:forEach var="item" items="${viewModel.sourceOptions}">
                  <input type="checkbox" name="goAssociationsSources" value="${item}"/> ${item}<br/>
                </c:forEach>
              </td>
            </tr>
            <tr>
              <td><span>GO Ontology Sources</span></td>
              <td>
                <c:forEach var="item" items="${viewModel.ontologyOptions}">
                  <input type="checkbox" name="goAssociationsOntologies" value="${item}"/> ${item}<br/>
                </c:forEach>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="text-align:center">
                <input type="submit" value="Submit"/>
              </td>
            </tr>
          </table>
        </form>
      </div>
    </body>
  </html>
</jsp:root>
