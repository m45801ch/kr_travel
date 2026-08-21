export type WorldCity = {
  name: string
  query: string
}

export type WorldCountry = {
  code: string
  name: string
  cities: WorldCity[]
}

const city = (name: string, query = name): WorldCity => ({ name, query })

const CITIES_BY_COUNTRY: Record<string, WorldCity[]> = {
  AF: [city('喀布爾', 'Kabul')], AL: [city('地拉那', 'Tirana')], DZ: [city('阿爾及爾', 'Algiers')], AD: [city('安道爾城', 'Andorra la Vella')], AO: [city('羅安達', 'Luanda')], AG: [city('聖約翰斯', "Saint John's")], AR: [city('布宜諾斯艾利斯', 'Buenos Aires')], AM: [city('葉里溫', 'Yerevan')], AU: [city('坎培拉', 'Canberra'), city('雪梨', 'Sydney'), city('墨爾本', 'Melbourne')], AT: [city('維也納', 'Vienna')], AZ: [city('巴庫', 'Baku')],
  BS: [city('拿騷', 'Nassau')], BH: [city('麥納麥', 'Manama')], BD: [city('達卡', 'Dhaka')], BB: [city('布里奇敦', 'Bridgetown')], BY: [city('明斯克', 'Minsk')], BE: [city('布魯塞爾', 'Brussels')], BZ: [city('貝爾墨潘', 'Belmopan')], BJ: [city('波多諾伏', 'Porto-Novo'), city('科托努', 'Cotonou')], BT: [city('廷布', 'Thimphu')], BO: [city('蘇克雷', 'Sucre'), city('拉巴斯', 'La Paz')], BA: [city('塞拉耶佛', 'Sarajevo')], BW: [city('哈博羅內', 'Gaborone')], BR: [city('巴西利亞', 'Brasilia'), city('聖保羅', 'Sao Paulo'), city('里約熱內盧', 'Rio de Janeiro')], BN: [city('斯里巴加灣市', 'Bandar Seri Begawan')], BG: [city('索菲亞', 'Sofia')], BF: [city('瓦加杜古', 'Ouagadougou')], BI: [city('基特加', 'Gitega')],
  CV: [city('普拉亞', 'Praia')], KH: [city('金邊', 'Phnom Penh')], CM: [city('雅溫德', 'Yaounde')], CA: [city('渥太華', 'Ottawa'), city('多倫多', 'Toronto'), city('溫哥華', 'Vancouver')], CF: [city('班基', 'Bangui')], TD: [city('恩賈梅納', "N'Djamena")], CL: [city('聖地牙哥', 'Santiago')], CN: [city('北京', 'Beijing'), city('上海', 'Shanghai'), city('廣州', 'Guangzhou')], CO: [city('波哥大', 'Bogota'), city('麥德林', 'Medellin')], KM: [city('莫羅尼', 'Moroni')], CG: [city('布拉薩維爾', 'Brazzaville')], CD: [city('金沙薩', 'Kinshasa')], CR: [city('聖荷西', 'San Jose')], CI: [city('亞穆蘇克羅', 'Yamoussoukro'), city('阿比讓', 'Abidjan')], HR: [city('札格瑞布', 'Zagreb')], CU: [city('哈瓦那', 'Havana')], CY: [city('尼科西亞', 'Nicosia')], CZ: [city('布拉格', 'Prague')],
  DK: [city('哥本哈根', 'Copenhagen')], DJ: [city('吉布地', 'Djibouti')], DM: [city('羅梭', 'Roseau')], DO: [city('聖多明哥', 'Santo Domingo')], EC: [city('基多', 'Quito'), city('瓜亞基爾', 'Guayaquil')], EG: [city('開羅', 'Cairo')], SV: [city('聖薩爾瓦多', 'San Salvador')], GQ: [city('馬拉博', 'Malabo')], ER: [city('阿斯馬拉', 'Asmara')], EE: [city('塔林', 'Tallinn')], SZ: [city('姆巴巴內', 'Mbabane')], ET: [city('阿迪斯阿貝巴', 'Addis Ababa')],
  FJ: [city('蘇瓦', 'Suva')], FI: [city('赫爾辛基', 'Helsinki')], FR: [city('巴黎', 'Paris'), city('里昂', 'Lyon'), city('尼斯', 'Nice')], GA: [city('利伯維爾', 'Libreville')], GM: [city('班珠爾', 'Banjul')], GE: [city('第比利斯', 'Tbilisi')], DE: [city('柏林', 'Berlin'), city('慕尼黑', 'Munich'), city('法蘭克福', 'Frankfurt')], GH: [city('阿克拉', 'Accra')], GR: [city('雅典', 'Athens')], GD: [city('聖喬治', "Saint George's")], GT: [city('瓜地馬拉市', 'Guatemala City')], GN: [city('科納克里', 'Conakry')], GW: [city('比紹', 'Bissau')], GY: [city('喬治城', 'Georgetown')],
  HT: [city('太子港', 'Port-au-Prince')], HN: [city('特古西加爾巴', 'Tegucigalpa')], HU: [city('布達佩斯', 'Budapest')], IS: [city('雷克雅維克', 'Reykjavik')], IN: [city('新德里', 'New Delhi'), city('孟買', 'Mumbai'), city('班加羅爾', 'Bangalore')], ID: [city('雅加達', 'Jakarta'), city('登巴薩', 'Denpasar')], IR: [city('德黑蘭', 'Tehran'), city('伊斯法罕', 'Isfahan')], IQ: [city('巴格達', 'Baghdad')], IE: [city('都柏林', 'Dublin')], IL: [city('耶路撒冷', 'Jerusalem'), city('特拉維夫', 'Tel Aviv')], IT: [city('羅馬', 'Rome'), city('米蘭', 'Milan')],
  JM: [city('京斯敦', 'Kingston')], JP: [city('東京', 'Tokyo'), city('大阪', 'Osaka'), city('京都', 'Kyoto')], JO: [city('安曼', 'Amman'), city('亞喀巴', 'Aqaba')], KZ: [city('阿斯塔納', 'Astana'), city('阿拉木圖', 'Almaty')], KE: [city('奈洛比', 'Nairobi'), city('蒙巴薩', 'Mombasa')], KI: [city('塔拉瓦', 'Tarawa')], KP: [city('平壤', 'Pyongyang')], KR: [city('首爾', 'Seoul'), city('明洞', 'Seoul'), city('弘大', 'Seoul'), city('江南', 'Seoul'), city('釜山', 'Busan'), city('濟州', 'Jeju City')], KW: [city('科威特市', 'Kuwait City')], KG: [city('比斯凱克', 'Bishkek')],
  LA: [city('永珍', 'Vientiane')], LV: [city('里加', 'Riga')], LB: [city('貝魯特', 'Beirut')], LS: [city('馬塞魯', 'Maseru')], LR: [city('蒙羅維亞', 'Monrovia')], LY: [city('的黎波里', 'Tripoli')], LI: [city('瓦杜茲', 'Vaduz')], LT: [city('維爾紐斯', 'Vilnius')], LU: [city('盧森堡', 'Luxembourg')],
  MG: [city('安塔那那利佛', 'Antananarivo')], MW: [city('里朗威', 'Lilongwe')], MY: [city('吉隆坡', 'Kuala Lumpur'), city('檳城', 'George Town')], MV: [city('馬列', 'Male')], ML: [city('巴馬科', 'Bamako')], MT: [city('瓦萊塔', 'Valletta')], MH: [city('馬久羅', 'Majuro')], MR: [city('諾克少', 'Nouakchott')], MU: [city('路易士港', 'Port Louis')], MX: [city('墨西哥城', 'Mexico City'), city('坎昆', 'Cancun')], FM: [city('帕利基爾', 'Palikir')], MD: [city('基希訥烏', 'Chisinau')], MC: [city('摩納哥', 'Monaco')], MN: [city('烏蘭巴托', 'Ulaanbaatar')], ME: [city('波德里查', 'Podgorica')], MA: [city('拉巴特', 'Rabat'), city('馬拉喀什', 'Marrakesh')], MZ: [city('馬布多', 'Maputo')], MM: [city('奈比多', 'Naypyidaw'), city('仰光', 'Yangon')],
  NA: [city('溫得和克', 'Windhoek')], NR: [city('亞倫', 'Yaren')], NP: [city('加德滿都', 'Kathmandu')], NL: [city('阿姆斯特丹', 'Amsterdam'), city('鹿特丹', 'Rotterdam')], NZ: [city('威靈頓', 'Wellington'), city('奧克蘭', 'Auckland')], NI: [city('馬納瓜', 'Managua')], NE: [city('尼亞美', 'Niamey')], NG: [city('阿布加', 'Abuja'), city('拉哥斯', 'Lagos')], MK: [city('斯科普里', 'Skopje')], NO: [city('奧斯陸', 'Oslo')],
  OM: [city('馬斯喀特', 'Muscat')], PK: [city('伊斯蘭馬巴德', 'Islamabad'), city('喀拉蚩', 'Karachi'), city('拉合爾', 'Lahore')], PW: [city('梅萊凱奧克', 'Melekeok')], PA: [city('巴拿馬市', 'Panama City')], PG: [city('莫士比港', 'Port Moresby')], PY: [city('亞松森', 'Asuncion')], PE: [city('利馬', 'Lima'), city('庫斯科', 'Cusco')], PH: [city('馬尼拉', 'Manila'), city('宿霧', 'Cebu City')], PL: [city('華沙', 'Warsaw'), city('克拉科夫', 'Krakow')], PT: [city('里斯本', 'Lisbon'), city('波多', 'Porto')], QA: [city('杜哈', 'Doha')],
  RO: [city('布加勒斯特', 'Bucharest')], RU: [city('莫斯科', 'Moscow'), city('聖彼得堡', 'Saint Petersburg')], RW: [city('吉佳利', 'Kigali')], KN: [city('巴斯特爾', 'Basseterre')], LC: [city('卡斯翠', 'Castries')], VC: [city('金斯敦', 'Kingstown')], WS: [city('阿皮亞', 'Apia')], SM: [city('聖馬利諾', 'San Marino')], ST: [city('聖多美', 'Sao Tome')], SA: [city('利雅德', 'Riyadh'), city('吉達', 'Jeddah')], SN: [city('達卡', 'Dakar')], RS: [city('貝爾格勒', 'Belgrade')], SC: [city('維多利亞', 'Victoria')], SL: [city('弗里敦', 'Freetown')], SG: [city('新加坡', 'Singapore')], SK: [city('布拉提斯拉瓦', 'Bratislava')], SI: [city('盧布爾雅那', 'Ljubljana')], SB: [city('荷尼阿拉', 'Honiara')], SO: [city('摩加迪休', 'Mogadishu')], ZA: [city('普勒托利亞', 'Pretoria'), city('開普敦', 'Cape Town')], SS: [city('朱巴', 'Juba')], ES: [city('馬德里', 'Madrid'), city('巴塞隆納', 'Barcelona')], LK: [city('斯里賈亞瓦德納普拉科特', 'Sri Jayawardenepura Kotte'), city('可倫坡', 'Colombo')], SD: [city('喀土穆', 'Khartoum')], SR: [city('帕拉馬里博', 'Paramaribo')], SE: [city('斯德哥爾摩', 'Stockholm')], CH: [city('伯恩', 'Bern'), city('蘇黎世', 'Zurich')], SY: [city('大馬士革', 'Damascus')],
  TJ: [city('杜尚別', 'Dushanbe')], TZ: [city('多多馬', 'Dodoma'), city('達累斯薩拉姆', 'Dar es Salaam')], TH: [city('曼谷', 'Bangkok'), city('清邁', 'Chiang Mai'), city('普吉', 'Phuket')], TL: [city('帝力', 'Dili')], TG: [city('洛梅', 'Lome')], TO: [city('努瓜婁發', "Nuku'alofa")], TT: [city('西班牙港', 'Port of Spain')], TN: [city('突尼斯', 'Tunis')], TR: [city('安卡拉', 'Ankara'), city('伊斯坦堡', 'Istanbul')], TM: [city('阿什哈巴特', 'Ashgabat')], TV: [city('富納富提', 'Funafuti')],
  UG: [city('坎帕拉', 'Kampala')], UA: [city('基輔', 'Kyiv'), city('利沃夫', 'Lviv')], AE: [city('阿布達比', 'Abu Dhabi'), city('杜拜', 'Dubai')], GB: [city('倫敦', 'London'), city('愛丁堡', 'Edinburgh')], US: [city('華盛頓', 'Washington'), city('紐約', 'New York'), city('洛杉磯', 'Los Angeles')], UY: [city('蒙特維多', 'Montevideo')], UZ: [city('塔什干', 'Tashkent')], VU: [city('維拉港', 'Port Vila')], VA: [city('梵蒂岡', 'Vatican City')], VE: [city('卡拉卡斯', 'Caracas')], VN: [city('河內', 'Hanoi'), city('胡志明市', 'Ho Chi Minh City')], YE: [city('薩那', "Sana'a"), city('亞丁', 'Aden')], ZM: [city('路沙卡', 'Lusaka')], ZW: [city('哈拉雷', 'Harare')],
  TW: [city('台北', 'Taipei'), city('高雄', 'Kaohsiung')], HK: [city('香港', 'Hong Kong')], MO: [city('澳門', 'Macao')], PS: [city('拉姆安拉', 'Ramallah'), city('加薩', 'Gaza City')], XK: [city('普里什蒂納', 'Pristina')], PR: [city('聖胡安', 'San Juan')],
}

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  AE: '阿拉伯聯合大公國',
  GB: '英國',
  HK: '香港',
  KR: '韓國',
  MO: '澳門',
  PS: '巴勒斯坦',
  TW: '台灣',
  US: '美國',
}

const regionNames = new Intl.DisplayNames(['zh-Hant-TW', 'zh-Hant', 'zh'], { type: 'region' })

export const WORLD_COUNTRIES: WorldCountry[] = Object.entries(CITIES_BY_COUNTRY)
  .map(([code, cities]) => ({ code, name: COUNTRY_NAME_OVERRIDES[code] ?? regionNames.of(code) ?? code, cities }))
  .sort((left, right) => left.name.localeCompare(right.name, 'zh-Hant-TW'))
