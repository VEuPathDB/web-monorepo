package org.clinepi.model.analysis;

import static org.gusdb.fgputil.FormatUtil.TAB;
import static org.gusdb.fgputil.FormatUtil.NL;

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
import org.gusdb.fgputil.db.pool.DatabaseInstance;
import org.gusdb.fgputil.db.runner.SQLRunner;
import org.gusdb.fgputil.db.runner.SQLRunnerException;
import org.gusdb.fgputil.functional.FunctionalInterfaces.Function;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
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

  // name of output file dumped to analysis job directory
  private static final String ONT_ATTR_META_FILENAME = "ontologyMetadata.tab";

  // query output column names
  private static final String SOURCE_ID_COL = "source_id";
  private static final String PROPERTY_COL = "property";
  private static final String TYPE_COL = "type";
  private static final String PARENT_COL = "parent";

  private static final String HEADER = buildLine(SOURCE_ID_COL, PROPERTY_COL, TYPE_COL);

  private static final Function<Boolean,String> getMetadataSql = useDatasetName ->
      "select ontology_term_source_id as " + SOURCE_ID_COL + ", ontology_term_name as " + PROPERTY_COL + ", " + TYPE_COL + ", parent_ontology_term_name as " + PARENT_COL +
      "  from apidbtuning.metadataontology" +
      "  where ontology_term_source_id is not null" +
      "    and type is not null" +
      (useDatasetName ? " and dataset_name = ?" : "");

  @Override
  public ExecutionStatus runAnalysis(AnswerValue answerValue, StatusLogger log)
      throws WdkModelException, WdkUserException {
    ExecutionStatus status = super.runAnalysis(answerValue, log);

    // perform custom dump of ontology item metadata on a per-dataset basis
    //   (only if other operations were successful)
    if (status.equals(ExecutionStatus.COMPLETE)) {
      dumpOntologyMeta(
          getWdkModel().getAppDb(),
          getProperty(DATASET_NAME_PROPERTY),
          getStorageDirectory());
    }

    return status;
  }

  private static void dumpOntologyMeta(DatabaseInstance appDb, String datasetName, Path storageDir) {
    boolean useDatasetName = (datasetName != null);
    File outputFile = Paths.get(storageDir.toAbsolutePath().toString(), ONT_ATTR_META_FILENAME).toFile();
    new SQLRunner(appDb.getDataSource(), getMetadataSql.apply(useDatasetName)).executeQuery(
      (useDatasetName ? new Object[]{ datasetName } : new Object[0]),
      (useDatasetName ? new Integer[]{ Types.VARCHAR } : new Integer[0]),
      rs -> {
        try (BufferedWriter out = new BufferedWriter(new FileWriter(outputFile))) {
          out.write(HEADER);
          while (rs.next()) {
            out.write(buildLine(
                getStringCol(rs, SOURCE_ID_COL),
                getStringCol(rs, PROPERTY_COL),
                getStringCol(rs, TYPE_COL)));
          }
        }
        catch (IOException e) {
          throw new SQLRunnerException(e);
        }
      }
    );
  }

  private static String buildLine(String col1, String col2, String col3) {
    return new StringBuilder(col1).append(TAB).append(col2).append(TAB).append(col3).append(NL).toString();
  }

  private static String getStringCol(ResultSet rs, String colName) throws SQLException {
    String value = rs.getString(colName);
    return (rs.wasNull() ? null : value);
  }
}
