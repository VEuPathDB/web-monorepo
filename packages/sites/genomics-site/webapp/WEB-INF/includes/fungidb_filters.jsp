<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>

<!-- display basic filters -->
<table border="1">
  <tr>
    <th rowspan=2 align="center">All<br>Results</th>
    <th rowspan=2 align="center">Ortholog<br>Groups</th>
    <th colspan=6 align="center"><i>Oomycetes</i></th>
    <th colspan=1 align="center"><i>Chytridiomycetes</i></th>
    <th colspan=2 align="center"><i>Zygomycetes</i></th>
    <th colspan=2 align="center"><i>Agaricomycetes</i></th>
    <th colspan=6 align="center"><i>Tremellomycetes</i></th>
    <th colspan=1 align="center"><i>Pucciniomycetes</i></th>
    <th colspan=3 align="center"><i>Ustilaginomycetes</i></th>
    <th colspan=3 align="center"><i>Schizosaccharomycetes</i></th>
    <th colspan=15 align="center"><i>Eurotiomycetes</i></th>
    <th colspan=9 align="center"><i>Sordariomycetes</i></th>
    <th colspan=2 align="center"><i>Leotiomycetes</i></th>
    <th colspan=2 align="center"><i>Saccharomycetes</i></th>
  </tr>
    <th><i>H.ara</i></th>
    <th><i>P.cap</i></th>
    <th><i>P.inf</i></th>
    <th><i>P.ram</i></th>
    <th><i>P.soj</i></th>
    <th><i>P.ult</i></th>
    <th><i>B.den</i></th>
    <th><i>M.cir</i></th>
    <th><i>R.ory</i></th>
    <th><i>C.cin</i></th>
    <th><i>P.chr</i></th>
    <th><i>C.gat</i> R265</th>
    <th><i>C.gat</i> WM276</th>
    <th><i>C.neo</i> H99</th>
    <th><i>C.neo</i> B3501</th>
    <th><i>C.neo</i> JEC21</th>
    <th><i>T.mes</i></th>
    <th><i>P.gra</i></th>
    <th><i>M.glo</i></th>
    <th><i>S.rei</i></th>
    <th><i>U.may</i></th>
    <th><i>S.jap</i></th>
    <th><i>S.oct</i></th>
    <th><i>S.pom</i></th>
    <th><i>A.car</i></th>
    <th><i>A.cla</i></th>
    <th><i>A.fla</i></th>
    <th><i>A.fum</i></th>
    <th><i>A.nig</i></th>
    <th><i>A.ter</i></th>
    <th><i>A.nid</i></th>
    <th><i>C.imm</i> H538.4</th>
    <th><i>C.imm</i> RS</th>
    <th><i>C.pos</i></th>
    <th><i>H.cap</i> NAm1</th>
    <th><i>H.cap</i> G186AR</th>
    <th><i>N.fis</i></th>
    <th><i>P.mar</i></th>
    <th><i>T.sti</i></th>
    <th><i>F.oxy</i></th>
    <th><i>F.ver</i></th>
    <th><i>F.gra</i></th>
    <th><i>M.ory</i></th>
    <th><i>N.cra</i></th>
    <th><i>N.dis</i></th>
    <th><i>N.tet</i></th>
    <th><i>S.mac</i></th>
    <th><i>T.ree</i></th>
    <th><i>B.fuc</i></th>
    <th><i>S.scl</i></th>
    <th><i>C.alb</i></th>
    <th><i>S.cer</i></th>
  <tr>
  </tr>
  <tr align="center">
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_results" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_ortholog_groups" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="hara_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="phyca_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="phyin_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="phyra_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="physo_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="pytul_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="bden_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mcir_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="rory_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ccin_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="pchr_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cgatR265_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cgatWM276_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cneoH99_instances" />
    </td>
   <td>
      <imp:filterInstance strategyId="${strategyId}"
                          stepId="${stepId}"
                          answerValue="${answerValue}"
                          instanceName="cneoB3501A_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cneoJEC21_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tmes_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="pgra_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mglo_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="srei_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="umay_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="sjap_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="soct_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="spom_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="acar_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="acla_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="afla_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="afum_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="anig_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ater_instances" />
    </td>
   <td>
      <imp:filterInstance strategyId="${strategyId}"
                          stepId="${stepId}"
                          answerValue="${answerValue}"
                          instanceName="anid_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}"
                          stepId="${stepId}"
                          answerValue="${answerValue}"
                          instanceName="cimmH5384_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cimmRS_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cpos_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="hcapNAm1_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="hcapG186AR_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="nfis_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="pmar_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tsti_instances" />
    </td>
    <td> 
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="foxy_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="fver_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="fgra_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mory_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ncra_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ndis_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ntet_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="smac_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tree_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="bfuc_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="sscl_instances" />
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="calb_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="scer_instances" />  
    </td>

  </tr>
</table>
