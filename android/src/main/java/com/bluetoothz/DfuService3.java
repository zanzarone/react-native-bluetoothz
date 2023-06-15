
package com.bluetoothz;

import android.app.Activity;

import no.nordicsemi.android.dfu.DfuBaseService;

public class DfuService3 extends DfuBaseService {

  public DfuService3() {
    super();
  }

  @Override
  protected Class<? extends Activity> getNotificationTarget() {
    return DfuNotificationActivity.class;
  }

  @Override
  protected boolean isDebug() {
    return true;
  }
}
