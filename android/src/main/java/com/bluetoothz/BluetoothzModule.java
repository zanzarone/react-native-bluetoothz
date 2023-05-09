package com.bluetoothz;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
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
import android.os.Handler;
import android.os.ParcelUuid;
import android.util.Log;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.regex.Pattern;

public class BluetoothzModule extends ReactContextBaseJavaModule {
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
    public static final String BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED = "BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED";
    public static final String BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED = "BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED";
    public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_OK = "BLE_PERIPHERAL_CHARACTERISTIC_READ_OK";
    public static final String BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED";
    public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK";
    public static final String BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED";
    public static final String BLE_PERIPHERAL_NOTIFICATION_UPDATES = "BLE_PERIPHERAL_NOTIFICATION_UPDATES";
    public static final String BLE_PERIPHERAL_NOTIFICATION_CHANGED = "BLE_PERIPHERAL_NOTIFICATION_CHANGED";
    public static final String BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED = "BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED";

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothLeScanner bluetoothLeScanner;
    private Pattern filter;
    private int listenerCount = 0;
    private ReactApplicationContext reactContext;
    private LocalBroadcastReceiver  mLocalBroadcastReceiver     = new LocalBroadcastReceiver();
    private LocalScanCallback  mScanCallback                    = new LocalScanCallback();
    private LocalBluetoothGattCallback  mBluetoothGATTCallback  = new LocalBluetoothGattCallback();
    private HashMap<String, Peripheral> mPeripherals            = new HashMap<String, Peripheral>();

    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

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

    // Device scan callback.
    public class LocalScanCallback extends ScanCallback {
        @SuppressLint("MissingPermission")
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);
//            Log.d("SAMUELE", ""+ result.getDevice().getName());
            BluetoothDevice device = result.getDevice();
            if(device.getName() != null && !device.getName().isEmpty()){
                boolean niceFind = true;
                if(filter != null) {
                    niceFind = filter.matcher(device.getName()).matches();
                }
                if(niceFind) {
//                    Log.d("SAMUELE - no filter", ""+ result.getDevice().getName());
                    WritableMap params = Arguments.createMap();
                    params.putString("uuid", device.getAddress());
                    params.putString("name", device.getName());
                    params.putInt("rssi", result.getRssi());
                    sendEvent(reactContext, BLE_PERIPHERAL_FOUND, params);
                }
            }
        }
    }

    private class LocalBluetoothGattCallback extends BluetoothGattCallback {
        @SuppressLint("MissingPermission")
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            String uuid = gatt.getDevice().getAddress();
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                mPeripherals.put(gatt.getDevice().getAddress(), new Peripheral(gatt));
                WritableMap params = Arguments.createMap();
                params.putString("uuid", uuid);
                Log.w("SAMUELE", "Device CONNECTED!!!!." + uuid);
                sendEvent(reactContext, BLE_PERIPHERAL_CONNECTED, params);
                // Attempts to discover services after successful connection.
                if(mPeripherals.containsKey(gatt.getDevice().getAddress())) {
                    Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
                    p.discover();
                }
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                // disconnected from the GATT Server
                if(mPeripherals.containsKey(gatt.getDevice().getAddress())) {
                    Peripheral p = mPeripherals.remove(gatt.getDevice().getAddress());
                    p.flush();
                }
                WritableMap params = Arguments.createMap();
                params.putString("uuid", uuid);
                Log.w("SAMUELE", "Device DISCONNECTED!!!!." + uuid);
                sendEvent(reactContext, BLE_PERIPHERAL_DISCONNECTED, params);
            }
        }
        @SuppressLint("MissingPermission")
        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.w("SAMUELE", "onServicesDiscovered received: " + gatt.getDevice().getAddress());
                if( mPeripherals.containsKey(gatt.getDevice().getAddress())){
                    List<BluetoothGattService> services = gatt.getServices();
                    Peripheral p = mPeripherals.get(gatt.getDevice().getAddress());
                    for (BluetoothGattService service : services) {
//                        Log.i("SAMUELE", "=>" + service.getUuid().toString());
                        List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
                        for (BluetoothGattCharacteristic c : characteristics) {
//                            Log.i("SAMUELE", "==>" + c.getUuid().toString());
                            WritableMap params = Arguments.createMap();
                            params.putString("uuid", gatt.getDevice().getAddress());
                            params.putString("charUUID", c.getUuid().toString());
                            sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, params);
                            p.setCharacteristic(c);
                        }
                    }
                    WritableMap params = Arguments.createMap();
                    params.putString("uuid", gatt.getDevice().getAddress());
                    sendEvent(reactContext, BLE_PERIPHERAL_READY, params);
                    p.mBluetoothGATT.requestMtu(512);
                    p.mBluetoothGATT.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
                }
            } else {
                Log.e("SAMUELE", "onServicesDiscovered received: " + status);
            }
        }

        @Override
        public void onCharacteristicRead( BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status ) {
            WritableMap params = Arguments.createMap();
            String uuid = gatt.getDevice().getAddress();
            String charUUID = characteristic.getUuid().toString();
            params.putString("uuid", uuid);
            params.putString("charUUID", charUUID);
//            Log.d("POPPI", "" +status);
            if (status == BluetoothGatt.GATT_SUCCESS) {
                String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
                params.putString("value", bufferString);
                sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, params );
            }else{
                sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params );
            }
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            WritableMap params = Arguments.createMap();
            String uuid = characteristic.getUuid().toString();
            params.putString("uuid", uuid);
            if (status == BluetoothGatt.GATT_SUCCESS) {
                String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
                params.putString("value", bufferString);
                sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, params );
            }else{
                sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params );
            }
        }

        @Override
        public void onCharacteristicChanged(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic
        ) {
            String bufferString = BluetoothzModule.bytesToHex(characteristic.getValue());
//            Log.d(" POPPI ", "" + bufferString);
            WritableMap params = Arguments.createMap();
            params.putString("uuid", gatt.getDevice().getAddress());
            params.putString("charUUID", characteristic.getUuid().toString());
            params.putString("value", bufferString);
            sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_UPDATES, params );
        }
        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            Log.w("PORCO", BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE+";;;;"+status + (descriptor.getValue() == BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE));
            if (status == BluetoothGatt.GATT_SUCCESS) {
            }
        }
    };

    public class Peripheral {
        private BluetoothGatt mBluetoothGATT;
        private HashMap<String, Pair<BluetoothGattCharacteristic, Boolean>> mCharacteristic;

        @SuppressLint("MissingPermission")
        public Peripheral(BluetoothGatt gatt){
            this.mBluetoothGATT     = gatt;
            this.mCharacteristic    = new HashMap<>();
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
        }
        @SuppressLint("MissingPermission")
        public void setCharacteristic(BluetoothGattCharacteristic c){
            mCharacteristic.put(c.getUuid().toString(), new Pair<>(c, false));
        }
        @SuppressLint("MissingPermission")
        public void readCharacteristic(String uuid){
            BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
            mBluetoothGATT.readCharacteristic(characteristic);
        }
        @SuppressLint("MissingPermission")
        public void writeCharacteristic(String uuid, byte[] value, int NOT_IMPLEMENTED_type){
            BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
            characteristic.setValue(value);
            mBluetoothGATT.writeCharacteristic(characteristic);
        }
        @SuppressLint("MissingPermission")
        public void changeCharacteristicNotification(String uuid, boolean enable){
            BluetoothGattCharacteristic characteristic = mCharacteristic.get(uuid).first;
            mBluetoothGATT.setCharacteristicNotification(characteristic, enable);
            WritableMap params = Arguments.createMap();
            params.putString("uuid", mBluetoothGATT.getDevice().getAddress());
            params.putString("charUUID", characteristic.getUuid().toString());
            params.putBoolean("enable", enable);
            sendEvent(reactContext, BLE_PERIPHERAL_NOTIFICATION_CHANGED, params );
            BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUID.fromString(Client_Characteristic_Configuration));
            descriptor.setValue( enable ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
            mBluetoothGATT.writeDescriptor(descriptor);
            mCharacteristic.put(uuid, new Pair<>(characteristic, enable));
        }
    }

    public BluetoothzModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.reactContext.registerReceiver(mLocalBroadcastReceiver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
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
        constants.put(BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED, BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED);
        constants.put(BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED);
        constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, BLE_PERIPHERAL_CHARACTERISTIC_READ_OK);
        constants.put(BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED);
        constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK);
        constants.put(BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED);
        constants.put(BLE_PERIPHERAL_NOTIFICATION_UPDATES, BLE_PERIPHERAL_NOTIFICATION_UPDATES);
        constants.put(BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED);
        constants.put(BLE_PERIPHERAL_NOTIFICATION_CHANGED, BLE_PERIPHERAL_NOTIFICATION_CHANGED);
        return constants;
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothZ";
    }

    @ReactMethod
    public void setup() {
        this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            // Device doesn't support Bluetooth
            sendEvent(reactContext, BLE_ADAPTER_STATUS_INVALID, null);
            return;
        }
        sendBleStatus(bluetoothAdapter.getState(), reactContext);
    }

    private static void sendBleStatus(int state, ReactContext reactContext){
        WritableMap params = Arguments.createMap();
        switch (state){
            case BluetoothAdapter.STATE_ON: case BluetoothAdapter.STATE_TURNING_ON:
                params.putString("status", BLE_ADAPTER_STATUS_POWERED_ON);
                BluetoothzModule.sendEvent(reactContext,BLE_ADAPTER_STATUS_DID_UPDATE, params);
                break;
            case BluetoothAdapter.STATE_OFF: case BluetoothAdapter.STATE_TURNING_OFF:
                params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
                BluetoothzModule.sendEvent(reactContext,BLE_ADAPTER_STATUS_DID_UPDATE, params);
                break;
            default:
                params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
                BluetoothzModule.sendEvent(reactContext,BLE_ADAPTER_STATUS_UNKNOW, params);
                break;
        }
    }

    @ReactMethod
    public void status() {
        WritableMap params = Arguments.createMap();
        if (this.bluetoothAdapter == null) {
            sendBleStatus(-1, reactContext);
            return;
        }
        sendBleStatus(bluetoothAdapter.getState(), reactContext);
    }

    @ReactMethod
    public void statusSync(Promise promise) {
        if (bluetoothAdapter == null) {
            promise.reject("status", "could not retrieve status");
            return;
        }
        WritableMap params = Arguments.createMap();
        switch (bluetoothAdapter.getState()) {
            case BluetoothAdapter.STATE_ON: case BluetoothAdapter.STATE_TURNING_ON:
                params.putString("status", BLE_ADAPTER_STATUS_POWERED_ON);
                promise.resolve(params);
                break;
            case BluetoothAdapter.STATE_OFF: case BluetoothAdapter.STATE_TURNING_OFF:
                params.putString("status", BLE_ADAPTER_STATUS_POWERED_OFF);
                promise.resolve(params);
                break;
            default:
                params.putString("status", BLE_ADAPTER_STATUS_UNKNOW);
                promise.resolve(params);
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void startScan(@Nullable ReadableArray services, @Nullable String filter) {
        this.bluetoothLeScanner = BluetoothAdapter.getDefaultAdapter().getBluetoothLeScanner();
        if(this.bluetoothLeScanner != null) {
            ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
            if(filter != null) {
                this.filter = Pattern.compile(filter);
            }
            ArrayList<ScanFilter> servicesFilter = null;
            if(services != null){
                servicesFilter = new ArrayList<>();
                for ( int i =0; i< services.size(); i++) {
                    String serviceUUID = services.getString(i);
                    ScanFilter f = new ScanFilter.Builder().setServiceUuid(new ParcelUuid( UUID.fromString(serviceUUID))).build();
                    servicesFilter.add(f);
                }
            }
            this.bluetoothLeScanner.startScan(servicesFilter, settings, mScanCallback);
            sendEvent(reactContext, BLE_ADAPTER_SCAN_START, null);
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void stopScan() {
        this.bluetoothLeScanner.stopScan(mScanCallback);
        sendEvent(reactContext, BLE_ADAPTER_SCAN_END, null);
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void connect(String uuid) {
        if(mPeripherals.containsKey(uuid)) {
            return;
        }
        try {
//            Log.d("SAMUELE","=====> CONNECT");
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
    public void cancel(String uuid) {
//        Log.d("SAMUELE","=====> CANCEL CONN");
        this.disconnect(uuid);
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void disconnect(String uuid) {
//        Log.d("SAMUELE","=====> DISCONNECT");
        if(!mPeripherals.containsKey(uuid)) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", uuid);
            params.putString("warning", "Device already disconnected:" + uuid);
            Log.w("SAMUELE", "Device already disconnected." + uuid);
            sendEvent(reactContext, BLE_PERIPHERAL_DISCONNECTED, params);
            return;
        }
        Peripheral p = mPeripherals.get(uuid);
        p.disconnect();
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void readCharacteristicValue(String uuid,String charUUID) {
//        Log.d("SAMUELE","=====> readCharacteristicValue");
        if(!mPeripherals.containsKey(uuid)) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", uuid);
            params.putString("charUUID", charUUID);
            params.putString("warning", "Device already disconnected:" + uuid);
            Log.w("SAMUELE", "Device not found with provided address." + uuid);
            sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, params);
            return;
        }
        Peripheral p = mPeripherals.get(uuid);
        p.readCharacteristic(charUUID);
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void writeCharacteristic(String uuid,String charUUID, String value) {
//        Log.d("SAMUELE","=====> writeCharacteristic");
        if(!mPeripherals.containsKey(uuid)) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", uuid);
            params.putString("warning", "Device already disconnected:" + uuid);
            Log.w("SAMUELE", "Device not found with provided address." + uuid);
            sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params);
            return;
        }
        try {
            byte[] byteArr = value.getBytes("UTF-8");
            Peripheral p = mPeripherals.get(uuid);
            p.writeCharacteristic(charUUID, byteArr, 0);
        } catch (UnsupportedEncodingException e) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", uuid);
            params.putString("charUUID", charUUID);
            Log.w("SAMUELE", "Device not found with provided address." + uuid);
            sendEvent(reactContext, BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, params);
            return;
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void changeCharacteristicNotification(String uuid,String charUUID, boolean enable) {
//        Log.d("SAMUELE","=====> changeCharacteristicNotification" + uuid + charUUID + enable);
        if(!mPeripherals.containsKey(uuid)) {
            WritableMap params = Arguments.createMap();
            params.putString("uuid", uuid);
            params.putString("charUUID", charUUID);
            params.putString("warning", "Device already disconnected:" + uuid);
            Log.w("SAMUELE", "Device not found with provided address." + uuid);
            sendEvent(reactContext, BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, params);
            return;
        }
        Peripheral p = mPeripherals.get(uuid);
        p.changeCharacteristicNotification(charUUID, enable);
    }


/**
 
 ================================================================================================================
 ================================================================================================================
 ================================================================================================================
 ================================================================================================================

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
