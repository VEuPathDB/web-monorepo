package org.apidb.apicommon.controller.wizard;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apidb.apicommon.controller.action.CustomShowQuestionAction;
import org.gusdb.wdk.controller.wizard.ShowQuestionStageHandler;
import org.gusdb.wdk.controller.wizard.WizardFormIfc;
import org.gusdb.wdk.model.WdkModel;

public class CustomShowQuestionStageHandler extends ShowQuestionStageHandler {

    private static final Logger logger = Logger.getLogger(CustomShowQuestionStageHandler.class);

    @Override
    public Map<String, Object> execute(WdkModel wdkModel,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception {
        logger.debug("Entering CustomShowQuestionStageHandler...");

        // load data sources
        CustomShowQuestionAction.loadReferences(wdkModel, request);
        
        // call execute() from parent;
        return super.execute(wdkModel, request, response, wizardForm);
    }

    
}
