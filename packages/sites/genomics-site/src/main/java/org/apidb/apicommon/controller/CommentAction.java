package org.apidb.apicommon.controller;

import org.apache.struts.action.Action;

/**
 * @author xingao the base class for all comment actions; it will initialize and
 *         load the comment factory.
 */
public abstract class CommentAction extends Action {

    public static final String LOCATION_COORDINATETYPE_PROTEIN = "protein";
    public static final String LOCATION_COORDINATETYPE_GENOME = "genome";

}
