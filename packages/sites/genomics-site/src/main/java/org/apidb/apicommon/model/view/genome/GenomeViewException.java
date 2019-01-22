/**
 * 
 */
package org.apidb.apicommon.model.view.genome;

import org.gusdb.wdk.model.WdkModelException;

/**
 * @author Jerric
 *
 */
public class GenomeViewException extends WdkModelException {

  /**
   * 
   */
  private static final long serialVersionUID = -7731681296473459256L;

  /**
   * 
   */
  public GenomeViewException() {
  }

  /**
   * @param msg
   */
  public GenomeViewException(String msg) {
    super(msg);
  }

  /**
   * @param msg
   * @param cause
   */
  public GenomeViewException(String msg, Throwable cause) {
    super(msg, cause);
  }

  /**
   * @param cause
   */
  public GenomeViewException(Throwable cause) {
    super(cause);
  }

}
