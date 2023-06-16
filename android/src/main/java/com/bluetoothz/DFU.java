package com.bluetoothz;

import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_PAUSED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_RESUMED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_ABORTED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_COMPLETED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_CONNECTED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_CONNECTING;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_STARTED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_STARTING;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_UPLOADING;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_STATUS_VALIDATING;
//import static com.bluetoothz.BluetoothzModule.DFU_OPTION_MAX_RETRY;
import static com.bluetoothz.BluetoothzModule.DFU_OPTION_PACKET_DELAY;

import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Locale;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

import no.nordicsemi.android.dfu.DfuBaseService;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;

class DfuElement {
  public String uuid;
  public String alternativeUUID;
  public Dfu.DfuOperation operation;
}

class DfuQueueIndex {
  private int sharedInt;

  public synchronized void increment() {
    sharedInt++;
  }

  public synchronized int getValue() {
    return sharedInt % 3;
  }
}


class Dfu implements Runnable, LifecycleEventListener {
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  private ReactApplicationContext reactContext; /// Contesto React della app, viene passato come parametro.
  private ExecutorService executorService;
  private ConcurrentLinkedQueue<DfuElement> operationQueue;
  private Semaphore semaphore;
  private DfuQueueIndex index;
  private DfuProgressListener dfuProgressListener;

  private DfuElement getElement(String address) {
    DfuElement found = null;
    for (DfuElement element : this.operationQueue) {
      if (element.uuid.compareToIgnoreCase(address) == 0 || element.alternativeUUID.compareToIgnoreCase(address) == 0) {
        found = element;
      }
    }
    return found;
  }

  class DfuProgressListener extends DfuProgressListenerAdapter {
    DfuOperation parent;

    public DfuProgressListener() {
      this.parent = null;
    }

    public DfuProgressListener(DfuOperation parent) {
      this.parent = parent;
    }



    private WritableMap createNotification(final DfuElement element, final String status, final String description) {
      Log.d("CARDINALE", "createNotification " + Thread.currentThread().getId() + "," + status + " " + address);
      WritableMap map = Arguments.createMap();
      map.putString("uuid", element.uuid);
      map.putString("alternativeUUID", element.alternativeUUID);
      map.putString("status", status);
      map.putString("description", description);
      return map;
    }

    @Override
    public void onDeviceConnecting(@NonNull final String deviceAddress) {
      DfuElement el;
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_CONNECTING, "Connecting to the remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceConnected(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_CONNECTED, "Remote device connected.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuProcessStarting(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_STARTING, "Initializing DFU procedure.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuProcessStarted(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_STARTED, "DFU Procedure started.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onEnablingDfuMode(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, "Enabling DFU interface on remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onProgressChanged(@NonNull final String deviceAddress, final int percent, final float speed, final float avgSpeed, final int currentPart, final int partsTotal) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_UPLOADING, "Uploading firmware onto remote device.");
      map.putInt("progress", percent);
      map.putDouble("currentSpeedBytesPerSecond", speed);
      map.putDouble("avgSpeedBytesPerSecond", avgSpeed);
      map.putInt("part", currentPart);
      map.putInt("totalParts", partsTotal);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onFirmwareValidating(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_VALIDATING, "Validating firmware.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceDisconnecting(final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, "Disconnecting from remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceDisconnected(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED, "Remote device disconnected.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuCompleted(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_COMPLETED, "DFU Procedure successfully completed.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      parent.operationFinished();
    }

    @Override
    public void onDfuAborted(@NonNull final String deviceAddress) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      parent.operationFinished();
    }

    @Override
    public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
      WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
      map.putString("error", message);
      map.putInt("errorCode", error);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      parent.operationFinished();
    }
  }


  public Dfu(ReactApplicationContext ctx) {
    this.reactContext = ctx;
    this.operationQueue = new ConcurrentLinkedQueue<>();
    this.executorService = Executors.newFixedThreadPool(3); // Adjust the pool size as per your requirement
    this.semaphore = new Semaphore(3); // Number of operations allowed to execute simultaneously
    this.index = new DfuQueueIndex();
    this.dfuProgressListener = new DfuProgressListener();
    reactContext.addLifecycleEventListener(this);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }

  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    Log.d("CARDINALE", "============> sendEvent");
  }

  @Override
  public void onHostResume() {
    Log.d("CARDINALE", "============> onHostResume");
    DfuServiceListenerHelper.registerProgressListener(reactContext, dfuProgressListener);

  }

  @Override
  public void onHostPause() {

  }

  @Override
  public void onHostDestroy() {
    Log.d("CARDINALE", "============> onHostDestroy");
    DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuProgressListener);

  }

  class DfuOperation implements Runnable, LifecycleEventListener {
    public String deviceUUID;
    public String alternativeUUID;
    public String path;
    public String type;
    public ReadableMap options;
    public Class<? extends DfuBaseService> dfuServiceClass;
    private DfuServiceController controller;
    //    private DfuProgressListener dfuProgressListener;
    private boolean end;

    private synchronized void finished(boolean status) {
      this.end = status;
    }

    private synchronized boolean isFinished() {
      return end;
    }

    public DfuOperation(String deviceUUID, String alternativeUUID, String path, String type, ReadableMap options) {
      this.deviceUUID = deviceUUID;
      this.alternativeUUID = alternativeUUID;
      this.path = path;
      this.type = type;
      this.options = options;
//      this.dfuProgressListener = new DfuProgressListener(this);
      end = false;
//      reactContext.addLifecycleEventListener(this);
    }

    public DfuServiceController getController() {
      return controller;
    }

    public void setDfuServiceClass(Class<? extends DfuBaseService> dfuServiceClass) {
      this.dfuServiceClass = dfuServiceClass;
    }

    private void operationFinished() {
//      reactContext.removeLifecycleEventListener(this);
      this.finished(true);
      semaphore.release();
    }

    @Override
    public void run() {
      Log.d("CARDINALE", "thread " + Thread.currentThread().getId() + " working on device " + this.deviceUUID + " is started(" + this.dfuServiceClass.toString() + ")");
      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(this.deviceUUID);
      serviceInitiator.setKeepBond(false);
      serviceInitiator.setPacketsReceiptNotificationsValue(1);
      serviceInitiator.setPrepareDataObjectDelay(300L);
      serviceInitiator.setNumberOfRetries(2);
      if (this.options.hasKey(DFU_OPTION_PACKET_DELAY)) {
        serviceInitiator.setPrepareDataObjectDelay(this.options.getInt(DFU_OPTION_PACKET_DELAY));
      }
//      if (this.options.hasKey(DFU_OPTION_MAX_RETRY)) {
//        serviceInitiator.setNumberOfRetries(this.options.getInt(DFU_OPTION_MAX_RETRY));
//      }
      serviceInitiator.setUnsafeExperimentalButtonlessServiceInSecureDfuEnabled(true);
      switch (this.type) {
        case FILE_PATH_TYPE_STRING:
          serviceInitiator.setZip(this.path);
          break;
        case FILE_PATH_TYPE_URL:
          Uri uri = Uri.parse(this.path);
          serviceInitiator.setZip(uri);
          break;
      }
      Log.d("CARDINALE", "thread " + Thread.currentThread().getId() + " working on device " + this.deviceUUID + " created DFU controller");
      this.controller = serviceInitiator.start(reactContext, dfuServiceClass);

      try {
        while (!this.isFinished()) {
          Log.d("CARDINALE", "thread " + Thread.currentThread().getId() + " working on device " + this.deviceUUID + " is waiting for the completion");
          Thread.sleep(1000);
        }
        Log.d("CARDINALE", "thread " + Thread.currentThread().getId() + " working on device " + this.deviceUUID + " is waiting stop");
        Thread.sleep(2000);
        Log.d("CARDINALE", "thread " + Thread.currentThread().getId() + " working on device " + this.deviceUUID + " FINISHED");

      } catch (InterruptedException ex) {
        ex.printStackTrace();
      }
    }

//    class DfuProgressListener extends DfuProgressListenerAdapter {
//      DfuOperation parent;
//
//      public DfuProgressListener() {
//        this.parent = null;
//      }
//
//      public DfuProgressListener(DfuOperation parent) {
//        this.parent = parent;
//      }
//
//      private WritableMap createNotification(final String address, final String status, final String description) {
//        Log.d("CARDINALE", "createNotification " + Thread.currentThread().getId() + "," + status + " " + address);
//        WritableMap map = Arguments.createMap();
//        map.putString("uuid", deviceUUID);
//        map.putString("alternativeUUID", alternativeUUID);
//        map.putString("status", status);
//        map.putString("description", description);
//        return map;
//      }
//
//      @Override
//      public void onDeviceConnecting(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_CONNECTING, "Connecting to the remote device.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDeviceConnected(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_CONNECTED, "Remote device connected.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDfuProcessStarting(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_STARTING, "Initializing DFU procedure.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDfuProcessStarted(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_STARTED, "DFU Procedure started.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onEnablingDfuMode(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, "Enabling DFU interface on remote device.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onProgressChanged(@NonNull final String deviceAddress, final int percent, final float speed, final float avgSpeed, final int currentPart, final int partsTotal) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_UPLOADING, "Uploading firmware onto remote device.");
//        map.putInt("progress", percent);
//        map.putDouble("currentSpeedBytesPerSecond", speed);
//        map.putDouble("avgSpeedBytesPerSecond", avgSpeed);
//        map.putInt("part", currentPart);
//        map.putInt("totalParts", partsTotal);
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onFirmwareValidating(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_VALIDATING, "Validating firmware.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDeviceDisconnecting(final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, "Disconnecting from remote device.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDeviceDisconnected(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED, "Remote device disconnected.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//      }
//
//      @Override
//      public void onDfuCompleted(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_COMPLETED, "DFU Procedure successfully completed.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//        parent.operationFinished();
//      }
//
//      @Override
//      public void onDfuAborted(@NonNull final String deviceAddress) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//        parent.operationFinished();
//      }
//
//      @Override
//      public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
//        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
//        map.putString("error", message);
//        map.putInt("errorCode", error);
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
//        parent.operationFinished();
//      }
//    }

    @Override
    public void onHostResume() {
      Log.d("CARDINALE", "onHostResume " + Thread.currentThread().getId());
//      DfuServiceListenerHelper.registerProgressListener(reactContext, dfuProgressListener);
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
      Log.d("CARDINALE", "onHostDestroy " + Thread.currentThread().getId());
//      DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuProgressListener);
    }
  }

  @Override
  public void run() {
    try {
      while (true) {
        while (!this.operationQueue.isEmpty()) {
          Log.d("CARDINALE", "waiting for semaphore");
          this.semaphore.acquire(); // Acquire a permit from the semaphore
          Log.d("CARDINALE", " semaphore acquired ");
          Dfu.DfuOperation operation = operationQueue.poll().operation;
          int slot = this.index.getValue();
          Log.d("CARDINALE", "operation gets slot:" + slot);
          switch (slot) {
            case 0:
              operation.setDfuServiceClass(DfuService1.class);
              break;
            case 1:
              operation.setDfuServiceClass(DfuService2.class);
              break;
            case 2:
              operation.setDfuServiceClass(DfuService3.class);
              break;
          }
          this.index.increment();
          this.executorService.execute(operation);
          Log.d("CARDINALE", "op submitted to the pool");
        }
        Log.d("CARDINALE", "queue empty wait for 1 second ");
        Thread.sleep(1000); // Pause the thread for 1 second
      }
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }


  private static String getIncrementedAddress(@NonNull final String deviceAddress) {
    final String firstBytes = deviceAddress.substring(0, 15);
    final String lastByte = deviceAddress.substring(15); // assuming that the device address is correct
    final String lastByteIncremented = String.format(Locale.US, "%02X", (Integer.valueOf(lastByte, 16) + 1) & 0xFF);
    return firstBytes + lastByteIncremented;
  }

  public void submit(String address, String path, String type, ReadableMap options) {
    Log.d("CARDINALE", "submitting dfu operation for " + address);
    final DfuElement element = new DfuElement();
    element.uuid = address;
    String alternativeUUID = getIncrementedAddress(address);
    element.operation = new DfuOperation(address, alternativeUUID, path, type, options);
    operationQueue.add(element);
  }

  public void pauseDfu(String address) {
    DfuServiceController controller = null;
    for (DfuElement element : this.operationQueue) {
      if (element.uuid.compareToIgnoreCase(address) == 0) {
        controller = element.operation.getController();
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      args.putString("error", "DFU controller undefined");
      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
      return;
    }
    if (!controller.isPaused()) {
      controller.pause();
    }
    WritableMap args = Arguments.createMap();
    args.putString("uuid", address);
    args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
  }

  public void resumeDfu(String address) {
    DfuServiceController controller = null;
    for (DfuElement element : this.operationQueue) {
      if (element.uuid.compareToIgnoreCase(address) == 0) {
        controller = element.operation.getController();
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      args.putString("error", "DFU controller undefined");
      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
      return;
    }
    if (controller.isPaused()) {
      controller.resume();
    }
    WritableMap args = Arguments.createMap();
    args.putString("uuid", address);
    args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
  }

  public void abortDfu(String address) {
    DfuServiceController controller = null;
    for (DfuElement element : this.operationQueue) {
      if (element.uuid.compareToIgnoreCase(address) == 0) {
        controller = element.operation.getController();
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      args.putString("error", "DFU controller undefined");
      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
      return;
    }
    if (!controller.isAborted()) {
      controller.abort();
    }
    /// I do not send event "aborted" here. The notification will arrive from DfuProgressListener
  }
}
