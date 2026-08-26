import type { Storm } from "./storms";

export const activeNames: Record<string, string> = {
  DAMREY: "담레이", KOKI: "코키", NAKRI: "나크리", KROVANH: "크로반", TRASES: "트라세",
  TIANMA: "톈마", YINXING: "인싱", FENGSHEN: "펑선", DUJUAN: "두쥐안", MULAN: "무란",
  KIROGI: "기러기", GAEGURI: "개구리", KALMAEGI: "갈매기", SURIGAE: "수리개", MEARI: "메아리",
  "YUN-YEUNG": "윈욍", "DIM-SUM": "딤섬", "FUNG-WONG": "풍웡", "CHOI-WAN": "초이완", "TSING-MA": "칭마",
  KOINU: "고이누", HEBI: "헤비", KOTO: "고토", KOGUMA: "고구마", TOKAGE: "도카게",
  BOLAVEN: "볼라벤", PABUK: "파북", NOKAEN: "노카엔", CHAMPI: "참피", "ONG-MANG": "옹망",
  SANBA: "산바", WUTIP: "우딥", PENHA: "페냐", "IN-FA": "인파", MUIFA: "무이파",
  JELAWAT: "즐라왓", SEPAT: "스팟", NURI: "누리", CEMPAKA: "츰파카", MERBOK: "므르복",
  TIROU: "티로우", MUN: "문", SINLAKU: "실라코", NEPARTAK: "네파탁", NANMADOL: "난마돌",
  MALIKSI: "말릭시", DANAS: "다나스", HAGUPIT: "하구핏", LUPIT: "루핏", TALAS: "탈라스",
  GAEMI: "개미", NARI: "나리", JANGMI: "장미", MIRINAE: "미리내", HODU: "호두",
  PRAPIROON: "프라피룬", WIPHA: "위파", MEKKHALA: "메칼라", NIDA: "니다", KULAP: "꿀랍",
  MARIA: "마리아", FRANCISCO: "프란시스코", HIGOS: "히고스", OMAIS: "오마이스", ROKE: "로키",
  "SON-TINH": "손띤", "CO-MAY": "꼬마이", BAVI: "바비", "LUC-BINH": "룩빈", SONCA: "선까",
  AMPIL: "암필", KROSA: "크로사", MAYSAK: "마이삭", CHANTHU: "찬투", NESAT: "네삿",
  WUKONG: "우쿵", BAILU: "바이루", HAISHEN: "하이선", DIANMU: "뎬무", HAITANG: "하이탕",
  JONGDARI: "종다리", PODUL: "버들", NOUL: "노을", MINDULLE: "민들레", JAMJARI: "잠자리",
  SHANSHAN: "산산", LINGLING: "링링", DOLPHIN: "돌핀", LIONROCK: "라이언록", BANYAN: "바냔",
  TOMO: "도모", KAJIKI: "가지키", KUJIRA: "구지라", TOKEI: "도케이", YAMANEKO: "야마네코",
  LEEPI: "리피", NONGFA: "농파", "CHAN-HOM": "찬홈", NAMTHEUN: "남테운", PAKHAR: "파카르",
  BEBINCA: "버빙카", PEIPAH: "페이파", PEILOU: "페이러우", MALOU: "말로", SANVU: "상우",
  PULASAN: "풀라산", TAPAH: "타파", NANGKA: "낭카", NYATOH: "냐토", MAWAR: "마와르",
  SOULIK: "솔릭", MITAG: "미탁", SAUDEL: "사우델", SARBUL: "사르불", GUCHOL: "구촐",
  CIMARON: "시마론", RAGASA: "라가사", NARRA: "나라", AMUYAO: "아무야오", TALIM: "탈림",
  NARAE: "나래", NEOGURI: "너구리", GAENARI: "개나리", GOSARI: "고사리", BORI: "보리",
  BURAPHA: "부라파", BUALOI: "부알로이", ATSANI: "앗사니", CHABA: "차바", KHANUN: "카눈",
  BARIJAT: "바리자트", MATMO: "마트모", ETAU: "아타우", AERE: "에어리", LAN: "란",
  HOABAN: "호아반", HALONG: "할롱", "BANG-LANG": "방랑", SONGDA: "송다", SAOBIEN: "사오비엔",
};

// Names retired after major damage, plus older storms that Korean readers
// still search for by their Korean spelling. Kept separate from the active
// rotation above, which the Typhoon Committee still cycles through.
export const retiredNames: Record<string, string> = {
  HINNAMNOR: "힌남노", MAEMI: "매미", RUSA: "루사", NABI: "나비", EWINIAR: "에위니아",
  BILIS: "빌리스", SAOMAI: "사오마이", MORAKOT: "모라꼿", KOMPASU: "곤파스", MEGI: "메기",
  HAIYAN: "하이옌", RAMMASUN: "람마순", MERANTI: "므란티", MANGKHUT: "망쿳", YUTU: "위투",
  TRAMI: "짜미", JEBI: "제비", "KONG-REY": "콩레이", LEKIMA: "레끼마", HAGIBIS: "하기비스",
  FAXAI: "파사이", PHANFONE: "판폰", VONGFONG: "봉퐁", GONI: "고니", MOLAVE: "몰라베",
  VAMCO: "밤코", RAI: "라이", NORU: "노루", DOKSURI: "독수리", SAOLA: "사올라",
  HAIKUI: "하이쿠이", YAGI: "야기", KRATHON: "끄라톤", "MAN-YI": "마니", USAGI: "우사기",
  TEMBIN: "템빈", "KAI-TAK": "카이탁", HATO: "하토", "NOCK-TEN": "녹텐", HAIMA: "하이마",
  UTOR: "우토르", FITOW: "피토", BOPHA: "보파", WASHI: "와시", FANAPI: "파나피",
  PARMA: "파르마", KETSANA: "켓사나", DURIAN: "두리안", XANGSANE: "짱산", RUMBIA: "룸비아",
  SOUDELOR: "사우델로르", CONSON: "꼰선", MALAKAS: "말라카스", KOPPU: "코푸", MELOR: "멜로르",
  LINFA: "린파", MUJIGAE: "무지개", SOUDEL: "사우델", TIP: "팁", SARAH: "사라",
  THELMA: "셀마", JUDY: "주디", VERA: "베라", NANCY: "낸시", WINNIE: "위니",
  OLGA: "올가", YANNI: "예니", GLADYS: "글래디스", BRENDA: "브렌다", ELLIS: "엘리스",
  TORAJI: "도라지", NALGAE: "날개", "MA-ON": "마온", KAMMURI: "간무리", SARIKA: "사리까",
  SONAMU: "소나무", CHANCHU: "찬추", MATSA: "맛사", RANANIM: "라나님", TINGTING: "팅팅",
  SUDAL: "수달", KONI: "고니", IMBUDO: "임부도", PONGSONA: "봉선화", CHATAAN: "차타안",
  VAMEI: "바메이", LONGWANG: "룽왕", KAEMI: "개미", CHEBI: "제비", NOGURI: "너구리",
  "YANYAN": "얀얀", CHANGMI: "장미", VIPA: "위파", IOKE: "이오케",
};

export function displayStormName(storm: Pick<Storm, "basin" | "name">) {
  if (storm.basin !== "WP") return storm.name;
  const key = storm.name.toUpperCase();
  return activeNames[key] ?? retiredNames[key] ?? storm.name;
}
