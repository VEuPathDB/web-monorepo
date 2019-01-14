package org.clinepi.model.view;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.log4j.Logger;
import org.eupathdb.common.model.view.Isolate;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.fgputil.validation.ValidObjectFactory.RunnableObj;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.SummaryViewHandler;
import org.gusdb.wdk.model.answer.factory.AnswerValueFactory;
import org.gusdb.wdk.model.answer.spec.AnswerSpec;
import org.gusdb.wdk.model.user.User;

public abstract class ParticipantViewHandler implements SummaryViewHandler {

    private static final String PROP_SEQUENCES = "isolates";
    private static final String PROP_MAX_LENGTH = "maxLength";

    private static final Logger logger = Logger.getLogger(ParticipantViewHandler.class);

    public abstract String prepareSql(String idSql) throws WdkModelException,
            WdkUserException;

    @Override
    public Map<String, Object> process(RunnableObj<AnswerSpec> answerSpec, Map<String, String[]> parameters,
        User user) throws WdkModelException, WdkUserException {
        logger.debug("Entering DwellingViewHandler...");

        ResultSet resultSet = null;
        try {
            AnswerValue answerValue = AnswerValueFactory.makeAnswer(user, answerSpec);
            String sql = prepareSql(answerValue.getIdSql());
            DataSource dataSource = answerValue.getWdkModel().getAppDb().getDataSource();
            resultSet = SqlUtils.executeQuery(dataSource, sql,
                    answerSpec.getObject().getQuestion().getQuery().getFullName() + "__isolate-view", 2000);

            int maxLength = 0;
            Map<String, Isolate> isolates = new HashMap<String, Isolate>();
            while (resultSet.next()) {
                String isolateId = resultSet.getString("country");
                Isolate isolate = isolates.get(isolateId);
                if (isolate == null) {
                    isolate = new Isolate(isolateId);
                    isolates.put(isolateId, isolate);

                    int total = resultSet.getInt("total");
                    isolate.setTotal(total);
                    String type = resultSet.getString("data_type");
                    isolate.setType(type);
                    isolate.setLat(resultSet.getDouble("lat"));
                    isolate.setLng(resultSet.getDouble("lng"));
                }
            }

            // sort sequences by source ids
            String[] isolateIds = isolates.keySet().toArray(new String[0]);
            Arrays.sort(isolateIds);
            Isolate[] array = new Isolate[isolateIds.length];
            for (int i = 0; i < isolateIds.length; i++) {
                array[i] = isolates.get(isolateIds[i]);
            }   

            Map<String, Object> results = new HashMap<String, Object>();
            results.put(PROP_SEQUENCES, array);
            results.put(PROP_MAX_LENGTH, maxLength);
            logger.debug("Leaving DwellingViewHandler...");
            return results;
        } catch (SQLException ex) {
            logger.error(ex);
            ex.printStackTrace();
            throw new WdkModelException(ex);
        } finally {
            SqlUtils.closeResultSetAndStatement(resultSet, null);
        }
    }
}
