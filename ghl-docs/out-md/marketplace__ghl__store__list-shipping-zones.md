# https://marketplace.gohighlevel.com/docs/ghl/store/list-shipping-zones

# List Shipping Zones

GET 

## https://services.leadconnectorhq.com/store/shipping-zone

The "List Shipping Zone" API allows to retrieve a list of shipping zone.

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**limit** number

The maximum number of items to be included in a single page of results

Default value:`0`

Example: 20

**offset** number

The starting index of the page, indicating the position from which the results should be retrieved.

Default value:`0`

Example: 0

**withShippingRate** boolean

Include shipping rates array

Example:

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**total** numberrequired

Total number of items

Example:`20`

**data** object\[\]required

An array of items

*   Array \[
    

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the shipping zone

Example:`North zone`

**countries** object\[\]required

List of countries that are available

*   Array \[
    

**code** numberrequired

Country code

**Possible values:** \[`US,CA,AF,AX,AL,DZ,AS,AD,AO,AI,AQ,AG,AR,AM,AW,AU,AT,AZ,BS,BH,BD,BB,BY,BE,BZ,BJ,BM,BT,BO,BA,BW,BV,BR,IO,BN,BG,BF,BI,KH,CM,CV,KY,CF,TD,CL,CN,CX,CC,CO,KM,CG,CD,CK,CR,CI,HR,CU,CY,CZ,DK,DJ,DM,DO,EC,EG,SV,GQ,ER,EE,ET,FK,FO,FJ,FI,FR,GF,PF,TF,GA,GM,GE,DE,GH,GI,GR,GL,GD,GP,GU,GT,GG,GN,GW,GY,HT,HM,VA,HN,HK,HU,IS,IN,ID,IR,IQ,IE,IM,IL,IT,JM,JP,JE,JO,KZ,KE,KI,KP,XK,KW,KG,LA,LV,LB,LS,LR,LY,LI,LT,LU,MO,MK,MG,MW,MY,MV,ML,MT,MH,MQ,MR,MU,YT,MX,FM,MD,MC,MN,ME,MS,MA,MZ,MM,NA,NR,NP,NL,AN,NC,NZ,NI,NE,NG,NU,NF,MP,NO,OM,PK,PW,PS,PA,PG,PY,PE,PH,PN,PL,PT,PR,QA,RE,RO,RU,RW,SH,KN,LC,MF,PM,VC,WS,SM,ST,SA,SN,RS,SC,SL,SG,SX,SK,SI,SB,SO,ZA,GS,KR,ES,LK,SD,SR,SJ,SZ,SE,CH,SY,TW,TJ,TZ,TH,TL,TG,TK,TO,TT,TN,TR,TM,TC,TV,UG,UA,AE,GB,UM,UY,UZ,VU,VE,VN,VG,VI,WF,EH,YE,ZM,ZW`\]

Example:`US`

**states** object\[\]

List of states that are available. If states is empty, then all states are available

*   Array \[
    

**code** stringrequired

State code

**Possible values:** \[`AL`, `AK`, `AS`, `AZ`, `AR`, `AA`, `AE`, `AP`, `CA`, `CO`, `CT`, `DE`, `DC`, `FM`, `FL`, `GA`, `GU`, `HI`, `ID`, `IL`, `IN`, `IA`, `KS`, `KY`, `LA`, `ME`, `MH`, `MD`, `MA`, `MI`, `MN`, `MS`, `MO`, `MT`, `NE`, `NV`, `NH`, `NJ`, `NM`, `NY`, `NC`, `ND`, `MP`, `OH`, `OK`, `OR`, `PW`, `PA`, `PR`, `RI`, `SC`, `SD`, `TN`, `TX`, `UT`, `VT`, `VI`, `VA`, `WA`, `WV`, `WI`, `WY`, `AB`, `BC`, `MB`, `NB`, `NL`, `NT`, `NS`, `NU`, `ON`, `PE`, `QC`, `SK`, `YT`, `BA`, `CT`, `CC`, `CH`, `CB`, `CN`, `ER`, `FO`, `JY`, `LP`, `LR`, `MZ`, `MN`, `NQ`, `RN`, `SA`, `SJ`, `SL`, `SC`, `SF`, `SE`, `TF`, `TU`, `ACT`, `NSW`, `NT`, `QLD`, `SA`, `TAS`, `VIC`, `WA`, `AC`, `AL`, `AM`, `AP`, `BA`, `CE`, `DF`, `ES`, `GO`, `MA`, `MG`, `MS`, `MT`, `PA`, `PB`, `PE`, `PI`, `PR`, `RJ`, `RN`, `RO`, `RR`, `RS`, `SC`, `SE`, `SP`, `TO`, `AI`, `AN`, `AP`, `AT`, `BI`, `CO`, `AR`, `LI`, `LL`, `LR`, `MA`, `ML`, `RM`, `TA`, `VS`, `NB`, `AMA`, `ANT`, `ARA`, `ATL`, `BOL`, `BOY`, `CAL`, `CAQ`, `CAS`, `CAU`, `CES`, `CHO`, `CUN`, `COR`, `GUA`, `GUV`, `HUI`, `LAG`, `MAG`, `MET`, `NAR`, `NSA`, `PUT`, `QUI`, `RIS`, `SAP`, `SAN`, `SUC`, `TOL`, `VAC`, `VAU`, `VID`, `CR-A`, `CR-C`, `CR-G`, `CR-H`, `CR-L`, `CR-P`, `CR-SJ`, `GT-16`, `GT-15`, `GT-04`, `GT-20`, `GT-02`, `GT-05`, `GT-01`, `GT-13`, `GT-18`, `GT-21`, `GT-22`, `GT-17`, `GT-09`, `GT-14`, `GT-11`, `GT-03`, `GT-12`, `GT-06`, `GT-07`, `GT-10`, `GT-08`, `GT-19`, `HK`, `KL`, `NT`, `AN`, `AP`, `AR`, `AS`, `BR`, `CH`, `CG`, `DN`, `DD`, `DL`, `GA`, `GJ`, `HR`, `HP`, `JK`, `JH`, `KA`, `KL`, `LA`, `LD`, `MP`, `MH`, `MN`, `ML`, `MZ`, `NL`, `OR`, `PY`, `PB`, `RJ`, `SK`, `TN`, `TS`, `TR`, `UP`, `UK`, `WB`, `CW`, `CN`, `CE`, `CO`, `DL`, `D`, `G`, `KY`, `KE`, `KK`, `LS`, `LM`, `LK`, `LD`, `LH`, `MO`, `MH`, `MN`, `OY`, `RN`, `SO`, `TA`, `WD`, `WH`, `WX`, `WW`, `AG`, `AL`, `AN`, `AO`, `AR`, `AP`, `AT`, `AV`, `BA`, `BT`, `BL`, `BN`, `BG`, `BI`, `BO`, `BZ`, `BS`, `BR`, `CA`, `CL`, `CB`, `CI`, `CE`, `CT`, `CZ`, `CH`, `CO`, `CS`, `CR`, `KR`, `CN`, `EN`, `FM`, `FE`, `FI`, `FG`, `FC`, `FR`, `GE`, `GO`, `GR`, `IM`, `IS`, `AQ`, `SP`, `LT`, `LE`, `LC`, `LI`, `LO`, `LU`, `MC`, `MN`, `MS`, `MT`, `VS`, `ME`, `MI`, `MO`, `MB`, `NA`, `NO`, `NU`, `OG`, `OT`, `OR`, `PD`, `PA`, `PR`, `PV`, `PG`, `PU`, `PE`, `PC`, `PI`, `PT`, `PN`, `PZ`, `PO`, `RG`, `RA`, `RC`, `RE`, `RI`, `RN`, `RM`, `RO`, `SA`, `SS`, `SV`, `SI`, `SR`, `SO`, `TA`, `TE`, `TR`, `TO`, `TP`, `TN`, `TV`, `TS`, `UD`, `VA`, `VE`, `VB`, `VC`, `VR`, `VV`, `VI`, `VT`, `JP-23`, `JP-05`, `JP-02`, `JP-12`, `JP-38`, `JP-18`, `JP-40`, `JP-07`, `JP-21`, `JP-10`, `JP-34`, `JP-01`, `JP-28`, `JP-08`, `JP-17`, `JP-03`, `JP-37`, `JP-46`, `JP-14`, `JP-39`, `JP-43`, `JP-26`, `JP-24`, `JP-04`, `JP-45`, `JP-20`, `JP-42`, `JP-29`, `JP-15`, `JP-44`, `JP-33`, `JP-47`, `JP-27`, `JP-41`, `JP-11`, `JP-25`, `JP-32`, `JP-22`, `JP-09`, `JP-36`, `JP-13`, `JP-31`, `JP-16`, `JP-30`, `JP-06`, `JP-35`, `JP-19`, `JHR`, `KDH`, `KTN`, `KUL`, `LBN`, `MLK`, `NSN`, `PHG`, `PNG`, `PRK`, `PLS`, `PJY`, `SBH`, `SWK`, `SGR`, `TRG`, `AGU`, `BCN`, `BCS`, `CAM`, `CHP`, `CHH`, `CMX`, `COA`, `COL`, `DUR`, `GUA`, `GRO`, `HID`, `JAL`, `MIC`, `MOR`, `MEX`, `NAY`, `NLE`, `OAX`, `PUE`, `QUE`, `ROO`, `SLP`, `SIN`, `SON`, `TAB`, `TAM`, `TLA`, `VER`, `YUC`, `ZAC`, `AUK`, `BOP`, `CAN`, `CIT`, `GIS`, `HKB`, `MWT`, `MBH`, `NSN`, `NTL`, `OTA`, `STL`, `TKI`, `TAS`, `WKO`, `WGN`, `WTC`, `JK`, `BA`, `GB`, `IS`, `KP`, `PB`, `SD`, `AMA`, `ANC`, `APU`, `ARE`, `AYA`, `CAJ`, `CAL`, `CUS`, `HUV`, `HUC`, `ICA`, `JUN`, `LAL`, `LAM`, `LIM`, `LOR`, `MDD`, `MOQ`, `PAS`, `PIU`, `PUN`, `SAM`, `TAC`, `TUM`, `UCA`, `PH-ABR`, `PH-AGN`, `PH-AGS`, `PH-AKL`, `PH-ALB`, `PH-ANT`, `PH-APA`, `PH-AUR`, `PH-BAS`, `PH-BAN`, `PH-BTN`, `PH-BTG`, `PH-BEN`, `PH-BIL`, `PH-BOH`, `PH-BUK`, `PH-BUL`, `PH-CAG`, `PH-CAN`, `PH-CAS`, `PH-CAM`, `PH-CAP`, `PH-CAT`, `PH-CAV`, `PH-CEB`, `PH-NCO`, `PH-DAO`, `PH-DAV`, `PH-DAS`, `PH-EAS`, `PH-GUI`, `PH-IFU`, `PH-ILN`, `PH-ILS`, `PH-ILI`, `PH-ISA`, `PH-KAL`, `PH-LUN`, `PH-LAG`, `PH-LAN`, `PH-LAS`, `PH-LEY`, `PH-MAG`, `PH-MAD`, `PH-MAS`, `PH-00`, `PH-MSC`, `PH-MSR`, `PH-MOU`, `PH-NEC`, `PH-NER`, `PH-NSA`, `PH-NUE`, `PH-NUV`, `PH-MDC`, `PH-MDR`, `PH-PLW`, `PH-PAM`, `PH-PAN`, `PH-QUE`, `PH-QUI`, `PH-RIZ`, `PH-ROM`, `PH-WSA`, `PH-SAR`, `PH-SIG`, `PH-SOR`, `PH-SCO`, `PH-SLE`, `PH-SUK`, `PH-SLU`, `PH-SUN`, `PH-SUR`, `PH-TAR`, `PH-TAW`, `PH-ZMB`, `PH-ZAN`, `PH-ZAS`, `PH-ZSI`, `PT-20`, `PT-01`, `PT-02`, `PT-03`, `PT-04`, `PT-05`, `PT-06`, `PT-07`, `PT-08`, `PT-09`, `PT-10`, `PT-11`, `PT-30`, `PT-12`, `PT-13`, `PT-14`, `PT-15`, `PT-16`, `PT-17`, `PT-18`, `AB`, `AR`, `AG`, `BC`, `BH`, `BN`, `BT`, `BR`, `BV`, `B`, `BZ`, `CL`, `CS`, `CJ`, `CT`, `CV`, `DB`, `DJ`, `GL`, `GR`, `GJ`, `HR`, `HD`, `IL`, `IS`, `IF`, `MM`, `MH`, `MS`, `NT`, `OT`, `PH`, `SJ`, `SM`, `SB`, `SV`, `TR`, `TM`, `TL`, `VL`, `VS`, `VN`, `KR-26`, `KR-43`, `KR-44`, `KR-27`, `KR-30`, `KR-42`, `KR-29`, `KR-47`, `KR-41`, `KR-48`, `KR-28`, `KR-49`, `KR-45`, `KR-46`, `KR-50`, `KR-11`, `KR-31`, `C`, `VI`, `AB`, `A`, `AL`, `O`, `AV`, `BA`, `PM`, `B`, `BU`, `CC`, `CA`, `S`, `CS`, `CE`, `CR`, `CO`, `CU`, `GI`, `GR`, `GU`, `SS`, `H`, `HU`, `J`, `LO`, `GC`, `LE`, `L`, `LU`, `M`, `MA`, `ML`, `MU`, `NA`, `OR`, `P`, `PO`, `SA`, `TF`, `SG`, `SE`, `SO`, `T`, `TE`, `TO`, `V`, `VA`, `BI`, `ZA`, `Z`, `AZ`, `AJ`, `DU`, `FU`, `RK`, `SH`, `UQ`, `BFP`, `ENG`, `NIR`, `SCT`, `WLS`, `AR`, `CA`, `CL`, `CO`, `DU`, `FS`, `FD`, `LA`, `MA`, `MO`, `PA`, `RN`, `RV`, `RO`, `SA`, `SJ`, `SO`, `TA`, `TT`\]

Example:`VA`

*   \]
    

*   \]
    

**\_id** stringrequired

The unique identifier for the product.

Example:`655b33a82209e60b6adb87a5`

**shippingRates** object\[\]

Array of shipping rates under this shipping zone

*   Array \[
    

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the shipping zone

Example:`North zone`

**description** string

Delivery description

Example:`Ships next day`

**currency** stringrequired

The currency of the amount of the rate / handling fee

Example:`USD`

**amount** numberrequired

The amount of the shipping rate if it is normal rate (0 means free ). Fixed Handling fee if it is a carrier rate (it will add to the carrier rate).

Example:`99.99`

**conditionType** stringrequired

Type of condition to provide the conditional pricing

**Possible values:** \[`none`, `price`, `weight`\]

Example:`price`

**minCondition** numberrequired

Minimum condition for applying this price. set 0 or null if there is no minimum

Example:`99.99`

**maxCondition** numberrequired

Maximum condition for applying this price. set 0 or null if there is no maximum

Example:`99.99`

**isCarrierRate** boolean

is this a carrier rate

Example:`true`

**shippingCarrierId** stringrequired

Shipping carrier id

Example:`655b33a82209e60b6adb87a5`

**percentageOfRateFee** number

Percentage of rate fee if it is a carrier rate.

Example:`10.99`

**shippingCarrierServices** object\[\]

An array of items

*   Array \[
    

**name** stringrequired

Name of the shipping carrier service

Example:`Priority Mail Express International`

**value** stringrequired

Value of the shipping carrier service

Example:`PriorityMailExpressInternational`

*   \]
    

**\_id** stringrequired

The unique identifier for the product.

Example:`655b33a82209e60b6adb87a5`

**shippingZoneId** stringrequired

The unique identifier for the shipping zone.

Example:`655b33a82209e60b6adb87a5`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

*   \]
    

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

*   \]
    

```
{  "total": 20,  "data": [    {      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "North zone",      "countries": [        {          "code": "US",          "states": [            {              "code": "VA"            }          ]        }      ],      "_id": "655b33a82209e60b6adb87a5",      "shippingRates": [        {          "altId": "6578278e879ad2646715ba9c",          "altType": "location",          "name": "North zone",          "description": "Ships next day",          "currency": "USD",          "amount": 99.99,          "conditionType": "price",          "minCondition": 99.99,          "maxCondition": 99.99,          "isCarrierRate": true,          "shippingCarrierId": "655b33a82209e60b6adb87a5",          "percentageOfRateFee": 10.99,          "shippingCarrierServices": [            {              "name": "Priority Mail Express International",              "value": "PriorityMailExpressInternational"            }          ],          "_id": "655b33a82209e60b6adb87a5",          "shippingZoneId": "655b33a82209e60b6adb87a5",          "createdAt": "2023-12-12T09:27:42.355Z",          "updatedAt": "2023-12-12T09:27:42.355Z"        }      ],      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z"    }  ]}
```

Bad Request

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`400`

**message** string

Example:`Bad Request`

```
{  "statusCode": 400,  "message": "Bad Request"}
```

Unauthorized

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`401`

**message** string

Example:`Invalid token: access token is invalid`

**error** string

Example:`Unauthorized`

```
{  "statusCode": 401,  "message": "Invalid token: access token is invalid",  "error": "Unauthorized"}
```

Unprocessable Entity

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`422`

**message** string\[\]

Example:`["Unprocessable Entity"]`

**error** string

Example:`Unprocessable Entity`

```
{  "statusCode": 422,  "message": [    "Unprocessable Entity"  ],  "error": "Unprocessable Entity"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/store/store-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

*   curl
*   nodejs
*   python
*   php
*   java
*   go
*   ruby
*   powershell

*   CURL

```
curl -L 'https://services.leadconnectorhq.com/store/shipping-zone' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

altId — queryrequired

altType — queryrequired

\---location

Show optional parameters

limit — query

offset — query

withShippingRate — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
