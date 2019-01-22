package org.apidb.apicommon.model.view.genome;

import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;

/**
 * @author jerric
 */
public class DynamicSpanGenomeViewHandler extends GenomeViewHandler {

    @Override
    public String prepareSql(String idSql) throws WdkModelException,
            WdkUserException {
        StringBuilder sql = new StringBuilder("SELECT ");
        sql.append("    ids.source_id AS " + COLUMN_SOURCE_ID + ", ");
        sql.append("    ids.sequence_id AS " + COLUMN_SEQUENCE_ID + ", ");
        sql.append("    sa.length AS " + COLUMN_SEQUENCE_LENGTH + ", ");
        sql.append("    sa.chromosome AS " + COLUMN_CHROMOSOME + ", ");
        sql.append("    sa.organism AS " + COLUMN_ORGANISM + ", ");
        sql.append("    ids.start_min AS " + COLUMN_START + ", ");
        sql.append("    ids.end_max AS " + COLUMN_END + ", ");
        sql.append("    '' AS " + COLUMN_DESCRIPTION + ", ");
        sql.append("    ids.start_min || '..' || ids.end_max AS " + COLUMN_CONTEXT + ", ");
        sql.append("    ids.strand AS " + COLUMN_STRAND);
        sql.append(" FROM (SELECT source_id, ");
        sql.append("            regexp_substr(source_id, '[^:]+', 1, 1) as sequence_id, ");
        sql.append("            regexp_substr(regexp_substr(source_id, '[^:]+', 1, 2), '[^\\-]+', 1,1) as start_min, ");
        sql.append("            regexp_substr(regexp_substr(source_id, '[^:]+', 1, 2), '[^\\-]+', 1,2) as end_max, ");
        sql.append("            CASE regexp_substr(source_id, '[^:]+', 1, 3) WHEN 'f' THEN 1 ELSE 0 END AS strand ");
        sql.append("       FROM (" + idSql + ") ");
        sql.append("      ) ids, ApidbTuning.GenomicSeqAttributes sa");
        sql.append(" WHERE ids.sequence_id = sa.source_id");

        return sql.toString();
    }
}
