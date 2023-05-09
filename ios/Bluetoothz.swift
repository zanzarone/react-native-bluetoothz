//
//  BluetoothZ.swift
//
//  Created by Zanzarone on 30/03/23. 
//

import Foundation
import React
import CoreBluetooth

let BLE_ADAPTER_STATUS_DID_UPDATE               : String  = "BLE_ADAPTER_STATUS_DID_UPDATE"
let BLE_ADAPTER_STATUS_INVALID                  : String  = "BLE_ADAPTER_STATUS_INVALID"
let BLE_ADAPTER_STATUS_POWERED_ON               : String  = "BLE_ADAPTER_STATUS_POWERED_ON"
let BLE_ADAPTER_STATUS_POWERED_OFF              : String  = "BLE_ADAPTER_STATUS_POWERED_OFF"
let BLE_ADAPTER_STATUS_UNKNOW                   : String  = "BLE_ADAPTER_STATUS_UNKNOW"
let BLE_ADAPTER_SCAN_START                      : String  = "BLE_ADAPTER_SCAN_START"
let BLE_ADAPTER_SCAN_END                        : String  = "BLE_ADAPTER_SCAN_END"
let BLE_PERIPHERAL_FOUND                        : String  = "BLE_PERIPHERAL_FOUND"
let BLE_PERIPHERAL_READY                        : String  = "BLE_PERIPHERAL_READY"
let BLE_PERIPHERAL_READ_RSSI                    : String  = "BLE_PERIPHERAL_READ_RSSI"
let BLE_PERIPHERAL_CONNECTED                    : String  = "BLE_PERIPHERAL_CONNECTED"
let BLE_PERIPHERAL_DISCONNECTED                 : String  = "BLE_PERIPHERAL_DISCONNECTED"
let BLE_PERIPHERAL_CONNECT_FAILED               : String  = "BLE_PERIPHERAL_CONNECT_FAILED"
let BLE_PERIPHERAL_DISCONNECT_FAILED            : String  = "BLE_PERIPHERAL_DISCONNECT_FAILED"
let BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED     : String  = "BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED"
let BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED    : String  = "BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED"
let BLE_PERIPHERAL_CHARACTERISTIC_READ_OK       : String  = "BLE_PERIPHERAL_CHARACTERISTIC_READ_OK"
let BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED   : String  = "BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED"
let BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK      : String  = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK"
let BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED  : String  = "BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED"
let BLE_PERIPHERAL_NOTIFICATION_UPDATES         : String  = "BLE_PERIPHERAL_NOTIFICATION_UPDATES"
let BLE_PERIPHERAL_NOTIFICATION_CHANGED         : String  = "BLE_PERIPHERAL_NOTIFICATION_CHANGED"
let BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED   : String  = "BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED"

public extension Data {
    private static let hexAlphabet = Array("0123456789abcdef".unicodeScalars)
    func hexStringEncoded() -> String {
        String(reduce(into: "".unicodeScalars) { result, value in
            result.append(Self.hexAlphabet[Int(value / 0x10)])
            result.append(Self.hexAlphabet[Int(value % 0x10)])
        })
    }
}

class Peripheral {
  private var gattServer          : CBPeripheral!
  private var services            : [String:CBService] = [:]
  private var characteristics     : [String:CBCharacteristic] = [:]
  private var connected           : Bool = false

  init(_ p:CBPeripheral, delegate: BluetoothZ) {
    gattServer = p
    gattServer.delegate = delegate
  }
  
  func getGATTServer() -> CBPeripheral {
    return self.gattServer
  }
  
  func isConnected() -> Bool {
    return connected
  }
  
  func updateStatus(_ connected:Bool) {
    self.connected = connected
  }
  
  func discoverServices(_ servicesUUIDs:[CBUUID]?) {
    self.gattServer.discoverServices(servicesUUIDs)
  }
  
  func servicesDiscovered() -> Int {
    return services.count
  }
  
  func setServicesAndDiscoverCharacteristics(_ s:[CBService]){
    for i in 0..<s.count {
      let service = s[i]
      self.services[service.uuid.uuidString] = service
    }
    for i in 0..<s.count {
      self.gattServer.discoverCharacteristics([], for: s[i])
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
  }

  func readCharacteristic(_ uuid:String){
    if let ch = self.characteristics[uuid] {
      self.gattServer.readValue(for: ch)
    }else{
      /// ERRORE DA CONTROLLARE
    }
  }

  func writeCharacteristic(_ uuid:String, value:NSArray){
    if let ch = self.characteristics[uuid] {
      var array : [UInt8] = []
      for i in 0..<value.count {
        array.append(value[i] as! UInt8)
      }
      self.gattServer.writeValue(Data(array), for: ch, type: .withResponse)
    }else{
      /// ERRORE DA CONTROLLARE
    }
  }

  func changeCharacteristicNotification(_ uuid:String, enable:Bool) {
    if let ch = self.characteristics[uuid] {
      self.gattServer.setNotifyValue(enable, for: ch)
    }else{
      /// ERRORE DA CONTROLLARE
    }
  }
  
  func isNotifying(_ uuid:String) -> Bool{
    if let ch = self.characteristics[uuid] {
      return ch.isNotifying
    }else{
      /// ERRORE DA CONTROLLARE
      return false
    }
  }
}

@objc(BluetoothZ)
class BluetoothZ: RCTEventEmitter, CBCentralManagerDelegate, CBPeripheralDelegate
{
  /// PROPS
  var centralManager        : CBCentralManager? = nil
  var peripherals           : [String:Peripheral] = [:]
  var scanFilter            : NSRegularExpression? = nil
  var allowDuplicates       : Bool?
  
  private func isConnected(uuidString:String) -> Bool {
    return self.peripherals.contains(where: { (key: String, value: Peripheral) -> Bool in
      return key.compare(uuidString) == .orderedSame && value.isConnected()
    })
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool
  {
    /// ("========================>>>> requiresMainQueueSetup")
    return false;
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
      BLE_PERIPHERAL_READY,
      BLE_PERIPHERAL_READ_RSSI,
      BLE_PERIPHERAL_CONNECTED,
      BLE_PERIPHERAL_DISCONNECTED,
      BLE_PERIPHERAL_CONNECT_FAILED,
      BLE_PERIPHERAL_DISCONNECT_FAILED,
      BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED,
      BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
      BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
      BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
      BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
      BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
      BLE_PERIPHERAL_NOTIFICATION_UPDATES,
      BLE_PERIPHERAL_NOTIFICATION_CHANGED,
      BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED
    ]
  }
  
  @objc
  override func constantsToExport() -> [AnyHashable : Any]!
  {
    /// ("========================>>>> constantsToExport")

    return [
      BLE_ADAPTER_STATUS_DID_UPDATE:BLE_ADAPTER_STATUS_DID_UPDATE,
      BLE_ADAPTER_STATUS_INVALID:BLE_ADAPTER_STATUS_INVALID,
      BLE_ADAPTER_STATUS_POWERED_ON:BLE_ADAPTER_STATUS_POWERED_ON,
      BLE_ADAPTER_STATUS_POWERED_OFF:BLE_ADAPTER_STATUS_POWERED_OFF,
      BLE_ADAPTER_STATUS_UNKNOW:BLE_ADAPTER_STATUS_UNKNOW,
      BLE_ADAPTER_SCAN_START:BLE_ADAPTER_SCAN_START,
      BLE_ADAPTER_SCAN_END:BLE_ADAPTER_SCAN_END,
      BLE_PERIPHERAL_FOUND:BLE_PERIPHERAL_FOUND,
      BLE_PERIPHERAL_READY:BLE_PERIPHERAL_READY,
      BLE_PERIPHERAL_READ_RSSI:BLE_PERIPHERAL_READ_RSSI,
      BLE_PERIPHERAL_CONNECTED:BLE_PERIPHERAL_CONNECTED,
      BLE_PERIPHERAL_DISCONNECTED:BLE_PERIPHERAL_DISCONNECTED,
      BLE_PERIPHERAL_CONNECT_FAILED:BLE_PERIPHERAL_CONNECT_FAILED,
      BLE_PERIPHERAL_DISCONNECT_FAILED:BLE_PERIPHERAL_DISCONNECT_FAILED,
      BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED:BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED,
      BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED:BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
      BLE_PERIPHERAL_CHARACTERISTIC_READ_OK:BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
      BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED:BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
      BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK:BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
      BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED:BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
      BLE_PERIPHERAL_NOTIFICATION_UPDATES:BLE_PERIPHERAL_NOTIFICATION_UPDATES,
      BLE_PERIPHERAL_NOTIFICATION_CHANGED:BLE_PERIPHERAL_NOTIFICATION_CHANGED,
      BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED:BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED
    ]
  }

  @objc
  func setup()
  {
    /// ("========================>>>> setup")
    if(centralManager == nil) {
      self.centralManager =  CBCentralManager(delegate: self, queue: nil)
    }
  }
  
  @objc(statusSync:reject:)
  func statusSync(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
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
  
  @objc(startScan:filter:options:)
  func startScan(_ serviceUUIDs: [String]? = nil, filter:String? = nil, options:NSDictionary)
  {
    /// ("========================>>>> startScan")
    var services : [CBUUID] = []
    if let uuids = serviceUUIDs{
      for uuid in uuids {
        services.append(CBUUID(string: uuid))
      }
    }
    if let pattern = filter
    {
      self.scanFilter = try? NSRegularExpression(pattern: pattern)
    }    
    if let opt = options as? [String: Any]{
      if let duplicates = opt["allowDuplicates"] as? Bool {
        self.allowDuplicates = duplicates
      }
    }
    self.centralManager?.scanForPeripherals(withServices: services, options: nil)
    self.sendEvent(withName: BLE_ADAPTER_SCAN_START, body: nil)
  }
  
  @objc
  func stopScan()
  {
    /// ("========================>>>> stopScan")
    self.centralManager?.stopScan()
    self.sendEvent(withName: BLE_ADAPTER_SCAN_END, body: nil)
  }
    
  @objc(connect:)
  func connect(_ uuidString: String)
  {
    print ("SAMU - ========================>>>> connect")
    /// i'm already connected to a device
    if self.isConnected(uuidString: uuidString) {
      print ("SAMU - ========================>>>> connect - isConnected")
      return
    }
    let p = self.peripherals[uuidString]!.getGATTServer()
    self.centralManager?.connect(p, options: nil)
  }
  
  @objc(cancel:)
  func cancel(_ uuidString: String)
  {
    print("SAMU - 1")
    if !self.isConnected(uuidString: uuidString) {
      print ("SAMU - ========================>>>> connect - !isConnected")
      return
    }
    let p = self.peripherals[uuidString]!.getGATTServer()
    self.centralManager?.cancelPeripheralConnection(p)
  }
  
  @objc(disconnect:)
  func disconnect(_ uuidString: String)
  {
    print("SAMU 14 ========================>>>> disconnect")
    if !self.isConnected(uuidString: uuidString) {
      /// i need to disconnect the current device before attempting a new connection
      return
    }
    let p : Peripheral = self.peripherals[uuidString]!
    self.centralManager?.cancelPeripheralConnection(p.getGATTServer())
  }
  
  @objc(readCharacteristicValue:charUUID:)
  func readCharacteristicValue(_ uuid:String, charUUID:String)
  {
    /// ("========================>>>> readCharacteristicValue")
    if !self.isConnected(uuidString: uuid) {
      /// i need to disconnect the current device before attempting a new connection
      self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": uuid, "error": "peripheral not found with uuid:\(uuid)"])
      return
    }
    let p : Peripheral = self.peripherals[uuid]!
    p.readCharacteristic(charUUID)
  }

  @objc(writeCharacteristicValue:charUUID:value:)
  func writeCharacteristicValue(_ uuid:String, charUUID:String, value:String)
  {
    /// ("========================>>>> readCharacteristicValue")
    if !self.isConnected(uuidString: uuid) {
      /// i need to disconnect the current device before attempting a new connection
      self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": uuid, "error": "peripheral not found with uuid:\(uuid)"])
      return
    }
    let p : Peripheral = self.peripherals[uuid]!
    p.readCharacteristic(charUUID)
  }
  
  @objc(changeCharacteristicNotification:charUUID:enable:)
  func changeCharacteristicNotification(_ uuid:String, charUUID:String, enable:Bool)
  {
    if !self.isConnected(uuidString: uuid) {
      /// i need to disconnect the current device before attempting a new connection
      self.sendEvent(withName: BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, body: ["uuid": uuid, "error": "peripheral not found with uuid:\(uuid)"])
      return
    }
    let p : Peripheral = self.peripherals[uuid]!
    p.changeCharacteristicNotification(charUUID, enable: enable)
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
    if(peripheral.name != nil)
    {
      var niceFind = true
      if let regex = self.scanFilter
      {
        let range = NSRange(location: 0, length: peripheral.identifier.uuidString.count)
        niceFind = regex.firstMatch(in: peripheral.identifier.uuidString, options: [], range: range) != nil
      }
      if niceFind, let allow = self.allowDuplicates, allow == false  {
        niceFind = !self.peripherals.keys.contains(peripheral.identifier.uuidString)
      }
      if niceFind {
        let p : Peripheral = Peripheral(peripheral, delegate:self)
        self.peripherals[peripheral.identifier.uuidString] = p
        self.sendEvent(withName: BLE_PERIPHERAL_FOUND, body: ["uuid":  peripheral.identifier.uuidString , "name":  peripheral.name!, "rssi": RSSI])
      }
    }
  }
  
  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral)
  {
    print("SAMU ----- didConnect \(peripheral.identifier.uuidString)")
    self.sendEvent(withName: BLE_PERIPHERAL_CONNECTED, body: ["uuid": peripheral.identifier.uuidString])
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      p.updateStatus(true)
      p.discoverServices([])
    }
  }
  
  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?)
  {
    var body : [String : Any] = ["uuid": peripheral.identifier.uuidString]
    if let error = error {
      body["error"] = error.localizedDescription
    }
    self.sendEvent(withName: BLE_PERIPHERAL_DISCONNECTED, body: body)
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      p.flush()
    }
  }
  
  func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?)
  {
    var body : [String : Any] = ["uuid": peripheral.identifier.uuidString]
    if let error = error {
      body["error"] = error.localizedDescription
    }
    self.sendEvent(withName: BLE_PERIPHERAL_CONNECT_FAILED, body:body)
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      p.flush()
    }
  }
  
  func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?)
  {
    if let err = error {
      self.sendEvent(withName: BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED, body: ["uuid": peripheral.identifier.uuidString, "error": err.localizedDescription])
      return
    }
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      print("SAMU - trovati servizi ")
      if let services = peripheral.services {
        print("\n\n\n \(services)\n\n\n")
        p.setServicesAndDiscoverCharacteristics(services)
      }
    }
  }
  
  func peripheral(_ _peripheral:CBPeripheral, didDiscoverCharacteristicsFor service:CBService, error: Error?){
    if let err = error {
      self.sendEvent(withName: BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED, body: ["uuid": _peripheral.identifier.uuidString, "error": err.localizedDescription])
      return
    }
    if let p : Peripheral = self.peripherals[_peripheral.identifier.uuidString]{
      if let characteristics = service.characteristics {
        for i in 0..<characteristics.count {
          let characteristic = characteristics[i]
          p.setCharacteristic(characteristic, forServiceUUID: service.uuid.uuidString)
          self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED, body: ["uuid": _peripheral.identifier.uuidString, "charUUID": characteristic.uuid.uuidString])
        }
        print("\n\n\n COUNT \(p.servicesDiscovered())\n\n\n")
        if p.servicesDiscovered() <= 0 {
          self.sendEvent(withName: BLE_PERIPHERAL_READY, body: ["uuid": _peripheral.identifier.uuidString])
        }
      }
    }
  }
  
  func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      let charUUID = characteristic.uuid.uuidString
      if let err = error {
        self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED, body: ["uuid": peripheral.identifier.uuidString, "error": err.localizedDescription])
        return
      }
      if let data = characteristic.value{
        self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.hexStringEncoded()])
      }else{
        self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil])
      }
    }
  }
  
  func peripheral(_ peripheral: CBPeripheral, didReadRSSI RSSI: NSNumber, error: Error?){
    self.sendEvent(withName:  BLE_PERIPHERAL_READ_RSSI, body: ["uuid": peripheral.identifier.uuidString, "rssi": RSSI])
  }
}
