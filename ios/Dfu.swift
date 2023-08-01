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
    private let dfuWorkers                      : [DfuWorker]
    private static var dfuControllers           : [String:DFUServiceController] = [:]
    private let loop                            : DispatchQueue
    private static var operationQueue           : DfuOpQueue = DfuOpQueue()
    private var running                         : Bool
    private static var debugEnabled             : Bool = false
    private static var sendEvent                : ((String,Any) -> Void)! = nil
    private static let controllersSemaphore     : DispatchSemaphore = DispatchSemaphore(value: 1) // Semaphore to control access to the buffer
    private static let queueControlSemaphore    : DispatchSemaphore = DispatchSemaphore(value: 1) // Semaphore to control access to the buffer
    private static let queueEmptySemaphore      : DispatchSemaphore = DispatchSemaphore(value: 0) // Semaphore to signal availability of items in the buffer
    private static let maxConcurrentOpSemaphore : DispatchSemaphore = DispatchSemaphore(value: 3) // Semaphore to signal availability of items in the buffer

    init(queueCount: Int, callback:@escaping ((String,Any) -> Void)) {
        loop                = DispatchQueue(label: "BluetoothZ-\(String.randomString(length: 10))")
        running             = false
        Dfu.sendEvent       = callback
        dfuWorkers          = (0..<queueCount).map { _ in
            return DfuWorker(label: "BluetoothZ-\(String.randomString(length: 10))")
        }
        initLoop()
    }
    
    static func operationFinished(forUUID uuid:String) -> Void {
        Dfu.maxConcurrentOpSemaphore.signal() // Check number of concurrence
        Dfu.controllersSemaphore.wait()
        Dfu.dfuControllers.removeValue(forKey: uuid)
        Dfu.controllersSemaphore.signal()
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
                Dfu.operationFinished(forUUID: peripheralUUID) // Check number of concurrence
                break
            case .aborted:
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": peripheralUUID, "status":BLE_PERIPHERAL_DFU_STATUS_ABORTED, "description": "DFU Procedure aborted by the user."])
                Dfu.operationFinished(forUUID: peripheralUUID) // Check number of concurrence
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
            Dfu.operationFinished(forUUID: peripheralUUID) // Check number of concurrence
        }
        
        func dfuProgressDidChange(for part: Int, outOf totalParts: Int, to progress: Int, currentSpeedBytesPerSecond: Double, avgSpeedBytesPerSecond: Double){
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE ,  ["uuid": peripheralUUID,
                                                         "part": part,
                                                         "totalParts": totalParts,
                                                         "progress": progress,
                                                         "currentSpeedBytesPerSecond": currentSpeedBytesPerSecond,
                                                         "avgSpeedBytesPerSecond": avgSpeedBytesPerSecond, "status":BLE_PERIPHERAL_DFU_STATUS_UPLOADING
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
                Dfu.queueEmptySemaphore.wait() // Wait for an item to be available in the buffer
                Dfu.maxConcurrentOpSemaphore.wait() // Check number of concurrence
                Dfu.queueControlSemaphore.wait() // Check number of concurrence
                // Choose a queue using a round-robin scheduling approach
                let worker = self.dfuWorkers.randomElement()!
                // Submit the task to the selected queue
                guard let operation = Dfu.operationQueue.pop() else {
                    Dfu.queueControlSemaphore.signal() // Signal availability of item to consumer
                    Dfu.maxConcurrentOpSemaphore.signal() // Check number of concurrence
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
                    Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, ["uuid": operation.gatt.identifier.uuidString,
                                                                         "error": "Attempted to start DFU with invalid(\(operation.filePath) filePath",
                                                                         "status":BLE_PERIPHERAL_DFU_PROCESS_FAILED])
                    Dfu.queueControlSemaphore.signal() // Signal availability of item to consumer
                    Dfu.maxConcurrentOpSemaphore.signal() // Check number of concurrence
                    return
                }
                guard let fw = try? DFUFirmware(urlToZipFile: url) else {
                    Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE, ["uuid": operation.gatt.identifier.uuidString,
                                                                         "error": "Invalid firmware",
                                                                         "status":BLE_PERIPHERAL_DFU_PROCESS_FAILED])
                    Dfu.queueControlSemaphore.signal() // Signal availability of item to consumer
                    Dfu.maxConcurrentOpSemaphore.signal() // Check number of concurrence
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
                let identifier = operation.gatt.identifier.uuidString
                worker.setPeripheralUUID(identifier)
                let controller = serviceInitiator.with(firmware: fw).start(target: operation.gatt)
                Dfu.controllersSemaphore.wait()
                Dfu.dfuControllers[identifier] = controller
                Dfu.controllersSemaphore.signal()
                Dfu.queueControlSemaphore.signal()
            }
            self.running = false
        }
    }
    
    func startDfu(peripheral: CBPeripheral , filePath:String , pathType:String , options:NSDictionary) {
        Dfu.queueControlSemaphore.wait()
        let operation = DfuOperation(peripheral: peripheral, filePath: filePath, pathType: pathType, options: options)
        Dfu.operationQueue.push(operation)
        Dfu.queueControlSemaphore.signal() // Signal availability of item to consumer
        Dfu.queueEmptySemaphore.signal() // Signal availability of item to consumer
    }
    
    func pauseDfu(uuid:String) {
        Dfu.controllersSemaphore.wait()
        guard let controller = Dfu.dfuControllers[uuid] else {
            Dfu.controllersSemaphore.signal()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED])
            return
        }
        if(!controller.paused){
            controller.pause()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_PAUSED])
        }
        Dfu.controllersSemaphore.signal()
    }
    
    func resumeDfu(uuid:String) {
        Dfu.controllersSemaphore.wait()
        guard let controller = Dfu.dfuControllers[uuid] else {
            Dfu.controllersSemaphore.signal()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_RESUME_FAILED])
            return
        }
        if(controller.paused){
            controller.resume()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_RESUMED])
        }
        Dfu.controllersSemaphore.signal()
    }
        
    func abortDfu(uuid:String) {
        Dfu.controllersSemaphore.wait()
        guard let controller = Dfu.dfuControllers[uuid] else {
            Dfu.controllersSemaphore.signal()
            Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED])
            return
        }
        if(!controller.aborted){
            if !controller.abort() {
                Dfu.sendEvent(BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,  ["uuid": uuid, "error" : "Controller not found", "status": BLE_PERIPHERAL_DFU_PROCESS_ABORT_FAILED])
            }
        }
        Dfu.controllersSemaphore.signal()
    }
}

extension Dfu {
    static func isiOS13() -> Bool {
        let systemVersion = UIDevice.current.systemVersion
        let versionComponents = systemVersion.split(separator: ".")
        
        if let majorVersionString = versionComponents.first, let majorVersion = Int(majorVersionString) {
            if majorVersion == 13 {
                return true
            }
        }
        return false
    }
}
