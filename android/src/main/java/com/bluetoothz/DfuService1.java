package com.bluetoothz;

import android.app.Activity;

import no.nordicsemi.android.dfu.DfuBaseService;

public class DfuService1 extends DfuBaseService {

  public DfuService1() {
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
