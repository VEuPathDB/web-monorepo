package org.clinepi.service;

import java.util.Set;

import org.clinepi.service.accessRequest.AccessRequestService;
import org.eupathdb.common.service.contact.ContactUsService;
import org.gusdb.fgputil.SetBuilder;
import org.gusdb.wdk.service.WdkServiceApplication;
import org.gusdb.wdk.service.service.user.ProfileService;

public class ClinEpiServiceApplication extends WdkServiceApplication {

  @Override
  public Set<Class<?>> getClasses() {
    return new SetBuilder<Class<?>>()

      // add all WDK classes (not using Ebrc!)
      .addAll(super.getClasses())

      // ... but we do need Ebrc's ContactUsService
      .add(ContactUsService.class)

      // replace ProfileService with custom version for ClinEpi
      .replace(ProfileService.class, CustomProfileService.class)

      // add ClinEpi services
      .add(AccessRequestService.class)

      .toSet();
  }
}
