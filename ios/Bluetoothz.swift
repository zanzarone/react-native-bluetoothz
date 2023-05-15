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
    
    var bytes: [UInt8] {
        var byteArray = [UInt8](repeating: 0, count: self.count)
        self.copyBytes(to: &byteArray, count: self.count)
        return byteArray
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
  
  func setConnected(_ connected:Bool) {
    self.connected = connected
  }
  
  func discoverServices(_ servicesUUIDs:[CBUUID]?) {
    self.gattServer.discoverServices(servicesUUIDs)
  }
  
  func servicesDiscovered() -> Int {
    return services.count
  }
    
    func allCharacteristics() -> [String] {
        return self.characteristics.keys.reversed()
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

@objc(BluetoothZ)
class BluetoothZ: RCTEventEmitter, CBCentralManagerDelegate, CBPeripheralDelegate
{
  /// PROPS
  var centralManager        : CBCentralManager? = nil
  var peripherals           : [String:Peripheral] = [:]
  var scanFilter            : String? = nil
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
  
    @objc
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
  
    @objc
  func startScan(_ serviceUUIDs: [String]? = nil, deviceNameFilter:String? = nil, options:NSDictionary)
  {
    /// ("========================>>>> startScan")
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
    if let opt = options as? [String: Any]{
      print("SOOOOOOOKA - options 1 - ", opt)
      if let duplicates = opt["allowDuplicates"] as? Bool {
      print("SOOOOOOOKA - options 2 - ", duplicates)
        self.allowDuplicates = duplicates
      }
    }
    self.peripherals.removeAll()
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
    
    @objc
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
  
    @objc
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
  
    @objc
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
    
    
    @objc
    func getAllCharacteristicSync(_ uuid:String, resolve: RCTPromiseResolveBlock, rejecter:RCTPromiseRejectBlock) -> Void {
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
      self.sendEvent(withName: BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED, body: ["uuid": uuid, "charUUID": charUUID, "charUUID": charUUID, "error": "characteristic not found with uuid:\(uuid)"])
    }
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
//        print("SOOOOOOOKA - niceFind 0 - ",peripheral.identifier.uuidString , pattern, peripheral.identifier.uuidString.range(of: pattern, options: .caseInsensitive))
      niceFind = name.range(of: pattern, options: .caseInsensitive) != nil
    }
    print("SOOOOOOOKA - niceFind 1 - ", niceFind)
    if niceFind, let allow = self.allowDuplicates, allow == false  {
      niceFind = !self.peripherals.keys.contains(peripheral.identifier.uuidString)
    }
    print("SOOOOOOOKA - niceFind 2 - ", niceFind)
    if niceFind {
      let p : Peripheral = Peripheral(peripheral, delegate:self)
      self.peripherals[peripheral.identifier.uuidString] = p
      self.sendEvent(withName: BLE_PERIPHERAL_FOUND, body: ["uuid":  peripheral.identifier.uuidString , "name":  peripheral.name!, "rssi": RSSI])
    }
  }
  
  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral)
  {
    print("SAMU ----- didConnect \(peripheral.identifier.uuidString)")
    self.sendEvent(withName: BLE_PERIPHERAL_CONNECTED, body: ["uuid": peripheral.identifier.uuidString])
    if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
      p.setConnected(true)
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
        self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.bytes])
      }else{
        self.sendEvent(withName: p.isNotifying(charUUID) ? BLE_PERIPHERAL_NOTIFICATION_UPDATES : BLE_PERIPHERAL_CHARACTERISTIC_READ_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil])
      }
    }
  }
    
//    func peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error
    func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        if let p : Peripheral = self.peripherals[peripheral.identifier.uuidString]{
          let charUUID = characteristic.uuid.uuidString
          if let err = error {
              self.sendEvent(withName:  BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED, body: ["uuid": peripheral.identifier.uuidString, "charUUID":charUUID, "error": err.localizedDescription])
            return
          }
          if let data = characteristic.value{
            self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": data.bytes])
          }else{
            self.sendEvent(withName: BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK, body: ["uuid": peripheral.identifier.uuidString,"charUUID": charUUID, "value": nil])
          }
        }
    }
  
  func peripheral(_ peripheral: CBPeripheral, didReadRSSI RSSI: NSNumber, error: Error?){
    self.sendEvent(withName:  BLE_PERIPHERAL_READ_RSSI, body: ["uuid": peripheral.identifier.uuidString, "rssi": RSSI])
  }
}
