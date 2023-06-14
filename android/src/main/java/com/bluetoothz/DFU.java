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

import android.app.Activity;
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

import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import no.nordicsemi.android.dfu.DfuBaseService;
import no.nordicsemi.android.dfu.DfuController;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;
import okhttp3.Call;

class DfuInfo {
  public String deviceUUID;
  public String path;
  public String type;
  public ReadableMap options;
  public Class<? extends DfuBaseService> dfuServiceClass;

  public DfuInfo(String deviceUUID, String path, String type, ReadableMap options, Class<? extends DfuBaseService> dfuServiceClass) {
    this.deviceUUID = deviceUUID;
    this.path = path;
    this.type = type;
    this.options = options;
    this.dfuServiceClass = dfuServiceClass;
  }
}
//class DfuOperationCount {
//  private int sharedInt = 0;
//  public synchronized void increment() {
//    sharedInt++;
//  }
//  public synchronized void decrement() {
//    sharedInt--;
//  }
//  public synchronized int getValue() {
//    return sharedInt;
//  }
//}

public class Dfu {
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  public static final int DEFAULT_POOL_SIZE = 3; /// Massima dimensione dell pool
  private ExecutorService executorService; /// Pool delle operazioni
  private ReactApplicationContext reactContext; /// Contesto React della app, viene passato come parametro.
  ConcurrentMap<String, DfuServiceController> map;

  public Dfu(ReactApplicationContext ctx, int poolSize) {
//    this.count = new DfuOperationCount();
    this.reactContext = ctx;
    this.executorService = Executors.newFixedThreadPool(poolSize <= 0 ? DEFAULT_POOL_SIZE : poolSize);
//    this.reactContext.addLifecycleEventListener(this);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }
  public Dfu(ReactApplicationContext ctx) {
    this(ctx, DEFAULT_POOL_SIZE);
  }
//  public static String incrementUUID(String uuidString) {
//    UUID uuid = UUID.fromString(uuidString);
//    long msb = uuid.getMostSignificantBits();
//    long lsb = uuid.getLeastSignificantBits() + 1;
//    UUID incrementedUUID = new UUID(msb, lsb);
//    return incrementedUUID.toString();
//  }

  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    Log.d("CALVIN", "============> sendEvent");
  }

  private class DfuOperation implements Callable<DfuServiceController>, LifecycleEventListener
  {
    private DfuInfo dfuInfo;

    private DfuServiceController controller;

    private DfuProgressListener dfuProgressListener;

    public DfuOperation(DfuInfo info) {
      this.dfuInfo = info;
      this.dfuProgressListener = new DfuProgressListener(this);
      reactContext.addLifecycleEventListener(this);
    }

    private void removeLifecycleEventListener() {
      reactContext.removeLifecycleEventListener(this);
    }

    @Override
    public DfuServiceController call() {
      Log.d("DAZN", "th a " + Thread.currentThread().getId() + "[" + this.dfuInfo.deviceUUID + "" + this.dfuInfo.type + "]");
      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(this.dfuInfo.deviceUUID);
      serviceInitiator.setKeepBond(false);
      serviceInitiator.setPacketsReceiptNotificationsValue(1);
      serviceInitiator.setPrepareDataObjectDelay(300L);
      serviceInitiator.setForeground(false);
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
      Log.d("DAZN", "th run b " + Thread.currentThread().getId());
      return serviceInitiator.start(reactContext, dfuInfo.dfuServiceClass);
    }

    class DfuProgressListener extends DfuProgressListenerAdapter {
      DfuOperation parent;

      public DfuProgressListener(DfuOperation parent) {
        this.parent = parent;
      }

      private WritableMap createNotification(final String address, final String status, final String description) {
        Log.d("DAZN", "createNotification " + Thread.currentThread().getId() + "," + status + " " + address);
        WritableMap map = Arguments.createMap();
        map.putString("uuid", dfuInfo.deviceUUID);
        if(address.compareToIgnoreCase(dfuInfo.deviceUUID) != 0){
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
        parent.removeLifecycleEventListener();
      }

      @Override
      public void onDfuAborted(@NonNull final String deviceAddress) {
        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_STATUS_ABORTED, "DFU Procedure aborted by the user.");
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        parent.removeLifecycleEventListener();
      }

      @Override
      public void onError(@NonNull final String deviceAddress, final int error, final int errorType, final String message) {
        WritableMap map = createNotification(deviceAddress, BLE_PERIPHERAL_DFU_PROCESS_FAILED, message);
        map.putString("error", message);
        map.putInt("errorCode", error);
        sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
        parent.removeLifecycleEventListener();
      }
    }

//    @Override
//    public void run() {
//      Log.d("DAZN", "th a " + Thread.currentThread().getId() + "[" + this.dfuInfo.deviceUUID + "" + this.dfuInfo.type + "]");
//      final DfuServiceInitiator serviceInitiator = new DfuServiceInitiator(this.dfuInfo.deviceUUID);
//      serviceInitiator.setKeepBond(false);
//      serviceInitiator.setPacketsReceiptNotificationsValue(1);
//      serviceInitiator.setPrepareDataObjectDelay(300L);
//      serviceInitiator.setForeground(false);
//      if (this.dfuInfo.options.hasKey(DFU_OPTION_PACKET_DELAY)) {
//        serviceInitiator.setPrepareDataObjectDelay(this.dfuInfo.options.getInt(DFU_OPTION_PACKET_DELAY));
//      }
//      serviceInitiator.setUnsafeExperimentalButtonlessServiceInSecureDfuEnabled(true);
//      switch (this.dfuInfo.type) {
//        case FILE_PATH_TYPE_STRING:
//          serviceInitiator.setZip(this.dfuInfo.path);
//          break;
//        case FILE_PATH_TYPE_URL:
//          Uri uri = Uri.parse(this.dfuInfo.path);
//          serviceInitiator.setZip(uri);
//          break;
//      }
//      controller = serviceInitiator.start(reactContext, dfuInfo.dfuServiceClass);
//      Log.d("DAZN", "th run b " + Thread.currentThread().getId());
//    }

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

  public void submit(String address, String alternateAddress, String path, String type, ReadableMap options) {
    Log.d("DAZN", "submit a " + Thread.currentThread().getId() + "[" + address + "" + alternateAddress + "" + path + "" + type + "]");
    final DfuInfo info = new DfuInfo(address, path, type, options, DFUServiceMain.class);
    Log.d("DAZN", "submit b " + Thread.currentThread().getId() + info.dfuServiceClass);
    Future<DfuServiceController> result = executorService.submit(new DfuOperation(info));
    try {
      DfuServiceController controller = result.get(); // Ottieni il risultato del task
      map.put(address, controller);
    } catch (InterruptedException | ExecutionException e) {
      WritableMap args = Arguments.createMap();
      args.putString("uuid", address);
      args.putString("status", BLE_PERIPHERAL_DFU_PROCESS_FAILED);
      args.putString("error", e.getMessage());
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, args);
    }
  }
}
