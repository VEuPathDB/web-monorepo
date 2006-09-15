<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<site:header title="PlasmoDB : Search patterns"
                 banner="How to construct a search pattern"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
                 division="queries"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

  <tr>
    <td>
      <div class="small">
        <!-- content-->

<p>The following is a simple explanation of regular
expressions.</p>
<p>Perl regular expressions are strings which are used for pattern matching, e.g. 'aadgt', 'aa+dgt', 'a|d|c', '[mac]a'. <br>
This allows to find patterns in all kind of text strings and therefore Perl is very useful to the molecular biologist, since nucleotide and amino acid sequences are "nothing else" than text.
<p>Perl has special characters which can be used to match a
greater number of strings. The following is a description of some
these characters and examples of how they are used.
Even if these regular expressions might seems complicated at first sight, they prove to be very useful and easy to understand after having gone through some examples.

<p><font size=+1><b>Special Characters</b></font>

<table BORDER COLS=2 WIDTH="640">
<tr>
<td WIDTH="50" bgcolor=FAFA00>+</td>
<td>Matches "one or more of the preceding characters".</td>
</tr>

<tr>
<td WIDTH="50" bgcolor=FAFA00>*</td>
<td>Matches "any number of occurrences of the preceding character", including
0.</td>
</tr>

<tr>
<td WIDTH="50" bgcolor=FAFA00>?</td>
<td>Matches "zero or one occurrences of the preceding character".</td>
</tr>

<tr>
<td WIDTH="50" bgcolor=FAFA00>[ ]</td>
<td>Matches any character contained in the brackets.</td>
</tr>

<tr>
<td WIDTH="50" bgcolor=FAFA00>[^ ]</td>
<td>Match any character <i>except</i> those in the brackets.</td>
</tr>

</table>

<p>Here are some examples of searches.
<p><i>ad+f</i> (1 or more occurences of 'd') would match any of the following:
<br>adf
<br>addf
<br>adddf
<br>addddddf
<br>etc..
<p><i>ad*f</i> (0 or more occurences of 'd') would match:
<br>af
<br>adf
<br>addf
<br>adddf
<br>etc...
<p><i>ad?f</i> (0 or 1 occurence of 'd') would match:
<br>af
<br>adf
<p><i>a[yst]c</i> would match:
<br>atc
<br>asc
<br>ayc
<p><font size=+1><B>Pattern Anchors</B></font>

<table BORDER COLS=2 WIDTH="100%" >
<tr>
<td WIDTH="50" bgcolor=FAFA00>^</td>

<td>Match only at the beginning of the string.</td>
</tr>

<tr>
<td WIDTH="50" bgcolor=FAFA00>$</td>

<td>Match only at the end of the string.</td>
</tr>
</table>

<p>Here are examples of expressions using pattern anchors.
<p><i>^mdef</i> (e.g. a protein sequence <b>starting with</b> 'MDEF') would match:
<br>mdef
<br>mdefab
<br>mdefaredfadfk
<br><font color=FF0000>but not match :</font>
<br>edefa
<br>eeeedef
<br>defaredfadfk
<p><i>kdel$</i> (searches for proteins <b>ending with</b> 'KDEL', a standard ER retention signal) would match:
<br>eeeekdel
<br>kdel
<br><font color=FF0000>but not match :</font>
<br>edefkdell
<br>akdeleefg
      </div>
    </td>
  </tr>

</table>

<site:footer/>
