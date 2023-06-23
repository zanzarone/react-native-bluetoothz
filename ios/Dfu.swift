//
//  Dfu.swift
//  Bluetoothz
//
//  Created by Samuele Scatena on 21/06/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import CoreBluetooth
import iOSDFULibrary

public class DfuOperation {
    public let gatt        : CBPeripheral
    let filePath    : String
    let pathType    : String
    let options     : NSDictionary
    var controller  : DFUServiceController?
    
    init(peripheral:CBPeripheral , filePath:String , pathType:String , options:NSDictionary) {
        self.gatt       = peripheral
        self.filePath   = filePath
        self.pathType   = pathType
        self.options    = options
    }
}

class DfuOpQueue {
    private var elements: [DfuOperation] = []
    
    func push(_ element: DfuOperation) {
        elements.append(element)
    }
    
    func pop() -> DfuOperation? {
        guard !elements.isEmpty else {
            return nil
        }
        return elements.removeFirst()
    }
    
    func find(_ uuid:String) -> DfuOperation? {
        let filtered = elements.filter{ $0.gatt.identifier.uuidString.compare(uuid) == .orderedSame }
        return filtered.first
    }
    
    func peek() -> DfuOperation? {
        return elements.first
    }
    
    var isEmpty: Bool {
        return elements.isEmpty
    }
    
    var count: Int {
        return elements.count
    }
    
    func clear() {
        elements.removeAll()
    }
}


class Dfu {
    private let dfuWorkers              : [DfuWorker]
    private let loop                    : DispatchQueue
    private let operationQueue          : DfuOpQueue
    private var running                 : Bool
    private static var debugEnabled     : Bool = true
    private static var sendEvent        : ((String,Any) -> Void)! = nil
    private static let bufferSemaphore  : DispatchSemaphore = DispatchSemaphore(value: 1) // Semaphore to control access to the buffer
    private static let itemsSemaphore   : DispatchSemaphore = DispatchSemaphore(value: 0) // Semaphore to signal availability of items in the buffer
    private static let pippo   : DispatchSemaphore = DispatchSemaphore(value: 3) // Semaphore to signal availability of items in the buffer
    
    init(queueCount: Int, callback:@escaping ((String,Any) -> Void)) {
        loop                = DispatchQueue(label: "BluetoothZ-\(String.randomString(length: 10))")
        operationQueue      = DfuOpQueue()
        running             = false
        Dfu.sendEvent       = callback
        dfuWorkers          = (0..<queueCount).map { _ in
            return DfuWorker(label: "BluetoothZ-\(String.randomString(length: 10))")
        }
        initLoop()
    }
    
    class DfuWorker : DFUServiceDelegate, DFUProgressDelegate, LoggerDelegate {
        private var peripheralUUID  : String
        private let loop            : DispatchQueue
        
        func setPeripheralUUID(_ uuid: String){
            self.peripheralUUID = uuid
        }
        
        func queue() -> DispatchQueue {
            return self.loop
        }
        
        init(label:String){
            peripheralUUID  = ""
            loop            = DispatchQueue(label: label)
        }
        
        func dfuStateDidChange(to state: iOSDFULibrary.DFUState) {
            switch (state)
            {
            case .completed:
                let body = ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_COMPLETED, "description": "DFU Procedure successfully completed."]
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, body )
                Dfu.bufferSemaphore.signal() // Signal that buffer access is complete
                break
            case .aborted:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_ABORTED, "description": "DFU Procedure aborted by the user."])
                Dfu.bufferSemaphore.signal() // Signal that buffer access is complete
                break
            case .starting:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_STARTING, "description": "DFU Procedure started."])
                break
            case .uploading:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_UPLOADING, "description": "Uploading firmware onto remote device."])
                break
            case .connecting:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_CONNECTING, "description": "Connecting to the remote device."])
                break
            case .validating:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_VALIDATING, "description": "Validating firmware."])
                break
            case .disconnecting:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING, "description": "Disconnecting from remote device."])
                break
            case .enablingDfuMode:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU, "description": "Enabling DFU interface on remote device."])
                break
            }
        }
        
        func dfuError(_ error: iOSDFULibrary.DFUError, didOccurWithMessage message: String) {
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE ,  ["uuid": peripheralUUID, "error":"Error: \(message)(\(error.rawValue))", "errorCode": error.rawValue, "status":BLE_PERIPHERAL_DFU_PROCESS_FAILED])
            Dfu.bufferSemaphore.signal() // Signal that buffer access is complete
        }
        
        func dfuProgressDidChange(for part: Int, outOf totalParts: Int, to progress: Int, currentSpeedBytesPerSecond: Double, avgSpeedBytesPerSecond: Double){
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE ,  ["uuid": peripheralUUID,
                                                         "part": part,
                                                         "totalParts": totalParts,
                                                         "progress": progress,
                                                         "currentSpeedBytesPerSecond": currentSpeedBytesPerSecond,
                                                         "avgSpeedBytesPerSecond": avgSpeedBytesPerSecond, "status":BLE_PERIPHERAL_DFU_PROGRESS
                                                        ])
        }
        
        func logWith(_ level: iOSDFULibrary.LogLevel, message: String) {
            if Dfu.debugEnabled {
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE ,  ["uuid": peripheralUUID,
                                                          "message": "\(level.rawValue) - \(message)",
                                                                                               "status":BLE_PERIPHERAL_DFU_DEBUG
                                                         ])
            }
        }
    }
    
    
    private func initLoop() {
        loop.async {
            self.running = true
            while(self.running) {
                Dfu.itemsSemaphore.wait() // Wait for an item to be available in the buffer
                // Choose a queue using a round-robin scheduling approach
                let worker = self.dfuWorkers.randomElement()!
                // Submit the task to the selected queue
                guard let operation = self.operationQueue.pop() else {
                    Dfu.bufferSemaphore.signal() // Signal availability of item to consumer
                    return;
                }
                var baseURL:URL? = nil
                switch operation.pathType {
                case FILE_PATH_TYPE_STRING:
                    baseURL = URL(string: "file://\(operation.filePath)")
                case FILE_PATH_TYPE_URL:
                    baseURL = URL(string:  operation.filePath)
                default: ()
                }
                
                guard let url = baseURL else {
                    Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, ["uuid": operation.gatt.identifier.uuidString, "error": "Attempted to start DFU with invalid(\(operation.filePath) filePath", "status":BLE_PERIPHERAL_DFU_PROCESS_FAILED])
                    Dfu.bufferSemaphore.signal() // Signal that buffer access is complete
                    return
                }
                guard let fw = try? DFUFirmware(urlToZipFile: url) else {
                    Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, ["uuid": operation.gatt.identifier.uuidString, "error": "Invalid firmware", "status":BLE_PERIPHERAL_DFU_PROCESS_FAILED])
                    Dfu.bufferSemaphore.signal() // Signal that buffer access is complete
                    return
                }
                if Dfu.isiOS13() {
                    // Change for iOS 13
                    Thread.sleep(forTimeInterval: 1) // Work around for not finding the peripheral in iOS 13
                }
                let queue                   = worker.queue()
                let serviceInitiator        = DFUServiceInitiator(queue: queue,delegateQueue: queue,progressQueue: queue,loggerQueue: queue)
                serviceInitiator.delegate           = worker
                serviceInitiator.progressDelegate   = worker
                serviceInitiator.logger             = worker
                //                enableDebug = false
                serviceInitiator.dataObjectPreparationDelay         = 0.4 // sec
                serviceInitiator.alternativeAdvertisingNameEnabled  = false
                if let opt = operation.options as? [String: Any]{
                    if let packetDelay = opt[DFU_OPTION_PACKET_DELAY] as? NSNumber {
                        serviceInitiator.dataObjectPreparationDelay = TimeInterval(packetDelay.floatValue / 1000.0) // sec
                    }
                    if let enableDebug = opt[DFU_OPTION_ENABLE_DEBUG] as? Bool {
                        Dfu.debugEnabled = enableDebug
                    }
                }
                if #available(iOS 11.0, macOS 10.13, *) {
                    serviceInitiator.packetReceiptNotificationParameter = 0
                }
                if Dfu.isiOS13() {
                    // Change for iOS 13
                    Thread.sleep(forTimeInterval: 2) //Work around for not finding the peripheral in iOS 13
                }
                operation.controller = serviceInitiator.with(firmware: fw).start(target: operation.gatt)
            }
            self.running = false
        }
    }
    
    func startDfu(peripheral: CBPeripheral , filePath:String , pathType:String , options:NSDictionary) {
        Dfu.bufferSemaphore.wait()
        let operation = DfuOperation(peripheral: peripheral, filePath: filePath, pathType: pathType, options: options)
        operationQueue.push(operation)
        Dfu.itemsSemaphore.signal() // Signal availability of item to consumer
    }
    
    func pauseDfu(uuid:String) {
        guard let op = operationQueue.find(uuid), let controller = op.controller else {
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED])
            return
        }
        if(!controller.paused){
            controller.pause()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_PAUSED])
        }
    }
    
    func resumeDfu(uuid:String) {
        guard let op = operationQueue.find(uuid), let controller = op.controller else {
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED])
            return
        }
        if(controller.paused){
            controller.resume()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED])
        }
    }
    
    func abortDfu(uuid:String) {
        guard let op = operationQueue.find(uuid), let controller = op.controller else {
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED])
            return
        }
        if(!controller.aborted){
            if !controller.abort() {
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED])
            }
        }
    }
}

extension Dfu {
    static func isiOS13() -> Bool {
        let systemVersion = UIDevice.current.systemVersion
        let versionComponents = systemVersion.split(separator: ".")
        
        if let majorVersionString = versionComponents.first, let majorVersion = Int(majorVersionString) {
            if majorVersion == 13 {
                print("Device is running iOS 13")
                return true
            }
        }
        return false
    }
}
