// Keep all business-specific content here. Replace nulls and sample entries with verified details before launch.
export const site = {
  name: "BioCare Kozmetika",
  practitioner: "Szidónika",
  city: "Pécs",
  email: "biocarekozm@gmail.com",
  phone: "+36 30 146 9885",
  address: "7622 Pécs, Jókai utca 30.",
  website: "https://biocarekozmetikapecs.hu/",
  instagram: "https://www.instagram.com/biocarekozm/",
  facebook: null as string | null,
  tiktok: null as string | null,
  services: [
    { number: "01", title: "Arckezelések", description: "Egy kis idő, ami csak rólad és a bőröd igényeiről szól. Személyre szabott gondoskodás minden alkalommal.", detail: "Személyre szabott ápolás" },
    { number: "02", title: "Bőrmegújító rituálék", description: "Tudatos törődés, finom érintések és egy nyugodt pillanat a mindennapok forgatagában.", detail: "Feltöltődés kívül-belül" },
    { number: "03", title: "Szemöldök & szempilla", description: "Apró részletek, amelyek természetesen emelik ki az arcod karakterét és szépségét.", detail: "Természetes harmónia" },
  ],
  prices: [
    { title: "Bőrfeltöltő őssejt kezelés", description: "Látványos feltöltés és intenzív bőrmegújítás egy prémium kezelésben.", price: "19 990 Ft", previousPrice: "22 000 Ft", badge: "Kiemelt ajánlat" },
    { title: "Arckezelés + 2 gépi kezelés", detail: "Tisztítás, peeling, masszázs", description: "Teljes körű arckezelés két személyre szabott gépi kiegészítéssel.", price: "12 490 Ft", previousPrice: "15 000 Ft", priceLabel: "Promóciós ár" },
    { title: "Prémium őssejt arc és dekoltázs + 3 gépi kezelés", detail: "Tisztítás, peeling, arcmasszázs, pakolás", description: "3 gépi kezelés (lézeres ultrahang, vasalás)", price: "15 990 Ft", priceLabel: "Alap ár", priceOptions: ["Mezoterápiával: 25 990 Ft", "Rádiófrekvenciával: 23 990 Ft", "Nyomkodás: +1 000 Ft"] },
    { title: "SOS arcfiatalítás", detail: "Akció · tisztítás + peeling", description: "Rádiófrekvencia és mezoterápia a gyorsan frissebb, üdébb arcbőrért.", price: "15 990 Ft", previousPrice: "19 990 Ft", priceLabel: "Akciós ár", badge: "Akció" },
  ],
  promotionRules: [
    "A weboldalon feltüntetett promóciós árak kizárólag a promóció megjelölt időszakában, illetve az adott promócióban meghirdetett időpontokban érvényesek.",
    "A promóciós árak új vendégek számára egy alkalommal vehetők igénybe, szolgáltatásonként vagy a promóció feltételeiben meghatározott módon.",
    "A kedvezményes ár kizárólag a promóció időtartama alatt lefoglalt és igénybe vett szolgáltatásra érvényes. A promóciós ár más kedvezménnyel vagy akcióval nem vonható össze, kivéve, ha ezt a promóció külön feltételei lehetővé teszik.",
    "A szolgáltató fenntartja a jogot a promóciós ajánlatok módosítására, megszüntetésére, illetve a promóciós időszak megváltoztatására.",
    "A promóció igénybevételével a vendég elfogadja a jelen szabályzatban foglalt feltételeket.",
  ],
  // Sample copy, not attributed to real clients. Replace with consented, genuine reviews.
  testimonials: [
    { quote: "Egy nyugodt pillanat, amikor végre csak magamra figyelhetek.", name: "Minta vélemény" },
    { quote: "A személyes figyelem az, ami igazán különlegessé teszi az élményt.", name: "Minta vélemény" },
    { quote: "Itt a szépségápolás valóban a feltöltődésről is szól.", name: "Minta vélemény" },
  ],
};