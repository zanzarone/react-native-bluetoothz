package com.bluetoothz;

import static android.bluetooth.BluetoothProfile.GATT;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.ParcelUuid;
import android.util.Log;
import android.util.Pair;

import no.nordicsemi.android.dfu.DfuBaseService;
import no.nordicsemi.android.dfu.DfuProgressListener;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;
//import no.nordicsemi.android.dfu.Lif;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

public class BluetoothzModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static final String Characteristic_User_Description = "00002901-0000-1000-8000-00805f9b34fb";
  private static final String Client_Characteristic_Configuration = "00002902-0000-1000-8000-00805f9b34fb";
  public static final String BLE_ADAPTER_STATUS_DID_UPDATE = "BLE_ADAPTER_STATUS_DID_UPDATE";
  public static final String BLE_ADAPTER_STATUS_INVALID = "BLE_ADAPTER_STATUS_INVALID";
  public static final String BLE_ADAPTER_STATUS_POWERED_ON = "BLE_ADAPTER_STATUS_POWERED_ON";
  public static final String BLE_ADAPTER_STATUS_POWERED_OFF = "BLE_ADAPTER_STATUS_POWERED_OFF";
  public static final String BLE_ADAPTER_STATUS_UNKNOW = "BLE_ADAPTER_STATUS_UNKNOW";
  public static final String BLE_ADAPTER_SCAN_START = "BLE_ADAPTER_SCAN_START";
  public static final String BLE_ADAPTER_SCAN_END = "BLE_ADAPTER_SCAN_END";
  public static final String BLE_PERIPHERAL_FOUND = "BLE_PERIPHERAL_FOUND";
  public static final String BLE_PERIPHERAL_READY = "BLE_PERIPHERAL_READY";
  public static final String BLE_PERIPHERAL_CONNECTED = "BLE_PERIPHERAL_CONNECTED";
  public static final String BLE_PERIPHERAL_DISCONNECTED = "BLE_PERIPHERAL_DISCONNECTED";
  public static final String BLE_PERIPHERAL_CONNECT_FAILED = "BLE_PERIPHERAL_CONNECT_FAILED";
  public static final String BLE_PERIPHERAL_DISCONNECT_FAILED = "BLE_PERIPHERAL_DISCONNECT_FAILED";
  public static final String BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED = "BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED = "BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE = "BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_OK = "BLE_PERIPHERAL_CHARACTERISTIC_READ_OK";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED";
  public static final String BLE_PERIPHERAL_NOTIFICATION_UPDATES = "BLE_PERIPHERAL_NOTIFICATION_UPDATES";
  public static final String BLE_PERIPHERAL_NOTIFICATION_CHANGED = "BLE_PERIPHERAL_NOTIFICATION_CHANGED";
  public static final String BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED = "BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED";

  public static final String BLE_PERIPHERAL_DFU_COMPLIANT = "BLE_PERIPHERAL_DFU_COMPLIANT";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_STARTED = "BLE_PERIPHERAL_DFU_PROCESS_STARTED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_PAUSED = "BLE_PERIPHERAL_DFU_PROCESS_PAUSED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_RESUMED = "BLE_PERIPHERAL_DFU_PROCESS_RESUMED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROGRESS = "BLE_PERIPHERAL_DFU_PROGRESS";
  public static final String BLE_PERIPHERAL_DFU_DEBUG = "BLE_PERIPHERAL_DFU_DEBUG";
  public static final String BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE = "BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE";
  public static final String BLE_PERIPHERAL_DFU_STATUS_ABORTED = "BLE_PERIPHERAL_DFU_STATUS_ABORTED";
  public static final String BLE_PERIPHERAL_DFU_STATUS_STARTING = "BLE_PERIPHERAL_DFU_STATUS_STARTING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_STARTED = "BLE_PERIPHERAL_DFU_STATUS_STARTED";
  public static final String BLE_PERIPHERAL_DFU_STATUS_COMPLETED = "BLE_PERIPHERAL_DFU_STATUS_COMPLETED";
  public static final String BLE_PERIPHERAL_DFU_STATUS_UPLOADING = "BLE_PERIPHERAL_DFU_STATUS_UPLOADING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_CONNECTING = "BLE_PERIPHERAL_DFU_STATUS_CONNECTING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_CONNECTED = "BLE_PERIPHERAL_DFU_STATUS_CONNECTED";
  public static final String BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED = "BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED";
  public static final String BLE_PERIPHERAL_DFU_STATUS_SCANNING = "BLE_PERIPHERAL_DFU_STATUS_SCANNING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_DFU_INTERFACE_FOUND = "BLE_PERIPHERAL_DFU_STATUS_DFU_INTERFACE_FOUND";
  public static final String BLE_PERIPHERAL_DFU_STATUS_VALIDATING = "BLE_PERIPHERAL_DFU_STATUS_VALIDATING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING = "BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING";
  public static final String BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU = "BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU";
  //
  public static final String DFU_OPTION_ENABLE_DEBUG = "DFU_OPTION_ENABLE_DEBUG";
  public static final String DFU_OPTION_PACKET_DELAY = "DFU_OPTION_PACKET_DELAY";
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  private static final String DFU_SERVICE_UUID = "0000fe59";


  private BluetoothAdapter bluetoothAdapter;
  private BluetoothManager bluetoothManager;
  private String filter;
  private boolean allowDuplicates = false;
  private int listenerCount = 0;
  private ReactApplicationContext reactContext;
  private LocalBroadcastReceiver mLocalBroadcastReceiver;
  private LocalScanCallback mScanCallback;
  private LocalBluetoothGattCallback mBluetoothGATTCallback;
  private LocalDfuProgressListener mLocalDfuProgressListener;
  private HashMap<String, Peripheral> mPeripherals;
  public static DfuHelper mDfuHelper;
  private SyncHelper mSyncHelper;
  private CountDownTimer keepAliveTimer;

  static {
    // Static initializer block
    mDfuHelper = new DfuHelper();
  }

  private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

  public BluetoothzModule(ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
    this.mPeripherals = new HashMap<>();
    this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
    this.mScanCallback = new LocalScanCallback();
    this.mBluetoothGATTCallback = new LocalBluetoothGattCallback();
    this.mLocalDfuProgressListener = new LocalDfuProgressListener();
    this.reactContext.registerReceiver(mLocalBroadcastReceiver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    this.mSyncHelper = new SyncHelper();
    /**
     ================================================================================================================
     =============================================== DFU ============================================================
     ================================================================================================================
     */
    this.reactContext.addLifecycleEventListener(this);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      DfuServiceInitiator.createDfuNotificationChannel(reactContext);
    }
  }

  private static String bytesToHex(byte[] bytes) {
    byte[] hexChars = new byte[bytes.length * 2];
    for (int j = 0; j < bytes.length; j++) {
      int v = bytes[j] & 0xFF;
      hexChars[j * 2] = HEX_ARRAY[v >>> 4];
      hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
    }
    return new String(hexChars, StandardCharsets.UTF_8);
  }

  public class LocalBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      // It means the user has changed his bluetooth state.
      if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
        BluetoothzModule.sendBleStatus(bluetoothAdapter.getState(), reactContext);
      }
    }
  }

  private class SyncHelper {
    public Promise disconnectPromise;
    public Promise connectPromise;
    public Promise scanPromise;
    /// DFU PROPS
    public Promise dfuPromise;
  }

  private static class DfuHelper {
    public Boolean enableDebug = false;
    public String currentPeripheralId;
    //    public String firmwarePath;
    public DfuServiceInitiator serviceInitiator;
    public DfuServiceController controller;
  }


  // Device scan callback.
  public class LocalScanCallback extends ScanCallback {
    @SuppressLint("MissingPermission")
    @Override
    public void onScanResult(int callbackType, ScanResult result) {
      BluetoothDevice device = result.getDevice();
      if (device.getName() != null && !device.getName().isEmpty()) {
        boolean niceFind = true;
        if (filter != null) {
          niceFind = device.getName().toLowerCase().contains(filter.toLowerCase());
        }
        if (niceFind && !allowDuplicates) {
          niceFind = !mPeripherals.containsKey(device.getAddress());
        }
        if (niceFind) {
          int rssi = result.getRssi();
          Peripheral peripheral = new Peripheral(device, rssi);
          mPeripherals.put(device.getAddress(), peripheral);
          if (mSyncHelper.scanPromise == null) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", device.getAddress());
            params.putString("name", device.getName());
            params.putInt("rssi", rssi);
            sendEvent(reactContext, BLE_PERIPHERAL_FOUND, params);
          }
        }
      }
    }
  }

  private class LocalBluetoothGattCallback extends BluetoothGattCallback {
    @SuppressLint("MissingPermission")
    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
      String uuid = gatt.getDevice().getAddress();
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      if (newState == BluetoothProfile.STATE_CONNECTED) {
//                Log.w("SAMUELE", "Device CONNECTED!!!!." + uuid);
        // Attempts to discover services after successful connection.
        if (mPeripherals.containsKey(gatt.getDevice().getAddress())) {
          Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
          p.setGattServer(gatt);
          p.setConnected(true);
          p.discover();
          if (mSyncHelper.connectPromise != null) {
            mSyncHelper.connectPromise.resolve(params);
          } else {
            sendEvent(reactContext, BLE_PERIPHERAL_CONNECTED, params);
          }
        } else {
          if (mSyncHelper.connectPromise != null) {
            mSyncHelper.disconnectPromise.reject(BLE_PERIPHERAL_CONNECT_FAILED, "Device fails to connect:" + uuid);
          } else {
            sendEvent(reactContext, BLE_PERIPHERAL_CONNECT_FAILED, params);
          }
        }
      } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
        // disconnected from the GATT Server
        if (mPeripherals.containsKey(gatt.getDevice().getAddress())) {
          Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
          p.flush();
          if (mSyncHelper.disconnectPromise != null) {
            mSyncHelper.disconnectPromise.resolve(params);
          } else {
            sendEvent(reactContext, BLE_PERIPHERAL_DISCONNECTED, params);
          }
        } else {
          if (mSyncHelper.disconnectPromise != null) {
            mSyncHelper.disconnectPromise.reject(BLE_PERIPHERAL_DISCONNECT_FAILED, "Device already disconnected:" + uuid);
          } else {
            sendEvent(reactContext, BLE_PERIPHERAL_DISCONNECT_FAILED, params);
          }
        }
      }
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
      if (status == BluetoothGatt.GATT_SUCCESS) {
        Log.w("SAMUELE", "onServicesDiscovered received: " + gatt.getDevice().getAddress());
        if (mPeripherals.containsKey(gatt.getDevice().getAddress())) {
          List<BluetoothGattService> services = gatt.getServices();
          Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
          for (BluetoothGattService service : services) {
            if (service.getUuid().toString().contains(DFU_SERVICE_UUID)) {
              p.setDfuCompliant(true);
              WritableMap params = Arguments.createMap();
              params.putString("uuid", gatt.getDevice().getAddress());
              params.putBoolean("compliant", true);
              Log.e("SAMUELE", "onServicesDiscovered received: " + status);
              sendEvent(reactContext, BLE_PERIPHERAL_DFU_COMPLIANT, params);
            }
            Log.i("SERVIZIOO", DFU_SERVICE_UUID + "=>" + service.getUuid().toString());
            List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
            for (BluetoothGattCharacteristic c : characteristics) {
                            Log.i("CARATT", "==>" + c.getUuid().toString());
              WritableMap params = Arguments.createMap();
              params.putString("uuid", gatt.getDevice().getAddress());
              params.putString("charUUID", c.getUuid().toString());
              sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, params);
              p.setCharacteristic(c);
            }
          }
          WritableMap params = Arguments.createMap();
          params.putString("uuid", gatt.getDevice().getAddress());
          params.putBoolean("dfuCompliant", p.isDfuCompliant());
          Log.e("SAMUELE", "onServicesDiscovered received: " + status);
          sendEvent(reactContext, BLE_PERIPHERAL_READY, params);
          p.mBluetoothGATT.requestMtu(512);
          p.mBluetoothGATT.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
        }
      } else {
        WritableMap params = Arguments.createMap();
        params.putString("uuid", gatt.getDevice().getAddress());
        Log.e("SAMUELE", "onServicesDiscovered received: " + status);
        sendEvent(reactContext, BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED, params);
      }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
      WritableMap params = Arguments.createMap();
      String uuid = gatt.getDevice().getAddress();
      String charUUID = characteristic.getUuid().toString();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      if (status == BluetoothGatt.GATT_SUCCESS) {
        WritableArray value = Arguments.createArray();
        byte[] buffer = characteristic.getValue();
        for (int i = 0; i < buffer.length; i++)
          value.pushInt(buffer[i]);
//                String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
        params.putArray("value", value);
        sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, params);
      } else {
        sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params);
      }
    }

    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
      WritableMap params = Arguments.createMap();
      String uuid = characteristic.getUuid().toString();
      String charUUID = characteristic.getUuid().toString();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      if (status == BluetoothGatt.GATT_SUCCESS) {
        String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
        params.putString("value", bufferString);
        sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, params);
      } else {
        sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params);
      }
    }

    @Override
    public void onCharacteristicChanged(
      BluetoothGatt gatt,
      BluetoothGattCharacteristic characteristic
    ) {
      WritableArray value = Arguments.createArray();
      byte[] buffer = characteristic.getValue();
      for (int i = 0; i < buffer.length; i++)
        value.pushInt(buffer[i]);
//            Log.d(" POPPI ", "" + bufferString);
      WritableMap params = Arguments.createMap();
      params.putString("uuid", gatt.getDevice().getAddress());
      params.putString("charUUID", characteristic.getUuid().toString());
      params.putArray("value", value);
      sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_UPDATES, params);
    }

    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
      Log.w("PORCO", BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE + ";;;;" + status + (descriptor.getValue() == BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE));
      if (status == BluetoothGatt.GATT_SUCCESS) {
      }
    }
  }

  public class KeepAliveTimer extends CountDownTimer {

    public KeepAliveTimer(long millisInFuture, long countDownInterval) {
      super(millisInFuture, countDownInterval);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onTick(long l) {
      Log.d("FORZA MILAN", "OK");
      if (bluetoothManager == null) {
        Log.d("FORZA MILAN", "ERRORE");
        return;
      }
      List<BluetoothDevice> connectedDevices = bluetoothManager.getConnectedDevices(GATT);
      for (BluetoothDevice device : connectedDevices) {
        Log.d("FORZA MILAN", "OK " + device.getAddress() + device.getName());
      }
    }

    @Override
    public void onFinish() {

    }
  }

  public class Peripheral {
    private BluetoothGatt mBluetoothGATT;
    private BluetoothDevice mDevice;
    private HashMap<String, Pair<BluetoothGattCharacteristic, Boolean>> mCharacteristic;
    private boolean mConnected = false;
    private int mLastRSSI;
    private boolean mDfuCompliant = false;

    @SuppressLint("MissingPermission")
    public Peripheral(BluetoothDevice device, int lastRSSI) {
      this.mCharacteristic = new HashMap<>();
      this.mDevice = device;
      this.mLastRSSI = lastRSSI;
    }

    public int getLastRSSI() {
      return mLastRSSI;
    }

    public void setDfuCompliant(boolean compliant) {
      this.mDfuCompliant = compliant;
    }

    public boolean isDfuCompliant() {
      return this.mDfuCompliant;
    }

    public boolean isConnected() {
      return mConnected;
    }

    @SuppressLint("MissingPermission")
    public String name() {
      return mDevice.getName();
    }

    @SuppressLint("MissingPermission")
    public String uuid() {
      return mDevice.getAddress();
    }

    public void setConnected(boolean connected) {
      this.mConnected = connected;
    }

    public void setGattServer(BluetoothGatt gatt) {
      this.mBluetoothGATT = gatt;
    }

    @SuppressLint("MissingPermission")
    public void discover() {
      this.mBluetoothGATT.discoverServices();
    }

    @SuppressLint("MissingPermission")
    public void disconnect() {
      this.mBluetoothGATT.disconnect();
    }

    @SuppressLint("MissingPermission")
    public void flush() {
      this.mBluetoothGATT.close();
      this.mBluetoothGATT = null;
      this.mCharacteristic.clear();
      this.mConnected = false;
      this.mLastRSSI = 0;
      this.mDfuCompliant = false;
    }

    public String[] allCharacteristics() {
      String[] charsUUID = new String[mCharacteristic.size()];
      mCharacteristic.keySet().toArray(charsUUID);
      return charsUUID;
    }

    @SuppressLint("MissingPermission")
    public void setCharacteristic(BluetoothGattCharacteristic c) {
      mCharacteristic.put(c.getUuid().toString(), new Pair<>(c, false));
    }

    @SuppressLint("MissingPermission")
    public boolean readCharacteristic(String uuid) {
      if (mCharacteristic.containsKey(uuid)) {
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
        mBluetoothGATT.readCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    @SuppressLint("MissingPermission")
    public boolean writeCharacteristic(String uuid, byte[] value, int NOT_IMPLEMENTED_type) {
      if (mCharacteristic.containsKey(uuid)) {
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
        characteristic.setValue(value);
        mBluetoothGATT.writeCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    @SuppressLint("MissingPermission")
    public boolean changeCharacteristicNotification(String uuid, boolean enable) {
      if (mCharacteristic.containsKey(uuid)) {
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
        mBluetoothGATT.setCharacteristicNotification(characteristic, enable);
        WritableMap params = Arguments.createMap();
        params.putString("uuid", mBluetoothGATT.getDevice().getAddress());
        params.putString("charUUID", characteristic.getUuid().toString());
        params.putBoolean("enable", enable);
        sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_CHANGED, params);
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUID.fromString(Client_Characteristic_Configuration));
        descriptor.setValue(enable ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        mBluetoothGATT.writeDescriptor(descriptor);
        mCharacteristic.put(uuid, new Pair<>(characteristic, enable));
        return true;
      }
      return false;
    }
  }

  private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(BLE_ADAPTER_STATUS_DID_UPDATE, BLE_ADAPTER_STATUS_DID_UPDATE);
    constants.put(BLE_ADAPTER_STATUS_INVALID, BLE_ADAPTER_STATUS_INVALID);
    constants.put(BLE_ADAPTER_STATUS_POWERED_ON, BLE_ADAPTER_STATUS_POWERED_ON);
    constants.put(BLE_ADAPTER_STATUS_POWERED_OFF, BLE_ADAPTER_STATUS_POWERED_OFF);
    constants.put(BLE_ADAPTER_STATUS_UNKNOW, BLE_ADAPTER_STATUS_UNKNOW);
    constants.put(BLE_ADAPTER_SCAN_START, BLE_ADAPTER_SCAN_START);
    constants.put(BLE_ADAPTER_SCAN_END, BLE_ADAPTER_SCAN_END);
    constants.put(BLE_PERIPHERAL_FOUND, BLE_PERIPHERAL_FOUND);
    constants.put(BLE_PERIPHERAL_READY, BLE_PERIPHERAL_READY);
    constants.put(BLE_PERIPHERAL_CONNECTED, BLE_PERIPHERAL_CONNECTED);
    constants.put(BLE_PERIPHERAL_DISCONNECTED, BLE_PERIPHERAL_DISCONNECTED);
    constants.put(BLE_PERIPHERAL_CONNECT_FAILED, BLE_PERIPHERAL_CONNECT_FAILED);
    constants.put(BLE_PERIPHERAL_DISCONNECT_FAILED, BLE_PERIPHERAL_DISCONNECT_FAILED);
    constants.put(BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED, BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE, BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED);
    constants.put(BLE_PERIPHERAL_NOTIFICATION_UPDATES, BLE_PERIPHERAL_NOTIFICATION_UPDATES);
    constants.put(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED);
    constants.put(BLE_PERIPHERAL_NOTIFICATION_CHANGED, BLE_PERIPHERAL_NOTIFICATION_CHANGED);
    constants.put(BLE_PERIPHERAL_DFU_COMPLIANT, BLE_PERIPHERAL_DFU_COMPLIANT);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_FAILED, BLE_PERIPHERAL_DFU_PROCESS_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_STARTED, BLE_PERIPHERAL_DFU_PROCESS_STARTED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_PAUSED, BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_RESUMED, BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED, BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED, BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROGRESS, BLE_PERIPHERAL_DFU_PROGRESS);
    constants.put(BLE_PERIPHERAL_DFU_DEBUG, BLE_PERIPHERAL_DFU_DEBUG);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_ABORTED, BLE_PERIPHERAL_DFU_STATUS_ABORTED);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_STARTING, BLE_PERIPHERAL_DFU_STATUS_STARTING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_STARTED, BLE_PERIPHERAL_DFU_STATUS_STARTED);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_COMPLETED, BLE_PERIPHERAL_DFU_STATUS_COMPLETED);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_UPLOADING, BLE_PERIPHERAL_DFU_STATUS_UPLOADING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_CONNECTING, BLE_PERIPHERAL_DFU_STATUS_CONNECTING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_CONNECTED, BLE_PERIPHERAL_DFU_STATUS_CONNECTED);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_SCANNING, BLE_PERIPHERAL_DFU_STATUS_SCANNING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_DFU_INTERFACE_FOUND, BLE_PERIPHERAL_DFU_STATUS_DFU_INTERFACE_FOUND);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_VALIDATING, BLE_PERIPHERAL_DFU_STATUS_VALIDATING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING);
    constants.put(BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU);
    ///
    constants.put(DFU_OPTION_ENABLE_DEBUG, DFU_OPTION_ENABLE_DEBUG);
    constants.put(DFU_OPTION_PACKET_DELAY, DFU_OPTION_PACKET_DELAY);
    constants.put(FILE_PATH_TYPE_STRING, FILE_PATH_TYPE_STRING);
    constants.put(FILE_PATH_TYPE_URL, FILE_PATH_TYPE_URL);
    return constants;
  }

  @NonNull
  @Override
  public String getName() {
    return "BluetoothZ";
  }

  @ReactMethod
  public void setup() {
    this.bluetoothManager = (BluetoothManager) this.reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
    this.bluetoothAdapter = bluetoothManager.getAdapter();
//      this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    if (bluetoothAdapter == null) {
      // Device doesn't support Bluetooth
      sendEvent(reactContext, BLE_ADAPTER_STATUS_INVALID, null);
      return;
    }
//      keepAliveTimer = new KeepAliveTimer(Long.MAX_VALUE, 3000);
//      keepAliveTimer.start();
    sendBleStatus(bluetoothAdapter.getState(), reactContext);
  }

  private static void sendBleStatus(int state, ReactContext reactContext) {
    WritableMap params = Arguments.createMap();
    switch (state) {
      case BluetoothAdapter.STATE_ON:
      case BluetoothAdapter.STATE_TURNING_ON:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_ON);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_DID_UPDATE, params);
        break;
      case BluetoothAdapter.STATE_OFF:
      case BluetoothAdapter.STATE_TURNING_OFF:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_DID_UPDATE, params);
        break;
      default:
        params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_UNKNOW, params);
        break;
    }
  }

  @ReactMethod
  public void status() {
    if (this.bluetoothAdapter == null) {
      sendBleStatus(-1, reactContext);
      return;
    }
    sendBleStatus(bluetoothAdapter.getState(), reactContext);
  }

  @ReactMethod
  public void statusSync(Promise promise) {
    if (bluetoothAdapter == null) {
      promise.reject(BLE_ADAPTER_STATUS_DID_UPDATE, "Error retrieving adapter status:" + BLE_ADAPTER_STATUS_UNKNOW);
      return;
    }
    WritableMap params = Arguments.createMap();
    switch (bluetoothAdapter.getState()) {
      case BluetoothAdapter.STATE_ON:
      case BluetoothAdapter.STATE_TURNING_ON:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_ON);
        promise.resolve(params);
        break;
      case BluetoothAdapter.STATE_OFF:
      case BluetoothAdapter.STATE_TURNING_OFF:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
        promise.resolve(params);
        break;
      default:
        params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
        promise.resolve(params);
    }
  }


  @SuppressLint("MissingPermission")
  private void scan(@Nullable ReadableArray services, @Nullable String filter, @Nullable ReadableMap options) {
    BluetoothLeScanner bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();
    ArrayList<ScanFilter> servicesFilter = null;
    if (services != null) {
      servicesFilter = new ArrayList<>();
      for (int i = 0; i < services.size(); i++) {
        String serviceUUID = services.getString(i);
        ScanFilter f = new ScanFilter.Builder().setServiceUuid(new ParcelUuid(UUID.fromString(serviceUUID))).build();
        servicesFilter.add(f);
      }
    }
    this.filter = null;
    if (filter != null) {
      this.filter = filter;
    }
    this.allowDuplicates = false;
    if (options != null) {
      if (options.hasKey("allowDuplicates")) {
        this.allowDuplicates = options.getBoolean("allowDuplicates");
      }
    }
    this.mPeripherals.clear();
    ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
    bluetoothLeScanner.startScan(servicesFilter, settings, mScanCallback);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void startScan(@Nullable ReadableArray services, @Nullable String filter, @Nullable ReadableMap options) {
    mSyncHelper.scanPromise = null;
    scan(services, filter, options);
    sendEvent(reactContext, BLE_ADAPTER_SCAN_START, null);
  }


  @SuppressLint("MissingPermission")
  @ReactMethod
  public void startScanSync(@Nullable ReadableArray services, @Nullable String filter, @Nullable ReadableMap options, Promise promise) {
    mSyncHelper.scanPromise = promise;
    scan(services, filter, options);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void stopScan() {
    bluetoothAdapter.getBluetoothLeScanner().stopScan(mScanCallback);
    if (mSyncHelper.scanPromise != null) {
      WritableArray devicesFound = Arguments.createArray();
      for (Peripheral p : mPeripherals.values()) {
        WritableMap device = Arguments.createMap();
        device.putString("uuid", p.uuid());
        device.putString("name", p.name());
        device.putInt("name", p.getLastRSSI());
        devicesFound.pushMap(device);
      }
      mSyncHelper.scanPromise.resolve(devicesFound);
    } else {
      sendEvent(reactContext, BLE_ADAPTER_SCAN_END, null);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void connect(String uuid) {
    this.mSyncHelper.connectPromise = null;
    if (isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CONNECT_FAILED, params);
      return;
    }
    try {
      final BluetoothDevice device = bluetoothAdapter.getRemoteDevice(uuid);
      device.connectGatt(reactContext, false, mBluetoothGATTCallback);
    } catch (IllegalArgumentException exception) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", exception.getLocalizedMessage());
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CONNECT_FAILED, params);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void connectSync(String uuid, Promise promise) {
    if (isConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CONNECT_FAILED, "Device already connected:" + uuid);
      return;
    }
    this.mSyncHelper.connectPromise = promise;
    try {
      final BluetoothDevice device = bluetoothAdapter.getRemoteDevice(uuid);
      device.connectGatt(reactContext, false, mBluetoothGATTCallback);
    } catch (IllegalArgumentException exception) {
      mSyncHelper.connectPromise.reject(BLE_PERIPHERAL_CONNECT_FAILED, exception.getLocalizedMessage());
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
    }
  }

  private boolean isConnected(String uuid) {
    // Log.d("CERVOFIA", "contains:" + mPeripherals.containsKey(uuid) + ", connected:" + mPeripherals.get(uuid).isConnected());
    return (mPeripherals.containsKey(uuid) && mPeripherals.get(uuid).isConnected());
  }

  @ReactMethod
  public void isConnectedSync(String uuid, Promise promise) {
    promise.resolve(isConnected(uuid));
  }

  @ReactMethod
  public void isDFUCompliant(String uuid, Promise promise) {
    promise.resolve(mPeripherals.containsKey(uuid) && mPeripherals.get(uuid).isDfuCompliant());
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void cancel(String uuid) {
    this.disconnect(uuid);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void disconnect(String uuid) {
//        Log.d("SAMUELE","=====> DISCONNECT");
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DISCONNECT_FAILED, params);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.disconnect();
  }

  @ReactMethod
  public void getAllCharacteristicSync(String uuid, Promise promise) {
    if (!isConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE, "peripheral not connected");
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    WritableMap params = Arguments.createMap();
    WritableArray array = Arguments.fromArray(p.allCharacteristics());
    params.putArray("characteristics", array);
    promise.resolve(params);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void readCharacteristicValue(String uuid, String charUUID) {
//        Log.d("SAMUELE","=====> readCharacteristicValue");
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.readCharacteristic(charUUID)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Could not read characteristic " + charUUID);
      Log.w("SAMUELE", "Characteristic not found with provided address." + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void writeCharacteristicValue(String uuid, String charUUID, ReadableArray value) {
//        Log.d("SAMUELE","=====> writeCharacteristic");
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params);
      return;
    }
    byte[] byteArr = new byte[value.size()];
    for (int i = 0; i < value.size(); i++) {
      byteArr[i] = (byte) value.getInt(i);
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.writeCharacteristic(charUUID, byteArr, 0)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Could not write characteristic " + charUUID);
      Log.w("SAMUELE", "Characteristic not found with provided address." + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void changeCharacteristicNotification(String uuid, String charUUID, boolean enable) {
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      Log.w("SAMUELE", "Device not found with provided address." + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.changeCharacteristicNotification(charUUID, enable)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Could not enable characteristic " + charUUID);
      Log.w("SAMUELE", "Characteristic not found with provided address." + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params);
    }
  }

  private boolean prepareDFU(String uuid, ReadableMap options) {
    if (!isConnected(uuid)) {
      return false;
    }
    mDfuHelper.currentPeripheralId = uuid;
    mDfuHelper.serviceInitiator = new DfuServiceInitiator(uuid).setKeepBond(false);
    mDfuHelper.serviceInitiator.setPacketsReceiptNotificationsValue(1);
    mDfuHelper.enableDebug = false;
    if (options.hasKey(DFU_OPTION_ENABLE_DEBUG)) {
      mDfuHelper.enableDebug = options.getBoolean(DFU_OPTION_ENABLE_DEBUG);
    }
    mDfuHelper.serviceInitiator.setPrepareDataObjectDelay(300L);
    if (options.hasKey(DFU_OPTION_PACKET_DELAY)) {
      mDfuHelper.serviceInitiator.setPrepareDataObjectDelay(options.getInt(DFU_OPTION_PACKET_DELAY));
    }
    mDfuHelper.serviceInitiator.setUnsafeExperimentalButtonlessServiceInSecureDfuEnabled(true);
    return true;
  }

  @ReactMethod
  public void startDFU(String uuid, String filePath, String pathType, ReadableMap options) {
    if (!prepareDFU(uuid, options)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_FAILED, params);
      return;
    }
    mSyncHelper.dfuPromise = null;
    switch (pathType) {
      case FILE_PATH_TYPE_STRING:
        mDfuHelper.serviceInitiator.setZip(filePath);
        break;
      case FILE_PATH_TYPE_URL:
        Log.d("PEPPER", "GODO?");
        Uri uri = Uri.parse(filePath);
        mDfuHelper.serviceInitiator.setZip(uri);
        break;
    }
    mDfuHelper.controller = mDfuHelper.serviceInitiator.start(this.reactContext, LocalDfuService.class);
  }

  @ReactMethod
  public void pauseDFU(String uuid) {
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED, params);
      return;
    }
    WritableMap params = Arguments.createMap();
    params.putString("uuid", uuid);
    params.putString("status", BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, params);
    if (mDfuHelper.controller == null || mDfuHelper.controller.isPaused()) {
      return;
    }
    mDfuHelper.controller.pause();
  }

  @ReactMethod
  public void resumeDFU(String uuid) {
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED, params);
      return;
    }
    WritableMap params = Arguments.createMap();
    params.putString("uuid", uuid);
    params.putString("status", BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
    sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, params);
    if (mDfuHelper.controller == null || !mDfuHelper.controller.isPaused()) {
      return;
    }
    mDfuHelper.controller.resume();
  }

  @ReactMethod
  public void abortDFU(String uuid) {
    if (!isConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, params);
      return;
    }
    if (mDfuHelper.controller == null || mDfuHelper.controller.isAborted()) {
      // WritableMap params = Arguments.createMap();
      // params.putString("uuid", uuid);
      // sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, params);
      return;
    }
    mDfuHelper.controller.abort();
  }

  /**
   * =============================================== DFU ============================================================
   * ================================================================================================================
   * ================================================================================================================
   * ================================================================================================================
   */

  @Override
  public void onHostResume() {
    DfuServiceListenerHelper.registerProgressListener(this.reactContext, this.mLocalDfuProgressListener);
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
    DfuServiceListenerHelper.unregisterProgressListener(this.reactContext, this.mLocalDfuProgressListener);
  }

  private class LocalDfuProgressListener extends DfuProgressListenerAdapter {

    @Override
    public void onDeviceConnecting(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_CONNECTING);
      map.putString("description", "Connecting to the remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceConnected(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_CONNECTED);
      map.putString("description", "Remote device connected.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuProcessStarting(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_STARTING);
      map.putString("description", "Initializing DFU procedure.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuProcessStarted(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_STARTED);
      map.putString("description", "DFU Procedure started.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onEnablingDfuMode(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU);
      map.putString("description", "Enabling DFU interface on remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onProgressChanged(@NonNull final String deviceAddress, final int percent,
                                  final float speed, final float avgSpeed,
                                  final int currentPart, final int partsTotal) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_UPLOADING);
      map.putInt("progress", percent);
      map.putDouble("currentSpeedBytesPerSecond", speed);
      map.putDouble("avgSpeedBytesPerSecond", avgSpeed);
      map.putInt("part", currentPart);
      map.putInt("totalParts", partsTotal);
      map.putString("description", "Uploading firmware onto remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onFirmwareValidating(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_VALIDATING);
      map.putString("description", "Validating firmware.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceDisconnecting(final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING);
      map.putString("description", "Disconnecting from remote device.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDeviceDisconnected(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED);
      map.putString("description", "Remote device disconnected.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuCompleted(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_COMPLETED);
      map.putString("description", "DFU Procedure successfully completed.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onDfuAborted(@NonNull final String deviceAddress) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("status", BLE_PERIPHERAL_DFU_STATUS_ABORTED);
      map.putString("description", "DFU Procedure aborted by the user.");
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, map);
    }

    @Override
    public void onError(@NonNull final String deviceAddress,
                        final int error, final int errorType, final String message) {
      WritableMap map = Arguments.createMap();
      map.putString("uuid", deviceAddress);
      map.putString("error", message);
      map.putInt("errorCode", error);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_FAILED, map);
    }
  }

  /**
   * ================================================================================================================
   * ================================================================================================================
   * ================================================================================================================
   * ================================================================================================================
   */

  @ReactMethod
  public void addListener(String eventName) {
    if (listenerCount == 0) {
      // Set up any upstream listeners or background tasks as necessary
    }
    listenerCount += 1;
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    listenerCount -= count;
    if (listenerCount == 0) {
      // Remove upstream listeners, stop unnecessary background tasks
    }
  }
}
