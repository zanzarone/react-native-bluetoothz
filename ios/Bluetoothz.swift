//
//  BluetoothZ.swift
//
//  Created by Zanzarone on 30/03/23.
//

import Foundation
import React
import CoreBluetooth
import NordicDFU

let BLE_ADAPTER_STATUS_DID_UPDATE                   : String  = "BLE_ADAPTER_STATUS_DID_UPDATE"
let BLE_ADAPTER_STATUS_INVALID                      : String  = "BLE_ADAPTER_STATUS_INVALID"
let BLE_ADAPTER_STATUS_POWERED_ON                   : String  = "BLE_ADAPTER_STATUS_POWERED_ON"
let BLE_ADAPTER_STATUS_POWERED_OFF                  : String  = "BLE_ADAPTER_STATUS_POWERED_OFF"
let BLE_ADAPTER_STATUS_UNKNOW                       : String  = "BLE_ADAPTER_STATUS_UNKNOW"
let BLE_ADAPTER_SCAN_START                          : String  = "BLE_ADAPTER_SCAN_START"
let BLE_ADAPTER_SCAN_END                            : String  = "BLE_ADAPTER_SCAN_END"
let BLE_PERIPHERAL_FOUND                            : String  = "BLE_PERIPHERAL_FOUND"
let BLE_PERIPHERAL_UPDATES                          : String  = "BLE_PERIPHERAL_UPDATES"
let BLE_PERIPHERAL_READY                            : String  = "BLE_PERIPHERAL_READY"
let BLE_PERIPHERAL_READ_RSSI                        : String  = "BLE_PERIPHERAL_READ_RSSI"
let BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED        : String  = "BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED"
let BLE_PERIPHERAL_DISCOVER_FAILED        			: String  = "BLE_PERIPHERAL_DISCOVER_FAILED"
let BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED        : String  = "BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED"
let BLE_PERIPHERAL_CHARACTERISTIC_READ_OK           : String  = "BLE_PERIPHERAL_CHARACTERISTIC_READ_OK"
let BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED       : String  = "BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED"
let BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK          : String  = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK"
let BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED      : String  = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED"
let BLE_PERIPHERAL_NOTIFICATION_UPDATES             : String  = "BLE_PERIPHERAL_NOTIFICATION_UPDATES"
let BLE_PERIPHERAL_NOTIFICATION_CHANGED             : String  = "BLE_PERIPHERAL_NOTIFICATION_CHANGED"
let BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED       : String  = "BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED"
let BLE_PERIPHERAL_DFU_COMPLIANT                    : String  = "BLE_PERIPHERAL_DFU_COMPLIANT";
let BLE_PERIPHERAL_DFU_PROCESS_FAILED               : String  = "BLE_PERIPHERAL_DFU_PROCESS_FAILED";
let BLE_PERIPHERAL_DFU_PROCESS_STARTED              : String  = "BLE_PERIPHERAL_DFU_PROCESS_STARTED";
let BLE_PERIPHERAL_DFU_PROCESS_PAUSED               : String  = "BLE_PERIPHERAL_DFU_PROCESS_PAUSED";
let BLE_PERIPHERAL_DFU_PROCESS_RESUMED              : String  = "BLE_PERIPHERAL_DFU_PROCESS_RESUMED";
let BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED         : String  = "BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED";
let BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED        : String  = "BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED";
let BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED         : String  = "BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED";
let BLE_PERIPHERAL_DFU_DEBUG                        : String  = "BLE_PERIPHERAL_DFU_DEBUG";
let BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE            : String  = "BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE";
let BLE_PERIPHERAL_DFU_STATUS_ABORTED               : String  = "BLE_PERIPHERAL_DFU_STATUS_ABORTED";
let BLE_PERIPHERAL_DFU_STATUS_STARTING              : String  = "BLE_PERIPHERAL_DFU_STATUS_STARTING";
let BLE_PERIPHERAL_DFU_STATUS_STARTED               : String  = "BLE_PERIPHERAL_DFU_STATUS_STARTED";
let BLE_PERIPHERAL_DFU_STATUS_COMPLETED             : String  = "BLE_PERIPHERAL_DFU_STATUS_COMPLETED";
let BLE_PERIPHERAL_DFU_STATUS_UPLOADING             : String  = "BLE_PERIPHERAL_DFU_STATUS_UPLOADING";
let BLE_PERIPHERAL_DFU_STATUS_CONNECTING            : String  = "BLE_PERIPHERAL_DFU_STATUS_CONNECTING";
let BLE_PERIPHERAL_DFU_STATUS_CONNECTED             : String  = "BLE_PERIPHERAL_DFU_STATUS_CONNECTED";
let BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED          : String  = "BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED";
let BLE_PERIPHERAL_DFU_STATUS_VALIDATING            : String  = "BLE_PERIPHERAL_DFU_STATUS_VALIDATING";
let BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING         : String  = "BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING";
let BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU          : String  = "BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU";
// =====================================================================================================================
// =====================================================================================================================
//                                                  DEFINES
// =====================================================================================================================
// =====================================================================================================================
let DFU_OPTION_ENABLE_DEBUG                             : String  = "DFU_OPTION_ENABLE_DEBUG";
let DFU_OPTION_PACKET_DELAY                             : String  = "DFU_OPTION_PACKET_DELAY";
let FILE_PATH_TYPE_STRING                               : String  = "FILE_PATH_TYPE_STRING";
let FILE_PATH_TYPE_URL                                  : String  = "FILE_PATH_TYPE_URL";
let BLE_PERIPHERAL_STATE_CONNECTED     : String  = "BLE_PERIPHERAL_STATE_CONNECTED";
let BLE_PERIPHERAL_STATE_CONNECTING    : String  = "BLE_PERIPHERAL_STATE_CONNECTING";
let BLE_PERIPHERAL_STATE_DISCONNECTED  : String  = "BLE_PERIPHERAL_STATE_DISCONNECTED";
let BLE_PERIPHERAL_STATE_DISCONNECTING : String  = "BLE_PERIPHERAL_STATE_DISCONNECTING";
let BLE_PERIPHERAL_STATE_FOUND         : String  = "BLE_PERIPHERAL_STATE_FOUND";
let BLE_PERIPHERAL_STATE_COUNT : String  = "BLE_PERIPHERAL_STATE_COUNT";
let BLE_PERIPHERAL_STATUS_SUCCESS : String  = "BLE_PERIPHERAL_STATUS_SUCCESS";
let BLE_PERIPHERAL_STATUS_FAILURE : String  = "BLE_PERIPHERAL_STATUS_FAILURE";
// =====================================================================================================================
// =====================================================================================================================
//                                                  PRIVATE DEFINES
// =====================================================================================================================
// =====================================================================================================================
let DFU_SERVICE_UUID                                    : String  = "FE59";
let SCAN_WD_KEEP_ALIVE_TIMEOUT_MSEC 					: Double = 5.0
let SCAN_WD_REFRESH_RATE 								: TimeInterval = 1.0;
let GATT_STATE_DISCONNECTED								= 0;
let GATT_STATE_CONNECTING                               = 1;
let GATT_STATE_CONNECTED								= 2;
let GATT_STATE_DISCONNECTING							= 3;
let GATT_STATE_FOUND									= 4;
let GATT_STATE_COUNT									= 5;
let GATT_STATUS_SUCCESS									= 0;
let GATT_STATUS_FAILURE									= 257;



public extension Data {
	private static let hexAlphabet = Array("0123456789abcdef".unicodeScalars)
	func hexStringEncoded() -> String {
		String(reduce(into: "".unicodeScalars) { result, value in
			result.append(Self.hexAlphabet[Int(value / 0x10)])
			result.append(Self.hexAlphabet[Int(value % 0x10)])
		})
	}

	var bytes: [UInt8] {
		var byteArray = [UInt8](repeating: 0, count: self.count)
		self.copyBytes(to: &byteArray, count: self.count)
		return byteArray
	}
}

public extension String {
	private static let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	static func randomString(length: Int) -> String {
		return String((0..<length).map { _ in Self.letters.randomElement()! })
	}
}

class Peripheral {
	private var gattServer          : CBPeripheral!
	private var services            : [String:CBService] = [:]
	private var characteristics     : [String:CBCharacteristic] = [:]
	private var connected           : Bool = false
	private var lastRSSI            : NSNumber!
	private var dfuCompliant        : Bool = false
	private var lastSeen            : TimeInterval
	private var enableDiscover      : Bool = false
	var connectionStatusPromises    :(RCTPromiseResolveBlock, RCTPromiseRejectBlock)?
	var discoverPromise    :(RCTPromiseResolveBlock, RCTPromiseRejectBlock)?
	//	var disconnectPromises  		:(RCTPromiseResolveBlock, RCTPromiseRejectBlock)?
	/// - Device specific promises -- CHARS
	var readValuePromises   		: [String: (RCTPromiseResolveBlock, RCTPromiseRejectBlock)] = [:]
	var writeValuePromises  		: [String: (RCTPromiseResolveBlock, RCTPromiseRejectBlock)] = [:]


	init(_ p:CBPeripheral, rssi: NSNumber, delegate: BluetoothZ) {
		gattServer = p
		lastRSSI = rssi
		gattServer.delegate = delegate
		lastSeen = 0
	}

	func getLastRSSI() -> NSNumber {
		return self.lastRSSI
	}

	func getLastSeen() -> TimeInterval {
		return self.lastSeen
	}

	func setLastRSSI(rssi:NSNumber) -> Void {
		self.lastRSSI = rssi
	}

	func setLastSeen(ls:TimeInterval) -> Void {
		self.lastSeen = ls
	}

	func setDfuCompliant(compliant: Bool) {
		self.dfuCompliant = compliant
	}

	func isDfuCompliant() -> Bool {
		return self.dfuCompliant
	}

	func setEnableDisovering(enable: Bool) {
		self.enableDiscover = enable
	}

	func discoverEnable() -> Bool {
		return self.enableDiscover
	}

	func getGATTServer() -> CBPeripheral {
		return self.gattServer
	}

	func isConnected() -> Bool {
		return connected
	}

	func setConnected(_ connected:Bool) {
		self.connected = connected
	}

	func discoverServices(_ servicesUUIDs:[CBUUID]?) {
		self.gattServer.discoverServices(servicesUUIDs)
	}

	func servicesDiscovered() -> Int {
		return services.count
	}

	func allServices() -> [String] {
		return self.services.keys.reversed()
	}

	func allCharacteristics() -> [String] {
		return self.characteristics.keys.reversed()
	}

	func setServicesAndDiscoverCharacteristics(_ s:[CBService]){
		for i in 0..<s.count {
			let service = s[i]
			self.services[service.uuid.uuidString] = service
			if service.uuid.uuidString.compare(DFU_SERVICE_UUID, options: .caseInsensitive) == .orderedSame {
				self.setDfuCompliant(compliant: true)
			}
			self.gattServer.discoverCharacteristics([], for: service)
		}
	}

	func setCharacteristic(_ c:CBCharacteristic, forServiceUUID uuid: String){
		self.characteristics[c.uuid.uuidString] = c
		services.removeValue(forKey: uuid)
	}

	func flush() {
		self.characteristics.removeAll()
		self.services.removeAll()
		self.connected = false
		self.dfuCompliant = false
	}

	func readCharacteristic(_ uuid:String) -> Bool {
		if let ch = self.characteristics[uuid] {
			self.gattServer.readValue(for: ch)
			return true
		}
		return false
	}

	func writeCharacteristic(_ uuid:String, value:NSArray) -> Bool {
		if let ch = self.characteristics[uuid] {
			var array : [UInt8] = []
			for i in 0..<value.count {
				array.append(value[i] as! UInt8)
			}
			self.gattServer.writeValue(Data(array), for: ch, type: .withResponse)
			return true
		}
		return false
	}

	func changeCharacteristicNotification(_ uuid:String, enable:Bool) -> Bool {
		if let ch = self.characteristics[uuid] {
			self.gattServer.setNotifyValue(enable, for: ch)
			return true
		}
		return false
	}

	func isNotifying(_ uuid:String) -> Bool {
		guard let ch = self.characteristics[uuid] else {
			return false
		}
		return ch.isNotifying
	}
}

class SyncHelper {
	/// Common promises
	var scanResolve     : RCTPromiseResolveBlock?
	var scanReject      : RCTPromiseRejectBlock?
	/// - Device specific promises -- DFU PROPS
	var processResolve     : RCTPromiseResolveBlock?
	var processReject      : RCTPromiseRejectBlock?
}

@objc(BluetoothZ)
class BluetoothZ: RCTEventEmitter, CBCentralManagerDelegate, CBPeripheralDelegate
{
	/// PROPS
	var centralManager        : CBCentralManager? = nil
	var peripherals           : [String:Peripheral] = [:]
	var scanFilter            : String? = nil
	var scanWatchdog          : Timer?
	var allowDuplicates       : Bool?
	var keepAliveTimeout      : Double = SCAN_WD_KEEP_ALIVE_TIMEOUT_MSEC
	var dfu                   : Dfu!
	var syncHelper            : SyncHelper = SyncHelper()


	private func isConnected(uuidString:String) -> Bool {
		return self.peripherals.contains(where: { (key: String, value: Peripheral) -> Bool in
			return key.compare(uuidString) == .orderedSame && value.isConnected()
		})
	}

	private func isDiscovered(uuidString:String) -> Bool {
		return self.peripherals.contains(where: { (key: String, value: Peripheral) -> Bool in
			return key.compare(uuidString) == .orderedSame
		})
	}

	@objc
	override static func requiresMainQueueSetup() -> Bool
	{
		/// ("========================>>>> requiresMainQueueSetup")
		return true;
	}

	override func supportedEvents() -> [String]!
	{
		return [
			BLE_ADAPTER_STATUS_DID_UPDATE,
			BLE_ADAPTER_STATUS_INVALID,
			BLE_ADAPTER_STATUS_POWERED_ON,
			BLE_ADAPTER_STATUS_POWERED_OFF,
			BLE_ADAPTER_STATUS_UNKNOW,
			BLE_ADAPTER_SCAN_START,
			BLE_ADAPTER_SCAN_END,
			BLE_PERIPHERAL_FOUND,
			BLE_PERIPHERAL_UPDATES,
			BLE_PERIPHERAL_READY,
			BLE_PERIPHERAL_READ_RSSI,
			BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED,
			BLE_PERIPHERAL_DISCOVER_FAILED,
			BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
			BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
			BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
			BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
			BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
			BLE_PERIPHERAL_NOTIFICATION_UPDATES,
			BLE_PERIPHERAL_NOTIFICATION_CHANGED,
			BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED,
			BLE_PERIPHERAL_DFU_COMPLIANT,
			BLE_PERIPHERAL_DFU_PROCESS_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_STARTED,
			BLE_PERIPHERAL_DFU_PROCESS_PAUSED,
			BLE_PERIPHERAL_DFU_PROCESS_RESUMED,
			BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED,
			BLE_PERIPHERAL_DFU_DEBUG,
			BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
			BLE_PERIPHERAL_DFU_STATUS_ABORTED,
			BLE_PERIPHERAL_DFU_STATUS_STARTING,
			BLE_PERIPHERAL_DFU_STATUS_STARTED,
			BLE_PERIPHERAL_DFU_STATUS_COMPLETED,
			BLE_PERIPHERAL_DFU_STATUS_UPLOADING,
			BLE_PERIPHERAL_DFU_STATUS_CONNECTING,
			BLE_PERIPHERAL_DFU_STATUS_CONNECTED,
			BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED,
			BLE_PERIPHERAL_DFU_STATUS_VALIDATING,
			BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING,
			BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU,
		]
	}

	@objc
	override func constantsToExport() -> [AnyHashable : Any]!
	{
		return [
			BLE_ADAPTER_STATUS_DID_UPDATE:BLE_ADAPTER_STATUS_DID_UPDATE,
			BLE_ADAPTER_STATUS_INVALID:BLE_ADAPTER_STATUS_INVALID,
			BLE_ADAPTER_STATUS_POWERED_ON:BLE_ADAPTER_STATUS_POWERED_ON,
			BLE_ADAPTER_STATUS_POWERED_OFF:BLE_ADAPTER_STATUS_POWERED_OFF,
			BLE_ADAPTER_STATUS_UNKNOW:BLE_ADAPTER_STATUS_UNKNOW,
			BLE_ADAPTER_SCAN_START:BLE_ADAPTER_SCAN_START,
			BLE_ADAPTER_SCAN_END:BLE_ADAPTER_SCAN_END,
			BLE_PERIPHERAL_FOUND:BLE_PERIPHERAL_FOUND,
			BLE_PERIPHERAL_UPDATES:BLE_PERIPHERAL_UPDATES,
			BLE_PERIPHERAL_READY:BLE_PERIPHERAL_READY,
			BLE_PERIPHERAL_READ_RSSI:BLE_PERIPHERAL_READ_RSSI,
			BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED:BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED,
			BLE_PERIPHERAL_DISCOVER_FAILED:BLE_PERIPHERAL_DISCOVER_FAILED,
			BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED:BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
			BLE_PERIPHERAL_CHARACTERISTIC_READ_OK:BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
			BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED:BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
			BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK:BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
			BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED:BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
			BLE_PERIPHERAL_NOTIFICATION_UPDATES:BLE_PERIPHERAL_NOTIFICATION_UPDATES,
			BLE_PERIPHERAL_NOTIFICATION_CHANGED:BLE_PERIPHERAL_NOTIFICATION_CHANGED,
			BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED:BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED,
			BLE_PERIPHERAL_DFU_COMPLIANT:BLE_PERIPHERAL_DFU_COMPLIANT,
			BLE_PERIPHERAL_DFU_PROCESS_FAILED:BLE_PERIPHERAL_DFU_PROCESS_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_STARTED:BLE_PERIPHERAL_DFU_PROCESS_STARTED,
			BLE_PERIPHERAL_DFU_PROCESS_PAUSED:BLE_PERIPHERAL_DFU_PROCESS_PAUSED,
			BLE_PERIPHERAL_DFU_PROCESS_RESUMED:BLE_PERIPHERAL_DFU_PROCESS_RESUMED,
			BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED:BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED:BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED,
			BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED:BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED,
			BLE_PERIPHERAL_DFU_DEBUG:BLE_PERIPHERAL_DFU_DEBUG,
			BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE:BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
			BLE_PERIPHERAL_DFU_STATUS_ABORTED:BLE_PERIPHERAL_DFU_STATUS_ABORTED,
			BLE_PERIPHERAL_DFU_STATUS_STARTING:BLE_PERIPHERAL_DFU_STATUS_STARTING,
			BLE_PERIPHERAL_DFU_STATUS_STARTED:BLE_PERIPHERAL_DFU_STATUS_STARTED,
			BLE_PERIPHERAL_DFU_STATUS_COMPLETED:BLE_PERIPHERAL_DFU_STATUS_COMPLETED,
			BLE_PERIPHERAL_DFU_STATUS_UPLOADING:BLE_PERIPHERAL_DFU_STATUS_UPLOADING,
			BLE_PERIPHERAL_DFU_STATUS_CONNECTING:BLE_PERIPHERAL_DFU_STATUS_CONNECTING,
			BLE_PERIPHERAL_DFU_STATUS_CONNECTED:BLE_PERIPHERAL_DFU_STATUS_CONNECTED,
			BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED:BLE_PERIPHERAL_DFU_STATUS_DISCONNECTED,
			BLE_PERIPHERAL_DFU_STATUS_VALIDATING:BLE_PERIPHERAL_DFU_STATUS_VALIDATING,
			BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING:BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING,
			BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU:BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU,
			DFU_OPTION_ENABLE_DEBUG:DFU_OPTION_ENABLE_DEBUG,
			DFU_OPTION_PACKET_DELAY:DFU_OPTION_PACKET_DELAY,
			FILE_PATH_TYPE_STRING:FILE_PATH_TYPE_STRING,
			FILE_PATH_TYPE_URL:FILE_PATH_TYPE_URL,
			//
			BLE_PERIPHERAL_STATE_DISCONNECTED:GATT_STATE_DISCONNECTED,
			BLE_PERIPHERAL_STATE_CONNECTING:GATT_STATE_CONNECTING,
			BLE_PERIPHERAL_STATE_CONNECTED:GATT_STATE_CONNECTED,
			BLE_PERIPHERAL_STATE_DISCONNECTING:GATT_STATE_DISCONNECTING,
			BLE_PERIPHERAL_STATE_FOUND:BLE_PERIPHERAL_STATE_FOUND,
			BLE_PERIPHERAL_STATE_COUNT:GATT_STATE_COUNT,
			BLE_PERIPHERAL_STATUS_SUCCESS:GATT_STATUS_SUCCESS,
			BLE_PERIPHERAL_STATUS_FAILURE:GATT_STATUS_FAILURE,
		]
	}

	@objc
	func setup()
	{
		/// ("========================>>>> setup")
		if(centralManager == nil) {
			self.centralManager =  CBCentralManager(delegate: self, queue: nil)
		}
		dfu = Dfu(queueCount: 3, callback: self.sendEvent(withName:body:))
	}

	@objc
	func statusSync(_ resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
		if let manager = self.centralManager {
			//      resolve(NSNumber(value:manager.state.rawValue))
			switch manager.state {
			case .poweredOff: resolve( ["status":  BLE_ADAPTER_STATUS_POWERED_OFF] )
				break
			case .poweredOn: resolve( ["status":  BLE_ADAPTER_STATUS_POWERED_ON] )
				break
			default:
				resolve( ["status":  BLE_ADAPTER_STATUS_UNKNOW] )
				break
			}
		}else{
			reject("status", "could not retrieve status", nil)
		}
	}

	@objc
	func status() {
		if let manager = self.centralManager {
			switch manager.state {
			case .poweredOff:
				self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: [ "status": BLE_ADAPTER_STATUS_POWERED_OFF])
				break
			case .poweredOn:
				self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: [ "status": BLE_ADAPTER_STATUS_POWERED_ON])
				break
			default:
				self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: [ "status": BLE_ADAPTER_STATUS_UNKNOW])
				break
			}
		}else{
			self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: [ "status": BLE_ADAPTER_STATUS_UNKNOW])
		}
	}

	private func scan(_ serviceUUIDs: [String]? = nil, deviceNameFilter:String? = nil, options:NSDictionary) {
		/// ("========================>>>> startScan")
		if let isScanning = self.centralManager?.isScanning, isScanning {
			self.stopScan()
		}
		var services : [CBUUID] = []
		if let uuids = serviceUUIDs{
			for uuid in uuids {
				services.append(CBUUID(string: uuid))
			}
		}
		self.scanFilter = nil
		if let pattern = deviceNameFilter {
			self.scanFilter = pattern
		}
		self.allowDuplicates = false
		var refreshRate = SCAN_WD_REFRESH_RATE;
		if let opt = options as? [String: Any]{
			if let duplicates = opt["allowDuplicates"] as? Bool {
				self.allowDuplicates = duplicates
			}
			if let ka = opt["keepAliveTimeout"] as? Int {
				self.keepAliveTimeout = Double(ka) / 1000.0
			}
			if let rr = opt["refreshRate"] as? Int {
				refreshRate = TimeInterval(rr / 1000)
			}
		}
		// self.peripherals.removeAll()
		self.peripherals = self.peripherals.filter { $0.value.isConnected() == true }
		self.centralManager?.scanForPeripherals(withServices: services, options: [CBCentralManagerScanOptionAllowDuplicatesKey:true])
		DispatchQueue.main.async {
			self.scanWatchdog = Timer.scheduledTimer(timeInterval: refreshRate, target: self, selector: #selector(self.watcher), userInfo: nil, repeats: true)
		}
	}

	@objc func watcher() {
		let currentTimeInSeconds = Date().timeIntervalSince1970
		let result = self.peripherals.filter { currentTimeInSeconds - $0.value.getLastSeen() < self.keepAliveTimeout || $0.value.isConnected() }
		var devices : [[String:Any]] = []
		for p in result.values {
			var el : [String:Any] = [:]
			el["uuid"] = p.getGATTServer().identifier.uuidString
			el["name"] = p.getGATTServer().name
			el["dfuCompliant"] = p.isDfuCompliant()
			el["rssi"] = p.getLastRSSI()
			devices.append(el)
		}
		self.sendEvent(withName: BLE_PERIPHERAL_UPDATES, body: ["devices":devices])
	}

	@objc
	func startScan(_ serviceUUIDs: [String]? = nil, deviceNameFilter:String? = nil, options:NSDictionary)
	{
		scan(serviceUUIDs, deviceNameFilter: deviceNameFilter, options: options)
		self.sendEvent(withName: BLE_ADAPTER_SCAN_START, body: nil)
	}

	@objc
	func startScanSync(_ serviceUUIDs: [String]? = nil, deviceNameFilter:String? = nil, options:NSDictionary, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		scan(serviceUUIDs, deviceNameFilter: deviceNameFilter, options: options)
	}

	@objc
	func reconnectSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		print ("SAMU - ========================>>>> reconnectSync")
		/// i'm already connected to a device
		if self.isConnected(uuidString: uuidString) {
			print ("SAMU - ========================>>>> reconnectSync - isConnected")
			rejecter(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device already connected: \(uuidString)", nil)
			return
		}
		if let targetPeripheralUUID = UUID(uuidString: uuidString), let knownPeripheral = self.centralManager?.retrievePeripherals(withIdentifiers: [targetPeripheralUUID]).first {
			let p : Peripheral = Peripheral(knownPeripheral, rssi: 0, delegate:self)
			p.setEnableDisovering(enable: false)
			p.connectionStatusPromises = (resolve, rejecter)
			self.peripherals[uuidString] = p
			self.centralManager?.connect(p.getGATTServer(), options: nil)
		} else {
			rejecter(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Peripheral not found: \(uuidString)", nil)
		}
	}

	@objc
	func stopScan()
	{
		/// ("========================>>>> stopScan")
		DispatchQueue.main.async {
			self.scanWatchdog?.invalidate()
			self.scanWatchdog = nil
		}
		self.centralManager?.stopScan()
		if let resolve = self.syncHelper.scanResolve {
			var devices : [[String:Any]] = []
			for peripheral in self.peripherals.values {
				var device : [String:Any] = [:]
				device["uuid"] = peripheral.getGATTServer().identifier.uuidString
				device["name"] = peripheral.getGATTServer().name
				device["rssi"] = peripheral.getLastRSSI()
				devices.append(device)
			}
			resolve(devices)
			///
		}else {
			self.sendEvent(withName: BLE_ADAPTER_SCAN_END, body: nil)
		}
	}

	@objc
	func connect(_ uuidString: String, enableDiscover:Bool)
	{
		print ("SAMU - ========================>>>> connect")
		/// i'm already connected to a device
		if self.isConnected(uuidString: uuidString) {
			print ("SAMU - ========================>>>> connect - isConnected")
			return
		}
		let p = self.peripherals[uuidString]!
		p.setEnableDisovering(enable: enableDiscover)
		self.centralManager?.connect(p.getGATTServer(), options: nil)
	}

	@objc
	func connectSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		print ("SAMU - ========================>>>> connect")
		/// i'm already connected to a device
		if self.isConnected(uuidString: uuidString) {
			print ("SAMU - ========================>>>> connect - isConnected")
			rejecter(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device already connected: \(uuidString)", nil)
			return
		}
		let p = self.peripherals[uuidString]!
		p.setEnableDisovering(enable: false)
		p.connectionStatusPromises = (resolve, rejecter)
		self.centralManager?.connect(p.getGATTServer(), options: nil)
	}

	@objc
	func isConnectedSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		resolve( self.isConnected(uuidString: uuidString) );
	}

	@objc
	func isDfuCompliantSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		let compliant = self.peripherals.contains(where: { (key: String, value: Peripheral) -> Bool in
			return key.compare(uuidString) == .orderedSame && value.isDfuCompliant()
		})
		resolve( compliant );
	}

//	@objc
//	func cancel(_ uuidString: String)
//	{
//		guard let peripheral = self.peripherals[uuidString]  else {
//			self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body:["uuid": uuidString, "status": GATT_STATUS_FAILURE, "state": GATT_STATE_CONNECTING])
//			return
//		}
//		let gattServer = peripheral.getGATTServer()
//		self.centralManager?.cancelPeripheralConnection(gattServer)
//		peripheral.flush();
//	}

	@objc
	func cancelSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		guard let peripheral = self.peripherals[uuidString]  else {
			rejecter(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device not found: \(uuidString)",nil)
			return
		}
		let gattServer = peripheral.getGATTServer()
		self.centralManager?.cancelPeripheralConnection(gattServer)
		peripheral.flush();
		resolve(["uuid": uuidString, "status": BLE_PERIPHERAL_STATUS_SUCCESS, "state": BLE_PERIPHERAL_STATE_DISCONNECTED])
	}

	@objc
	func disconnect(_ uuidString: String)
	{
		if !self.isConnected(uuidString: uuidString) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body:["uuid": uuidString, "status": GATT_STATUS_FAILURE, "state": GATT_STATE_DISCONNECTING])
			return
		}
		let p : Peripheral = self.peripherals[uuidString]!
		self.centralManager?.cancelPeripheralConnection(p.getGATTServer())
	}

	@objc
	func disconnectSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		if !self.isConnected(uuidString: uuidString) {
			/// i need to disconnect the current device before attempting a new connection
			rejecter(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, "Device not connected: \(uuidString)", nil)
			return
		}
		let p : Peripheral = self.peripherals[uuidString]!
		p.connectionStatusPromises = (resolve, rejecter)
		self.centralManager?.cancelPeripheralConnection(p.getGATTServer())
	}

	@objc
	func discoverSync(_ uuidString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
	{
		if !self.isConnected(uuidString: uuidString) {
			/// i need to disconnect the current device before attempting a new connection
			rejecter(BLE_PERIPHERAL_DISCOVER_FAILED, "Device not connected: \(uuidString)", nil)
			return
		}
		let p : Peripheral = self.peripherals[uuidString]!
		p.discoverPromise = (resolve, rejecter)
		p.discoverServices([])
	}

	@objc
	func getAllServicesSync(_ uuid:String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void {
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			rejecter("status", "peripheral not found with uuid:\(uuid)", nil)
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		resolve( ["services":  p.allServices()] )
	}

	@objc
	func getAllCharacteristicSync(_ uuid:String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void {
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			rejecter("status", "peripheral not found with uuid:\(uuid)", nil)
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		resolve( ["characteristics":  p.allCharacteristics()] )
	}

	@objc
	func readCharacteristicValue(_ uuid:String, charUUID:String)
	{
		/// ("========================>>>> readCharacteristicValue")
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "peripheral not found with uuid:\(uuid)"])
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		p.readValuePromises.removeValue(forKey: charUUID)
		if !p.readCharacteristic(charUUID) {
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "characteristic not found for uuid:\(uuid)"])
		}
	}

	@objc
	func readCharacteristicValueSync(_ uuid:String, charUUID:String, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void
	{
		/// ("========================>>>> readCharacteristicValue")
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			rejecter("status", "peripheral not found with uuid:\(uuid)", nil)
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		p.readValuePromises[charUUID] = (resolve, rejecter)
		if !p.readCharacteristic(charUUID) {
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "characteristic not found with uuid:\(uuid)"])
		}
	}

	@objc
	func writeCharacteristicValue(_ uuid:String, charUUID:String, value:NSArray)
	{
		/// ("========================>>>> readCharacteristicValue")
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "peripheral not found with uuid:\(uuid)"])
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		p.writeValuePromises.removeValue(forKey: charUUID)
		if !p.writeCharacteristic(charUUID, value: value) {
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "characteristic not found with uuid:\(uuid)"])
		}
	}

	@objc
	func writeCharacteristicValueSync(_ uuid:String, charUUID:String, value:NSArray, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void
	{
		/// ("========================>>>> readCharacteristicValue")
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "peripheral not found with uuid:\(uuid)"])
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		p.writeValuePromises[charUUID] = (resolve, rejecter)
		if !p.writeCharacteristic(charUUID, value: value) {
			self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "characteristic not found with uuid:\(uuid)"])
		}
	}

	@objc
	func changeCharacteristicNotification(_ uuid:String, charUUID:String, enable:Bool)
	{
		if !self.isConnected(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "peripheral not found with uuid:\(uuid)"])
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		if !p.changeCharacteristicNotification(charUUID, enable: enable) {
			self.sendEvent(withName: BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "error": "characteristic not found with uuid:\(uuid)"])
		}
	}

	@objc
	func startDFU(_ uuid: String , filePath:String , pathType:String , options:NSDictionary)
	{
		if !self.isDiscovered(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_DFU_PROCESS_FAILED, body: ["uuid": uuid, "error": "peripheral with uuid:\(uuid) still connected!"])
			return
		}
		let p : Peripheral = self.peripherals[uuid]!
		dfu.startDfu(peripheral: p.getGATTServer(), filePath: filePath, pathType: pathType, options: options)
	}

	@objc
	func pauseDFU(_ uuid: String )
	{
		if !self.isDiscovered(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED, body: ["uuid": uuid, "error": "Device with uuid:\(uuid) already disconnected!"])
			return
		}
		dfu.pauseDfu(uuid: uuid)
	}

	@objc
	func resumeDFU(_ uuid: String )
	{
		if !self.isDiscovered(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED, body: ["uuid": uuid, "error": "Device with uuid:\(uuid) already disconnected!"])
			return
		}
		dfu.resumeDfu(uuid: uuid)
	}

	@objc
	func abortDFU(_ uuid: String )
	{
		if !self.isDiscovered(uuidString: uuid) {
			/// i need to disconnect the current device before attempting a new connection
			self.sendEvent(withName: BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED, body: ["uuid": uuid, "error": "Device with uuid:\(uuid) already disconnected!"])
			return
		}
		dfu.abortDfu(uuid: uuid)
	}

	/// =======================================================================================================================================
	/// =======================================================================================================================================
	/// =======================================================================================================================================
	/// ===============  BLE DELEGATE
	/// =======================================================================================================================================
	/// =======================================================================================================================================
	/// =======================================================================================================================================
	func centralManagerDidUpdateState(_ central: CBCentralManager)
	{
		/// ("========================>>>> centralManagerDidUpdateState")
		switch central.state {
		case .poweredOff: self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: ["status":  BLE_ADAPTER_STATUS_POWERED_OFF])
			break
		case .poweredOn: self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: ["status":  BLE_ADAPTER_STATUS_POWERED_ON])
			break
		default:
			self.sendEvent(withName: BLE_ADAPTER_STATUS_DID_UPDATE, body: ["status":  BLE_ADAPTER_STATUS_UNKNOW])
			break
		}
	}

	func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber)
	{
		guard let name = peripheral.name else {
			return
		}
		var niceFind = true
		if let pattern = self.scanFilter
		{
			niceFind = name.range(of: pattern, options: .caseInsensitive) != nil
		}
		let lastSeen = Date().timeIntervalSince1970
		if niceFind, let allow = self.allowDuplicates, allow == false  {
			niceFind = !self.peripherals.keys.contains(peripheral.identifier.uuidString)
			if !niceFind {
				let p = self.peripherals[peripheral.identifier.uuidString]!
				p.setLastRSSI(rssi: RSSI)
				p.setLastSeen(ls: lastSeen)
			}
		}
		if niceFind {
			let p : Peripheral = Peripheral(peripheral, rssi: RSSI, delegate:self)
			p.setLastSeen(ls: lastSeen)
			self.peripherals[peripheral.identifier.uuidString] = p
			if self.syncHelper.scanResolve == nil {
				self.sendEvent(withName: BLE_PERIPHERAL_FOUND, body: ["uuid":  peripheral.identifier.uuidString , "name":  peripheral.name!, "rssi": RSSI])
			}
		}
	}

	func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral)
	{
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			let uuid =  peripheral.identifier.uuidString
			let body : [String:Any]  = ["uuid": uuid, "status": GATT_STATUS_SUCCESS, "state": GATT_STATE_CONNECTED]
			p.setConnected(true)
			if let promises = p.connectionStatusPromises {
				let resolve = promises.0
				resolve(body)
				p.connectionStatusPromises = nil
			}else{
				self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body: body)
			}
			if p.discoverEnable() {
				p.discoverServices([])
			}
		}
	}

	func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?)
	{
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			let uuid =  peripheral.identifier.uuidString
			var body : [String:Any]  = ["uuid": uuid, "status": GATT_STATUS_SUCCESS, "state": GATT_STATE_DISCONNECTED]
			if let error = error {
				body["state"] = GATT_STATE_DISCONNECTING
				body["status"] = GATT_STATUS_FAILURE
				if let promises = p.connectionStatusPromises {
					let failure = promises.1
					failure(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, error.localizedDescription, nil)
					p.connectionStatusPromises = nil
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body: body)
				}
			}else{
				if let promises = p.connectionStatusPromises  {
					let resolve = promises.0
					resolve(body)
					p.connectionStatusPromises = nil
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body: body)
				}
			}
			p.flush()
		}
	}

	func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?)
	{
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			let uuid = peripheral.identifier.uuidString
			var body : [String : Any] = ["uuid": uuid, "status": GATT_STATUS_FAILURE, "state": GATT_STATE_CONNECTING]
			if let error = error {
				body["error"] = error.localizedDescription
			}
			if let promises = p.connectionStatusPromises {
				let reject = promises.1
				reject(BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, error != nil ? error!.localizedDescription : nil, nil)
				p.connectionStatusPromises = nil
			}else{
				self.sendEvent(withName: BLE_PERIPHERAL_CONNECTION_STATUS_CHANGED, body:body)
			}
			p.flush()
		}
	}

	func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?)
	{
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			if let err = error {
				if let promises = p.discoverPromise {
					let reject = promises.1
					reject(BLE_PERIPHERAL_DISCOVER_FAILED, error!.localizedDescription, nil)
					p.discoverPromise = nil
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_DISCOVER_FAILED, body:["uuid": peripheral.identifier.uuidString, "error": err.localizedDescription])
				}
				return
			}
			if let services = peripheral.services {
				p.setServicesAndDiscoverCharacteristics(services)
				sendEvent(withName: BLE_PERIPHERAL_DFU_COMPLIANT, body: ["compliant" : p.isDfuCompliant()])
			}
		}
	}

	func peripheral(_ _peripheral:CBPeripheral, didDiscoverCharacteristicsFor service:CBService, error: Error?){
		if let p : Peripheral = self.peripherals[_peripheral.identifier.uuidString]{
			if let err = error {
				if let promises = p.discoverPromise {
					let reject = promises.1
					reject(BLE_PERIPHERAL_DISCOVER_FAILED, error!.localizedDescription, nil)
					p.discoverPromise = nil
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_DISCOVER_FAILED, body:["uuid": _peripheral.identifier.uuidString, "error": err.localizedDescription])
				}
				return
			}
			if let characteristics = service.characteristics {
				for i in 0..<characteristics.count {
					let characteristic = characteristics[i]
					p.setCharacteristic(characteristic, forServiceUUID: service.uuid.uuidString)
					self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, body: ["uuid": _peripheral.identifier.uuidString, "charUUID": characteristic.uuid.uuidString])
				}
				if p.servicesDiscovered() <= 0 {
					let body = ["uuid": _peripheral.identifier.uuidString]
					if let promises = p.discoverPromise  {
						let resolve = promises.0
						resolve(body)
						p.discoverPromise = nil
					}else{
						self.sendEvent(withName: BLE_PERIPHERAL_READY, body: body)
					}
				}
				// else{
				// 	if let promises = p.discoverPromise {
				// 		let reject = promises.1
				// 		reject(BLE_PERIPHERAL_DISCOVER_FAILED, "Missing characteristic", nil)
				// 		p.discoverPromise = nil
				// 	}else{
				// 		self.sendEvent(withName: BLE_PERIPHERAL_DISCOVER_FAILED, body:["uuid": _peripheral.identifier.uuidString, "error": "Missing characteristic"])
				// 	}
				// }
			}
		}
	}

	func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			let charUUID = characteristic.uuid.uuidString
			if let err = error {
				let event = p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED
				if let promise = p.readValuePromises[charUUID]  {
					let reject = promise.1
					reject(event, err.localizedDescription, nil)
				}else{
					self.sendEvent(withName: event, body:["uuid": peripheral.identifier.uuidString, "error": err.localizedDescription])
				}
				//                self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": peripheral.identifier.uuidString, "error": err.localizedDescription])
				return
			}
			if let data = characteristic.value {
				let body : [String: Any] = ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.bytes]
				if let promise = p.readValuePromises[charUUID]  {
					let resolve = promise.0
					resolve(body)
				}else{
					self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body:body)
				}
				//                self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.bytes])
			}else{
				let body = ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil]
				if let promise = p.readValuePromises[charUUID]  {
					let resolve = promise.0
					resolve( body)
				}else{
					self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: body)
				}
				//                self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil])
			}
		}
	}

	func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
		if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
			let charUUID = characteristic.uuid.uuidString
			if let err = error {
				let event = BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED

				if let promise = p.writeValuePromises[charUUID] {
					let reject = promise.1
					reject(event, err.localizedDescription, nil)
				}else{
					self.sendEvent(withName: event, body:["uuid": peripheral.identifier.uuidString, "charUUID":charUUID, "error": err.localizedDescription])
				}
				//            self.sendEvent(withName:  BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": peripheral.identifier.uuidString, "charUUID":charUUID, "error": err.localizedDescription])
				return
			}
			if let data = characteristic.value{

				let body : [String:Any] = ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.bytes]
				if let promise = p.writeValuePromises[charUUID]  {
					let resolve = promise.0
					resolve(body)
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body:body)
				}
				//            self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body: body )
			}else{
				let body =  ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil]
				if let promise = p.writeValuePromises[charUUID]  {
					let resolve = promise.0
					resolve(body)
				}else{
					self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body:body)
				}
				//            self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body:body)
			}
		}}

	func peripheral(_ peripheral: CBPeripheral, didReadRSSI RSSI: NSNumber, error: Error?){
		self.sendEvent(withName:  BLE_PERIPHERAL_READ_RSSI, body: ["uuid": peripheral.identifier.uuidString, "rssi": RSSI])
	}
}
