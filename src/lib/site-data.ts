// Keep all business-specific content here. Replace nulls and sample entries with verified details before launch.
export const site = {
  name: "Bioker Kozmetika",
  practitioner: "Szidónika",
  city: "Pécs",
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
  instagram: null as string | null,
  facebook: null as string | null,
  services: [
    { number: "01", title: "Arckezelések", description: "Egy kis idő, ami csak rólad és a bőröd igényeiről szól. Személyre szabott gondoskodás minden alkalommal.", detail: "Személyre szabott ápolás" },
    { number: "02", title: "Bőrmegújító rituálék", description: "Tudatos törődés, finom érintések és egy nyugodt pillanat a mindennapok forgatagában.", detail: "Feltöltődés kívül-belül" },
    { number: "03", title: "Szemöldök & szempilla", description: "Apró részletek, amelyek természetesen emelik ki az arcod karakterét és szépségét.", detail: "Természetes harmónia" },
  ],
  prices: [
    { category: "Arckezelések", items: ["Személyre szabott arckezelés", "Hidratáló arckezelés", "Tisztító arckezelés"] },
    { category: "Kiegészítő kezelések", items: ["Szemöldökformázás", "Szemöldök- és szempillafestés", "Arcápolási konzultáció"] },
  ],
  // Sample copy, not attributed to real clients. Replace with consented, genuine reviews.
  testimonials: [
    { quote: "Egy nyugodt pillanat, amikor végre csak magamra figyelhetek.", name: "Minta vélemény" },
    { quote: "A személyes figyelem az, ami igazán különlegessé teszi az élményt.", name: "Minta vélemény" },
    { quote: "Itt a szépségápolás valóban a feltöltődésről is szól.", name: "Minta vélemény" },
  ],
};