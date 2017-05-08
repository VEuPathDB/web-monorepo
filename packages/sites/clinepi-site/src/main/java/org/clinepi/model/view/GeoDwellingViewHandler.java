package org.clinepi.model.view;

import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;

public class GeoDwellingViewHandler extends IsolateViewHandler {

    @Override
    public String prepareSql(String idSql) throws WdkModelException,
            WdkUserException {

        StringBuilder sql = new StringBuilder("select country, count(country) as total, data_type, lat, lng from ( SELECT ");
        sql.append("    i.source_id , ");
        sql.append("    'dwelling' as data_type ,");
        sql.append("    i.Northing as lat ,");
        sql.append("    i.Easting as lng ,");
        sql.append("    i.source_id as country    ");
        sql.append(" FROM ApidbTuning.dwellingattributes i, ");
        sql.append("      (" + idSql + ") idq ");
        sql.append(" WHERE  ");
        sql.append("  i.source_id = idq.source_id ");
        sql.append(" ) group by source_id, data_type, lat, lng ");

        return sql.toString();
    }

}
