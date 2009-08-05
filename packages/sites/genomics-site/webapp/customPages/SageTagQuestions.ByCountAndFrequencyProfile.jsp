<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${sessionScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<!-- display page header with wdkQuestion displayName as banner -->
<site:header banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}" />

<!-- display description for wdkQuestion -->
<p><b><jsp:getProperty name="wdkQuestion" property="description"/></b></p>

<hr>

<!-- show all params of question, collect help info along the way -->
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<!-- put an anchor here for linking back from help sections -->
<A name="${fromAnchorQ}"></A>
<html:form method="get" action="/processQuestion.do">
<table class="custom-slider">

<!-- show error messages, if any -->
<wdk:errors/>

<!-- params listed out explicitly -->
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'sp'</b></td>
      <td>
        <div class="slider" id="myProp(sp_min)" tabIndex="1">
          <input class="slider-input" id="myProp(sp_min)-slider-input">
        </div></td>
      <td><input id="myProp(sp_min)-input" maxlength="3" tabIndex="2" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_sp_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'sp'</b></td>
      <td>
        <div class="slider" id="myProp(sp_max)" tabIndex="3">
          <input class="slider-input" id="myProp(sp_max)-slider-input">
        </div></td>
      <td><input id="myProp(sp_max)-input" maxlength="3" tabIndex="4" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_sp_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'd4'</b></td>
      <td>
        <div class="slider" id="myProp(d4_min)" tabIndex="5">
          <input class="slider-input" id="myProp(d4_min)-slider-input">
        </div></td>
      <td><input id="myProp(d4_min)-input" maxlength="3" tabIndex="6" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d4_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'd4'</b></td>
      <td>
        <div class="slider" id="myProp(d4_max)" tabIndex="7">
          <input class="slider-input" id="myProp(d4_max)-slider-input">
        </div></td>
      <td><input id="myProp(d4_max)-input" maxlength="3" tabIndex="8" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d4_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'd6'</b></td>
      <td
        <div class="slider" id="myProp(d6_min)" tabIndex="9">
          <input class="slider-input" id="myProp(d6_min)-slider-input">
        </div></td>
      <td><input id="myProp(d6_min)-input" maxlength="3" tabIndex="10" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d6_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'd6'</b></td>
      <td>
        <div class="slider" id="myProp(d6_max)" tabIndex="11">
          <input class="slider-input" id="myProp(d6_max)-slider-input">
        </div></td>
      <td><input id="myProp(d6_max)-input" maxlength="3" tabIndex="12" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d6_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'd7'</b></td>
      <td>
        <div class="slider" id="myProp(d7_min)" tabIndex="13">
          <input class="slider-input" id="myProp(d7_min)-slider-input">
        </div></td>
      <td><input id="myProp(d7_min)-input" maxlength="3" tabIndex="14" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d7_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'd7'</b></td>
      <td>
        <div class="slider" id="myProp(d7_max)" tabIndex="15">
          <input class="slider-input" id="myProp(d7_max)-slider-input">
        </div></td>
      <td><input id="myProp(d7_max)-input" maxlength="3" tabIndex="16" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d7_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'd17'</b></td>
      <td>
        <div class="slider" id="myProp(d17_min)" tabIndex="17">
          <input class="slider-input" id="myProp(d17_min)-slider-input">
        </div></td>
      <td><input id="myProp(d17_min)-input" maxlength="3" tabIndex="18" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d17_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'd17'</b></td>
      <td>
         <div class="slider" id="myProp(d17_max)" tabIndex="19">
          <input class="slider-input" id="myProp(d17_max)-slider-input">
        </div></td>
      <td><input id="myProp(d17_max)-input" maxlength="3" tabIndex="20" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d17_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'ph'</b></td>
      <td>
        <div class="slider" id="myProp(ph_min)" tabIndex="21">
          <input class="slider-input" id="myProp(ph_min)-slider-input">
        </div></td>
      <td><input id="myProp(ph_min)-input" maxlength="3" tabIndex="22" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_ph_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'ph'</b></td>
      <td>
         <div class="slider" id="myProp(ph_max)" tabIndex="23">
          <input class="slider-input" id="myProp(ph_max)-slider-input">
        </div></td>
      <td><input id="myProp(ph_max)-input" maxlength="3" tabIndex="24" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_ph_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'msj'</b></td>
      <td>
        <div class="slider" id="myProp(msj_min)" tabIndex="25">
          <input class="slider-input" id="myProp(msj_min)-slider-input">
        </div></td>
      <td><input id="myProp(msj_min)-input" maxlength="3" tabIndex="26" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_msj_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'msj'</b></td>
      <td>
         <div class="slider" id="myProp(msj_max)" tabIndex="27">
          <input class="slider-input" id="myProp(msj_max)-slider-input">
        </div></td>
      <td><input id="myProp(msj_max)-input" maxlength="3" tabIndex="28" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_msj_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'rh'</b></td>
      <td>
        <div class="slider" id="myProp(rh_min)" tabIndex="29">
          <input class="slider-input" id="myProp(rh_min)-slider-input">
        </div></td>
      <td><input id="myProp(rh_min)-input" maxlength="3" tabIndex="30" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_rh_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'rh'</b></td>
      <td>
         <div class="slider" id="myProp(rh_max)" tabIndex="31">
          <input class="slider-input" id="myProp(rh_max)-slider-input">
        </div></td>
      <td><input id="myProp(rh_max)-input" maxlength="3" tabIndex="32" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_rh_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>
  
  <tr><td align="right" width="35%"><b>mininum SAGE tag frequency in assay 'b7'</b></td>
      <td>
        <div class="slider" id="myProp(b7_min)" tabIndex="33">
          <input class="slider-input" id="myProp(b7_min)-slider-input">
        </div></td>
      <td><input id="myProp(b7_min)-input" maxlength="3" tabIndex="34" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_b7_min">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>maximum SAGE tag frequency in assay 'b7'</b></td>
      <td>
         <div class="slider" id="myProp(b7_max)" tabIndex="35">
          <input class="slider-input" id="myProp(b7_max)-slider-input">
        </div></td>
      <td><input id="myProp(b7_max)-input" maxlength="3" tabIndex="36" /></td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_b7_max">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

  <tr><td align="right" width="35%"><b>SAGE Tag loci count</b></td>
      <td>
        <input type="text" name="myProp(loci_count)" value="1">
      </td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <a href="#HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_loci_count">
          <img src='/toxodb-dev/images/toHelp.jpg' border="0" alt="Help!"></a>
      </td>
  </tr>

</table>

<table align="center">
  <tr><td>
        <input type="submit" name="questionSubmit" value="Get Answer">
        <input type="submit" name="questionSubmit" value="Expand Question"></td></tr>
</table>
</html:form>

<script type="text/javascript">
//sp_
var sp_min = new Slider(document.getElementById('myProp(sp_min)'),  document.getElementById('myProp(sp_min)-slider-input'));
sp_min.setMaximum(999);
var sp_max = new Slider(document.getElementById('myProp(sp_max)'),  document.getElementById('myProp(sp_max)-slider-input'));
sp_max.setMaximum(999);

var sp_min_in = document.getElementById('myProp(sp_min)-input');
sp_min_in.onchange = function () {
        sp_min.setValue(parseInt(this.value));
};
var sp_max_in = document.getElementById('myProp(sp_max)-input');
sp_max_in.onchange = function () {
        sp_max.setValue(parseInt(this.value));
};

sp_min.onchange = sp_max.onchange = function () {
  sp_min_in.value = sp_min.getValue();
  sp_max_in.value = sp_max.getValue();
}

sp_min.setValue(0);
sp_max.setValue(999);

//d4_
var d4_min = new Slider(document.getElementById('myProp(d4_min)'),  document.getElementById('myProp(d4_min)-slider-input'));
d4_min.setMaximum(999);
var d4_max = new Slider(document.getElementById('myProp(d4_max)'),  document.getElementById('myProp(d4_max)-slider-input'));
d4_max.setMaximum(999);

var d4_min_in = document.getElementById('myProp(d4_min)-input');
d4_min_in.onchange = function () {
        d4_min.setValue(parseInt(this.value));
};
var d4_max_in = document.getElementById('myProp(d4_max)-input');
d4_max_in.onchange = function () {
        d4_max.setValue(parseInt(this.value));
};

d4_min.onchange = d4_max.onchange = function () {
  d4_min_in.value = d4_min.getValue();
  d4_max_in.value = d4_max.getValue();
}

d4_min.setValue(0);
d4_max.setValue(999);

//d6_
var d6_min = new Slider(document.getElementById('myProp(d6_min)'),  document.getElementById('myProp(d6_min)-slider-input'));
d6_min.setMaximum(999);
var d6_max = new Slider(document.getElementById('myProp(d6_max)'),  document.getElementById('myProp(d6_max)-slider-input'));
d6_max.setMaximum(999);

var d6_min_in = document.getElementById('myProp(d6_min)-input');
d6_min_in.onchange = function () {
        d6_min.setValue(parseInt(this.value));
};
var d6_max_in = document.getElementById('myProp(d6_max)-input');
d6_max_in.onchange = function () {
        d6_max.setValue(parseInt(this.value));
};

d6_min.onchange = d6_max.onchange = function () {
  d6_min_in.value = d6_min.getValue();
  d6_max_in.value = d6_max.getValue();
}

d6_min.setValue(0);
d6_max.setValue(999);

//d7_
var d7_min = new Slider(document.getElementById('myProp(d7_min)'),  document.getElementById('myProp(d7_min)-slider-input'));
d7_min.setMaximum(999);
var d7_max = new Slider(document.getElementById('myProp(d7_max)'),  document.getElementById('myProp(d7_max)-slider-input'));
d7_max.setMaximum(999);

var d7_min_in = document.getElementById('myProp(d7_min)-input');
d7_min_in.onchange = function () {
        d7_min.setValue(parseInt(this.value));
};
var d7_max_in = document.getElementById('myProp(d7_max)-input');
d7_max_in.onchange = function () {
        d7_max.setValue(parseInt(this.value));
};

d7_min.onchange = d7_max.onchange = function () {
  d7_min_in.value = d7_min.getValue();
  d7_max_in.value = d7_max.getValue();
}

d7_min.setValue(0);
d7_max.setValue(999);

//d17_
var d17_min = new Slider(document.getElementById('myProp(d17_min)'),  document.getElementById('myProp(d17_min)-slider-input'));
d17_min.setMaximum(999);
var d17_max = new Slider(document.getElementById('myProp(d17_max)'),  document.getElementById('myProp(d17_max)-slider-input'));
d17_max.setMaximum(999);

var d17_min_in = document.getElementById('myProp(d17_min)-input');
d17_min_in.onchange = function () {
        d17_min.setValue(parseInt(this.value));
};
var d17_max_in = document.getElementById('myProp(d17_max)-input');
d17_max_in.onchange = function () {
        d17_max.setValue(parseInt(this.value));
};

d17_min.onchange = d17_max.onchange = function () {
  d17_min_in.value = d17_min.getValue();
  d17_max_in.value = d17_max.getValue();
}

d17_min.setValue(0);
d17_max.setValue(999);

//ph_
var ph_min = new Slider(document.getElementById('myProp(ph_min)'),  document.getElementById('myProp(ph_min)-slider-input'));
ph_min.setMaximum(999);
var ph_max = new Slider(document.getElementById('myProp(ph_max)'),  document.getElementById('myProp(ph_max)-slider-input'));
ph_max.setMaximum(999);

var ph_min_in = document.getElementById('myProp(ph_min)-input');
ph_min_in.onchange = function () {
        ph_min.setValue(parseInt(this.value));
};
var ph_max_in = document.getElementById('myProp(ph_max)-input');
ph_max_in.onchange = function () {
        ph_max.setValue(parseInt(this.value));
};

ph_min.onchange = ph_max.onchange = function () {
  ph_min_in.value = ph_min.getValue();
  ph_max_in.value = ph_max.getValue();
}

ph_min.setValue(0);
ph_max.setValue(999);

//msj_
var msj_min = new Slider(document.getElementById('myProp(msj_min)'),  document.getElementById('myProp(msj_min)-slider-input'));
msj_min.setMaximum(999);
var msj_max = new Slider(document.getElementById('myProp(msj_max)'),  document.getElementById('myProp(msj_max)-slider-input'));
msj_max.setMaximum(999);

var msj_min_in = document.getElementById('myProp(msj_min)-input');
msj_min_in.onchange = function () {
        msj_min.setValue(parseInt(this.value));
};
var msj_max_in = document.getElementById('myProp(msj_max)-input');
msj_max_in.onchange = function () {
        msj_max.setValue(parseInt(this.value));
};

msj_min.onchange = msj_max.onchange = function () {
  msj_min_in.value = msj_min.getValue();
  msj_max_in.value = msj_max.getValue();
}

msj_min.setValue(0);
msj_max.setValue(999);

//rh_
var rh_min = new Slider(document.getElementById('myProp(rh_min)'),  document.getElementById('myProp(rh_min)-slider-input'));
rh_min.setMaximum(999);
var rh_max = new Slider(document.getElementById('myProp(rh_max)'),  document.getElementById('myProp(rh_max)-slider-input'));
rh_max.setMaximum(999);

var rh_min_in = document.getElementById('myProp(rh_min)-input');
rh_min_in.onchange = function () {
        rh_min.setValue(parseInt(this.value));
};
var rh_max_in = document.getElementById('myProp(rh_max)-input');
rh_max_in.onchange = function () {
        rh_max.setValue(parseInt(this.value));
};

rh_min.onchange = rh_max.onchange = function () {
  rh_min_in.value = rh_min.getValue();
  rh_max_in.value = rh_max.getValue();
}

rh_min.setValue(0);
rh_max.setValue(999);

//b7_
var b7_min = new Slider(document.getElementById('myProp(b7_min)'),  document.getElementById('myProp(b7_min)-slider-input'));
b7_min.setMaximum(999);
var b7_max = new Slider(document.getElementById('myProp(b7_max)'),  document.getElementById('myProp(b7_max)-slider-input'));
b7_max.setMaximum(999);

var b7_min_in = document.getElementById('myProp(b7_min)-input');
b7_min_in.onchange = function () {
        b7_min.setValue(parseInt(this.value));
};
var b7_max_in = document.getElementById('myProp(b7_max)-input');
b7_max_in.onchange = function () {
        b7_max.setValue(parseInt(this.value));
};

b7_min.onchange = b7_max.onchange = function () {
  b7_min_in.value = b7_min.getValue();
  b7_max_in.value = b7_max.getValue();
}

b7_min.setValue(0);
b7_max.setValue(999);

</script>

<hr>

<table width="640" align="center" cellspacing="0" cellpadding="0" border="0">
<tr><td>

<font class="footer">
This is a sample site demonstrating WebDevKit. The data may not
be accurate or complete. Please see <a href="http://www.allgenes.org">Allgenes</a> or 
<a href="http://www.genedb.org/">GeneDB</a> for full-fledged sites.
</font>



  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>

  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>

  <TABLE cellpadding="0" width="100%" border="0" cellspacing="2">
    <TR><TD bgcolor="#000000"><FONT size="+1" color="#ffffff">&nbsp;<B>Help</B></FONT></TD></TR>
    <TR><TD>&nbsp;</TD></TR>
  </TABLE>

  <TABLE width="100%" border="0">

  <!-- help for one form -->

  
    <TR><TD valign="middle" bgcolor="#e0e0e0" align="left">
          <FONT size="+0" color="#663333" face="helvetica,sans-serif">
          <B>Help for question: Find SAGE tags by loci count and profile of observed frequency</B></FONT></TD></TR>
    <TR><TD><TABLE width="100%">

            <!-- help for one param -->
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d4_max"></A>maximum SAGE tag frequency in assay 'd4'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">

                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_rh_max"></A>maximum SAGE tag frequency in assay 'rh'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>

            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d6_min"></A>mininum SAGE tag frequency in assay 'd6'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>

            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d7_max"></A>maximum SAGE tag frequency in assay 'd7'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_sp_min"></A>mininum SAGE tag frequency in assay 'sp'</B></TD>

                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d6_max"></A>maximum SAGE tag frequency in assay 'd6'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>

                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d7_min"></A>mininum SAGE tag frequency in assay 'd7'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>

            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_ph_min"></A>mininum SAGE tag frequency in assay 'ph'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_msj_max"></A>maximum SAGE tag frequency in assay 'msj'</B></TD>

                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d17_min"></A>mininum SAGE tag frequency in assay 'd17'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>

                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d17_max"></A>maximum SAGE tag frequency in assay 'd17'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>

            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_loci_count"></A>SAGE Tag loci count</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">SAGE Tag occurrence in the genome</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_sp_max"></A>maximum SAGE tag frequency in assay 'sp'</B></TD>

                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_d4_min"></A>mininum SAGE tag frequency in assay 'd4'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>

                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_ph_max"></A>maximum SAGE tag frequency in assay 'ph'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>

            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_msj_min"></A>mininum SAGE tag frequency in assay 'msj'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_b7_max"></A>maximum SAGE tag frequency in assay 'b7'</B></TD>

                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">maximum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_b7_min"></A>mininum SAGE tag frequency in assay 'b7'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>

                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>
            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            <TR><TD align="left"><B><A name="HELP_Help for question: Find SAGE tags by loci count and profile of observed frequency_rh_min"></A>mininum SAGE tag frequency in assay 'rh'</B></TD>
                <TD align="right"><A href="#Help for question: Find SAGE tags by loci count and profile of observed frequency">
                    <IMG src='/toxodb-dev/images/fromHelp.jpg' alt="Back To Form" border="0"></A>
                </TD></TR>
            <TR><TD colspan="2">minimum SAGE tag frequency required</TD></TR>

            <TR><TD colspan="2">&nbsp;</TD></TR>
            
            </TABLE>
        </TD></TR> 
  
  </TABLE>

<%-- get the attributions of the question --%>
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Query data sources" />

<%-- display the default attribution list --%>
<site:attributions attributions="${propertyLists['genomeAttribution']}" caption="Genome data sources" />

</td></tr></table>

</body></html>

