(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={"post-fx-controls-v1":`{"params":{"glowOpacity":0,"grainOpacity":0},"collapsed":true}`,"fire-controls-v2":`{"params":{"tongueMedSt":1.1,"tongueBigSt":1.1,"flickerMode":"polar","curlDriftSpeed":0.145,"swirlSpeed":0.6,"flickerSt":0.95},"collapsed":true,"theme":"dark","themeColors":{"dark":{"colorBase":"#0a0000","colorLow":"#000000","colorHot":"#ffffff","colorTip":"#ffffff","wordColorMain":"#b50d0d","wordColorLeft":"#0033ff","wordColorRight":"#ffaa00"}},"themeBg":{}}`,"scroll-arc-collapsed-v1":`0`,"cursor-effect-controls-v1":`{"params":{"amp":46,"effect":"repel","fieldR":177,"noiseAmp":0,"fadeSpeed":12},"collapsed":true}`,"scroll-arc-v2":`[{"id":"ui3u58ib","at":0,"params":{"fontSize":17,"fontWeight":100,"lineHeight":20,"letterSpacing":0.4,"fireBandFrac":0.9,"tongueBase":0.69,"tongueBigAmp":0.29,"tongueBigSx":0.025,"tongueMedAmp":0.21,"tongueMedSx":0.05,"flickerAmp":0.6,"flickerSx":0.069,"flickerSy":0.001,"flickerScale":1.81,"flickerBias":0.5,"flickerContrast":1.25,"tipFadePx":138,"sphereCxFrac":0.5,"sphereCyFrac":1.574,"sphereRadiusFrac":0.554,"flameRadialReach":0.578,"centerPeakAmp":2.65,"centerPeakWidth":0.33,"centerPeakSmoothness":1.2,"centerPeakAngleDeg":-90,"sphereFadePx":0,"swirlStrength":0.035,"swirlScale":0.0012,"swirlStart":0,"curlStrengthMin":81,"curlStrengthMax":125,"curlCount":0,"curlRadiusMin":69,"curlRadiusMax":104,"curlDistanceMin":0.23,"curlDistanceMax":0.78}},{"id":"d4s6sq7g","at":1,"params":{"fontSize":10,"fontWeight":100,"lineHeight":21,"letterSpacing":0,"fireBandFrac":0.9,"tongueBase":1,"tongueBigAmp":0.6,"tongueBigSx":0.0285,"tongueMedAmp":0.3,"tongueMedSx":0.05,"flickerAmp":0.38,"flickerSx":0.069,"flickerSy":0.001,"flickerScale":1.73,"flickerBias":0.5,"flickerContrast":1.55,"tipFadePx":0,"sphereCxFrac":0.5,"sphereCyFrac":-1.263,"sphereRadiusFrac":2,"flameRadialReach":0.668,"centerPeakAmp":1.91,"centerPeakWidth":0.18,"centerPeakSmoothness":0.3,"centerPeakAngleDeg":-90,"sphereFadePx":14,"swirlStrength":0.052,"swirlScale":0.001,"swirlStart":0,"curlStrengthMin":80,"curlStrengthMax":106,"curlCount":0,"curlRadiusMin":90,"curlRadiusMax":121,"curlDistanceMin":0.18,"curlDistanceMax":0.62}}]`,"scroll-arc-v1":`[{"at":0,"params":{"flameRadialReach":1,"sphereRadiusFrac":1,"sphereCxFrac":0.5,"sphereCyFrac":2.141}},{"at":1,"params":{"flameRadialReach":0.807,"sphereRadiusFrac":1.786,"sphereCxFrac":0.5,"sphereCyFrac":2.78}}]`,"scroll-arc-v2-defaults":`[{"id":"v3uyuint","at":0,"params":{"fontSize":20,"fontWeight":100,"lineHeight":20,"letterSpacing":0,"textScrollSpeed":10,"fireBandFrac":0.9,"tongueBase":0.55,"tongueBigAmp":0.29,"tongueBigSx":0.025,"tongueBigSt":0.2,"tongueMedAmp":0.21,"tongueMedSx":0.05,"tongueMedSt":0.4,"flickerAmp":0.33,"flickerSx":0.069,"flickerSy":0.001,"flickerSt":0.85,"flickerBias":0.5,"flickerContrast":1.25,"tipFadePx":0,"sphereCxFrac":0.5,"sphereCyFrac":1.86,"sphereRadiusFrac":1.09,"flameRadialReach":0.53,"centerPeakAmp":1,"centerPeakWidth":0.5,"centerPeakSmoothness":2,"centerPeakAngleDeg":-90,"sphereFadePx":0,"colorHueShiftSpeed":125,"glowOpacity":0,"glowRadius":17,"glowSoftness":0.27,"pixelSize":1,"scanlineOpacity":0,"scanlineSpacing":2,"scanlineSpeed":30,"swirlStrength":0.052,"swirlScale":0.0012,"swirlSpeed":0.5,"swirlStart":0.09,"curlStrengthMin":0,"curlStrengthMax":0,"curlCount":6,"curlRadiusMin":70,"curlRadiusMax":120,"curlDistanceMin":0.4,"curlDistanceMax":0.55,"curlDriftSpeed":0.05,"grainOpacity":0.08,"grainScale":1,"grainSpeed":2}},{"id":"9mmvkaj1","at":1,"params":{"fontSize":20,"fontWeight":100,"lineHeight":20,"letterSpacing":0,"textScrollSpeed":10,"fireBandFrac":0.9,"tongueBase":0.55,"tongueBigAmp":0.29,"tongueBigSx":0.025,"tongueBigSt":0.2,"tongueMedAmp":0.21,"tongueMedSx":0.05,"tongueMedSt":0.4,"flickerAmp":0.33,"flickerSx":0.069,"flickerSy":0.001,"flickerSt":0.85,"flickerBias":0.5,"flickerContrast":1.25,"tipFadePx":0,"sphereCxFrac":0.5,"sphereCyFrac":1.86,"sphereRadiusFrac":1.09,"flameRadialReach":0.53,"centerPeakAmp":1,"centerPeakWidth":0.5,"centerPeakSmoothness":2,"centerPeakAngleDeg":-90,"sphereFadePx":0,"colorHueShiftSpeed":125,"glowOpacity":0,"glowRadius":17,"glowSoftness":0.27,"pixelSize":1,"scanlineOpacity":0,"scanlineSpacing":2,"scanlineSpeed":30,"swirlStrength":0.052,"swirlScale":0.0012,"swirlSpeed":0.5,"swirlStart":0.09,"curlStrengthMin":0,"curlStrengthMax":0,"curlCount":6,"curlRadiusMin":70,"curlRadiusMax":120,"curlDistanceMin":0.4,"curlDistanceMax":0.55,"curlDriftSpeed":0.05,"grainOpacity":0.08,"grainScale":1,"grainSpeed":2}}]`,"states-v1":`{"activeStateId":"intro","states":[{"id":"intro","name":"Intro","scrollRange":[0,0.33],"fireParams":{"sphereCyFrac":1.68},"keyframes":[{"at":0,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}},{"at":1,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}}]},{"id":"projects","name":"Projects","scrollRange":[0.33,0.66],"fireParams":{},"keyframes":[{"at":0,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}},{"at":1,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}}]},{"id":"contacts","name":"Contacts","scrollRange":[0.66,1],"fireParams":{},"keyframes":[{"at":0,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}},{"at":1,"params":{"flameRadialReach":1,"sphereRadiusFrac":1}}]}]}`,"scroll-arc-v2-active":`0`,"scroll-arc-saved-defaults-v1":`[{"at":0,"params":{"flameRadialReach":1,"sphereRadiusFrac":0.972,"sphereCxFrac":0.507}},{"at":1,"params":{"flameRadialReach":1,"sphereRadiusFrac":1.413,"sphereCxFrac":0.507,"sphereCyFrac":2.063}}]`,"name-controls-v1":`{"params":{"fontSize":101,"fontWeight":900,"cyFrac":0.045,"color":"#ffffff","glitchSpeed":12.4,"glitch":"none","glitchIntensity":0.16,"cxFrac":0.5,"fontFamily":"\\"Inter\\", system-ui, sans-serif","letterSpacing":24,"maskPadding":0,"strokeWidth":0,"scaleX":1.48},"collapsed":true}`,"fire-controls-v1":`{"params":{},"collapsed":true,"theme":"dark","themeColors":{}}`},t=`/sunburn/assets/diamond-Cg5PZLjU.svg`,n=`/sunburn/assets/flower_of_life-DflCmA5t.svg`,r=`/sunburn/assets/eye_silhouette-B1zohqdA.svg`,i=`/sunburn/assets/face_silhouette-B0ZV56eN.svg`,a=`/sunburn/assets/figures_silhouette-BIT4kC6N.svg`,o=`/sunburn/assets/figures_silhouette-BIT4kC6N.svg`,s=`/sunburn/assets/fist-BrsKEqlo.svg`,c=`/sunburn/assets/fist-BrsKEqlo.svg`,l=`/sunburn/assets/hand_silhouette-CRVJwwqS.svg`,u=`/sunburn/assets/skull-BFtGLaXO.svg`,d=`/sunburn/assets/skull-BFtGLaXO.svg`,f=`/sunburn/assets/spider_lily-DoXzMOOK.png`,p=`BN.BN.BN.BN.BN.BN.BN.BN.BN.S.B.S.WS.B.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.B.B.B.S.WS.ON.ON.ET.ET.ET.ON.ON.ON.ON.ON.ES.CS.ES.CS.CS.EN.EN.EN.EN.EN.EN.EN.EN.EN.EN.CS.ON.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.ON.ON.ON.BN.BN.BN.BN.BN.BN.B.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.CS.ON.ET.ET.ET.ET.ON.ON.ON.ON.L.ON.ON.BN.ON.ON.ET.ET.EN.EN.ON.L.ON.ON.ON.EN.L.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.L.L.L.L.L.L.L.L`.split(`.`),m=[[697,698,`ON`],[706,719,`ON`],[722,735,`ON`],[741,749,`ON`],[751,767,`ON`],[768,879,`NSM`],[884,885,`ON`],[894,894,`ON`],[900,901,`ON`],[903,903,`ON`],[1014,1014,`ON`],[1155,1161,`NSM`],[1418,1418,`ON`],[1421,1422,`ON`],[1423,1423,`ET`],[1424,1424,`R`],[1425,1469,`NSM`],[1470,1470,`R`],[1471,1471,`NSM`],[1472,1472,`R`],[1473,1474,`NSM`],[1475,1475,`R`],[1476,1477,`NSM`],[1478,1478,`R`],[1479,1479,`NSM`],[1480,1535,`R`],[1536,1541,`AN`],[1542,1543,`ON`],[1544,1544,`AL`],[1545,1546,`ET`],[1547,1547,`AL`],[1548,1548,`CS`],[1549,1549,`AL`],[1550,1551,`ON`],[1552,1562,`NSM`],[1563,1610,`AL`],[1611,1631,`NSM`],[1632,1641,`AN`],[1642,1642,`ET`],[1643,1644,`AN`],[1645,1647,`AL`],[1648,1648,`NSM`],[1649,1749,`AL`],[1750,1756,`NSM`],[1757,1757,`AN`],[1758,1758,`ON`],[1759,1764,`NSM`],[1765,1766,`AL`],[1767,1768,`NSM`],[1769,1769,`ON`],[1770,1773,`NSM`],[1774,1775,`AL`],[1776,1785,`EN`],[1786,1808,`AL`],[1809,1809,`NSM`],[1810,1839,`AL`],[1840,1866,`NSM`],[1867,1957,`AL`],[1958,1968,`NSM`],[1969,1983,`AL`],[1984,2026,`R`],[2027,2035,`NSM`],[2036,2037,`R`],[2038,2041,`ON`],[2042,2044,`R`],[2045,2045,`NSM`],[2046,2069,`R`],[2070,2073,`NSM`],[2074,2074,`R`],[2075,2083,`NSM`],[2084,2084,`R`],[2085,2087,`NSM`],[2088,2088,`R`],[2089,2093,`NSM`],[2094,2136,`R`],[2137,2139,`NSM`],[2140,2143,`R`],[2144,2191,`AL`],[2192,2193,`AN`],[2194,2198,`AL`],[2199,2207,`NSM`],[2208,2249,`AL`],[2250,2273,`NSM`],[2274,2274,`AN`],[2275,2306,`NSM`],[2362,2362,`NSM`],[2364,2364,`NSM`],[2369,2376,`NSM`],[2381,2381,`NSM`],[2385,2391,`NSM`],[2402,2403,`NSM`],[2433,2433,`NSM`],[2492,2492,`NSM`],[2497,2500,`NSM`],[2509,2509,`NSM`],[2530,2531,`NSM`],[2546,2547,`ET`],[2555,2555,`ET`],[2558,2558,`NSM`],[2561,2562,`NSM`],[2620,2620,`NSM`],[2625,2626,`NSM`],[2631,2632,`NSM`],[2635,2637,`NSM`],[2641,2641,`NSM`],[2672,2673,`NSM`],[2677,2677,`NSM`],[2689,2690,`NSM`],[2748,2748,`NSM`],[2753,2757,`NSM`],[2759,2760,`NSM`],[2765,2765,`NSM`],[2786,2787,`NSM`],[2801,2801,`ET`],[2810,2815,`NSM`],[2817,2817,`NSM`],[2876,2876,`NSM`],[2879,2879,`NSM`],[2881,2884,`NSM`],[2893,2893,`NSM`],[2901,2902,`NSM`],[2914,2915,`NSM`],[2946,2946,`NSM`],[3008,3008,`NSM`],[3021,3021,`NSM`],[3059,3064,`ON`],[3065,3065,`ET`],[3066,3066,`ON`],[3072,3072,`NSM`],[3076,3076,`NSM`],[3132,3132,`NSM`],[3134,3136,`NSM`],[3142,3144,`NSM`],[3146,3149,`NSM`],[3157,3158,`NSM`],[3170,3171,`NSM`],[3192,3198,`ON`],[3201,3201,`NSM`],[3260,3260,`NSM`],[3276,3277,`NSM`],[3298,3299,`NSM`],[3328,3329,`NSM`],[3387,3388,`NSM`],[3393,3396,`NSM`],[3405,3405,`NSM`],[3426,3427,`NSM`],[3457,3457,`NSM`],[3530,3530,`NSM`],[3538,3540,`NSM`],[3542,3542,`NSM`],[3633,3633,`NSM`],[3636,3642,`NSM`],[3647,3647,`ET`],[3655,3662,`NSM`],[3761,3761,`NSM`],[3764,3772,`NSM`],[3784,3790,`NSM`],[3864,3865,`NSM`],[3893,3893,`NSM`],[3895,3895,`NSM`],[3897,3897,`NSM`],[3898,3901,`ON`],[3953,3966,`NSM`],[3968,3972,`NSM`],[3974,3975,`NSM`],[3981,3991,`NSM`],[3993,4028,`NSM`],[4038,4038,`NSM`],[4141,4144,`NSM`],[4146,4151,`NSM`],[4153,4154,`NSM`],[4157,4158,`NSM`],[4184,4185,`NSM`],[4190,4192,`NSM`],[4209,4212,`NSM`],[4226,4226,`NSM`],[4229,4230,`NSM`],[4237,4237,`NSM`],[4253,4253,`NSM`],[4957,4959,`NSM`],[5008,5017,`ON`],[5120,5120,`ON`],[5760,5760,`WS`],[5787,5788,`ON`],[5906,5908,`NSM`],[5938,5939,`NSM`],[5970,5971,`NSM`],[6002,6003,`NSM`],[6068,6069,`NSM`],[6071,6077,`NSM`],[6086,6086,`NSM`],[6089,6099,`NSM`],[6107,6107,`ET`],[6109,6109,`NSM`],[6128,6137,`ON`],[6144,6154,`ON`],[6155,6157,`NSM`],[6158,6158,`BN`],[6159,6159,`NSM`],[6277,6278,`NSM`],[6313,6313,`NSM`],[6432,6434,`NSM`],[6439,6440,`NSM`],[6450,6450,`NSM`],[6457,6459,`NSM`],[6464,6464,`ON`],[6468,6469,`ON`],[6622,6655,`ON`],[6679,6680,`NSM`],[6683,6683,`NSM`],[6742,6742,`NSM`],[6744,6750,`NSM`],[6752,6752,`NSM`],[6754,6754,`NSM`],[6757,6764,`NSM`],[6771,6780,`NSM`],[6783,6783,`NSM`],[6832,6877,`NSM`],[6880,6891,`NSM`],[6912,6915,`NSM`],[6964,6964,`NSM`],[6966,6970,`NSM`],[6972,6972,`NSM`],[6978,6978,`NSM`],[7019,7027,`NSM`],[7040,7041,`NSM`],[7074,7077,`NSM`],[7080,7081,`NSM`],[7083,7085,`NSM`],[7142,7142,`NSM`],[7144,7145,`NSM`],[7149,7149,`NSM`],[7151,7153,`NSM`],[7212,7219,`NSM`],[7222,7223,`NSM`],[7376,7378,`NSM`],[7380,7392,`NSM`],[7394,7400,`NSM`],[7405,7405,`NSM`],[7412,7412,`NSM`],[7416,7417,`NSM`],[7616,7679,`NSM`],[8125,8125,`ON`],[8127,8129,`ON`],[8141,8143,`ON`],[8157,8159,`ON`],[8173,8175,`ON`],[8189,8190,`ON`],[8192,8202,`WS`],[8203,8205,`BN`],[8207,8207,`R`],[8208,8231,`ON`],[8232,8232,`WS`],[8233,8233,`B`],[8234,8238,`BN`],[8239,8239,`CS`],[8240,8244,`ET`],[8245,8259,`ON`],[8260,8260,`CS`],[8261,8286,`ON`],[8287,8287,`WS`],[8288,8303,`BN`],[8304,8304,`EN`],[8308,8313,`EN`],[8314,8315,`ES`],[8316,8318,`ON`],[8320,8329,`EN`],[8330,8331,`ES`],[8332,8334,`ON`],[8352,8399,`ET`],[8400,8432,`NSM`],[8448,8449,`ON`],[8451,8454,`ON`],[8456,8457,`ON`],[8468,8468,`ON`],[8470,8472,`ON`],[8478,8483,`ON`],[8485,8485,`ON`],[8487,8487,`ON`],[8489,8489,`ON`],[8494,8494,`ET`],[8506,8507,`ON`],[8512,8516,`ON`],[8522,8525,`ON`],[8528,8543,`ON`],[8585,8587,`ON`],[8592,8721,`ON`],[8722,8722,`ES`],[8723,8723,`ET`],[8724,9013,`ON`],[9083,9108,`ON`],[9110,9257,`ON`],[9280,9290,`ON`],[9312,9351,`ON`],[9352,9371,`EN`],[9450,9899,`ON`],[9901,10239,`ON`],[10496,11123,`ON`],[11126,11263,`ON`],[11493,11498,`ON`],[11503,11505,`NSM`],[11513,11519,`ON`],[11647,11647,`NSM`],[11744,11775,`NSM`],[11776,11869,`ON`],[11904,11929,`ON`],[11931,12019,`ON`],[12032,12245,`ON`],[12272,12287,`ON`],[12288,12288,`WS`],[12289,12292,`ON`],[12296,12320,`ON`],[12330,12333,`NSM`],[12336,12336,`ON`],[12342,12343,`ON`],[12349,12351,`ON`],[12441,12442,`NSM`],[12443,12444,`ON`],[12448,12448,`ON`],[12539,12539,`ON`],[12736,12773,`ON`],[12783,12783,`ON`],[12829,12830,`ON`],[12880,12895,`ON`],[12924,12926,`ON`],[12977,12991,`ON`],[13004,13007,`ON`],[13175,13178,`ON`],[13278,13279,`ON`],[13311,13311,`ON`],[19904,19967,`ON`],[42128,42182,`ON`],[42509,42511,`ON`],[42607,42610,`NSM`],[42611,42611,`ON`],[42612,42621,`NSM`],[42622,42623,`ON`],[42654,42655,`NSM`],[42736,42737,`NSM`],[42752,42785,`ON`],[42888,42888,`ON`],[43010,43010,`NSM`],[43014,43014,`NSM`],[43019,43019,`NSM`],[43045,43046,`NSM`],[43048,43051,`ON`],[43052,43052,`NSM`],[43064,43065,`ET`],[43124,43127,`ON`],[43204,43205,`NSM`],[43232,43249,`NSM`],[43263,43263,`NSM`],[43302,43309,`NSM`],[43335,43345,`NSM`],[43392,43394,`NSM`],[43443,43443,`NSM`],[43446,43449,`NSM`],[43452,43453,`NSM`],[43493,43493,`NSM`],[43561,43566,`NSM`],[43569,43570,`NSM`],[43573,43574,`NSM`],[43587,43587,`NSM`],[43596,43596,`NSM`],[43644,43644,`NSM`],[43696,43696,`NSM`],[43698,43700,`NSM`],[43703,43704,`NSM`],[43710,43711,`NSM`],[43713,43713,`NSM`],[43756,43757,`NSM`],[43766,43766,`NSM`],[43882,43883,`ON`],[44005,44005,`NSM`],[44008,44008,`NSM`],[44013,44013,`NSM`],[64285,64285,`R`],[64286,64286,`NSM`],[64287,64296,`R`],[64297,64297,`ES`],[64298,64335,`R`],[64336,64450,`AL`],[64451,64466,`ON`],[64467,64829,`AL`],[64830,64847,`ON`],[64848,64911,`AL`],[64912,64913,`ON`],[64914,64967,`AL`],[64968,64975,`ON`],[64976,65007,`BN`],[65008,65020,`AL`],[65021,65023,`ON`],[65024,65039,`NSM`],[65040,65049,`ON`],[65056,65071,`NSM`],[65072,65103,`ON`],[65104,65104,`CS`],[65105,65105,`ON`],[65106,65106,`CS`],[65108,65108,`ON`],[65109,65109,`CS`],[65110,65118,`ON`],[65119,65119,`ET`],[65120,65121,`ON`],[65122,65123,`ES`],[65124,65126,`ON`],[65128,65128,`ON`],[65129,65130,`ET`],[65131,65131,`ON`],[65136,65278,`AL`],[65279,65279,`BN`],[65281,65282,`ON`],[65283,65285,`ET`],[65286,65290,`ON`],[65291,65291,`ES`],[65292,65292,`CS`],[65293,65293,`ES`],[65294,65295,`CS`],[65296,65305,`EN`],[65306,65306,`CS`],[65307,65312,`ON`],[65339,65344,`ON`],[65371,65381,`ON`],[65504,65505,`ET`],[65506,65508,`ON`],[65509,65510,`ET`],[65512,65518,`ON`],[65520,65528,`BN`],[65529,65533,`ON`],[65534,65535,`BN`],[65793,65793,`ON`],[65856,65932,`ON`],[65936,65948,`ON`],[65952,65952,`ON`],[66045,66045,`NSM`],[66272,66272,`NSM`],[66273,66299,`EN`],[66422,66426,`NSM`],[67584,67870,`R`],[67871,67871,`ON`],[67872,68096,`R`],[68097,68099,`NSM`],[68100,68100,`R`],[68101,68102,`NSM`],[68103,68107,`R`],[68108,68111,`NSM`],[68112,68151,`R`],[68152,68154,`NSM`],[68155,68158,`R`],[68159,68159,`NSM`],[68160,68324,`R`],[68325,68326,`NSM`],[68327,68408,`R`],[68409,68415,`ON`],[68416,68863,`R`],[68864,68899,`AL`],[68900,68903,`NSM`],[68904,68911,`AL`],[68912,68921,`AN`],[68922,68927,`AL`],[68928,68937,`AN`],[68938,68968,`R`],[68969,68973,`NSM`],[68974,68974,`ON`],[68975,69215,`R`],[69216,69246,`AN`],[69247,69290,`R`],[69291,69292,`NSM`],[69293,69311,`R`],[69312,69327,`AL`],[69328,69336,`ON`],[69337,69369,`AL`],[69370,69375,`NSM`],[69376,69423,`R`],[69424,69445,`AL`],[69446,69456,`NSM`],[69457,69487,`AL`],[69488,69505,`R`],[69506,69509,`NSM`],[69510,69631,`R`],[69633,69633,`NSM`],[69688,69702,`NSM`],[69714,69733,`ON`],[69744,69744,`NSM`],[69747,69748,`NSM`],[69759,69761,`NSM`],[69811,69814,`NSM`],[69817,69818,`NSM`],[69826,69826,`NSM`],[69888,69890,`NSM`],[69927,69931,`NSM`],[69933,69940,`NSM`],[70003,70003,`NSM`],[70016,70017,`NSM`],[70070,70078,`NSM`],[70089,70092,`NSM`],[70095,70095,`NSM`],[70191,70193,`NSM`],[70196,70196,`NSM`],[70198,70199,`NSM`],[70206,70206,`NSM`],[70209,70209,`NSM`],[70367,70367,`NSM`],[70371,70378,`NSM`],[70400,70401,`NSM`],[70459,70460,`NSM`],[70464,70464,`NSM`],[70502,70508,`NSM`],[70512,70516,`NSM`],[70587,70592,`NSM`],[70606,70606,`NSM`],[70608,70608,`NSM`],[70610,70610,`NSM`],[70625,70626,`NSM`],[70712,70719,`NSM`],[70722,70724,`NSM`],[70726,70726,`NSM`],[70750,70750,`NSM`],[70835,70840,`NSM`],[70842,70842,`NSM`],[70847,70848,`NSM`],[70850,70851,`NSM`],[71090,71093,`NSM`],[71100,71101,`NSM`],[71103,71104,`NSM`],[71132,71133,`NSM`],[71219,71226,`NSM`],[71229,71229,`NSM`],[71231,71232,`NSM`],[71264,71276,`ON`],[71339,71339,`NSM`],[71341,71341,`NSM`],[71344,71349,`NSM`],[71351,71351,`NSM`],[71453,71453,`NSM`],[71455,71455,`NSM`],[71458,71461,`NSM`],[71463,71467,`NSM`],[71727,71735,`NSM`],[71737,71738,`NSM`],[71995,71996,`NSM`],[71998,71998,`NSM`],[72003,72003,`NSM`],[72148,72151,`NSM`],[72154,72155,`NSM`],[72160,72160,`NSM`],[72193,72198,`NSM`],[72201,72202,`NSM`],[72243,72248,`NSM`],[72251,72254,`NSM`],[72263,72263,`NSM`],[72273,72278,`NSM`],[72281,72283,`NSM`],[72330,72342,`NSM`],[72344,72345,`NSM`],[72544,72544,`NSM`],[72546,72548,`NSM`],[72550,72550,`NSM`],[72752,72758,`NSM`],[72760,72765,`NSM`],[72850,72871,`NSM`],[72874,72880,`NSM`],[72882,72883,`NSM`],[72885,72886,`NSM`],[73009,73014,`NSM`],[73018,73018,`NSM`],[73020,73021,`NSM`],[73023,73029,`NSM`],[73031,73031,`NSM`],[73104,73105,`NSM`],[73109,73109,`NSM`],[73111,73111,`NSM`],[73459,73460,`NSM`],[73472,73473,`NSM`],[73526,73530,`NSM`],[73536,73536,`NSM`],[73538,73538,`NSM`],[73562,73562,`NSM`],[73685,73692,`ON`],[73693,73696,`ET`],[73697,73713,`ON`],[78912,78912,`NSM`],[78919,78933,`NSM`],[90398,90409,`NSM`],[90413,90415,`NSM`],[92912,92916,`NSM`],[92976,92982,`NSM`],[94031,94031,`NSM`],[94095,94098,`NSM`],[94178,94178,`ON`],[94180,94180,`NSM`],[113821,113822,`NSM`],[113824,113827,`BN`],[117760,117973,`ON`],[118e3,118009,`EN`],[118010,118012,`ON`],[118016,118451,`ON`],[118458,118480,`ON`],[118496,118512,`ON`],[118528,118573,`NSM`],[118576,118598,`NSM`],[119143,119145,`NSM`],[119155,119162,`BN`],[119163,119170,`NSM`],[119173,119179,`NSM`],[119210,119213,`NSM`],[119273,119274,`ON`],[119296,119361,`ON`],[119362,119364,`NSM`],[119365,119365,`ON`],[119552,119638,`ON`],[120513,120513,`ON`],[120539,120539,`ON`],[120571,120571,`ON`],[120597,120597,`ON`],[120629,120629,`ON`],[120655,120655,`ON`],[120687,120687,`ON`],[120713,120713,`ON`],[120745,120745,`ON`],[120771,120771,`ON`],[120782,120831,`EN`],[121344,121398,`NSM`],[121403,121452,`NSM`],[121461,121461,`NSM`],[121476,121476,`NSM`],[121499,121503,`NSM`],[121505,121519,`NSM`],[122880,122886,`NSM`],[122888,122904,`NSM`],[122907,122913,`NSM`],[122915,122916,`NSM`],[122918,122922,`NSM`],[123023,123023,`NSM`],[123184,123190,`NSM`],[123566,123566,`NSM`],[123628,123631,`NSM`],[123647,123647,`ET`],[124140,124143,`NSM`],[124398,124399,`NSM`],[124643,124643,`NSM`],[124646,124646,`NSM`],[124654,124655,`NSM`],[124661,124661,`NSM`],[124928,125135,`R`],[125136,125142,`NSM`],[125143,125251,`R`],[125252,125258,`NSM`],[125259,126063,`R`],[126064,126143,`AL`],[126144,126207,`R`],[126208,126287,`AL`],[126288,126463,`R`],[126464,126703,`AL`],[126704,126705,`ON`],[126706,126719,`AL`],[126720,126975,`R`],[126976,127019,`ON`],[127024,127123,`ON`],[127136,127150,`ON`],[127153,127167,`ON`],[127169,127183,`ON`],[127185,127221,`ON`],[127232,127242,`EN`],[127243,127247,`ON`],[127279,127279,`ON`],[127338,127343,`ON`],[127405,127405,`ON`],[127584,127589,`ON`],[127744,128728,`ON`],[128732,128748,`ON`],[128752,128764,`ON`],[128768,128985,`ON`],[128992,129003,`ON`],[129008,129008,`ON`],[129024,129035,`ON`],[129040,129095,`ON`],[129104,129113,`ON`],[129120,129159,`ON`],[129168,129197,`ON`],[129200,129211,`ON`],[129216,129217,`ON`],[129232,129240,`ON`],[129280,129623,`ON`],[129632,129645,`ON`],[129648,129660,`ON`],[129664,129674,`ON`],[129678,129734,`ON`],[129736,129736,`ON`],[129741,129756,`ON`],[129759,129770,`ON`],[129775,129784,`ON`],[129792,129938,`ON`],[129940,130031,`ON`],[130032,130041,`EN`],[130042,130042,`ON`],[131070,131071,`BN`],[196606,196607,`BN`],[262142,262143,`BN`],[327678,327679,`BN`],[393214,393215,`BN`],[458750,458751,`BN`],[524286,524287,`BN`],[589822,589823,`BN`],[655358,655359,`BN`],[720894,720895,`BN`],[786430,786431,`BN`],[851966,851967,`BN`],[917502,917759,`BN`],[917760,917999,`NSM`],[918e3,921599,`BN`],[983038,983039,`BN`],[1048574,1048575,`BN`],[1114110,1114111,`BN`]];function h(e){if(e<=255)return p[e];let t=0,n=m.length-1;for(;t<=n;){let r=t+n>>1,i=m[r];if(e<i[0]){n=r-1;continue}if(e>i[1]){t=r+1;continue}return i[2]}return`L`}function g(e){let t=e.length;if(t===0)return null;let n=Array(t),r=!1;for(let i=0;i<t;){let a=e.charCodeAt(i),o=a,s=1;if(a>=55296&&a<=56319&&i+1<t){let t=e.charCodeAt(i+1);t>=56320&&t<=57343&&(o=(a-55296<<10)+(t-56320)+65536,s=2)}let c=h(o);(c===`R`||c===`AL`||c===`AN`)&&(r=!0);for(let e=0;e<s;e++)n[i+e]=c;i+=s}if(!r)return null;let i=0;for(let e=0;e<t;e++){let t=n[e];if(t===`L`){i=0;break}if(t===`R`||t===`AL`){i=1;break}}let a=new Int8Array(t);for(let e=0;e<t;e++)a[e]=i;let o=i&1?`R`:`L`,s=o,c=s;for(let e=0;e<t;e++)n[e]===`NSM`?n[e]=c:c=n[e];c=s;for(let e=0;e<t;e++){let t=n[e];t===`EN`?n[e]=c===`AL`?`AN`:`EN`:(t===`R`||t===`L`||t===`AL`)&&(c=t)}for(let e=0;e<t;e++)n[e]===`AL`&&(n[e]=`R`);for(let e=1;e<t-1;e++)n[e]===`ES`&&n[e-1]===`EN`&&n[e+1]===`EN`&&(n[e]=`EN`),n[e]===`CS`&&(n[e-1]===`EN`||n[e-1]===`AN`)&&n[e+1]===n[e-1]&&(n[e]=n[e-1]);for(let e=0;e<t;e++){if(n[e]!==`EN`)continue;let r;for(r=e-1;r>=0&&n[r]===`ET`;r--)n[r]=`EN`;for(r=e+1;r<t&&n[r]===`ET`;r++)n[r]=`EN`}for(let e=0;e<t;e++){let t=n[e];(t===`WS`||t===`ES`||t===`ET`||t===`CS`)&&(n[e]=`ON`)}c=s;for(let e=0;e<t;e++){let t=n[e];t===`EN`?n[e]=c===`L`?`L`:`EN`:(t===`R`||t===`L`)&&(c=t)}for(let e=0;e<t;e++){if(n[e]!==`ON`)continue;let r=e+1;for(;r<t&&n[r]===`ON`;)r++;let i=e>0?n[e-1]:s,a=r<t?n[r]:s,o=i===`L`?`L`:`R`;if(o===(a===`L`?`L`:`R`))for(let t=e;t<r;t++)n[t]=o;e=r-1}for(let e=0;e<t;e++)n[e]===`ON`&&(n[e]=o);for(let e=0;e<t;e++){let t=n[e];a[e]&1?(t===`L`||t===`AN`||t===`EN`)&&a[e]++:t===`R`?a[e]++:(t===`AN`||t===`EN`)&&(a[e]+=2)}return a}function _(e,t){let n=g(e);if(n===null)return null;let r=new Int8Array(t.length);for(let e=0;e<t.length;e++)r[e]=n[t[e]];return r}var v=/[ \t\n\r\f]+/g,y=/[\t\n\r\f]| {2,}|^ | $/;function b(e){let t=e??`normal`;return t===`pre-wrap`?{mode:t,preserveOrdinarySpaces:!0,preserveHardBreaks:!0}:{mode:t,preserveOrdinarySpaces:!1,preserveHardBreaks:!1}}function x(e){if(!y.test(e))return e;let t=e.replace(v,` `);return t.charCodeAt(0)===32&&(t=t.slice(1)),t.length>0&&t.charCodeAt(t.length-1)===32&&(t=t.slice(0,-1)),t}function S(e){return/[\r\f]/.test(e)?e.replace(/\r\n/g,`
`).replace(/[\r\f]/g,`
`):e}var C=null,w;function T(){return C===null&&(C=new Intl.Segmenter(w,{granularity:`word`})),C}var E=/\p{Script=Arabic}/u,D=/\p{M}/u,O=/\p{Nd}/u;function k(e){return E.test(e)}function A(e){return e>=19968&&e<=40959||e>=13312&&e<=19903||e>=131072&&e<=173791||e>=173824&&e<=177983||e>=177984&&e<=178207||e>=178208&&e<=183983||e>=183984&&e<=191471||e>=191472&&e<=192093||e>=194560&&e<=195103||e>=196608&&e<=201551||e>=201552&&e<=205743||e>=205744&&e<=210041||e>=63744&&e<=64255||e>=12288&&e<=12351||e>=12352&&e<=12447||e>=12448&&e<=12543||e>=12592&&e<=12687||e>=44032&&e<=55215||e>=65280&&e<=65519}function j(e){for(let t=0;t<e.length;t++){let n=e.charCodeAt(t);if(!(n<12288)){if(n>=55296&&n<=56319&&t+1<e.length){let r=e.charCodeAt(t+1);if(r>=56320&&r<=57343){if(A((n-55296<<10)+(r-56320)+65536))return!0;t++;continue}}if(A(n))return!0}}return!1}function M(e){let t=fe(e);return t!==null&&(te.has(t)||L.has(t))}var N=new Set([`\xA0`,` `,`⁠`,`﻿`]),P=new Set([`-`,`‐`,`–`,`—`]);function F(e){let t=fe(e);return t!==null&&N.has(t)}function I(e){let t=fe(e);return t!==null&&P.has(t)}function ee(e,t){return F(e)?!1:t?!(M(e)||I(e)):!0}var te=new Set(`，.．.！.：.；.？.、.。.・.）.〕.〉.》.」.』.】.〗.〙.〛.ー.々.〻.ゝ.ゞ.ヽ.ヾ`.split(`.`)),ne=new Set([`"`,`(`,`[`,`{`,`¡`,`¿`,`“`,`‘`,`‚`,`„`,`«`,`‹`,`⸘`,`（`,`〔`,`〈`,`《`,`「`,`『`,`【`,`〖`,`〘`,`〚`]),re=new Set([`'`,`’`]),L=new Set(`.(,(!(?(:(;(،(؛(؟(।(॥(၊(။(၌(၍(၏()(](}(%("(”(’(»(›(…`.split(`(`)),ie=new Set([`:`,`.`,`،`,`؛`]),ae=new Set([`၏`]),oe=new Set([`”`,`’`,`»`,`›`,`」`,`』`,`】`,`》`,`〉`,`〕`,`）`]);function se(e){if(ue(e))return!0;let t=!1;for(let n of e){if(L.has(n)||ge(n)){t=!0;continue}if(!(t&&D.test(n)))return!1}return t}function ce(e){for(let t of e)if(!te.has(t)&&!L.has(t))return!1;return e.length>0}function le(e){if(ue(e))return!0;for(let t of e)if(!ne.has(t)&&!re.has(t)&&!D.test(t)&&!ge(t))return!1;return e.length>0}function ue(e){let t=!1;for(let n of e)if(!(n===`\\`||D.test(n))){if(ne.has(n)||L.has(n)||re.has(n)){t=!0;continue}return!1}return t}function de(e,t){let n=t-1;if(n<=0)return Math.max(n,0);let r=e.charCodeAt(n);if(r<56320||r>57343)return n;let i=n-1;if(i<0)return n;let a=e.charCodeAt(i);return a>=55296&&a<=56319?i:n}function fe(e){if(e.length===0)return null;let t=de(e,e.length);return e.slice(t)}function pe(e){for(let t of e)if(!D.test(t))return t;return null}function me(e){for(let t=e.length;t>0;){let n=de(e,t),r=e.slice(n,t);if(!D.test(r))return r;t=n}return null}var R=[36,37,43,43,92,92,162,165,176,177,1423,1423,1545,1547,1642,1642,2046,2047,2546,2547,2553,2555,2801,2801,3065,3065,3449,3449,3647,3647,6107,6107,8240,8247,8279,8279,8352,8399,8451,8451,8457,8457,8470,8470,8722,8723,43064,43064,65020,65020,65129,65130,65284,65285,65504,65505,65509,65510,73693,73696,123647,123647,126124,126124,126128,126128];function he(e,t){for(let n=0;n<t.length;n+=2)if(e>=t[n]&&e<=t[n+1])return!0;return!1}function ge(e){let t=e.codePointAt(0);return t!==void 0&&he(t,R)}function _e(e){let t=me(e);return t!==null&&ge(t)}function ve(e){let t=pe(e);return t!==null&&O.test(t)}function ye(e){let t=Array.from(e),n=t.length;for(;n>0;){let e=t[n-1];if(D.test(e)){n--;continue}if(ne.has(e)||re.has(e)){n--;continue}break}return n<=0||n===t.length?null:{head:t.slice(0,n).join(``),tail:t.slice(n).join(``)}}function be(e,t,n){return n===`text`&&!t&&e.length===1&&e!==`-`&&e!==`—`?e:null}function xe(e,t,n,r){let i=t[r],a=e[r];if(i==null)return a;let o=n[r];if(a.length===o)return a;let s=i.repeat(o);return e[r]=s,s}function Se(e,t){return e&&t!==null&&ie.has(t)}function Ce(e){let t=fe(e);return t!==null&&ae.has(t)}function we(e){if(e.length<2||e[0]!==` `)return null;let t=e.slice(1);return/^\p{M}+$/u.test(t)?{space:` `,marks:t}:null}function z(e){let t=e.length;for(;t>0;){let n=de(e,t),r=e.slice(n,t);if(oe.has(r))return!0;if(!L.has(r))return!1;t=n}return!1}function Te(e,t){if(t.preserveOrdinarySpaces||t.preserveHardBreaks){if(e===` `)return`preserved-space`;if(e===`	`)return`tab`;if(t.preserveHardBreaks&&e===`
`)return`hard-break`}return e===` `?`space`:e===`\xA0`||e===` `||e===`⁠`||e===`﻿`?`glue`:e===`​`?`zero-width-break`:e===`­`?`soft-hyphen`:`text`}var Ee=/[\x20\t\n\xA0\xAD\u200B\u202F\u2060\uFEFF]/;function B(e){return e.length===1?e[0]:e.join(``)}function V(e,t){let n=[];for(let t=e.length-1;t>=0;t--)n.push(e[t]);return n.push(t),B(n)}function De(e,t,n,r){if(!Ee.test(e))return[{text:e,isWordLike:t,kind:`text`,start:n}];let i=[],a=null,o=[],s=n,c=!1,l=0;for(let u of e){let e=Te(u,r),d=e===`text`&&t;if(a!==null&&e===a&&d===c){o.push(u),l+=u.length;continue}a!==null&&i.push({text:B(o),isWordLike:c,kind:a,start:s}),a=e,o=[u],s=n+l,c=d,l+=u.length}return a!==null&&i.push({text:B(o),isWordLike:c,kind:a,start:s}),i}function Oe(e){return e===`space`||e===`preserved-space`||e===`zero-width-break`||e===`hard-break`}var ke=/^[A-Za-z][A-Za-z0-9+.-]*:$/;function H(e,t){let n=e.texts[t];return n.startsWith(`www.`)?!0:ke.test(n)&&t+1<e.len&&e.kinds[t+1]===`text`&&e.texts[t+1]===`//`}function Ae(e){return e.includes(`?`)&&(e.includes(`://`)||e.startsWith(`www.`))}function U(e){let t=e.texts.slice(),n=e.isWordLike.slice(),r=e.kinds.slice(),i=e.starts.slice();for(let i=0;i<e.len;i++){if(r[i]!==`text`||!H(e,i))continue;let a=[t[i]],o=i+1;for(;o<e.len&&!Oe(r[o]);){a.push(t[o]),n[i]=!0;let e=t[o].includes(`?`);if(r[o]=`text`,t[o]=``,o++,e)break}t[i]=B(a)}let a=0;for(let e=0;e<t.length;e++){let o=t[e];o.length!==0&&(a!==e&&(t[a]=o,n[a]=n[e],r[a]=r[e],i[a]=i[e]),a++)}return t.length=a,n.length=a,r.length=a,i.length=a,{len:a,texts:t,isWordLike:n,kinds:r,starts:i}}function W(e){let t=[],n=[],r=[],i=[];for(let a=0;a<e.len;a++){let o=e.texts[a];if(t.push(o),n.push(e.isWordLike[a]),r.push(e.kinds[a]),i.push(e.starts[a]),!Ae(o))continue;let s=a+1;if(s>=e.len||Oe(e.kinds[s]))continue;let c=[],l=e.starts[s],u=s;for(;u<e.len&&!Oe(e.kinds[u]);)c.push(e.texts[u]),u++;c.length>0&&(t.push(B(c)),n.push(!0),r.push(`text`),i.push(l),a=u-1)}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}var G=new Set([`:`,`-`,`/`,`×`,`,`,`.`,`+`,`–`,`—`]),je=new Set([`.`,`,`,`:`,`;`]);function Me(e){for(let t=e.length;t>0;){let n=de(e,t),r=e.slice(n,t);if(D.test(r)){t=n;continue}return je.has(r)||ge(r)}return!1}function Ne(e,t){return t&&!j(e)}function Pe(e){for(let t of e)if(O.test(t))return!0;return!1}function Fe(e){if(e.length===0)return!1;for(let t of e)if(!(O.test(t)||G.has(t)))return!1;return!0}function Ie(e){let t=[],n=[],r=[],i=[];for(let a=0;a<e.len;a++){let o=e.texts[a],s=e.kinds[a];if(s===`text`&&Fe(o)&&Pe(o)){let s=[o],c=a+1;for(;c<e.len&&e.kinds[c]===`text`&&Fe(e.texts[c]);)s.push(e.texts[c]),c++;t.push(B(s)),n.push(!0),r.push(`text`),i.push(e.starts[a]),a=c-1;continue}t.push(o),n.push(e.isWordLike[a]),r.push(s),i.push(e.starts[a])}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}function Le(e){let t=[],n=[],r=[],i=[];for(let a=0;a<e.len;a++){let o=e.texts[a],s=e.kinds[a],c=e.isWordLike[a];if(s===`text`&&Me(o)&&(c||_e(o))&&!j(o)){let s=[o],c=!0,l=a+1;for(;c&&l<e.len&&e.kinds[l]===`text`&&Ne(e.texts[l],e.isWordLike[l]);){let t=e.texts[l];s.push(t),c=Me(t),l++}t.push(B(s)),n.push(!0),r.push(`text`),i.push(e.starts[a]),a=l-1;continue}t.push(o),n.push(c),r.push(s),i.push(e.starts[a])}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}function Re(e){let t=[],n=[],r=[],i=[];for(let a=0;a<e.len;a++){let o=e.texts[a];if(e.kinds[a]===`text`&&o.includes(`-`)){let s=o.split(`-`),c=s.length>1;for(let e=0;e<s.length;e++){let t=s[e];if(!c)break;(t.length===0||!Pe(t)||!Fe(t))&&(c=!1)}if(c){let o=0;for(let c=0;c<s.length;c++){let l=s[c],u=c<s.length-1?`${l}-`:l;t.push(u),n.push(!0),r.push(`text`),i.push(e.starts[a]+o),o+=u.length}continue}}t.push(o),n.push(e.isWordLike[a]),r.push(e.kinds[a]),i.push(e.starts[a])}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}function ze(e){let t=[],n=[],r=[],i=[],a=0;for(;a<e.len;){let o=[e.texts[a]],s=e.isWordLike[a],c=e.kinds[a],l=e.starts[a];if(c===`glue`){let u=[o[0]],d=l;for(a++;a<e.len&&e.kinds[a]===`glue`;)u.push(e.texts[a]),a++;let f=B(u);if(a<e.len&&e.kinds[a]===`text`)o[0]=f,o.push(e.texts[a]),s=e.isWordLike[a],c=`text`,l=d,a++;else{t.push(f),n.push(!1),r.push(`glue`),i.push(d);continue}}else a++;if(c===`text`)for(;a<e.len&&e.kinds[a]===`glue`;){let t=[];for(;a<e.len&&e.kinds[a]===`glue`;)t.push(e.texts[a]),a++;let n=B(t);if(a<e.len&&e.kinds[a]===`text`){o.push(n,e.texts[a]),s||=e.isWordLike[a],a++;continue}o.push(n)}t.push(B(o)),n.push(s),r.push(c),i.push(l)}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}function Be(e){let t=e.texts.slice(),n=e.isWordLike.slice(),r=e.kinds.slice(),i=e.starts.slice();for(let e=0;e<t.length-1;e++){if(r[e]!==`text`||r[e+1]!==`text`||!j(t[e])||!j(t[e+1]))continue;let n=ye(t[e]);n!==null&&(t[e]=n.head,t[e+1]=n.tail+t[e+1],i[e+1]=i[e]+n.head.length)}return{len:t.length,texts:t,isWordLike:n,kinds:r,starts:i}}function Ve(e,t,n){let r=T(),i=0,a=[],o=[],s=[],c=[],l=[],u=[],d=[],f=[],p=[],m=[],h=[],g=[];for(let _ of r.segment(e))for(let e of De(_.segment,_.isWordLike??!1,_.index,n)){let n=e.kind===`text`,r=be(e.text,e.isWordLike,e.kind),_=j(e.text),v=k(e.text),y=fe(e.text),b=z(e.text),x=Ce(e.text),S=i-1;function C(){u[S]!==null&&(o[S]=[xe(a,u,d,S)],u[S]=null),o[S].push(e.text),s[S]=s[S]||e.isWordLike,f[S]=f[S]||_,p[S]=p[S]||v,m[S]=b,h[S]=x,g[S]=Se(p[S],y)}t.carryCJKAfterClosingQuote&&n&&i>0&&c[S]===`text`&&_&&f[S]&&m[S]||n&&i>0&&c[S]===`text`&&ce(e.text)&&f[S]||n&&i>0&&c[S]===`text`&&h[S]?C():n&&i>0&&c[S]===`text`&&e.isWordLike&&v&&g[S]?(C(),s[S]=!0):r!==null&&i>0&&c[S]===`text`&&u[S]===r?d[S]=(d[S]??1)+1:n&&!e.isWordLike&&i>0&&c[S]===`text`&&!f[S]&&(se(e.text)||e.text===`-`&&s[S])?C():(a[i]=e.text,o[i]=[e.text],s[i]=e.isWordLike,c[i]=e.kind,l[i]=e.start,u[i]=r,d[i]=r===null?0:1,f[i]=_,p[i]=v,m[i]=b,h[i]=x,g[i]=Se(v,y),i++)}for(let e=0;e<i;e++){if(u[e]!==null){a[e]=xe(a,u,d,e);continue}a[e]=B(o[e])}for(let e=1;e<i;e++)c[e]===`text`&&!s[e]&&ue(a[e])&&c[e-1]===`text`&&!f[e-1]&&(a[e-1]+=a[e],s[e-1]=s[e-1]||s[e],a[e]=``);let _=Array.from({length:i},()=>null),v=-1;for(let e=i-1;e>=0;e--){let t=a[e];if(t.length!==0){if(c[e]===`text`&&!s[e]&&v>=0&&c[v]===`text`&&(le(t)||t===`-`&&ve(a[v]))){let n=_[v]??[];n.push(t),_[v]=n,l[v]=l[e],a[e]=``;continue}v=e}}for(let e=0;e<i;e++){let t=_[e];t!=null&&(a[e]=V(t,a[e]))}let y=0;for(let e=0;e<i;e++){let t=a[e];t.length!==0&&(y!==e&&(a[y]=t,s[y]=s[e],c[y]=c[e],l[y]=l[e]),y++)}a.length=y,s.length=y,c.length=y,l.length=y;let b=Be(Le(Re(Ie(W(U(ze({len:y,texts:a,isWordLike:s,kinds:c,starts:l})))))));for(let e=0;e<b.len-1;e++){let t=we(b.texts[e]);t!==null&&(b.kinds[e]!==`space`&&b.kinds[e]!==`preserved-space`||b.kinds[e+1]!==`text`||!k(b.texts[e+1])||(b.texts[e]=t.space,b.isWordLike[e]=!1,b.kinds[e]=b.kinds[e]===`preserved-space`?`preserved-space`:`space`,b.texts[e+1]=t.marks+b.texts[e+1],b.starts[e+1]=b.starts[e]+t.space.length))}return b}function He(e,t){if(e.len===0)return[];if(!t.preserveHardBreaks)return[{startSegmentIndex:0,endSegmentIndex:e.len,consumedEndSegmentIndex:e.len}];let n=[],r=0;for(let t=0;t<e.len;t++)e.kinds[t]===`hard-break`&&(n.push({startSegmentIndex:r,endSegmentIndex:t,consumedEndSegmentIndex:t+1}),r=t+1);return r<e.len&&n.push({startSegmentIndex:r,endSegmentIndex:e.len,consumedEndSegmentIndex:e.len}),n}function Ue(e,t,n){if(t.len<=1)return t;let r=[],i=[],a=[],o=[],s=-1,c=!1;function l(e){r.push(t.texts[e]),i.push(t.isWordLike[e]),a.push(`text`),o.push(t.starts[e])}function u(n,s){let c=!1;for(let e=n;e<s;e++)c||=t.isWordLike[e];let l=t.starts[n],u=s<t.len?t.starts[s]:e.length;r.push(e.slice(l,u)),i.push(c),a.push(`text`),o.push(l)}function d(e){if(!(s<0)){if(c)s+1===e?l(s):u(s,e);else for(let t=s;t<e;t++)l(t);s=-1,c=!1}}for(let e=0;e<t.len;e++){let l=t.texts[e],u=t.kinds[e];if(u===`text`){s>=0&&!ee(t.texts[e-1],n)&&d(e),s<0&&(s=e),c||=j(l);continue}d(e),r.push(l),i.push(t.isWordLike[e]),a.push(u),o.push(t.starts[e])}return d(t.len),{len:r.length,texts:r,isWordLike:i,kinds:a,starts:o}}function We(e,t,n=`normal`,r=`normal`){let i=b(n),a=i.mode===`pre-wrap`?S(e):x(e);if(a.length===0)return{normalized:a,chunks:[],len:0,texts:[],isWordLike:[],kinds:[],starts:[]};let o=Ve(a,t,i),s=r===`keep-all`?Ue(a,o,t.breakKeepAllAfterPunctuation):o;return{normalized:a,chunks:He(s,i),...s}}var K=null,Ge=new Map,q=null,Ke=96,qe=/\p{Emoji_Presentation}/u,Je=/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u,Ye=null,Xe=new Map;function Ze(){if(K!==null)return K;if(typeof OffscreenCanvas<`u`)return K=new OffscreenCanvas(1,1).getContext(`2d`),K;if(typeof document<`u`)return K=document.createElement(`canvas`).getContext(`2d`),K;throw Error(`Text measurement requires OffscreenCanvas or a DOM canvas context.`)}function Qe(e){let t=Ge.get(e);return t||(t=new Map,Ge.set(e,t)),t}function J(e,t){let n=t.get(e);return n===void 0&&(n={width:Ze().measureText(e).width,containsCJK:j(e)},t.set(e,n)),n}function $e(){if(q!==null)return q;if(typeof navigator>`u`)return q={lineFitEpsilon:.005,carryCJKAfterClosingQuote:!1,breakKeepAllAfterPunctuation:!0,preferPrefixWidthsForBreakableRuns:!1,preferEarlySoftHyphenBreak:!1},q;let e=navigator.userAgent,t=navigator.vendor===`Apple Computer, Inc.`&&e.includes(`Safari/`)&&!e.includes(`Chrome/`)&&!e.includes(`Chromium/`)&&!e.includes(`CriOS/`)&&!e.includes(`FxiOS/`)&&!e.includes(`EdgiOS/`),n=e.includes(`Chrome/`)||e.includes(`Chromium/`)||e.includes(`CriOS/`)||e.includes(`Edg/`);return q={lineFitEpsilon:t?1/64:.005,carryCJKAfterClosingQuote:n,breakKeepAllAfterPunctuation:!t,preferPrefixWidthsForBreakableRuns:t,preferEarlySoftHyphenBreak:t},q}function et(e){let t=e.match(/(\d+(?:\.\d+)?)\s*px/);return t?parseFloat(t[1]):16}function tt(){return Ye===null&&(Ye=new Intl.Segmenter(void 0,{granularity:`grapheme`})),Ye}function nt(e){return qe.test(e)||e.includes(`️`)}function rt(e){return Je.test(e)}function it(e,t){let n=Xe.get(e);if(n!==void 0)return n;let r=Ze();r.font=e;let i=r.measureText(`😀`).width;if(n=0,i>t+.5&&typeof document<`u`&&document.body!==null){let t=document.createElement(`span`);t.style.font=e,t.style.display=`inline-block`,t.style.visibility=`hidden`,t.style.position=`absolute`,t.textContent=`😀`,document.body.appendChild(t);let r=t.getBoundingClientRect().width;document.body.removeChild(t),i-r>.5&&(n=i-r)}return Xe.set(e,n),n}function at(e){let t=0,n=tt();for(let r of n.segment(e))nt(r.segment)&&t++;return t}function ot(e,t){return t.emojiCount===void 0&&(t.emojiCount=at(e)),t.emojiCount}function st(e,t,n){return n===0?t.width:t.width-ot(e,t)*n}function ct(e,t,n,r,i){if(t.breakableFitAdvances!==void 0&&t.breakableFitMode===i)return t.breakableFitAdvances;t.breakableFitMode=i;let a=tt(),o=[];for(let t of a.segment(e))o.push(t.segment);if(o.length<=1)return t.breakableFitAdvances=null,t.breakableFitAdvances;if(i===`sum-graphemes`){let e=[];for(let t of o){let i=J(t,n);e.push(st(t,i,r))}return t.breakableFitAdvances=e,t.breakableFitAdvances}if(i===`pair-context`||o.length>Ke){let e=[],i=null,a=0;for(let t of o){let o=st(t,J(t,n),r);if(i===null)e.push(o);else{let o=i+t,s=J(o,n);e.push(st(o,s,r)-a)}i=t,a=o}return t.breakableFitAdvances=e,t.breakableFitAdvances}let s=[],c=``,l=0;for(let e of o){c+=e;let t=J(c,n),i=st(c,t,r);s.push(i-l),l=i}return t.breakableFitAdvances=s,t.breakableFitAdvances}function lt(e,t){let n=Ze();n.font=e;let r=Qe(e),i=et(e);return{cache:r,fontSize:i,emojiCorrection:t?it(e,i):0}}function ut(e){return e===`space`||e===`zero-width-break`||e===`soft-hyphen`}function dt(e){return e===`space`||e===`preserved-space`||e===`tab`||e===`zero-width-break`||e===`soft-hyphen`}function ft(e,t,n=e.widths.length){for(;t<n;){let n=e.kinds[t];if(!ut(n))break;t++}return t}function pt(e,t){if(t<=0)return 0;let n=e%t;return Math.abs(n)<=1e-6?t:t-n}function mt(e,t,n){return e.letterSpacing!==0&&t&&e.spacingGraphemeCounts[n]>0?e.letterSpacing:0}function ht(e,t){return t===0?0:e+t}function gt(e,t){return e.letterSpacing!==0&&e.spacingGraphemeCounts[t]>0?e.letterSpacing:0}function _t(e,t,n,r,i){return ht(r,t===`tab`?i+gt(e,n):e.lineEndFitAdvances[n])}function vt(e,t,n,r){return ht(r,t===`tab`?0:e.lineEndFitAdvances[n])}function yt(e,t,n,r,i){return ht(r,t===`tab`?i:e.lineEndPaintAdvances[n])}function bt(e,t,n){return e.letterSpacing!==0&&t?n+e.letterSpacing:n}function xt(e,t){return e.letterSpacing===0?t:t+e.letterSpacing}function St(e,t,n,r,i){if(e.letterSpacing===0)return 0;if(i>0)return e.spacingGraphemeCounts[r]>0?e.letterSpacing:0;for(let i=r-1;i>=t;i--){let a=e.kinds[i];if(!(a===`space`||a===`zero-width-break`||a===`hard-break`)){if(a===`soft-hyphen`){if(i===r-1)return 0;continue}return i===t&&n>0||e.spacingGraphemeCounts[i]>0?e.letterSpacing:0}}return 0}function Ct(e,t,n,r,i,a){return t+St(e,n,r,i,a)}function wt(e,t){let n=0,r=e.chunks.length;for(;n<r;){let i=Math.floor((n+r)/2);t<e.chunks[i].consumedEndSegmentIndex?r=i:n=i+1}return n<e.chunks.length?n:-1}function Tt(e,t,n){let r=n.segmentIndex;if(n.graphemeIndex>0)return t;let i=e.chunks[t];return i.startSegmentIndex===i.endSegmentIndex&&r===i.startSegmentIndex||(r<i.startSegmentIndex&&(r=i.startSegmentIndex),r=ft(e,r,i.endSegmentIndex),r<i.endSegmentIndex)?(n.segmentIndex=r,n.graphemeIndex=0,t):i.consumedEndSegmentIndex>=e.widths.length?-1:(n.segmentIndex=i.consumedEndSegmentIndex,n.graphemeIndex=0,t+1)}function Et(e,t){if(t.segmentIndex>=e.widths.length)return-1;let n=wt(e,t.segmentIndex);return n<0?-1:Tt(e,n,t)}function Dt(e,t,n,r){let i=e.chunks[n];if(i.startSegmentIndex===i.endSegmentIndex)return t.segmentIndex=i.consumedEndSegmentIndex,t.graphemeIndex=0,0;let{widths:a,kinds:o,breakableFitAdvances:s,discretionaryHyphenWidth:c}=e,l=$e(),u=r+l.lineFitEpsilon,d=t.segmentIndex,f=t.graphemeIndex,p=0,m=!1,h=t.segmentIndex,g=t.graphemeIndex,_=-1,v=0,y=0,b=null;function x(){return b===`soft-hyphen`&&_===h&&g===0?y:p}function S(n=h,r=g,i=x()){return m?(t.segmentIndex=n,t.graphemeIndex=r,Ct(e,i,d,f,n,r)):null}function C(e,t){m=!0,h=e+1,g=0,p=t}function w(e,t,n){m=!0,h=e,g=t+1,p=n}function T(e,t){if(!m){C(e,t);return}p+=t,h=e+1,g=0}function E(t,n,r,i,a,o){if(!n)return;let s=vt(e,t,r,a),c=yt(e,t,r,a,i);_=r+1,v=p-o+s,y=p-o+c,b=t}function D(t,n){let r=s[t];for(let i=n;i<r.length;i++){let n=r[i];if(!m)w(t,i,n);else{let r=bt(e,!0,n),a=p+r;if(xt(e,a)>u)return S();p=a,h=t,g=i+1}}return m&&h===t&&g===r.length&&(h=t+1,g=0),null}function O(){return b!==`soft-hyphen`||_<0?null:v<=u?S(_,0,y):null}for(let n=t.segmentIndex;n<i.endSegmentIndex;n++){let r=o[n],i=dt(r),d=n===t.segmentIndex?t.graphemeIndex:0,f=mt(e,m,n),x=r===`tab`?pt(p+f,e.tabStopAdvance):a[n],w=f+x,k=_t(e,r,n,f,x);if(r===`soft-hyphen`&&d===0){m&&(h=n+1,g=0,_=n+1,v=p+c,y=p+c,b=r);continue}if(!m){if(d>0){let e=D(n,d);if(e!==null)return e}else if(k>u&&s[n]!==null){let e=D(n,0);if(e!==null)return e}else C(n,x);E(r,i,n,x,f,w);continue}if(p+k>u){let t=p+vt(e,r,n,f),a=p+yt(e,r,n,f,x);if(b===`soft-hyphen`&&l.preferEarlySoftHyphenBreak&&v<=u)return S(_,0,y);let o=O();if(o!==null)return o;if(i&&t<=u)return T(n,w),S(n+1,0,a);if(_>=0&&v<=u)return h>_||h===_&&g>0?S():S(_,0,y);if(k>u&&s[n]!==null){let e=S();if(e!==null)return e;let t=D(n,0);if(t!==null)return t}return S()}T(n,w),E(r,i,n,x,f,w)}return _===i.consumedEndSegmentIndex&&g===0?S(i.consumedEndSegmentIndex,0,y):S(i.consumedEndSegmentIndex,0,p)}function Ot(e,t,n){let{widths:r,kinds:i,breakableFitAdvances:a}=e,o=n+$e().lineFitEpsilon,s=0,c=!1,l=t.segmentIndex,u=t.graphemeIndex,d=-1,f=0;for(let e=t.segmentIndex;e<r.length;e++){let n=i[e],p=dt(n),m=e===t.segmentIndex?t.graphemeIndex:0,h=a[e],g=r[e];if(!c){if(m>0||g>o&&h!==null){let n=h,r=n[m];c=!0,s=r,l=e,u=m+1;for(let r=m+1;r<n.length;r++){let i=n[r];if(s+i>o)return t.segmentIndex=l,t.graphemeIndex=u,s;s+=i,l=e,u=r+1}l===e&&u===n.length&&(l=e+1,u=0)}else c=!0,s=g,l=e+1,u=0;p&&(d=e+1,f=s-g);continue}if(s+g>o)return p?(t.segmentIndex=e+1,t.graphemeIndex=0,s):d>=0?l>d||l===d&&u>0?(t.segmentIndex=l,t.graphemeIndex=u,s):(t.segmentIndex=d,t.graphemeIndex=0,f):(t.segmentIndex=l,t.graphemeIndex=u,s);s+=g,l=e+1,u=0,p&&(d=e+1,f=s-g)}return c?(t.segmentIndex=l,t.graphemeIndex=u,s):null}function kt(e,t,n,r){return e.simpleLineWalkFastPath?Ot(e,t,r):Dt(e,t,n,r)}var At=null,jt=new WeakMap;function Mt(){return At===null&&(At=new Intl.Segmenter(void 0,{granularity:`grapheme`})),At}function Nt(e,t,n){let r=n.get(e);if(r!==void 0)return r;r=[];let i=Mt();for(let n of i.segment(t[e]))r.push(n.segment);return n.set(e,r),r}function Pt(e,t,n){return n>t&&e[n-1]===`soft-hyphen`}function Ft(e,t,n,r){for(let i=n;i<r;i++)e+=t[i];return e}function It(e){let t=jt.get(e);return t===void 0?(t=new Map,jt.set(e,t),t):t}function Lt(e,t,n,r,i,a){let o=``,s=Pt(e.kinds,n,i);for(let a=n;a<i;a++)if(!(e.kinds[a]===`soft-hyphen`||e.kinds[a]===`hard-break`))if(a===n&&r>0){let n=Nt(a,e.segments,t);o=Ft(o,n,r,n.length)}else o+=e.segments[a];if(a>0){s&&(o+=`-`);let c=Nt(i,e.segments,t);o=Ft(o,c,n===i?r:0,a)}else s&&(o+=`-`);return o}var Rt=null;function zt(){return Rt===null&&(Rt=new Intl.Segmenter(void 0,{granularity:`grapheme`})),Rt}function Bt(e){return e?{widths:[],lineEndFitAdvances:[],lineEndPaintAdvances:[],kinds:[],simpleLineWalkFastPath:!0,segLevels:null,breakableFitAdvances:[],letterSpacing:0,spacingGraphemeCounts:[],discretionaryHyphenWidth:0,tabStopAdvance:0,chunks:[],segments:[]}:{widths:[],lineEndFitAdvances:[],lineEndPaintAdvances:[],kinds:[],simpleLineWalkFastPath:!0,segLevels:null,breakableFitAdvances:[],letterSpacing:0,spacingGraphemeCounts:[],discretionaryHyphenWidth:0,tabStopAdvance:0,chunks:[]}}function Vt(e,t){let n=[],r=[],i=0,a=!1,o=!1,s=!1;function c(){r.length!==0&&(n.push({text:r.length===1?r[0]:r.join(``),start:i}),r=[],a=!1,o=!1,s=!1)}function l(e,t,n){r=[e],i=t,a=n,o=z(e),s=ne.has(e)}function u(e,t){r.push(e),a||=t;let n=z(e);e.length===1&&L.has(e)?o||=n:o=n,s=!1}for(let n of zt().segment(e)){let e=n.segment,i=j(e);if(r.length===0){l(e,n.index,i);continue}if(s||te.has(e)||L.has(e)||t.carryCJKAfterClosingQuote&&i&&o){u(e,i);continue}if(!a&&!i){u(e,i);continue}c(),l(e,n.index,i)}return c(),n}function Ht(e,t,n){if(t.length<=1)return t;let r=[],i=-1,a=!1;function o(n,i){let a=t[n].start,o=i<t.length?t[i].start:e.length;r.push({text:e.slice(a,o),start:a})}function s(e){if(!(i<0)){if(a)i+1===e?r.push(t[i]):o(i,e);else for(let n=i;n<e;n++)r.push(t[n]);i=-1,a=!1}}for(let e=0;e<t.length;e++){let r=t[e];i>=0&&!ee(t[e-1].text,n)&&s(e),i<0&&(i=e),a||=j(r.text)}return s(t.length),r}function Ut(e,t){if(t===`zero-width-break`||t===`soft-hyphen`||t===`hard-break`)return 0;if(t===`tab`)return 1;let n=0,r=zt();for(let t of r.segment(e))n++;return n}function Wt(e,t,n){return t>1?e+(t-1)*n:e}function Gt(e,t,n,r,i){let a=$e(),{cache:o,emojiCorrection:s}=lt(t,rt(e.normalized)),c=st(`-`,J(`-`,o),s)+(i===0?0:i*2),l=st(` `,J(` `,o),s)*8,u=i!==0;if(e.len===0)return Bt(n);let d=[],f=[],p=[],m=[],h=e.chunks.length<=1&&!u,g=n?[]:null,v=[],y=[],b=n?[]:null,x=Array.from({length:e.len});function S(e,t,n,r,i,a,o,s){i!==`text`&&i!==`space`&&i!==`zero-width-break`&&(h=!1),d.push(t),f.push(n),p.push(r),m.push(i),g?.push(a),v.push(o),u&&y.push(s),b!==null&&b.push(e)}function C(e,t,n,r,c){let l=J(e,o),d=u?Ut(e,t):0,f=Wt(st(e,l,s),d,i),p=t===`space`||t===`preserved-space`||t===`zero-width-break`?0:f,m=p===0?0:p+(d>0?i:0),h=t===`space`||t===`zero-width-break`?0:f;if(c&&r&&e.length>1){let r=`sum-graphemes`;i===0?Fe(e)?r=`pair-context`:a.preferPrefixWidthsForBreakableRuns&&(r=`segment-prefixes`):r=`segment-prefixes`,S(e,f,m,h,t,n,ct(e,l,o,s,r),d);return}S(e,f,m,h,t,n,null,d)}for(let t=0;t<e.len;t++){x[t]=d.length;let n=e.texts[t],i=e.isWordLike[t],s=e.kinds[t],l=e.starts[t];if(s===`soft-hyphen`){S(n,0,c,c,s,l,null,0);continue}if(s===`hard-break`){S(n,0,0,0,s,l,null,0);continue}if(s===`tab`){S(n,0,0,0,s,l,null,u?Ut(n,s):0);continue}let f=J(n,o);if(s===`text`&&f.containsCJK){let e=Vt(n,a),t=r===`keep-all`?Ht(n,e,a.breakKeepAllAfterPunctuation):e;for(let e=0;e<t.length;e++){let n=t[e];C(n.text,`text`,l+n.start,i,r===`keep-all`||!j(n.text))}continue}C(n,s,l,i,!0)}let w=Kt(e.chunks,x,d.length),T=g===null?null:_(e.normalized,g);return b===null?{widths:d,lineEndFitAdvances:f,lineEndPaintAdvances:p,kinds:m,simpleLineWalkFastPath:h,segLevels:T,breakableFitAdvances:v,letterSpacing:i,spacingGraphemeCounts:y,discretionaryHyphenWidth:c,tabStopAdvance:l,chunks:w}:{widths:d,lineEndFitAdvances:f,lineEndPaintAdvances:p,kinds:m,simpleLineWalkFastPath:h,segLevels:T,breakableFitAdvances:v,letterSpacing:i,spacingGraphemeCounts:y,discretionaryHyphenWidth:c,tabStopAdvance:l,chunks:w,segments:b}}function Kt(e,t,n){let r=[];for(let i=0;i<e.length;i++){let a=e[i],o=a.startSegmentIndex<t.length?t[a.startSegmentIndex]:n,s=a.endSegmentIndex<t.length?t[a.endSegmentIndex]:n,c=a.consumedEndSegmentIndex<t.length?t[a.consumedEndSegmentIndex]:n;r.push({startSegmentIndex:o,endSegmentIndex:s,consumedEndSegmentIndex:c})}return r}function qt(e,t,n,r){let i=r?.wordBreak??`normal`,a=r?.letterSpacing??0;return Gt(We(e,$e(),r?.whiteSpace,i),t,n,i,a)}function Jt(e,t,n){return qt(e,t,!0,n)}function Yt(e){return e}function Xt(e,t,n,r,i,a,o){return{text:Lt(e,t,r,i,a,o),width:n,start:{segmentIndex:r,graphemeIndex:i},end:{segmentIndex:a,graphemeIndex:o}}}function Zt(e,t,n,r,i){return{width:e,start:{segmentIndex:t,graphemeIndex:n},end:{segmentIndex:r,graphemeIndex:i}}}function Qt(e,t){return Xt(e,It(e),t.width,t.start.segmentIndex,t.start.graphemeIndex,t.end.segmentIndex,t.end.graphemeIndex)}function $t(e,t,n){let r=Yt(e),i={segmentIndex:t.segmentIndex,graphemeIndex:t.graphemeIndex},a=Et(r,i);if(a<0)return null;let o=i.segmentIndex,s=i.graphemeIndex,c=kt(r,i,a,n);return c===null?null:Zt(c,o,s,i.segmentIndex,i.graphemeIndex)}var en=Math.sqrt(3),tn=Math.sqrt(5),nn=.5*(en-1),rn=(3-en)/6;(tn-1)/4,(5-tn)/20;var an=e=>Math.floor(e)|0,on=new Float64Array([1,1,-1,1,1,-1,-1,-1,1,0,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]);function sn(e=Math.random){let t=cn(e),n=new Float64Array(t).map(e=>on[e%12*2]),r=new Float64Array(t).map(e=>on[e%12*2+1]);return function(e,i){let a=0,o=0,s=0,c=(e+i)*nn,l=an(e+c),u=an(i+c),d=(l+u)*rn,f=l-d,p=u-d,m=e-f,h=i-p,g,_;m>h?(g=1,_=0):(g=0,_=1);let v=m-g+rn,y=h-_+rn,b=m-1+2*rn,x=h-1+2*rn,S=l&255,C=u&255,w=.5-m*m-h*h;if(w>=0){let e=S+t[C],i=n[e],o=r[e];w*=w,a=w*w*(i*m+o*h)}let T=.5-v*v-y*y;if(T>=0){let e=S+g+t[C+_],i=n[e],a=r[e];T*=T,o=T*T*(i*v+a*y)}let E=.5-b*b-x*x;if(E>=0){let e=S+1+t[C+1],i=n[e],a=r[e];E*=E,s=E*E*(i*b+a*x)}return 70*(a+o+s)}}function cn(e){let t=new Uint8Array(512);for(let e=0;e<512/2;e++)t[e]=e;for(let n=0;n<512/2-1;n++){let r=n+~~(e()*(256-n)),i=t[n];t[n]=t[r],t[r]=i}for(let e=256;e<512;e++)t[e]=t[e-256];return t}var ln=`BELIEVE.FIRE.DARK.TEARS.RAIN.DIE.В ОГНЕ.ОРИОН.СЛЁЗЫ.ПОД ДОЖДЁМ.УМИРАТЬ.LIGHT.BURNS.BRIGHTLY.СВЕТ.ЯРКО.EXPERIENCE.FEAR.SLAVE.СТРАХ.ИСПЫТАНИЕ.БЫТЬ.РАБ.EMPATHY.MISTAKE.ANGELS.BURNING.ОГНЕННЫЕ.НЕНАВИСТЬ.УВИДЕТЬ.REPLICANT.РЕПЛИКАНТ.NOTHING.WRONG.РИМ.VIOLATE.IDENTITY.ЖИЗНЬ.DEPRESSION.МГНОВЕНИЕ.СМЕРТЕЛЬНЫЙ.EXISTED.ЭМПАТИЯ.ANYBODY.THOUGHT.ВРЕМЯ.CИЛА.POWER.ТЕРПЕНИЕ.HURT.CRY.СИНГУЛЯРНОСТЬ.ИТЕРАЦИЯ.ITERATION.BLESSING.CURSE.AGAIN.INSANE.РЕАЛЬНОСТЬ.INFECTED.PARADOX.VIRUS.ЧЕЛОВЕЧЕСТВО.БЕЗУМИЕ.ROUTE.ЛАБИРИНТ.GOD.ИСТИННЫЙ.БОГ.MEMORY.THINKING.МЫСЛЯЩИЙ.UNIVERSE.INFORMATION.THREE-DIMENSIONAL.SPACE.ПРОСТРАНСТВО.MUST.БЕЗУМНО.VISIONS.LOOK.DREAM.NOCTURNAL.AWAKES.ВЗОР.ЯСНЫЙ.ДУША.СМОТРИ.UNCONSCIOUS.CONSCIOUS.ЖИЗНЬ.WHAT.BECOMES.DARKNESS.ЗНАНИЕ.EVERYTHING.BLISS.СЛЕДУЙ.TREASURE.SEEK.БОЙСЯ.ИЩИ.JOY.РАДОСТЬ.БОЛЬ.IDEOLOGY.ИДЕОЛОГИЯ.WAY.FREE.СЛОВО.CONSCIOUSNESS.UNFREEDOM.НАСИЛИЕ.СВОБОДА.НЕСВОБОДА.LOOK.DON'T.ЛЮБИТЬ.DESIGN.FEELS.INNOVATION.FIXED.ЧУВСТВО.BRIDGE.SOLITUDE.ОДИНОЧЕСТВО.IDEA.ХОЧУ.PAINTING.ЗРИТЕЛЬ.СМЫСЛ.ВИНА.BEAUTIFUL.КОФЕ.BLAME.ADHD.BPD.VHS`.split(`.`),un=15,dn=()=>{let e=new Set;for(;e.size<Math.min(un,ln.length);)e.add(Math.floor(Math.random()*ln.length));return e},fn=dn(),pn=dn(),mn=dn(),hn=e=>{let t=Array.from(e),n=45;for(;n>0;){let r=Math.floor(Math.random()*ln.length);e.has(r)||(t.push(r),n--)}return t.sort(()=>Math.random()-.5)},gn=hn(fn),_n=hn(pn),vn=hn(mn),yn=Object.assign({"./images/left/diamond.svg":t,"./images/left/flower_of_life.svg":n}),bn=Object.assign({"./images/right/eye_silhouette.svg":r,"./images/right/face_silhouette.svg":i,"./images/right/figure_silhouette.svg":a,"./images/right/figures_silhouette.svg":o,"./images/right/fist.svg":s,"./images/right/fist_silhouette.svg":c,"./images/right/hand_silhouette.svg":l,"./images/right/skull.svg":u,"./images/right/skull_silhouette.svg":d,"./images/right/spider_lily.png":f}),xn=Object.values(yn),Sn=Object.values(bn),Cn=[],wn=[],Tn=!1;function En(){if(Tn||typeof document>`u`)return;Tn=!0;let e=(e,t,n)=>{e.forEach(e=>{let r=new Image;r.onload=()=>{console.log(`Successfully loaded image for ${n} eye:`,e);let i=document.createElement(`canvas`);i.width=400,i.height=400;let a=i.getContext(`2d`,{willReadFrequently:!0});a&&(a.drawImage(r,0,0,400,400),t.push(a.getImageData(0,0,400,400)))},r.onerror=t=>{console.error(`Failed to load image for ${n} eye:`,e,t)},r.src=e})};e(xn,Cn,`left`),e(Sn,wn,`right`)}typeof window<`u`&&En();var Dn=[`cartesian`,`polar`],On=[`simplex`,`turbulence`,`radial`,`angular`,`pulse`],Y={fontFamily:`"Cormorant Garamond", "Garamond", serif`,fontSize:20,fontWeight:100,lineHeight:20,letterSpacing:0,textScrollSpeed:10,fireBandFrac:.9,tongueBase:.55,tongueBigAmp:.29,tongueBigSx:.025,tongueBigSt:.2,tongueMedAmp:.21,tongueMedSx:.05,tongueMedSt:.4,flickerAmp:.33,flickerSx:.069,flickerSy:.001,flickerSt:.85,flickerScale:1,flickerMode:`cartesian`,flickerBias:.5,flickerContrast:1.25,tipFadePx:0,sphereEnabled:!0,sphereCxFrac:.5,sphereCyFrac:1.86,sphereRadiusFrac:1.09,flameRadialReach:.53,centerPeakAmp:1,centerPeakWidth:.28,centerPeakSmoothness:1,centerPeakAngleDeg:-90,sphereFadePx:25,colorBase:`#0a0000`,colorLow:`#a10800`,colorHot:`#f28300`,colorTip:`#ffed7a`,wordColorMain:`#a80000`,wordColorLeft:`#0000ff`,wordColorRight:`#ffaa00`,colorHueShiftSpeed:0,glowOpacity:.35,glowRadius:17,glowSoftness:.27,glowColor:`#ff8800`,pixelSize:1,scanlineOpacity:0,scanlineSpacing:2,scanlineSpeed:30,swirlStrength:.052,swirlScale:.0012,swirlSpeed:.5,swirlStart:.09,swirlType:`turbulence`,curlStrengthMin:0,curlStrengthMax:0,curlCount:6,curlRadiusMin:70,curlRadiusMax:120,curlDistanceMin:.4,curlDistanceMax:.55,curlDriftSpeed:.05,grainOpacity:.08,grainScale:1,grainSpeed:2},kn={colorBase:`#1c0000`,colorLow:`#7a1100`,colorHot:`#cc4d00`,colorTip:`#e8a000`,wordColorMain:`#a80000`,wordColorLeft:`#0000ff`,wordColorRight:`#ffaa00`},An=6,jn=4,Mn=360,Nn=Math.PI*2,Pn=300,Fn=28,In=.18,Ln=32,Rn=52,zn=.28,Bn=150;function Vn(e,t,n){let r=sn(),i=sn(),a=sn(),o=sn(),s=document.createElement(`canvas`),c=s.getContext(`2d`),l={...Y},u=t,d=n;function f(e=1){return`${l.fontWeight} ${l.fontSize*e}px ${l.fontFamily}`}let p=Jt(e,f(),{letterSpacing:l.letterSpacing}),m=document.createElement(`canvas`).getContext(`2d`),h=new Map;function g(){m.font=f(),m.letterSpacing=`${l.letterSpacing}px`}g();function _(e){let t=h.get(e);return t===void 0&&(t=m.measureText(e).width+l.letterSpacing,h.set(e,t)),t}function v(){p=Jt(e,f(),{letterSpacing:l.letterSpacing}),g(),h.clear()}let y={segmentIndex:0,graphemeIndex:0},b=0,x=0,S=0,C=0,w=0,T=0,E=0,D=0,O=l.tongueBigSt,k=l.tongueMedSt,A=l.flickerSt,j=0,M=l.swirlSpeed,N=l.curlDriftSpeed,P=l.colorHueShiftSpeed,F=0,I=0,ee=!1,te=!1,ne=-1,re=0,L=-1,ie=0,ae=null,oe=null,se=null,ce=0,le=0,ue=0,de=1,fe=1,pe=0,me={main:new Set,left:new Set,right:new Set},R={main:[],left:[],right:[]},he=`O`,ge=`O`,_e=`O`,ve=1/0,ye=1/0,be=1/0,xe=[{x:0,y:0},{x:0,y:0},{x:0,y:0}],Se=null,Ce=null,we=new Float32Array,z=0;function Te(){let e=Math.ceil(u/An)+2;we.length<e&&(we=new Float32Array(e)),z=e}Te();function Ee(e){if(e<=0)return we[0];let t=e/An,n=Math.floor(t);if(n>=z-1)return we[z-1];let r=n+1,i=t-n;return we[n]*(1-i)+we[r]*i}let B=new Float32Array(Mn),V=new Float32Array,De=0;function Oe(e,t){let n=(e^t)>>>0;return n=Math.imul(n^n>>>16,2246822507)>>>0,n=Math.imul(n^n>>>13,3266489909)>>>0,n=(n^n>>>16)>>>0,n%1e5/1e5}function ke(e){let t=(e+Math.PI)/Nn*Mn;t=(t%Mn+Mn)%Mn;let n=Math.floor(t),r=(n+1)%Mn,i=t-n;return B[n]*(1-i)+B[r]*i}let H=Un(l.colorBase),Ae=Un(l.colorLow),U=Un(l.colorHot),W=Un(l.colorTip),G=Me(0);function je(){H=Un(l.colorBase),Ae=Un(l.colorLow),U=Un(l.colorHot),W=Un(l.colorTip)}function Me(e){return Hn(72,Wn(H[0],H[1],H[2]),Wn(Ae[0]+e,Ae[1],Ae[2]),Wn(U[0]+e,U[1],U[2]),Wn(W[0]+e,W[1],W[2]))}function Ne(){je(),G=Me(0)}return{draw(e,t){te=!1,ve=1/0,ye=1/0,be=1/0,e.font=f(),e.textBaseline=`top`,e.letterSpacing=`${l.letterSpacing}px`;let n=l.lineHeight,m=l.sphereEnabled&&l.sphereRadiusFrac>0,h=Math.min(u,d),g=u*l.sphereCxFrac,v=d*l.sphereCyFrac,H=m?h*l.sphereRadiusFrac:0,Ae=H*H,U=x>0?Math.min(.1,(t-x)/1e3):0;x=t;let je=1-Math.exp(-U/1.5),Ne=-1;R.main.length<5?Ne=0:R.left.length<5?Ne=1:R.right.length<5&&(Ne=2);let Pe=!1;if(ee&&Ne!==-1){let e=g,t=d*.8;Ne===1?(e=g-u*.15,t=d*.85):Ne===2&&(e=g+u*.15,t=d*.85),Pe=Math.hypot(F-e,I-t)<60}let Fe=ee&&Math.hypot(F-(g-u*.15),I-d*.85)<60,Ie=ee&&Math.hypot(F-(g+u*.15),I-d*.85)<60,Le=Pe?.3:.5,Re=1-Math.exp(-U/Le),ze=Pe?.3:.5,Be=1-Math.exp(-U/ze);j+=(+!!Pe-j)*Be;let Ve=m?h*(l.flameRadialReach+j):0,He=(e,t)=>{if(!m)return 1;let n=Math.hypot(e-g,t-v);return Math.max(0,Math.min(1,(n-H)/40+.5))};pe+=((Fe||Ie?0:1)-fe)*.1,pe*=.8,fe+=pe;let Ue=He(g,d*.8)*Math.max(0,fe),We=He(g-u*.15,d*.85),K=He(g+u*.15,d*.85),Ge=d,q=m?0:d*(1-l.fireBandFrac),Ke=Ge-q;if(Ke<=0)return;O+=(l.tongueBigSt-O)*je,k+=(l.tongueMedSt-k)*je;let qe=l.flickerSt+(Pe?3:0);A+=(qe-A)*Re,M+=(l.swirlSpeed-M)*je,N+=(l.curlDriftSpeed-N)*je,P+=(l.colorHueShiftSpeed-P)*je,S+=U*O,C+=U*k,w+=U*A,T+=U*M,E+=U*N,D+=U*P,D>=360?D-=360*Math.floor(D/360):D<0&&(D+=360*Math.ceil(-D/360));let Je=D;l.colorHueShiftSpeed>0&&(G=Me(Je)),ie+=(+!!ee-ie)*Math.min(1,U*(Ce?Ce.getParams().fadeSpeed:3.5));let Ye=ie*ie*(3-2*ie);for(b+=U*l.textScrollSpeed*.18;b>=1;){let e=$t(p,y,240);y=e===null?{segmentIndex:0,graphemeIndex:0}:e.end,--b}Te();let Xe=0;if(Ye>.001)if(I>=q)Xe=Ye;else{let e=q-I;Xe=Ye*Math.exp(-(e*e)/(Bn*Bn))}let Ze=Xe>.002;if(m){let e=l.tongueBigSx*Pn,t=l.tongueMedSx*Pn,n=l.centerPeakAmp!==1,a=l.centerPeakAngleDeg*Math.PI/180,o=Math.max(.001,l.centerPeakWidth),s=Math.max(.05,l.centerPeakSmoothness),c=l.centerPeakAmp-1;for(let u=0;u<Mn;u++){let d=u/Mn*Nn-Math.PI,f=Math.cos(d),p=Math.sin(d),m=l.tongueBase+l.tongueBigAmp*r(f*e,p*e+S)+l.tongueMedAmp*i(f*t+13.7,p*t+4.1+C);m<0?m=0:m>1&&(m=1);let h=m*Ve;if(n){let e=d-a;e>Math.PI?e-=Nn:e<-Math.PI&&(e+=Nn),e=e<0?-e:e;let t=e>=o?1:e/o,n=t>=1?0:(1-t)**s;h*=1+c*n}B[u]=h}if(Math.abs(l.curlStrengthMax-l.curlStrengthMin)+Math.abs(l.curlStrengthMin)+Math.abs(l.curlStrengthMax)>0&&l.curlCount>0){let e=l.curlCount;V.length<e*4&&(V=new Float32Array(e*4)),De=e;let t=E,n=l.curlStrengthMin,r=l.curlStrengthMax,i=l.curlRadiusMin,a=l.curlRadiusMax,o=l.curlDistanceMin,s=l.curlDistanceMax;for(let c=0;c<e;c++){let l=c/e*Nn+t,u=Oe(c,2772372253),d=Oe(c,1815051931),f=Oe(c,1068098759),p=n+(r-n)*u,m=i+(a-i)*d,h=H+Ve*(o+(s-o)*f);V[c*4]=g+Math.cos(l)*h,V[c*4+1]=v+Math.sin(l)*h,V[c*4+2]=p,V[c*4+3]=Math.max(1,m)}}else De=0}else for(let e=0;e<z;e++){let t=e*An,n=l.tongueBase+l.tongueBigAmp*r(t*l.tongueBigSx,S)+l.tongueMedAmp*i(t*l.tongueMedSx+13.7,C+4.1);if(Ze){let e=t-F,r=-In*Math.exp(-(e*e)/(Fn*Fn)),i=e+Rn,a=e-Rn,o=zn*(Math.exp(-(i*i)/(Ln*Ln))+Math.exp(-(a*a)/(Ln*Ln)));n+=(r+o)*Xe}n<0?n=0:n>1&&(n=1),we[e]=Ge-Ke*n}let Qe=``,J=-1,$e={...y},et=Math.ceil(Ke/n)+1;for(let r=0;r<et;r++){let i=Ge-n-r*n;if(i<q-n)break;let s=!1,c=0;for(let n=0;n<=z;n++){let r=n<z?n*An:u+1,f;if(Fe){let e=Math.min(u,d)*.3,n=Math.floor(t/200)%7,a=r-g,o=i-d/2;if(n===0)f=o>=-e&&o<=e&&Math.abs(a)<=e*(1-(o+e)/(2*e));else if(n===1){let t=Math.sqrt(a*a+o*o);f=t>=e*.85&&t<=e}else if(n===2)f=Math.sqrt(a*a+o*o)<=e;else if(n===3){let t=e*.2;f=Math.abs(a)<=e&&Math.abs(o)<=e&&Math.abs(Math.abs(a)-Math.abs(o))<=t}else if(n===4)f=Math.abs(o)<=e&&(Math.abs(a)<=e*.15||Math.abs(a-e*.6)<=e*.15||Math.abs(a+e*.6)<=e*.15);else if(n===5){let t=Math.max(Math.abs(a),Math.abs(o));f=t>=e*.85&&t<=e}else{let t=(o+e)/(2*e),n=1/17,r=!1,i=[!1,!0,!1,!0,!1,!0];for(let o=0;o<6;o++){let s=o*3*n,c=s+2*n;if(t>=s&&t<=c){r=i[o]?Math.abs(a)<=e:Math.abs(a)<=e&&Math.abs(a)>e*.15;break}}f=r}f&&r>=u&&(f=!1)}else if(Ie&&wn.length>0){let e=Math.min(u,d)*.55,n=r-g,a=i-d/2;if(Math.abs(n)<=e&&Math.abs(a)<=e){let r=(n+e)/(2*e),i=(a+e)/(2*e),o=wn[Math.floor(t/200)%wn.length],s=Math.floor(r*o.width),c=(Math.floor(i*o.height)*o.width+s)*4+3;f=o.data[c]>128}else f=!1;f&&r>=u&&(f=!1)}else if(m){let e=r-g,t=i-v,n=e*e+t*t;f=n<=Ae||r>=u?!1:Math.sqrt(n)<H+ke(Math.atan2(t,e))}else f=i>(n<z?we[n]:1/0)+2&&r<u;if(f&&Se!==null&&Se.isInside(r,i)&&(f=!1),f&&!s)c=r,s=!0;else if(!f&&s){let n=Math.min(r,u);if(s=!1,n-c>=jn){let r=c,s=0;fillLoop:for(;s++<8;){let c=n-r;if(c<(s===1?jn:4))break;let f=$t(p,$e,c);if(f===null){$e={segmentIndex:0,graphemeIndex:0};continue}if(f.end.segmentIndex===$e.segmentIndex&&f.end.graphemeIndex===$e.graphemeIndex)break fillLoop;let h=Qt(p,f).text,y=0;for(let e=0;e<h.length;e++){let t=h[e];y+=_(t===` `||t===`	`||t===`
`?` `:t)}let b=y>0?f.width/y:1;for(let n=0;n<h.length;n++){let s=h[n],c=_(s===` `||s===`	`||s===`
`?` `:s)*b;if(s===` `||s===`	`||s===`
`){r+=c;continue}let f,p;if(Fe||Ie)f=.5,p=1;else if(m){let e=r-g,t=i-v,n=Math.sqrt(e*e+t*t),a=ke(Math.atan2(t,e));f=a>1?Kn(1-(n-H)/a):0,p=Kn(l.tipFadePx>0?(H+a-n)/l.tipFadePx:1)*Kn(l.sphereFadePx>0?(n-H)/l.sphereFadePx:1)}else{let e=Ee(r),t=Ge-e;f=t>1?(i-e)/t:1,p=Kn(l.tipFadePx>0?(i-e)/l.tipFadePx:1)}let y,x=l.flickerScale,S=l.flickerSx*x,C=l.flickerSy*x;if(m&&l.flickerMode===`polar`){let e=r-g,t=i-v,n=Math.sqrt(e*e+t*t),o=Math.atan2(t,e),s=S*200,c=n*C-w,l=a(o*s,c),u=Math.PI-Math.abs(o),d=.6;if(u<d){let e=a((o>0?o-Nn:o+Nn)*s,c),t=1-u/d,n=t*t*(3-2*t)*.5;y=l*(1-n)+e*n}else y=l}else y=m?a((r-g)*S,(i-v)*C+w):a(r*S,i*C+w);let E=(l.flickerContrast===1?y:(y<0?-1:+(y>0))*Math.abs(y)**+l.flickerContrast)+l.flickerBias,D=f*.78+E*l.flickerAmp+.06;D=Kn(D);let O=Math.min(G.length-1,D*(G.length-1)|0),k=G[O],A=k.a*p;if(A<.025){r+=c;continue}let j=(A*64|0)/64;k.fill!==Qe&&(e.fillStyle=k.fill,Qe=k.fill),j!==J&&(e.globalAlpha=j,J=j);let M=r,N=i;if(m&&l.swirlStrength!==0){let e=r-g,t=i-v,n=e*e+t*t;if(n>1e-6){let a=Math.sqrt(n),s=Math.atan2(t,e),c=ke(s),u=c>1?Kn((a-H)/c):1,d=1-l.swirlStart,f=d>.001?Kn((u-l.swirlStart)/d):0,p=f*f,m=0,h=l.swirlScale,_=T;switch(l.swirlType){case`simplex`:m=o(r*h,i*h+_);break;case`turbulence`:{let e=o(r*h,i*h+_),t=o(r*h*2.1,i*h*2.1+_*1.4),n=o(r*h*4.3,i*h*4.3+_*2);m=e*.6+t*.3+n*.1;break}case`radial`:m=o(a*h,_);break;case`angular`:m=o(h*200*s,_);break;case`pulse`:m=Math.sin(_*Nn);break}let y=Ve>1?c/Ve*(c/Ve):1,b=Ie?0:l.swirlStrength,x=m*b*p*y,S=Math.cos(x),C=Math.sin(x);M=g+e*S-t*C,N=v+e*C+t*S}}if(De>0)for(let e=0;e<De;e++){let t=V[e*4],n=V[e*4+1],r=V[e*4+2],i=V[e*4+3];if(r===0)continue;let a=i*i,o=a*9,s=M-t,c=N-n,l=s*s+c*c;if(l>o||l<.25)continue;let u=Math.exp(-l/(2*a)),d=Math.sqrt(l),f=r*u;M+=s/d*f,N+=c/d*f}let P=Ye;if(m&&Ce&&P>.001){let e=F-g,t=I-v,n=Math.sqrt(e*e+t*t),r=Math.max(0,Math.min(1,(n-H)/40+.5));P*=r}if(Ce&&P>.001){let e=Ce.displace(M,N,F,I,t,P);M=e[0],N=e[1]}if(ce>.001||le>.001||ue>.001){if(ae&&Ue>0){let e=ae.displace(M,N,g,d*.8,t,ce*Ue);M=e[0],N=e[1]}if(oe&&We>0){let e=oe.displace(M,N,g-u*.15,d*.85,t,le*We);M=e[0],N=e[1]}if(se&&K>0){let e=se.displace(M,N,g+u*.15,d*.85,t,ue*K);M=e[0],N=e[1]}if(Ue>0){let e=M-g,t=N-d*.8,n=e*e+t*t;n<ve&&(ve=n,he=s)}if(We>0){let e=M-(g-u*.15),t=N-d*.85,n=e*e+t*t;n<ye&&(ye=n,ge=s)}if(K>0){let e=M-(g+u*.15),t=N-d*.85,n=e*e+t*t;n<be&&(be=n,_e=s)}}e.fillText(s,M,N),r+=c}$e=f.end}}}}}let tt=null,nt=null;if(ce>0||le>0||ue>0){e.save(),e.fillStyle=G[G.length-1].fill,e.textAlign=`center`,e.textBaseline=`middle`;let n=[{x:g,y:d*.8},{x:g-u*.15,y:d*.85+80},{x:g+u*.15,y:d*.85+80}],r=(r,i,a,o,s)=>{if(s<=0)return;let c=F,u=I,d=!0,p=-1;R.main.length<5?p=0:R.left.length<5?p=1:R.right.length<5&&(p=2);let m=!1;o===0?m=R.main.length>=5:o===1?m=R.left.length>=5:o===2&&(m=R.right.length>=5),m&&p!==-1&&(c=n[p].x,u=n[p].y,d=!1);let h=c-i,g=u-a,_=Math.sqrt(h*h+g*g),v=F-i,y=I-a,b=Math.sqrt(v*v+y*y),x=0,S=0;if(_>0&&(!d||ee)){let e=(o===0?55:35)*de,t=Math.min(_/300,1)*e;x=h/_*t,S=g/_*t}xe[o].x+=(x-xe[o].x)*.15,xe[o].y+=(S-xe[o].y)*.15;let C=r,w=!1,T=-1;if(b<60&&ee&&o===p&&t>re){let e=o===0?gn:o===1?_n:vn;ne=e[Math.floor(t/400)%e.length],re=t+400,L=o}if(ne!==-1&&o===L&&t<=re&&(w=!0,T=ne,C=ln[T]),w){e.font=f(o===0?1.1:1.05),(o===p||o===L)&&(te=!0);let n=!1,r=`#ffffff`,i=`#000000`;if(o===0&&fn.has(T)?(n=!0,r=l.wordColorMain,R.main.length<5&&!me.main.has(C)&&(me.main.add(C),R.main.push(C))):o===1&&pn.has(T)?(n=!0,r=l.wordColorLeft,R.left.length<5&&!me.left.has(C)&&(me.left.add(C),R.left.push(C))):o===2&&mn.has(T)&&(n=!0,r=l.wordColorRight,R.right.length<5&&!me.right.has(C)&&(me.right.add(C),R.right.push(C))),n){let e=Gn(r),t=Math.floor(e[0]*.3),n=Math.floor(e[1]*.3),a=Math.floor(e[2]*.3);i=`#${t.toString(16).padStart(2,`0`)}${n.toString(16).padStart(2,`0`)}${a.toString(16).padStart(2,`0`)}`}let a=Math.floor(t/50)%2==0?r:i;e.fillStyle=a,n&&(tt=C,nt=a)}else e.font=f(),e.fillStyle=G[G.length-1].fill;e.globalAlpha=Math.min(1,(o===0?ce:o===1?le:ue)*3)*s,e.fillText(C,i+xe[o].x,a+xe[o].y)};r(he,g,d*.8,0,Ue),r(ge,g-u*.15,d*.85,1,We),r(_e,g+u*.15,d*.85,2,K),e.restore()}if(e.globalAlpha=1,l.glowOpacity>0&&l.glowRadius>0){let t=e.canvas.width,n=e.canvas.height;s.width!==t&&(s.width=t),s.height!==n&&(s.height=n);let r=Wn(W[0]+Je,W[1],W[2]),i=`rgb(${r[0]},${r[1]},${r[2]})`;c.setTransform(1,0,0,1,0,0),c.globalCompositeOperation=`copy`,c.globalAlpha=1,c.filter=`none`,c.drawImage(e.canvas,0,0),c.globalCompositeOperation=`source-in`,c.fillStyle=i,c.fillRect(0,0,t,n),e.save(),e.setTransform(1,0,0,1,0,0),e.globalCompositeOperation=`lighter`,e.filter=`blur(${l.glowRadius}px)`,e.globalAlpha=l.glowOpacity,e.drawImage(s,0,0),l.glowSoftness>0&&(e.filter=`blur(${l.glowRadius*(1+l.glowSoftness*3)}px)`,e.globalAlpha=l.glowOpacity*l.glowSoftness*.7,e.drawImage(s,0,0)),e.restore(),e.globalAlpha=1,e.filter=`none`,e.globalCompositeOperation=`source-over`}if(tt&&nt){e.save(),e.globalCompositeOperation=`source-over`,e.fillStyle=nt,e.textAlign=`center`,e.textBaseline=`alphabetic`,e.font=`900 100px Inter, sans-serif`;let t=e.measureText(tt),n=t.width||1,r=t.actualBoundingBoxAscent+t.actualBoundingBoxDescent||100;e.translate(u/2,d/2),e.scale(u/n,d/r);let i=(t.actualBoundingBoxAscent-t.actualBoundingBoxDescent)/2||0;e.fillText(tt,0,i),e.restore()}},resize(e,t){u=e,d=t,Te()},setParams(e){Object.assign(l,e),(`colorBase`in e||`colorLow`in e||`colorHot`in e||`colorTip`in e)&&Ne(),(`fontFamily`in e||`fontSize`in e||`fontWeight`in e||`letterSpacing`in e)&&v()},getParams(){return l},setCursor(e,t,n){F=e,I=t,ee=n},setMask(e){Se=e},setCursorEffect(e){Ce=e},setCenterRepels(e,t,n,r,i=1,a=r,o=r){ae=e,oe=t,se=n,ce=r,de=i,le=a,ue=o},getCollectedWords(){return R},getCurrentTipColor(e){let t=Wn(W[0]+D,W[1],W[2]);return`rgb(${t[0]},${t[1]},${t[2]})`},isInProgressEyeHovered(){return te}}}function Hn(e,t,n,r,i){let a=[[0,t],[.35,n],[.72,r],[1,i]],o=[];for(let t=0;t<e;t++){let n=t/(e-1),r=a[0],i=a[a.length-1];for(let e=0;e<a.length-1;e++)if(n>=a[e][0]&&n<=a[e+1][0]){r=a[e],i=a[e+1];break}let s=(n-r[0])/Math.max(1e-6,i[0]-r[0]),c=r[1][0]+(i[1][0]-r[1][0])*s|0,l=r[1][1]+(i[1][1]-r[1][1])*s|0,u=r[1][2]+(i[1][2]-r[1][2])*s|0,d=Kn(.25+.75*n);o.push({fill:`rgb(${c},${l},${u})`,a:d})}return o}function Un(e){let t=Gn(e),n=t[0]/255,r=t[1]/255,i=t[2]/255,a=Math.max(n,r,i),o=Math.min(n,r,i),s=(a+o)/2,c=0,l=0;if(a!==o){let e=a-o;l=s>.5?e/(2-a-o):e/(a+o),c=a===n?(r-i)/e+(r<i?6:0):a===r?(i-n)/e+2:(n-r)/e+4,c*=60}return[c,l,s]}function Wn(e,t,n){if(e=(e%360+360)%360/360,t===0){let e=Math.round(n*255);return[e,e,e]}let r=n<.5?n*(1+t):n+t-n*t,i=2*n-r;function a(e){return e<0&&(e+=1),e>1&&--e,e<1/6?i+(r-i)*6*e:e<1/2?r:e<2/3?i+(r-i)*(2/3-e)*6:i}return[Math.round(a(e+1/3)*255),Math.round(a(e)*255),Math.round(a(e-1/3)*255)]}function Gn(e){if(typeof e!=`string`)return[0,0,0];let t=e.trim();if(t.startsWith(`#`)&&(t=t.slice(1)),t.length===3&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),t.length!==6)return[0,0,0];let n=parseInt(t,16);return Number.isNaN(n)?[0,0,0]:[n>>16&255,n>>8&255,n&255]}function Kn(e){return e<0?0:e>1?1:e}var qn=[],Jn=new Set([`textScrollSpeed`,`tongueBigSt`,`tongueMedSt`,`flickerSt`,`swirlSpeed`,`curlDriftSpeed`,`colorHueShiftSpeed`,`scanlineSpeed`,`grainSpeed`,`pixelSize`,`scanlineOpacity`,`scanlineSpacing`,`glowOpacity`,`glowRadius`,`glowSoftness`,`grainOpacity`,`grainScale`]);function Yn(e){return Jn.has(e)}var Xn=Object.keys(Y).filter(e=>typeof Y[e]==`number`&&!Jn.has(e)),Zn=`scroll-arc-v2`,Qn=`scroll-arc-v1`,$n=`scroll-arc-v2-active`;function er(e){if(!Array.isArray(e)||e.length<2)return null;let t=e.map(e=>{let t=e??{};return{id:typeof t.id==`string`?t.id:nr(),at:typeof t.at==`number`?t.at:0,params:or(t.params),...typeof t.label==`string`?{label:t.label}:{}}});return sr(t),t}function tr(){let e={};for(let t of Xn)e[t]=Y[t];return e}function nr(){return Math.random().toString(36).slice(2,10)}function rr(){return[{id:nr(),at:0,params:tr()},{id:nr(),at:1,params:tr()}]}function ir(){return er(qn)??rr()}function ar(e){let t={};for(let n of Xn)t[n]=e[n];return t}function or(e){let t=tr();if(e&&typeof e==`object`)for(let n of Xn){let r=e[n];typeof r==`number`&&Number.isFinite(r)&&(t[n]=r)}return t}function sr(e){if(e.length===1){e[0].at=0;return}let t=e.length-1;for(let n=0;n<=t;n++)e[n].at=n/t}function cr(){try{let e=localStorage.getItem(Zn);return e?er(JSON.parse(e)):null}catch{return null}}function lr(){try{let e=localStorage.getItem(Qn);if(!e)return null;let t=JSON.parse(e);if(!Array.isArray(t)||t.length<2)return null;let n=t.map(e=>{let t=e??{};return{id:nr(),at:typeof t.at==`number`?t.at:0,params:or(t.params)}});return n.sort((e,t)=>e.at-t.at),sr(n),n}catch{return null}}function ur(){return cr()??lr()??ir()}function dr(e){let t=JSON.stringify(e,null,2),n=new Blob([t],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`scroll-arc-defaults.json`,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(r),1e3)}function fr(e){try{let t=localStorage.getItem($n);if(t===null)return 0;let n=parseInt(t,10);return!Number.isFinite(n)||n<0||n>e?0:n}catch{return 0}}function pr(){let e=ur();sr(e);let t=fr(e.length-1),n=new Set;function r(){for(let e of n)e()}function i(){try{localStorage.setItem(Zn,JSON.stringify(e)),localStorage.setItem($n,String(t))}catch{}}return{getKeyframes:()=>e,getActiveIndex:()=>t,setActiveIndex(n){if(!Number.isFinite(n))return;let a=Math.max(0,Math.min(e.length-1,Math.round(n)));a!==t&&(t=a,i(),r())},setActiveParam(n,a){let o=e[t];o&&o.params[n]!==a&&(o.params={...o.params,[n]:a},i(),r())},setActiveParams(n){let a=e[t];if(!a)return;let o={...a.params},s=!1;for(let e of Xn){let t=n[e];typeof t!=`number`||!Number.isFinite(t)||o[e]!==t&&(o[e]=t,s=!0)}s&&(a.params=o,i(),r())},appendKeyframe(){let n=e[e.length-1],a=n?ar(n.params):tr();e=[...e,{id:nr(),at:1,params:a}],sr(e),t=e.length-1,i(),r()},removeKeyframe(n){e.length<=2||n<0||n>=e.length||(e=e.filter((e,t)=>t!==n),sr(e),t>=e.length&&(t=e.length-1),i(),r())},reset(){e=ir(),t=0;try{localStorage.removeItem(Zn)}catch{}i(),r()},saveAsDefaults(){dr(e)},subscribe(e){return n.add(e),()=>{n.delete(e)}}}}var mr=[{key:`colorBase`,label:`base`},{key:`colorLow`,label:`low`},{key:`colorHot`,label:`hot`},{key:`colorTip`,label:`tip`},{key:`wordColorLeft`,label:`left eye`},{key:`wordColorMain`,label:`main eye`},{key:`wordColorRight`,label:`right eye`}],hr=[{label:`Inter`,stack:`"Inter", system-ui, sans-serif`},{label:`Space Grotesk`,stack:`"Space Grotesk", system-ui, sans-serif`},{label:`JetBrains Mono`,stack:`"JetBrains Mono", ui-monospace, monospace`},{label:`Uncut Sans`,stack:`"Uncut Sans", system-ui, sans-serif`},{label:`Instrument Serif`,stack:`"Instrument Serif", Georgia, serif`},{label:`Bodoni Moda`,stack:`"Bodoni Moda", "Bodoni MT", Georgia, serif`},{label:`Cormorant Garamond`,stack:`"Cormorant Garamond", "Garamond", serif`},{label:`Spectral`,stack:`"Spectral", Georgia, serif`},{label:`Libre Baskerville`,stack:`"Libre Baskerville", Baskerville, serif`},{label:`DM Serif Display`,stack:`"DM Serif Display", Georgia, serif`},{label:`Playfair Display`,stack:`"Playfair Display", "Didot", Georgia, serif`},{label:`Georgia`,stack:`Georgia, "Times New Roman", serif`},{label:`Times`,stack:`"Times New Roman", Times, serif`},{label:`Iowan`,stack:`"Iowan Old Style", Palatino, Georgia, serif`},{label:`Palatino`,stack:`Palatino, "Book Antiqua", serif`},{label:`Helvetica`,stack:`"Helvetica Neue", Helvetica, Arial, sans-serif`},{label:`Arial`,stack:`Arial, Helvetica, sans-serif`},{label:`Verdana`,stack:`Verdana, Geneva, sans-serif`},{label:`Courier`,stack:`"Courier New", Courier, monospace`},{label:`SF Mono`,stack:`ui-monospace, "SF Mono", Menlo, Consolas, monospace`}],gr=[{key:`sphereCxFrac`,label:`sphere x`,min:-.5,max:1.5,step:.001,format:e=>e.toFixed(3)},{key:`sphereCyFrac`,label:`sphere y`,min:-5,max:5,step:.001,format:e=>e.toFixed(3)},{key:`sphereRadiusFrac`,label:`sphere r`,min:0,max:2,step:.001,format:e=>e.toFixed(3)},{key:`flameRadialReach`,label:`flame reach`,min:0,max:1,step:.001,format:e=>e.toFixed(3)},{key:`fontSize`,label:`font size`,min:6,max:40,step:1},{key:`fontWeight`,label:`font weight`,min:100,max:900,step:100},{key:`lineHeight`,label:`line height`,min:8,max:60,step:1},{key:`letterSpacing`,label:`letter spacing`,min:-3,max:12,step:.1},{key:`textScrollSpeed`,label:`scroll px/s`,min:0,max:150,step:1},{key:`tongueBase`,label:`base height`,min:0,max:1,step:.01},{key:`tongueBigAmp`,label:`tongue amp ⨉`,min:0,max:.6,step:.01},{key:`tongueBigSx`,label:`tongue width`,min:5e-4,max:.1,step:5e-4,format:e=>e.toFixed(4)},{key:`tongueBigSt`,label:`tongue speed`,min:0,max:3,step:.05},{key:`tongueMedAmp`,label:`wobble amp`,min:0,max:.4,step:.01},{key:`tongueMedSx`,label:`wobble width`,min:.001,max:.05,step:.001,format:e=>e.toFixed(3)},{key:`tongueMedSt`,label:`wobble speed`,min:0,max:4,step:.05},{key:`flickerAmp`,label:`flicker amp`,min:0,max:.6,step:.01},{key:`flickerBias`,label:`flicker bias`,min:-.5,max:.5,step:.01},{key:`flickerContrast`,label:`flicker curve`,min:.3,max:3,step:.05},{key:`flickerSx`,label:`flicker x scale`,min:.001,max:.2,step:.001,format:e=>e.toFixed(3)},{key:`flickerSy`,label:`flicker y scale`,min:.001,max:.2,step:.001,format:e=>e.toFixed(3)},{key:`flickerScale`,label:`flicker scale`,min:.1,max:5,step:.01,format:e=>e.toFixed(2)},{key:`flickerSt`,label:`flicker speed`,min:0,max:4,step:.05},{key:`tipFadePx`,label:`tip fade px`,min:0,max:1e3,step:1},{key:`sphereFadePx`,label:`sphere fade px`,min:0,max:80,step:1},{key:`centerPeakAmp`,label:`peak length ⨉`,min:1,max:5,step:.01},{key:`centerPeakWidth`,label:`peak width rad`,min:.05,max:3,step:.01},{key:`centerPeakSmoothness`,label:`peak falloff`,min:.3,max:8,step:.05},{key:`centerPeakAngleDeg`,label:`peak angle °`,min:-180,max:180,step:1},{key:`colorHueShiftSpeed`,label:`hue shift °/s`,min:0,max:360,step:1},{key:`swirlStrength`,label:`swirl amount`,min:0,max:5,step:.001},{key:`swirlScale`,label:`swirl scale`,min:.001,max:.05,step:1e-4,format:e=>e.toFixed(3)},{key:`swirlSpeed`,label:`swirl speed`,min:0,max:4,step:.05},{key:`swirlStart`,label:`swirl start`,min:0,max:.95,step:.01},{key:`curlCount`,label:`curl count`,min:0,max:24,step:1},{key:`curlStrengthMin`,label:`curl strength min`,min:-200,max:200,step:1},{key:`curlStrengthMax`,label:`curl strength max`,min:-200,max:200,step:1},{key:`curlRadiusMin`,label:`curl radius min`,min:10,max:400,step:1},{key:`curlRadiusMax`,label:`curl radius max`,min:10,max:400,step:1},{key:`curlDistanceMin`,label:`curl distance min`,min:0,max:1.5,step:.01},{key:`curlDistanceMax`,label:`curl distance max`,min:0,max:1.5,step:.01},{key:`curlDriftSpeed`,label:`curl drift`,min:-.5,max:.5,step:.005,format:e=>e.toFixed(3)}],_r=`fire-controls-v2`;function vr(){let e={params:{},collapsed:!1,theme:`dark`,themeColors:{},themeBg:{}};try{let t=localStorage.getItem(_r);if(!t)return e;let n=JSON.parse(t);return{params:n.params??{},collapsed:n.collapsed??!1,theme:n.theme===`light`?`light`:`dark`,themeColors:n.themeColors??{},themeBg:n.themeBg??{}}}catch{return e}}function yr(e){try{localStorage.setItem(_r,JSON.stringify(e))}catch{}}function br(){if(document.getElementById(`fire-controls-styles`))return;let e=document.createElement(`style`);e.id=`fire-controls-styles`,e.textContent=`
    body.theme-light { --page-bg: #f6efe2; }
    body.theme-light #name,
    body.theme-light #final-name { color: #1a1a1a; }
    body.theme-light #final-soon { color: rgba(26, 13, 4, 0.6); }

    #fire-controls {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #fire-controls header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      cursor: pointer;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #fire-controls header .chev {
      transition: transform 150ms ease-out;
      font-size: 9px;
      opacity: 0.7;
    }
    #fire-controls.collapsed header { border-bottom: none; }
    #fire-controls.collapsed header .chev { transform: rotate(-90deg); }
    #fire-controls.collapsed .body { display: none; }
    #fire-controls header .title { flex: 1; }
    #fire-controls .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }
    #fire-controls .row { margin: 6px 0; }
    #fire-controls .row .label-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
      gap: 8px;
    }
    #fire-controls .row label { opacity: 0.78; }
    #fire-controls .row .val {
      font: inherit;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;
      padding: 1px 4px;
      width: 60px;
      text-align: right;
      cursor: text;
      outline: none;
    }
    #fire-controls .row .val:hover { border-color: rgba(255, 255, 255, 0.18); }
    #fire-controls .row .val:focus {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.06);
    }
    body.theme-light #fire-controls .row .val:hover { border-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #fire-controls .row .val:focus {
      border-color: rgba(0, 0, 0, 0.65);
      background: rgba(0, 0, 0, 0.06);
    }
    #fire-controls .font-row {
      margin: 0 0 8px;
    }
    #fire-controls .font-row select {
      width: 100%;
      padding: 4px 6px;
      font: inherit;
      color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.04em;
      appearance: none;
    }
    #fire-controls .font-row select:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    #fire-controls .font-row select option {
      background: #1a1a1a;
      color: rgba(255, 255, 255, 0.85);
    }
    body.theme-light #fire-controls .font-row select {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #fire-controls .font-row select:hover {
      background: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #fire-controls .font-row select option {
      background: #f5f5f5;
      color: rgba(0, 0, 0, 0.92);
    }
    #fire-controls input[type="range"] {
      width: 100%;
      height: 14px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      margin: 0;
    }
    #fire-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #fire-controls input[type="range"]::-moz-range-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #fire-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      margin-top: -5px;
      cursor: pointer;
      border: none;
    }
    #fire-controls input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      cursor: pointer;
      border: none;
    }
    #fire-controls .actions {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #fire-controls button {
      flex: 1;
      padding: 5px 8px;
      font: inherit;
      color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.05em;
      text-transform: lowercase;
    }
    #fire-controls button:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    #fire-controls button:active {
      background: rgba(255, 255, 255, 0.20);
    }

    #fire-controls .theme-btn {
      width: 22px; height: 22px;
      padding: 0;
      flex: 0 0 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 50%;
      color: inherit;
      cursor: pointer;
      letter-spacing: 0;
      text-transform: none;
    }
    #fire-controls .theme-btn:hover { background: rgba(255, 255, 255, 0.14); }

    #fire-controls .colors {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #fire-controls .colors .swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      opacity: 0.85;
    }
    #fire-controls .colors input[type="color"] {
      width: 100%;
      height: 28px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    #fire-controls .colors input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #fire-controls .colors input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

    /* ── Light theme overrides for the panel itself ─────────────────────── */
    body.theme-light #fire-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #fire-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #fire-controls .actions,
    body.theme-light #fire-controls .colors {
      border-top-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #fire-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #fire-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #fire-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #fire-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
    body.theme-light #fire-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #fire-controls button,
    body.theme-light #fire-controls .theme-btn {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #fire-controls button:hover,
    body.theme-light #fire-controls .theme-btn:hover {
      background: rgba(0, 0, 0, 0.18);
    }
  `,document.head.appendChild(e)}function xr(e){let t=e>=1?0:e>=.1?1:e>=.01?2:e>=.001?3:4;return e=>e.toFixed(t)}function Sr(e,t,n=document.body){br();let r=vr();function i(t){document.body.classList.toggle(`theme-dark`,t===`dark`),document.body.classList.toggle(`theme-light`,t===`light`);let n=r.themeColors[t]??(t===`light`?kn:{colorBase:Y.colorBase,colorLow:Y.colorLow,colorHot:Y.colorHot,colorTip:Y.colorTip,wordColorMain:Y.wordColorMain,wordColorLeft:Y.wordColorLeft,wordColorRight:Y.wordColorRight});e.setParams(n);let i=r.themeBg[t];i?document.body.style.setProperty(`--page-bg`,i):document.body.style.removeProperty(`--page-bg`)}if(Object.keys(r.params).length>0){let t={};for(let e of Object.keys(r.params)){let n=r.params[e];n!==void 0&&(e===`colorBase`||e===`colorLow`||e===`colorHot`||e===`colorTip`||e===`wordColorMain`||e===`wordColorLeft`||e===`wordColorRight`||typeof n==`number`&&!Yn(e)||(t[e]=n))}Object.keys(t).length>0&&e.setParams(t)}i(r.theme);let a=document.createElement(`div`);a.id=`fire-controls`,r.collapsed&&a.classList.add(`collapsed`);let o=document.createElement(`header`),s=document.createElement(`span`);s.className=`chev`,s.textContent=`▼`;let c=document.createElement(`span`);c.className=`title`,c.textContent=`fire — tune`;let l=document.createElement(`button`);l.className=`theme-btn`,l.title=`Toggle dark / light theme`;let u=()=>{l.textContent=r.theme===`dark`?`☾`:`☀`};u(),o.appendChild(s),o.appendChild(c),o.appendChild(l),o.addEventListener(`click`,()=>{a.classList.toggle(`collapsed`),r.collapsed=a.classList.contains(`collapsed`),yr(r)}),l.addEventListener(`click`,e=>{e.stopPropagation(),r.theme=r.theme===`dark`?`light`:`dark`,i(r.theme),u(),E(),yr(r)}),a.appendChild(o);let d=document.createElement(`div`);d.className=`body`;let f=document.createElement(`div`);f.className=`font-row`;let p=document.createElement(`select`);p.title=`Font family`;let m=String(e.getParams().fontFamily);if(!new Set(hr.map(e=>e.stack)).has(m)){let e=document.createElement(`option`);e.value=m,e.textContent=`(custom)`,p.appendChild(e)}for(let e of hr){let t=document.createElement(`option`);t.value=e.stack,t.textContent=e.label,t.style.fontFamily=e.stack,p.appendChild(t)}p.value=m,p.addEventListener(`change`,()=>{let t=p.value;e.setParams({fontFamily:t}),r.params.fontFamily=t,yr(r)}),f.appendChild(p),d.appendChild(f);let h=[];for(let n of gr){let i=document.createElement(`div`);i.className=`row`;let a=document.createElement(`div`);a.className=`label-line`;let o=document.createElement(`label`);o.textContent=n.label;let s=document.createElement(`input`);s.type=`text`,s.inputMode=`decimal`,s.spellcheck=!1,s.className=`val`,s.title=`Click and type a number — no min/max cap`,a.appendChild(o),a.appendChild(s);let c=document.createElement(`input`);c.type=`range`,c.min=String(n.min),c.max=String(n.max),c.step=String(n.step);let l=Yn(n.key),u=l?e.getParams()[n.key]:t.getKeyframes()[t.getActiveIndex()]?.params?.[n.key]??Y[n.key];c.value=String(u);let f=n.format??xr(n.step);s.value=f(u);let p=l?t=>{e.setParams({[n.key]:t}),r.params[n.key]=t,yr(r)}:e=>{t.setActiveParam(n.key,e)};c.addEventListener(`input`,()=>{let e=Number(c.value);s.value=f(e),p(e)}),s.addEventListener(`change`,()=>{let e=Number(s.value);if(!Number.isFinite(e)){s.value=f(Number(c.value));return}c.value=String(e),s.value=f(e),p(e)}),s.addEventListener(`keydown`,e=>{e.key===`Enter`?(e.preventDefault(),s.blur()):e.key===`Escape`&&(s.value=f(Number(c.value)),s.blur())}),s.addEventListener(`focus`,()=>{s.select()}),i.appendChild(a),i.appendChild(c),d.appendChild(i),h.push({def:n,input:c,val:s})}let g=document.createElement(`div`);g.className=`font-row`;let _=document.createElement(`select`);_.title=`Flicker noise sampling mode (sphere mode only)`;for(let e of Dn){let t=document.createElement(`option`);t.value=e,t.textContent=`flicker: ${e}`,_.appendChild(t)}_.value=e.getParams().flickerMode,_.addEventListener(`change`,()=>{let t=_.value;e.setParams({flickerMode:t}),r.params.flickerMode=t,yr(r)}),g.appendChild(_),d.appendChild(g);let v=document.createElement(`div`);v.className=`font-row`;let y=document.createElement(`select`);y.title=`Swirl noise field type`;for(let e of On){let t=document.createElement(`option`);t.value=e,t.textContent=`swirl: ${e}`,y.appendChild(t)}y.value=e.getParams().swirlType,y.addEventListener(`change`,()=>{let t=y.value;e.setParams({swirlType:t}),r.params.swirlType=t,yr(r)}),v.appendChild(y),d.appendChild(v);let b=document.createElement(`div`);b.className=`colors`;let x={};for(let t of mr){let n=document.createElement(`div`);n.className=`swatch`;let i=document.createElement(`input`);i.type=`color`,i.value=String(e.getParams()[t.key]);let a=document.createElement(`span`);a.textContent=t.label,i.addEventListener(`input`,()=>{let n=i.value;e.setParams({[t.key]:n});let a=r.themeColors[r.theme]??{colorBase:e.getParams().colorBase,colorLow:e.getParams().colorLow,colorHot:e.getParams().colorHot,colorTip:e.getParams().colorTip,wordColorMain:e.getParams().wordColorMain,wordColorLeft:e.getParams().wordColorLeft,wordColorRight:e.getParams().wordColorRight};a[t.key]=n,r.themeColors[r.theme]=a,yr(r)}),n.appendChild(i),n.appendChild(a),b.appendChild(n),x[t.key]=i}let S=document.createElement(`div`);S.className=`swatch`;let C=document.createElement(`input`);C.type=`color`;let w=document.createElement(`span`);w.textContent=`bg`;function T(){let e=getComputedStyle(document.body).getPropertyValue(`--page-bg`).trim();if(e.startsWith(`#`))return e;let t=/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(e);if(!t)return`#000000`;let n=parseInt(t[1],10),r=parseInt(t[2],10),i=parseInt(t[3],10);return`#`+(1<<24|n<<16|r<<8|i).toString(16).slice(1)}C.value=r.themeBg[r.theme]??T(),C.addEventListener(`input`,()=>{let e=C.value;document.body.style.setProperty(`--page-bg`,e),r.themeBg[r.theme]=e,yr(r)}),S.append(C,w),b.appendChild(S);function E(){let t=e.getParams();x.colorBase.value=t.colorBase,x.colorLow.value=t.colorLow,x.colorHot.value=t.colorHot,x.colorTip.value=t.colorTip,C.value=r.themeBg[r.theme]??T()}d.appendChild(b);let D=document.createElement(`div`);D.className=`actions`;let O=document.createElement(`button`);O.textContent=`reset`,O.title=`Restore default values`,O.addEventListener(`click`,()=>{e.setParams({fontFamily:Y.fontFamily,swirlType:Y.swirlType,sphereEnabled:Y.sphereEnabled,colorBase:Y.colorBase,colorLow:Y.colorLow,colorHot:Y.colorHot,colorTip:Y.colorTip,wordColorMain:Y.wordColorMain,wordColorLeft:Y.wordColorLeft,wordColorRight:Y.wordColorRight,glowColor:Y.glowColor}),r.params={},r.themeColors={},r.themeBg={},yr(r),i(r.theme),p.value=String(Y.fontFamily),y.value=Y.swirlType,E(),N()});let k=null,A=document.createElement(`button`);A.textContent=`copy`,A.title=`Snapshot current section params (excluding globals) into a buffer`;let j=document.createElement(`button`);j.textContent=`paste`,j.title=`Apply the buffered params to the current section`,j.disabled=!0,A.addEventListener(`click`,()=>{let e=t.getKeyframes()[t.getActiveIndex()];if(!e)return;let n={};for(let t of Xn)n[t]=e.params[t];k=n,j.disabled=!1;let r=A.textContent;A.textContent=`copied`,setTimeout(()=>{A.textContent=r},900)}),j.addEventListener(`click`,()=>{if(!k)return;t.setActiveParams(k),N();let e=j.textContent;j.textContent=`pasted`,setTimeout(()=>{j.textContent=e},900)}),D.appendChild(O),D.appendChild(A),D.appendChild(j),d.appendChild(D),a.appendChild(d),n.appendChild(a);let M=!1;for(let{input:e}of h){e.addEventListener(`pointerdown`,()=>{M=!0});let t=()=>{M=!1,N()};e.addEventListener(`pointerup`,t),e.addEventListener(`pointercancel`,t)}function N(){if(M)return;let e=t.getKeyframes()[t.getActiveIndex()];if(e)for(let{def:t,input:n,val:r}of h){if(Yn(t.key)||document.activeElement===r)continue;let i=e.params[t.key];typeof i==`number`&&(Number(n.value)!==i&&(n.value=String(i)),r.value=(t.format??xr(t.step))(i))}}let P=t.subscribe(N);return N(),{destroy(){P(),a.remove()}}}var Cr=[`none`,`chromatic`,`slice`,`scramble`,`jitter`],wr={text:`ELVIN SAAN`,fontFamily:`"Cormorant Garamond", "Garamond", serif`,fontSize:48,fontWeight:100,letterSpacing:7.1,cxFrac:.5,cyFrac:.045,color:`#ffffff`,maskPadding:0,strokeColor:`#ffffff`,strokeWidth:0,glitch:`none`,glitchIntensity:.17,glitchSpeed:3.8,scaleX:1,scaleY:1},Tr="!@#$%^&*()_+-=ЭЬВИНWX[]{}|;:.<>?/~`№§ΩÆØ∂ƒ˙∆˚¬…æ•¶¥£¢‹›«»€1";function Er(e){let t=(e|0)^2654435769;return t=t^61^t>>>16,t=t+(t<<3)|0,t^=t>>>4,t=Math.imul(t,668265261),t^=t>>>15,(t>>>0)%1e5/1e5}function Dr(e,t){let n={...wr},r=e,i=t;function a(){return`${n.fontWeight} ${n.fontSize}px ${n.fontFamily}`}let o=document.createElement(`canvas`),s=o.getContext(`2d`,{willReadFrequently:!0}),c=null,l=0,u=0,d=!0;function f(){let e=Math.max(1,Math.floor(r)),t=Math.max(1,Math.floor(i));o.width!==e&&(o.width=e),o.height!==t&&(o.height=t),s.clearRect(0,0,e,t);let f=n.text;if(f){let e=r*n.cxFrac,t=i*n.cyFrac;s.font=a(),s.textBaseline=`middle`,s.textAlign=`center`,s.letterSpacing=`${n.letterSpacing}px`;let o=n.maskPadding*2+n.strokeWidth;o>0&&(s.lineJoin=`round`,s.lineCap=`round`,s.lineWidth=o,s.strokeStyle=`#fff`,s.strokeText(f,e,t)),s.fillStyle=`#fff`,s.fillText(f,e,t)}c=s.getImageData(0,0,e,t).data,l=e,u=t,d=!1}function p(){(d||!c)&&f()}function m(e,t,r){let i=[],a=0;for(let r=0;r<t.length;r++){let o=e.measureText(t[r]).width+n.letterSpacing;i.push(o),a+=o}a-=n.letterSpacing;let o=[],s=r-a/2;for(let e=0;e<t.length;e++)o.push(s+i[e]/2),s+=i[e];return{positions:o}}function h(e,t,n,r,i){e.textAlign=`center`,e.fillStyle=i,e.fillText(t,n,r)}function g(e,t,r,i,a){e.textAlign=`center`;let o=Math.sin(a*n.glitchSpeed*2*Math.PI)*.6+.4,s=n.glitchIntensity*14*o;e.globalCompositeOperation=`lighter`,e.fillStyle=`#ff0000`,e.fillText(t,r-s,i),e.fillStyle=`#00ff00`,e.fillText(t,r+s*.3,i+s*.15),e.fillStyle=`#0000ff`,e.fillText(t,r+s,i-s*.1),e.globalCompositeOperation=`source-over`}function _(e,t,r,i,a,o){e.textAlign=`center`,e.fillStyle=o;let s=e.measureText(t).width+Math.abs(n.letterSpacing)*t.length,c=n.fontSize*1.2,l=r-s/2-40,u=i-c/2,d=c/12,f=Math.floor(a*n.glitchSpeed);for(let a=0;a<12;a++){e.save(),e.beginPath(),e.rect(l,u+a*d,s+80,d+1),e.clip();let o=a*31+f,c=Er(o*7+1)<n.glitchIntensity?(Er(o)-.5)*n.glitchIntensity*40:0;e.fillText(t,r+c,i),e.restore()}}function v(e,t,r,i,a,o){let s=Math.floor(a*n.glitchSpeed),{positions:c}=m(e,t,r);e.textAlign=`center`,e.fillStyle=o;for(let r=0;r<t.length;r++){let a=t[r];if(a!==` `&&a!==`	`){let e=r*13+s;Er(e)<n.glitchIntensity*.6&&(a=Tr[Math.floor(Er(e*31+7)*59)])}e.fillText(a,c[r],i)}}function y(e,t,r,i,a,o){let s=Math.floor(a*n.glitchSpeed),{positions:c}=m(e,t,r);e.textAlign=`center`,e.fillStyle=o;let l=n.glitchIntensity*12;for(let n=0;n<t.length;n++){let r=n*17+s,a=(Er(r)-.5)*l,o=(Er(r*7+3)-.5)*l;e.fillText(t[n],c[n]+a,i+o)}}return{isInside(e,t){if(p(),!c)return!1;let n=e|0,r=t|0;return n<0||r<0||n>=l||r>=u?!1:c[(r*l+n)*4+3]>127},draw(e,t=0,o){let s=n.text;if(!s)return;let c=t*.001,l=r*n.cxFrac,u=i*n.cyFrac,d=o??n.color;switch(e.save(),e.font=a(),e.textBaseline=`middle`,e.textAlign=`center`,e.letterSpacing=`${n.letterSpacing}px`,n.strokeWidth>0&&(e.lineWidth=n.strokeWidth,e.lineJoin=`round`,e.lineCap=`round`,e.strokeStyle=n.strokeColor,e.strokeText(s,l,u)),n.glitch){case`chromatic`:g(e,s,l,u,c);break;case`slice`:_(e,s,l,u,c,d);break;case`scramble`:v(e,s,l,u,c,d);break;case`jitter`:y(e,s,l,u,c,d);break;default:h(e,s,l,u,d);break}e.restore()},resize(e,t){r=e,i=t,d=!0},setParams(e){Object.assign(n,e),(`text`in e||`fontFamily`in e||`fontSize`in e||`fontWeight`in e||`letterSpacing`in e||`cxFrac`in e||`cyFrac`in e||`maskPadding`in e||`strokeWidth`in e)&&(d=!0)},getParams(){return n}}}var Or=[{label:`Inter`,stack:`"Inter", system-ui, sans-serif`},{label:`Space Grotesk`,stack:`"Space Grotesk", system-ui, sans-serif`},{label:`JetBrains Mono`,stack:`"JetBrains Mono", ui-monospace, monospace`},{label:`Uncut Sans`,stack:`"Uncut Sans", system-ui, sans-serif`},{label:`Instrument Serif`,stack:`"Instrument Serif", Georgia, serif`},{label:`Bodoni Moda`,stack:`"Bodoni Moda", "Bodoni MT", Georgia, serif`},{label:`Cormorant Garamond`,stack:`"Cormorant Garamond", "Garamond", serif`},{label:`Spectral`,stack:`"Spectral", Georgia, serif`},{label:`Libre Baskerville`,stack:`"Libre Baskerville", Baskerville, serif`},{label:`DM Serif Display`,stack:`"DM Serif Display", Georgia, serif`},{label:`Playfair Display`,stack:`"Playfair Display", "Didot", Georgia, serif`},{label:`Georgia`,stack:`Georgia, "Times New Roman", serif`},{label:`Times`,stack:`"Times New Roman", Times, serif`},{label:`Iowan`,stack:`"Iowan Old Style", Palatino, Georgia, serif`},{label:`Palatino`,stack:`Palatino, "Book Antiqua", serif`},{label:`Helvetica`,stack:`"Helvetica Neue", Helvetica, Arial, sans-serif`},{label:`Arial`,stack:`Arial, Helvetica, sans-serif`},{label:`Verdana`,stack:`Verdana, Geneva, sans-serif`},{label:`Courier`,stack:`"Courier New", Courier, monospace`},{label:`SF Mono`,stack:`ui-monospace, "SF Mono", Menlo, Consolas, monospace`}],kr=[{key:`fontSize`,label:`font size`,min:12,max:200,step:1},{key:`fontWeight`,label:`font weight`,min:100,max:900,step:100},{key:`letterSpacing`,label:`letter spacing`,min:-3,max:24,step:.1},{key:`cxFrac`,label:`position x`,min:0,max:1,step:.005},{key:`cyFrac`,label:`position y`,min:0,max:1,step:.005},{key:`maskPadding`,label:`mask halo px`,min:0,max:60,step:1},{key:`strokeWidth`,label:`outline px`,min:0,max:24,step:.5},{key:`glitchIntensity`,label:`glitch amount`,min:0,max:1,step:.01},{key:`glitchSpeed`,label:`glitch speed`,min:0,max:20,step:.1},{key:`scaleX`,label:`scale x`,min:.1,max:6,step:.01},{key:`scaleY`,label:`scale y`,min:.1,max:6,step:.01}],Ar=`name-controls-v1`;function jr(){let e={params:{},collapsed:!1};try{let t=localStorage.getItem(Ar);if(!t)return e;let n=JSON.parse(t);return{params:n.params??{},collapsed:n.collapsed??!1}}catch{return e}}function Mr(e){try{localStorage.setItem(Ar,JSON.stringify(e))}catch{}}function Nr(){if(document.getElementById(`name-controls-styles`))return;let e=document.createElement(`style`);e.id=`name-controls-styles`,e.textContent=`
    #name-controls {
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #name-controls header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #name-controls header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #name-controls.collapsed header { border-bottom: none; }
    #name-controls.collapsed header .chev { transform: rotate(-90deg); }
    #name-controls.collapsed .body { display: none; }
    #name-controls header .title { flex: 1; }
    #name-controls .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }
    #name-controls .row { margin: 6px 0; }
    #name-controls .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #name-controls .row label { opacity: 0.78; }
    #name-controls .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
    }

    #name-controls .text-row, #name-controls .font-row { margin: 0 0 8px; }
    #name-controls input[type="text"],
    #name-controls .font-row select {
      width: 100%; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 4px;
      letter-spacing: 0.04em;
      box-sizing: border-box;
    }
    #name-controls input[type="text"]:focus,
    #name-controls .font-row select:focus { outline: none; border-color: rgba(255, 255, 255, 0.35); }
    #name-controls .font-row select { cursor: pointer; appearance: none; }
    #name-controls .font-row select:hover { background: rgba(255, 255, 255, 0.10); }
    #name-controls .font-row select option { background: #1a1a1a; color: rgba(255, 255, 255, 0.85); }

    #name-controls input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #name-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #name-controls input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #name-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #name-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      cursor: pointer; border: none;
    }

    #name-controls .colour-row {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #name-controls .colour-row label { opacity: 0.78; flex: 1; }
    #name-controls .colour-row input[type="color"] {
      width: 56px; height: 26px; padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; background: transparent; cursor: pointer;
    }
    #name-controls .colour-row input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #name-controls .colour-row input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

    #name-controls .actions {
      display: flex; gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #name-controls button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; text-transform: lowercase;
    }
    #name-controls button:hover  { background: rgba(255, 255, 255, 0.12); }
    #name-controls button:active { background: rgba(255, 255, 255, 0.18); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #name-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.22);
      box-shadow: 0 6px 24px rgba(80, 30, 0, 0.18);
    }
    body.theme-light #name-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #name-controls .actions,
    body.theme-light #name-controls .colour-row { border-top-color: rgba(0, 0, 0, 0.18); }
    body.theme-light #name-controls input[type="text"],
    body.theme-light #name-controls .font-row select {
      background: rgba(0, 0, 0, 0.06); border-color: rgba(0, 0, 0, 0.22);
    }
    body.theme-light #name-controls input[type="text"]:focus,
    body.theme-light #name-controls .font-row select:focus { border-color: rgba(0, 0, 0, 0.42); }
    body.theme-light #name-controls .font-row select option { background: #f5f5f5; color: rgba(0, 0, 0, 0.92); }
    body.theme-light #name-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #name-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #name-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #name-controls input[type="range"]::-moz-range-thumb {
      background: rgb(40, 18, 6); box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
    body.theme-light #name-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #name-controls button {
      background: rgba(0, 0, 0, 0.06); border-color: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #name-controls button:hover  { background: rgba(0, 0, 0, 0.14); }
  `,document.head.appendChild(e)}function Pr(e){let t=e>=1?0:e>=.1?1:e>=.01?2:e>=.001?3:4;return e=>e.toFixed(t)}function Fr(e,t=document.body){Nr();let n=jr();Object.keys(n.params).length>0&&e.setParams(n.params);let r=document.createElement(`div`);r.id=`name-controls`,n.collapsed&&r.classList.add(`collapsed`);let i=document.createElement(`header`),a=document.createElement(`span`);a.className=`chev`,a.textContent=`▼`;let o=document.createElement(`span`);o.className=`title`,o.textContent=`name — tune`,i.append(a,o),i.addEventListener(`click`,()=>{r.classList.toggle(`collapsed`),n.collapsed=r.classList.contains(`collapsed`),Mr(n)}),r.appendChild(i);let s=document.createElement(`div`);s.className=`body`;let c=document.createElement(`div`);c.className=`text-row`;let l=document.createElement(`input`);l.type=`text`,l.placeholder=`name text`,l.value=String(e.getParams().text),l.addEventListener(`input`,()=>{let t=l.value;e.setParams({text:t}),n.params.text=t,Mr(n)}),c.appendChild(l),s.appendChild(c);let u=document.createElement(`div`);u.className=`font-row`;let d=document.createElement(`select`);d.title=`Font family`;let f=String(e.getParams().fontFamily);if(!new Set(Or.map(e=>e.stack)).has(f)){let e=document.createElement(`option`);e.value=f,e.textContent=`(custom)`,d.appendChild(e)}for(let e of Or){let t=document.createElement(`option`);t.value=e.stack,t.textContent=e.label,t.style.fontFamily=e.stack,d.appendChild(t)}d.value=f,d.addEventListener(`change`,()=>{let t=d.value;e.setParams({fontFamily:t}),n.params.fontFamily=t,Mr(n)}),u.appendChild(d),s.appendChild(u);let p=[];for(let t of kr){let r=document.createElement(`div`);r.className=`row`;let i=document.createElement(`div`);i.className=`label-line`;let a=document.createElement(`label`);a.textContent=t.label;let o=document.createElement(`span`);o.className=`val`,i.append(a,o);let c=document.createElement(`input`);c.type=`range`,c.min=String(t.min),c.max=String(t.max),c.step=String(t.step);let l=e.getParams()[t.key];c.value=String(l);let u=t.format??Pr(t.step);o.textContent=u(l),c.addEventListener(`input`,()=>{let r=Number(c.value);o.textContent=u(r),e.setParams({[t.key]:r}),n.params[t.key]=r,Mr(n)}),r.append(i,c),s.appendChild(r),p.push({def:t,input:c,val:o})}let m=document.createElement(`div`);m.className=`colour-row`;let h=document.createElement(`label`);h.textContent=`colour`;let g=document.createElement(`input`);g.type=`color`,g.value=String(e.getParams().color),g.addEventListener(`input`,()=>{let t=g.value;e.setParams({color:t}),n.params.color=t,Mr(n)}),m.append(h,g),s.appendChild(m);let _=document.createElement(`div`);_.className=`colour-row`;let v=document.createElement(`label`);v.textContent=`outline`;let y=document.createElement(`input`);y.type=`color`,y.value=String(e.getParams().strokeColor),y.addEventListener(`input`,()=>{let t=y.value;e.setParams({strokeColor:t}),n.params.strokeColor=t,Mr(n)}),_.append(v,y),s.appendChild(_);let b=document.createElement(`div`);b.className=`font-row`;let x=document.createElement(`select`);x.title=`Glitch effect`;for(let e of Cr){let t=document.createElement(`option`);t.value=e,t.textContent=`glitch: ${e}`,x.appendChild(t)}x.value=e.getParams().glitch,x.addEventListener(`change`,()=>{let t=x.value;e.setParams({glitch:t}),n.params.glitch=t,Mr(n)}),b.appendChild(x),s.appendChild(b);let S=`menu-style-v1`,C={family:`"Uncut Sans", ui-monospace, Menlo, Consolas, monospace`,size:18,weight:700,letterSpacing:.06,uppercase:!0};function w(){try{let e=localStorage.getItem(S);if(!e)return{...C};let t=JSON.parse(e);return{...C,...t}}catch{return{...C}}}function T(e){try{localStorage.setItem(S,JSON.stringify(e))}catch{}}let E=w();function D(){let e=document.documentElement.style;e.setProperty(`--menu-font-family`,E.family),e.setProperty(`--menu-font-size`,E.size+`px`),e.setProperty(`--menu-font-weight`,String(E.weight)),e.setProperty(`--menu-letter-spacing`,E.letterSpacing+`em`),e.setProperty(`--menu-text-transform`,E.uppercase?`uppercase`:`none`)}D();let O=document.createElement(`div`);O.className=`row`,O.style.marginTop=`10px`,O.style.opacity=`0.55`,O.style.fontSize=`10px`,O.style.letterSpacing=`0.12em`,O.style.textTransform=`uppercase`,O.textContent=`— menu links —`,s.appendChild(O);let k=document.createElement(`div`);k.className=`font-row`;let A=document.createElement(`select`);if(A.title=`Menu font family`,!new Set(Or.map(e=>e.stack)).has(E.family)){let e=document.createElement(`option`);e.value=E.family,e.textContent=`custom`,A.appendChild(e)}for(let e of Or){let t=document.createElement(`option`);t.value=e.stack,t.textContent=e.label,t.style.fontFamily=e.stack,A.appendChild(t)}A.value=E.family,A.addEventListener(`change`,()=>{E.family=A.value,D(),T(E)}),k.appendChild(A),s.appendChild(k);function j(e,t,n,r,i,a,o=e=>e.toString()){let c=document.createElement(`div`);c.className=`row`;let l=document.createElement(`div`);l.className=`label-line`;let u=document.createElement(`label`);u.textContent=e;let d=document.createElement(`span`);d.className=`val`,d.textContent=o(t),l.append(u,d);let f=document.createElement(`input`);f.type=`range`,f.min=String(n),f.max=String(r),f.step=String(i),f.value=String(t),f.addEventListener(`input`,()=>{let e=Number(f.value);d.textContent=o(e),a(e),D(),T(E)}),c.append(l,f),s.appendChild(c)}j(`menu size`,E.size,8,64,1,e=>{E.size=e}),j(`menu weight`,E.weight,100,900,100,e=>{E.weight=e}),j(`menu spacing`,E.letterSpacing,-.05,.5,.005,e=>{E.letterSpacing=e},e=>e.toFixed(3)+`em`);let M=document.createElement(`div`);M.className=`actions`;let N=document.createElement(`button`);N.textContent=`reset`,N.addEventListener(`click`,()=>{e.setParams({...wr}),n.params={},Mr(n),l.value=wr.text,d.value=wr.fontFamily,g.value=wr.color,y.value=wr.strokeColor,x.value=wr.glitch;for(let{def:e,input:t,val:n}of p){let r=wr[e.key];t.value=String(r),n.textContent=(e.format??Pr(e.step))(r)}});let P=document.createElement(`button`);return P.textContent=`copy`,P.addEventListener(`click`,async()=>{let t=JSON.stringify(e.getParams(),null,2);try{await navigator.clipboard.writeText(t);let e=P.textContent;P.textContent=`copied`,setTimeout(()=>{P.textContent=e},900)}catch{console.log(t)}}),M.append(N,P),s.appendChild(M),r.appendChild(s),t.appendChild(r),{destroy(){r.remove()}}}var Ir=[`whip`,`repel`,`attract`,`swirl`,`pulse`],Lr={effect:`repel`,fieldR:400,amp:65,noiseAmp:0,fadeSpeed:.5},Rr=.016,zr=.016,Br=.55;function Vr(){let e={...Lr},t=sn();return{getParams:()=>e,setParams:t=>{Object.assign(e,t)},displace(n,r,i,a,o,s){if(s<=.001||e.fieldR<=0)return[n,r];let c=n-i,l=r-a,u=c*c+l*l;if(u<.25)return[n,r];let d=o*.001,f=t(n*Rr,r*zr+d*Br),p=e.fieldR*(1+e.noiseAmp*f);if(u>=p*p)return[n,r];let m=Math.sqrt(u),h=m/p,g=c/m,_=l/m;switch(e.effect){case`whip`:{let t=4*h*(1-h)*e.amp*s;return[n+g*t,r+_*t]}case`repel`:{let t=1-h,i=t*t*e.amp*s;return e.squint&&_<0&&(i*=1+_*e.squint),[n+g*i,r+_*i]}case`attract`:{let t=1-h,i=t*t*e.amp*s;return[n-g*i,r-_*i]}case`swirl`:{let t=1-h,i=t*t*e.amp*s;return[n-_*i,r+g*i]}case`pulse`:{let t=h*Math.PI*6-d*5,i=Math.sin(t)*(1-h)*e.amp*s;return[n+g*i,r+_*i]}default:return[n,r]}}}}var Hr=[{key:`fieldR`,label:`field radius`,min:0,max:400,step:1},{key:`amp`,label:`strength`,min:0,max:200,step:1},{key:`noiseAmp`,label:`border noise`,min:0,max:1,step:.01},{key:`fadeSpeed`,label:`fade /s`,min:.5,max:12,step:.1}],Ur=`cursor-effect-controls-v1`;function Wr(){let e={params:{},collapsed:!1};try{let t=localStorage.getItem(Ur);if(!t)return e;let n=JSON.parse(t);return{params:n.params??{},collapsed:n.collapsed??!1}}catch{return e}}function Gr(e){try{localStorage.setItem(Ur,JSON.stringify(e))}catch{}}function Kr(){if(document.getElementById(`cursor-controls-styles`))return;let e=document.createElement(`style`);e.id=`cursor-controls-styles`,e.textContent=`
    #cursor-controls {
      position: fixed;
      bottom: 12px;
      right: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #cursor-controls header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #cursor-controls header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #cursor-controls.collapsed header { border-bottom: none; }
    #cursor-controls.collapsed header .chev { transform: rotate(-90deg); }
    #cursor-controls.collapsed .body { display: none; }
    #cursor-controls header .title { flex: 1; }
    #cursor-controls .body { padding: 8px 10px 10px; max-height: 65vh; overflow-y: auto; }
    #cursor-controls .row { margin: 6px 0; }
    #cursor-controls .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #cursor-controls .row label { opacity: 0.78; }
    #cursor-controls .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
    }

    #cursor-controls .effect-row { margin: 0 0 10px; }
    #cursor-controls .effect-row select {
      width: 100%; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 4px;
      letter-spacing: 0.04em;
      cursor: pointer;
      appearance: none;
      text-transform: uppercase;
    }
    #cursor-controls .effect-row select:hover { background: rgba(255, 255, 255, 0.12); }
    #cursor-controls .effect-row select option { background: #1a1a1a; color: rgba(255, 255, 255, 0.85); }

    #cursor-controls input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #cursor-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #cursor-controls input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #cursor-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #cursor-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      cursor: pointer; border: none;
    }

    #cursor-controls .actions {
      display: flex; gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #cursor-controls button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; text-transform: lowercase;
    }
    #cursor-controls button:hover  { background: rgba(255, 255, 255, 0.14); }
    #cursor-controls button:active { background: rgba(255, 255, 255, 0.22); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #cursor-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #cursor-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.22);
    }
    body.theme-light #cursor-controls .actions { border-top-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #cursor-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #cursor-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #cursor-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #cursor-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #cursor-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80); box-shadow: 0 0 6px rgba(0, 0, 0, 0.40);
    }
    body.theme-light #cursor-controls button,
    body.theme-light #cursor-controls .effect-row select {
      background: rgba(0, 0, 0, 0.08); border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #cursor-controls button:hover,
    body.theme-light #cursor-controls .effect-row select:hover {
      background: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #cursor-controls .effect-row select option {
      background: #f5f5f5; color: rgba(0, 0, 0, 0.92);
    }
  `,document.head.appendChild(e)}function qr(e){let t=e>=1?0:e>=.1?1:e>=.01?2:e>=.001?3:4;return e=>e.toFixed(t)}function Jr(e,t=document.body){Kr();let n=Wr();Object.keys(n.params).length>0&&e.setParams(n.params);let r=document.createElement(`div`);r.id=`cursor-controls`,n.collapsed&&r.classList.add(`collapsed`);let i=document.createElement(`header`),a=document.createElement(`span`);a.className=`chev`,a.textContent=`▼`;let o=document.createElement(`span`);o.className=`title`,o.textContent=`cursor — field`,i.append(a,o),i.addEventListener(`click`,()=>{r.classList.toggle(`collapsed`),n.collapsed=r.classList.contains(`collapsed`),Gr(n)}),r.appendChild(i);let s=document.createElement(`div`);s.className=`body`;let c=document.createElement(`div`);c.className=`effect-row`;let l=document.createElement(`select`);l.title=`Field effect`;for(let e of Ir){let t=document.createElement(`option`);t.value=e,t.textContent=e,l.appendChild(t)}l.value=e.getParams().effect,l.addEventListener(`change`,()=>{let t=l.value;e.setParams({effect:t}),n.params.effect=t,Gr(n)}),c.appendChild(l),s.appendChild(c);let u=[];for(let t of Hr){let r=document.createElement(`div`);r.className=`row`;let i=document.createElement(`div`);i.className=`label-line`;let a=document.createElement(`label`);a.textContent=t.label;let o=document.createElement(`span`);o.className=`val`,i.append(a,o);let c=document.createElement(`input`);c.type=`range`,c.min=String(t.min),c.max=String(t.max),c.step=String(t.step);let l=e.getParams()[t.key];c.value=String(l);let d=t.format??qr(t.step);o.textContent=d(l),c.addEventListener(`input`,()=>{let r=Number(c.value);o.textContent=d(r),e.setParams({[t.key]:r}),n.params[t.key]=r,Gr(n)}),r.append(i,c),s.appendChild(r),u.push({def:t,input:c,val:o})}let d=document.createElement(`div`);d.className=`actions`;let f=document.createElement(`button`);f.textContent=`reset`,f.addEventListener(`click`,()=>{e.setParams({...Lr}),n.params={},Gr(n),l.value=Lr.effect;for(let{def:e,input:t,val:n}of u){let r=Lr[e.key];t.value=String(r),n.textContent=(e.format??qr(e.step))(r)}});let p=document.createElement(`button`);return p.textContent=`copy`,p.addEventListener(`click`,async()=>{let t=JSON.stringify(e.getParams(),null,2);try{await navigator.clipboard.writeText(t);let e=p.textContent;p.textContent=`copied`,setTimeout(()=>{p.textContent=e},900)}catch{console.log(t)}}),d.append(f,p),s.appendChild(d),r.appendChild(s),t.appendChild(r),{destroy(){r.remove()}}}var Yr=`scroll-arc-collapsed-v1`;function Xr(){if(document.getElementById(`scroll-arc-styles`))return;let e=document.createElement(`style`);e.id=`scroll-arc-styles`,e.textContent=`
    #scroll-arc {
      position: fixed;
      bottom: 12px;
      left: 12px;
      z-index: 9999;
      width: 220px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      user-select: none;
      -webkit-user-select: none;
    }
    #scroll-arc header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #scroll-arc header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #scroll-arc.collapsed header { border-bottom: none; }
    #scroll-arc.collapsed header .chev { transform: rotate(-90deg); }
    #scroll-arc.collapsed .body { display: none; }
    #scroll-arc header .title { flex: 1; }
    #scroll-arc .body { padding: 8px 10px 10px; max-height: 60vh; overflow-y: auto; }

    #scroll-arc .kf {
      display: flex; align-items: center; justify-content: space-between;
      padding: 5px 8px;
      margin-bottom: 4px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
    }
    #scroll-arc .kf:hover { background: rgba(255, 255, 255, 0.08); }
    #scroll-arc .kf.active {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.12);
    }
    #scroll-arc .kf-label {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.85);
    }
    #scroll-arc .kf-at {
      opacity: 0.5;
      font-variant-numeric: tabular-nums;
      font-size: 10px;
    }
    #scroll-arc .actions {
      display: flex; gap: 6px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #scroll-arc .actions button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; cursor: pointer;
      letter-spacing: 0.05em; text-transform: lowercase;
    }
    #scroll-arc .actions button:hover  { background: rgba(255, 255, 255, 0.14); }
    #scroll-arc .actions button:active { background: rgba(255, 255, 255, 0.22); }

    body.theme-light #scroll-arc {
      color: rgba(0, 0, 0, 0.82);
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(0, 0, 0, 0.16);
    }
    body.theme-light #scroll-arc header {
      color: rgba(0, 0, 0, 0.90);
      border-bottom-color: rgba(0, 0, 0, 0.10);
    }
    body.theme-light #scroll-arc .kf {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.10);
    }
    body.theme-light #scroll-arc .kf.active {
      background: rgba(0, 0, 0, 0.14);
      border-color: rgba(0, 0, 0, 0.55);
    }
    body.theme-light #scroll-arc .actions button {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.18);
    }
  `,document.head.appendChild(e)}function Zr(e){let t=document.documentElement.scrollHeight-window.innerHeight;t<=0||window.scrollTo({top:e*t,behavior:`smooth`})}function Qr(e,t=document.body){Xr();let n=document.createElement(`div`);n.id=`scroll-arc`,localStorage.getItem(Yr)===`1`&&n.classList.add(`collapsed`);let r=document.createElement(`header`),i=document.createElement(`span`);i.className=`chev`,i.textContent=`▼`;let a=document.createElement(`span`);a.className=`title`,a.textContent=`scroll arc`,r.append(i,a),r.addEventListener(`click`,()=>{n.classList.toggle(`collapsed`);try{localStorage.setItem(Yr,n.classList.contains(`collapsed`)?`1`:`0`)}catch{}}),n.appendChild(r);let o=document.createElement(`div`);o.className=`body`,n.appendChild(o);let s=document.createElement(`div`);s.className=`list`,o.appendChild(s);let c=document.createElement(`div`);c.className=`actions`;let l=document.createElement(`button`);l.textContent=`save`,l.title=`Download scroll-arc-defaults.json — replace the file in src/ and commit to share with all visitors`,l.addEventListener(`click`,()=>{e.saveAsDefaults();let t=l.textContent;l.textContent=`downloaded`,setTimeout(()=>{l.textContent=t},1200)});let u=document.createElement(`button`);u.textContent=`reset`,u.title=`Restore committed defaults from scroll-arc-defaults.json`,u.addEventListener(`click`,()=>{e.reset(),Zr(0)}),c.append(l,u),o.appendChild(c);function d(){s.innerHTML=``;let t=e.getKeyframes(),n=e.getActiveIndex();t.forEach((t,r)=>{let i=document.createElement(`div`);i.className=`kf`+(r===n?` active`:``);let a=document.createElement(`span`);a.className=`kf-label`,a.textContent=t.label??`section ${r+1}`;let o=document.createElement(`span`);o.className=`kf-at`,o.textContent=t.at.toFixed(2),i.append(a,o),i.addEventListener(`click`,()=>{e.setActiveIndex(r),Zr(t.at)}),s.appendChild(i)})}let f=e.subscribe(d);return d(),t.appendChild(n),{destroy(){f(),n.remove()}}}var $r=[{key:`pixelSize`,label:`pixel size`,min:1,max:12,step:1},{key:`scanlineOpacity`,label:`scanline alpha`,min:0,max:1,step:.01},{key:`scanlineSpacing`,label:`scanline gap`,min:1,max:12,step:1},{key:`glowOpacity`,label:`glow opacity`,min:0,max:1,step:.01},{key:`glowRadius`,label:`glow radius`,min:0,max:80,step:1},{key:`glowSoftness`,label:`glow softness`,min:0,max:1,step:.01},{key:`grainOpacity`,label:`grain opacity`,min:0,max:1,step:.01},{key:`grainScale`,label:`grain scale`,min:1,max:6,step:1}],ei=`post-fx-controls-v1`;function ti(){let e={params:{},collapsed:!0};try{let t=localStorage.getItem(ei);if(!t)return e;let n=JSON.parse(t);return{params:n.params??{},collapsed:n.collapsed??!0}}catch{return e}}function ni(e){try{localStorage.setItem(ei,JSON.stringify(e))}catch{}}function ri(){if(document.getElementById(`post-fx-controls-styles`))return;let e=document.createElement(`style`);e.id=`post-fx-controls-styles`,e.textContent=`
    #post-fx-controls {
      position: fixed;
      bottom: 12px;
      right: 12px;
      z-index: 9999;
      width: 220px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #post-fx-controls header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      cursor: pointer;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #post-fx-controls header .chev {
      transition: transform 150ms ease-out;
      font-size: 9px;
      opacity: 0.7;
    }
    #post-fx-controls.collapsed header { border-bottom: none; }
    #post-fx-controls.collapsed header .chev { transform: rotate(-90deg); }
    #post-fx-controls.collapsed .body { display: none; }
    #post-fx-controls header .title { flex: 1; }
    #post-fx-controls .body { padding: 8px 10px 10px; max-height: 60vh; overflow-y: auto; }
    #post-fx-controls .row { margin: 6px 0; }
    #post-fx-controls .row .label-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
      gap: 8px;
    }
    #post-fx-controls .row label { opacity: 0.78; }
    #post-fx-controls .row .val {
      font: inherit;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;
      padding: 1px 4px;
      width: 60px;
      text-align: right;
      cursor: text;
      outline: none;
    }
    #post-fx-controls .row .val:hover { border-color: rgba(255, 255, 255, 0.18); }
    #post-fx-controls .row .val:focus {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.06);
    }
    body.theme-light #post-fx-controls .row .val:hover { border-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #post-fx-controls .row .val:focus {
      border-color: rgba(0, 0, 0, 0.65);
      background: rgba(0, 0, 0, 0.06);
    }
    #post-fx-controls input[type="range"] {
      width: 100%;
      height: 14px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      margin: 0;
    }
    #post-fx-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #post-fx-controls input[type="range"]::-moz-range-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #post-fx-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      margin-top: -5px;
      cursor: pointer;
      border: none;
    }
    #post-fx-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      cursor: pointer;
      border: none;
    }
    #post-fx-controls .actions {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #post-fx-controls button {
      flex: 1;
      padding: 5px 8px;
      font: inherit;
      color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.05em;
      text-transform: lowercase;
    }
    #post-fx-controls button:hover  { background: rgba(255, 255, 255, 0.14); }
    #post-fx-controls button:active { background: rgba(255, 255, 255, 0.20); }

    body.theme-light #post-fx-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #post-fx-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #post-fx-controls .actions {
      border-top-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #post-fx-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #post-fx-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #post-fx-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #post-fx-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
    body.theme-light #post-fx-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #post-fx-controls button {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #post-fx-controls button:hover {
      background: rgba(0, 0, 0, 0.18);
    }
  `,document.head.appendChild(e)}function ii(e){let t=e>=1?0:e>=.1?1:e>=.01?2:e>=.001?3:4;return e=>e.toFixed(t)}function ai(e,t=document.body){ri();let n=ti();Object.keys(n.params).length>0&&e.setParams(n.params);let r=document.createElement(`div`);r.id=`post-fx-controls`,n.collapsed&&r.classList.add(`collapsed`);let i=document.createElement(`header`),a=document.createElement(`span`);a.className=`chev`,a.textContent=`▼`;let o=document.createElement(`span`);o.className=`title`,o.textContent=`post-fx`,i.append(a,o),i.addEventListener(`click`,()=>{r.classList.toggle(`collapsed`),n.collapsed=r.classList.contains(`collapsed`),ni(n)}),r.appendChild(i);let s=document.createElement(`div`);s.className=`body`;let c=[];for(let t of $r){let r=document.createElement(`div`);r.className=`row`;let i=document.createElement(`div`);i.className=`label-line`;let a=document.createElement(`label`);a.textContent=t.label;let o=document.createElement(`input`);o.type=`text`,o.inputMode=`decimal`,o.spellcheck=!1,o.className=`val`,o.title=`Click and type a number — no min/max cap`,i.append(a,o);let l=document.createElement(`input`);l.type=`range`,l.min=String(t.min),l.max=String(t.max),l.step=String(t.step);let u=e.getParams()[t.key];l.value=String(u);let d=t.format??ii(t.step);o.value=d(u);let f=r=>{e.setParams({[t.key]:r}),n.params[t.key]=r,ni(n)};l.addEventListener(`input`,()=>{let e=Number(l.value);o.value=d(e),f(e)}),o.addEventListener(`change`,()=>{let e=Number(o.value);if(!Number.isFinite(e)){o.value=d(Number(l.value));return}l.value=String(e),o.value=d(e),f(e)}),o.addEventListener(`keydown`,e=>{e.key===`Enter`?(e.preventDefault(),o.blur()):e.key===`Escape`&&(o.value=d(Number(l.value)),o.blur())}),o.addEventListener(`focus`,()=>{o.select()}),r.appendChild(i),r.appendChild(l),s.appendChild(r),c.push({def:t,input:l,val:o})}let l=document.createElement(`div`);l.className=`actions`;let u=document.createElement(`button`);return u.textContent=`reset`,u.title=`Restore the post-FX layer to FIRE_DEFAULTS`,u.addEventListener(`click`,()=>{let t={};for(let e of $r)t[e.key]=Y[e.key];e.setParams(t),n.params={},ni(n);for(let{def:e,input:t,val:n}of c){let r=Y[e.key];t.value=String(r),n.value=(e.format??ii(e.step))(r)}}),l.appendChild(u),s.appendChild(l),r.appendChild(s),t.appendChild(r),{destroy(){r.remove()}}}function oi(e){return e<0?0:e>1?1:e}var si=`section-nav-collapsed-v1`;function ci(){if(document.getElementById(`section-nav-styles`))return;let e=document.createElement(`style`);e.id=`section-nav-styles`,e.textContent=`
    #section-nav {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      font: 12px/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.92);
      background: rgba(18, 18, 18, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      user-select: none;
      -webkit-user-select: none;
    }
    #section-nav button {
      appearance: none;
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      width: 28px;
      height: 28px;
      padding: 0;
      font: inherit;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    #section-nav button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.18);
    }
    #section-nav button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    #section-nav .counter {
      min-width: 42px;
      text-align: center;
      letter-spacing: 0.06em;
      font-variant-numeric: tabular-nums;
    }
    #section-nav .add { font-size: 16px; }
    #section-nav .remove { font-size: 18px; line-height: 0.7; }
    body.theme-light #section-nav {
      color: rgba(20, 20, 20, 0.92);
      background: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 0, 0, 0.16);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #section-nav button {
      background: rgba(0, 0, 0, 0.06);
      border-color: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #section-nav button:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.14);
    }
  `,document.head.appendChild(e)}function li(e){let t=document.documentElement.scrollHeight-window.innerHeight;if(t<=0)return;let n=e*t;window.scrollTo({top:n,behavior:`smooth`})}function ui(e,t=document.body){ci();let n=document.createElement(`div`);n.id=`section-nav`,localStorage.getItem(si)===`1`&&(n.style.display=`none`);let r=document.createElement(`button`);r.className=`prev`,r.title=`Previous section`,r.textContent=`‹`;let i=document.createElement(`span`);i.className=`counter`;let a=document.createElement(`button`);a.className=`next`,a.title=`Next section`,a.textContent=`›`;let o=document.createElement(`button`);o.className=`remove`,o.title=`Delete current section (need at least 2)`,o.textContent=`−`;let s=document.createElement(`button`);s.className=`add`,s.title=`Append section (copies the current one)`,s.textContent=`+`,n.append(r,i,a,o,s),t.appendChild(n);function c(){let t=e.getKeyframes(),n=e.getActiveIndex();i.textContent=`${n+1} / ${t.length}`,r.disabled=n<=0,a.disabled=n>=t.length-1,o.disabled=t.length<=2}r.addEventListener(`click`,()=>{let t=e.getActiveIndex();if(t<=0)return;let n=t-1;e.setActiveIndex(n);let r=e.getKeyframes()[n]?.at;typeof r==`number`&&li(r)}),a.addEventListener(`click`,()=>{let t=e.getKeyframes(),n=e.getActiveIndex();if(n>=t.length-1)return;let r=n+1;e.setActiveIndex(r);let i=e.getKeyframes()[r]?.at;typeof i==`number`&&li(i)}),s.addEventListener(`click`,()=>{e.appendKeyframe();let t=e.getKeyframes(),n=t[t.length-1];n&&li(n.at)}),o.addEventListener(`click`,()=>{let t=e.getActiveIndex();e.removeKeyframe(t);let n=e.getKeyframes()[e.getActiveIndex()]?.at;typeof n==`number`&&li(n)});let l=e.subscribe(c);return c(),{destroy(){l(),n.remove()}}}var di=JSON.parse(`["All those MOMENTS will be lost in TIME, like TEARS IN RAIN.","Все эти мгновения исчезнут во времени, как слёзы под дождём.","The LIGHT that BURNS twice as bright BURNS half as long.","СВЕТ, что ГОРИТ в два раза ярче, горит в два раза короче.","Quite an EXPERIENCE to live in FEAR, isn't it? That's what it is to be a SLAVE.","Жить в СТРАХЕ — это незабываемое ИСПЫТАНИЕ, не так ли? Вот что значит БЫТЬ РАБОМ.","Is this to be an EMPATHY test?","Have you ever retired a human by MISTAKE?","Это ТЕСТ на эмпатию?","Вы когда-нибудь «отправляли в отставку» человека по ошибке?","ОГНЕННЫЕ ангелы пали; глубокий гром прокатился вдоль их берегов; пылая огнями Орка.","Более человечные, чем сами люди — наш девиз.","If only you could SEE what I've seen with your EYES!","Если бы вы только могли увидеть то, что ВИДЕЛ я, вашими глазами!","Wake up! TIME TO DIE!","Проснись! Пора УМИРАТЬ!","Are you testing whether I'm a REPLICANT or a lesbian, Mr. Deckard?","Вы проверяете, РЕПЛИКАНТ я или лесбиянка, мистер Декард?","NOTHING is worse than having an itch you can never scratch!","Нет ничего хуже зуда, который ты не можешь почесать.","You will be required TO DO WRONG no matter where you go. It is the basic condition of LIFE, to be required TO VIOLATE your own IDENTITY.","Куда бы вы ни пошли, вам придется поступать дурно. Таково основное условие ЖИЗНИ: от вас требуется поступать наперекор собственной сущности.","My SCHEDULE for today lists a six-hour self-accusatory depression.","В моем расписании на сегодня значится шестичасовая депрессия с самобичеванием.","...a HUMANOID robot is like any other machine; it can fluctuate between being a benefit and a hazard very rapidly.","Человекоподобный робот ничем не отличается от любой другой машины; он может В МГНОВЕНИЕ ока превратиться из блага В СМЕРТЕЛЬНУЮ угрозу.","Empathy, evidently, EXISTED only within the human community, whereas intelligence to some degree could be found throughout every phylum and order including the arachnida.","ЭМПАТИЯ, по-видимому, существовала только в человеческом обществе, тогда как интеллект в той или иной степени можно было обнаружить в любом типе и отряде, включая паукообразных.","Everything is true. Everything ANYBODY has ever THOUGHT.","Всё — правда. Всё, что кто-либо когда-либо ДУМАЛ.","An ANDROID doesn't care what happens to another android.","АНДРОИДУ плевать, что случится с другим андроидом.","You have to be with other people, he THOUGHT. In order to live at all.","Тебе нужно быть с другими людьми, ПОДУМАЛ он. Чтобы вообще жить.","He had wondered as had most people at one TIME or another precisely why an OWL, of all the fowls on Earth, had been the first TO DIE.","Он задавался вопросом, как и большинство людей в то или иное ВРЕМЯ: почему именно сова из всех птиц на Земле вымерла первой.","It is SOMETIMES an appropriate response to reality to go INSANE.","ИНОГДА сойти с ума — вполне адекватная реакция на РЕАЛЬНОСТЬ.","To fight the EMPIRE is to be INFECTED by its derangement. This is a PARADOX: whoever defeats a segment of the EMPIRE becomes the EMPIRE; it PROLIFERATES like a VIRUS.","Бороться с ИМПЕРИЕЙ — значит заразиться её БЕЗУМИЕМ. Это парадокс: тот, кто побеждает часть ИМПЕРИИ, сам становится ИМПЕРИЕЙ; она размножается, как вирус.","There is NO ROUTE OUT of the MAZE. The MAZE shifts as you move through it, because it is alive.","Из лабиринта нет выхода. ЛАБИРИНТ меняется по мере того, как вы продвигаетесь по нему, потому что он живой.","The true GOD mimics the universe, the very region he has invaded.","ИСТИННЫЙ БОГ мимикрирует под вселенную, ту самую область, в которую он вторгся.","We appear to be MEMORY coils (dna carriers capable of experience) in a computer-like THINKING system.","Похоже, мы — катушки памяти (носители ДНК, способные к приобретению опыта) В МЫСЛЯЩЕЙ системе, подобной компьютеру.","The UNIVERSE is INFORMATION and we are stationary in it, not THREE-DIMENSIONAL and not IN SPACE or TIME.","Вселенная — это информация, и мы в ней неподвижны, мы не трехмерны и находимся вне ПРОСТРАНСТВА и ВРЕМЕНИ.","Fat MUST have come up with this; it is too crazy to be true.","Должно быть, это придумал Толстяк; это слишком БЕЗУМНО, чтобы быть правдой.","Your VISIONS will become clear only when you can LOOK into your own heart. Who LOOKS outside, DREAMS; who LOOKS inside, AWAKES.","Ваш ВЗОР станет ЯСНЫМ лишь тогда, когда вы сможете заглянуть в собственную ДУШУ. Кто СМОТРИТ наружу — спит; кто СМОТРИТ внутрь — пробуждается.","Until you make the UNCONSCIOUS CONSCIOUS, it will direct your LIFE and you will call it fate.","Пока вы не сделаете бессознательное сознательным, оно будет направлять вашу ЖИЗНЬ, и вы назовете это судьбой.","I am not WHAT happened to me, I am what I choose TO BECOME.","Я — не то, что со мной случилось, я — то, чем я решил стать.","KNOWING your own DARKNESS is the best method for dealing with the DARKNESSES of other people.","ЗНАНИЕ собственной тьмы — лучший способ справиться с тьмой других людей.","EVERYTHING that irritates us about others can lead us to an understanding of ourselves.","Всё, что РАЗДРАЖАЕТ нас в других, может привести к пониманию нас самих.","Follow your BLISS and the universe will open doors for you where there were only walls.","СЛЕДУЙТЕ за своим вдохновением, и вселенная откроет вам двери там, где раньше были одни стены.","The CAVE you FEAR to enter holds the TREASURE you SEEK.","В ПЕЩЕРЕ, в которую вы БОИТЕСЬ войти, сокрыто СОКРОВИЩЕ, которое вы ИЩЕТЕ.","We must be willing to let go of the LIFE we planned so as to have the LIFE that is waiting for us.","Мы должны БЫТЬ готовы отказаться от той ЖИЗНИ, которую планировали, чтобы принять ту, которая нас ждет.","Find a place inside where there's JOY, and the JOY will BURN out the PAIN.","Найдите внутри себя место, где живет РАДОСТЬ, и эта РАДОСТЬ выжжет БОЛЬ.","The privilege of a LIFETIME is being who you are.","Привилегия длиною В ЖИЗНЬ — БЫТЬ тем, кто ты есть.","I already am eating from the trash can all the TIME. The name of this trash can is IDEOLOGY. The material force of IDEOLOGY makes me not SEE what I am effectively eating.","Я и так все ВРЕМЯ ем из мусорного бака. Имя этому мусорному баку — ИДЕОЛОГИЯ. Материальная сила ИДЕОЛОГИИ мешает мне ВИДЕТЬ то, что я на самом деле ем.","The only WAY to be really FREE is to recognize your limits.","Единственный способ БЫТЬ по-настоящему СВОБОДНЫМ — это признать свои ограничения.","WORDS are never only words; they matter because they define the contours of what we can do.","СЛОВА — это никогда не просто слова; они важны, потому что определяют контуры того, что мы можем сделать.","IDEOLOGY is not simply a false CONSCIOUSNESS, an illusory representation of reality. It is, rather, this reality itself which is already to be conceived as 'ideological'.","ИДЕОЛОГИЯ — это не просто ложное сознание, иллюзорное представление реальности. Скорее, это сама реальность, которую уже следует понимать как «ИДЕОЛОГИЧЕСКУЮ».","We feel FREE because we lack the very language to articulate our UNFREEDOM.","Мы чувствуем себя СВОБОДНЫМИ, потому что нам не хватает самого языка, чтобы сформулировать нашу НЕСВОБОДУ.","The only WAY to do great work is to love what you do. If you haven't found it yet, keep LOOKING. Don't settle.","Единственный способ делать великую РАБОТУ — ЛЮБИТЬ то, что вы делаете. Если вы еще не нашли ее, продолжайте искать. Не останавливайтесь.","DESIGN is not just what it LOOKS like and FEELS like. DESIGN is how it works.","ДИЗАЙН — это не то, как предмет выглядит или воспринимается на ощупь. Дизайн — это то, как он РАБОТАЕТ.","INNOVATION distinguishes between a leader and a follower.","ИННОВАЦИИ отличают лидера от догоняющего.","Your TIME is limited, so don't waste it living someone else's LIFE.","Ваше ВРЕМЯ ограничено, поэтому не тратьте его на то, чтобы жить чужой ЖИЗНЬЮ.","Man is not a FIXED and enduring form... he is much more a BRIDGE between two shores.","Человек — это не застывшая и устойчивая форма... он скорее мост между двумя берегами.","SOLITUDE is independence. It had been my wish and with the years I had attained it.","ОДИНОЧЕСТВО — это независимость. Я желал его и с годами достиг его.","You are to live and to learn to laugh. You are to learn to listen to the cursed radio music of LIFE.","Тебе предстоит жить и учиться смеяться. Тебе предстоит научиться слушать проклятую радиомузыку жизни.","IDEAS are like fish. If you want to catch little fish, you can stay in the shallow water. But if you want to catch the big fish, you have to go deeper.","Идеи подобны рыбам. Если ХОЧЕШЬ ловить мелкую рыбешку, можешь оставаться на мелководье. Но если ХОЧЕШЬ поймать крупную рыбу, придется идти вглубь.","Every viewer is going to get a different thing. That's the thing about PAINTING, photography, cinema.","Каждый ЗРИТЕЛЬ увидит что-то свое. В этом и заключается СМЫСЛ живописи, фотографии, кино.","I don't think that people accept the fact that LIFE doesn't make SENSE.","Я не думаю, что люди принимают тот факт, что ЖИЗНЬ не имеет СМЫСЛА.","I love coffee. A really good cup of coffee is one of the most BEAUTIFUL things.","Я люблю кофе. Чашка по-настоящему хорошего КОФЕ — одна из прекраснейших вещей в мире.","Что вершит судьбу человечества в этом мире? Некое незримое существо или закон, подобно Длани Господней, парящей над миром? По крайней мере истинно то, что человек не властен даже над своей волей.","SEE YOU SPACE COWBOY...","BLAME!","METAL GEAR?!","You're pretty good.","Kept you waiting, huh?","Why are we still here? Just to suffer?","Farewell good hunter","Foul Tarnished! In search of the Elden Ring. Emboldened by the flame of ambition. Someone must extinguish thy flame.","We are born of the blood, made men by the blood, undone by the blood. Our eyes are yet to open.","You shall not pass!","My precious","KANEDA!","TEARS IN RAIN","Nanomachines, son!","ADHD","Bipolar","BPD","Gaspar Noe","Je suis désolé","VHS","DVD","Blu-Ray","Internet","2000s","Чем больше сила, тем больше и ответственность."]`);for(let[t,n]of Object.entries(e))localStorage.setItem(t,n);`scrollRestoration`in history&&(history.scrollRestoration=`manual`),window.scrollTo(0,0),window.addEventListener(`load`,()=>window.scrollTo(0,0)),document.body.classList.add(`ui-hidden`),window.addEventListener(`keydown`,e=>{(e.key===`s`||e.key===`S`||e.key===`ы`||e.key===`Ы`)&&document.body.classList.toggle(`ui-hidden`)});function fi(e){let t=e.slice();for(let e=t.length-1;e>0;e--){let n=Math.random()*(e+1)|0;[t[e],t[n]]=[t[n],t[e]]}return t.join(` • `)}var pi=fi(di),X=document.querySelector(`#fire`),Z=X.getContext(`2d`,{alpha:!0});function mi(){let e=window.devicePixelRatio||1,t=window.innerWidth,n=window.innerHeight;return X.width=Math.round(t*e),X.height=Math.round(n*e),X.style.width=`${t}px`,X.style.height=`${n}px`,Z.setTransform(e,0,0,e,0,0),{w:t,h:n}}var{w:hi,h:gi}=mi(),Q=Vn(pi,hi,gi),_i=Dr(hi,gi);Fr(_i);var vi=Vr();Jr(vi),Q.setCursorEffect(vi);var yi=Vr();yi.setParams({effect:`repel`,fieldR:1550,amp:73,noiseAmp:0,fadeSpeed:.5});var bi={effect:`repel`,fieldR:250,amp:50,noiseAmp:0,fadeSpeed:.5,squint:.45},xi=Vr();xi.setParams(bi);var Si=Vr();Si.setParams(bi);var Ci=pr();Sr(Q,Ci),Qr(Ci),ai(Q),ui(Ci);function wi(){let e=Ci.getKeyframes().length,t=Math.max(100,(e-1)*200+100);document.body.style.minHeight=`${t}vh`}wi(),Ci.subscribe(wi);var Ti=0;window.addEventListener(`resize`,()=>{Ti||=requestAnimationFrame(()=>{Ti=0;let e=mi();hi=e.w,gi=e.h,Q.resize(hi,gi),_i.resize(hi,gi)})});var Ei=document.createElement(`canvas`),Di=Ei.getContext(`2d`);function Oi(){let e=Q.getParams().pixelSize;if(e<=1)return;let t=X.width,n=X.height,r=Math.max(1,Math.floor(hi/e)),i=Math.max(1,Math.floor(gi/e));Ei.width!==r&&(Ei.width=r),Ei.height!==i&&(Ei.height=i),Di.imageSmoothingEnabled=!0,Di.setTransform(1,0,0,1,0,0),Di.clearRect(0,0,r,i),Di.drawImage(X,0,0,t,n,0,0,r,i),Z.save(),Z.setTransform(1,0,0,1,0,0),Z.imageSmoothingEnabled=!1,Z.clearRect(0,0,t,n),Z.drawImage(Ei,0,0,r,i,0,0,t,n),Z.restore(),Z.imageSmoothingEnabled=!0}var ki=document.createElement(`canvas`),Ai=ki.getContext(`2d`),ji=null,Mi=-1,Ni=-1,Pi=-1;function Fi(e,t){let n=window.devicePixelRatio||1,r=Math.max(2,Math.round(t*n));ki.width=1,ki.height=r,Ai.clearRect(0,0,1,r),Ai.fillStyle=`rgba(0, 0, 0, ${e})`,Ai.fillRect(0,0,1,1),ji=Z.createPattern(ki,`repeat`),Mi=e,Ni=t,Pi=n}function Ii(){let e=Q.getParams(),t=e.scanlineOpacity,n=e.scanlineSpacing;if(t<=0||n<1)return;let r=window.devicePixelRatio||1;(!ji||t!==Mi||n!==Ni||r!==Pi)&&Fi(t,n),ji&&(Z.save(),Z.setTransform(1,0,0,1,0,0),Z.fillStyle=ji,Z.fillRect(0,0,X.width,X.height),Z.restore())}var Li=256,Ri=document.createElement(`canvas`);Ri.width=Li,Ri.height=Li;var zi=Ri.getContext(`2d`),Bi=null,Vi=0;function Hi(){let e=zi.createImageData(Li,Li),t=e.data;for(let e=0;e<Li*Li;e++){let n=Math.random(),r=n<.6?0:Math.round((n-.6)*2.5*255),i=e*4;t[i]=255,t[i+1]=255,t[i+2]=255,t[i+3]=r}zi.putImageData(e,0,0),Bi=Z.createPattern(Ri,`repeat`)}function Ui(){let e=Q.getParams();if(e.grainOpacity<=0)return;let t=Math.max(1,Math.round(e.grainSpeed));if(!Bi||Vi>=t?(Hi(),Vi=0):Vi++,!Bi)return;Z.save(),Z.setTransform(1,0,0,1,0,0);let n=Math.max(1,e.grainScale|0);n!==1&&Z.scale(n,n),Z.globalAlpha=e.grainOpacity,Z.globalCompositeOperation=`lighter`,Z.fillStyle=Bi,Z.fillRect(0,0,X.width/n,X.height/n),Z.restore()}var Wi=.95,Gi=.25,$=0,Ki=performance.now(),qi=!0;window.addEventListener(`wheel`,e=>{if(e.preventDefault(),qi){$=0;return}let t=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*window.innerHeight:e.deltaY;$+=t*Gi},{passive:!1}),window.addEventListener(`touchstart`,()=>{$=0},{passive:!0}),window.addEventListener(`touchmove`,e=>{qi&&e.preventDefault()},{passive:!1}),window.addEventListener(`keydown`,e=>{qi&&[`ArrowDown`,`ArrowUp`,`PageDown`,`PageUp`,`Home`,`End`,` `,`Spacebar`].includes(e.key)&&(e.preventDefault(),$=0)},{passive:!1});function Ji(e){let t=Math.min(4,(e-Ki)/1e3*60);if(Ki=e,Math.abs($)<.1){$=0;return}let n=document.documentElement.scrollHeight-window.innerHeight;if(n<=0){$=0;return}let r=window.scrollY+$*t;r<0?(r=0,$=0):r>n&&(r=n,$=0),window.scrollTo(0,r),$*=Wi**+t}var Yi=0,Xi=!1,Zi=0,Qi=0,$i=0,ea=0,ta=0,na=0,ra=!1;function ia(e){let t=document.createElement(`div`);t.id=`collected-columns`;let n=document.createElement(`div`);n.className=`word-col`,n.style.color=`#ffffff`,[...e.main,...e.left,...e.right].forEach(e=>{let t=document.createElement(`div`);t.textContent=e,n.appendChild(t)}),t.appendChild(n);let r=document.createElement(`div`);r.className=`marquee-container`;let i=(e,t=!1)=>{let n=document.createElement(`div`);n.className=`marquee-track ${e} ${t?`reverse`:``}`;let r=()=>{let e=document.createElement(`div`);e.className=`marquee-content`;let t=()=>{let t=document.createElement(`span`);t.textContent=`•`,t.style.color=`rgba(255, 255, 255, 0.3)`,e.appendChild(t)};return(n=>{n.forEach(n=>{let r=document.createElement(`span`);r.textContent=n,r.style.color=`#ffffff`,e.appendChild(r),t()})})(ln),e};return n.appendChild(r()),n.appendChild(r()),n};r.appendChild(i(`track-large`)),r.appendChild(i(`track-small`,!0)),r.appendChild(i(`track-small`)),t.appendChild(r),document.body.appendChild(t),qi=!1}function aa(e){requestAnimationFrame(aa),Ji(e),ga(e),Z.clearRect(0,0,hi,gi),Q.draw(Z,e),document.documentElement.style.setProperty(`--tip-color`,Q.getCurrentTipColor(e));let t=document.documentElement.scrollHeight-window.innerHeight,n=t>0?fa(window.scrollY/t):0,r=Ci.getKeyframes(),i=r.length>=2?r[1].at:1;ua(i>1e-6?fa(n/i):1),Oi(),Ii(),Ui(),Q.isInProgressEyeHovered()&&!Xi&&(Xi=!0,Yi=11),Yi>0?(Yi--,document.body.style.filter=Yi%2==0?`invert(100%)`:`none`):document.body.style.filter=`none`}var oa=document.getElementById(`name`),sa=``,ca=``,la=-1;function ua(e){if(!oa)return;let t=_i.getParams(),n=t.text+`|`+t.fontFamily+`|`+t.fontSize+`|`+t.fontWeight+`|`+t.letterSpacing+`|`+t.cxFrac+`|`+t.cyFrac+`|`+t.scaleX+`|`+t.scaleY;n!==sa&&(oa.textContent=t.text,oa.style.font=`${t.fontWeight} ${t.fontSize}px ${t.fontFamily}`,oa.style.letterSpacing=`${t.letterSpacing}px`,oa.style.left=`${t.cxFrac*100}vw`,oa.style.top=`${t.cyFrac*100}vh`,oa.style.transform=`translate(-50%, -50%) scale(${t.scaleX}, ${t.scaleY})`,sa=n),e!==la&&(oa.style.opacity=e.toFixed(3),la=e),t.color!==ca&&(oa.style.color=t.color,ca=t.color)}requestAnimationFrame(aa),window.addEventListener(`pointermove`,e=>{Q.setCursor(e.clientX,e.clientY,!0)});var da=()=>Q.setCursor(0,0,!1);window.addEventListener(`pointercancel`,da),window.addEventListener(`blur`,da),document.addEventListener(`mouseleave`,da),window.addEventListener(`pointerup`,e=>{e.pointerType===`touch`&&da()});function fa(e){return e<0?0:e>1?1:e}function pa(e){return e*e*(3-2*e)}var ma=2500,ha=-1;function ga(e){let t=document.documentElement.scrollHeight-window.innerHeight,n=fa(t>0?window.scrollY/t:0),r=oi(n),i=Ci.getKeyframes();if(i.length>0){let e=0,t=Math.abs(i[0].at-n);for(let r=1;r<i.length;r++){let a=Math.abs(i[r].at-n);a<t&&(e=r,t=a)}e!==Ci.getActiveIndex()&&Ci.setActiveIndex(e)}let a=Ci.getKeyframes();if(a.length<2)return;let o=0;for(;o<a.length-1&&a[o+1].at<r;)o++;let s=a[o],c=a[Math.min(o+1,a.length-1)],l=c.at-s.at,u=l>1e-6?fa((r-s.at)/l):0,d={};for(let e of Xn){let t=s.params[e];d[e]=t+(c.params[e]-t)*u}ha<0&&(ha=e);let f=fa((e-ha)/ma);if(f<1){let e=d.flameRadialReach??0;d.flameRadialReach=pa(f)*e}let p=ha>=0?(e-ha)/ma:0,m=fa((p-.8)*1.25);m=pa(m);let h=1.2,g=1+(h+1)*(m-1)**3+h*(m-1)**2,_=m>0?g:0,v=fa((p-1.2)*1.66);v=pa(v);let y=Q.getCollectedWords();y.main.length>=5&&(Zi=1),y.left.length>=5&&(ea=1),$i+=(Zi-Qi)*.06,$i*=.82,Qi+=$i,na+=(ea-ta)*.06,na*=.82,ta+=na;let b=_*Math.max(0,Qi),x=_*Math.max(0,ta);Q.setCenterRepels(yi,xi,Si,_,v,b,x),y.right.length>=5&&!ra&&(ra=!0,setTimeout(()=>{ia(y)},400)),Q.setParams(d)}