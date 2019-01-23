package org.apidb.apicommon.controller.action;

import java.io.PrintWriter;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.fgputil.db.slowquery.QueryLogger;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.Utilities;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;
import org.gusdb.wdk.model.record.RecordClass;
import org.gusdb.wdk.model.user.BasketFactory;
import org.gusdb.wdk.model.user.User;

public class ExportBasketAction extends Action {

    private static final String PARAM_TARGET_PROJECT = "target";
    private static final String PARAM_RECORD_CLASS = "recordClass";
    private static final String PROJECT_PORTAL = "EuPathDB";

    private static final Logger logger = Logger.getLogger(ExportBasketAction.class);

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        WdkModelBean wdkModelBean = ActionUtility.getWdkModel(servlet);
        UserBean userBean = ActionUtility.getUser(request);

        String targetProject = request.getParameter(PARAM_TARGET_PROJECT);
        String rcName = request.getParameter(PARAM_RECORD_CLASS);

        WdkModel wdkModel = wdkModelBean.getModel();
        User user = userBean.getUser();
        
        // validate and export the basket.
        validateInput(wdkModel, targetProject, rcName);
        int count = exportBasket(wdkModel, user, targetProject, rcName);

        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        writer.write(Integer.toString(count));
        writer.close();

        return null;
    }

    private void validateInput(WdkModel wdkModel, String targetProject,
            String rcName) throws WdkUserException, WdkModelException {
        // check target project id
        if (targetProject == null || targetProject.length() == 0)
            throw new WdkUserException("The require target project is not "
                    + "specified");

        // check the existance of the record class, and basket is enabled on it.
        RecordClass recordClass = wdkModel.getRecordClass(rcName);
        if (!recordClass.isUseBasket())
            throw new WdkUserException("The basket is not allowed on "
                    + "recordClass " + rcName);
    }

    private int exportBasket(WdkModel wdkModel, User user,
            String targetProject, String rcName) throws SQLException {
        String schema = wdkModel.getModelConfig().getUserDB().getUserSchema();
        String table = schema + BasketFactory.TABLE_BASKET;
        String userColumn = BasketFactory.COLUMN_USER_ID;
        String rcColumn = BasketFactory.COLUMN_RECORD_CLASS;
        String projectColumn = BasketFactory.COLUMN_PROJECT_ID;
        String prefix = Utilities.COLUMN_PK_PREFIX;
        String pkColumns = prefix + "1, " + prefix + "2, " + prefix + "3 ";
        String projectId = wdkModel.getProjectId();
        long userId = user.getUserId();

        String selectClause = "SELECT " + userColumn + ", " + rcColumn + ", "
                + pkColumns + " FROM " + table + " WHERE " + userColumn
                + " = ? AND " + rcColumn + " = ? AND " + projectColumn
                + " = ? ";

        String sql = "INSERT INTO " + table + " (" + userColumn + ", "
                + rcColumn + ", " + projectColumn + ", " + pkColumns + ") "
                + " SELECT " + userColumn + ", " + rcColumn + ", ? AS "
                + projectColumn + ", " + pkColumns + " FROM (" + selectClause;

        // if export from eupath to a component, only export the records from
        // that component
        if (projectId.equals(PROJECT_PORTAL))
            sql += " AND " + prefix + "2 = ? ";

        sql += " MINUS " + selectClause + ")";

        logger.debug(sql);

        DataSource dataSource = wdkModel.getUserDb().getDataSource();
        PreparedStatement psInsert = null;
        int count = 0;
        try {
            psInsert = SqlUtils.getPreparedStatement(dataSource, sql);
            int index = 0;
            psInsert.setString(++index, targetProject);
            psInsert.setLong(++index, userId);
            psInsert.setString(++index, rcName);
            psInsert.setString(++index, projectId);
            if (projectId.equals(PROJECT_PORTAL))
                psInsert.setString(++index, targetProject);
            psInsert.setLong(++index, userId);
            psInsert.setString(++index, rcName);
            psInsert.setString(++index, targetProject);

            long start = System.currentTimeMillis();
            count = psInsert.executeUpdate();
            QueryLogger.logEndStatementExecution(sql, "wdk-export-basket", start);
        } finally {
            SqlUtils.closeStatement(psInsert);
        }
        return count;
    }
}
