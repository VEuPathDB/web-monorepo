<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<imp:pageFrame title="${wdkModel.displayName} : Search patterns"
                 banner="How to construct a search pattern"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
                 division="queries">


<style type="text/css">
.regex {
	font-size: 120%;
	font-weight:bold;
	font-style:italic;
}
</style>

<!-- content-->

<h2>The following is a simple explanation of regular expressions.</h2>

Perl regular expressions are terms used for pattern matching in text strings, e.g. <span class="regex">'aadgt', 'aa+dgt', 'a|d|c', '[mac]a'. </span>
<br>
Because nucleotide and amino acid sequences are text strings, regular expressions are very useful for finding motifs within sequences. 
<br>
Motifs often include repetitive or ambiguous assignments at some locations. The rules and special characters used in regular expressions
 help define the full set of strings that match the motif pattern.  
<br>
The following is a description of some of these characters and examples of how they are used.
<br>
Although regular expressions seem complicated at first, they are very useful and easy to understand after going through some examples.
<br><br>

<div class="h3left">Special Characters</div>

<table BORDER COLS=2 WIDTH="640">

<tr>
<td WIDTH="50" class="regex">.</td>
<td>Match any character.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">+</td>
<td>Matches "one or more of the preceding characters".</td>
</tr>

<tr>
<td WIDTH="50" class="regex">*</td>
<td>Matches "any number of occurrences of the preceding character", including
0.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">?</td>
<td>Matches "zero or one occurrences of the preceding character".</td>
</tr>

<tr>
<td WIDTH="50" class="regex">[ ]</td>
<td>Matches any character contained in the brackets.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">[^ ]</td>
<td>Match any character <i>except</i> those in the brackets.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">{n}</td>
<td>Matches when the preceding character, or character range, occurs exactly n times.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">{n,}</td>
<td>Matches when the preceding character occurs at least n times.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">{n,m}</td>
<td>Matches when the preceding character occurs at least n times, but no more than m times.</td>
</tr>


</table>

<br><br>

<div class="h3left">Here are some examples of searches.</div>

<span class="regex">ad+f</span> (1 or more occurences of 'd') would match any of the following:
<br>adf
<br>addf
<br>adddf
<br>addddddf
<br>...
<br><br>

<span class="regex">ad*f</span> (0 or more occurences of 'd') would match:
<br>af
<br>adf
<br>addf
<br>adddf
<br>...
<br><br>

<span class="regex">ad?f</span> (0 or 1 occurence of 'd') would match:
<br>af
<br>adf

<br><br>

<span class="regex">a[yst]c</span> would match:
<br>atc
<br>asc
<br>ayc
<br>
<br><br>


<div class="h3left">Specify the number of occurrences of a residue.</div>

<span class="regex">P{1,5}</span>  would match P from 1 to 5 times.
<br><br>
<span class="regex">.{1,30}</span> would match any amino acid 1 to 30 times so you could find a motif within 30 amino acids of something like the beginning.

<br>
<br><br>
<div class="h3left">Pattern Anchors</div>

<table BORDER COLS=2 WIDTH="100%" >
<tr>
<td WIDTH="50" class="regex">^</td>

<td>Match only at the beginning of the string.</td>
</tr>

<tr>
<td WIDTH="50" class="regex">$</td>

<td>Match only at the end of the string.</td>
</tr>
</table>


<br><br>
<div class="h3left">Here are examples of expressions using pattern anchors.</div>

<span class="regex">^mdef</span> (e.g. a protein sequence <b>starting with</b> 'mdef') would match:
<ul class="cirbulletlist">
<li>mdef
<li>mdefab
<li>mdefaredfadfk
</ul>
<font color=FF0000>but not match :</font>
<ul class="cirbulletlist">
<li>edefa
<li>eeeedef
<li>defaredfadfk
</ul>

<br><br>

<span class="regex">kdel$</span> (searches for proteins <b>ending with</b> 'kdel', a standard ER retention signal) would match:
<ul class="cirbulletlist">
<li>eeeekdel
<li>kdel
</ul>
<font color=FF0000>but not match :</font>
<ul class="cirbulletlist">
<li>edefkdell
<li>akdeleefg
</ul>   



</imp:pageFrame>
