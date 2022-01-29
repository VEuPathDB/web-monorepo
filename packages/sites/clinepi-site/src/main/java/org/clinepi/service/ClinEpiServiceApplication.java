package org.clinepi.service;

import java.util.Set;

import org.clinepi.service.accessRequest.AccessRequestService;
import org.clinepi.service.services.ShinyDataService;
import org.clinepi.service.services.ShinyQueryService;
import org.eupathdb.common.service.EuPathServiceApplication;
import org.gusdb.fgputil.SetBuilder;
import org.gusdb.wdk.service.service.ProjectService;
import org.gusdb.wdk.service.service.user.ProfileService;

public class ClinEpiServiceApplication extends EuPathServiceApplication {

  @Override
  public Set<Class<?>> getClasses() {
    return new SetBuilder<Class<?>>()

      // add all Ebrc and WDK classes
      .addAll(super.getClasses())

      // custom profile endpoint that contains study access info
      .replace(ProfileService.class, CustomProfileService.class)

      // custom project endpoint provides clinepi-specific site config
      .replace(ProjectService.class,  CustomProjectService.class)

      // ability to request study/dataset access
      .add(AccessRequestService.class)

      // provide access to shiny input files
      .add(ShinyDataService.class)

      // let shiny apps query db
      .add(ShinyQueryService.class) 

      .toSet();
  }
}
