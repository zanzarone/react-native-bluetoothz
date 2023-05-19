//
//  BluetoothZ.m
//
//  Created by Zanzarone on 30/03/23.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(BluetoothZ, NSObject)

RCT_EXTERN_METHOD(setup)

RCT_EXTERN_METHOD(status)

RCT_EXTERN_METHOD(statusSync:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(startScan:(NSArray*)serviceUUIDs deviceNameFilter:(NSString*)deviceNameFilter options:(NSDictionary*)options)

RCT_EXTERN_METHOD(stopScan)

RCT_EXTERN_METHOD(connect:(NSString*)uuidString)

RCT_EXTERN_METHOD(cancel:(NSString*)uuidString)

RCT_EXTERN_METHOD(disconnect:(NSString*)uuidString)
RCT_EXTERN_METHOD(disconnectSync:(NSString*)uuidString resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAllCharacteristicSync:(NSString*)uuid resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readCharacteristicValue:(NSString*)uuid charUUID:(NSString*)charUUID)

RCT_EXTERN_METHOD(writeCharacteristicValue:(NSString*)uuid charUUID:(NSString*)charUUID value:(NSArray*)value)

RCT_EXTERN_METHOD(changeCharacteristicNotification:(NSString*)uuid charUUID:(NSString*)charUUID enable:(BOOL)enable)

RCT_EXTERN_METHOD(startDFU:(NSString*)uuid filePath:(NSString*)path options:(NSDictionary*)opt)
RCT_EXTERN_METHOD(startDFUSync:(NSString*)uuid filePath:(NSString*)path options:(NSDictionary*)opt resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
