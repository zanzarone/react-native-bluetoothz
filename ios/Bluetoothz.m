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
RCT_EXTERN_METHOD(startScan:(NSArray*)serviceUUIDs filter:(NSString*)filter option:(NSDictionary*)option)
RCT_EXTERN_METHOD(stopScan)
RCT_EXTERN_METHOD(connect:(NSString*)uuidString)
RCT_EXTERN_METHOD(cancel:(NSString*)uuidString)
RCT_EXTERN_METHOD(disconnect:(NSString*)uuidString)
RCT_EXTERN_METHOD(readCharacteristicValue:(NSString*)uuid charUUID:(NSString*)charUUID)
RCT_EXTERN_METHOD(writeCharacteristicValue:(NSString*)uuid charUUID:(NSString*)charUUID value:(NSString*)value)
RCT_EXTERN_METHOD(changeCharacteristicNotification:(NSString*)uuid charUUID:(NSString*)charUUID enable:(BOOL)enable)

@end
