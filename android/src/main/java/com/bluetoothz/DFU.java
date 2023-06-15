package com.bluetoothz;

import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED;
import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_QUEUED;
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

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

import no.nordicsemi.android.dfu.DfuBaseService;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;

class OperationScheduler {
  private ConcurrentLinkedQueue<Dfu.DfuOperation> operationQueue;
  private ExecutorService executorService;
  private Semaphore semaphore;

  public OperationScheduler() {
    operationQueue = new ConcurrentLinkedQueue<>();
    executorService = Executors.newFixedThreadPool(3); // Adjust the pool size as per your requirement
    semaphore = new Semaphore(3); // Number of operations allowed to execute simultaneously
  }

  public void addOperation(Dfu.DfuOperation operation) {
    operationQueue.add(operation);
  }

  public void startScheduling() {
    while (!operationQueue.isEmpty()) {
      try {
        semaphore.acquire(); // Acquire a permit from the semaphore
        Dfu.DfuOperation operation = operationQueue.poll();
        executorService.execute(() -> {
          try {

          } finally {
            semaphore.release(); // Release the permit back to the semaphore
          }
        });
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
    executorService.shutdown();
  }
}

//class DfuMap {
//  public static final int DEFAULT_POOL_SIZE = 3; /// Massima dimensione dell pool
//  private ExecutorService operationThreadPool; /// Pool delle operazioni
//  private ConcurrentLinkedQueue<Dfu.DfuOperation> operationQueue;
////  private final Object lock = new Object(); // Lock object for synchronization
////  private boolean[] operationFreeSlots;
//
//  public DfuMap() {
//    this.operationQueue = new ConcurrentLinkedQueue<>();
//    this.operationThreadPool = Executors.newFixedThreadPool(DEFAULT_POOL_SIZE);
////    this.operationFreeSlots = new boolean[DEFAULT_POOL_SIZE]; // All the elements in the array will be initialized with the default value false.
//  }
//
//  private int getSlotAvailableIndex() {
//    int foundIndex = -1;
////    for (int i = 0; i < operationFreeSlots.length; i++)
////      if (operationFreeSlots[i])
////        foundIndex = i;
//    return foundIndex;
//  }
//
//  public boolean addSlot(Dfu.DfuOperation op) {
////    synchronized (lock) {
////      int slotIndex = getSlotAvailableIndex();
////      if (slotIndex < 0) {
////        operationQueue.add(op);
////        return false;
////      }
////      switch (slotIndex) {
////        case 0:
////          op.setDfuServiceClass(DfuService1.class);
////          break;
////        case 1:
////          op.setDfuServiceClass(DfuService2.class);
////          break;
////        case 2:
////          op.setDfuServiceClass(DfuService3.class);
////          break;
////      }
////      op.setSlotIndex(slotIndex);
////      operationFreeSlots[slotIndex] = false;
////      operationThreadPool.execute(op);
////      return true;
////    }
//  }
//
//  public void clearSlot(int slotIndex) {
////    synchronized (lock) {
////      operationFreeSlots[slotIndex] = true;
////    }
////    if (operationQueue.size() > 0) {
////      Dfu.DfuOperation op = operationQueue.remove();
////      addSlot(op);
////    }
//  }
//}

class Dfu {
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  //  private ExecutorService executorService; /// Pool delle operazioni
  private ReactApplicationContext reactContext; /// Contesto React della app, viene passato come parametro.
  private ExecutorService executorService;
  private ConcurrentLinkedQueue<Dfu.DfuOperation> operationQueue;
  private Semaphore semaphore;

  public Dfu(ReactApplicationContext ctx) {
    this.reactContext = ctx;
    this.map = new DfuMap();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }

  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    Log.d("CALVIN", "============> sendEvent");
  }

  class DfuOperation implements Runnable, LifecycleEventListener {
    public String deviceUUID;
    public String path;
    public String type;
    public ReadableMap options;
    public Class<? extends DfuBaseService> dfuServiceClass;
    private DfuServiceController controller;
    private DfuProgressListener dfuProgressListener;
    private int slotIndex;

    public DfuOperation(String deviceUUID, String path, String type, ReadableMap options) {
      this.deviceUUID = deviceUUID;
      this.path = path;
      this.type = type;
      this.options = options;
      this.dfuProgressListener = new DfuProgressListener(this);
      reactContext.addLifecycleEventListener(this);
    }

    public DfuServiceController getController() {
      return controller;
    }

    public void setDfuServiceClass(Class<? extends DfuBaseService> dfuServiceClass) {
      this.dfuServiceClass = dfuServiceClass;
    }

    public int getSlotIndex() {
      return slotIndex;
    }

    public void setSlotIndex(int slotIndex) {
      this.slotIndex = slotIndex;
    }

    private void operationFinished() {
      reactContext.removeLifecycleEventListener(this);
      map.clearSlot(this.slotIndex);
//      map.remove(dfuInfo.deviceUUID);
    }

    @Override
    public void run() {
      Log.d("DAZN", "th a " + Thread.currentThread().getId() + "[" + this.deviceUUID + "" + this.type + "]");
      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(this.deviceUUID);
      serviceInitiator.setKeepBond(false);
      serviceInitiator.setPacketsReceiptNotificationsValue(1);
      serviceInitiator.setPrepareDataObjectDelay(300L);
      serviceInitiator.setForeground(false);
      if (this.options.hasKey(DFU_OPTION_PACKET_DELAY)) {
        serviceInitiator.setPrepareDataObjectDelay(this.options.getInt(DFU_OPTION_PACKET_DELAY));
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
      Log.d("DAZN", "th run b " + Thread.currentThread().getId());
      this.controller = serviceInitiator.start(reactContext, dfuServiceClass);
    }

    class DfuProgressListener extends DfuProgressListenerAdapter {
      DfuOperation parent;

      public DfuProgressListener(DfuOperation parent) {
        this.parent = parent;
      }

      private WritableMap createNotification(final String address, final String status, final String description) {
        Log.d("DAZN", "createNotification " + Thread.currentThread().getId() + "," + status + " " + address);
        WritableMap map = Arguments.createMap();
        map.putString("uuid", deviceUUID);
        if (address.compareToIgnoreCase(deviceUUID) != 0) {
          map.putString("alternativeUUID", address);
        }
        map.putString("status", status);
        map.putString("description", description);
        return map;
      }

      @Override
      public void onDeviceConnecting(@NonNull final String deviceAddress) {
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
        parent.operationFinished();
      }

      @Override
      public void onDfuAborted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        parent.operationFinished();
      }

      @Override
      public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
        map.putString("error", message);
        map.putInt("errorCode", error);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        parent.operationFinished();
      }
    }

    @Override
    public void onHostResume() {
      Log.d("DAZN", "onHostResume " + Thread.currentThread().getId());
      DfuServiceListenerHelper.registerProgressListener(reactContext, dfuProgressListener);
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
      Log.d("DAZN", "onHostDestroy " + Thread.currentThread().getId());
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuProgressListener);
    }
  }

  public void submit(String address, String path, String type, ReadableMap options) {
    final DfuOperation operation = new DfuOperation(address, path, type, options);
    if (!this.map.addSlot(operation)) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_QUEUED);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
    }
  }

  public void pauseDfu(String address) {
//    if (map.containsKey(address)) {
//      DfuServiceController controller = map.get(address).getController();
//      if (controller == null) {
//        WritableMap args = Arguments.createMap();
//        args.putString("uuid", address);
//        args.putString("error", "DFU controller undefined");
//        args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED);
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
//        return;
//      }
//      if (!controller.isPaused()) {
//        controller.pause();
//      }
//      WritableMap args = Arguments.createMap();
//      args.putString("uuid", address);
//      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
//      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
//    }
  }

  public void resumeDfu(String address) {
//    if (map.containsKey(address)) {
//      DfuServiceController controller = map.get(address).getController();
//      if (controller == null) {
//        WritableMap args = Arguments.createMap();
//        args.putString("uuid", address);
//        args.putString("error", "DFU controller undefined");
//        args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED);
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
//        return;
//      }
//      if (controller.isPaused()) {
//        controller.resume();
//      }
//      WritableMap args = Arguments.createMap();
//      args.putString("uuid", address);
//      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
//      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
//    }
  }

  public void abortDfu(String address) {
//    if (map.containsKey(address)) {
//      DfuServiceController controller = map.get(address).getController();
//      if (controller == null) {
//        WritableMap args = Arguments.createMap();
//        args.putString("uuid", address);
//        args.putString("error", "DFU controller undefined");
//        args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED);
//        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
//        return;
//      }
//      if (!controller.isAborted()) {
//        controller.abort();
//      }
    /// I do not send event "aborted" here. The notification will arrive from DfuProgressListener
//  }
  }
}
