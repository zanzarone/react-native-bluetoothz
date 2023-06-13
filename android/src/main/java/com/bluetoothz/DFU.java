package com.bluetoothz;

import static com.bluetoothz.BluetoothzModule.BLE_PERIPHERAL_DFU_PROCESS_FAILED;
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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;

class DFUInfo {
  public String deviceUUID;
  public String alternateUUID;
  public String path;
  public String type;
  public ReadableMap options;

  public DFUInfo(String deviceUUID,String alternateUUID, String path, String type, ReadableMap options) {
    this.deviceUUID = deviceUUID;
    this.alternateUUID = alternateUUID;
    this.path = path;
    this.type = type;
    this.options = options;
  }
}

class OperationCount {
  private int sharedInt = 0;

  public synchronized void increment() {
    sharedInt++;
  }

  public synchronized void decrement() {
    sharedInt--;
  }

  public synchronized int getValue() {
    return sharedInt;
  }
}


public class DFU {
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  public static final int DEFAULT_POOL_SIZE = 3; /// Massima dimensione dell pool
  private ExecutorService executorService; /// Pool delle operazioni
  private ReactApplicationContext reactContext; /// Contesto React della app, viene passato come parametro.
  private OperationCount count;

  public DFU(ReactApplicationContext ctx, int poolSize) {
    this.reactContext = ctx;
    this.executorService = Executors.newFixedThreadPool(poolSize <= 0 ? DEFAULT_POOL_SIZE : poolSize);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }

  public DFU(ReactApplicationContext ctx) {
    this(ctx, DEFAULT_POOL_SIZE);
  }


  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  private class DFUOperation implements Runnable, LifecycleEventListener {
    private DFUInfo dfuInfo;
    private DfuServiceController controller;

    private DfuProgressListener dfuProgressListener;

    public DFUOperation(DFUInfo info) {
      this.dfuInfo = info;
      this.dfuProgressListener = new DfuProgressListener(this);
    }

    @Override
    public void onHostResume() {
      DfuServiceListenerHelper.registerProgressListener(reactContext, dfuProgressListener);
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
      DfuServiceListenerHelper.unregisterProgressListener(reactContext, dfuProgressListener);
    }

    public void deleteLifecycleEventListener() {
      reactContext.removeLifecycleEventListener(this);
      count.decrement();
    }

    class DfuProgressListener extends DfuProgressListenerAdapter {
      private DFUOperation operation;

      public DfuProgressListener(DFUOperation operation) {
        this.operation = operation;
      }

      private WritableMap createNotification(final String status, final String description) {
        WritableMap map = Arguments.createMap();
        map.putString("uuid", dfuInfo.deviceUUID);
        map.putString("alternateUUID", dfuInfo.alternateUUID);
        map.putString("status", status);
        map.putString("description", description);
        return map;
      }

      @Override
      public void onDeviceConnecting(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_CONNECTING, "Connecting to the remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceConnected(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_CONNECTED, "Remote device connected.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuProcessStarting(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_STARTING, "Initializing DFU procedure.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuProcessStarted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_STARTED, "DFU Procedure started.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onEnablingDfuMode(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, "Enabling DFU interface on remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onProgressChanged(@NonNull final String deviceAddress, final int percent, final float speed, final float avgSpeed, final int currentPart, final int partsTotal) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_UPLOADING, "Uploading firmware onto remote device.");
        map.putInt("progress", percent);
        map.putDouble("currentSpeedBytesPerSecond", speed);
        map.putDouble("avgSpeedBytesPerSecond", avgSpeed);
        map.putInt("part", currentPart);
        map.putInt("totalParts", partsTotal);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onFirmwareValidating(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_VALIDATING, "Validating firmware.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceDisconnecting(final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, "Disconnecting from remote device.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDeviceDisconnected(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED, "Remote device disconnected.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
      }

      @Override
      public void onDfuCompleted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_COMPLETED, "DFU Procedure successfully completed.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        this.operation.deleteLifecycleEventListener();
      }

      @Override
      public void onDfuAborted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        this.operation.deleteLifecycleEventListener();
      }

      @Override
      public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
        WritableMap map = createNotification( BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
        map.putString("error", message);
        map.putInt("errorCode", error);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        this.operation.deleteLifecycleEventListener();
      }
    }

    @Override
    public void run() {
      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(this.dfuInfo.deviceUUID);
      serviceInitiator.setKeepBond(false);
      serviceInitiator.setPacketsReceiptNotificationsValue(1);
      serviceInitiator.setPrepareDataObjectDelay(300L);
      if (this.dfuInfo.options.hasKey(DFU_OPTION_PACKET_DELAY)) {
        serviceInitiator.setPrepareDataObjectDelay(this.dfuInfo.options.getInt(DFU_OPTION_PACKET_DELAY));
      }
      serviceInitiator.setUnsafeExperimentalButtonlessServiceInSecureDfuEnabled(true);
      switch (this.dfuInfo.type) {
        case FILE_PATH_TYPE_STRING:
          serviceInitiator.setZip(this.dfuInfo.path);
          break;
        case FILE_PATH_TYPE_URL:
          Uri uri = Uri.parse(this.dfuInfo.path);
          serviceInitiator.setZip(uri);
          break;
      }
      controller = serviceInitiator.start(reactContext, LocalDfuService.class);
    }
  }

  public void submit(String address, String alternateAddress, String path, String type, ReadableMap options) {
    if (this.count.getValue() + 1 > 3) {
      return;
    }
    this.count.increment();
    final DFUInfo info = new DFUInfo(address, alternateAddress, path, type, options);
    this.executorService.execute(new DFUOperation(info));
  }
}
