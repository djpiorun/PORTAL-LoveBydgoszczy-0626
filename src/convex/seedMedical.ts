import { mutation } from "./_generated/server";

export const seedMedicalArticles = mutation({
  handler: async (ctx) => {
    const articles = [
      {
        title: "Nowoczesny sprzęt w bydgoskim szpitalu",
        excerpt: "Szpital Uniwersytecki nr 1 im. dr. Antoniego Jurasza w Bydgoszczy wzbogacił się o nowoczesny sprzęt do diagnostyki obrazowej. Nowy rezonans magnetyczny pozwoli na szybsze i dokładniejsze badania pacjentów.",
        content: "<p>Szpital Uniwersytecki nr 1 im. dr. Antoniego Jurasza w Bydgoszczy wzbogacił się o nowoczesny sprzęt do diagnostyki obrazowej. Nowy rezonans magnetyczny pozwoli na szybsze i dokładniejsze badania pacjentów.</p>",
        category: "medyczna" as const,
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop",
        author: "Jan Kowalski",
        publishedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        featured: true,
        tags: ["szpital", "sprzęt", "zdrowie"],
      },
      {
        title: "Bezpłatne badania profilaktyczne dla seniorów",
        excerpt: "W najbliższy weekend w Bydgoskim Centrum Targowo-Wystawienniczym odbędą się bezpłatne badania profilaktyczne dla seniorów. W programie m.in. pomiar ciśnienia, poziomu cukru we krwi oraz konsultacje ze specjalistami.",
        content: "<p>W najbliższy weekend w Bydgoskim Centrum Targowo-Wystawienniczym odbędą się bezpłatne badania profilaktyczne dla seniorów. W programie m.in. pomiar ciśnienia, poziomu cukru we krwi oraz konsultacje ze specjalistami.</p>",
        category: "medyczna" as const,
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
        author: "Anna Nowak",
        publishedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        featured: false,
        tags: ["profilaktyka", "seniorzy", "badania"],
      },
      {
        title: "Nowa przychodnia na osiedlu Fordon",
        excerpt: "Mieszkańcy największej bydgoskiej dzielnicy zyskali nowy punkt opieki zdrowotnej. Przychodnia oferuje dostęp do lekarzy pierwszego kontaktu oraz specjalistów z zakresu kardiologii i neurologii.",
        content: "<p>Mieszkańcy największej bydgoskiej dzielnicy zyskali nowy punkt opieki zdrowotnej. Przychodnia oferuje dostęp do lekarzy pierwszego kontaktu oraz specjalistów z zakresu kardiologii i neurologii.</p>",
        category: "medyczna" as const,
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
        author: "Piotr Wiśniewski",
        publishedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
        featured: false,
        tags: ["przychodnia", "fordon", "lekarze"],
      }
    ];

    for (const article of articles) {
      await ctx.db.insert("articles", article);
    }
  }
});
