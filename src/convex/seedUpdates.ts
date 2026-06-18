import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedUpdates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;

    const updates = [
      {
        title: "Remont ul. Gdańskiej zakończony – ruch przywrócony",
        description: "Po trzech tygodniach prac drogowych ulica Gdańska jest ponownie przejezdna w obu kierunkach. Nowa nawierzchnia i oznakowanie poziome.",
        location: "ul. Gdańska, Bydgoszcz",
        category: "miasto",
        publishedAt: now - 1 * hour,
      },
      {
        title: "Nowy autobus elektryczny na linii 65",
        description: "MZK Bydgoszcz wprowadza kolejny autobus elektryczny. Linia 65 obsługuje trasę Fordon – Centrum.",
        location: "MZK Bydgoszcz",
        category: "miasto",
        publishedAt: now - 3 * hour,
      },
      {
        title: "Koncert Dawida Podsiadło – bilety wyprzedane",
        description: "Wszystkie bilety na sierpniowy koncert Dawida Podsiadły w Bydgoszczy zostały wyprzedane w ciągu 2 godzin.",
        location: "Hala Łuczniczka",
        category: "rozrywka",
        publishedAt: now - 5 * hour,
      },
      {
        title: "Festiwal Filmowy Camerimage ogłasza program",
        description: "Organizatorzy Camerimage opublikowali pełny program tegorocznej edycji. W konkursie głównym 14 filmów z całego świata.",
        location: "Opera Nova, Bydgoszcz",
        category: "kultura",
        publishedAt: now - 8 * hour,
      },
      {
        title: "Nowa restauracja sushi otwarta na Starym Rynku",
        description: "Przy Starym Rynku 12 otwarto restaurację Sakura Sushi. Kuchnia japońska, menu degustacyjne i sake bar.",
        location: "Stary Rynek 12",
        category: "gastronomia",
        publishedAt: now - 12 * hour,
      },
      {
        title: "Szpital Miejski uruchamia nową poradnię kardiologiczną",
        description: "Od 1 września pacjenci mogą korzystać z nowej poradni kardiologicznej. Rejestracja telefoniczna i online.",
        location: "Szpital Miejski, ul. Szpitalna 19",
        category: "medyczna",
        publishedAt: now - 1 * day,
      },
      {
        title: "Bydgoszczanin roku – głosowanie trwa",
        description: "Trwa głosowanie na Bydgoszczanina Roku 2024. W tym roku nominowanych jest 15 osób. Głosować można do 31 sierpnia.",
        category: "bydgoszczanie",
        publishedAt: now - 1 * day - 2 * hour,
      },
      {
        title: "Targi Pracy w Bydgoszczy – ponad 50 firm",
        description: "W piątek w Centrum Targowym odbędą się Targi Pracy. Ponad 50 firm z regionu szuka pracowników. Wstęp wolny.",
        location: "Centrum Targowe, ul. Gdańska 187",
        category: "biznes",
        publishedAt: now - 1 * day - 4 * hour,
      },
      {
        title: "Wypadek na skrzyżowaniu Fordońskiej i Toruńskiej",
        description: "Zderzenie dwóch samochodów osobowych. Jedna osoba ranna, przewieziona do szpitala. Utrudnienia w ruchu.",
        location: "Skrzyżowanie Fordońska/Toruńska",
        category: "miasto",
        publishedAt: now - 1 * day - 6 * hour,
      },
      {
        title: "Nowy park kieszonkowy na Szwederowie",
        description: "Miasto otworzyło kolejny park kieszonkowy. Ławki, zieleń i plac zabaw dla dzieci na osiedlu Szwederowo.",
        location: "ul. Nakielska, Szwederowo",
        category: "miasto",
        publishedAt: now - 2 * day,
      },
      {
        title: "Klub Mózg świętuje 30-lecie działalności",
        description: "Legendarny bydgoski klub Mózg obchodzi 30. urodziny. Tydzień koncertów, wystaw i spotkań z artystami.",
        location: "Klub Mózg, ul. Gdańska 10",
        category: "rozrywka",
        publishedAt: now - 2 * day - 1 * hour,
      },
      {
        title: "Muzeum Okręgowe otwiera wystawę o historii Bydgoszczy",
        description: "Nowa stała ekspozycja 'Bydgoszcz przez wieki' prezentuje historię miasta od średniowiecza do współczesności.",
        location: "Muzeum Okręgowe, ul. Gdańska 4",
        category: "kultura",
        publishedAt: now - 2 * day - 3 * hour,
      },
      {
        title: "Kawiarnia Mleczarnia otwiera drugą lokalizację",
        description: "Popularna kawiarnia Mleczarnia otwiera nowy lokal na Wyspie Młyńskiej. Śniadania, brunche i kawa specialty.",
        location: "Wyspa Młyńska",
        category: "gastronomia",
        publishedAt: now - 2 * day - 5 * hour,
      },
      {
        title: "Bezpłatne badania mammograficzne dla kobiet",
        description: "W przyszłym tygodniu mammobusa będzie dostępny przy Galerii Pomorskiej. Badania bezpłatne dla kobiet 45-74 lat.",
        location: "Galeria Pomorska, ul. Fordońska 141",
        category: "medyczna",
        publishedAt: now - 3 * day,
      },
      {
        title: "Startup z Bydgoszczy pozyskał 5 mln zł dofinansowania",
        description: "Bydgoska firma TechByd otrzymała dofinansowanie z funduszy europejskich na rozwój aplikacji dla logistyki.",
        category: "biznes",
        publishedAt: now - 3 * day - 2 * hour,
      },
      {
        title: "Pływalnia Astoria zamknięta na remont",
        description: "Pływalnia Astoria będzie zamknięta od 15 do 31 sierpnia z powodu remontu niecek basenowych.",
        location: "Pływalnia Astoria, ul. Gdańska 163",
        category: "miasto",
        publishedAt: now - 3 * day - 4 * hour,
      },
      {
        title: "Bydgoski Festiwal Muzyki Dawnej – program ogłoszony",
        description: "Tegoroczny festiwal muzyki dawnej odbędzie się w dniach 20-25 września. Koncerty w kościołach i na Wyspie Młyńskiej.",
        location: "Wyspa Młyńska i kościoły Bydgoszczy",
        category: "kultura",
        publishedAt: now - 4 * day,
      },
      {
        title: "Nowe menu w restauracji Ratuszowa",
        description: "Restauracja Ratuszowa przy Starym Rynku odświeżyła menu. Nowe dania kuchni polskiej z lokalnych składników.",
        location: "Stary Rynek 2",
        category: "gastronomia",
        publishedAt: now - 4 * day - 2 * hour,
      },
      {
        title: "Akcja krwiodawstwa w centrum miasta",
        description: "W sobotę przy Galerii Fokus odbędzie się akcja krwiodawstwa. Rejestracja online lub na miejscu od godz. 9:00.",
        location: "Galeria Fokus, ul. Jagiellońska 39",
        category: "medyczna",
        publishedAt: now - 4 * day - 4 * hour,
      },
      {
        title: "Bydgoszczanka Marta Kowalska zdobyła złoto na mistrzostwach",
        description: "Marta Kowalska, zawodniczka BKS Chemik, zdobyła złoty medal na Mistrzostwach Polski w pływaniu.",
        category: "bydgoszczanie",
        publishedAt: now - 5 * day,
      },
      {
        title: "Nowe połączenie lotnicze z Bydgoszczy do Londynu",
        description: "Ryanair uruchamia nowe połączenie z Bydgoszczy do Londynu Stansted. Loty od października, 3 razy w tygodniu.",
        location: "Port Lotniczy Bydgoszcz",
        category: "miasto",
        publishedAt: now - 5 * day - 2 * hour,
      },
      {
        title: "Letni kino plenerowe na Wyspie Młyńskiej",
        description: "Co piątek i sobotę do końca sierpnia na Wyspie Młyńskiej odbywają się bezpłatne seanse kina plenerowego.",
        location: "Wyspa Młyńska",
        category: "rozrywka",
        publishedAt: now - 5 * day - 4 * hour,
      },
      {
        title: "Galeria Miejska BWA otwiera nową wystawę",
        description: "Wystawa 'Bydgoszcz w obiektywie' prezentuje fotografie miasta z ostatnich 50 lat. Wernisaż w piątek o 18:00.",
        location: "Galeria Miejska BWA, ul. Gdańska 20",
        category: "kultura",
        publishedAt: now - 6 * day,
      },
      {
        title: "Nowy browar rzemieślniczy otwiera się w Bydgoszczy",
        description: "Browar Bydgoski przy ul. Nakielskiej otwiera swoje podwoje. Degustacje, zwiedzanie i sklep z piwami kraftowymi.",
        location: "ul. Nakielska 45",
        category: "gastronomia",
        publishedAt: now - 6 * day - 2 * hour,
      },
      {
        title: "Szpital Jurasza wprowadza teleporady",
        description: "Szpital Jurasza uruchamia system teleporad dla pacjentów ambulatoryjnych. Konsultacje przez aplikację mobilną.",
        location: "Szpital Jurasza, ul. Marii Skłodowskiej-Curie 9",
        category: "medyczna",
        publishedAt: now - 6 * day - 4 * hour,
      },
      {
        title: "Bydgoski Inkubator Przedsiębiorczości przyjmuje wnioski",
        description: "Do 30 września można składać wnioski o miejsce w Bydgoskim Inkubatorze Przedsiębiorczości. Bezpłatne biura i wsparcie.",
        location: "BIP, ul. Unii Lubelskiej 4C",
        category: "biznes",
        publishedAt: now - 7 * day,
      },
      {
        title: "Rewitalizacja Starego Rynku – kolejny etap",
        description: "Ruszyły prace przy rewitalizacji wschodniej pierzei Starego Rynku. Zakończenie planowane na wiosnę 2025.",
        location: "Stary Rynek",
        category: "miasto",
        publishedAt: now - 7 * day - 2 * hour,
      },
      {
        title: "Dni Bydgoszczy – pełny program imprezy",
        description: "Organizatorzy opublikowali pełny program Dni Bydgoszczy. Trzy dni koncertów, atrakcji i pokazów na Wyspie Młyńskiej.",
        location: "Wyspa Młyńska i centrum miasta",
        category: "rozrywka",
        publishedAt: now - 7 * day - 4 * hour,
      },
      {
        title: "Teatr Polski zaprasza na premierę sezonu",
        description: "Teatr Polski w Bydgoszczy otwiera nowy sezon premierą 'Hamleta' w reżyserii Krzysztofa Warlikowskiego.",
        location: "Teatr Polski, ul. Gdańska 20",
        category: "kultura",
        publishedAt: now - 8 * day,
      },
      {
        title: "Maraton Bydgoski – zapisy otwarte",
        description: "Ruszyły zapisy na 15. Maraton Bydgoski. Trasa wiedzie przez centrum i Wyspę Młyńską. Limit 3000 uczestników.",
        location: "Start: Stary Rynek",
        category: "bydgoszczanie",
        publishedAt: now - 8 * day - 2 * hour,
      },
    ];

    for (const upd of updates) {
      await ctx.db.insert("updates", {
        ...upd,
        category: upd.category as "miasto" | "rozrywka" | "kultura" | "biznes" | "gastronomia" | "bydgoszczanie" | "medyczna" | undefined,
        author: "Redakcja LoveBydgoszcz",
      });
    }

    return { inserted: updates.length };
  },
});
