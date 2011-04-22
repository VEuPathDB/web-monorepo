<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<site:question/>

<div id="span-composition-template" style="display:none;">
  <p>The form above can help you to create one or more genomic segment ids.
     Please choose the chromosome from the list or enter a genomic sequence id, 
     decide the start and end of the segment you are interested, then click 
     "Compose Segment ID" button below to create a segment id, and add it into
     the seach list.</p>
  <br />
  <div>the length of each genomic segment is limited to 100Kbps, and the end
     location cannot be smaller than start.</div>
  <br />
  <div style="text-align:center">
    <input id="compose" type="button" name="compose" value="Compose Segment ID" />
  </div>
  <hr />
  <br />
  <div>Or, you can enter a comma-separated list of genomic segment ids directly in the box below.
     The format of a segment id is: <font color="blue"><b>sequence_id:start-end:strand</b></font>.
     Here are some examples: TGME49_chrIa:10000-10500:f, Pf3D7_04:100-200:r</div>
  <br />
</div>
