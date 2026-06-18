import { mutation } from "./_generated/server";

/**
 * MASYWNY SEED DATA - 10 artykułów dla każdej kategorii
 *
 * Sport (10) + Polityka (10) + Inwestycje (10) + Nasze Działania (10) = 40 artykułów
 *
 * Uruchom: bunx convex run seedCategoryData:seedAll
 */

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const ids: Record<string, string[]> = { sport: [], polityka: [], inwestycje: [], nasze_dzialania: [] };

    // ========== SPORT (10 artykułów) ==========

    // Sport 1: Zawisza vs Lech
    ids.sport.push(await ctx.db.insert("articles", {
      title: "Zawisza Bydgoszcz wygrywa z Lechem Poznań 2:1! Niesamowity mecz",
      excerpt: "Historyczne zwycięstwo Zawiszy nad Lechem! Adam Kowalski bohaterem spotkania z dwiema bramkami.",
      content: `<p>W niedzielny wieczór na stadionie przy ulicy Sportowej w Bydgoszczy rozegrano jedno z najciekawszych spotkań tej kolejki. Zawisza Bydgoszcz pokonała Lecha Poznań 2:1.</p>`,
      category: "sport",
      author: "Piotr Sportowy",
      publishedAt: timestamp - 86400000 * 0,
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=600&fit=crop",
      sport: {
        enabled: true,
        sportType: "pilka_nozna",
        isMatchReport: true,
        matchDate: new Date(timestamp - 86400000).toISOString(),
        matchLocation: "Stadion przy ul. Sportowej, Bydgoszcz",
        league: "PKO Ekstraklasa",
        round: "15. kolejka",
        homeTeam: { id: "zawisza", name: "Zawisza Bydgoszcz", shortName: "Zawisza", color: "#FF0000", type: "home" as const },
        awayTeam: { id: "lech", name: "Lech Poznań", shortName: "Lech", color: "#1E40AF", type: "away" as const },
        homeScore: "2",
        awayScore: "1",
        matchStatus: "zakonczony",
        matchStats: [
          { label: "Posiadanie piłki", homeValue: "58", awayValue: "42" },
          { label: "Strzały celne", homeValue: "7", awayValue: "4" },
        ],
        matchHighlights: ["23' - Gol! Adam Kowalski", "52' - Wyrównanie! Jakub Nowak", "78' - Zwycięska bramka!"],
        styleVariant: "dynamic",
      },
    }));

    // Sport 2-10 (różne sporty i raporty)
    const sportArticles = [
      { title: "Sparta Bydgoszcz remisuje z Motorem Lublin 1:1", sport: "zuzel", score: "45:45" },
      { title: "Astoria Bydgoszcz wygrywa turniej w Pile!", sport: "siatkowka", score: "3:1" },
      { title: "Derby Bydgoszczy: Polonia vs Chemik 3:0", sport: "pilka_nozna", score: "3:0" },
      { title: "Sparta kontra Falubaz - emocjonujący finał!", sport: "zuzel", score: "47:43" },
      { title: "Zawisza U19 pokonuje Wisłę Kraków 4:2", sport: "pilka_nozna", score: "4:2" },
      { title: "Astoria awansuje do finału siatkarskiej ligi!", sport: "siatkowka", score: "3:2" },
      { title: "Polonia Bydgoszcz zdobywa Puchar Regionu", sport: "pilka_nozna", score: "2:0" },
      { title: "Sparta walczy o pozostanie w lidze żużlowej", sport: "zuzel", score: "41:49" },
    ];

    for (let i = 0; i < sportArticles.length; i++) {
      const s = sportArticles[i];
      ids.sport.push(await ctx.db.insert("articles", {
        title: s.title,
        excerpt: `Relacja z ${s.sport === "zuzel" ? "zawodów żużlowych" : s.sport === "siatkowka" ? "meczu siatkarskiego" : "meczu piłkarskiego"}.`,
        content: `<p>Emocjonujące spotkanie zakończone wynikiem ${s.score}.</p>`,
        category: "sport",
        author: "Piotr Sportowy",
        publishedAt: timestamp - 86400000 * (i + 1),
        status: "published",
        imageUrl: `https://images.unsplash.com/photo-${1506003200000 + i}?w=1200&h=600&fit=crop`,
        sport: {
          enabled: true,
          sportType: s.sport as any,
          isMatchReport: true,
          homeTeam: { id: "team1", name: "Drużyna Gospodarzy", shortName: "DG", color: "#0000FF", type: "home" as const },
          awayTeam: { id: "team2", name: "Drużyna Gości", shortName: "DG", color: "#00FF00", type: "away" as const },
          homeScore: s.score.split(":")[0],
          awayScore: s.score.split(":")[1],
          matchStatus: "zakonczony",
          styleVariant: "dynamic",
        },
      }));
    }

    // ========== POLITYKA (10 artykułów) ==========

    ids.polityka.push(await ctx.db.insert("articles", {
      title: "Prezydent Bydgoszczy zapowiada nowe inwestycje w infrastrukturę",
      excerpt: "Podczas konferencji prasowej prezydent przedstawił plan rozwoju komunikacji miejskiej.",
      content: `<p>Prezydent Rafał Bruski podczas dzisiejszej konferencji prasowej przedstawił ambitny plan rozwoju infrastruktury transportowej w mieście.</p>`,
      category: "polityka",
      author: "Maria Polityczna",
      publishedAt: timestamp - 86400000 * 0,
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&h=600&fit=crop",
      politics: {
        enabled: true,
        politicians: [{
          id: "bruski",
          fullName: "Rafał Bruski",
          party: "Koalicja Obywatelska",
          position: "Prezydent Bydgoszczy",
        }],
        politicalContext: "Rozwój infrastruktury jest kluczowym elementem programu wyborczego obecnego prezydenta.",
        styleVariant: "editorial",
      },
    }));

    const politicsArticles = [
      "Rada Miasta uchwaliła budżet na 2024 rok",
      "Debata o przyszłości transportu publicznego w Bydgoszczy",
      "Prezydent spotyka się z mieszkańcami Fordonu",
      "Nowy radny w Radzie Miasta Bydgoszczy",
      "Komisja Rewizyjna bada sprawę inwestycji",
      "Politycy dyskutują o rewitalizacji śródmieścia",
      "Sesja nadzwyczajna Rady Miasta ws. ochrony środowiska",
      "Nowe regulacje dotyczące czystości miasta",
      "Debata o przyszłości edukacji w Bydgoszczy",
    ];

    for (let i = 0; i < politicsArticles.length; i++) {
      ids.polityka.push(await ctx.db.insert("articles", {
        title: politicsArticles[i],
        excerpt: "Najnowsze informacje z życia politycznego Bydgoszczy.",
        content: `<p>Artykuł o wydarzeniach politycznych w mieście.</p>`,
        category: "polityka",
        author: "Maria Polityczna",
        publishedAt: timestamp - 86400000 * (i + 1),
        status: "published",
        imageUrl: `https://images.unsplash.com/photo-${1555421680000 + i * 1000}?w=1200&h=600&fit=crop`,
        politics: {
          enabled: true,
          politicians: [{
            id: `politician${i}`,
            fullName: `Polityk ${i + 1}`,
            party: i % 2 === 0 ? "Koalicja Obywatelska" : "Prawo i Sprawiedliwość",
            position: "Radny Miejski",
          }],
          styleVariant: "editorial",
        },
      }));
    }

    // ========== INWESTYCJE (10 artykułów) ==========

    ids.inwestycje.push(await ctx.db.insert("articles", {
      title: "Modernizacja Mostu Uniwersyteckiego w 65% ukończona",
      excerpt: "Remont Mostu Uniwersyteckiego postępuje zgodnie z planem.",
      content: `<p>Most Uniwersytecki przechodzi kompleksową modernizację.</p>`,
      category: "inwestycje",
      author: "Tomasz Inwestycyjny",
      publishedAt: timestamp - 86400000 * 0,
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=600&fit=crop",
      investment: {
        enabled: true,
        projectName: "Modernizacja Mostu Uniwersyteckiego",
        projectStatus: "w_trakcie",
        location: "Most Uniwersytecki, Bydgoszcz",
        progressPercent: 65,
        budget: "45 000 000 zł",
        contractor: "Mosty Sp. z o.o.",
        styleVariant: "technical",
      },
    }));

    const investmentProjects = [
      { name: "Budowa nowej linii tramwajowej", status: "w_trakcie", progress: 45 },
      { name: "Remont ulicy Gdańskiej", status: "w_trakcie", progress: 80 },
      { name: "Modernizacja dworca PKP", status: "planowana", progress: 0 },
      { name: "Przebudowa Ronda Grunwaldzkiego", status: "w_trakcie", progress: 30 },
      { name: "Budowa centrum przesiadkowego", status: "planowana", progress: 0 },
      { name: "Rewitalizacja Starego Rynku", status: "zakonczona", progress: 100 },
      { name: "Budowa parkingu przy ul. Jagiellońskiej", status: "w_trakcie", progress: 55 },
      { name: "Modernizacja oświetlenia ulic", status: "zakonczona", progress: 100 },
      { name: "Budowa ścieżki rowerowej nad Brdą", status: "w_trakcie", progress: 70 },
    ];

    for (let i = 0; i < investmentProjects.length; i++) {
      const inv = investmentProjects[i];
      ids.inwestycje.push(await ctx.db.insert("articles", {
        title: inv.name,
        excerpt: `Inwestycja miejska: ${inv.name}`,
        content: `<p>Projekt ${inv.name} jest obecnie w fazie ${inv.status}.</p>`,
        category: "inwestycje",
        author: "Tomasz Inwestycyjny",
        publishedAt: timestamp - 86400000 * (i + 1),
        status: "published",
        imageUrl: `https://images.unsplash.com/photo-${1513828580000 + i * 10000}?w=1200&h=600&fit=crop`,
        investment: {
          enabled: true,
          projectName: inv.name,
          projectStatus: inv.status as any,
          location: "Bydgoszcz",
          progressPercent: inv.progress,
          styleVariant: "technical",
        },
      }));
    }

    // ========== NASZE DZIAŁANIA (10 artykułów) ==========

    ids.nasze_dzialania.push(await ctx.db.insert("articles", {
      title: "Udana akcja 'Sprzątamy Bydgoszcz' - ponad 500 uczestników!",
      excerpt: "Wiosenna edycja akcji 'Sprzątamy Bydgoszcz' zakończyła się wielkim sukcesem.",
      content: `<p>W sobotę odbyła się wiosenna edycja akcji "Sprzątamy Bydgoszcz".</p>`,
      category: "nasze_dzialania",
      author: "Redakcja Love Bydgoszcz",
      publishedAt: timestamp - 86400000 * 0,
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=600&fit=crop",
      ourActions: {
        enabled: true,
        actionType: "akcja",
        actionStatus: "zakonczona",
        results: "Zebraliśmy 3 tony śmieci! Ponad 500 uczestników.",
        styleVariant: "storytelling",
      },
    }));

    const actionsArticles = [
      { title: "Kampania 'Poznaj Swoją Dzielnicę' - start!", type: "kampania" },
      { title: "Projekt 'Młodzi Dziennikarze' - finał!", type: "projekt" },
      { title: "Współpraca z Muzeum Okręgowym", type: "wspolpraca" },
      { title: "Akcja 'Krew dla Bydgoszczy' - wielki sukces", type: "akcja" },
      { title: "Projekt edukacyjny w szkołach podstawowych", type: "projekt" },
      { title: "Kampania społeczna 'Bezpieczny Rower'", type: "kampania" },
      { title: "Akcja charytatywna dla potrzebujących", type: "akcja" },
      { title: "Współpraca z Operą Nova", type: "wspolpraca" },
      { title: "Projekt 'Zielona Bydgoszcz' - podsumowanie", type: "projekt" },
    ];

    for (let i = 0; i < actionsArticles.length; i++) {
      const action = actionsArticles[i];
      ids.nasze_dzialania.push(await ctx.db.insert("articles", {
        title: action.title,
        excerpt: `Nasze działanie: ${action.title}`,
        content: `<p>${action.title} - relacja z wydarzenia.</p>`,
        category: "nasze_dzialania",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: timestamp - 86400000 * (i + 1),
        status: "published",
        imageUrl: `https://images.unsplash.com/photo-${1532996120000 + i * 10000}?w=1200&h=600&fit=crop`,
        ourActions: {
          enabled: true,
          actionType: action.type as any,
          actionStatus: "zakonczona",
          styleVariant: "storytelling",
        },
      }));
    }

    return {
      success: true,
      message: "Utworzono 40 artykułów (10 na kategorię)",
      ids,
      counts: {
        sport: ids.sport.length,
        polityka: ids.polityka.length,
        inwestycje: ids.inwestycje.length,
        nasze_dzialania: ids.nasze_dzialania.length,
      },
    };
  },
});
