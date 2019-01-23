package org.apidb.apicommon.model.view.genome;

import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;

/**
 * @author jerric
 */
public class GeneGenomeViewHandler extends GenomeViewHandler {

    @Override
    public String prepareSql(String idSql) throws WdkModelException,
            WdkUserException {
        StringBuilder sql = new StringBuilder("SELECT DISTINCT ");
        sql.append("    ga.gene_source_id AS " + COLUMN_SOURCE_ID + ", ");
        sql.append("    ga.sequence_id AS " + COLUMN_SEQUENCE_ID + ", ");
        sql.append("    sa.length AS " + COLUMN_SEQUENCE_LENGTH + ", ");
        sql.append("    sa.chromosome AS " + COLUMN_CHROMOSOME + ", ");
        sql.append("    sa.organism AS " + COLUMN_ORGANISM + ", ");
        sql.append("    ga.gene_start_min AS " + COLUMN_START + ", ");
        sql.append("    ga.gene_end_max AS " + COLUMN_END + ", ");
        sql.append("    ga.gene_product AS " + COLUMN_DESCRIPTION + ", ");
        sql.append("    ga.gene_context_start || '..' || ga.gene_context_end AS " + COLUMN_CONTEXT + ", ");
        sql.append("    CASE ga.strand WHEN 'forward' THEN 1 ELSE 0 END AS " + COLUMN_STRAND);
        sql.append(" FROM ApidbTuning.TranscriptAttributes ga, ");
        sql.append("      ApidbTuning.GenomicSeqAttributes sa, ");
        sql.append("      (" + idSql + ") idq ");
        sql.append(" WHERE ga.sequence_id = sa.source_id ");
        sql.append("  AND ga.gene_source_id = idq.gene_source_id ");

        return sql.toString();
    }

}
