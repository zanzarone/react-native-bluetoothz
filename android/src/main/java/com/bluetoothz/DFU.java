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
import static com.bluetoothz.BluetoothzModule.DFU_OPTION_RETRIES_NUMBER;
import static com.bluetoothz.BluetoothzModule.DFU_OPTION_REBOOTING_TIME;

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

import java.util.ArrayList;
import java.util.Locale;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

import no.nordicsemi.android.dfu.DfuBaseService;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;

class DfuQueueIndex {
  private int sharedInt;

  public synchronized void increment() {
    sharedInt++;
  }

  public synchronized int getValue() {
    return sharedInt % 3;
  }
}

class Dfu extends Thread implements LifecycleEventListener {
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  private ReactApplicationContext reactContext; /// Contesto React della app, viene passato come parametro.
  private ExecutorService executorService;
  private ConcurrentLinkedQueue<DfuOperation> operationQueue;
  private Semaphore semaphore;
  private DfuQueueIndex index;

  private Object mutex; // Mutex object for synchronization

  private static String getIncrementedAddress(@NonNull final String deviceAddress) {
    final String firstBytes = deviceAddress.substring(0, 15);
    final String lastByte = deviceAddress.substring(15); // assuming that the device address is correct
    final String lastByteIncremented = String.format(Locale.US, "%02X", (Integer.valueOf(lastByte, 16) + 1) & 0xFF);
    return firstBytes + lastByteIncremented;
  }

  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  @Override
  public void onHostResume() {
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
    for (DfuOperation op : this.operationQueue) {
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, op.dfuMainDeviceProgressListeners);
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, op.dfuAlternativeDeviceProgressListeners);
    }
  }

  public Dfu(ReactApplicationContext ctx) {
    this.reactContext = ctx;
    this.operationQueue = new ConcurrentLinkedQueue<>();
    this.executorService = Executors.newFixedThreadPool(3); // Adjust the pool size as per your requirement
    this.semaphore = new Semaphore(3); // Number of operations allowed to execute simultaneously
    this.reactContext.addLifecycleEventListener(this);
    this.index = new DfuQueueIndex();
    this.mutex = new Object();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }

  class DfuOperation implements Runnable {
    public String deviceUUID;
    public String alternativeUUID;
    private String path;
    private String type;
    private ReadableMap options;
    private Class<? extends DfuBaseService> dfuServiceClass;
    private DfuServiceController controller;
    private int errorCode;
    private int retriesCount;
    private DfuProgressListener dfuMainDeviceProgressListeners;
    private DfuProgressListener dfuAlternativeDeviceProgressListeners;
    private Object mutex;

    private void waitOperation() {
      synchronized (mutex) {
        try {
          mutex.wait(); // Release the lock and wait for notification
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }

    private void releaseOperation() {
      synchronized (mutex) {
        mutex.notifyAll();
      }
    }

    public DfuOperation(String deviceUUID, String alternativeUUID, String path, String type, ReadableMap options) {
      this.deviceUUID = deviceUUID;
      this.alternativeUUID = alternativeUUID;
      this.path = path;
      this.type = type;
      this.options = options;
      this.errorCode = 0;
      this.retriesCount = 1;
    }

    public DfuServiceController getController() {
      return controller;
    }

    public void setDfuServiceClass(Class<? extends DfuBaseService> dfuServiceClass) {
      this.dfuServiceClass = dfuServiceClass;
    }

    private void initDFU(String address) {
      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(address);
      serviceInitiator.setKeepBond(false);
      serviceInitiator.setPacketsReceiptNotificationsValue(1);
      if (this.options.hasKey(DFU_OPTION_PACKET_DELAY)) {
        serviceInitiator.setPrepareDataObjectDelay(this.options.getInt(DFU_OPTION_PACKET_DELAY));
      }
      if (this.options.hasKey(DFU_OPTION_REBOOTING_TIME)) {
        serviceInitiator.setRebootTime(this.options.getInt(DFU_OPTION_REBOOTING_TIME));
      }
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
      this.controller = serviceInitiator.start(reactContext, dfuServiceClass);
    }

    @Override
    public void run() {
      this.mutex = new Object();
      this.dfuMainDeviceProgressListeners = new DfuProgressListener();
      this.dfuAlternativeDeviceProgressListeners = new DfuProgressListener();
      DfuServiceListenerHelper.registerProgressListener(reactContext, this.dfuMainDeviceProgressListeners, this.deviceUUID);
      DfuServiceListenerHelper.registerProgressListener(reactContext, this.dfuAlternativeDeviceProgressListeners, this.alternativeUUID);
      if (this.options.hasKey(DFU_OPTION_RETRIES_NUMBER)) {
        this.retriesCount = this.options.getInt(DFU_OPTION_RETRIES_NUMBER) + 1;
      }

//      while (this.retriesCount > 0) {
        initDFU(this.deviceUUID);
        waitOperation();
        Log.d("cazzola", ""+this.errorCode);
        if (this.errorCode == DfuBaseService.ERROR_DEVICE_DISCONNECTED) {
          Log.d("cazzola 1", ""+this.errorCode);
  //          break;
          initDFU(this.alternativeUUID);
          waitOperation();
        } else {
          Log.d("cazzola 2", ""+this.errorCode);
  //          break;
        }
//        this.errorCode = 0;
//        this.retriesCount--;
//      }
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuMainDeviceProgressListeners);
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuAlternativeDeviceProgressListeners);
      ///
      semaphore.release();
    }

    class DfuProgressListener extends DfuProgressListenerAdapter {

      private WritableMap createNotification(final String uuid, final String alternativeUUID, final String status, final String description) {
        WritableMap map = Arguments.createMap();
        map.putString("uuid", uuid);
        map.putString("alternativeUUID", alternativeUUID);
        map.putString("status", status);
        map.putString("description", description);
        return map;
      }

      @Override
      public void onDeviceConnecting(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_CONNECTING, "Connecting to the remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceConnected(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_CONNECTED, "Remote device connected.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuProcessStarting(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_STARTING, "Initializing DFU procedure.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuProcessStarted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_STARTED, "DFU Procedure started.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onEnablingDfuMode(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, "Enabling DFU interface on remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onProgressChanged(@NonNull final String deviceAddress, final int percent, final float speed, final float avgSpeed, final int currentPart, final int partsTotal) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_UPLOADING, "Uploading firmware onto remote device.");
        map.putInt("progress", percent);
        map.putDouble("currentSpeedBytesPerSecond", speed);
        map.putDouble("avgSpeedBytesPerSecond", avgSpeed);
        map.putInt("part", currentPart);
        map.putInt("totalParts", partsTotal);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onFirmwareValidating(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_VALIDATING, "Validating firmware.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceDisconnecting(final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, "Disconnecting from remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceDisconnected(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED, "Remote device disconnected.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuCompleted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_COMPLETED, "DFU Procedure successfully completed.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        releaseOperation();
      }

      @Override
      public void onDfuAborted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        releaseOperation();
      }

      @Override
      public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
        WritableMap map = createNotification(deviceUUID, alternativeUUID, BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
        map.putString("error", message);
        map.putInt("errorCode", error);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        errorCode = error;
        releaseOperation();
      }
    }
  }

  @Override
  public void run() {
    while (true) {
      synchronized (mutex) {
        try {
          while (this.operationQueue.isEmpty()) {
            mutex.wait();
          }
          if (this.semaphore.tryAcquire(5, TimeUnit.SECONDS)) {
            // Acquire a permit from the semaphore
            Dfu.DfuOperation operation = operationQueue.poll();
            int slot = this.index.getValue();
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
          }
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }
  }


  public void submit(String address, String path, String type, ReadableMap options) {
    synchronized (mutex) {
      final DfuOperation operation = new DfuOperation(address, getIncrementedAddress(address), path, type, options);
      operationQueue.add(operation);
      mutex.notifyAll();
    }
  }

  public void pauseDfu(String address) {
    DfuServiceController controller = null;
    String alternativeUUID = null;
    for (DfuOperation operation : this.operationQueue) {
      if (operation.deviceUUID.compareToIgnoreCase(address) == 0 || operation.alternativeUUID.compareToIgnoreCase(address) == 0) {
        controller = operation.getController();
        alternativeUUID = operation.alternativeUUID;
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      if (alternativeUUID != null)
        args.putString("alternativeUUID", alternativeUUID);
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
    if (alternativeUUID != null)
      args.putString("alternativeUUID", alternativeUUID);
    args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
  }

  public void resumeDfu(String address) {
    DfuServiceController controller = null;
    String alternativeUUID = null;
    for (DfuOperation operation : this.operationQueue) {
      if (operation.deviceUUID.compareToIgnoreCase(address) == 0 || operation.alternativeUUID.compareToIgnoreCase(address) == 0) {
        controller = operation.getController();
        alternativeUUID = operation.alternativeUUID;
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      if (alternativeUUID != null)
        args.putString("alternativeUUID", alternativeUUID);
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
    if (alternativeUUID != null)
      args.putString("alternativeUUID", alternativeUUID);
    args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
  }

  public void abortDfu(String address) {
    DfuServiceController controller = null;
    String alternativeUUID = null;
    for (DfuOperation operation : this.operationQueue) {
      if (operation.deviceUUID.compareToIgnoreCase(address) == 0 || operation.alternativeUUID.compareToIgnoreCase(address) == 0) {
        controller = operation.getController();
        alternativeUUID = operation.alternativeUUID;
      }
    }
    if (controller == null) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      if (alternativeUUID != null)
        args.putString("alternativeUUID", alternativeUUID);
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
