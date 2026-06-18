import { mutation } from "./_generated/server";

export const seedAuthors = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all unique authors from articles
    const articles = await ctx.db.query("articles").collect();
    const authorNames = [...new Set(articles.map(a => a.author))];

    const sampleData = [
      {
        subtitle: "Redaktor Naczelna",
        status: "Aktywna",
        description: "Dziennikarka z wieloletnim stażem. Pasjonatka historii Bydgoszczy i lokalnej architektury. W wolnym czasie uwielbia spacery po Myślęcinku.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        isLoveBydgoszczTeam: true,
      },
      {
        subtitle: "Dziennikarz Kulturalny",
        status: "W terenie",
        description: "Zawsze tam, gdzie dzieje się coś ciekawego. Recenzent teatralny i muzyczny. Miłośnik Opery Nova i Teatru Polskiego.",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        isLoveBydgoszczTeam: true,
      },
      {
        subtitle: "Ekspert ds. Biznesu",
        status: "Aktywny",
        description: "Analizuje rynek, śledzi inwestycje i rozmawia z przedsiębiorcami. Zna Bydgoski Park Przemysłowo-Technologiczny jak własną kieszeń.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        isLoveBydgoszczTeam: false,
      },
      {
        subtitle: "Krytyk Kulinarny",
        status: "Degustuje",
        description: "Odkrywa nowe smaki na kulinarnej mapie Bydgoszczy. Od food trucków po eleganckie restauracje na Wyspie Młyńskiej.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        isLoveBydgoszczTeam: true,
      },
      {
        subtitle: "Dziennikarka Sportowa",
        status: "Na stadionie",
        description: "Żużel, lekkoatletyka, wioślarstwo - żaden sport nie ma przed nią tajemnic. Kibicuje bydgoskim drużynom od dziecka.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        isLoveBydgoszczTeam: true,
      }
    ];

    for (let i = 0; i < authorNames.length; i++) {
      const name = authorNames[i];
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const data = sampleData[i % sampleData.length];
      
      const existing = await ctx.db.query("users").withIndex("name", q => q.eq("name", name)).first();
      
      if (!existing) {
        await ctx.db.insert("users", {
          name,
          slug,
          role: "member",
          email: `${slug}@lovebydgoszcz.pl`,
          ...data,
          contactEmail: `${slug}@lovebydgoszcz.pl`,
          facebookUrl: "https://facebook.com",
          instagramUrl: "https://instagram.com",
        });
      } else {
        await ctx.db.patch(existing._id, {
          slug,
          ...data,
        });
      }
    }
    return `Successfully seeded ${authorNames.length} authors from articles.`;
  },
});
