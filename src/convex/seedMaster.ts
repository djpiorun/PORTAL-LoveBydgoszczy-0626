import { mutation } from "./_generated/server";

/**
 * MASTER SEED — seeds all category data, entities, and match results
 * Run from admin dashboard or: bunx convex run seedMaster:seedMasterAll
 */

export const seedMasterAll = mutation({
  args: {},
  handler: async (ctx) => {
    const ts = Date.now();
    const results: Record<string, any> = {};

    // ── 1. SPORT TEAMS ──────────────────────────────────────────────────
    const existingTeams = await ctx.db.query("sport_teams").take(1);
    if (existingTeams.length === 0) {
      const teams = [
        { name: "Zawisza Bydgoszcz", shortName: "ZAW", slug: "zawisza-bydgoszcz", sportType: "pilka_nozna" as const, league: "IV liga kujawsko-pomorska", city: "Bydgoszcz", stadium: "Stadion Zawiszy", founded: "1946", website: "https://zawisza.bydgoszcz.pl", primaryColor: "#CC0000", secondaryColor: "#FFFFFF", isActive: true },
        { name: "Chemik Bydgoszcz", shortName: "CHE", slug: "chemik-bydgoszcz", sportType: "pilka_nozna" as const, league: "IV liga kujawsko-pomorska", city: "Bydgoszcz", stadium: "Stadion Chemika", founded: "1922", primaryColor: "#003399", secondaryColor: "#FFFFFF", isActive: true },
        { name: "Sparta Bydgoszcz", shortName: "SPA", slug: "sparta-bydgoszcz", sportType: "zuzel" as const, league: "PGE Ekstraliga", city: "Bydgoszcz", stadium: "Stadion Polonii", founded: "1947", website: "https://sparta.bydgoszcz.pl", primaryColor: "#FF6600", secondaryColor: "#000000", isActive: true },
        { name: "Polonia Bydgoszcz", shortName: "POL", slug: "polonia-bydgoszcz", sportType: "zuzel" as const, league: "1. Liga Żużlowa", city: "Bydgoszcz", stadium: "Stadion Polonii", founded: "1912", primaryColor: "#000000", secondaryColor: "#FFFFFF", isActive: true },
        { name: "Łuczniczka Bydgoszcz", shortName: "ŁUC", slug: "luczniczka-bydgoszcz", sportType: "siatkowka" as const, league: "PlusLiga", city: "Bydgoszcz", stadium: "Hala Łuczniczka", founded: "1946", website: "https://luczniczka.pl", primaryColor: "#006633", secondaryColor: "#FFFFFF", isActive: true },
      ];
      for (const t of teams) await ctx.db.insert("sport_teams", t);
      results.teams = teams.length;
    } else {
      results.teams = "skipped";
    }

    // ── 2. POLITICIANS ──────────────────────────────────────────────────
    const existingPoliticians = await ctx.db.query("politicians").take(1);
    if (existingPoliticians.length === 0) {
      const politicians = [
        { fullName: "Rafał Bruski", firstName: "Rafał", lastName: "Bruski", slug: "rafal-bruski", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", party: "Koalicja Obywatelska", position: "Prezydent Bydgoszczy", bio: "Prezydent miasta Bydgoszczy od 2014 roku. Wcześniej poseł na Sejm RP. Absolwent Wydziału Prawa i Administracji UMK w Toruniu. Inicjator wielu kluczowych inwestycji miejskich, w tym modernizacji komunikacji miejskiej i rewitalizacji centrum.", facebookUrl: "https://facebook.com", websiteUrl: "https://bydgoszcz.pl", isActive: true },
        { fullName: "Anna Mackiewicz", firstName: "Anna", lastName: "Mackiewicz", slug: "anna-mackiewicz", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face", party: "Koalicja Obywatelska", position: "Przewodnicząca Rady Miasta", bio: "Przewodnicząca Rady Miasta Bydgoszczy. Aktywistka społeczna, zaangażowana w projekty ekologiczne i edukacyjne. Radna od 2018 roku.", facebookUrl: "https://facebook.com", isActive: true },
        { fullName: "Tomasz Latos", firstName: "Tomasz", lastName: "Latos", slug: "tomasz-latos", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", party: "Prawo i Sprawiedliwość", position: "Poseł na Sejm RP", bio: "Poseł na Sejm RP z okręgu bydgoskiego. Lekarz z zawodu, specjalista chirurgii. Wieloletni działacz partyjny i samorządowy.", facebookUrl: "https://facebook.com", websiteUrl: "https://sejm.gov.pl", isActive: true },
        { fullName: "Magdalena Wróblewska", firstName: "Magdalena", lastName: "Wróblewska", slug: "magdalena-wroblewska", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face", party: "Trzecia Droga", position: "Radna Miejska", bio: "Radna Rady Miasta Bydgoszczy z ramienia Trzeciej Drogi. Nauczycielka akademicka, specjalistka ds. polityki społecznej i edukacji.", facebookUrl: "https://facebook.com", isActive: true },
        { fullName: "Piotr Nowicki", firstName: "Piotr", lastName: "Nowicki", slug: "piotr-nowicki", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face", party: "Lewica", position: "Radny Miejski", bio: "Radny Rady Miasta Bydgoszczy z ramienia Lewicy. Działacz związkowy, zaangażowany w sprawy pracownicze i politykę mieszkaniową.", facebookUrl: "https://facebook.com", isActive: true },
        { fullName: "Beata Adamczyk", firstName: "Beata", lastName: "Adamczyk", slug: "beata-adamczyk", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", party: "Koalicja Obywatelska", position: "Zastępca Prezydenta", bio: "Zastępca Prezydenta Bydgoszczy ds. kultury i sportu. Absolwentka kulturoznawstwa, wieloletnia dyrektorka instytucji kultury.", websiteUrl: "https://bydgoszcz.pl", isActive: true },
        { fullName: "Marek Wiśniewski", firstName: "Marek", lastName: "Wiśniewski", slug: "marek-wisniewski", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", party: "Trzecia Droga", position: "Poseł na Sejm RP", bio: "Poseł na Sejm RP z okręgu bydgoskiego. Ekonomista, były dyrektor regionalnego oddziału banku. Specjalizuje się w polityce gospodarczej.", facebookUrl: "https://facebook.com", websiteUrl: "https://sejm.gov.pl", isActive: true },
        { fullName: "Krzysztof Kowalski", firstName: "Krzysztof", lastName: "Kowalski", slug: "krzysztof-kowalski", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", party: "Prawo i Sprawiedliwość", position: "Radny Miejski", bio: "Radny Rady Miasta Bydgoszczy. Przedsiębiorca, działacz społeczny. Zaangażowany w sprawy bezpieczeństwa i infrastruktury miejskiej.", isActive: true },
      ];
      for (const p of politicians) await ctx.db.insert("politicians", p);
      results.politicians = politicians.length;
    } else {
      results.politicians = "skipped";
    }

    // ── 3. INVESTMENTS ──────────────────────────────────────────────────
    const existingInvestments = await ctx.db.query("investments").take(1);
    if (existingInvestments.length === 0) {
      const investments = [
        { projectName: "Przebudowa ul. Fordońskiej", slug: "przebudowa-ul-fordonskiej", description: "Kompleksowa przebudowa ulicy Fordońskiej wraz z infrastrukturą towarzyszącą, ścieżkami rowerowymi i oświetleniem LED. Projekt obejmuje 4,2 km drogi.", projectStatus: "w_trakcie" as const, location: "ul. Fordońska, Bydgoszcz", startDate: "2024-03-01", endDate: "2025-06-30", budget: "45 mln zł", contractor: "Budimex S.A.", investor: "Miasto Bydgoszcz", progressPercent: 42, mainImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop", isActive: true },
        { projectName: "Nowa linia tramwajowa na Fordon", slug: "nowa-linia-tramwajowa-fordon", description: "Budowa nowej linii tramwajowej łączącej centrum miasta z dzielnicą Fordon. Projekt obejmuje 8 km nowych torów i 12 przystanków.", projectStatus: "planowana" as const, location: "Trasa: Centrum – Fordon", startDate: "2025-09-01", endDate: "2028-12-31", budget: "320 mln zł", contractor: "W trakcie przetargu", investor: "Miasto Bydgoszcz / UE", progressPercent: 8, mainImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop", isActive: true },
        { projectName: "Rewitalizacja Starego Rynku", slug: "rewitalizacja-starego-rynku", description: "Kompleksowa rewitalizacja Starego Rynku i przyległych ulic. Nowa nawierzchnia, zieleń miejska, fontanna i oświetlenie.", projectStatus: "zakonczona" as const, location: "Stary Rynek, Bydgoszcz", startDate: "2022-04-01", endDate: "2023-11-30", budget: "18 mln zł", contractor: "Strabag Sp. z o.o.", investor: "Miasto Bydgoszcz", progressPercent: 100, mainImageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=400&fit=crop", isActive: true },
        { projectName: "Centrum Przesiadkowe Bydgoszcz Główna", slug: "centrum-przesiadkowe-bydgoszcz-glowna", description: "Modernizacja węzła komunikacyjnego przy dworcu głównym. Integracja kolei, tramwajów, autobusów i rowerów miejskich.", projectStatus: "w_trakcie" as const, location: "Dworzec Bydgoszcz Główna", startDate: "2023-10-01", endDate: "2026-03-31", budget: "85 mln zł", contractor: "Konsorcjum Mota-Engil / Torpol", investor: "PKP / Miasto Bydgoszcz / UE", progressPercent: 65, mainImageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=400&fit=crop", isActive: true },
        { projectName: "Rozbudowa Szpitala Miejskiego", slug: "rozbudowa-szpitala-miejskiego", description: "Budowa nowego skrzydła szpitala miejskiego z oddziałem kardiologicznym i centrum diagnostycznym.", projectStatus: "planowana" as const, location: "ul. Szpitalna 19, Bydgoszcz", startDate: "2026-01-01", endDate: "2029-06-30", budget: "120 mln zł", contractor: "W trakcie przetargu", investor: "Miasto Bydgoszcz / NFZ", progressPercent: 5, mainImageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=400&fit=crop", isActive: true },
        { projectName: "Modernizacja Mostu Uniwersyteckiego", slug: "modernizacja-mostu-uniwersyteckiego", description: "Kompleksowa modernizacja Mostu Uniwersyteckiego — wymiana nawierzchni, wzmocnienie konstrukcji, nowe oświetlenie LED.", projectStatus: "w_trakcie" as const, location: "Most Uniwersytecki, Bydgoszcz", startDate: "2023-06-01", endDate: "2024-08-31", budget: "45 mln zł", contractor: "Mosty Sp. z o.o.", investor: "Miasto Bydgoszcz", progressPercent: 78, mainImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop", isActive: true },
      ];
      for (const inv of investments) await ctx.db.insert("investments", inv);
      results.investments = investments.length;
    } else {
      results.investments = "skipped";
    }

    // ── 4. MATCH RESULTS ────────────────────────────────────────────────
    const existingMatches = await ctx.db.query("match_results").take(1);
    if (existingMatches.length === 0) {
      const matches = [
        { homeTeamName: "Zawisza Bydgoszcz", awayTeamName: "Lech Poznań", homeScore: "2", awayScore: "1", matchDate: new Date(ts - 86400000 * 1).toISOString(), league: "IV liga kujawsko-pomorska", round: "15. kolejka", sportType: "pilka_nozna" as const, matchStatus: "zakonczony" as const },
        { homeTeamName: "Sparta Bydgoszcz", awayTeamName: "Motor Lublin", homeScore: "45", awayScore: "45", matchDate: new Date(ts - 86400000 * 2).toISOString(), league: "PGE Ekstraliga", round: "8. runda", sportType: "zuzel" as const, matchStatus: "zakonczony" as const },
        { homeTeamName: "Łuczniczka Bydgoszcz", awayTeamName: "Jastrzębski Węgiel", homeScore: "3", awayScore: "1", matchDate: new Date(ts - 86400000 * 3).toISOString(), league: "PlusLiga", round: "12. kolejka", sportType: "siatkowka" as const, matchStatus: "zakonczony" as const },
        { homeTeamName: "Chemik Bydgoszcz", awayTeamName: "Polonia Bydgoszcz", homeScore: "3", awayScore: "0", matchDate: new Date(ts - 86400000 * 4).toISOString(), league: "IV liga kujawsko-pomorska", round: "Derby Bydgoszczy", sportType: "pilka_nozna" as const, matchStatus: "zakonczony" as const },
        { homeTeamName: "Sparta Bydgoszcz", awayTeamName: "Falubaz Zielona Góra", homeScore: "47", awayScore: "43", matchDate: new Date(ts - 86400000 * 5).toISOString(), league: "PGE Ekstraliga", round: "9. runda", sportType: "zuzel" as const, matchStatus: "zakonczony" as const },
        { homeTeamName: "Zawisza Bydgoszcz", awayTeamName: "Wisła Kraków", homeScore: "1", awayScore: "1", matchDate: new Date(ts + 86400000 * 2).toISOString(), league: "IV liga kujawsko-pomorska", round: "16. kolejka", sportType: "pilka_nozna" as const, matchStatus: "zaplanowany" as const },
      ];
      for (const m of matches) await ctx.db.insert("match_results", m);
      results.matches = matches.length;
    } else {
      results.matches = "skipped";
    }

    // ── 5. SPORT ARTICLES ───────────────────────────────────────────────
    const existingSportArticles = await ctx.db.query("articles").withIndex("by_category", q => q.eq("category", "sport")).take(1);
    if (existingSportArticles.length === 0) {
      const sportArticles = [
        {
          title: "Zawisza Bydgoszcz wygrywa z Lechem Poznań 2:1! Historyczny mecz",
          excerpt: "W emocjonującym spotkaniu 15. kolejki Zawisza Bydgoszcz pokonała Lecha Poznań 2:1. Bohaterem spotkania został Adam Kowalski z dwiema bramkami.",
          content: `<p>W niedzielny wieczór na stadionie przy ulicy Sportowej w Bydgoszczy rozegrano jedno z najciekawszych spotkań tej kolejki. Zawisza Bydgoszcz podejmowała faworyzowanego Lecha Poznań, ale to gospodarze od pierwszej minuty narzucili swoje tempo gry.</p><p>W 23. minucie kapitan drużyny Adam Kowalski otworzył wynik meczu efektownym strzałem z 20 metrów. W 52. minucie Jakub Nowak wyrównał po rzucie rożnym. Jednak w 78. minucie ponownie Adam Kowalski wpisał się na listę strzelców, dając Zawiszy zwycięstwo 2:1.</p><p>Zawisza awansowała na 5. miejsce w tabeli i udowodniła, że jest poważnym kandydatem do awansu.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 0,
          featured: true,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "pilka_nozna" as const, isMatchReport: true, matchDate: new Date(ts - 86400000).toISOString(), matchLocation: "Stadion Zawiszy, Bydgoszcz", league: "IV liga kujawsko-pomorska", round: "15. kolejka", homeTeam: { id: "zawisza", name: "Zawisza Bydgoszcz", shortName: "ZAW", color: "#CC0000", type: "home" as const }, awayTeam: { id: "lech", name: "Lech Poznań", shortName: "Lech", color: "#1E40AF", type: "away" as const }, homeScore: "2", awayScore: "1", matchStatus: "zakonczony" as const, matchStats: [{ label: "Posiadanie piłki", homeValue: "58%", awayValue: "42%" }, { label: "Strzały celne", homeValue: "7", awayValue: "4" }, { label: "Faule", homeValue: "12", awayValue: "15" }], scorers: ["23' Adam Kowalski (Zawisza)", "52' Jakub Nowak (Lech)", "78' Adam Kowalski (Zawisza)"], matchHighlights: ["23' - Gol! Adam Kowalski strzela z dystansu!", "52' - Wyrównanie! Jakub Nowak po rzucie rożnym.", "78' - Zwycięska bramka! Adam Kowalski!"], styleVariant: "dynamic" as const },
        },
        {
          title: "Sparta Bydgoszcz remisuje z Motorem Lublin 45:45 — emocje do końca",
          excerpt: "Dramatyczny remis na torze w Bydgoszczy. Sparta walczyła do ostatniego biegu, ale nie zdołała przełamać Motoru.",
          content: `<p>Mecz żużlowy Sparty Bydgoszcz z Motorem Lublin zakończył się remisem 45:45. Spotkanie trzymało kibiców w napięciu do ostatniego biegu.</p><p>Najlepszym zawodnikiem Sparty był Bartosz Zmarzlik, który zdobył 14 punktów. Motor odpowiedział świetną jazdą Janusza Kołodzieja.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 1,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "zuzel" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 2).toISOString(), matchLocation: "Stadion Polonii, Bydgoszcz", league: "PGE Ekstraliga", round: "8. runda", homeTeam: { id: "sparta", name: "Sparta Bydgoszcz", shortName: "SPA", color: "#FF6600", type: "home" as const }, awayTeam: { id: "motor", name: "Motor Lublin", shortName: "Motor", color: "#003399", type: "away" as const }, homeScore: "45", awayScore: "45", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Łuczniczka Bydgoszcz pokonuje Jastrzębski Węgiel 3:1 w PlusLidze",
          excerpt: "Świetna gra siatkarek Łuczniczki! Bydgoszczanki wygrały z jednym z faworytów ligi i umocniły się na 3. miejscu tabeli.",
          content: `<p>Łuczniczka Bydgoszcz rozgromiła Jastrzębski Węgiel 3:1 w meczu PlusLigi. Siatkarki z Bydgoszczy zaprezentowały znakomitą grę w ataku i obronie.</p><p>Najlepsza zawodniczka meczu — Malwina Smarzek — zdobyła 22 punkty. Trener Jacek Nawrocki był zadowolony z postawy całego zespołu.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 2,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "siatkowka" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 3).toISOString(), matchLocation: "Hala Łuczniczka, Bydgoszcz", league: "PlusLiga", round: "12. kolejka", homeTeam: { id: "luczniczka", name: "Łuczniczka Bydgoszcz", shortName: "ŁUC", color: "#006633", type: "home" as const }, awayTeam: { id: "jastrzebski", name: "Jastrzębski Węgiel", shortName: "JW", color: "#CC0000", type: "away" as const }, homeScore: "3", awayScore: "1", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Derby Bydgoszczy: Chemik pokonuje Polonię 3:0 w emocjonującym meczu",
          excerpt: "Chemik Bydgoszcz wygrał derby z Polonią 3:0. Trzy bramki w drugiej połowie przesądziły o losach spotkania.",
          content: `<p>Derby Bydgoszczy zakończyły się zwycięstwem Chemika 3:0. Mecz był wyrównany przez pierwszą połowę, ale w drugiej Chemik zdominował rywala.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 3,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "pilka_nozna" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 4).toISOString(), matchLocation: "Stadion Chemika, Bydgoszcz", league: "IV liga kujawsko-pomorska", round: "Derby Bydgoszczy", homeTeam: { id: "chemik", name: "Chemik Bydgoszcz", shortName: "CHE", color: "#003399", type: "home" as const }, awayTeam: { id: "polonia", name: "Polonia Bydgoszcz", shortName: "POL", color: "#000000", type: "away" as const }, homeScore: "3", awayScore: "0", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Sparta Bydgoszcz wygrywa z Falubazem 47:43 i awansuje w tabeli",
          excerpt: "Sparta Bydgoszcz pokonała Falubaz Zielona Góra 47:43 i awansowała na 4. miejsce w tabeli PGE Ekstraliga.",
          content: `<p>Sparta Bydgoszcz wygrała z Falubazem Zielona Góra 47:43 w meczu PGE Ekstraliga. Kluczową rolę odegrał Bartosz Zmarzlik, który zdobył 16 punktów.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 4,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "zuzel" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 5).toISOString(), matchLocation: "Stadion Polonii, Bydgoszcz", league: "PGE Ekstraliga", round: "9. runda", homeTeam: { id: "sparta", name: "Sparta Bydgoszcz", shortName: "SPA", color: "#FF6600", type: "home" as const }, awayTeam: { id: "falubaz", name: "Falubaz Zielona Góra", shortName: "FAL", color: "#009900", type: "away" as const }, homeScore: "47", awayScore: "43", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Zawisza U19 pokonuje Wisłę Kraków 4:2 w meczu młodzieżowym",
          excerpt: "Młodzieżowa drużyna Zawiszy Bydgoszcz wygrała z Wisłą Kraków 4:2 i awansowała do finału regionalnych rozgrywek.",
          content: `<p>Zawisza U19 rozgromiła Wisłę Kraków 4:2 w meczu młodzieżowym. Cztery bramki w pierwszej połowie przesądziły o losach spotkania.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 5,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "pilka_nozna" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 6).toISOString(), matchLocation: "Stadion Zawiszy, Bydgoszcz", league: "Rozgrywki młodzieżowe", round: "Półfinał", homeTeam: { id: "zawisza-u19", name: "Zawisza U19", shortName: "ZAW", color: "#CC0000", type: "home" as const }, awayTeam: { id: "wisla-u19", name: "Wisła Kraków U19", shortName: "WIS", color: "#CC0000", type: "away" as const }, homeScore: "4", awayScore: "2", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Łuczniczka awansuje do finału siatkarskiej ligi po dramatycznym meczu",
          excerpt: "Łuczniczka Bydgoszcz awansowała do finału PlusLigi po dramatycznym meczu z Resovią. Decydujący set zakończył się 25:23.",
          content: `<p>Łuczniczka Bydgoszcz awansowała do finału PlusLigi po dramatycznym zwycięstwie nad Resovią 3:2. Decydujący set zakończył się 25:23 po znakomitej grze Malwiny Smarzek.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 6,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "siatkowka" as const, isMatchReport: true, matchDate: new Date(ts - 86400000 * 7).toISOString(), matchLocation: "Hala Łuczniczka, Bydgoszcz", league: "PlusLiga", round: "Półfinał", homeTeam: { id: "luczniczka", name: "Łuczniczka Bydgoszcz", shortName: "ŁUC", color: "#006633", type: "home" as const }, awayTeam: { id: "resovia", name: "Resovia Rzeszów", shortName: "RES", color: "#CC0000", type: "away" as const }, homeScore: "3", awayScore: "2", matchStatus: "zakonczony" as const, styleVariant: "dynamic" as const },
        },
        {
          title: "Bydgoszcz gospodarzem Mistrzostw Polski w Żużlu — wielkie święto sportu",
          excerpt: "Bydgoszcz po raz kolejny będzie gospodarzem Indywidualnych Mistrzostw Polski w Żużlu. Zawody odbędą się na Stadionie Polonii.",
          content: `<p>Bydgoszcz po raz kolejny będzie gospodarzem Indywidualnych Mistrzostw Polski w Żużlu. Zawody odbędą się na Stadionie Polonii w sierpniu tego roku.</p><p>Organizatorzy spodziewają się ponad 10 000 kibiców. Wśród faworytów wymienia się Bartosza Zmarzlika i Macieja Janowskiego.</p>`,
          category: "sport" as const,
          author: "Piotr Sportowy",
          publishedAt: ts - 86400000 * 7,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
          sport: { enabled: true, sportType: "zuzel" as const, isMatchReport: false, matchLocation: "Stadion Polonii, Bydgoszcz", league: "Mistrzostwa Polski", styleVariant: "dynamic" as const },
        },
      ];
      for (const a of sportArticles) await ctx.db.insert("articles", a as any);
      results.sportArticles = sportArticles.length;
    } else {
      results.sportArticles = "skipped";
    }

    // ── 6. POLITICS ARTICLES ────────────────────────────────────────────
    const existingPoliticsArticles = await ctx.db.query("articles").withIndex("by_category", q => q.eq("category", "polityka")).take(1);
    if (existingPoliticsArticles.length === 0) {
      const politicsArticles = [
        {
          title: "Prezydent Bruski zapowiada 500 mln zł inwestycji w komunikację miejską",
          excerpt: "Podczas konferencji prasowej prezydent Rafał Bruski przedstawił ambitny plan rozwoju komunikacji miejskiej na lata 2024-2029.",
          content: `<p>Prezydent Bydgoszczy Rafał Bruski podczas dzisiejszej konferencji prasowej przedstawił ambitny plan rozwoju infrastruktury transportowej w mieście. Projekt zakłada budowę nowych linii tramwajowych oraz kompleksową modernizację dworca kolejowego.</p><p>"Naszym celem jest stworzenie nowoczesnego systemu komunikacji, który będzie przyjazny zarówno mieszkańcom, jak i turystom" — powiedział prezydent. Plan zakłada inwestycje o wartości ponad 500 milionów złotych w ciągu najbliższych pięciu lat.</p><p>Pierwsze prace mają rozpocząć się już w przyszłym roku, a całość projektu powinna zostać zrealizowana do 2029 roku.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 0,
          featured: true,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "bruski", fullName: "Rafał Bruski", party: "Koalicja Obywatelska", position: "Prezydent Bydgoszczy" }], mainPoliticianId: "bruski", politicalContext: "Rozwój infrastruktury transportowej jest jednym z kluczowych elementów programu wyborczego obecnego prezydenta.", parties: ["Koalicja Obywatelska"], topic: "Infrastruktura transportowa", styleVariant: "editorial" as const },
        },
        {
          title: "Rada Miasta uchwaliła budżet na 2025 rok — rekordowe 2,1 mld zł",
          excerpt: "Rada Miasta Bydgoszczy przyjęła budżet na 2025 rok. To rekordowe 2,1 miliarda złotych, z czego 40% przeznaczono na inwestycje.",
          content: `<p>Rada Miasta Bydgoszczy przyjęła budżet na 2025 rok. To rekordowe 2,1 miliarda złotych, z czego 40% przeznaczono na inwestycje infrastrukturalne.</p><p>Przewodnicząca Rady Anna Mackiewicz podkreśliła, że budżet jest odpowiedzią na potrzeby mieszkańców. Opozycja zgłosiła kilka poprawek, które zostały odrzucone.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 1,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "mackiewicz", fullName: "Anna Mackiewicz", party: "Koalicja Obywatelska", position: "Przewodnicząca Rady Miasta" }], parties: ["Koalicja Obywatelska", "Prawo i Sprawiedliwość"], topic: "Budżet miasta", styleVariant: "editorial" as const },
        },
        {
          title: "Poseł Latos krytykuje plan tramwajowy: 'Brakuje konsultacji społecznych'",
          excerpt: "Poseł Tomasz Latos z PiS skrytykował plan budowy nowej linii tramwajowej, domagając się szerszych konsultacji z mieszkańcami.",
          content: `<p>Poseł Tomasz Latos z Prawa i Sprawiedliwości skrytykował plan budowy nowej linii tramwajowej na Fordon. Polityk domaga się szerszych konsultacji społecznych przed podjęciem ostatecznej decyzji.</p><p>"Mieszkańcy muszą mieć realny wpływ na tak ważne decyzje" — powiedział poseł podczas konferencji prasowej.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 2,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "latos", fullName: "Tomasz Latos", party: "Prawo i Sprawiedliwość", position: "Poseł na Sejm RP" }], parties: ["Prawo i Sprawiedliwość"], topic: "Transport publiczny", styleVariant: "editorial" as const },
        },
        {
          title: "Debata o przyszłości transportu publicznego w Bydgoszczy",
          excerpt: "W Ratuszu odbyła się debata z udziałem radnych, ekspertów i mieszkańców na temat przyszłości komunikacji miejskiej.",
          content: `<p>W Ratuszu Miejskim odbyła się debata z udziałem radnych, ekspertów i mieszkańców na temat przyszłości komunikacji miejskiej w Bydgoszczy. Dyskusja skupiła się na planach rozbudowy sieci tramwajowej i modernizacji taboru autobusowego.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 3,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "bruski", fullName: "Rafał Bruski", party: "Koalicja Obywatelska", position: "Prezydent Bydgoszczy" }, { id: "latos", fullName: "Tomasz Latos", party: "Prawo i Sprawiedliwość", position: "Poseł na Sejm RP" }], parties: ["Koalicja Obywatelska", "Prawo i Sprawiedliwość", "Trzecia Droga"], topic: "Transport publiczny", styleVariant: "editorial" as const },
        },
        {
          title: "Radna Wróblewska proponuje nowy program wsparcia dla rodzin",
          excerpt: "Radna Magdalena Wróblewska z Trzeciej Drogi złożyła projekt uchwały o nowym programie wsparcia dla rodzin wielodzietnych.",
          content: `<p>Radna Magdalena Wróblewska z Trzeciej Drogi złożyła projekt uchwały o nowym programie wsparcia dla rodzin wielodzietnych w Bydgoszczy. Program zakłada dopłaty do żłobków, przedszkoli i zajęć pozalekcyjnych.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 4,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "wroblewska", fullName: "Magdalena Wróblewska", party: "Trzecia Droga", position: "Radna Miejska" }], parties: ["Trzecia Droga"], topic: "Polityka społeczna", styleVariant: "editorial" as const },
        },
        {
          title: "Sesja nadzwyczajna Rady Miasta ws. ochrony środowiska",
          excerpt: "Rada Miasta zwołała sesję nadzwyczajną w sprawie nowych regulacji dotyczących ochrony środowiska i jakości powietrza.",
          content: `<p>Rada Miasta Bydgoszczy zwołała sesję nadzwyczajną w sprawie nowych regulacji dotyczących ochrony środowiska. Radni dyskutowali o planach ograniczenia emisji spalin i poprawy jakości powietrza w mieście.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 5,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "mackiewicz", fullName: "Anna Mackiewicz", party: "Koalicja Obywatelska", position: "Przewodnicząca Rady Miasta" }], parties: ["Koalicja Obywatelska", "Lewica"], topic: "Ochrona środowiska", styleVariant: "editorial" as const },
        },
        {
          title: "Poseł Wiśniewski o sytuacji gospodarczej regionu kujawsko-pomorskiego",
          excerpt: "Poseł Marek Wiśniewski z Trzeciej Drogi przedstawił raport o sytuacji gospodarczej regionu i planach wsparcia dla lokalnych przedsiębiorców.",
          content: `<p>Poseł Marek Wiśniewski z Trzeciej Drogi przedstawił raport o sytuacji gospodarczej regionu kujawsko-pomorskiego. Polityk wskazał na potrzebę większego wsparcia dla małych i średnich przedsiębiorstw.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 6,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "wisniewski", fullName: "Marek Wiśniewski", party: "Trzecia Droga", position: "Poseł na Sejm RP" }], parties: ["Trzecia Droga"], topic: "Gospodarka regionalna", styleVariant: "editorial" as const },
        },
        {
          title: "Radny Nowicki domaga się więcej mieszkań komunalnych",
          excerpt: "Radny Piotr Nowicki z Lewicy złożył interpelację w sprawie zwiększenia liczby mieszkań komunalnych w Bydgoszczy.",
          content: `<p>Radny Piotr Nowicki z Lewicy złożył interpelację w sprawie zwiększenia liczby mieszkań komunalnych w Bydgoszczy. Polityk wskazuje na rosnące potrzeby mieszkaniowe najuboższych mieszkańców.</p>`,
          category: "polityka" as const,
          author: "Maria Polityczna",
          publishedAt: ts - 86400000 * 7,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
          politics: { enabled: true, politicians: [{ id: "nowicki", fullName: "Piotr Nowicki", party: "Lewica", position: "Radny Miejski" }], parties: ["Lewica"], topic: "Polityka mieszkaniowa", styleVariant: "editorial" as const },
        },
      ];
      for (const a of politicsArticles) await ctx.db.insert("articles", a as any);
      results.politicsArticles = politicsArticles.length;
    } else {
      results.politicsArticles = "skipped";
    }

    // ── 7. INVESTMENT ARTICLES ──────────────────────────────────────────
    const existingInvestmentArticles = await ctx.db.query("articles").withIndex("by_category", q => q.eq("category", "inwestycje")).take(1);
    if (existingInvestmentArticles.length === 0) {
      const investmentArticles = [
        {
          title: "Centrum Przesiadkowe Bydgoszcz Główna — 65% prac ukończone",
          excerpt: "Modernizacja węzła komunikacyjnego przy dworcu głównym postępuje zgodnie z harmonogramem. Otwarcie planowane na marzec 2026.",
          content: `<p>Centrum Przesiadkowe przy dworcu Bydgoszcz Główna jest już w 65% ukończone. Inwestycja wartości 85 mln zł ma zintegrować kolej, tramwaje, autobusy i rowery miejskie w jednym węźle komunikacyjnym.</p><p>Wykonawca — konsorcjum Mota-Engil i Torpol — zapewnia, że prace przebiegają zgodnie z harmonogramem. Otwarcie planowane jest na marzec 2026 roku.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 0,
          featured: true,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Centrum Przesiadkowe Bydgoszcz Główna", projectStatus: "w_trakcie" as const, location: "Dworzec Bydgoszcz Główna", progressPercent: 65, budget: "85 mln zł", contractor: "Konsorcjum Mota-Engil / Torpol", investor: "PKP / Miasto Bydgoszcz / UE", linkedInvestmentId: "centrum-przesiadkowe-bydgoszcz-glowna", styleVariant: "technical" as const },
        },
        {
          title: "Przebudowa ul. Fordońskiej — 42% prac za nami",
          excerpt: "Przebudowa ulicy Fordońskiej postępuje. Wykonano już 42% zaplanowanych prac, w tym nową nawierzchnię na odcinku 1,8 km.",
          content: `<p>Przebudowa ulicy Fordońskiej postępuje zgodnie z planem. Wykonano już 42% zaplanowanych prac, w tym nową nawierzchnię na odcinku 1,8 km oraz część ścieżki rowerowej.</p><p>Inwestycja wartości 45 mln zł ma zakończyć się w czerwcu 2025 roku. Wykonawcą jest firma Budimex S.A.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 1,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Przebudowa ul. Fordońskiej", projectStatus: "w_trakcie" as const, location: "ul. Fordońska, Bydgoszcz", progressPercent: 42, budget: "45 mln zł", contractor: "Budimex S.A.", linkedInvestmentId: "przebudowa-ul-fordonskiej", styleVariant: "technical" as const },
        },
        {
          title: "Nowa linia tramwajowa na Fordon — przetarg ogłoszony",
          excerpt: "Miasto ogłosiło przetarg na projekt budowlany nowej linii tramwajowej łączącej centrum z Fordonem. Wartość inwestycji to 320 mln zł.",
          content: `<p>Miasto Bydgoszcz ogłosiło przetarg na projekt budowlany nowej linii tramwajowej łączącej centrum z dzielnicą Fordon. Inwestycja wartości 320 mln zł jest współfinansowana ze środków Unii Europejskiej.</p><p>Nowa linia będzie miała 8 km długości i 12 przystanków. Budowa ma rozpocząć się we wrześniu 2025 roku.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 2,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Nowa linia tramwajowa na Fordon", projectStatus: "planowana" as const, location: "Trasa: Centrum – Fordon", progressPercent: 8, budget: "320 mln zł", linkedInvestmentId: "nowa-linia-tramwajowa-fordon", styleVariant: "technical" as const },
        },
        {
          title: "Rewitalizacja Starego Rynku zakończona — nowe oblicze centrum",
          excerpt: "Rewitalizacja Starego Rynku dobiegła końca. Nowa nawierzchnia, fontanna i zieleń miejska zmieniły centrum Bydgoszczy nie do poznania.",
          content: `<p>Rewitalizacja Starego Rynku w Bydgoszczy dobiegła końca. Inwestycja wartości 18 mln zł zmieniła centrum miasta nie do poznania. Nowa nawierzchnia, fontanna, zieleń miejska i nowoczesne oświetlenie przyciągają mieszkańców i turystów.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 3,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Rewitalizacja Starego Rynku", projectStatus: "zakonczona" as const, location: "Stary Rynek, Bydgoszcz", progressPercent: 100, budget: "18 mln zł", contractor: "Strabag Sp. z o.o.", linkedInvestmentId: "rewitalizacja-starego-rynku", styleVariant: "technical" as const },
        },
        {
          title: "Modernizacja Mostu Uniwersyteckiego — 78% prac ukończone",
          excerpt: "Modernizacja Mostu Uniwersyteckiego jest już w 78% ukończona. Nowa nawierzchnia i oświetlenie LED zmienią oblicze tej ważnej przeprawy.",
          content: `<p>Modernizacja Mostu Uniwersyteckiego jest już w 78% ukończona. Inwestycja wartości 45 mln zł obejmuje wymianę nawierzchni, wzmocnienie konstrukcji i instalację nowoczesnego oświetlenia LED.</p><p>Otwarcie zmodernizowanego mostu planowane jest na sierpień 2024 roku.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 4,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Modernizacja Mostu Uniwersyteckiego", projectStatus: "w_trakcie" as const, location: "Most Uniwersytecki, Bydgoszcz", progressPercent: 78, budget: "45 mln zł", contractor: "Mosty Sp. z o.o.", linkedInvestmentId: "modernizacja-mostu-uniwersyteckiego", styleVariant: "technical" as const },
        },
        {
          title: "Rozbudowa Szpitala Miejskiego — projekt w fazie planowania",
          excerpt: "Miasto Bydgoszcz planuje rozbudowę Szpitala Miejskiego o nowe skrzydło z oddziałem kardiologicznym. Inwestycja warta 120 mln zł.",
          content: `<p>Miasto Bydgoszcz planuje rozbudowę Szpitala Miejskiego o nowe skrzydło z oddziałem kardiologicznym i centrum diagnostycznym. Inwestycja wartości 120 mln zł jest współfinansowana przez NFZ.</p><p>Budowa ma rozpocząć się w 2026 roku i zakończyć w 2029 roku.</p>`,
          category: "inwestycje" as const,
          author: "Tomasz Inwestycyjny",
          publishedAt: ts - 86400000 * 5,
          featured: false,
          status: "published" as const,
          imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=600&fit=crop",
          investment: { enabled: true, projectName: "Rozbudowa Szpitala Miejskiego", projectStatus: "planowana" as const, location: "ul. Szpitalna 19, Bydgoszcz", progressPercent: 5, budget: "120 mln zł", linkedInvestmentId: "rozbudowa-szpitala-miejskiego", styleVariant: "technical" as const },
        },
      ];
      for (const a of investmentArticles) await ctx.db.insert("articles", a as any);
      results.investmentArticles = investmentArticles.length;
    } else {
      results.investmentArticles = "skipped";
    }

    return {
      success: true,
      message: "Master seed completed",
      results,
    };
  },
});
