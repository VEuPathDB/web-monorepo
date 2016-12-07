<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<c:set var="partial" value="${requestScope.partial}" />
<c:set var="showParams" value="${requestScope.showParams}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>

<!-- show error messages, if any -->
<div class='usererror'><api:errors/></div>

<div><b>Description:</b>  Shown below is a table of identified RFLP Genotypes (Chunlei Su).  Use the check boxes on the left to search for associated isolates.  Click <a href="/Standards_gel_pics.pdf">here</a> for RFLP images in PDF format.</div>
<br/>

<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}" />

<div class="params">
<c:if test="${showParams == null || showParams}">   <%-- still in use? --%>

<%-- this js has to be included here in order to appear in the step form --%>
<script type="text/javascript" src='<c:url value="/assets/js/wdkQuestion.js"/>'></script> 
<script src="js/lib/jquery.autocomplete.js" type="text/javascript"></script> 

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders>
<tr><td><td></td><td></td><td>5'+3'</td><td>alternative</td></tr>
<tr><th><th>Genotype#</th><th>SAG1</th><th> SAG2</th><th>SAG2</th><th>SAG3</th><th>BTUB</th><th>GRA6</th><th>c22-8</th><th>c29-2</th><th>L358</th><th>PK1</th><th>Apico</th></tr>

<tr><td><input type="checkbox" name="array(genotype)" value="1" id="genotype"></td><td>1</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="2" id="genotype"></td><td>2</td><td>II or III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="3" id="genotype"></td><td>3</td><td>II or III</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="4" id="genotype"></td><td>4</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="5" id="genotype"></td><td>5</td><td>u-1</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="6" id="genotype"></td><td>6</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="7" id="genotype"></td><td>7</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="8" id="genotype"></td><td>8</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="9" id="genotype"></td><td>9</td><td>u-1</td><td>II</td><td>II</td><td>III</td><td>III</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="10" id="genotype"></td><td>10</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="11" id="genotype"></td><td>11</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="12" id="genotype"></td><td>12</td><td>I</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="13" id="genotype"></td><td>13</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="14" id="genotype"></td><td>14</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="15" id="genotype"></td><td>15</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="16" id="genotype"></td><td>16</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="17" id="genotype"></td><td>17</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="18" id="genotype"></td><td>18</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="19" id="genotype"></td><td>19</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="20" id="genotype"></td><td>20</td><td>u-1</td><td>II</td><td>II</td><td>III</td><td>III</td><td>II</td><td>II</td><td>III</td><td>II</td><td>u-2</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="21" id="genotype"></td><td>21</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="22" id="genotype"></td><td>22</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="23" id="genotype"></td><td>23</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="24" id="genotype"></td><td>24</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="25" id="genotype"></td><td>25</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="26" id="genotype"></td><td>26</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="27" id="genotype"></td><td>27</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="28" id="genotype"></td><td>28</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="29" id="genotype"></td><td>29</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="30" id="genotype"></td><td>30</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="31" id="genotype"></td><td>31</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="32" id="genotype"></td><td>32</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="33" id="genotype"></td><td>33</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="34" id="genotype"></td><td>34</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="35" id="genotype"></td><td>35</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="36" id="genotype"></td><td>36</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="37" id="genotype"></td><td>37</td><td>I</td><td>II</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="38" id="genotype"></td><td>38</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="39" id="genotype"></td><td>39</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td><td>II</td><td>II</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="40" id="genotype"></td><td>40</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="41" id="genotype"></td><td>41</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="42" id="genotype"></td><td>42</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="43" id="genotype"></td><td>43</td><td>I</td><td>I</td><td>II</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="44" id="genotype"></td><td>44</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>u-3</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="45" id="genotype"></td><td>45</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>II</td><td>II</td><td>III</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="46" id="genotype"></td><td>46</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="47" id="genotype"></td><td>47</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="48" id="genotype"></td><td>48</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="49" id="genotype"></td><td>49</td><td>II</td><td>II</td><td>II</td><td>I</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="50" id="genotype"></td><td>50</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="51" id="genotype"></td><td>51</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="52" id="genotype"></td><td>52</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>u-2</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="53" id="genotype"></td><td>53</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="54" id="genotype"></td><td>54</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="55" id="genotype"></td><td>55</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>u-1</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="56" id="genotype"></td><td>56</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>u-1</td><td>I</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="57" id="genotype"></td><td>57</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>u-1</td><td>I</td><td>III</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="58" id="genotype"></td><td>58</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>III</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="59" id="genotype"></td><td>59</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="60" id="genotype"></td><td>60</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="61" id="genotype"></td><td>61</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>III</td><td>I</td><td>u-2</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="62" id="genotype"></td><td>62</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="63" id="genotype"></td><td>63</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="64" id="genotype"></td><td>64</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>u-2</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="65" id="genotype"></td><td>65</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="66" id="genotype"></td><td>66</td><td>I</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>u-1</td><td>I</td><td>u-2</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="67" id="genotype"></td><td>67</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>u-1</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="68" id="genotype"></td><td>68</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="69" id="genotype"></td><td>69</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="70" id="genotype"></td><td>70</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="71" id="genotype"></td><td>71</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="72" id="genotype"></td><td>72</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>u-2</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="73" id="genotype"></td><td>73</td><td>II</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="74" id="genotype"></td><td>74</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="75" id="genotype"></td><td>75</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="76" id="genotype"></td><td>76</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="77" id="genotype"></td><td>77</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="78" id="genotype"></td><td>78</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="79" id="genotype"></td><td>79</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="80" id="genotype"></td><td>80</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="81" id="genotype"></td><td>81</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="82" id="genotype"></td><td>82</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="83" id="genotype"></td><td>83</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="84" id="genotype"></td><td>84</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="85" id="genotype"></td><td>85</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="86" id="genotype"></td><td>86</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="87" id="genotype"></td><td>87</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="88" id="genotype"></td><td>88</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="89" id="genotype"></td><td>89</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="90" id="genotype"></td><td>90</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="91" id="genotype"></td><td>91</td><td>I</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="92" id="genotype"></td><td>92</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>II</td><td>II</td><td>I</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="93" id="genotype"></td><td>93</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="94" id="genotype"></td><td>94</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="95" id="genotype"></td><td>95</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="96" id="genotype"></td><td>96</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>II</td><td>III</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="97" id="genotype"></td><td>97</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>II</td><td>III</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="98" id="genotype"></td><td>98</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="99" id="genotype"></td><td>99</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="100" id="genotype"></td><td>100</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="101" id="genotype"></td><td>101</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>u-2</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="102" id="genotype"></td><td>102</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>III</td><td>u-1</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="104" id="genotype"></td><td>104</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="105" id="genotype"></td><td>105</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="106" id="genotype"></td><td>106</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="107" id="genotype"></td><td>107</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="108" id="genotype"></td><td>108</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="109" id="genotype"></td><td>109</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="110" id="genotype"></td><td>110</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>III</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="111" id="genotype"></td><td>111</td><td>I</td><td>I</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="112" id="genotype"></td><td>112</td><td>I</td><td>II</td><td>II</td><td>I</td><td>I</td><td>I</td><td>III</td><td>II</td><td>III</td><td>I</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="113" id="genotype"></td><td>113</td><td>I</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>nd</td><td>III</td><td>II</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="114" id="genotype"></td><td>114</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="115" id="genotype"></td><td>115</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="116" id="genotype"></td><td>116</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="117" id="genotype"></td><td>117</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>u-1</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="118" id="genotype"></td><td>118</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>III</td><td>I</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="119" id="genotype"></td><td>119</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="120" id="genotype"></td><td>120</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="121" id="genotype"></td><td>121</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="122" id="genotype"></td><td>122</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="123" id="genotype"></td><td>123</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="124" id="genotype"></td><td>124</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="125" id="genotype"></td><td>125</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>u-2</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="126" id="genotype"></td><td>126</td><td>I</td><td>nd</td><td>I</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="127" id="genotype"></td><td>127</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="128" id="genotype"></td><td>128</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="129" id="genotype"></td><td>129</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="130" id="genotype"></td><td>130</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="131" id="genotype"></td><td>131</td><td>II</td><td>III</td><td>III</td><td>II</td><td>II</td><td>I</td><td>III</td><td>III</td><td>II</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="132" id="genotype"></td><td>132</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="133" id="genotype"></td><td>133</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="134" id="genotype"></td><td>134</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="135" id="genotype"></td><td>135</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="136" id="genotype"></td><td>136</td><td>u-1</td><td>I</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="137" id="genotype"></td><td>137</td><td>u-1</td><td>II</td><td>II</td><td>III</td><td>III</td><td>II</td><td>II</td><td>III</td><td>II</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="138" id="genotype"></td><td>138</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="139" id="genotype"></td><td>139</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>III</td><td>II</td><td>II</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="140" id="genotype"></td><td>140</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="141" id="genotype"></td><td>141</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="142" id="genotype"></td><td>142</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="143" id="genotype"></td><td>143</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="144" id="genotype"></td><td>144</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>III</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="145" id="genotype"></td><td>145</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="146" id="genotype"></td><td>146</td><td>I</td><td>I</td><td>I</td><td>III</td><td>II</td><td>II</td><td>I</td><td>III</td><td>III</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="147" id="genotype"></td><td>147</td><td>I</td><td>I</td><td>II</td><td>I</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="148" id="genotype"></td><td>148</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="149" id="genotype"></td><td>149</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="150" id="genotype"></td><td>150</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>III</td><td>I</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="152" id="genotype"></td><td>152</td><td>I</td><td>I</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="153" id="genotype"></td><td>153</td><td>I</td><td>II</td><td>I</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="154" id="genotype"></td><td>154</td><td>I</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>u-1</td><td>III</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="155" id="genotype"></td><td>155</td><td>I</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>I</td><td>nd</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="156" id="genotype"></td><td>156</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="157" id="genotype"></td><td>157</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="158" id="genotype"></td><td>158</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="159" id="genotype"></td><td>159</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="160" id="genotype"></td><td>160</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>u-1</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="161" id="genotype"></td><td>161</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="162" id="genotype"></td><td>162</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="163" id="genotype"></td><td>163</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="164" id="genotype"></td><td>164</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="165" id="genotype"></td><td>165</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="166" id="genotype"></td><td>166</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>u-1</td><td>I</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="167" id="genotype"></td><td>167</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="168" id="genotype"></td><td>168</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="169" id="genotype"></td><td>169</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>II</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="170" id="genotype"></td><td>170</td><td>II</td><td>III</td><td>III</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="171" id="genotype"></td><td>171</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>III</td><td>I</td><td>u-1</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="172" id="genotype"></td><td>172</td><td>u-1</td><td>I</td><td>II</td><td>I</td><td>III</td><td>II</td><td>u-1</td><td>III</td><td>III</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="173" id="genotype"></td><td>173</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="174" id="genotype"></td><td>174</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>u-1</td><td>III</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="175" id="genotype"></td><td>175</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>u-1</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="176" id="genotype"></td><td>176</td><td>u-1</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="177" id="genotype"></td><td>177</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="178" id="genotype"></td><td>178</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td><td>II</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="179" id="genotype"></td><td>179</td><td>I</td><td>I</td><td>II</td><td>III</td><td>I</td><td>III</td><td>I</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="180" id="genotype"></td><td>180</td><td>I</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>I</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="185" id="genotype"></td><td>185</td><td>II</td><td>II</td><td>II</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>u-2</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="186" id="genotype"></td><td>186</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="187" id="genotype"></td><td>187</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="188" id="genotype"></td><td>188</td><td>II</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="189" id="genotype"></td><td>189</td><td>u-1</td><td>I</td><td>II</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="190" id="genotype"></td><td>190</td><td>I</td><td>III</td><td>III</td><td>III</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="191" id="genotype"></td><td>191</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>I</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="197" id="genotype"></td><td>197</td><td>I</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>II</td><td>I</td><td>II</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="202" id="genotype"></td><td>202</td><td>u-1</td><td>I</td><td>II</td><td>III</td><td>III</td><td>II</td><td>III</td><td>I</td><td>I</td><td>III</td><td>I</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="203" id="genotype"></td><td>203</td><td>I</td><td>I</td><td>I</td><td>III</td><td>I</td><td>II</td><td>II</td><td>III</td><td>III</td><td>I</td><td>III</td></tr>
<tr><td><input type="checkbox" name="array(genotype)" value="231" id="genotype"></td><td>231</td><td>I</td><td>III</td><td>III</td><td>III</td><td>II</td><td>III</td><td>II</td><td>II</td><td>II</td><td>III</td><td>II</td></tr>

</table> 

</c:if>
</div><%-- END OF PARAMS DIV --%>

<div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>

<hr>

<div><b>Data Sets used by this search</b></div>
<div>
  <ul> 
  <li><a href="app/record/dataset/DS_5dfd0d0bb2"><i>T. gondii</i> RFLP genotypes (Chunlei Su lab)</a> </li> 
  </ul> 
</div> 

