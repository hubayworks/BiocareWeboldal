export const site = {
  name: "BioCare Kozmetika",
  practitioner: "Miskolczi Dominika",
  city: "Pécs",
  email: "biocarekozm@gmail.com",
  phone: "+36 30 146 9885",
  phoneHref: "tel:+36301469885",
  address: "7622 Pécs, Jókai utca 30.",
  appointmentNote: "Előre egyeztetett időpontban.",
  website: "https://www.biocarekozmetikapecs.hu/",
  instagram: "https://www.instagram.com/biocarekozm/",
  facebook: "https://www.facebook.com/profile.php?id=100094770294361&locale=hu_HU",
  pricingDates: {
    promotionStartDate: null as string | null,
    promotionEndDate: null as string | null,
    listPriceEffectiveDate: null as string | null,
  },
};

export const serviceGroups = [
  {
    number: "01",
    title: "Tisztító és prémium arckezelések",
    description: "Bőrápolás a saját igényeidre hangolva.",
    details:
      "A tini és zsíros bőrre összeállított tisztító kezelésektől a kényeztető prémium ápolásig segítek kiválasztani a bőröd számára megfelelő arckezelést. A BIOLA natúr és bio kozmetikumai, a masszázs és a választható gépi kezelések együtt teszik teljessé a nálam töltött időt.",
    services:
      "Tini arckezelés; zsíros bőr kezelése; arckezelés 1 vagy 2 gépi kezeléssel; növényi „őssejtes” prémium arckezelés; arcmasszázs.",
    priceSectionId: "prices-arckezelesek",
    image: "",
    imageAlt: "",
  },
  {
    number: "02",
    title: "Gépi bőrápolás és dekoltázskezelések",
    description: "Célzott ápolás az arc és a dekoltázs számára.",
    details:
      "Válassz hidratáló arc- és dekoltázskezelést vagy célzott gépi bőrápolást. Ultrahang, hideg-meleg bőrvasalás, tű nélküli mezoterápia és rádiófrekvencia közül, előzetes egyeztetés alapján állítjuk össze a kezelésedet. Az SOS csomagban a rádiófrekvencia és a mezoterápia együtt szerepel.",
    services:
      "Ultrahang; hideg-meleg bőrvasalás; mezoterápia; rádiófrekvencia; SOS kezelések; hidratáló és prémium arc- és dekoltázskezelések; arc- és dekoltázsmasszázs; szemránckezelés.",
    priceSectionId: "prices-kiegeszito-kezelesek",
    image: "",
    imageAlt: "",
  },
  {
    number: "03",
    title: "Alakformálás és testmasszázs",
    description: "Célzott testápolás és egy kis idő önmagadra.",
    details:
      "A 3 az 1-ben testkezelés kavitációs ultrahangot, rádiófrekvenciát és vákuumos kezelést kombinál. Hasra, combra, fenékre és csípőre önálló vagy kombinált csomagok választhatók, ötalkalmas bérletekkel is. Ha kikapcsolódásra vágysz, 60 perces teljes testmasszázzsal várlak, köpölyös kiegészítés lehetőségével.",
    services:
      "3 az 1-ben testkezelések; kombinált alakformáló csomagok; ötalkalmas testkezelési bérletek; teljes testmasszázs; köpölyös kiegészítés.",
    priceSectionId: "prices-testkezelesek",
    image: "",
    imageAlt: "",
  },
  {
    number: "04",
    title: "Gyantázás és tekintetápolás",
    description: "Apró részletek, ápolt megjelenés.",
    details:
      "Női és férfi gyantázás, szemöldökformázás, szemöldökfestés és szempillafestés egy helyen. A szemöldök- és szempillaszolgáltatások önállóan vagy arckezeléshez kapcsolva is igénybe vehetők.",
    services:
      "Női gyantázás; férfi gyantázás; szemöldökszedés; szemöldökfestés; szempillafestés; kombinált szemöldök- és szempillafestés.",
    priceSectionId: "prices-gyantazas",
    image: "",
    imageAlt: "",
  },
];

export const gifts = [
  {
    id: "arckezelesi-berlet",
    eyebrow: "Öt alkalom",
    title: "Arckezelési bérlet",
    description:
      "Tervezz előre a bőrápolással! Az öt alkalmas bérletről, az áráról és az érvényességéről érdeklődj nálam.",
    cta: "Érdeklődöm a bérletről",
    subject: "Érdeklődés arckezelési bérletről",
  },
  {
    id: "ajandekkartya",
    eyebrow: "Egy szép figyelmesség",
    title: "Ajándékkártya",
    description:
      "Ajándékozz egy kis nyugalmat! A BioCare ajándékkártya minden szolgáltatásra felhasználható.",
    cta: "Ajándékkártyát szeretnék",
    subject: "Érdeklődés ajándékkártyáról",
  },
  {
    id: "kezelesi-utalvany",
    eyebrow: "Személyre szabott ajándék",
    title: "Kezelési utalvány",
    description:
      "Válassz egy konkrét kezelést és alkalomszámot, és ajándékozd utalvány formájában! Segítek megtalálni a megfelelő szolgáltatást.",
    cta: "Segítséget kérek",
    subject: "Érdeklődés kezelési utalványról",
  },
];

export const priceCategories = [
  { id: "arckezelesek", title: "Arckezelések" },
  { id: "premium-arckezelesek", title: "Prémium arckezelések" },
  { id: "kiegeszito-kezelesek", title: "Kiegészítő kezelések" },
  { id: "arc-es-dekoltazs", title: "Arc és dekoltázs" },
  { id: "premium-arc-es-dekoltazs", title: "Prémium arc és dekoltázs" },
  { id: "arcfiatalito-kezelesek", title: "Arcfiatalító kezelések" },
  { id: "testkezelesek", title: "3IN1 zsírbontó kezelések" },
  { id: "testkezelesi-berletek", title: "3IN1 zsírbontó – 5 alkalmas bérletek" },
  { id: "gyantazas", title: "Gyantázás" },
] as const;

type PriceInput = {
  id: string;
  categoryId: (typeof priceCategories)[number]["id"];
  name: string;
  kind: "promotion" | "embedded" | "surcharge" | "pass";
  newListPrice: number;
  promotionalPrice?: number;
  includedPrice?: number | null;
};

export type PriceEntry = PriceInput;

const priceInputs: PriceInput[] = [
  { id: "tini-arckezeles-18-evig", categoryId: "arckezelesek", name: "Tini kezelés (18 éves korig)", kind: "promotion", newListPrice: 9490, promotionalPrice: 8490 },
  { id: "zsiros-bor-kezelese", categoryId: "arckezelesek", name: "Zsíros bőr kezelése + ajánlott gépi kezelés", kind: "promotion", newListPrice: 10490, promotionalPrice: 9490 },
  { id: "zsiros-bor-mezoterapiaval", categoryId: "arckezelesek", name: "Zsíros bőr + mezoterápia", kind: "promotion", newListPrice: 18490, promotionalPrice: 16490 },
  { id: "zsiros-bor-radiofrekvenciaval", categoryId: "arckezelesek", name: "Zsíros bőr + rádiófrekvencia", kind: "promotion", newListPrice: 16490, promotionalPrice: 14490 },
  { id: "arckezeles-egy-gepi-kezelessel", categoryId: "arckezelesek", name: "Arckezelés + 1 ajánlott gépi kezelés", kind: "promotion", newListPrice: 12490, promotionalPrice: 11490 },
  { id: "arckezeles-egy-gepi-mezoterapiaval", categoryId: "arckezelesek", name: "Arckezelés + 1 gépi kezelés – mezoterápia", kind: "promotion", newListPrice: 21490, promotionalPrice: 19990 },
  { id: "arckezeles-egy-gepi-radiofrekvenciaval", categoryId: "arckezelesek", name: "Arckezelés + 1 gépi kezelés – rádiófrekvencia", kind: "promotion", newListPrice: 19490, promotionalPrice: 17490 },
  { id: "arckezeles-ket-gepi-kezelessel", categoryId: "arckezelesek", name: "Arckezelés + 2 ajánlott gépi kezelés", kind: "promotion", newListPrice: 13990, promotionalPrice: 12990 },
  { id: "arckezeles-ket-gepi-mezoterapiaval", categoryId: "arckezelesek", name: "Arckezelés + 2 gépi kezelés – mezoterápia", kind: "promotion", newListPrice: 22490, promotionalPrice: 20490 },
  { id: "arckezeles-ket-gepi-radiofrekvenciaval", categoryId: "arckezelesek", name: "Arckezelés + 2 gépi kezelés – rádiófrekvencia", kind: "promotion", newListPrice: 20490, promotionalPrice: 18490 },
  { id: "arcmasszazs", categoryId: "arckezelesek", name: "Arcmasszázs", kind: "promotion", newListPrice: 6490, promotionalPrice: 5990 },
  { id: "arcmasszazs-ultrahanggal", categoryId: "arckezelesek", name: "Arcmasszázs + ultrahang", kind: "promotion", newListPrice: 9490, promotionalPrice: 8990 },
  { id: "arcmasszazs-mezoterapiaval", categoryId: "arckezelesek", name: "Arcmasszázs + mezoterápia", kind: "promotion", newListPrice: 16490, promotionalPrice: 14990 },
  { id: "arcmasszazs-radiofrekvenciaval", categoryId: "arckezelesek", name: "Arcmasszázs + rádiófrekvencia", kind: "promotion", newListPrice: 13490, promotionalPrice: 11990 },

  { id: "novenyi-ossejtes-arckezeles-ket-gepi-kezelessel", categoryId: "premium-arckezelesek", name: "Bőrfeltöltő „őssejt” kezelés + ajánlott 2 gépi kezelés", kind: "promotion", newListPrice: 14990, promotionalPrice: 13490 },
  { id: "novenyi-ossejtes-arckezeles-mezoterapiaval", categoryId: "premium-arckezelesek", name: "Bőrfeltöltő „őssejt” kezelés + mezoterápia", kind: "promotion", newListPrice: 22490, promotionalPrice: 21450 },
  { id: "novenyi-ossejtes-arckezeles-radiofrekvenciaval", categoryId: "premium-arckezelesek", name: "Bőrfeltöltő „őssejt” kezelés + rádiófrekvencia", kind: "promotion", newListPrice: 20990, promotionalPrice: 19490 },
  { id: "nyomkodas-felara-premium-arckezeles", categoryId: "premium-arckezelesek", name: "Nyomkodás", kind: "surcharge", newListPrice: 1000 },

  { id: "szemoldokszedes", categoryId: "kiegeszito-kezelesek", name: "Szemöldökszedés", kind: "embedded", newListPrice: 1790, includedPrice: 500 },
  { id: "szemoldokfestes", categoryId: "kiegeszito-kezelesek", name: "Szemöldökfestés", kind: "embedded", newListPrice: 2290, includedPrice: 1500 },
  { id: "szempillafestes", categoryId: "kiegeszito-kezelesek", name: "Szempillafestés", kind: "embedded", newListPrice: 2290, includedPrice: 1700 },
  { id: "szemoldok-es-szempillafestes", categoryId: "kiegeszito-kezelesek", name: "Szemöldök + szempillafestés", kind: "embedded", newListPrice: 3990, includedPrice: 2500 },
  { id: "szemrankezeles", categoryId: "kiegeszito-kezelesek", name: "Szemránckezelés", kind: "embedded", newListPrice: 5990, includedPrice: 2500 },
  { id: "arc-ultrahangos-kezelese", categoryId: "kiegeszito-kezelesek", name: "Arc ultrahang", kind: "embedded", newListPrice: 6990, includedPrice: null },
  { id: "hideg-meleg-borvasalas", categoryId: "kiegeszito-kezelesek", name: "Hideg-meleg vasaló", kind: "embedded", newListPrice: 6990, includedPrice: null },
  { id: "mezoterapia-onallo-kiegeszito", categoryId: "kiegeszito-kezelesek", name: "Mezoterápia", kind: "embedded", newListPrice: 13990, includedPrice: 7000 },
  { id: "radiofrekvencia-onallo-kiegeszito", categoryId: "kiegeszito-kezelesek", name: "Rádiófrekvenciás arcfiatalítás", kind: "embedded", newListPrice: 8990, includedPrice: 5400 },

  { id: "hidratelo-taplalo-arc-dekoltazs", categoryId: "arc-es-dekoltazs", name: "Hidratáló-tápláló arc + dekoltázs", kind: "promotion", newListPrice: 16490, promotionalPrice: 15490 },
  { id: "hidratelo-taplalo-arc-dekoltazs-nyomkodassal", categoryId: "arc-es-dekoltazs", name: "Hidratáló-tápláló arc + dekoltázs – nyomkodással", kind: "promotion", newListPrice: 17490, promotionalPrice: 16490 },
  { id: "hidratelo-taplalo-arc-dekoltazs-mezoterapiaval", categoryId: "arc-es-dekoltazs", name: "Hidratáló-tápláló arc + dekoltázs – mezoterápiával", kind: "promotion", newListPrice: 22990, promotionalPrice: 21490 },
  { id: "hidratelo-taplalo-arc-dekoltazs-radiofrekvenciaval", categoryId: "arc-es-dekoltazs", name: "Hidratáló-tápláló arc + dekoltázs – rádiófrekvenciával", kind: "promotion", newListPrice: 21990, promotionalPrice: 20490 },
  { id: "arc-dekoltazs-harom-gepi-kezelessel", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs + 3 gépi kezelés", kind: "promotion", newListPrice: 16490, promotionalPrice: 15490 },
  { id: "arc-dekoltazs-harom-gepi-nyomkodassal", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs + 3 gépi kezelés – nyomkodással", kind: "promotion", newListPrice: 17490, promotionalPrice: 16490 },
  { id: "arc-dekoltazs-harom-gepi-mezoterapiaval", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs + 3 gépi kezelés – mezoterápiával", kind: "promotion", newListPrice: 23990, promotionalPrice: 22490 },
  { id: "arc-dekoltazs-harom-gepi-radiofrekvenciaval", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs + 3 gépi kezelés – rádiófrekvenciával", kind: "promotion", newListPrice: 21990, promotionalPrice: 20490 },
  { id: "arc-dekoltazsmasszazs", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs masszázs", kind: "promotion", newListPrice: 7990, promotionalPrice: 7490 },
  { id: "arc-dekoltazsmasszazs-ultrahanggal", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs masszázs – ultrahanggal", kind: "promotion", newListPrice: 10990, promotionalPrice: 9990 },
  { id: "arc-dekoltazsmasszazs-mezoterapiaval", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs masszázs – mezoterápiával", kind: "promotion", newListPrice: 16990, promotionalPrice: 15990 },
  { id: "arc-dekoltazsmasszazs-radiofrekvenciaval", categoryId: "arc-es-dekoltazs", name: "Arc + dekoltázs masszázs – rádiófrekvenciával", kind: "promotion", newListPrice: 14990, promotionalPrice: 13990 },

  { id: "novenyi-ossejtes-arc-dekoltazs-harom-gepi-kezelessel", categoryId: "premium-arc-es-dekoltazs", name: "Bőrfeltöltő „őssejt” kezelés arc + dekoltázs + ajánlott 3 gépi kezelés", kind: "promotion", newListPrice: 17990, promotionalPrice: 16490 },
  { id: "novenyi-ossejtes-arc-dekoltazs-mezoterapiaval", categoryId: "premium-arc-es-dekoltazs", name: "Bőrfeltöltő „őssejt” arc + dekoltázs kezelés – mezoterápiával", kind: "promotion", newListPrice: 25490, promotionalPrice: 23990 },
  { id: "novenyi-ossejtes-arc-dekoltazs-radiofrekvenciaval", categoryId: "premium-arc-es-dekoltazs", name: "Bőrfeltöltő „őssejt” arc + dekoltázs kezelés – rádiófrekvenciával", kind: "promotion", newListPrice: 23490, promotionalPrice: 21990 },
  { id: "nyomkodas-felara-premium-dekoltazs", categoryId: "premium-arc-es-dekoltazs", name: "Nyomkodás", kind: "surcharge", newListPrice: 1000 },

  { id: "mezoterapias-arcfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "Mezoterápiás arcfiatalítás", kind: "promotion", newListPrice: 13490, promotionalPrice: 12490 },
  { id: "mezoterapias-arc-dekoltazsfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "Mezoterápiás arc + dekoltázs fiatalítás", kind: "promotion", newListPrice: 16490, promotionalPrice: 15490 },
  { id: "radiofrekvencias-arcfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "Rádiófrekvenciás arcfiatalítás", kind: "promotion", newListPrice: 7990, promotionalPrice: 7490 },
  { id: "radiofrekvencias-arc-dekoltazsfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "Rádiófrekvenciás arc + dekoltázs fiatalítás", kind: "promotion", newListPrice: 10990, promotionalPrice: 10490 },
  { id: "sos-arcfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "SOS arcfiatalítás", kind: "promotion", newListPrice: 25990, promotionalPrice: 19990 },
  { id: "sos-arc-es-dekoltazsfiatalitas", categoryId: "arcfiatalito-kezelesek", name: "SOS arc + dekoltázs fiatalítás", kind: "promotion", newListPrice: 27990, promotionalPrice: 21990 },

  { id: "has-egy-alkalom", categoryId: "testkezelesek", name: "Has – 1 alkalom", kind: "promotion", newListPrice: 9990, promotionalPrice: 9490 },
  { id: "comb-egy-oldal-egy-alkalom", categoryId: "testkezelesek", name: "Comb – 1 oldal – 1 alkalom", kind: "promotion", newListPrice: 14490, promotionalPrice: 13490 },
  { id: "fenek-egy-alkalom", categoryId: "testkezelesek", name: "Fenék – 1 alkalom", kind: "promotion", newListPrice: 9990, promotionalPrice: 9490 },
  { id: "csipo-egy-alkalom", categoryId: "testkezelesek", name: "Csípő – 1 alkalom", kind: "promotion", newListPrice: 9990, promotionalPrice: 9490 },
  { id: "fenek-comb-hatso-egy-alkalom", categoryId: "testkezelesek", name: "Fenék + comb hátul", kind: "promotion", newListPrice: 15490, promotionalPrice: 14490 },
  { id: "has-csipo-egy-alkalom", categoryId: "testkezelesek", name: "Has + csípő", kind: "promotion", newListPrice: 16490, promotionalPrice: 15490 },
  { id: "has-comb-egy-alkalom", categoryId: "testkezelesek", name: "Has + comb – elöl vagy hátul", kind: "promotion", newListPrice: 16490, promotionalPrice: 15490 },

  { id: "has-vagy-hat-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Has vagy hát – 5 alkalom", kind: "pass", newListPrice: 49950, promotionalPrice: 42990 },
  { id: "comb-egy-oldal-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Comb – 1 oldal – 5 alkalom", kind: "pass", newListPrice: 72450, promotionalPrice: 62990 },
  { id: "fenek-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Fenék – 5 alkalom", kind: "pass", newListPrice: 49950, promotionalPrice: 42990 },
  { id: "csipo-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Csípő – 5 alkalom", kind: "pass", newListPrice: 49950, promotionalPrice: 42990 },
  { id: "fenek-comb-hatso-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Fenék + comb hátul – 5 alkalom", kind: "pass", newListPrice: 77450, promotionalPrice: 67990 },
  { id: "has-csipo-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Has + csípő – 5 alkalom", kind: "pass", newListPrice: 82450, promotionalPrice: 71990 },
  { id: "has-comb-ot-alkalom", categoryId: "testkezelesi-berletek", name: "Has + comb – 5 alkalom", kind: "pass", newListPrice: 82450, promotionalPrice: 71990 },

  { id: "bajusz-gyantazas", categoryId: "gyantazas", name: "Bajusz", kind: "promotion", newListPrice: 1190, promotionalPrice: 1090 },
  { id: "teljes-lab-gyantazas", categoryId: "gyantazas", name: "Láb teljes", kind: "promotion", newListPrice: 5990, promotionalPrice: 5590 },
  { id: "comb-gyantazas", categoryId: "gyantazas", name: "Comb", kind: "promotion", newListPrice: 3490, promotionalPrice: 3190 },
  { id: "lab-terdig-gyantazas", categoryId: "gyantazas", name: "Láb térdig", kind: "promotion", newListPrice: 2990, promotionalPrice: 2790 },
  { id: "has-gyantazas", categoryId: "gyantazas", name: "Has", kind: "promotion", newListPrice: 2490, promotionalPrice: 2190 },
  { id: "teljes-kar-gyantazas", categoryId: "gyantazas", name: "Teljes kar", kind: "promotion", newListPrice: 2990, promotionalPrice: 2690 },
  { id: "alkar-gyantazas", categoryId: "gyantazas", name: "Alkar", kind: "promotion", newListPrice: 2290, promotionalPrice: 2090 },
  { id: "honaly-gyantazas", categoryId: "gyantazas", name: "Hónalj", kind: "promotion", newListPrice: 1790, promotionalPrice: 1590 },
  { id: "bikinivonal-gyantazas", categoryId: "gyantazas", name: "Bikini vonal", kind: "promotion", newListPrice: 2290, promotionalPrice: 2090 },
  { id: "fazon-gyantazas", categoryId: "gyantazas", name: "Fazon – nem intim", kind: "promotion", newListPrice: 3990, promotionalPrice: 3590 },
  { id: "has-mellkas-hat-uraknak", categoryId: "gyantazas", name: "Has / mellkas / hát – uraknak", kind: "promotion", newListPrice: 3990, promotionalPrice: 3690 },
  { id: "has-mellkas-hat-uraknak-egyutt", categoryId: "gyantazas", name: "Has + mellkas + hát – uraknak", kind: "promotion", newListPrice: 6990, promotionalPrice: 6590 },
];

export const prices: PriceEntry[] = priceInputs;

export const featuredPriceIds = [
  "tini-arckezeles-18-evig",
  "arckezeles-egy-gepi-kezelessel",
  "sos-arcfiatalitas",
] as const;

export const featuredPrices = featuredPriceIds.map((id) =>
  prices.find((price) => price.id === id)!,
);