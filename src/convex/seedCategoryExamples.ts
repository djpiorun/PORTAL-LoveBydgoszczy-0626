import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Przykłady użycia nowego systemu kategorii
 *
 * Ten plik zawiera przykładowe dane dla nowych kategorii:
 * - Sport (z meczami, składami, statystykami)
 * - Polityka (z politykami, timeline)
 * - Inwestycje (z fazami, statusem projektu)
 * - Nasze Działania (z partnerami, kamieniami milowymi)
 *
 * Użycie: bunx convex run seedCategoryExamples:seedAll
 */

export const seedSportArticle = mutation({
  args: {},
  handler: async (ctx) => {
    const articleId = await ctx.db.insert("articles", {
      title: "Zawisza Bydgoszcz wygrywa z Lechem Poznań 2:1! Niesamowity mecz na stadionie",
      excerpt: "W emocjonującym spotkaniu 15. kolejki PKO Ekstraklasy Zawisza Bydgoszcz pokonała Lecha Poznań 2:1. Bohaterem spotkania został Adam Kowalski, który zdobył obie bramki dla gospodarzy.",
      content: `<p>W niedzielny wieczór na stadionie przy ulicy Sportowej w Bydgoszczy rozegrano jedno z najciekawszych spotkań tej kolejki. Zawisza Bydgoszcz podejmowała faworyzowanego Lecha Poznań, ale to gospodarze od pierwszej minuty narzucili swoje tempo gry.</p>

<p>Pierwsza połowa to dominacja Zawiszy. W 23. minucie kapitan drużyny Adam Kowalski otworzył wynik meczu efektownym strzałem z 20 metrów. Piłka wpadła w samo okienko bramki gości, a kibice oszaleli z radości.</p>

<p>Druga połowa rozpoczęła się od ofensywy Lecha. W 52. minucie Jakub Nowak zdobył wyrównującą bramkę po rzucie rożnym. Wydawało się, że mecz zmierza ku remisowi, ale w 78. minucie ponownie Adam Kowalski wpisał się na listę strzelców, wykorzystując błąd obrony gości.</p>

<p>Ostatnie minuty meczu to desperackie ataki Lecha, ale świetnie spisujący się bramkarz Zawiszy, Marcin Lewandowski, nie dał się pokonać. Zawisza wygrała 2:1 i awansowała na 5. miejsce w tabeli!</p>`,
      category: "sport",
      author: "Piotr Sportowy",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=600&fit=crop",
      sport: {
        enabled: true,
        sportType: "pilka_nozna",
        isMatchReport: true,
        matchDate: new Date("2024-03-29T18:00:00").toISOString(),
        matchLocation: "Stadion przy ul. Sportowej, Bydgoszcz",
        league: "PKO Ekstraklasa",
        round: "15. kolejka",
        homeTeam: {
          id: "zawisza",
          name: "Zawisza Bydgoszcz",
          shortName: "Zawisza",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Zawisza_Bydgoszcz_logo.svg/200px-Zawisza_Bydgoszcz_logo.svg.png",
          color: "#FF0000",
          type: "home" as const,
        },
        awayTeam: {
          id: "lech",
          name: "Lech Poznań",
          shortName: "Lech",
          logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ea/Lech_Pozna%C5%84_logo.svg/200px-Lech_Pozna%C5%84_logo.svg.png",
          color: "#1E40AF",
          type: "away" as const,
        },
        homeScore: "2",
        awayScore: "1",
        matchStatus: "zakonczony",
        homeLineup: [
          { id: "1", name: "Marcin Lewandowski", number: "1", position: "Bramkarz" },
          { id: "2", name: "Adam Kowalski", number: "10", position: "Napastnik", rating: 9.5 },
          { id: "3", name: "Paweł Nowak", number: "7", position: "Pomocnik", rating: 8.0 },
        ],
        awayLineup: [
          { id: "4", name: "Jan Kowalczyk", number: "1", position: "Bramkarz" },
          { id: "5", name: "Jakub Nowak", number: "9", position: "Napastnik", rating: 7.5 },
        ],
        matchStats: [
          { label: "Posiadanie piłki", homeValue: "58", awayValue: "42" },
          { label: "Strzały celne", homeValue: "7", awayValue: "4" },
          { label: "Strzały niecelne", homeValue: "5", awayValue: "8" },
          { label: "Faule", homeValue: "12", awayValue: "15" },
        ],
        scorers: ["23' Adam Kowalski (Zawisza)", "52' Jakub Nowak (Lech)", "78' Adam Kowalski (Zawisza)"],
        matchHighlights: [
          "23' - Gol! Adam Kowalski strzela z dystansu i otwiera wynik meczu!",
          "52' - Wyrównanie! Jakub Nowak po rzucie rożnym strzela głową.",
          "78' - Zwycięska bramka! Adam Kowalski wykorzystuje błąd obrony i daje zwycięstwo Zawiszy!",
          "90+3' - Koniec meczu! Zawisza wygrywa 2:1!",
        ],
        styleVariant: "dynamic",
      },
    });

    return { success: true, articleId };
  },
});

export const seedPoliticsArticle = mutation({
  args: {},
  handler: async (ctx) => {
    const articleId = await ctx.db.insert("articles", {
      title: "Prezydent Bydgoszczy zapowiada nowe inwestycje w infrastrukturę transportową",
      excerpt: "Podczas dzisiejszej konferencji prasowej prezydent miasta przedstawił plan rozwoju komunikacji miejskiej na najbliższe lata. W planach nowe linie tramwajowe i modernizacja dworca.",
      content: `<p>Prezydent Bydgoszczy Rafał Bruski podczas dzisiejszej konferencji prasowej przedstawił ambitny plan rozwoju infrastruktury transportowej w mieście. Projekt zakłada budowę nowych linii tramwajowych oraz kompleksową modernizację dworca kolejowego.</p>

<p>"Naszym celem jest stworzenie nowoczesnego systemu komunikacji, który będzie przyjazny zarówno mieszkańcom, jak i turystom" - powiedział prezydent podczas konferencji. Plan zakłada inwestycje o wartości ponad 500 milionów złotych w ciągu najbliższych pięciu lat.</p>

<p>W projekcie uczestniczą również radni miejscy z różnych ugrupowań. Anna Kowalska z Koalicji Obywatelskiej wyraziła pełne poparcie dla inicjatywy, podkreślając znaczenie ekologicznych rozwiązań transportowych. Z kolei Jan Nowak z PiS zaproponował dodatkowe konsultacje społeczne przed rozpoczęciem realizacji.</p>

<p>Pierwsze prace mają rozpocząć się już w przyszłym roku, a całość projektu powinna zostać zrealizowana do 2029 roku.</p>`,
      category: "polityka",
      author: "Maria Polityczna",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&h=600&fit=crop",
      politics: {
        enabled: true,
        politicians: [
          {
            id: "bruski",
            fullName: "Rafał Bruski",
            firstName: "Rafał",
            lastName: "Bruski",
            photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Rafa%C5%82_Bruski_Sejm_2016.jpg/220px-Rafa%C5%82_Bruski_Sejm_2016.jpg",
            party: "Koalicja Obywatelska",
            position: "Prezydent Bydgoszczy",
            bio: "Prezydent miasta Bydgoszczy od 2014 roku. Wcześniej poseł na Sejm RP.",
          },
          {
            id: "kowalska",
            fullName: "Anna Kowalska",
            firstName: "Anna",
            lastName: "Kowalska",
            party: "Koalicja Obywatelska",
            position: "Radna Miejska",
            bio: "Radna miasta Bydgoszczy, aktywistka społeczna.",
          },
          {
            id: "nowak",
            fullName: "Jan Nowak",
            firstName: "Jan",
            lastName: "Nowak",
            party: "Prawo i Sprawiedliwość",
            position: "Radny Miejski",
            bio: "Radny opozycyjny, lokalny przedsiębiorca.",
          },
        ],
        mainPoliticianId: "bruski",
        politicalContext: "Rozwój infrastruktury transportowej jest jednym z kluczowych elementów programu wyborczego obecnego prezydenta miasta. Projekt cieszy się szerokim poparciem społecznym i zgodnością większości radnych.",
        parties: ["Koalicja Obywatelska", "Prawo i Sprawiedliwość", "Trzecia Droga"],
        topic: "Infrastruktura transportowa",
        timeline: [
          {
            id: "1",
            date: new Date("2024-03-29").toISOString(),
            title: "Konferencja prasowa prezydenta",
            description: "Prezydent Rafał Bruski zaprezentował szczegóły projektu rozwoju komunikacji miejskiej.",
            type: "wypowiedz",
          },
          {
            id: "2",
            date: new Date("2024-04-15").toISOString(),
            title: "Sesja Rady Miasta",
            description: "Planowane głosowanie nad budżetem projektu i przyjęcie uchwały.",
            type: "glosowanie",
          },
          {
            id: "3",
            date: new Date("2025-01-01").toISOString(),
            title: "Rozpoczęcie prac projektowych",
            description: "Start prac nad dokumentacją techniczną nowych linii tramwajowych.",
            type: "decyzja",
          },
        ],
        relatedLegislation: "Ustawa o transporcie publicznym z 2010 roku oraz Prawo budowlane regulują proces realizacji tego typu inwestycji infrastrukturalnych.",
        styleVariant: "editorial",
      },
    });

    return { success: true, articleId };
  },
});

export const seedInvestmentArticle = mutation({
  args: {},
  handler: async (ctx) => {
    const articleId = await ctx.db.insert("articles", {
      title: "Modernizacja Mostu Uniwersyteckiego wchodzi w decydującą fazę",
      excerpt: "Remont Mostu Uniwersyteckiego w Bydgoszczy jest już w 65% ukończony. Inwestycja wartości 45 mln zł ma zakończyć się w sierpniu tego roku.",
      content: `<p>Most Uniwersytecki, jeden z najważniejszych obiektów infrastruktury Bydgoszczy, przechodzi kompleksową modernizację. Projekt rozpoczęty w 2023 roku ma na celu nie tylko poprawę stanu technicznego mostu, ale także zwiększenie jego przepustowości i bezpieczeństwa użytkowników.</p>

<p>Według najnowszych danych, prace są już w 65% ukończone. Wykonawca, firma "Mosty Sp. z o.o.", zapewnia, że inwestycja zostanie ukończona zgodnie z harmonogramem, czyli do końca sierpnia 2024 roku.</p>

<p>Modernizacja obejmuje wymianę nawierzchni, konstrukcji stalowych, oraz instalację nowoczesnego oświetlenia LED. Dodatkowo zostanie wzmocniona konstrukcja nośna i wykonana izolacja przeciwwilgociowa.</p>

<p>Po zakończeniu prac most będzie mógł służyć mieszkańcom przez kolejne kilkadziesiąt lat, a jego nowy wygląd stanie się wizytówką miasta.</p>`,
      category: "inwestycje",
      author: "Tomasz Inwestycyjny",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=600&fit=crop",
      investment: {
        enabled: true,
        projectName: "Modernizacja Mostu Uniwersyteckiego",
        projectStatus: "w_trakcie",
        location: "Most Uniwersytecki, Bydgoszcz",
        startDate: new Date("2023-06-01").toISOString(),
        estimatedEndDate: new Date("2024-08-31").toISOString(),
        budget: "45 000 000 zł",
        contractor: "Mosty Sp. z o.o.",
        investor: "Miasto Bydgoszcz",
        progressPercent: 65,
        timeline: [
          {
            id: "1",
            date: new Date("2023-06-01").toISOString(),
            title: "Rozpoczęcie robót przygotowawczych",
            description: "Organizacja placu budowy i zabezpieczenie terenu.",
            status: "completed",
          },
          {
            id: "2",
            date: new Date("2023-09-15").toISOString(),
            title: "Wymiana nawierzchni jezdni",
            description: "Zerwanie starej nawierzchni i ułożenie nowej warstwy asfaltowej.",
            status: "completed",
          },
          {
            id: "3",
            date: new Date("2024-03-01").toISOString(),
            title: "Wymiana konstrukcji stalowych",
            description: "Demontaż starych elementów stalowych i montaż nowych, wzmocnionych konstrukcji.",
            status: "current",
          },
          {
            id: "4",
            date: new Date("2024-06-15").toISOString(),
            title: "Instalacja oświetlenia LED",
            description: "Montaż nowoczesnego systemu oświetlenia energooszczędnego.",
            status: "upcoming",
          },
          {
            id: "5",
            date: new Date("2024-08-31").toISOString(),
            title: "Odbiór końcowy i otwarcie mostu",
            description: "Przeprowadzenie prób obciążeniowych i oficjalne otwarcie zmodernizowanego mostu.",
            status: "upcoming",
          },
        ],
        beforeImages: [
          "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&h=400&fit=crop",
        ],
        impactDescription: "Modernizacja Mostu Uniwersyteckiego znacząco poprawi bezpieczeństwo ruchu drogowego w Bydgoszczy. Nowa nawierzchnia i wzmocniona konstrukcja zapewnią płynny przejazd pojazdów, a nowoczesne oświetlenie zwiększy komfort i bezpieczeństwo pieszych oraz rowerzystów. Projekt przyczyni się również do poprawy estetyki miasta.",
        styleVariant: "technical",
      },
    });

    return { success: true, articleId };
  },
});

export const seedOurActionsArticle = mutation({
  args: {},
  handler: async (ctx) => {
    const articleId = await ctx.db.insert("articles", {
      title: "Udana akcja 'Sprzątamy Bydgoszcz' - ponad 500 uczestników!",
      excerpt: "Wiosenna edycja akcji 'Sprzątamy Bydgoszcz' zorganizowanej przez Love Bydgoszcz zakończyła się wielkim sukcesem. Zebrano ponad 3 tony śmieci z brzegów Brdy!",
      content: `<p>W sobotę 23 marca odbyła się wiosenna edycja akcji "Sprzątamy Bydgoszcz", którą zorganizowała redakcja Love Bydgoszcz wraz z partnerami. W wydarzeniu wzięło udział ponad 500 osób - mieszkańców miasta, którym leży na sercu stan środowiska naturalnego.</p>

<p>Akcja rozpoczęła się o godzinie 10:00 na Wyspie Młyńskiej. Uczestnicy zostali podzieleni na grupy, z których każda otrzymała wyznaczony odcinek brzegu Brdy do posprzątania. Wszyscy wolontariusze dostali rękawice, worki na śmieci oraz kamizelki odblaskowe.</p>

<p>Efekty akcji przerosły nasze najśmielsze oczekiwania - zebrano łącznie ponad 3 tony śmieci! Najwięcej było plastikowych butelek, opakowań po żywności oraz puszek po napojach. Znaleziono również nietypowe "skarby" jak stare opony czy części rowerowe.</p>

<p>Dziękujemy wszystkim uczestnikom oraz naszym partnerom: Miejskiemu Zakładowi Oczyszczania, Bydgoskiej Straży Miejskiej oraz sieci sklepów EkoBudowa, która przekazała nagrody dla najaktywniejszych wolontariuszy.</p>`,
      category: "nasze_dzialania",
      author: "Redakcja Love Bydgoszcz",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=600&fit=crop",
      ourActions: {
        enabled: true,
        actionType: "akcja",
        actionStatus: "zakonczona",
        startDate: new Date("2024-03-23T10:00:00").toISOString(),
        endDate: new Date("2024-03-23T14:00:00").toISOString(),
        partners: [
          {
            id: "mzo",
            name: "Miejski Zakład Oczyszczania",
            logo: "https://via.placeholder.com/150x50/10b981/ffffff?text=MZO",
          },
          {
            id: "bsm",
            name: "Bydgoska Straż Miejska",
            logo: "https://via.placeholder.com/150x50/3b82f6/ffffff?text=BSM",
          },
          {
            id: "eko",
            name: "EkoBudowa",
            logo: "https://via.placeholder.com/150x50/059669/ffffff?text=EkoBudowa",
          },
        ],
        milestones: [
          {
            id: "1",
            date: new Date("2024-03-01").toISOString(),
            title: "Ogłoszenie akcji",
            description: "Publikacja informacji o akcji na portalu i w mediach społecznościowych.",
            imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            date: new Date("2024-03-15").toISOString(),
            title: "Pozyskanie partnerów",
            description: "Nawiązanie współpracy z Miejskim Zakładem Oczyszczania, Strażą Miejską i EkoBudową.",
          },
          {
            id: "3",
            date: new Date("2024-03-23").toISOString(),
            title: "Realizacja akcji",
            description: "Ponad 500 uczestników zebrało 3 tony śmieci z brzegów Brdy.",
            imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
          },
        ],
        results: "Akcja 'Sprzątamy Bydgoszcz' zakończyła się ogromnym sukcesem! Zebraliśmy ponad 3 tony śmieci, a w wydarzeniu wzięło udział 500+ osób. Wszystkie odpady zostały przekazane do Miejskiego Zakładu Oczyszczania i poddane segregacji. To doskonały przykład społecznego zaangażowania mieszkańców Bydgoszczy w dbałość o środowisko naturalne!",
        participants: "W akcji wzięło udział ponad 500 osób, w tym rodziny z dziećmi, grupy znajomych, lokalni przedsiębiorcy oraz członkowie organizacji ekologicznych. Najmłodszy uczestnik miał 5 lat, a najstarszy 82 lata!",
        impact: "Nasza akcja przyczyniła się do oczyszczenia ponad 5 km brzegów Brdy. To nie tylko poprawa estetyki miasta, ale przede wszystkim ochrona ekosystemu rzeki i jej mieszkańców. Dzięki akcji udało się również zwiększyć świadomość ekologiczną mieszkańców i pokazać, że wspólnie możemy zmieniać nasze miasto na lepsze.",
        gallery: [
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop",
        ],
        ctaLabel: "Dołącz do kolejnej akcji!",
        ctaUrl: "https://lovebydgoszcz.pl/kontakt",
        styleVariant: "storytelling",
      },
    });

    return { success: true, articleId };
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Sport Article
    const sportId = await ctx.db.insert("articles", {
      title: "Zawisza Bydgoszcz wygrywa z Lechem Poznań 2:1! Niesamowity mecz na stadionie",
      excerpt: "W emocjonującym spotkaniu 15. kolejki PKO Ekstraklasy Zawisza Bydgoszcz pokonała Lecha Poznań 2:1. Bohaterem spotkania został Adam Kowalski, który zdobył obie bramki dla gospodarzy.",
      content: `<p>W niedzielny wieczór na stadionie przy ulicy Sportowej w Bydgoszczy rozegrano jedno z najciekawszych spotkań tej kolejki. Zawisza Bydgoszcz podejmowała faworyzowanego Lecha Poznań, ale to gospodarze od pierwszej minuty narzucili swoje tempo gry.</p>`,
      category: "sport",
      author: "Piotr Sportowy",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=600&fit=crop",
      sport: {
        enabled: true,
        sportType: "pilka_nozna",
        isMatchReport: true,
        matchDate: new Date("2024-03-29T18:00:00").toISOString(),
        matchLocation: "Stadion przy ul. Sportowej, Bydgoszcz",
        league: "PKO Ekstraklasa",
        round: "15. kolejka",
        homeTeam: {
          id: "zawisza",
          name: "Zawisza Bydgoszcz",
          shortName: "Zawisza",
          color: "#FF0000",
          type: "home" as const,
        },
        awayTeam: {
          id: "lech",
          name: "Lech Poznań",
          shortName: "Lech",
          color: "#1E40AF",
          type: "away" as const,
        },
        homeScore: "2",
        awayScore: "1",
        matchStatus: "zakonczony",
        styleVariant: "dynamic",
      },
    });

    // Politics Article
    const politicsId = await ctx.db.insert("articles", {
      title: "Prezydent Bydgoszczy zapowiada nowe inwestycje w infrastrukturę transportową",
      excerpt: "Podczas dzisiejszej konferencji prasowej prezydent miasta przedstawił plan rozwoju komunikacji miejskiej na najbliższe lata.",
      content: `<p>Prezydent Bydgoszczy Rafał Bruski podczas dzisiejszej konferencji prasowej przedstawił ambitny plan rozwoju infrastruktury transportowej w mieście.</p>`,
      category: "polityka",
      author: "Maria Polityczna",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&h=600&fit=crop",
      politics: {
        enabled: true,
        politicians: [
          {
            id: "bruski",
            fullName: "Rafał Bruski",
            party: "Koalicja Obywatelska",
            position: "Prezydent Bydgoszczy",
          },
        ],
        styleVariant: "editorial",
      },
    });

    // Investment Article
    const investmentId = await ctx.db.insert("articles", {
      title: "Modernizacja Mostu Uniwersyteckiego wchodzi w decydującą fazę",
      excerpt: "Remont Mostu Uniwersyteckiego w Bydgoszczy jest już w 65% ukończony.",
      content: `<p>Most Uniwersytecki przechodzi kompleksową modernizację.</p>`,
      category: "inwestycje",
      author: "Tomasz Inwestycyjny",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=600&fit=crop",
      investment: {
        enabled: true,
        projectName: "Modernizacja Mostu Uniwersyteckiego",
        projectStatus: "w_trakcie",
        location: "Most Uniwersytecki, Bydgoszcz",
        progressPercent: 65,
        styleVariant: "technical",
      },
    });

    // Our Actions Article
    const ourActionsId = await ctx.db.insert("articles", {
      title: "Udana akcja 'Sprzątamy Bydgoszcz' - ponad 500 uczestników!",
      excerpt: "Wiosenna edycja akcji 'Sprzątamy Bydgoszcz' zakończyła się wielkim sukcesem.",
      content: `<p>W sobotę odbyła się wiosenna edycja akcji "Sprzątamy Bydgoszcz".</p>`,
      category: "nasze_dzialania",
      author: "Redakcja Love Bydgoszcz",
      publishedAt: Date.now(),
      featured: true,
      status: "published",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=600&fit=crop",
      ourActions: {
        enabled: true,
        actionType: "akcja",
        actionStatus: "zakonczona",
        styleVariant: "storytelling",
      },
    });

    return {
      success: true,
      created: {
        sport: sportId,
        politics: politicsId,
        investment: investmentId,
        ourActions: ourActionsId,
      },
    };
  },
});
