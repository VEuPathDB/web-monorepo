package org.clinepi.model.view;

import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.eupathdb.common.model.view.IsolateViewHandler;

public class GeoIsolateViewHandler extends IsolateViewHandler {

    @Override
    public String prepareSql(String idSql) throws WdkModelException,
            WdkUserException {
        StringBuilder sql = new StringBuilder("select country as country, count(country) as total, data_type, lat, lng from ( SELECT ");
        sql.append("    i.source_id , ");
        sql.append("    i.data_type ,");
        sql.append("    i.lat ,");
        sql.append("    i.lng ,");
        sql.append("    i.country    ");
        sql.append(" FROM ApidbTuning.IsolateAttributes i, ");
        sql.append("      (" + idSql + ") idq ");
        sql.append(" WHERE  ");
        sql.append("   i.source_id = idq.source_id ");
        sql.append("   AND i.country is not null ");
        sql.append(" ) group by country, data_type, lat, lng ");

        return sql.toString();
    }

}
