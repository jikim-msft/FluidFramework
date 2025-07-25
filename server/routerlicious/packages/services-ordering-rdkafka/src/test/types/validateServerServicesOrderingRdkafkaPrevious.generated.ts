/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by flub generate:typetests in @fluid-tools/build-cli.
 */

import type { TypeOnly, MinimalType, FullType, requireAssignableTo } from "@fluidframework/build-tools";
import type * as old from "@fluidframework/server-services-ordering-rdkafka-previous";

import type * as current from "../../index.js";

declare type MakeUnusedImportErrorsGoAway<T> = TypeOnly<T> | MinimalType<T> | FullType<T> | typeof old | typeof current | requireAssignableTo<true, true>;

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaConsumer": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_RdkafkaConsumer = requireAssignableTo<TypeOnly<old.RdkafkaConsumer>, TypeOnly<current.RdkafkaConsumer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaConsumer": {"backCompat": false}
 */
declare type current_as_old_for_Class_RdkafkaConsumer = requireAssignableTo<TypeOnly<current.RdkafkaConsumer>, TypeOnly<old.RdkafkaConsumer>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaProducer": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_RdkafkaProducer = requireAssignableTo<TypeOnly<old.RdkafkaProducer>, TypeOnly<current.RdkafkaProducer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaProducer": {"backCompat": false}
 */
declare type current_as_old_for_Class_RdkafkaProducer = requireAssignableTo<TypeOnly<current.RdkafkaProducer>, TypeOnly<old.RdkafkaProducer>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaResources": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_RdkafkaResources = requireAssignableTo<TypeOnly<old.RdkafkaResources>, TypeOnly<current.RdkafkaResources>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaResources": {"backCompat": false}
 */
declare type current_as_old_for_Class_RdkafkaResources = requireAssignableTo<TypeOnly<current.RdkafkaResources>, TypeOnly<old.RdkafkaResources>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaResourcesFactory": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_RdkafkaResourcesFactory = requireAssignableTo<TypeOnly<old.RdkafkaResourcesFactory>, TypeOnly<current.RdkafkaResourcesFactory>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_RdkafkaResourcesFactory": {"backCompat": false}
 */
declare type current_as_old_for_Class_RdkafkaResourcesFactory = requireAssignableTo<TypeOnly<current.RdkafkaResourcesFactory>, TypeOnly<old.RdkafkaResourcesFactory>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_RdkafkaConsumer": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_RdkafkaConsumer = requireAssignableTo<TypeOnly<typeof current.RdkafkaConsumer>, TypeOnly<typeof old.RdkafkaConsumer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_RdkafkaProducer": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_RdkafkaProducer = requireAssignableTo<TypeOnly<typeof current.RdkafkaProducer>, TypeOnly<typeof old.RdkafkaProducer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_RdkafkaResources": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_RdkafkaResources = requireAssignableTo<TypeOnly<typeof current.RdkafkaResources>, TypeOnly<typeof old.RdkafkaResources>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_RdkafkaResourcesFactory": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_RdkafkaResourcesFactory = requireAssignableTo<TypeOnly<typeof current.RdkafkaResourcesFactory>, TypeOnly<typeof old.RdkafkaResourcesFactory>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IKafkaConsumerOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IKafkaConsumerOptions = requireAssignableTo<TypeOnly<old.IKafkaConsumerOptions>, TypeOnly<current.IKafkaConsumerOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IKafkaConsumerOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IKafkaConsumerOptions = requireAssignableTo<TypeOnly<current.IKafkaConsumerOptions>, TypeOnly<old.IKafkaConsumerOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IKafkaProducerOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IKafkaProducerOptions = requireAssignableTo<TypeOnly<old.IKafkaProducerOptions>, TypeOnly<current.IKafkaProducerOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IKafkaProducerOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IKafkaProducerOptions = requireAssignableTo<TypeOnly<current.IKafkaProducerOptions>, TypeOnly<old.IKafkaProducerOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOauthBearerConfig": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOauthBearerConfig = requireAssignableTo<TypeOnly<old.IOauthBearerConfig>, TypeOnly<current.IOauthBearerConfig>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOauthBearerConfig": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOauthBearerConfig = requireAssignableTo<TypeOnly<current.IOauthBearerConfig>, TypeOnly<old.IOauthBearerConfig>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOauthBearerResponse": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOauthBearerResponse = requireAssignableTo<TypeOnly<old.IOauthBearerResponse>, TypeOnly<current.IOauthBearerResponse>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOauthBearerResponse": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOauthBearerResponse = requireAssignableTo<TypeOnly<current.IOauthBearerResponse>, TypeOnly<old.IOauthBearerResponse>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IRdkafkaResources": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IRdkafkaResources = requireAssignableTo<TypeOnly<old.IRdkafkaResources>, TypeOnly<current.IRdkafkaResources>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IRdkafkaResources": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IRdkafkaResources = requireAssignableTo<TypeOnly<current.IRdkafkaResources>, TypeOnly<old.IRdkafkaResources>>
