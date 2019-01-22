package org.apidb.apicommon.model.view;

import org.eupathdb.common.model.view.IsolateViewHandler;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;

public class GeoIsolateViewHandler extends IsolateViewHandler {

    @Override
    public String prepareSql(String idSql) throws WdkModelException,
            WdkUserException {
        StringBuilder sql = new StringBuilder("select ");
        sql.append("       cnt.country, cnt.total, cnt.latitude, cnt.longitude, ot.source_id as gaz ");
        sql.append("from sres.OntologyTerm ot, ");
        sql.append("     (select count(*) as total, latitude, longitude, curated_geographic_location as country ");
        sql.append("      from ApidbTuning.PopsetAttributes ");
        sql.append("      where source_id in (select source_id from ( " + idSql + " )) ");
        sql.append("      group by latitude, longitude, curated_geographic_location) cnt ");
        sql.append("where ot.name = cnt.country ");
        sql.append("  and ot.source_id like 'GAZ%' ");

        return sql.toString();
    }

}
