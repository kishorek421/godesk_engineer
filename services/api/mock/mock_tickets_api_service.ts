import { ApiResponseModel, PaginatedData, PaginatorModel } from "@/models/common";
import { TicketListItemModel } from "@/models/tickets";
const tickets: TicketListItemModel[]  = [
    {
        "id": "a17c1714-fdfb-4ef4-81c1-fff13a3505fc",
        "description": "check asset master",
        "dueBy": "1730013202722",
        "lastAssignedToDetails": {
            "assignedAt": 1729161435301,
            "assignedTo": null,
            "firstName": null,
            "lastName": null,
            "phoneNumber": null
        },
        "assetInUseDetails": {
            "id": "ea1fb7dc-6f73-4a8c-8c86-315ac5a57919",
            "serialNo": "SUGANDHAN566",
            "assetMasterDetails": {
                "id": "66f9c62b-c57c-40ec-a871-001adfe569a0",
                "serialNo": "SUGANDHAN566",
                "asWarranty": true,
                "purchaseId": "DELL123367",
                "oemWarrantyDate": "2024-10-17 00:00:00",
                "extendedWarrantyDate": "2024-10-31T00:00:00",
                "uniqueIdentifier": "fahdf_12123",
                "assetTypeDetails": {
                    "id": "eb109bea-c50d-4a04-8e9f-a92fd84690ca",
                    "name": "AssetType",
                    "code": "ASSET_TYPE",
                    "description": "Demo check asset type "
                },
                "assetModelDetails": {
                    "id": "1a340b80-a91b-4601-ac50-33783c2befbb",
                    "modelName": "Asset Model",
                    "modelNumber": "34",
                    "modelDescription": "asset model ",
                    "assetTypeDetails": {
                        "id": "eb109bea-c50d-4a04-8e9f-a92fd84690ca",
                        "name": "AssetType",
                        "code": "ASSET_TYPE",
                        "description": "Demo check asset type "
                    }
                },
                "impactDetails": {
                    "id": "bb7fce1d-a043-48ff-b764-504f10f4b8c7",
                    "key": "LOW",
                    "value": "Low",
                    "category": "ASSET_IMPACT",
                    "description": "when asset damaged less"
                },
                "assetStatusDetails": {
                    "id": "95b0e346-04e0-4c8b-9e24-1b80e85911ec",
                    "key": "IN_USE",
                    "value": "In Use",
                    "category": "ASSET_STATUS",
                    "description": "when asset is used by customer"
                },
                "uniqueIdentifierTypeDetails": {
                    "id": "7a8df6be-2d87-4b34-914e-b10ca9389b96",
                    "key": "MAC",
                    "value": "Mac",
                    "category": "ASSET_UNIQUE_IDENTIFIER_TYPE",
                    "description": "when asset have mac address"
                },
                "licensedTypeDetails": {
                    "id": "278708fd-ac8f-4661-a37f-193ebddfc816",
                    "key": "OEM",
                    "value": "Oem",
                    "category": "ASSET_LICENCED_TYPE",
                    "description": "when asset is oem licensed"
                }
            },
            "statusDetails": {
                "id": "65bb3a7a-f7b7-49e1-a4fa-c3c001cd121f",
                "key": "DEPLOYED",
                "value": "Deployed",
                "category": "ASSET_IN_USE_STATUS",
                "description": "when asset is deployed"
            },
            "customerDetails": {
                "firstName": "Sugandhan",
                "lastName": "",
                "email": "sugandhan@bellwether.org.in",
                "mobileNumber": "8880828208",
                "orgDepartmentMappingDetails": {
                    "id": "7ea1ba5e-2e2d-49a5-93aa-7d89acc5d216",
                    "name": "Default department",
                    "code": "DEFAULT_DEPARTMENT"
                },
                "orgDesignationMappingDetails": {
                    "id": "651f9bde-9026-4e85-8537-6fee52e8be60",
                    "name": "Default designation",
                    "code": "DEFAULT_DESIGNATION",
                    "levelId": "7fbbcfa9-aa1d-421f-a55a-ad5dd01a3078"
                },
                "areaDetails": {
                    "id": null,
                    "cityId": null,
                    "cityName": null,
                    "cityCode": null,
                    "stateId": null,
                    "stateName": null,
                    "stateCode": null,
                    "countryId": null,
                    "countryName": null,
                    "countryCode": null,
                    "pincodeId": null,
                    "pincode": null,
                    "areaName": null
                },
                "branchDetails": {
                    "id": null,
                    "name": null,
                    "orgId": null,
                    "headOfBranchId": null,
                    "gstin": null,
                    "msmeNo": null,
                    "email": null,
                    "mobile": null,
                    "address": null,
                    "countryId": null,
                    "cityId": null,
                    "stateId": null,
                    "pincodeId": null,
                    "areaId": null,
                    "branchPic": null,
                    "createdAt": null,
                    "createdBy": " "
                },
                "orgDetails": {
                    "id": "662fbb1d-c7f1-4292-aa10-009b5f0edabb",
                    "name": "Vivo India",
                    "description": "good company , providing solutions",
                    "partnerType": "d634a6e2-4b90-4335-b35d-54ff44f7433d",
                    "contactPersonId": null,
                    "headOfficeId": "8d91c99e-31ce-4294-a6dc-7c68ad55f88d",
                    "email": "varun@bellwether.org.in",
                    "mobile": "8880828888",
                    "alternateNumber": null,
                    "typeOfOrg": "6b24ee3a-ad64-48cb-aa09-544f70d1cb2a",
                    "categoryOfOrg": "b0de6174-dccf-46e3-94a2-e89504455844",
                    "sizeOfOrg": "fa82a683-804a-4482-abe7-7210fb2e2b0a",
                    "address": "BTM mico layout ",
                    "countryId": "984c49db-0ff5-45f0-a8c5-9e61e02bd841",
                    "cityId": "5018c8dd-d085-4245-aed5-8c301209ed9c",
                    "stateId": "c603a62a-6e5c-4285-baf8-5de5f0bfc420",
                    "pincodeId": "443ad74e-5bab-4aaa-a05d-d54ccbac7a11",
                    "areaId": "e723bc3b-0c1c-4d1a-923a-8c765185aee0",
                    "createdAt": 1728022258794,
                    "createdBy": "Sriram Raghuram"
                }
            },
            "createdAt": 1729161435301
        },
        "assetSubTypeDetails": {
            "id": "780bcf13-ef13-460a-acb1-98e385e48b7a",
            "name": "Assetsubtype",
            "code": "ASSETSUBTYPE",
            "description": "demo check asset subtype",
            "assetTypeDetails": {
                "id": "eb109bea-c50d-4a04-8e9f-a92fd84690ca",
                "name": "AssetType",
                "code": "ASSET_TYPE",
                "description": "Demo check asset type "
            }
        },
        "statusDetails": {
            "id": "d4994e8f-58f6-4dd4-b297-415fa7e91dcb",
            "key": "IN_PROGRESS",
            "value": "Not_closed",
            "category": "TICKET_STATUS",
            "description": "Status will be applied when ticket created"
        },
        "priorityDetails": {
            "id": "d6d67f5b-58b8-4a0d-93ea-ed6059f31f51",
            "key": "TICKET_PRIORITY_LOW",
            "value": "Low",
            "category": "TICKET_PRIORITY",
            "description": "when ticket low priority"
        },
        "ticketTypeDetails": {
            "id": "005bec9e-6273-4a31-b5fb-40d818653ee7",
            "key": "BREAK_FIX",
            "value": "Break Fix",
            "category": "TICKET_TYPE",
            "description": "when ticket type is break fix"
        },
        "serviceTypeDetails": {
            "id": "f5c0c6be-f07c-4926-8a3d-c34c3c89fedf",
            "key": "NORMAL_FIELD",
            "value": "Normal Field",
            "category": "TICKET_SERVICE_TYPE",
            "description": "when ticket can service by normal field engineer"
        },
        "warrantyDetails": {
            "id": "c419c691-bc01-47fb-b3c4-684c08129208",
            "key": "90_DAYS",
            "value": "90 Days",
            "category": "TICKET_WARRANTY",
            "description": "when ticket can service by normal field engineer"
        },
        "customerDetails": {
            "id": "818649f9-631e-4545-81d3-909b3725de60",
            "firstName": "Sugandhan",
            "lastName": ""
        },
        "issueTypeDetails": {
            "id": "133fdb53-b611-4d29-b898-5d29279ce078",
            "name": "Camera",
            "code": "CAMERA"
        },
        "billable": true,
        "timerRunning": true,
        "createdAt": "1729840402722",
        "ticketNo": "TKT-OPABQN",
        "assignedByDetails": {
            "id": null,
            "firstName": null,
            "lastName": "",
            "availabilityDetails": {},
            "userRoleDetails": {
                "id": null,
                "userId": null,
                "roleDetails": {}
            }
        },
        "ticketImages": [
            "https://godesk-dev.s3.ap-south-1.amazonaws.com/v1/Issues_ScreenshotsPhase2%20%281%29-49424443-1f3f-45c2-a157-00cc16fa13de.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241118T081629Z&X-Amz-SignedHeaders=host&X-Amz-Credential=AKIA2ZBW4QAKVFBHF3FH%2F20241118%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Expires=600&X-Amz-Signature=89515d10da0be76ac4f8aca13937262a1413ba20041e5ed567dc66ca71bdc4b6"
        ]
    },
    {
        "id": "117d49a9-4349-4ea2-9fe1-2d4f89ab81df",
        "description": "Raise ticket ",
        "dueBy": 1731147423979,
        "closedTime": 1731314381300,
        "assetInUseDetails": {
            "id": "75db1e06-734d-4679-86bc-8e255db1c528",
            "serialNo": "USETDETAILSPAGE",
            "assetMasterDetails": {
                "id": "0be69a36-5d0c-44fd-9744-58305b33cfbe",
                "serialNo": "USETDETAILSPAGE",
                "asWarranty": false,
                "purchaseId": "PURCHASE245",
                "oemWarrantyDate": "2024-11-07 00:00:00",
                "extendedWarrantyDate": "2025-11-07T00:00:00",
                "uniqueIdentifier": "IGIKNB",
                "assetTypeDetails": {
                    "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                    "name": "Laptop",
                    "code": "LAPTOP",
                    "description": "Laptop"
                },
                "assetModelDetails": {
                    "id": "cdb54a56-3fc0-48fa-a336-812f72dd7e60",
                    "modelName": "Lenovo B series",
                    "modelNumber": "4180",
                    "modelDescription": "I3 6TH GEN 6100U-2.3GHZ/4GB/1 TB/14\"/DVD RW/BT/WIFI/DOS/MATT BLACK/FPR",
                    "assetTypeDetails": {
                        "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                        "name": "Laptop",
                        "code": "LAPTOP",
                        "description": "Laptop"
                    }
                },
                "impactDetails": {
                    "id": "bb7fce1d-a043-48ff-b764-504f10f4b8c7",
                    "key": "LOW",
                    "value": "Low",
                    "category": "ASSET_IMPACT",
                    "description": "when asset damaged less"
                },
                "assetStatusDetails": {
                    "id": "95b0e346-04e0-4c8b-9e24-1b80e85911ec",
                    "key": "IN_USE",
                    "value": "In Use",
                    "category": "ASSET_STATUS",
                    "description": "when asset is used by customer"
                },
                "uniqueIdentifierTypeDetails": {
                    "id": "7a8df6be-2d87-4b34-914e-b10ca9389b96",
                    "key": "MAC",
                    "value": "Mac",
                    "category": "ASSET_UNIQUE_IDENTIFIER_TYPE",
                    "description": "when asset have mac address"
                },
                "licensedTypeDetails": {
                    "id": "278708fd-ac8f-4661-a37f-193ebddfc816",
                    "key": "OEM",
                    "value": "Oem",
                    "category": "ASSET_LICENCED_TYPE",
                    "description": "when asset is oem licensed"
                }
            },
            "statusDetails": {
                "id": "65bb3a7a-f7b7-49e1-a4fa-c3c001cd121f",
                "key": "DEPLOYED",
                "value": "Deployed",
                "category": "ASSET_IN_USE_STATUS",
                "description": "when asset is deployed"
            },
            "customerDetails": null,
            "createdAt": 1730974431899
        },
        "assetSubTypeDetails": {
            "id": "d99e1fa2-9729-4546-92a1-5c4f3b365a67",
            "name": "Others",
            "code": "OTHERS_NETWORK",
            "description": "Others",
            "assetTypeDetails": {
                "id": "6d7c0fe7-2225-491d-b150-68f07212c78d",
                "name": "Network",
                "code": "NETWORK\n",
                "description": "Network"
            }
        },
        "statusDetails": {
            "id": "8996dad0-9f2b-4cbd-a985-4981ef7b7475",
            "key": "TICKET_CLOSED",
            "value": "Closed",
            "category": "TICKET_STATUS",
            "description": "Status will be applied when engineer open the ticket"
        },
        "priorityDetails": {
            "id": "d6d67f5b-58b8-4a0d-93ea-ed6059f31f51",
            "key": "TICKET_PRIORITY_LOW",
            "value": "Low",
            "category": "TICKET_PRIORITY",
            "description": "when ticket low priority"
        },
        "ticketTypeDetails": {
            "id": "005bec9e-6273-4a31-b5fb-40d818653ee7",
            "key": "BREAK_FIX",
            "value": "Break Fix",
            "category": "TICKET_TYPE",
            "description": "when ticket type is break fix"
        },
        "serviceTypeDetails": {
            "id": "18342ca3-b678-4d69-b2ab-dd44e5080c7e",
            "key": "NORMAL_REMOTE",
            "value": "Normal remote ",
            "category": "TICKET_SERVICE_TYPE",
            "description": "Ticket service type "
        },
        "warrantyDetails": {
            "id": "c419c691-bc01-47fb-b3c4-684c08129208",
            "key": "90_DAYS",
            "value": "90 Days",
            "category": "TICKET_WARRANTY",
            "description": "when ticket can service by normal field engineer"
        },
        "customerDetails": {
            "id": "c91eef71-775f-4e0b-8d8b-76415f175b48",
            "firstName": "Deepa Abhishek ",
            "lastName": ""
        },
        "issueTypeDetails": {
            "id": "133fdb53-b611-4d29-b898-5d29279ce078",
            "name": "Camera",
            "code": "CAMERA"
        },
        "billable": true,
        "timerRunning": true,
        "createdAt": 1730974623979,
        "ticketNo": "TKT-F890C9",
        "assignedToDetails": [
            {
                "id": "02caf3d6-6a3b-442b-bdc1-ffc79837ccf1",
                "firstName": "Lavanya",
                "lastName": "",
                "email": "golasangi1998@gmail.com",
                "employeeNo": "EMP234"
            }
        ]
    }, {
        "id": "942e317e-873f-4760-ab37-6bdc150dd33f",
        "description": "Keyboard issue in customer device ",
        "dueBy": 1731488152994,
        "assetInUseDetails": {
            "id": "f40ebda2-cd89-40ff-9a56-553d0f939080",
            "serialNo": "PRIYANKA",
            "assetMasterDetails": {
                "id": "340f54c4-8621-41fb-83f6-ed7c346dd126",
                "serialNo": "PRIYANKA",
                "asWarranty": false,
                "purchaseId": "PURCHAASE123",
                "oemWarrantyDate": "2024-11-09 00:00:00",
                "extendedWarrantyDate": "2025-11-09T00:00:00",
                "uniqueIdentifier": "UNIQIW56",
                "assetTypeDetails": {
                    "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                    "name": "Laptop",
                    "code": "LAPTOP",
                    "description": "Laptop"
                },
                "assetModelDetails": {
                    "id": "87160bea-5944-48d4-9145-28328fe096b2",
                    "modelName": "Dell Latitude",
                    "modelNumber": "3480",
                    "modelDescription": "Intel Core i3-7100U (Dual Core, 2.4GHz, 3M cache), RAM 4 GB DDR 3, HDD 1TB,N0 DVD, , Intel® HD Graphics, 14.1\" HD LED Display, 1.0 MP Webcam, Bluetooth-WiFi, WLAN, Battery, Backpack, Weight: 3.89 lbs (1.76 kg), Free DOS",
                    "assetTypeDetails": {
                        "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                        "name": "Laptop",
                        "code": "LAPTOP",
                        "description": "Laptop"
                    }
                },
                "impactDetails": {
                    "id": "bb7fce1d-a043-48ff-b764-504f10f4b8c7",
                    "key": "LOW",
                    "value": "Low",
                    "category": "ASSET_IMPACT",
                    "description": "when asset damaged less"
                },
                "assetStatusDetails": {
                    "id": "95b0e346-04e0-4c8b-9e24-1b80e85911ec",
                    "key": "IN_USE",
                    "value": "In Use",
                    "category": "ASSET_STATUS",
                    "description": "when asset is used by customer"
                },
                "uniqueIdentifierTypeDetails": {
                    "id": "7a8df6be-2d87-4b34-914e-b10ca9389b96",
                    "key": "MAC",
                    "value": "Mac",
                    "category": "ASSET_UNIQUE_IDENTIFIER_TYPE",
                    "description": "when asset have mac address"
                },
                "licensedTypeDetails": {
                    "id": "278708fd-ac8f-4661-a37f-193ebddfc816",
                    "key": "OEM",
                    "value": "Oem",
                    "category": "ASSET_LICENCED_TYPE",
                    "description": "when asset is oem licensed"
                }
            },
            "statusDetails": {
                "id": "65bb3a7a-f7b7-49e1-a4fa-c3c001cd121f",
                "key": "DEPLOYED",
                "value": "Deployed",
                "category": "ASSET_IN_USE_STATUS",
                "description": "when asset is deployed"
            },
            "customerDetails": null,
            "createdAt": 1731140407117
        },
        "assetSubTypeDetails": {
            "id": "d99e1fa2-9729-4546-92a1-5c4f3b365a67",
            "name": "Others",
            "code": "OTHERS_NETWORK",
            "description": "Others",
            "assetTypeDetails": {
                "id": "6d7c0fe7-2225-491d-b150-68f07212c78d",
                "name": "Network",
                "code": "NETWORK\n",
                "description": "Network"
            }
        },
        "statusDetails": {
            "id": "6259f9f7-7ffc-4a68-a314-b28e21f5ef42",
            "key": "CANNOT_RESOLVE",
            "value": "Cannot Resolve",
            "category": "TICKET_STATUS",
            "description": "Status will be applied when engineer open the ticket"
        },
        "priorityDetails": {
            "id": "d6d67f5b-58b8-4a0d-93ea-ed6059f31f51",
            "key": "TICKET_PRIORITY_LOW",
            "value": "Low",
            "category": "TICKET_PRIORITY",
            "description": "when ticket low priority"
        },
        "ticketTypeDetails": {
            "id": "005bec9e-6273-4a31-b5fb-40d818653ee7",
            "key": "BREAK_FIX",
            "value": "Break Fix",
            "category": "TICKET_TYPE",
            "description": "when ticket type is break fix"
        },
        "serviceTypeDetails": {
            "id": "18342ca3-b678-4d69-b2ab-dd44e5080c7e",
            "key": "NORMAL_REMOTE",
            "value": "Normal remote ",
            "category": "TICKET_SERVICE_TYPE",
            "description": "Ticket service type "
        },
        "warrantyDetails": {
            "id": "c419c691-bc01-47fb-b3c4-684c08129208",
            "key": "90_DAYS",
            "value": "90 Days",
            "category": "TICKET_WARRANTY",
            "description": "when ticket can service by normal field engineer"
        },
        "customerDetails": {
            "id": "0a57cffb-e55d-4d26-82fe-755b509342e7",
            "firstName": "Priyanka",
            "lastName": "P"
        },
        "issueTypeDetails": {
            "id": "f6aeda32-e239-420c-994d-a70dd717fb19",
            "name": "Keyboard",
            "code": "KEYBOARD"
        },
        "billable": true,
        "timerRunning": true,
        "createdAt": 1731315352994,
        "ticketNo": "TKT-TEZD6I",
        "assignedToDetails": [
            {
                "id": "02caf3d6-6a3b-442b-bdc1-ffc79837ccf1",
                "firstName": "Lavanya",
                "lastName": "",
                "email": "golasangi1998@gmail.com",
                "employeeNo": "EMP234"
            }
        ]
    }, {
        "id": "f50ecbe9-be8e-42f5-b06f-93fa56b881c7",
        "description": "test ticket ",
        "dueBy": 1730450421711,
        "assetInUseDetails": {
            "id": "fb573895-0bc6-4340-aee4-9adbe16ae56a",
            "serialNo": "182024ASSET",
            "assetMasterDetails": {
                "id": "88cd0b29-ba71-435c-991f-1fd5641150dc",
                "serialNo": "182024ASSET",
                "asWarranty": true,
                "purchaseId": "Purcahse_123",
                "oemWarrantyDate": "2024-10-19 00:00:00",
                "extendedWarrantyDate": "2024-10-26T00:00:00",
                "uniqueIdentifier": "Unique_121232",
                "assetTypeDetails": {
                    "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                    "name": "Laptop",
                    "code": "LAPTOP",
                    "description": "Laptop"
                },
                "assetModelDetails": {
                    "id": "7d3a8109-6656-4f3f-b183-a2d64f4f56dd",
                    "modelName": "Dell Vostro",
                    "modelNumber": "3468",
                    "modelDescription": "Intel® Core™ i3-7100U (2.40GHz, 3M Cache), RAM 4 GB DDR 4, HDD 1TB,DVD R/W,Intel® HD Graphics, 14.1\" HD LED Display, HD Video Webcam, Bluetooth-WiFi, WLAN, 4-Cell Battery, Backpack Bag, Weight 1.94 kg, Free DOS",
                    "assetTypeDetails": {
                        "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                        "name": "Laptop",
                        "code": "LAPTOP",
                        "description": "Laptop"
                    }
                },
                "impactDetails": {
                    "id": "bb7fce1d-a043-48ff-b764-504f10f4b8c7",
                    "key": "LOW",
                    "value": "Low",
                    "category": "ASSET_IMPACT",
                    "description": "when asset damaged less"
                },
                "assetStatusDetails": {
                    "id": "95b0e346-04e0-4c8b-9e24-1b80e85911ec",
                    "key": "IN_USE",
                    "value": "In Use",
                    "category": "ASSET_STATUS",
                    "description": "when asset is used by customer"
                },
                "uniqueIdentifierTypeDetails": {
                    "id": "7a8df6be-2d87-4b34-914e-b10ca9389b96",
                    "key": "MAC",
                    "value": "Mac",
                    "category": "ASSET_UNIQUE_IDENTIFIER_TYPE",
                    "description": "when asset have mac address"
                },
                "licensedTypeDetails": {
                    "id": "278708fd-ac8f-4661-a37f-193ebddfc816",
                    "key": "OEM",
                    "value": "Oem",
                    "category": "ASSET_LICENCED_TYPE",
                    "description": "when asset is oem licensed"
                }
            },
            "statusDetails": {
                "id": "65bb3a7a-f7b7-49e1-a4fa-c3c001cd121f",
                "key": "DEPLOYED",
                "value": "Deployed",
                "category": "ASSET_IN_USE_STATUS",
                "description": "when asset is deployed"
            },
            "customerDetails": null,
            "createdAt": 1729242328171
        },
        "assetSubTypeDetails": {
            "id": "83a17933-e53d-42d7-b06a-22a6740481cd",
            "name": "Others",
            "code": "OTHERS_LAPTOP",
            "description": "Others",
            "assetTypeDetails": {
                "id": "48ae19b7-b269-4888-9479-a04a3275f657",
                "name": "Laptop",
                "code": "LAPTOP",
                "description": "Laptop"
            }
        },
        "statusDetails": {
            "id": "0a97e371-481c-43c3-9355-e82c3d14dcaf",
            "key": "ASSIGNED",
            "value": "Assigned",
            "category": "TICKET_STATUS",
            "description": "Status will be applied when ticket assigned to engineer"
        },
        "priorityDetails": {
            "id": "d6d67f5b-58b8-4a0d-93ea-ed6059f31f51",
            "key": "TICKET_PRIORITY_LOW",
            "value": "Low",
            "category": "TICKET_PRIORITY",
            "description": "when ticket low priority"
        },
        "ticketTypeDetails": {
            "id": "005bec9e-6273-4a31-b5fb-40d818653ee7",
            "key": "BREAK_FIX",
            "value": "Break Fix",
            "category": "TICKET_TYPE",
            "description": "when ticket type is break fix"
        },
        "serviceTypeDetails": {
            "id": "f5c0c6be-f07c-4926-8a3d-c34c3c89fedf",
            "key": "NORMAL_FIELD",
            "value": "Normal Field",
            "category": "TICKET_SERVICE_TYPE",
            "description": "when ticket can service by normal field engineer"
        },
        "warrantyDetails": {
            "id": "c419c691-bc01-47fb-b3c4-684c08129208",
            "key": "90_DAYS",
            "value": "90 Days",
            "category": "TICKET_WARRANTY",
            "description": "when ticket can service by normal field engineer"
        },
        "customerDetails": {
            "id": "818649f9-631e-4545-81d3-909b3725de60",
            "firstName": "Sugandhan",
            "lastName": ""
        },
        "issueTypeDetails": {
            "id": "05c2cbb6-7699-4ca8-a83f-d632648221b4",
            "name": "Display",
            "code": "DISPLAY"
        },
        "billable": true,
        "timerRunning": true,
        "createdAt": 1730277621711,
        "ticketNo": "TKT-B3MVE5",
        "assignedToDetails": [
            {
                "id": "bdd8e1db-4941-42a7-a243-3b5d334ea400",
                "firstName": "Keerthi",
                "lastName": "E",
                "email": "goochip2@gmail.com",
                "employeeNo": "BW123"
            }
        ]
    }
];

export const getMockAssignedTickets = async (): Promise<ApiResponseModel<PaginatedData<TicketListItemModel[]>>> => {
    return Promise.resolve({
        data: {
            content: tickets,
            pagination: {
                currentPage: 1,
                lastPage: true,
            }
        },
        success: true,
    });
}

export const getMockAssignedTicketDetails = async (): Promise<ApiResponseModel<TicketListItemModel>> => {
    return Promise.resolve({
        data: tickets[0],
        success: true,
    });
}