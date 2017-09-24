package org.clinepi.service;

import java.util.Set;

import static org.gusdb.fgputil.functional.Functions.filter;

import org.gusdb.fgputil.SetBuilder;
import org.gusdb.wdk.service.WdkServiceApplication;
import org.gusdb.wdk.service.service.user.ProfileService;

public class ClinEpiServiceApplication extends WdkServiceApplication {

  @Override
  public Set<Class<?>> getClasses() {
    return new SetBuilder<Class<?>>()

      // add all WDK classes (not using Ebrc!) except ProfileService which we will override
      .addAll(filter(super.getClasses(), clazz -> !clazz.getName().equals(ProfileService.class.getName())))

      // add clin-epi custom profile service
      .add(CustomProfileService.class)

      .toSet();
  }
}
