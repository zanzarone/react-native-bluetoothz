package com.bluetoothz;

import static android.bluetooth.BluetoothGatt.CONNECTION_PRIORITY_BALANCED;
import static android.bluetooth.BluetoothGatt.CONNECTION_PRIORITY_DCK;
import static android.bluetooth.BluetoothGatt.CONNECTION_PRIORITY_HIGH;
import static android.bluetooth.BluetoothGatt.CONNECTION_PRIORITY_LOW_POWER;

import android.annotation.SuppressLint;
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
import android.os.CountDownTimer;
import android.os.ParcelUuid;
import android.util.Log;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


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
  public static final String BLE_PERIPHERAL_UPDATES = "BLE_PERIPHERAL_UPDATES";
  public static final String BLE_PERIPHERAL_UPDATED_RSSI = "BLE_PERIPHERAL_UPDATED_RSSI";
  public static final String BLE_PERIPHERAL_READY = "BLE_PERIPHERAL_READY";
  public static final String BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED = "BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED";
  public static final String BLE_PERIPHERAL_DISCOVER_FAILED = "BLE_PERIPHERAL_DISCOVER_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED = "BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED";
  public static final String BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED = "BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_OK = "BLE_PERIPHERAL_CHARACTERISTIC_READ_OK";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED";
  public static final String BLE_PERIPHERAL_NOTIFICATION_UPDATES = "BLE_PERIPHERAL_NOTIFICATION_UPDATES";
  public static final String BLE_PERIPHERAL_NOTIFICATION_CHANGED = "BLE_PERIPHERAL_NOTIFICATION_CHANGED";
  public static final String BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED = "BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED";
  public static final String BLE_PERIPHERAL_ALL_NOTIFICATION_DISABLED = "BLE_PERIPHERAL_ALL_NOTIFICATION_DISABLED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED";
  public static final String BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY = "BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY";
  public static final String BLE_PERIPHERAL_SET_MTU_OK = "BLE_PERIPHERAL_SET_MTU_OK";
  public static final String BLE_PERIPHERAL_SET_MTU_FAILED = "BLE_PERIPHERAL_SET_MTU_FAILED";
  public static final String BLE_PERIPHERAL_SET_CONN_PRORITY_OK = "BLE_PERIPHERAL_SET_CONN_PRORITY_OK";
  public static final String BLE_PERIPHERAL_SET_CONN_PRORITY_FAILED = "BLE_PERIPHERAL_SET_CONN_PRORITY_FAILED";
  public static final String BLE_PERIPHERAL_CONNECTION_PRIORITY_BALANCED = "BLE_PERIPHERAL_CONNECTION_PRIORITY_BALANCED";
  public static final String BLE_PERIPHERAL_CONNECTION_PRIORITY_HIGH = "BLE_PERIPHERAL_CONNECTION_PRIORITY_HIGH";
  public static final String BLE_PERIPHERAL_CONNECTION_PRIORITY_DCK = "BLE_PERIPHERAL_CONNECTION_PRIORITY_DCK";
  public static final String BLE_PERIPHERAL_CONNECTION_PRIORITY_LOW_POWER = "BLE_PERIPHERAL_CONNECTION_PRIORITY_LOW_POWER";
  public static final String BLE_PERIPHERAL_DFU_COMPLIANT = "BLE_PERIPHERAL_DFU_COMPLIANT";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_QUEUED = "BLE_PERIPHERAL_DFU_PROCESS_QUEUED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_STARTED = "BLE_PERIPHERAL_DFU_PROCESS_STARTED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_PAUSED = "BLE_PERIPHERAL_DFU_PROCESS_PAUSED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_RESUMED = "BLE_PERIPHERAL_DFU_PROCESS_RESUMED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED";
  public static final String BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED = "BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED";
  // public static final String BLE_PERIPHERAL_DFU_PROGRESS = "BLE_PERIPHERAL_DFU_PROGRESS";
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
  // =====================================================================================================================
// =====================================================================================================================
//                                                  DEFINES
// =====================================================================================================================
// =====================================================================================================================
  public static final String DFU_OPTION_ENABLE_DEBUG = "DFU_OPTION_ENABLE_DEBUG";
  public static final String DFU_OPTION_PACKET_DELAY = "DFU_OPTION_PACKET_DELAY";
  public static final String DFU_OPTION_RETRIES_NUMBER = "DFU_OPTION_RETRIES_NUMBER";
  public static final String DFU_OPTION_REBOOTING_TIME = "DFU_OPTION_REBOOTING_TIME";
  public static final String FILE_PATH_TYPE_STRING = "FILE_PATH_TYPE_STRING";
  public static final String FILE_PATH_TYPE_URL = "FILE_PATH_TYPE_URL";
  private static final String DFU_SERVICE_UUID = "0000fe59";
  private static final int SCAN_WD_KEEP_ALIVE_TIMEOUT_MSEC = 5000;
  private static final int SCAN_WD_REFRESH_RATE = 1000;
  public static final String BLE_PERIPHERAL_STATE_CONNECTED = "BLE_PERIPHERAL_STATE_CONNECTED";
  public static final String BLE_PERIPHERAL_STATE_CONNECTING = "BLE_PERIPHERAL_STATE_CONNECTING";
  public static final String BLE_PERIPHERAL_STATE_DISCONNECTED = "BLE_PERIPHERAL_STATE_DISCONNECTED";
  public static final String BLE_PERIPHERAL_STATE_DISCONNECTING = "BLE_PERIPHERAL_STATE_DISCONNECTING";
  public static final String BLE_PERIPHERAL_STATE_FOUND = "BLE_PERIPHERAL_STATE_FOUND";
  public static final String BLE_PERIPHERAL_STATE_COUNT = "BLE_PERIPHERAL_STATE_COUNT";
  public static final String BLE_PERIPHERAL_STATUS_SUCCESS = "BLE_PERIPHERAL_STATUS_SUCCESS";
  public static final String BLE_PERIPHERAL_STATUS_FAILURE = "BLE_PERIPHERAL_STATUS_FAILURE";

  public static final int GATT_STATE_DISCONNECTED = BluetoothProfile.STATE_DISCONNECTED;
  public static final int GATT_STATE_CONNECTING = BluetoothProfile.STATE_CONNECTING;
  public static final int GATT_STATE_CONNECTED = BluetoothProfile.STATE_CONNECTED;
  public static final int GATT_STATE_DISCONNECTING = BluetoothProfile.STATE_DISCONNECTING;
  public static final int GATT_STATE_FOUND = GATT_STATE_DISCONNECTING + 1;
  public static final int GATT_STATE_COUNT = GATT_STATE_DISCONNECTING + 2;
  public static final int GATT_STATUS_SUCCESS = BluetoothGatt.GATT_SUCCESS;
  public static final int GATT_STATUS_FAILURE = BluetoothGatt.GATT_FAILURE;

  private BluetoothAdapter bluetoothAdapter;
  private BluetoothManager bluetoothManager;
  private boolean isScanning = false;
  private ArrayList<String> scanFilters = null;
  private boolean allowDuplicates = false;
  private boolean allowNoNamedDevices = false;
  private int listenerCount = 0;
  private ReactApplicationContext reactContext;
  private LocalBroadcastReceiver mLocalBroadcastReceiver;
  private LocalScanCallback mScanCallback;
  private LocalBluetoothGattCallback mBluetoothGATTCallback;
  //  private LocalDfuProgressListener mLocalDfuProgressListener;
  private ConcurrentHashMap<String, Peripheral> mPeripherals;
  public Dfu mDfuHelper;
  private Promise scanPromise;
  private SearchDeviceHelper searchDeviceHelper;
  private PeripheralWatchdog mPeripheralWatchdog;

  private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

  public BluetoothzModule(ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
    this.mPeripherals = new ConcurrentHashMap<>();
    this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
    this.mBluetoothGATTCallback = new LocalBluetoothGattCallback();
    this.mDfuHelper = new Dfu(context);
    this.reactContext.addLifecycleEventListener(this);
    this.searchDeviceHelper = new SearchDeviceHelper();
  }

  @Override
  public void onHostResume() {
    this.reactContext.registerReceiver(mLocalBroadcastReceiver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
  }

  @Override
  public void onHostPause() {
//    for (Peripheral peripheral : this.mPeripherals.values()) {
//      if(!peripheral.isConnected()){
//        continue;
//      }
//      peripheral.stopAllNotifications();
//    }
    this.reactContext.unregisterReceiver(mLocalBroadcastReceiver);
  }

  @Override
  public void onHostDestroy() {
    this.reactContext.unregisterReceiver(mLocalBroadcastReceiver);
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

  private class SearchDeviceHelper {
    public Promise searchPromise;
    public ArrayList<String> searchTerms;

    public SearchDeviceHelper() {
      this.searchTerms = new ArrayList<>();
      this.searchPromise = null;
    }

    public void clear() {
      this.searchTerms.clear();
      this.searchPromise = null;
    }
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

  // Adapter scan callback.
  public class LocalScanCallback extends ScanCallback {
    @Override
    public void onScanFailed(int errorCode) {
      super.onScanFailed(errorCode);
      WritableMap params = Arguments.createMap();
      params.putInt("errorCode", errorCode);
      isScanning = false;
      sendEvent(reactContext, BLE_ADAPTER_SCAN_END, params.copy());
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onScanResult(int callbackType, ScanResult result) {
      BluetoothDevice device = result.getDevice();
      String name = device.getName();
      if ((name == null || name.isEmpty()) && result.getScanRecord() != null) {
        name = result.getScanRecord().getDeviceName();
      }
      if (!allowNoNamedDevices && (name == null || name.isEmpty())) {
        return;
      }
      if (name == null) {
        name = "";
      }
      boolean niceFind = true;
      if (scanFilters != null) {
        for (String pattern : scanFilters) {
          Pattern compiledPattern = Pattern.compile(pattern);
          Matcher matcher = compiledPattern.matcher(name);
          niceFind = matcher.find();
          if (niceFind) {
            break;
          }
        }
      }
      long lastSeen = System.currentTimeMillis();
      String uuid = device.getAddress();
      if (niceFind && !allowDuplicates) {
        niceFind = !mPeripherals.containsKey(uuid);
        if (!niceFind) {
          int rssi = result.getRssi();
          Peripheral peripheral = mPeripherals.get(uuid);
          peripheral.setLastRSSI(rssi);
          peripheral.setLastSeen(lastSeen);
        }
      }
      if (niceFind) {
        int rssi = result.getRssi();
        Peripheral peripheral = new Peripheral(device, name, rssi);
        peripheral.setLastSeen(lastSeen);
        List<ParcelUuid> uuids = result.getScanRecord().getServiceUuids();
        if (uuids != null) {
          for (ParcelUuid parcelUuid : uuids) {
            if (parcelUuid.getUuid().toString().contains(DFU_SERVICE_UUID)) {
              peripheral.setDfuCompliant(true);
            }
          }
        }
        mPeripherals.put(uuid, peripheral);

      }
    }
  }

  // Device results callback.
  private class LocalBluetoothGattCallback extends BluetoothGattCallback {
    @SuppressLint("MissingPermission")
    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
      String uuid = gatt.getDevice().getAddress();
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putInt("state", newState);
      params.putInt("status", status);
      for (Peripheral p : mPeripherals.values()) {
        Log.d("orcolo", p.uuid() + "" + p.name());
      }
      Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
      p.setConnected(false);
      if (status != GATT_STATUS_SUCCESS) {
        if (p.getConnectionStatusPromise() != null) {
          p.getConnectionStatusPromise().reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Peripheral is busy");
          p.setConnectionStatusPromise(null);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
        }
        return;
      }
      p.setConnected(newState == GATT_STATE_CONNECTED);
      if (newState == GATT_STATE_CONNECTED) {
        p.setGattServer(gatt);
        if (p.isDiscoveringEnable()) {
          p.discover();
        }
        if (p.getConnectionStatusPromise() != null) {
          p.getConnectionStatusPromise().resolve(params.copy());
          p.setConnectionStatusPromise(null);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
        }
      } else if (newState == GATT_STATE_DISCONNECTED) {
        if (p.getConnectionStatusPromise() != null) {
          p.getConnectionStatusPromise().resolve(params.copy());
          p.setConnectionStatusPromise(null);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
        }
        p.flush();
      }
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
      Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
      if (status == GATT_STATUS_SUCCESS) {
        if (mPeripherals.containsKey(gatt.getDevice().getAddress())) {
          List<BluetoothGattService> services = gatt.getServices();
          for (BluetoothGattService service : services) {
            if (service.getUuid().toString().contains(DFU_SERVICE_UUID)) {
              p.setDfuCompliant(true);
              WritableMap params = Arguments.createMap();
              params.putString("uuid", gatt.getDevice().getAddress());
              params.putBoolean("compliant", true);
              sendEvent(reactContext, BLE_PERIPHERAL_DFU_COMPLIANT, params.copy());
            }
            p.setService(service);
            List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
            for (BluetoothGattCharacteristic c : characteristics) {
              WritableMap params = Arguments.createMap();
              params.putString("uuid", gatt.getDevice().getAddress());
              params.putString("charUUID", c.getUuid().toString());
              sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, params.copy());
              p.setCharacteristic(c);
            }
          }
          WritableMap params = Arguments.createMap();
          params.putString("uuid", gatt.getDevice().getAddress());
          params.putBoolean("dfuCompliant", p.isDfuCompliant());
          if (p.getDiscoverPromise() != null) {
            p.getDiscoverPromise().resolve(params.copy());
            p.setDiscoverPromise(null);
          }
          sendEvent(reactContext, BLE_PERIPHERAL_READY, params.copy());
        }
      } else {
        WritableMap params = Arguments.createMap();
        params.putString("uuid", gatt.getDevice().getAddress());
        if (p.getDiscoverPromise() != null) {
          p.getDiscoverPromise().reject(BLE_PERIPHERAL_DISCOVER_FAILED, "Could not discover services");
          p.setDiscoverPromise(null);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_DISCOVER_FAILED, params.copy());
        }
      }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
      Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
      WritableMap params = Arguments.createMap();
      String uuid = gatt.getDevice().getAddress();
      String charUUID = characteristic.getUuid().toString();
      Promise promise = p.getReadValuePromise(charUUID);
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      if (status == GATT_STATUS_SUCCESS) {
        WritableArray value = Arguments.createArray();
        byte[] buffer = characteristic.getValue();
        for (int i = 0; i < buffer.length; i++) {
          value.pushInt(buffer[i]);
        }
        params.putArray("value", value);
        if (promise != null) {
          promise.resolve(params.copy());
          p.removeReadValuePromise(uuid);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, params.copy());
        }
      } else {
        if (promise != null) {
          promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, "Error reading from characteristic");
          p.removeReadValuePromise(uuid);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params.copy());
        }
      }
    }

    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
      WritableMap params = Arguments.createMap();
      String uuid = gatt.getDevice().getAddress();
      String charUUID = characteristic.getUuid().toString();
      Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
      Promise promise = p.getWriteValuePromise(charUUID);
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      if (status == GATT_STATUS_SUCCESS) {
        String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
        params.putString("value", bufferString);
        if (promise != null) {
          promise.resolve(params.copy());
          p.removeWriteValuePromise(uuid);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, params.copy());
        }
      } else {
        if (promise != null) {
          promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, "Error writing to characteristic");
          p.removeWriteValuePromise(uuid);
        } else {
          sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params.copy());
        }
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
      WritableMap params = Arguments.createMap();
      params.putString("uuid", gatt.getDevice().getAddress());
      params.putString("charUUID", characteristic.getUuid().toString());
      params.putArray("value", value);
      sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_UPDATES, params.copy());
    }

    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
      //? descriptor enable notification
      final String uuid = gatt.getDevice().getAddress();
      final String charUUID = descriptor.getCharacteristic().getUuid().toString();
      WritableMap params = Arguments.createMap();
      if (mPeripherals.containsKey(uuid)) {
        params.putString("uuid", uuid);
        params.putString("charUUID", charUUID);
        //?
        if (descriptor.getUuid().compareTo(UUID.fromString(Client_Characteristic_Configuration)) == 0) {
          final boolean enabled = descriptor.getValue() == BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE;
          // ora vediamo se la richiesta era sincrona
          Peripheral p = mPeripherals.get(uuid);
          Promise promise = p.getNotificationCharPromise(charUUID);
          if (promise != null) {
            if (status == GATT_STATUS_SUCCESS) {
              params.putBoolean("enable", enabled);
              p.mCharacteristic.put(charUUID, descriptor.getCharacteristic());
              promise.resolve(params);
            } else {
              promise.reject(BLE_PERIPHERAL_NOTIFICATION_CHANGED, BLE_PERIPHERAL_NOTIFICATION_CHANGED);
            }
            p.removeNotificationCharPromise(charUUID);
          } else {
            if (status == GATT_STATUS_SUCCESS) {
              params.putBoolean("enable", enabled);
              sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_CHANGED, params.copy());
              p.mCharacteristic.put(charUUID, descriptor.getCharacteristic());
            } else {
              params.putString("error", "Error writing descriptor");
              sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_CHANGED, params.copy());
            }
          }
        }
      }
    }

    @Override
    public void onMtuChanged(final BluetoothGatt gatt, final int mtu, final int status) {
      WritableMap params = Arguments.createMap();
      String uuid = gatt.getDevice().getAddress();
      params.putString("uuid", uuid);
      sendEvent(reactContext, status == GATT_STATUS_SUCCESS ? BLE_PERIPHERAL_SET_MTU_OK : BLE_PERIPHERAL_SET_MTU_FAILED, params.copy());
    }
  }

  public class PeripheralWatchdog extends CountDownTimer {
    int mKeepAliveTimeout;

    public PeripheralWatchdog(long millisInFuture, long countDownInterval, int keepAliveTimeout) {
      super(millisInFuture, countDownInterval);
      mKeepAliveTimeout = keepAliveTimeout;
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onTick(long l) {
      if (bluetoothManager == null) {
        return;
      }
      WritableArray array = Arguments.createArray();
      long currentTimeMillis = System.currentTimeMillis();
      Peripheral searched = null;
      for (String key : mPeripherals.keySet()) {
        Peripheral p = mPeripherals.get(key);
        if (!p.isConnected() && (currentTimeMillis - p.getLastSeen() >= mKeepAliveTimeout)) {
          mPeripherals.remove(key);
          continue;
        }
        if (searchDeviceHelper.searchTerms.contains(p.uuid()) || searchDeviceHelper.searchTerms.contains(p.name())) {
          searched = p;
        }
        WritableMap params = Arguments.createMap();
        params.putString("uuid", p.uuid());
        params.putString("name", p.name());
        params.putBoolean("dfuCompliant", p.isDfuCompliant());
        params.putInt("rssi", p.getLastRSSI());
        array.pushMap(params.copy());
      }
      WritableMap payload = Arguments.createMap();
      payload.putArray("devices", array);
      sendEvent(reactContext, BLE_PERIPHERAL_UPDATES, payload);
      if(searched != null) {
        WritableMap params = Arguments.createMap();
        params.putString("uuid", searched.uuid());
        params.putString("name", searched.name());
        params.putInt("state", GATT_STATE_FOUND);
        params.putInt("status", GATT_STATUS_SUCCESS);
        searchDeviceHelper.searchPromise.resolve(params.copy());
        searchDeviceHelper.clear();
      }
    }

    @Override
    public void onFinish() {
      /// il countdown è terminato, faccio ripartire il timer.
      this.start();
    }
  }

  public class Peripheral {
    private BluetoothGatt mBluetoothGATT;
    private BluetoothDevice mDevice;
    private HashMap<String, BluetoothGattService> mServices;
    private HashMap<String, BluetoothGattCharacteristic> mCharacteristic;
    private HashMap<String, Promise> mReadCharPromises;
    private HashMap<String, Promise> mWriteCharPromises;
    private HashMap<String, Promise> mNotificationCharPromises;
    private boolean mConnected = false;
    private Promise mConnectionStatusPromise;
    private Promise mDiscoverPromise;
    private String mName;
    private int mLastRSSI;
    private long mLastSeen;
    private boolean mDfuCompliant = false;
    private boolean mEnableDiscover = false;

    @SuppressLint("MissingPermission")
    public Peripheral(BluetoothDevice device, String name, int lastRSSI) {
      this.mServices = new HashMap<>();
      this.mCharacteristic = new HashMap<>();
      this.mReadCharPromises = new HashMap<>();
      this.mWriteCharPromises = new HashMap<>();
      this.mNotificationCharPromises = new HashMap<>();
      this.mDevice = device;
      this.mName = name;
      this.mLastRSSI = lastRSSI;
    }

    public boolean isDiscoveringEnable() {
      return mEnableDiscover;
    }

    public void enableDiscovering(boolean discover) {
      this.mEnableDiscover = discover;
    }

    public Promise getConnectionStatusPromise() {
      return mConnectionStatusPromise;
    }

    public void setConnectionStatusPromise(Promise mConnectionStatusPromise) {
      this.mConnectionStatusPromise = mConnectionStatusPromise;
    }

    public Promise getDiscoverPromise() {
      return mDiscoverPromise;
    }

    public void setDiscoverPromise(Promise mDiscoverPromise) {
      this.mDiscoverPromise = mDiscoverPromise;
    }

    public int getLastRSSI() {
      return mLastRSSI;
    }

    public void setLastRSSI(int rssi) {
      this.mLastRSSI = rssi;
    }

    public long getLastSeen() {
      return this.mLastSeen;
    }

    public void setLastSeen(long lastSeen) {
      this.mLastSeen = lastSeen;
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
      return this.mName;
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
      if (this.mBluetoothGATT != null) {
        this.mBluetoothGATT.close();
        this.mBluetoothGATT = null;
      }
      this.mServices.clear();
      this.mCharacteristic.clear();
      this.mConnected = false;
      this.mLastRSSI = 0;
//      this.mName = "";
      this.mDfuCompliant = false;
      this.mConnectionStatusPromise = null;
      this.mReadCharPromises.clear();
      this.mWriteCharPromises.clear();
      this.mDiscoverPromise = null;
    }

    public String[] allCharacteristicsUUIDs() {
      String[] charsUUID = new String[mCharacteristic.size()];
      mCharacteristic.keySet().toArray(charsUUID);
      return charsUUID;
    }

    public ArrayList<BluetoothGattCharacteristic> allCharacteristics() {
      ArrayList<BluetoothGattCharacteristic> chars = new ArrayList<BluetoothGattCharacteristic>(mCharacteristic.values());
      return chars;
    }

    public String[] allServices() {
      String[] serviceUUID = new String[mServices.size()];
      mServices.keySet().toArray(serviceUUID);
      return serviceUUID;
    }

    @SuppressLint("MissingPermission")
    public void setService(BluetoothGattService service) {
      mServices.put(service.getUuid().toString(), service);
    }

    @SuppressLint("MissingPermission")
    public void setCharacteristic(BluetoothGattCharacteristic c) {
      mCharacteristic.put(c.getUuid().toString(), c);
    }

    @SuppressLint("MissingPermission")
    public boolean readCharacteristic(String uuid) {
      if (mCharacteristic.containsKey(uuid)) {
        mReadCharPromises.remove(uuid);
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid);
        mBluetoothGATT.readCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    @SuppressLint("MissingPermission")
    public boolean readCharacteristicSync(String uuid, Promise promise) {
      if (mCharacteristic.containsKey(uuid)) {
        mReadCharPromises.put(uuid, promise);
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid);
        mBluetoothGATT.readCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    public Promise getReadValuePromise(String uuid) {
      return mReadCharPromises.containsKey(uuid) ? mReadCharPromises.get(uuid) : null;
    }

    public void removeReadValuePromise(String uuid) {
      mReadCharPromises.remove(uuid);
    }

    @SuppressLint("MissingPermission")
    public boolean writeCharacteristic(String uuid, byte[] value, int NOT_IMPLEMENTED_type) {
      if (mCharacteristic.containsKey(uuid)) {
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid);
        characteristic.setValue(value);
        mBluetoothGATT.writeCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    @SuppressLint("MissingPermission")
    public boolean writeCharacteristicSync(String uuid, byte[] value, Promise promise, int NOT_IMPLEMENTED_type) {
      if (mCharacteristic.containsKey(uuid)) {
        mWriteCharPromises.put(uuid, promise);
        BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid);
        characteristic.setValue(value);
        characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        mBluetoothGATT.writeCharacteristic(characteristic);
        return true;
      }
      return false;
    }

    public Promise getWriteValuePromise(String uuid) {
      return mWriteCharPromises.containsKey(uuid) ? mWriteCharPromises.get(uuid) : null;
    }

    public void removeWriteValuePromise(String uuid) {
      mWriteCharPromises.remove(uuid);
    }

    public Promise getNotificationCharPromise(String uuid) {
      return mNotificationCharPromises.containsKey(uuid) ? mNotificationCharPromises.get(uuid) : null;
    }

    public void removeNotificationCharPromise(String uuid) {
      mNotificationCharPromises.remove(uuid);
    }

    @SuppressLint("MissingPermission")
    public boolean changeCharacteristicNotification(String uuid, boolean enable) {
      if (mCharacteristic.containsKey(uuid)) {
        boolean enabled = this.characteristicIsNotifying(uuid);
        if (enabled != enable) {
          BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid);
          mBluetoothGATT.setCharacteristicNotification(characteristic, enable);
          BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUID.fromString(Client_Characteristic_Configuration));
          int properties = characteristic.getProperties();
          byte[] value = null;
          if(((properties & BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0)) {
            value = enable ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;
          }
          else if (((properties & BluetoothGattCharacteristic.PROPERTY_INDICATE) > 0)){
            value = enable ? BluetoothGattDescriptor.ENABLE_INDICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;
          }else {
            return false;
          }
          descriptor.setValue(value);
          mBluetoothGATT.writeDescriptor(descriptor);
        }
        return true;
      }
      return false;
    }

    public void stopAllNotifications() {
      for(String uuid:this.mCharacteristic.keySet()){
        changeCharacteristicNotification(uuid,false);
      }
    }

    @SuppressLint("MissingPermission")
    public void changeCharacteristicNotificationSync(String uuid, boolean enable, Promise promise) {
      if (mCharacteristic.containsKey(uuid)) {
        mNotificationCharPromises.put(uuid, promise);
        if (!changeCharacteristicNotification(uuid, enable)) {
          promise.reject(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, "Could not find characteristic with uuid " + uuid);
        }
      } else {
        promise.reject(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, "Could not find characteristic with uuid " + uuid);
      }
    }

    public boolean characteristicIsNotifying(String uuid) {
      if (mCharacteristic.containsKey(uuid)) {
        BluetoothGattDescriptor descriptor = mCharacteristic.get(uuid).getDescriptor(UUID.fromString(Client_Characteristic_Configuration));
        boolean isNotifying = false;
        if (descriptor != null) {
          byte[] descriptorValue = descriptor.getValue();
          if (descriptorValue != null) {
            isNotifying = (descriptorValue[0] & 0x01) != 0;
          }
        }
        return isNotifying;
      }
      return false;
    }

    public void characteristicIsNotifyingSync(String uuid, Promise promise) {
      if (mCharacteristic.containsKey(uuid)) {
        WritableMap params = Arguments.createMap();
        params.putString("uuid", mDevice.getAddress());
        params.putString("charUUID", uuid);
        params.putBoolean("isNotifying", this.characteristicIsNotifying(uuid));
        promise.resolve(params.copy());
      } else {
        promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED, "Could not find characteristic with uuid " + uuid);
      }
    }

    public boolean characteristicIsIndicatable(String uuid) {
      if (mCharacteristic.containsKey(uuid)) {
        return (mCharacteristic.get(uuid).getProperties() & BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0;
      }
      return false;
    }

    public void characteristicIsIndicatableSync(String uuid, Promise promise) {
      if (mCharacteristic.containsKey(uuid)) {
        WritableMap params = Arguments.createMap();
        params.putString("uuid", mDevice.getAddress());
        params.putString("charUUID", uuid);
        params.putBoolean("isIndicatable", this.characteristicIsIndicatable(uuid));
        promise.resolve(params.copy());
      } else {
        promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED, "Could not find characteristic with uuid " + uuid);
      }
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
    constants.put(BLE_PERIPHERAL_UPDATES, BLE_PERIPHERAL_UPDATES);
    constants.put(BLE_PERIPHERAL_UPDATED_RSSI, BLE_PERIPHERAL_UPDATED_RSSI);
    constants.put(BLE_PERIPHERAL_READY, BLE_PERIPHERAL_READY);
    constants.put(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED);
    constants.put(BLE_PERIPHERAL_DISCOVER_FAILED, BLE_PERIPHERAL_DISCOVER_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED);
    constants.put(BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED, BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED);
    constants.put(BLE_PERIPHERAL_NOTIFICATION_UPDATES, BLE_PERIPHERAL_NOTIFICATION_UPDATES);
    constants.put(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED);
    constants.put(BLE_PERIPHERAL_ALL_NOTIFICATION_DISABLED, BLE_PERIPHERAL_ALL_NOTIFICATION_DISABLED);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY, BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY);
    constants.put(BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_IS_NOTIFY_FAILED);
    constants.put(BLE_PERIPHERAL_NOTIFICATION_CHANGED, BLE_PERIPHERAL_NOTIFICATION_CHANGED);
    constants.put(BLE_PERIPHERAL_SET_MTU_OK, BLE_PERIPHERAL_SET_MTU_OK);
    constants.put(BLE_PERIPHERAL_SET_MTU_FAILED, BLE_PERIPHERAL_SET_MTU_FAILED);
    constants.put(BLE_PERIPHERAL_SET_CONN_PRORITY_OK, BLE_PERIPHERAL_SET_CONN_PRORITY_OK);
    constants.put(BLE_PERIPHERAL_SET_CONN_PRORITY_FAILED, BLE_PERIPHERAL_SET_CONN_PRORITY_FAILED);
    constants.put(BLE_PERIPHERAL_CONNECTION_PRIORITY_BALANCED, CONNECTION_PRIORITY_BALANCED);
    constants.put(BLE_PERIPHERAL_CONNECTION_PRIORITY_HIGH, CONNECTION_PRIORITY_HIGH);
    constants.put(BLE_PERIPHERAL_CONNECTION_PRIORITY_DCK, CONNECTION_PRIORITY_DCK);
    constants.put(BLE_PERIPHERAL_CONNECTION_PRIORITY_LOW_POWER, CONNECTION_PRIORITY_LOW_POWER);
    constants.put(BLE_PERIPHERAL_DFU_COMPLIANT, BLE_PERIPHERAL_DFU_COMPLIANT);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_FAILED, BLE_PERIPHERAL_DFU_PROCESS_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_STARTED, BLE_PERIPHERAL_DFU_PROCESS_STARTED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_PAUSED, BLE_PERIPHERAL_DFU_PROCESS_PAUSED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_RESUMED, BLE_PERIPHERAL_DFU_PROCESS_RESUMED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED, BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED, BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED);
    constants.put(BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED);
    // constants.put(BLE_PERIPHERAL_DFU_PROGRESS, BLE_PERIPHERAL_DFU_PROGRESS);
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
    constants.put(DFU_OPTION_RETRIES_NUMBER, DFU_OPTION_RETRIES_NUMBER);
    constants.put(DFU_OPTION_REBOOTING_TIME, DFU_OPTION_REBOOTING_TIME);
    constants.put(FILE_PATH_TYPE_STRING, FILE_PATH_TYPE_STRING);
    constants.put(FILE_PATH_TYPE_URL, FILE_PATH_TYPE_URL);
    //
    constants.put(BLE_PERIPHERAL_STATE_DISCONNECTED, GATT_STATE_DISCONNECTED);
    constants.put(BLE_PERIPHERAL_STATE_CONNECTING, GATT_STATE_CONNECTING);
    constants.put(BLE_PERIPHERAL_STATE_CONNECTED, GATT_STATE_CONNECTED);
    constants.put(BLE_PERIPHERAL_STATE_DISCONNECTING, GATT_STATE_DISCONNECTING);
    constants.put(BLE_PERIPHERAL_STATE_FOUND, GATT_STATE_FOUND);
    constants.put(BLE_PERIPHERAL_STATE_COUNT, GATT_STATE_COUNT);
    constants.put(BLE_PERIPHERAL_STATUS_SUCCESS, GATT_STATUS_SUCCESS);
    constants.put(BLE_PERIPHERAL_STATUS_FAILURE, GATT_STATUS_FAILURE);
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
    sendBleStatus(bluetoothAdapter.getState(), reactContext);
  }

  private static void sendBleStatus(int state, ReactContext reactContext) {
    WritableMap params = Arguments.createMap();
    switch (state) {
      case BluetoothAdapter.STATE_TURNING_ON:
      case BluetoothAdapter.STATE_TURNING_OFF:
        break;
      case BluetoothAdapter.STATE_ON:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_ON);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_DID_UPDATE, params.copy());
        break;
      case BluetoothAdapter.STATE_OFF:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_DID_UPDATE, params.copy());
        break;
      default:
        params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
        BluetoothzModule.sendEvent(reactContext, BLE_ADAPTER_STATUS_UNKNOW, params.copy());
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
        promise.resolve(params.copy());
        break;
      case BluetoothAdapter.STATE_OFF:
      case BluetoothAdapter.STATE_TURNING_OFF:
        params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
        promise.resolve(params.copy());
        break;
      default:
        params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
        promise.resolve(params.copy());
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void searchSync(ReadableArray terms, @Nullable ReadableArray filters, Promise promise) {
    this.searchDeviceHelper.clear();
    for (int i = 0; i<terms.size(); i++){
      String text = terms.getString(i);
      this.searchDeviceHelper.searchTerms.add(text);
      if (isPeripheralConnected(text)) {
        promise.reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device already connected:" + text);
        return;
      }
    }
    this.searchDeviceHelper.searchPromise = promise;
    if (isScanning) {
      stopScan();
    }
    this.scan(null, filters, null);
  }

  @SuppressLint("MissingPermission")
  private void scan(@Nullable ReadableArray services, @Nullable ReadableArray filters, @Nullable ReadableMap options) {
    this.mScanCallback = new LocalScanCallback();
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
    this.allowDuplicates = false;
    this.allowNoNamedDevices = false;
    int keepAliveTimeout = SCAN_WD_KEEP_ALIVE_TIMEOUT_MSEC;
    int refreshRate = SCAN_WD_REFRESH_RATE;
    if (options != null) {
      if (options.hasKey("allowDuplicates")) {
        this.allowDuplicates = options.getBoolean("allowDuplicates");
      }
      if (options.hasKey("allowNoNamed")) {
        this.allowNoNamedDevices = options.getBoolean("allowNoNamed");
      }
      if (options.hasKey("keepAliveTimeout")) {
        keepAliveTimeout = options.getInt("keepAliveTimeout");
      }
      if (options.hasKey("refreshRate")) {
        refreshRate = options.getInt("refreshRate");
      }
    }

    this.scanFilters = null;
    if (filters != null) {
      this.allowNoNamedDevices = false;
      this.scanFilters = new ArrayList<String>();
      for (int i = 0; i < filters.size(); i++) {
        this.scanFilters.add(filters.getString(i));
      }
    }

    ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
    bluetoothLeScanner.startScan(servicesFilter, settings, mScanCallback);
    this.mPeripheralWatchdog = new PeripheralWatchdog(3600000, refreshRate, keepAliveTimeout);
    this.mPeripheralWatchdog.start();
    isScanning = true;
    sendEvent(reactContext, BLE_ADAPTER_SCAN_START, null);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void startScan(@Nullable ReadableArray services, @Nullable ReadableArray filters, @Nullable ReadableMap options) {
    if (isScanning) {
      stopScan();
    }
    scan(services, filters, options);
  }


  @SuppressLint("MissingPermission")
  @ReactMethod
  public void startScanSync(@Nullable ReadableArray services, @Nullable ReadableArray filters, @Nullable ReadableMap options, Promise promise) {
    if (isScanning) {
      stopScan();
    }
    this.scanPromise = promise;
    scan(services, filters, options);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void stopScan() {
    bluetoothAdapter.getBluetoothLeScanner().stopScan(mScanCallback);
    this.mScanCallback = null;
    if (this.mPeripheralWatchdog != null)
      this.mPeripheralWatchdog.cancel();
    isScanning = false;
    if (this.scanPromise != null) {
      WritableArray devicesFound = Arguments.createArray();
      for (Peripheral p : mPeripherals.values()) {
        WritableMap device = Arguments.createMap();
        device.putString("uuid", p.uuid());
        device.putString("name", p.name());
        device.putInt("rssi", p.getLastRSSI());
        devicesFound.pushMap(device);
      }
      this.scanPromise.resolve(devicesFound);
      this.scanPromise = null;
    }
    sendEvent(reactContext, BLE_ADAPTER_SCAN_END, null);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void connect(String uuid, boolean enableDiscover) {
    if (isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      params.putInt("state", GATT_STATE_CONNECTING);
      params.putInt("status", GATT_STATUS_FAILURE);
      sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.enableDiscovering(enableDiscover);
    p.setConnectionStatusPromise(null);
    try {
      final BluetoothDevice device = bluetoothAdapter.getRemoteDevice(uuid);
      device.connectGatt(reactContext, false, mBluetoothGATTCallback);
    } catch (IllegalArgumentException exception) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", exception.getLocalizedMessage());
      params.putInt("state", GATT_STATE_CONNECTING);
      params.putInt("status", GATT_STATUS_FAILURE);
      sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void connectSync(String uuid, Promise promise) {
    if (isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device already connected:" + uuid);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.enableDiscovering(false);
    p.setConnectionStatusPromise(promise);
    try {
      final BluetoothDevice device = bluetoothAdapter.getRemoteDevice(uuid);
      device.connectGatt(reactContext, false, mBluetoothGATTCallback);
    } catch (IllegalArgumentException exception) {
      promise.reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, exception.getLocalizedMessage());
      p.setConnectionStatusPromise(null);
    }
  }

  @ReactMethod
  public void isScanningSync(String uuid, Promise promise) {
    promise.resolve(isScanning);
  }

  private boolean isPeripheralConnected(String match) {
    for (String uuid : mPeripherals.keySet()) {
      if (uuid.compareToIgnoreCase(match) == 0 && mPeripherals.get(uuid).isConnected()) {
        return true;
      }
      Peripheral value = mPeripherals.get(uuid);
      if (value.name().compareToIgnoreCase(match) == 0 && value.isConnected()) {
        return true;
      }
    }
    return false;
//    return ( (mPeripherals.containsKey(uuid) ) && mPeripherals.get(uuid).isConnected());
  }

  private boolean isDiscovered(String uuid) {
    return (mPeripherals.containsKey(uuid));
  }

  @ReactMethod
  public void isConnectedSync(String uuid, Promise promise) {
    promise.resolve(isPeripheralConnected(uuid));
  }

  @ReactMethod
  public void isDFUCompliant(String uuid, Promise promise) {
    promise.resolve(mPeripherals.containsKey(uuid) && mPeripherals.get(uuid).isDfuCompliant());
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void requestMtu(String uuid, int mtu) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_SET_MTU_FAILED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.mBluetoothGATT.requestMtu(mtu);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void requestConnectionPriority(String uuid, int priority) {
    WritableMap params = Arguments.createMap();
    params.putString("uuid", uuid);
    if (!isPeripheralConnected(uuid)) {
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_SET_CONN_PRORITY_FAILED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.mBluetoothGATT.requestConnectionPriority(priority);
    sendEvent(reactContext, BLE_PERIPHERAL_SET_CONN_PRORITY_OK, params.copy());
  }

//  @SuppressLint("MissingPermission")
//  @ReactMethod
//  public void cancel(String uuid) {
//    WritableMap params = Arguments.createMap();
//    params.putString("uuid", uuid);
//
//    if (!mPeripherals.containsKey(uuid)) {
//      params.putString("error", "Device not found:" + uuid);
//      params.putInt("state", GATT_STATE_CONNECTING);
//      params.putInt("status", GATT_STATUS_FAILURE);
//      sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
//      return;
//    }
//    Peripheral p = mPeripherals.get(uuid);
//    p.disconnect();
//    p.flush();
//    params.putInt("state", GATT_STATE_DISCONNECTED);
//    params.putInt("status", GATT_STATUS_SUCCESS);
//    sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
//  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void cancelSync(String uuid, Promise promise) {
    WritableMap params = Arguments.createMap();
    params.putString("uuid", uuid);
    params.putInt("state", GATT_STATE_DISCONNECTED);
    params.putInt("status", GATT_STATUS_SUCCESS);
    promise.resolve(params.copy());
    // if i'm coming from a searchSync, then i will respond to that promise
    if (searchDeviceHelper.searchTerms.contains(uuid)) {
      searchDeviceHelper.searchPromise.resolve(params.copy());
      searchDeviceHelper.clear();
      return;
    }
    // if i'm coming from a connect the peripheral is mandatory
    if (!mPeripherals.containsKey(uuid)) {
      promise.reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Could not find pending connection for that peripheral");
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.disconnect();
    p.flush();
    promise.resolve(params);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void disconnect(String uuid) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      params.putInt("state", GATT_STATE_DISCONNECTING);
      params.putInt("status", GATT_STATUS_FAILURE);
      sendEvent(reactContext, BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.setConnectionStatusPromise(null);
    p.disconnect();
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void disconnectSync(String uuid, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device not connected:" + uuid);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.setConnectionStatusPromise(promise);
    p.disconnect();
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void discoverSync(String uuid, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_DISCOVER_FAILED, "Device not connected:" + uuid);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.setDiscoverPromise(promise);
    p.discover();
  }

  @ReactMethod
  public void getAllServicesSync(String uuid, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED, "peripheral not connected");
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    WritableMap params = Arguments.createMap();
    WritableArray array = Arguments.fromArray(p.allServices());
    params.putArray("services", array);
    promise.resolve(params.copy());
  }

  @ReactMethod
  public void getAllCharacteristicSync(String uuid, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED, "peripheral not connected");
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    WritableMap params = Arguments.createMap();
    WritableArray array = Arguments.fromArray(p.allCharacteristicsUUIDs());
    params.putArray("characteristics", array);
    promise.resolve(params.copy());
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void readCharacteristicValue(String uuid, String charUUID) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.readCharacteristic(charUUID)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Could not read characteristic " + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params.copy());
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void readCharacteristicValueSync(String uuid, String charUUID, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, "peripheral not connected");
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.readCharacteristicSync(charUUID, promise)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, "characteristic not found " + charUUID);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void writeCharacteristicValue(String uuid, String charUUID, ReadableArray value) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params.copy());
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
      params.putString("error", "characteristic not found " + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params.copy());
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void writeCharacteristicValueSync(String uuid, String charUUID, ReadableArray value, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, "peripheral not connected");
      return;
    }
    byte[] byteArr = new byte[value.size()];
    for (int i = 0; i < value.size(); i++) {
      byteArr[i] = (byte) value.getInt(i);
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.writeCharacteristicSync(charUUID, byteArr, promise, 0)) {
      promise.reject(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, "characteristic not found " + charUUID);
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void changeCharacteristicNotification(String uuid, String charUUID, boolean enable) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    if (!p.changeCharacteristicNotification(charUUID, enable)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("charUUID", charUUID);
      params.putString("error", "Could not enable characteristic " + charUUID);
      sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params.copy());
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void changeCharacteristicNotificationSync(String uuid, String charUUID, boolean enable, Promise promise) {
    if (!isPeripheralConnected(uuid)) {
      promise.reject(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, "Could not change notification for characteristic " + charUUID);
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    p.changeCharacteristicNotificationSync(charUUID, enable, promise);
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  public void removeAllNotification(String uuid) {
    if (!isPeripheralConnected(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params.copy());
      return;
    }
    Peripheral p = mPeripherals.get(uuid);
    ArrayList<BluetoothGattCharacteristic> characteristics = p.allCharacteristics();
    for (BluetoothGattCharacteristic myChar:characteristics) {
      p.changeCharacteristicNotification(myChar.getUuid().toString(), false);
    }
    WritableMap params = Arguments.createMap();
    params.putString("uuid", uuid);
    params.putBoolean("success", true);
    sendEvent(reactContext, BLE_PERIPHERAL_ALL_NOTIFICATION_DISABLED, params.copy());
  }

  // @SuppressLint("MissingPermission")
  // @ReactMethod
  // public void isCharacteristicNotifying(String uuid, String charUUID, Promise promise) {
  //   if (!isPeripheralConnected(uuid)) {
  //     WritableMap params = Arguments.createMap();
  //     params.putString("uuid", uuid);
  //     params.putString("error", "Device already disconnected:" + uuid);
  //     sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params.copy());
  //     return;
  //   }
  //   Peripheral p = mPeripherals.get(uuid);
  //   p.characteristicIsNotifyingSync(charUUID, promise);
  // }

  @ReactMethod
  public void startDFU(String uuid, String filePath, String pathType, ReadableMap options) {
    if (!this.mDfuHelper.isAlive()) { // Check if the Dfu daemon is alive, otherwise starts it
      this.mDfuHelper.start();
    }
    this.mDfuHelper.submit(uuid, filePath, pathType, options);
  }

  @ReactMethod
  public void pauseDFU(String uuid) {
    if (!isDiscovered(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED, params.copy());
      return;
    }
    this.mDfuHelper.pauseDfu(uuid);
  }

  @ReactMethod
  public void resumeDFU(String uuid) {
    if (!isDiscovered(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED, params.copy());
      return;
    }
    this.mDfuHelper.resumeDfu(uuid);
  }

  @ReactMethod
  public void abortDFU(String uuid) {
    if (!isDiscovered(uuid)) {
      WritableMap params = Arguments.createMap();
      params.putString("uuid", uuid);
      params.putString("error", "Device already disconnected:" + uuid);
      sendEvent(reactContext, BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, params.copy());
      return;
    }
    this.mDfuHelper.abortDfu(uuid);
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
