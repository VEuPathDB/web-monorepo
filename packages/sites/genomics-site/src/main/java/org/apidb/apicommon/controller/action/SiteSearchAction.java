package org.apidb.apicommon.controller.action;

import static org.gusdb.fgputil.FormatUtil.urlEncodeUtf8;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.EnumParamBean;
import org.gusdb.wdk.model.jspwrap.ParamBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class SiteSearchAction extends Action {

    private static final Logger logger = Logger.getLogger(SiteSearchAction.class);

    private static final String PARAM_TYPE = "type";
    private static final String PARAM_KEYWORD = "keyword";

    private static final String ATTR_KEYWORD = "keyword";
    private static final String ATTR_GENE_URL = "geneUrl";
    private static final String ATTR_ISOLATE_URL = "isolateUrl";

    private static final String QUESTION_GENE = "GeneQuestions.GenesByTextSearch";
    private static final String QUESTION_ISOLATE = "IsolateQuestions.IsolatesByTextSearch";

    private static final String TEXT_PARAM = "text_expression";

    private static final String FORWARD_QUESTION = "to-question";
    private static final String FORWARD_SUMMARY = "to-summary";
    private static final String FORWARD_HTML = "to-html";

    private static final String TYPE_ALL = "all";
    private static final String TYPE_GENE = "gene";
    private static final String TYPE_ISOLATE = "isolate";
    private static final String TYPE_HTML = "html";

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        logger.info("Entering site search...");

        // need to check if the old record is mapped to more than one records
        WdkModelBean wdkModel = ActionUtility.getWdkModel(servlet);
        String type = request.getParameter(PARAM_TYPE);
        String keyword = request.getParameter(PARAM_KEYWORD);
        logger.debug("type=" + type + ", keyword=" + keyword);

        // determine if isolate question exists
        boolean hasIsolate = true;
        try { wdkModel.getQuestion(QUESTION_ISOLATE); }
        catch (Exception ex) { hasIsolate = false; }

        ActionForward forward;
        if (type.equals(TYPE_ALL)) { // go to summary page
            forward = mapping.findForward(FORWARD_SUMMARY);
            request.setAttribute(ATTR_KEYWORD, keyword);

            String geneUrl = getQuestionUrl(wdkModel, QUESTION_GENE, keyword);
            request.setAttribute(ATTR_GENE_URL, geneUrl);

            if (hasIsolate) {
                String isoUrl = getQuestionUrl(wdkModel, QUESTION_ISOLATE, keyword);
                request.setAttribute(ATTR_ISOLATE_URL, isoUrl);
            }
        } else if (type.equals(TYPE_HTML)) {
            forward = mapping.findForward(FORWARD_HTML);
            request.setAttribute(ATTR_KEYWORD, keyword);
            String url = forward.getPath();
            url += (url.indexOf('?') < 0) ? '?' : '&';
            url += "keyword" + keyword;
            forward = new ActionForward(url, false);
        } else { // go to search result page
            String questionName;
            if (type.equals(TYPE_GENE)) {
                questionName = QUESTION_GENE;
            } else if (hasIsolate && type.equals(TYPE_ISOLATE)) {
                questionName = QUESTION_ISOLATE;
            } else {
                throw new WdkUserException("Unknown site search type: " + type);
            }

            forward = mapping.findForward(FORWARD_QUESTION);
            String url = forward.getPath();
            url += (url.indexOf('?') < 0) ? '?' : '&';
            url += getQuestionUrl(wdkModel, questionName, keyword);
            forward = new ActionForward(url, false);
        }

        logger.info("Leaving site search: " + forward.getPath());
        return forward;
    }

    private String getQuestionUrl(WdkModelBean wdkModel, String questionName,
            String keyword) throws WdkModelException {
        QuestionBean question = wdkModel.getQuestion(questionName);
        StringBuilder builder = new StringBuilder();
        builder.append("questionFullName=").append(question.getFullName());

        Map<String, ParamBean<?>> params = question.getParamsMap();
        for (ParamBean<?> param : params.values()) {
            // use the keyword as the input for text param.
            if (param.getName().equals(TEXT_PARAM)) {
                String name = urlEncodeUtf8("value(" + TEXT_PARAM + ")");
                builder.append("&" + name + "=" + urlEncodeUtf8(keyword));
                continue;
            }

            if (param instanceof EnumParamBean
                    && ((EnumParamBean) param).getMultiPick()) {
                String[] values = param.getDefault().split(",");
                for (String value : values) {
                    String name = urlEncodeUtf8("array(" + param.getName() + ")");
                    builder.append("&" + name + "=" + urlEncodeUtf8(value));
                }
            } else {
                String name = urlEncodeUtf8("value(" + param.getName() + ")");
                String value = urlEncodeUtf8(param.getDefault());
                builder.append("&" + name + "=" + value);
            }
        }
        return builder.toString();
    }
}
