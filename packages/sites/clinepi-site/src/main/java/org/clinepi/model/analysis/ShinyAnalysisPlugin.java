package org.clinepi.model.analysis;

import static org.gusdb.fgputil.FormatUtil.NL;
import static org.gusdb.fgputil.FormatUtil.TAB;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

import org.eupathdb.common.model.analysis.EuPathExternalAnalyzer;
import org.gusdb.fgputil.FormatUtil;
import org.gusdb.fgputil.db.pool.DatabaseInstance;
import org.gusdb.fgputil.db.runner.SQLRunner;
import org.gusdb.fgputil.db.runner.SQLRunnerException;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.user.analysis.ExecutionStatus;
import org.gusdb.wdk.model.user.analysis.StatusLogger;

/**
 * A subclass of EuPathExternalAnalyzer that provides an additional tab-delimited
 * file containing metadata item names, display values, and types for (if provided)
 * a particular dataset, or, if not provided, for all datasets.
 * 
 * @author rdoherty
 */
public class ShinyAnalysisPlugin extends EuPathExternalAnalyzer {

  // add this property to plugin configuration to filter metadata by dataset name
  private static final String DATASET_NAME_PROPERTY = "datasetName";

  private static final boolean DUMP_ONTOLOGY_META = true;
  private static final String DATASET_TBL_PREFIX = "datasetTblPrefix";

  // name of output files dumped to analysis job directory
  private static final String ONT_ATTR_META_FILENAME = "ontologyMetadata.tab";
  private static final String ADDITIONAL_PROPS_FILENAME = "customProps.txt";

  // query output column names
  private static final String SOURCE_ID_COL = "SOURCE_ID";
  private static final String PROPERTY_COL = "PROPERTY";
  private static final String TYPE_COL = "TYPE";
  private static final String PARENT_COL = "PARENTLABEL";
  private static final String CAT_COL = "CATEGORY";
  private static final String MIN_COL = "MIN";
  private static final String MAX_COL = "MAX";
  private static final String AVG_COL = "AVERAGE";
  private static final String UQ_COL = "UPPER_QUARTILE";
  private static final String LQ_COL = "LOWER_QUARTILE";
  private static final String DISTINCT_COL = "DISTINCT_VALUES";
  private static final String NUM_DISTINCT_COL = "NUMBER_DISTINCT_VALUES";

  private static final String HEADER = buildLine(SOURCE_ID_COL, PROPERTY_COL, TYPE_COL, PARENT_COL, CAT_COL, MIN_COL, MAX_COL, AVG_COL, UQ_COL, LQ_COL, NUM_DISTINCT_COL, DISTINCT_COL);

    private static String getMetadataSql(boolean useDatasetName, String tblPrefix) {
    return
      "select distinct o.ontology_term_source_id as " + SOURCE_ID_COL + 
      ", o.ontology_term_name as " + PROPERTY_COL + 
      ", o.type as " + TYPE_COL + 
      ", o.parent_ontology_term_name as " + PARENT_COL +
      ", pc.category as " + CAT_COL +
      ", ms.min as " +  MIN_COL +
      ", ms.max as "  + MAX_COL +
      ", ms.average as " + AVG_COL +
      ", ms.upper_quartile as " + UQ_COL +
      ", ms.lower_quartile as " + LQ_COL +
      ", ms.number_distinct_values as " + NUM_DISTINCT_COL +
      ", ms.distinct_values as " + DISTINCT_COL +
      " from apidbtuning." + tblPrefix + "Ontology o " +
      " left join apidbtuning." + tblPrefix + "PropertyCategory pc on o.ontology_term_source_id = pc.property_source_id" + 
      " left join apidbtuning." + tblPrefix + "MetadataSummary ms on o.ontology_term_source_id = ms.property_source_id" +
      " where o.ontology_term_source_id is not null" +
      (useDatasetName ? " and o.dataset_name = ?" : "");
  }

  @Override
  public ExecutionStatus runAnalysis(AnswerValue answerValue, StatusLogger log)
      throws WdkModelException {
    ExecutionStatus status = super.runAnalysis(answerValue, log);

    // perform custom dump of ontology item metadata on a per-dataset basis
    //   (only if other operations were successful)
    if (status.equals(ExecutionStatus.COMPLETE)) {
      if (DUMP_ONTOLOGY_META) {
        dumpOntologyMeta(
            getWdkModel().getAppDb(),
            getProperty(DATASET_NAME_PROPERTY),
            getProperty(DATASET_TBL_PREFIX),
            getStorageDirectory());
      }
      writeContentToFile(getStorageDirectory().toAbsolutePath().toString(),
          ADDITIONAL_PROPS_FILENAME, getProperty(DATASET_NAME_PROPERTY) + NL);
    }

    return status;
  }

  private static void dumpOntologyMeta(DatabaseInstance appDb, String datasetName, String datasetTblPrefix, Path storageDir) {
    boolean useDatasetName = (datasetName != null);
    File outputFile = Paths.get(storageDir.toAbsolutePath().toString(), ONT_ATTR_META_FILENAME).toFile();
    new SQLRunner(appDb.getDataSource(), getMetadataSql(useDatasetName, datasetTblPrefix)).executeQuery(
      (useDatasetName ? new Object[]{ datasetName } : new Object[0]),
      (useDatasetName ? new Integer[]{ Types.VARCHAR } : new Integer[0]),
      rs -> {
        try (BufferedWriter out = new BufferedWriter(new FileWriter(outputFile))) {
          out.write(HEADER);
          while (rs.next()) {
            out.write(buildLine(
                getStringCol(rs, SOURCE_ID_COL),
                getStringCol(rs, PROPERTY_COL),
                getStringCol(rs, TYPE_COL),
                getStringCol(rs, PARENT_COL),
                getStringCol(rs, CAT_COL),
                getStringCol(rs, MIN_COL),
                getStringCol(rs, MAX_COL),
                getStringCol(rs, AVG_COL),
                getStringCol(rs, UQ_COL),
                getStringCol(rs, LQ_COL),
                getStringCol(rs, NUM_DISTINCT_COL),
                getStringCol(rs, DISTINCT_COL)));
          }
          return null;
        }
        catch (IOException e) {
          throw new SQLRunnerException(e);
        }
      }
    );
  }

  private static String buildLine(String... columns) {
    return FormatUtil.join(columns, TAB) + NL;
  }

  private static String getStringCol(ResultSet rs, String colName) throws SQLException {
    String value = rs.getString(colName);
    return (rs.wasNull() ? null : value);
  }
}
