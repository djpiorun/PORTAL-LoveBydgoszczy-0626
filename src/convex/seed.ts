import { v } from "convex/values";
import { mutation } from "./_generated/server";

function normalizeSeedSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[char] ?? char))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSeedContent(categoryLabel: string, title: string, excerpt: string) {
  return `${excerpt}\n\n${categoryLabel} w Bydgoszczy ma dziś znacznie więcej odcieni niż jeszcze kilka lat temu. Redakcyjny szkic tego materiału pokazuje kontekst, możliwe kierunki rozwoju oraz lokalne tło, które pomaga czytelnikowi szybko wejść w temat.\n\nW rozwinięciu można umieścić wypowiedzi mieszkańców, ekspertów, organizatorów albo przedsiębiorców, a także praktyczne informacje: adresy, terminy, koszty, dostępność i rekomendacje. Dzięki temu artykuł nadaje się zarówno do prezentacji układu sekcji, jak i do dalszej rozbudowy przez redakcję.\n\nTen wpis został dodany jako przykładowy materiał do prezentacji kategorii i modułów portalu Love Bydgoszcz.`;
}

const categorySeedLibrary: Record<string, { label: string; author: string; items: Array<{ title: string; excerpt: string; imageUrl: string }> }> = {
  miasto: {
    label: "Miasto",
    author: "Redakcja Love Bydgoszcz",
    items: [
      { title: "Nowy rytm nabrzeża: jak zmieniają się spacery nad Brdą", excerpt: "Bulwary znów przyciągają mieszkańców. Sprawdzamy, które fragmenty nabrzeża zyskały nowe funkcje i jak zmienia się codzienny rytm miasta nad wodą.", imageUrl: "https://images.unsplash.com/photo-1517733948473-98921171d210?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoskie place osiedlowe odzyskują życie po modernizacjach", excerpt: "Mniejsze inwestycje zaczynają realnie wpływać na komfort mieszkańców. Zobacz, jak odświeżone place i skwery zmieniają lokalne dzielnice.", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miasto po zmroku: które przestrzenie publiczne stały się bardziej przyjazne", excerpt: "Oświetlenie, mała architektura i bezpieczeństwo wracają do miejskiej dyskusji. Analizujemy, gdzie wieczorna Bydgoszcz zmienia się najbardziej.", imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop" },
      { title: "Małe inwestycje, duży efekt: co poprawia codzienność w centrum", excerpt: "Nie tylko wielkie projekty kształtują miasto. Przyglądamy się mniejszym zmianom, które od razu widać w codziennym użytkowaniu przestrzeni.", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoszcz coraz bardziej rowerowa: trasy, które naprawdę łączą dzielnice", excerpt: "Spójność sieci rowerowej ma dziś większe znaczenie niż liczba kilometrów. Sprawdzamy, które odcinki są najbardziej praktyczne dla mieszkańców.", imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miasto dla pieszych: gdzie spacer staje się przyjemnością, a nie kompromisem", excerpt: "Szersze chodniki, zieleń i mniej chaosu wizualnego potrafią odmienić całe ulice. Oto miejsca, które pokazują nowy kierunek dla centrum.", imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?q=80&w=1200&auto=format&fit=crop" },
      { title: "W stronę wody: jak Brda wraca do codziennego życia mieszkańców", excerpt: "Rzeka przestaje być tylko tłem. Bydgoszcz coraz lepiej wykorzystuje swój wodny charakter w rekreacji, gastronomii i miejskim stylu życia.", imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowa estetyka ulic: detale, które zmieniają odbiór miasta", excerpt: "Ławki, nawierzchnie, szyldy i zieleń zaczynają budować bardziej spójny obraz Bydgoszczy. Zbieramy przykłady zmian, które naprawdę działają.", imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop" },
      { title: "Osiedla bliżej centrum: co zmienia się poza głównymi deptakami", excerpt: "Ciekawsze projekty coraz częściej dzieją się poza najbardziej oczywistymi punktami miasta. Sprawdzamy, co przyciąga uwagę na osiedlach.", imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miejskie tempo: dlaczego komfort życia staje się ważniejszy od rozmachu", excerpt: "Bydgoszcz coraz częściej stawia na jakość codzienności. Rozmawiamy o tym, jak mieszkańcy oceniają funkcjonalność i estetykę zmian w mieście.", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  rozrywka: {
    label: "Rozrywka",
    author: "Marta Kowalczyk",
    items: [
      { title: "Wieczór w mieście: gdzie bydgoszczanie szukają dziś lekkiego klimatu", excerpt: "Zmienia się mapa miejsc na spontaniczne wyjście po pracy. Zbieramy adresy i trendy, które budują nową rozrywkę w centrum.", imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowa fala wydarzeń nocnych: mniej chaosu, więcej klimatu", excerpt: "Rozrywka po zmroku dojrzewa. Coraz ważniejsze są koncept, selekcja muzyczna i jakość przestrzeni, a nie tylko głośna energia.", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoszcz lubi mikrowydarzenia: kameralne formaty wracają do łask", excerpt: "Sety DJ-skie, małe koncerty i wieczory tematyczne przyciągają publiczność szukającą bardziej osobistego doświadczenia.", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop" },
      { title: "Jak zmienia się miejski weekend: nowe nawyki rozrywki w centrum", excerpt: "Od śniadań po wieczorne wyjścia. Sprawdzamy, jak wygląda dziś dzień wolny w Bydgoszczy i które miejsca grają w nim główną rolę.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop" },
      { title: "Kultura klubowa po nowemu: mniej przypadkowych imprez, więcej konceptu", excerpt: "Publiczność oczekuje dziś bardziej dopracowanych doświadczeń. Analizujemy, jak lokale odpowiadają na ten miejski trend.", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop" },
      { title: "Rozrywka z charakterem: miejsca, które budują własny styl", excerpt: "Nie chodzi już tylko o to, co dzieje się w środku. Wnętrza, światło i detale coraz częściej decydują o tym, gdzie chcemy wracać.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miejskie wyjścia bez spiny: formaty, które naprawdę działają", excerpt: "Bydgoszczanie coraz chętniej wybierają lżejsze, bardziej swobodne wydarzenia. Sprawdzamy, które pomysły trafiają dziś najlepiej.", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop" },
      { title: "Gdzie zaczyna się wieczór: top lokalizacje na spokojny start", excerpt: "Miasto coraz lepiej rozkłada energię wieczoru. Zobacz, które miejsca działają jako pierwszy przystanek przed dalszym wyjściem.", imageUrl: "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe pomysły na wyjście ze znajomymi w Bydgoszczy", excerpt: "Nie tylko klasyczne bary i kluby. Rośnie liczba formatów, które łączą muzykę, jedzenie i lifestylowy klimat w jednym miejscu.", imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoszcz po godzinach: miejsca, które wyglądają lepiej niż kiedykolwiek", excerpt: "Nowa estetyka miejskiej rozrywki wchodzi na kolejny poziom. Patrzymy na lokale, które najlepiej wykorzystują światło, detal i atmosferę.", imageUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  kultura: {
    label: "Kultura",
    author: "Ewa Mazur",
    items: [
      { title: "Kulturalna mapa Bydgoszczy rośnie poza oczywistym centrum", excerpt: "Coraz więcej wydarzeń i inicjatyw dzieje się poza najbardziej znanymi adresami. Sprawdzamy, jak kultura rozlewa się po mieście.", imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop" },
      { title: "Wieczór ze sztuką: które formaty przyciągają dziś publiczność", excerpt: "Wystawy, performanse i spotkania autorskie zmieniają język opowiadania o kulturze. Zobacz, co przyciąga uwagę odbiorców.", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowa publiczność kultury: czego szukają młodsi odbiorcy", excerpt: "Kultura w mieście nie musi być zamknięta ani formalna. Analizujemy, jak instytucje uczą się nowego kontaktu z widzem.", imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop" },
      { title: "Teatralny sezon pod lupą: więcej emocji, mniej przewidywalności", excerpt: "Scena w Bydgoszczy odważniej testuje nowe formaty i tematy. Przyglądamy się temu, jak zmienia się odbiór lokalnych premier.", imageUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=1200&auto=format&fit=crop" },
      { title: "Galerie, które chcą rozmawiać z miastem, a nie tylko z widzem", excerpt: "Coraz więcej przestrzeni wystawienniczych wychodzi poza klasyczny model oglądania sztuki. Bydgoszcz szuka nowego języka ekspozycji.", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop" },
      { title: "Czy kultura może być codzienna? Bydgoszcz coraz częściej mówi: tak", excerpt: "Spotkania, mikrowystawy i działania sąsiedzkie pokazują, że kultura przestaje być wydarzeniem od święta.", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miasto dźwięku i obrazu: jak zmieniają się kulturalne formaty", excerpt: "Bydgoska scena łączy dziś muzykę, wideo, instalację i performance. Patrzymy na projekty, które mieszają dyscypliny.", imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop" },
      { title: "Publiczność wraca po doświadczenie, nie tylko program", excerpt: "Program to już za mało. W kulturze coraz ważniejsze stają się atmosfera, opowieść i sposób wejścia widza w wydarzenie.", imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop" },
      { title: "Jak Bydgoszcz opowiada o sztuce nowocześnie i bez nadęcia", excerpt: "Lżejszy język, lepsza komunikacja i odważniejsza identyfikacja wizualna pomagają kulturze wyjść bliżej mieszkańców.", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miejskie instytucje szukają nowej energii i lepiej to widać", excerpt: "Bydgoszcz wyraźnie inwestuje w jakość kontaktu z odbiorcą. Przyglądamy się, które przestrzenie robią to najlepiej.", imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  biznes: {
    label: "Biznes",
    author: "Anna Kowalska",
    items: [
      { title: "Lokalne marki rosną szybciej, gdy opowiadają własny styl", excerpt: "W biznesie coraz ważniejsze stają się nie tylko produkt i cena, ale też charakter marki. Sprawdzamy, jak wykorzystują to firmy z Bydgoszczy.", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" },
      { title: "Małe firmy, duża jakość: bydgoski biznes coraz bardziej świadomy", excerpt: "Przedsiębiorcy stawiają dziś na dopracowany produkt, obsługę i estetykę. To zmienia lokalny rynek szybciej, niż się wydaje.", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop" },
      { title: "Praca w mieście po nowemu: co przyciąga specjalistów do Bydgoszczy", excerpt: "Nie tylko pensja ma znaczenie. Patrzymy na to, jak firmy budują środowisko pracy, które pomaga zatrzymać talenty na miejscu.", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop" },
      { title: "Coworking, showroom, studio: biznes miesza dziś funkcje", excerpt: "Coraz więcej lokalnych marek działa hybrydowo. To trend, który dobrze pasuje do miejskiego stylu życia i elastycznej pracy.", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowa przedsiębiorczość w Bydgoszczy stawia na jakość doświadczenia", excerpt: "Klienci oczekują dziś spójnego kontaktu z marką. Lokalne biznesy odpowiadają na to wnętrzem, tonem komunikacji i detalem.", imageUrl: "https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1200&auto=format&fit=crop" },
      { title: "Mikrobiznes z charakterem: dlaczego lokalność znowu działa", excerpt: "Coraz więcej klientów wybiera firmy, które są blisko, mają własny język i potrafią opowiedzieć, dlaczego istnieją.", imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe usługi dla miasta: jak biznes odpowiada na zmianę stylu życia", excerpt: "Rosnące znaczenie wygody, szybkości i estetyki widać dziś w wielu nowych przedsięwzięciach w Bydgoszczy.", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop" },
      { title: "Lokalni twórcy marek coraz pewniej wychodzą poza region", excerpt: "Bydgoskie firmy uczą się skalować bez utraty tożsamości. To właśnie lokalny charakter staje się ich przewagą.", imageUrl: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop" },
      { title: "Biznes i estetyka: dlaczego wygląd marki coraz więcej znaczy", excerpt: "Projekt, komunikacja i doświadczenie klienta stały się pełnoprawnym elementem strategii lokalnych firm.", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoszcz jako miejsce do rozwoju: co mówią nowi przedsiębiorcy", excerpt: "Miasto zyskuje reputację miejsca, w którym da się budować nowoczesny biznes bez presji największych metropolii.", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  gastronomia: {
    label: "Gastronomia",
    author: "Piotr Kowalski",
    items: [
      { title: "Śniadania w mieście: bydgoskie adresy, które mają własny klimat", excerpt: "Poranne wyjścia stały się częścią miejskiego stylu życia. Zobacz, jak lokale budują ofertę wokół jakości i atmosfery.", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop" },
      { title: "Gastronomia bliżej rzeki: dlaczego lokalizacja znowu ma znaczenie", excerpt: "Nadbrzeżne lokale zyskują nową energię. W Bydgoszczy jedzenie coraz częściej łączy się z widokiem i doświadczeniem miejsca.", imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop" },
      { title: "Karta sezonowa wraca do gry i dobrze to działa", excerpt: "Lokale stawiają na krótsze menu i bardziej świadome użycie składników. To trend, który widać już w wielu bydgoskich adresach.", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowa generacja kawiarni: nie tylko kawa, ale cały nastrój miejsca", excerpt: "Dziś liczy się nie tylko napój, ale też światło, muzyka, estetyka i to, jak chcesz zostać w takim miejscu dłużej.", imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop" },
      { title: "Kolacja bez pośpiechu: lokale, które stawiają na rytm wieczoru", excerpt: "Bydgoska gastronomia coraz chętniej proponuje doświadczenie, a nie tylko szybką obsługę. To dobrze widać po nowych konceptach.", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop" },
      { title: "Smaki miasta: jak lokalne produkty wracają do nowoczesnej kuchni", excerpt: "Regionalność nie musi być ciężka ani nostalgiczna. Szefowie kuchni coraz częściej przekładają ją na współczesny język talerza.", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop" },
      { title: "Gdzie zjeść i zostać na dłużej: miejsca, które dobrze wyglądają i smakują", excerpt: "Design wnętrza i jakość jedzenia zaczynają iść w parze. W Bydgoszczy rośnie liczba lokali, które rozumieją ten duet.", imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miejska kuchnia bez zadęcia: prostota znów działa najlepiej", excerpt: "Goście coraz częściej szukają szczerości smaku, a nie nadmiernego efektu. Lokalne menu stają się prostsze i bardziej świadome.", imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoskie wieczory przy stole: co dziś buduje dobry lokal", excerpt: "Liczy się nie tylko menu, ale też akustyka, światło, tempo obsługi i poczucie, że miejsce ma własny charakter.", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe otwarcia w gastronomii: których trendów jest dziś najwięcej", excerpt: "Od konceptów lunchowych po bardziej dopracowane wine bary. Patrzymy, co najmocniej rośnie w bydgoskiej gastronomii.", imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  bydgoszczanie: {
    label: "Bydgoszczanie",
    author: "Magdalena Wróbel",
    items: [
      { title: "Ludzie miasta: twórcy, którzy nadają Bydgoszczy własny ton", excerpt: "Za marką miasta stoją konkretne osoby. Poznaj ludzi, którzy pracują na jego charakter w kulturze, biznesie i codziennym życiu.", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miejscy bohaterowie codzienności: historie, które warto usłyszeć", excerpt: "Nie zawsze są na pierwszych stronach, ale to oni budują jakość życia w mieście. Zbieramy sylwetki osób z prawdziwą energią działania.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe pokolenie bydgoszczan wybiera własną drogę rozwoju", excerpt: "Coraz więcej młodych ludzi decyduje się budować życie i projekty właśnie tutaj. Rozmawiamy o ambicji bez kompleksów.", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop" },
      { title: "Miasto od środka: jak mieszkańcy opowiadają dziś o Bydgoszczy", excerpt: "Zmienia się język miejskiej tożsamości. Bydgoszczanie coraz odważniej mówią o tym, co w ich mieście naprawdę działa.", imageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop" },
      { title: "Portrety miejskie: osoby, które inspirują stylem działania", excerpt: "Nie chodzi tylko o sukces, ale o sposób bycia, komunikację i wpływ na lokalne środowisko. To właśnie te cechy łączą bohaterów tej sekcji.", imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop" },
      { title: "Bydgoszczanie, których warto znać zanim zrobi się o nich głośno", excerpt: "Ciche projekty często okazują się najciekawsze. Szukamy osób, które już dziś zmieniają lokalny krajobraz twórczości i pracy.", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop" },
      { title: "Rozmowy o mieście: mieszkańcy, którzy patrzą dalej niż własne podwórko", excerpt: "Bydgoszcz budują ludzie z inicjatywą. Zbieramy historie osób, które łączą lokalność z nowoczesnym spojrzeniem na rozwój.", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop" },
      { title: "Styl życia po bydgosku: kim są ludzie, którzy nadają trend", excerpt: "Miasto ma własny rytm i własnych liderów. Przyglądamy się tym, którzy tworzą jego współczesny klimat nie przez deklaracje, ale przez działanie.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop" },
      { title: "Twórcy, organizatorzy, przedsiębiorcy: nowa twarz lokalnej energii", excerpt: "Bydgoszczanie coraz częściej łączą kilka ról naraz. To właśnie na styku branż rodzi się dziś najciekawsza miejska dynamika.", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop" },
      { title: "Historie ludzi, którzy nie potrzebują wielkiego miasta, by robić wielkie rzeczy", excerpt: "Lokalna skala staje się atutem, nie ograniczeniem. Pokazujemy osoby, które w Bydgoszczy budują projekty z dużą jakością i ambicją.", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  medyczna: {
    label: "Medyczna Bydgoszcz",
    author: "dr Joanna Malinowska",
    items: [
      { title: "Zdrowie w mieście: jak zmienia się dostęp do codziennej opieki", excerpt: "Medycyna lokalna to nie tylko szpitale. Sprawdzamy, jak rozwijają się usługi, profilaktyka i komfort pacjenta w Bydgoszczy.", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop" },
      { title: "Profilaktyka bliżej mieszkańców: co działa najlepiej w praktyce", excerpt: "Badania przesiewowe i edukacja zdrowotna są coraz lepiej komunikowane. Analizujemy, które działania naprawdę przyciągają mieszkańców.", imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop" },
      { title: "Medyczna Bydgoszcz coraz bardziej stawia na doświadczenie pacjenta", excerpt: "Nowoczesna opieka to dziś nie tylko sprzęt, ale też komunikacja, dostępność i poczucie bezpieczeństwa w kontakcie z placówką.", imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop" },
      { title: "Zdrowe tempo życia: jak miasto uczy codziennej profilaktyki", excerpt: "Ruch, sen, dieta i regularne kontrole to proste filary zdrowia. Patrzymy, jak lokalne inicjatywy przekładają teorię na codzienność.", imageUrl: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe standardy opieki: czego oczekują dziś pacjenci", excerpt: "Rosną oczekiwania wobec jakości kontaktu i organizacji leczenia. Bydgoskie placówki coraz częściej odpowiadają na te potrzeby.", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop" },
      { title: "Medycyna bardziej zrozumiała: prosty język i lepsza komunikacja", excerpt: "Pacjent chce wiedzieć, co go czeka. Przyglądamy się, jak placówki upraszczają informację i budują zaufanie.", imageUrl: "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?q=80&w=1200&auto=format&fit=crop" },
      { title: "Lokalna opieka zdrowotna a styl życia mieszkańców", excerpt: "Bydgoszcz coraz wyraźniej łączy zdrowie z codziennymi nawykami i profilaktyką, nie tylko z interwencją w kryzysie.", imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop" },
      { title: "Kiedy zdrowie staje się częścią miejskiego planu na tydzień", excerpt: "Coraz więcej mieszkańców włącza badania, konsultacje i aktywność do zwykłego rytmu życia. To zmienia sposób myślenia o profilaktyce.", imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1200&auto=format&fit=crop" },
      { title: "Nowe podejście do zdrowia psychicznego w lokalnej rozmowie", excerpt: "Medyczna Bydgoszcz coraz częściej uwzględnia temat dobrostanu psychicznego, wsparcia i codziennej higieny emocji.", imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop" },
      { title: "Zdrowie bliżej domu: rola małych placówek i szybkiego dostępu", excerpt: "Nie każda dobra medycyna musi być wielkim systemem. Czasem o jakości opieki decyduje bliskość, prostota i sprawna organizacja.", imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
};

export const seedCategoryLibraryArticles = mutation({
  args: {
    perCategory: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;
    const now = Date.now();
    const categoryEntries = Object.entries(categorySeedLibrary);
    const perCategory = Math.max(1, Math.min(args.perCategory ?? 5, 10));

    for (const [category, config] of categoryEntries) {
      for (const [index, item] of config.items.slice(0, perCategory).entries()) {
        const slug = normalizeSeedSlug(`${category}-${item.title}`);
        const existing = await ctx.db
          .query("articles")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();

        if (existing) {
          skipped += 1;
          continue;
        }

        const publishedAt = now - ((index + 1) * 3_600_000) - (inserted * 60_000);

        await ctx.db.insert("articles", {
          title: item.title,
          excerpt: item.excerpt,
          content: buildSeedContent(config.label, item.title, item.excerpt),
          category: category as "miasto" | "rozrywka" | "kultura" | "biznes" | "gastronomia" | "bydgoszczanie" | "medyczna",
          imageUrl: item.imageUrl,
          author: config.author,
          publishedAt,
          featured: index < 2,
          tags: [config.label, "Bydgoszcz", "Przykladowy"],
          slug,
          status: "published",
          seoTitle: `${item.title} | ${config.label} | Love Bydgoszcz`,
          seoDescription: item.excerpt,
          allowComments: true,
          showUpdates: false,
        });

        inserted += 1;
      }
    }

    return {
      inserted,
      skipped,
      total: inserted + skipped,
      categoriesSeeded: categoryEntries.length,
      perCategory,
    };
  },
});

export const seedArticles = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = [
      {
        title: "Bydgoski Węzeł Wodny: Historia i Przyszłość Miasta nad Brdą",
        excerpt: "Brda to serce Bydgoszczy. Poznaj fascynującą historię Bydgoskiego Węzła Wodnego, który od wieków kształtuje tożsamość miasta, oraz ambitne plany jego dalszej rewitalizacji i wykorzystania turystycznego.",
        content: "Bydgoszcz od zawsze żyła z rzeki i dla rzeki. Bydgoski Węzeł Wodny to unikalny w skali europejskiej system dróg wodnych, łączący Wisłę z Odrą poprzez Brdę, Kanał Bydgoski i Noteć. Historia tego miejsca sięga XVIII wieku, kiedy to budowa Kanału Bydgoskiego otworzyła nowe perspektywy handlowe, czyniąc miasto kluczowym punktem na mapie transportowej kontynentu. Dziś rzeka nie służy już głównie transportowi towarów, ale stała się salonem miasta. Rewitalizacja bulwarów, budowa nowoczesnych przystani, takich jak Marina Bydgoszcz, oraz przywrócenie żeglugi pasażerskiej (Bydgoski Tramwaj Wodny) to tylko początek. Miasto planuje kolejne inwestycje, w tym odnowienie historycznych śluz oraz stworzenie nowych ścieżek edukacyjnych wzdłuż starego kanału. Bydgoszczanie coraz chętniej spędzają czas nad wodą, korzystając z wypożyczalni kajaków i rowerów wodnych, co potwierdza, że powrót miasta nad rzekę jest procesem nie tylko architektonicznym, ale przede wszystkim społecznym. Woda w Bydgoszczy to nie tylko krajobraz, to styl życia, który przyciąga turystów szukających spokoju i kontaktu z naturą w samym centrum metropolii.",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1517733948473-98921171d210?q=80&w=1000&auto=format&fit=crop",
        author: "Anna Nowak",
        publishedAt: Date.now(),
        featured: true,
        tags: ["Brda", "historia", "rewitalizacja"]
      },
      {
        title: "Opera Nova: Architektoniczna Perła i Światowa Scena Baletowa",
        excerpt: "Trzy kręgi Opery Nova to jeden z najbardziej rozpoznawalnych symboli Bydgoszczy. Dowiedz się, jak powstawał ten monumentalny obiekt i dlaczego Bydgoski Festiwal Operowy przyciąga największe gwiazdy z całego świata.",
        content: "Budowa Opery Nova trwała ponad 30 lat, ale efekt końcowy przeszedł najśmielsze oczekiwania. Charakterystyczne trzy kręgi wpisały się na stałe w panoramę miasta, tworząc harmonijną całość z zakolem Brdy. Dziś Opera Nova to jedna z najnowocześniejszych scen w Polsce, dysponująca nie tylko imponującą salą widowiskową, ale także profesjonalnym zapleczem technicznym. To tutaj odbywa się prestiżowy Bydgoski Festiwal Operowy, który co roku gromadzi wybitnych artystów z najbardziej znanych teatrów operowych świata. Festiwal to nie tylko spektakle, to wielkie święto kultury, które promuje Bydgoszcz jako ważny ośrodek sztuki wysokiej. Poza festiwalem, opera oferuje bogaty repertuar – od klasycznych oper Verdiego i Pucciniego, przez widowiskowe balety, aż po nowoczesne musicale. Warto również wspomnieć o czwartym kręgu, który jest obecnie w budowie i ma stać się nowoczesnym centrum kongresowym, jeszcze bardziej zwiększając potencjał tego miejsca. Opera Nova to dowód na to, że determinacja w dążeniu do celu pozwala stworzyć coś, co przetrwa pokolenia i będzie powodem do dumy dla wszystkich mieszkańców regionu.",
        category: "kultura",
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1000&auto=format&fit=crop",
        author: "Marek Wiśniewski",
        publishedAt: Date.now() - 3600000,
        tags: ["opera", "balet", "architektura"]
      },
      {
        title: "Bydgoski Park Przemysłowy: Silnik Gospodarczy Regionu",
        excerpt: "Setki hektarów, tysiące miejsc pracy i globalne marki. Sprawdzamy, jak Bydgoski Park Przemysłowo-Technologiczny przyciąga inwestorów i jak wpływa na rozwój lokalnego rynku pracy w sektorze nowoczesnych technologii.",
        content: "Bydgoski Park Przemysłowo-Technologiczny (BPPT) to miejsce, gdzie tradycja przemysłowa Bydgoszczy spotyka się z nowoczesnym biznesem. Położony na terenach dawnych zakładów chemicznych, park stał się magnesem dla firm z branży logistycznej, produkcyjnej oraz IT. Dzięki doskonałemu skomunikowaniu z drogami ekspresowymi S5 i S10 oraz bliskości lotniska, BPPT oferuje idealne warunki do rozwoju. Obecnie na jego terenie działa ponad 150 firm, które zatrudniają tysiące osób, znacząco obniżając poziom bezrobocia w regionie. Miasto nieustannie inwestuje w infrastrukturę parku, budując nowe drogi, oświetlenie oraz sieci telekomunikacyjne. Ważnym elementem BPPT jest również Inkubator Przedsiębiorczości, który wspiera młode startupy w ich pierwszych krokach na rynku. To tutaj rodzą się innowacyjne rozwiązania, które później trafiają na rynki całego świata. Rozwój parku to nie tylko korzyści ekonomiczne, ale także impuls do zmian w szkolnictwie zawodowym i wyższym – uczelnie coraz ściślej współpracują z biznesem, dostosowując programy nauczania do realnych potrzeb pracodawców. BPPT to fundament stabilności gospodarczej Bydgoszczy, który pozwala z optymizmem patrzeć w przyszłość.",
        category: "biznes",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
        author: "Tomasz Zieliński",
        publishedAt: Date.now() - 7200000,
        tags: ["biznes", "inwestycje", "praca"]
      },
      {
        title: "Tajemnice Exploseum: Podróż w Czasie do Fabryki DAG Fabrik Bromberg",
        excerpt: "Ukryte w lesie betonowe konstrukcje skrywają mroczną historię II wojny światowej. Exploseum to unikalne muzeum, które w poruszający sposób opowiada o pracy przymusowej i technice produkcji materiałów wybuchowych.",
        content: "Exploseum to jedno z najbardziej niezwykłych muzeów w Polsce, a może i w Europie. Mieści się w dawnej fabryce materiałów wybuchowych DAG Fabrik Bromberg, zbudowanej przez III Rzeszę w czasie okupacji. Podziemne tunele, potężne hale produkcyjne i systemy zabezpieczeń robią ogromne wrażenie na zwiedzających. Trasa turystyczna prowadzi przez kilka budynków połączonych tunelami, a multimedialne wystawy przybliżają nie tylko procesy chemiczne, ale przede wszystkim tragiczne losy tysięcy robotników przymusowych, którzy pracowali tu w nieludzkich warunkach. Muzeum nie ogranicza się tylko do historii wojny – pokazuje również rozwój techniki militarnej na przestrzeni wieków oraz wpływ odkryć Nobla na losy świata. Exploseum to miejsce refleksji nad ciemną stroną ludzkiego geniuszu. Otoczone gęstym lasem, budynki fabryki były doskonale zamaskowane przed nalotami alianckimi, co pozwoliło im przetrwać do dziś w niemal nienaruszonym stanie. Wizyta tutaj to obowiązkowy punkt dla każdego miłośnika historii i architektury przemysłowej. To lekcja, której nie da się zapomnieć, przypominająca o cenie, jaką ludzkość płaci za postęp napędzany konfliktami zbrojnymi.",
        category: "kultura",
        imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=1000&auto=format&fit=crop",
        author: "Marek Wiśniewski",
        publishedAt: Date.now() - 10800000,
        tags: ["muzeum", "historia", "wojna"]
      },
      {
        title: "Kulinarna Bydgoszcz: Gdzie Smaki Tradycji Spotykają Nowoczesność",
        excerpt: "Od gęsiny po rzemieślnicze piwa – bydgoska gastronomia przeżywa swój renesans. Odkrywamy najlepsze restauracje na Wyspie Młyńskiej i w okolicach Starego Rynku, które zachwycają najbardziej wymagających smakoszy.",
        content: "Bydgoszcz staje się coraz ważniejszym punktem na kulinarnej mapie Polski. Sercem gastronomii jest bez wątpienia Wyspa Młyńska i Stary Rynek, gdzie w zabytkowych kamienicach i nowoczesnych pawilonach działają lokale serwujące dania z całego świata. Jednak to lokalne produkty są tym, co wyróżnia Bydgoszcz. Gęsina kujawska, serwowana na wiele sposobów, to absolutny hit jesiennych menu. Restauratorzy coraz częściej sięgają po zapomniane przepisy kuchni regionalnej, nadając im nowoczesny sznyt. Nie można zapomnieć o tradycjach piwowarskich – Warzelnia Piwa przy samej Brdzie to miejsce, gdzie można spróbować trunków warzonych na miejscu, podziwiając jednocześnie widok na rzekę. Dla miłośników kawy Bydgoszcz oferuje liczne palarnie i kawiarnie specialty, takie jak Bromberg Kaffee, gdzie aromat świeżo mielonych ziaren przyciąga przechodniów już z daleka. Gastronomia to jednak nie tylko jedzenie, to także atmosfera. Letnie ogródki nad rzeką, festiwale food trucków i nocne targi śniadaniowe sprawiają, że miasto tętni życiem o każdej porze dnia. Bydgoscy szefowie kuchni to pasjonaci, którzy nie boją się eksperymentować, łącząc smaki Azji czy Ameryki z tym, co najlepsze w naszych lasach i polach. To sprawia, że każda wizyta w bydgoskiej restauracji to nowa, fascynująca przygoda.",
        category: "gastronomia",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
        author: "Piotr Kowalski",
        publishedAt: Date.now() - 14400000,
        tags: ["jedzenie", "restauracje", "kuchnia"]
      },
      {
        title: "Myślęcinek: Największy Park Miejski w Polsce Zaprasza",
        excerpt: "Leśny Park Kultury i Wypoczynku to ponad 800 hektarów zieleni w granicach miasta. Sprawdź, jakie atrakcje czekają na Ciebie w Myślęcinku – od ogrodu zoologicznego po stoki narciarskie i trasy rowerowe.",
        content: "Myślęcinek to prawdziwy skarb Bydgoszczy. To tutaj mieszkańcy uciekają od zgiełku miasta, by odetchnąć świeżym powietrzem i aktywnie spędzić czas. Park oferuje atrakcje dla każdego, niezależnie od wieku czy zainteresowań. Ogród Fauny Polskiej to unikalne ZOO, skupiające się na rodzimych gatunkach zwierząt, co czyni je doskonałym miejscem edukacyjnym dla dzieci. Ogród Botaniczny z malowniczymi stawami i alpinarium to z kolei raj dla spacerowiczów i fotografów. Dla fanów adrenaliny Myślęcinek przygotował park linowy, pole do paintballa oraz stok narciarski, który zimą cieszy się ogromną popularnością. Latem park zamienia się w centrum koncertowe i festiwalowe, goszcząc największe gwiazdy polskiej sceny muzycznej. Kilometry ścieżek rowerowych i biegowych pozwalają na uprawianie sportu w otoczeniu natury, a liczne polany grillowe sprzyjają rodzinnym piknikom. Myślęcinek to także Centrum Edukacji Ekologicznej, które uczy, jak dbać o środowisko. To miejsce pokazuje, że Bydgoszcz to miasto zielone, które dba o jakość życia swoich mieszkańców. Niezależnie od pory roku, Myślęcinek zawsze ma coś do zaoferowania – od wiosennych spacerów wśród kwitnących drzew, po jesienne biegi przełajowe w kolorowej scenerii lasu.",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop",
        author: "Anna Nowak",
        publishedAt: Date.now() - 18000000,
        tags: ["natura", "park", "relaks"]
      },
      {
        title: "Sportowa Bydgoszcz: Od Lekkoatletyki po Żużlowe Emocje",
        excerpt: "Bydgoszcz to miasto sportu. Poznaj historię sukcesów Zawiszy, poczuj magię stadionu Polonii i dowiedz się, dlaczego nasze miasto jest uznawane za światową stolicę lekkoatletyki.",
        content: "Sport jest wpisany w DNA Bydgoszczy. Miasto posiada infrastrukturę, której mogą pozazdrościć mu inne metropolie. Stadion Zawiszy im. Zdzisława Krzyszkowiaka to arena, na której bito rekordy świata i gościły największe gwiazdy światowej lekkoatletyki. To tutaj odbywają się prestiżowe mityngi, takie jak Irena Szewińska Memorial, przyciągające tysiące kibiców. Ale Bydgoszcz to nie tylko bieżnia. Żużel to religia dla wielu mieszkańców – mecze Polonii Bydgoszcz to widowiska pełne adrenaliny i rywalizacji na najwyższym poziomie. Atmosfera na stadionie przy ul. Sportowej jest jedyna w swoim rodzaju. Miasto odnosi sukcesy również w wioślarstwie i kajakarstwie, co jest naturalne przy tak bliskim związku z rzeką. Bydgoscy wioślarze regularnie przywożą medale z Igrzysk Olimpijskich i Mistrzostw Świata. Nie można zapomnieć o koszykówce (Astoria) i siatkówce, które również mają rzesze oddanych fanów. Bydgoszcz inwestuje w sport dzieci i młodzieży, budując nowe orliki, baseny i hale sportowe. Dzięki temu rosną kolejne pokolenia mistrzów, którzy z dumą reprezentują miasto na arenie międzynarodowej. Sport w Bydgoszczy to nie tylko wyniki, to przede wszystkim wspólnota, emocje i promocja zdrowego stylu życia wśród wszystkich pokoleń.",
        category: "rozrywka",
        imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop",
        author: "Ewa Mazur",
        publishedAt: Date.now() - 21600000,
        tags: ["sport", "emocje", "zawisza"]
      },
      {
        title: "Teatr Polski: Scena Odważnych Pytań i Nowoczesnej Formy",
        excerpt: "Teatr Polski w Bydgoszczy od lat wyznacza trendy w polskim życiu teatralnym. Analizujemy fenomen bydgoskiej sceny, która nie boi się trudnych tematów i eksperymentalnych inscenizacji.",
        content: "Teatr Polski im. Hieronima Konieczki to jedna z najważniejszych instytucji kultury w regionie i jeden z najbardziej cenionych teatrów w kraju. Jego siłą jest odwaga w podejmowaniu tematów aktualnych, często kontrowersyjnych, ale zawsze ważnych społecznie. Bydgoska scena to miejsce spotkań wybitnych reżyserów i utalentowanego zespołu aktorskiego, który nie boi się wyzwań. Spektakle Teatru Polskiego regularnie zdobywają nagrody na najważniejszych festiwalach teatralnych w Polsce i za granicą. Ważnym elementem działalności jest Festiwal Prapremier, który skupia się na nowych tekstach i świeżym spojrzeniu na dramaturgię. Teatr to jednak nie tylko budynek przy al. Mickiewicza – to liczne projekty edukacyjne, warsztaty dla seniorów i młodzieży oraz czytania performatywne w nietypowych przestrzeniach miasta. Obecnie budynek przechodzi gruntowną modernizację, która ma dostosować go do wymogów XXI wieku, zachowując jednocześnie jego historyczny charakter. Teatr Polski to serce intelektualne Bydgoszczy, miejsce, które zmusza do myślenia, prowokuje do dyskusji i pozwala spojrzeć na świat z innej perspektywy. To tutaj kultura staje się żywym dialogiem z widzem, a każda premiera jest wydarzeniem, o którym mówi się długo po opadnięciu kurtyny.",
        category: "kultura",
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1000&auto=format&fit=crop",
        author: "Ewa Mazur",
        publishedAt: Date.now() - 25200000,
        tags: ["teatr", "sztuka", "kultura"]
      },
      {
        title: "Bydgoska Wenecja: Najbardziej Romantyczny Zakątek Miasta",
        excerpt: "Kamienice wyrastające wprost z wody, urokliwe mostki i kawiarniane ogródki. Odkryj magię Bydgoskiej Wenecji – miejsca, które zachwyca o każdej porze dnia i nocy.",
        content: "Bydgoska Wenecja to fragment Starego Miasta, który swoją nazwę zawdzięcza malowniczemu położeniu nad Młynówką. To tutaj rzędy zabytkowych kamienic przeglądają się w lustrze wody, tworząc widok, który zapiera dech w piersiach. Niegdyś była to dzielnica rzemieślników i drobnych przedsiębiorców, dziś to centrum życia towarzyskiego i artystycznego. Spacer wąskimi uliczkami, przejście przez Mostek Kiepury czy odpoczynek na schodach przy rzece to punkty obowiązkowe każdej wizyty w Bydgoszczy. Wieczorem, gdy budynki są pięknie iluminowane, a z kawiarni dobiega muzyka, Wenecja nabiera magicznego charakteru. To ulubione miejsce zakochanych i artystów szukających inspiracji. Wiele kamienic przeszło w ostatnich latach renowację, odzyskując dawny blask i mieszcząc w swoich wnętrzach stylowe apartamenty, galerie sztuki oraz przytulne restauracje. Bydgoska Wenecja to także miejsce, gdzie odbywają się liczne wydarzenia plenerowe, takie jak koncerty na wodzie czy pokazy kina letniego. To tutaj najlepiej czuć ducha dawnej Bydgoszczy, która potrafiła harmonijnie połączyć architekturę z naturalnym biegiem rzeki. To miejsce, które udowadnia, że piękno tkwi w szczegółach – w odbiciu ceglanej ściany w wodzie, w zapachu kawy o poranku i w szumie rzeki, która od wieków płynie tym samym korytem.",
        category: "rozrywka",
        imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
        author: "Piotr Kowalski",
        publishedAt: Date.now() - 28800000,
        tags: ["wenecja", "spacer", "romantyzm"]
      },
      {
        title: "Innowacje i Nauka: Jak Bydgoskie Uczelnie Kształtują Przyszłość",
        excerpt: "Uniwersytet Kazimierza Wielkiego, Politechnika Bydgoska i Collegium Medicum to filary nauki w regionie. Sprawdzamy, jakie nowoczesne kierunki studiów i projekty badawcze przyciągają studentów z całej Polski.",
        content: "Bydgoszcz to silny ośrodek akademicki, w którym kształci się ponad 30 tysięcy studentów. Trzy główne uczelnie publiczne – UKW, Politechnika Bydgoska oraz Collegium Medicum UMK – stanowią fundament rozwoju intelektualnego miasta. Politechnika Bydgoska, po niedawnej transformacji z uniwersytetu technologicznego, stawia na silną współpracę z przemysłem, oferując kierunki takie jak mechatronika, odnawialne źródła energii czy nowoczesne projektowanie. UKW to z kolei centrum nauk humanistycznych, społecznych i przyrodniczych, które dynamicznie rozwija swoją bazę badawczą. Collegium Medicum to jedna z najlepszych uczelni medycznych w kraju, kształcąca lekarzy i farmaceutów na światowym poziomie. Bydgoskie uczelnie to nie tylko sale wykładowe, to nowoczesne laboratoria, w których prowadzone są badania nad nowymi materiałami, lekami czy technologiami IT. Miasto wspiera studentów poprzez systemy stypendialne oraz współpracę z biznesem, co ułatwia start zawodowy absolwentom. Życie studenckie w Bydgoszczy to także liczne koła naukowe, festiwale nauki i juwenalia, które dodają miastu energii. Inwestycja w naukę to inwestycja w przyszłość Bydgoszczy, która staje się coraz bardziej atrakcyjnym miejscem dla młodych, ambitnych ludzi szukających wysokiej jakości edukacji i dobrych perspektyw zawodowych.",
        category: "biznes",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
        author: "Tomasz Zieliński",
        publishedAt: Date.now() - 32400000,
        tags: ["nauka", "studia", "przyszłość"]
      }
    ];

    for (const article of articles) {
      await ctx.db.insert("articles", article as any);
    }
    return `Successfully seeded ${articles.length} new articles with rich content.`;
  },
});

export const seedLifestyleNews = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = [
      {
        title: "Nowy trend w Bydgoszczy: Kawiarnie specialty przejmują Śródmieście. Gdzie wypijesz najlepszą kawę?",
        excerpt: "Zapomnij o sieciówkach. Bydgoszczanie pokochali alternatywne metody parzenia kawy i ziarna z małych palarni. Sprawdziliśmy, które lokale w centrum miasta serwują napar, dla którego warto wstać z łóżka. Od dripa po chemex – oto przewodnik po kawowej mapie Bydgoszczy, który musisz znać.",
        content: "Kultura picia kawy w Bydgoszczy przeszła w ostatnich latach prawdziwą rewolucję. Jeszcze dekadę temu szczytem wyrafinowania było latte z syropem w jednej z popularnych sieciówek. Dziś mieszkańcy miasta coraz częściej wybierają małe, niezależne kawiarnie, w których bariści z pasją opowiadają o profilach smakowych ziaren z Etiopii czy Kolumbii.\n\nSpacerując ulicą Gdańską czy Dworcową, co krok można natknąć się na szyldy zapraszające na 'specialty coffee'. Co to właściwie oznacza? To kawa najwyższej jakości, oceniana na minimum 80 punktów w 100-punktowej skali przez certyfikowanych Q-graderów. Ziarna są jasno palone, co pozwala wydobyć z nich naturalne, owocowe lub kwiatowe nuty, zamiast goryczy charakterystycznej dla ciemnego palenia.\n\nJednym z pionierów tego trendu w Bydgoszczy jest kawiarnia 'Landschaft', która od lat edukuje podniebienia mieszkańców. To tam wielu bydgoszczan po raz pierwszy spróbowało kawy z dripa czy aeropressu. Dziś dołączają do nich kolejne lokale, takie jak 'Parzymy Tutaj' czy 'Bromberg Kaffee', które nie tylko serwują świetną kawę, ale też same wypalają ziarna.\n\nFenomen kawiarni specialty to jednak nie tylko sam napój. To także unikalna atmosfera. Wnętrza tych lokali często charakteryzują się minimalistycznym, skandynawskim designem, dużą ilością roślin i przyjazną, nieformalną obsługą. To miejsca, gdzie można przyjść z laptopem popracować, spotkać się ze znajomymi, a nawet przyjść z psem – większość z nich jest 'pet-friendly'.\n\nRosnąca popularność alternatywnych metod parzenia pokazuje, że bydgoszczanie są otwarci na nowe smaki i cenią sobie jakość. Kawa przestała być tylko szybkim zastrzykiem kofeiny przed pracą, a stała się doświadczeniem, celebracją chwili. Jeśli jeszcze nie mieliście okazji spróbować kawy specialty, koniecznie wybierzcie się na spacer po Śródmieściu. Gwarantujemy, że po pierwszym łyku dobrze zaparzonego dripa, już nigdy nie spojrzycie na kawę tak samo.",
        category: "gastronomia",
        imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop",
        author: "Karolina Wiśniewska",
        publishedAt: Date.now(),
        featured: true,
        tags: ["kawa", "lifestyle", "kawiarnie", "śródmieście"]
      },
      {
        title: "Moda na vintage wraca do łask. Najlepsze second-handy i butiki z odzieżą z drugiej ręki w Bydgoszczy",
        excerpt: "Zrównoważona moda to już nie tylko puste hasło, ale styl życia wielu bydgoszczan. Zamiast kupować w sieciówkach, coraz chętniej szukamy unikalnych perełek w sklepach z odzieżą używaną. Gdzie w Bydgoszczy upolować markowe ubrania w świetnych cenach i dlaczego vintage jest teraz tak bardzo na topie?",
        content: "Jeszcze kilkanaście lat temu zakupy w 'lumpeksach' były dla wielu powodem do wstydu. Dziś to powód do dumy i wyznacznik dobrego stylu. Moda na vintage opanowała Bydgoszcz, a sklepy z odzieżą z drugiej ręki przeżywają prawdziwe oblężenie. I nie mówimy tu tylko o tradycyjnych second-handach z odzieżą na wagę, ale o starannie wyselekcjonowanych butikach vintage, które oferują prawdziwe modowe perełki.\n\nSkąd ta zmiana? Przede wszystkim rośnie nasza świadomość ekologiczna. Przemysł modowy jest jednym z najbardziej zanieczyszczających środowisko na świecie. Kupując ubrania z drugiej ręki, dajemy im nowe życie i zmniejszamy nasz ślad węglowy. To tzw. moda cyrkularna, która staje się coraz ważniejszym trendem na całym świecie.\n\nPo drugie, vintage to sposób na wyrażenie siebie. W dobie sieciówek, gdzie wszyscy wyglądają podobnie, ubrania z minionych dekad pozwalają stworzyć unikalny, niepowtarzalny styl. W bydgoskich butikach vintage można znaleźć jedwabne koszule z lat 80., oryginalne jeansy Levi's z lat 90. czy wełniane marynarki, których jakość wykonania bije na głowę współczesne produkcje.\n\nGdzie warto zajrzeć? Na ulicy Dworcowej i Gdańskiej znajdziemy kilka świetnych adresów. Warto też śledzić lokalne grupy na Facebooku i Instagramie, gdzie często organizowane są wyprzedaże szaf i pop-up store'y z modą vintage. Niektóre sklepy oferują również możliwość przeróbek krawieckich, dzięki czemu stare ubrania zyskują nowoczesny krój.\n\nModa na vintage to nie tylko trend, to zmiana myślenia o konsumpcji. Bydgoszczanie udowadniają, że można wyglądać stylowo, nie wydając fortuny i dbając o planetę. Następnym razem, gdy poczujecie potrzebę odświeżenia garderoby, zamiast do galerii handlowej, wybierzcie się na łowy do lokalnego second-handu. Kto wie, jakie skarby tam na was czekają?",
        category: "rozrywka",
        imageUrl: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1000&auto=format&fit=crop",
        author: "Marta Kowalczyk",
        publishedAt: Date.now() - 86400000,
        tags: ["moda", "vintage", "lifestyle", "zakupy"]
      },
      {
        title: "Weekendowy reset: 5 nieoczywistych miejsc na spacer w okolicach Bydgoszczy, o których nie miałeś pojęcia",
        excerpt: "Myślęcinek i Wyspa Młyńska to klasyki, ale Bydgoszcz i jej okolice kryją znacznie więcej zielonych tajemnic. Jeśli szukasz ucieczki od miejskiego zgiełku i chcesz odkryć nowe, malownicze trasy spacerowe, ten przewodnik jest dla Ciebie. Poznaj 5 miejsc, które zachwycą Cię spokojem i bliskością natury.",
        content: "Kiedy myślimy o spacerze w Bydgoszczy, pierwsze co przychodzi na myśl to Myślęcinek lub bulwary nad Brdą. To piękne miejsca, ale w weekendy bywają bardzo zatłoczone. Jeśli szukasz prawdziwego resetu i kontaktu z naturą w ciszy, warto poznać mniej oczywiste zakątki w mieście i jego najbliższych okolicach.\n\n1. **Dolina Pięciu Stawów (Szeder)** - Ukryta perła na bydgoskich Kapuściskach. To malowniczy teren z kaskadowo ułożonymi stawami, otoczony starodrzewiem. Idealne miejsce na krótki, relaksujący spacer. Jesienią drzewa mienią się tu niesamowitymi kolorami, a wiosną można podziwiać budzącą się do życia przyrodę.\n\n2. **Rezerwat Dziki Ostrów** - Położony niedaleko Brzozy, zaledwie kilkanaście minut jazdy od centrum Bydgoszczy. To unikalny las dębowo-grabowy, w którym można poczuć się jak w prastarej puszczy. Znajdziecie tu pomnikowe drzewa i rzadkie gatunki ptaków. To świetne miejsce dla miłośników fotografii przyrodniczej.\n\n3. **Ścieżka edukacyjna wzdłuż Starego Kanału Bydgoskiego (odcinek zachodni)** - O ile park nad starym kanałem w centrum jest dobrze znany, o tyle jego dalsza część, w kierunku Osowej Góry, jest znacznie dziksza i rzadziej uczęszczana. Spacer wzdłuż zarośniętych brzegów kanału, mijając stare śluzy, to prawdziwa podróż w czasie.\n\n4. **Puszcza Bydgoska - okolice Łochowa** - Puszcza Bydgoska to ogromny teren, ale warto zapuścić się w jej południowe rejony. Znajdziecie tam rozległe wrzosowiska, piaszczyste wydmy i sosnowe lasy, które pachną niesamowicie, szczególnie po deszczu. To idealne tereny na długie wędrówki z psem lub wycieczki rowerowe.\n\n5. **Jezioro Jezuickie (dzikie plaże)** - Zamiast popularnej plaży w Pieckach, warto poszukać dzikich zejść do wody od strony Prądocina. Znajdziecie tam małe, piaszczyste zatoczki, gdzie można w spokoju posiedzieć na brzegu, posłuchać szumu fal i odpocząć od zgiełku.\n\nOdkrywanie nowych miejsc to świetny sposób na spędzenie weekendu. Bydgoszcz i jej okolice mają do zaoferowania znacznie więcej, niż mogłoby się wydawać. Wystarczy tylko zboczyć z utartych szlaków.",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1000&auto=format&fit=crop",
        author: "Piotr Nowak",
        publishedAt: Date.now() - 172800000,
        tags: ["natura", "spacer", "weekend", "odkrywaj"]
      },
      {
        title: "Bydgoszcz po godzinach: Jak rozwija się kultura koktajlowa w mieście? Rozmawiamy z najlepszymi barmanami",
        excerpt: "Kolorowe drinki z palemką to już przeszłość. Bydgoska scena barowa wkracza na zupełnie nowy poziom. Autorskie receptury, infuzowane alkohole i spektakularne podanie – sprawdzamy, gdzie w Bydgoszczy wypijesz koktajle na światowym poziomie i jak zmieniają się gusta mieszkańców.",
        content: "Życie nocne w Bydgoszczy przeszło w ostatnich latach ogromną metamorfozę. Kluby z głośną muzyką i prostymi drinkami ustępują miejsca eleganckim cocktail barom, w których pierwsze skrzypce grają smak, jakość i kreatywność barmanów. Bydgoszczanie coraz częściej wychodzą 'na jednego drinka', ale oczekują, że będzie to doświadczenie na najwyższym poziomie.\n\n'Klienci są coraz bardziej świadomi i wymagający' – mówi Tomek, head bartender w jednym z popularnych lokali na Starym Mieście. 'Nie chcą już tylko słodkich, owocowych mieszanek. Pytają o klasyki, takie jak Negroni czy Old Fashioned, ale są też bardzo otwarci na nasze autorskie kompozycje. Często używamy lokalnych składników, robimy własne syropy, infuzujemy alkohole ziołami czy przyprawami.'\n\nSpacerując po bydgoskiej starówce, można znaleźć kilka miejsc, które wyznaczają trendy w miksologii. Lokale te często ukryte są w niepozornych kamienicach, nawiązując do tradycji barów 'speakeasy' z czasów prohibicji. Wnętrza zachwycają dbałością o detale – od oświetlenia, przez muzykę, aż po szkło, w którym serwowane są napoje.\n\nCo ciekawe, rośnie również popularność koktajli bezalkoholowych (tzw. mocktaili). 'To już nie jest tylko sok z wodą gazowaną' – tłumaczy Tomek. 'Tworzymy skomplikowane, wielowymiarowe kompozycje bez procentów, używając bezalkoholowych destylatów, kombuchy czy domowych kordiałów. Chcemy, aby goście, którzy nie piją alkoholu, również mogli cieszyć się pełnym doświadczeniem wizyty w cocktail barze.'\n\nRozwój kultury koktajlowej to kolejny dowód na to, że Bydgoszcz staje się miastem coraz bardziej kosmopolitycznym. To miejsca, gdzie można nie tylko napić się świetnego drinka, ale też porozmawiać z barmanem, poznać historię danego alkoholu i spędzić czas w wyjątkowej atmosferze. Jeśli szukacie pomysłu na wieczór, warto zarezerwować miejsce przy barze i dać się zaskoczyć.",
        category: "rozrywka",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
        author: "Michał Zieliński",
        publishedAt: Date.now() - 259200000,
        tags: ["koktajle", "życie nocne", "bary", "lifestyle"]
      },
      {
        title: "Młodzi przedsiębiorcy zmieniają oblicze Bydgoszczy. Poznaj twórców innowacyjnych lokalnych marek",
        excerpt: "Nie wyjeżdżają do Warszawy czy Londynu, ale zostają tutaj i tworzą niesamowite rzeczy. Bydgoszcz staje się inkubatorem dla kreatywnych biznesów. Od rzemieślniczych kosmetyków po innowacyjne aplikacje – przedstawiamy sylwetki młodych bydgoszczan, którzy udowadniają, że sukces można odnieść na własnym podwórku.",
        content: "Przez lata panowało przekonanie, że aby zrobić karierę i rozwinąć własny biznes, trzeba wyjechać z Bydgoszczy do większego ośrodka. Dziś to podejście drastycznie się zmienia. Młodzi, kreatywni ludzie coraz częściej decydują się na założenie firmy w swoim rodzinnym mieście, widząc w nim ogromny potencjał i chłonny rynek.\n\nJednym z takich przykładów jest marka naturalnych kosmetyków 'Brda Beauty' (nazwa zmieniona), założona przez dwie siostry z Bydgoszczy. Zaczynały od robienia mydeł w domowej kuchni, dziś ich produkty można kupić w butikach w całej Polsce. 'Bydgoszcz dała nam świetny start. Koszty prowadzenia działalności są tu niższe niż w stolicy, a lokalna społeczność bardzo nas wspierała od samego początku' – mówią założycielki.\n\nInnym fascynującym projektem jest startup technologiczny stworzony przez absolwentów Politechniki Bydgoskiej, który opracował aplikację ułatwiającą parkowanie w zatłoczonych centrach miast. Ich rozwiązanie jest już testowane w kilku europejskich metropoliach, ale główna siedziba firmy niezmiennie pozostaje w Bydgoszczy.\n\nCo przyciąga młodych przedsiębiorców do Bydgoszczy? Oprócz niższych kosztów życia i prowadzenia biznesu, ważnym czynnikiem jest rosnąca infrastruktura wspierająca innowacje. Bydgoski Park Przemysłowo-Technologiczny, liczne przestrzenie coworkingowe oraz programy akceleracyjne tworzą ekosystem, w którym łatwiej jest postawić pierwsze kroki w biznesie.\n\nNie bez znaczenia jest też zmiana mentalności samych mieszkańców, którzy coraz chętniej wybierają produkty i usługi lokalnych twórców, kierując się patriotyzmem konsumenckim. 'Kupując od lokalnego rzemieślnika czy korzystając z usług bydgoskiej firmy, wspieramy rozwój naszego miasta' – to zdanie, które coraz częściej można usłyszeć z ust bydgoszczan.\n\nSukcesy młodych przedsiębiorców pokazują, że Bydgoszcz to miasto z przyszłością, otwarte na innowacje i kreatywność. To oni tworzą nową, dynamiczną tożsamość miasta, udowadniając, że chcieć to móc, niezależnie od szerokości geograficznej.",
        category: "biznes",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
        author: "Anna Kowalska",
        publishedAt: Date.now() - 345600000,
        tags: ["biznes", "innowacje", "startup", "ludzie"]
      }
    ];

    for (const article of articles) {
      await ctx.db.insert("articles", article as any);
    }
    return `Successfully seeded ${articles.length} lifestyle/news articles.`;
  },
});

export const seedObituaries = mutation({
  args: {},
  handler: async (ctx) => {
    const firstNames = ["Jan", "Anna", "Piotr", "Maria", "Krzysztof", "Katarzyna", "Andrzej", "Małgorzata", "Tomasz", "Agnieszka", "Michał", "Barbara", "Marcin", "Ewa", "Jakub", "Krystyna", "Adam", "Elżbieta", "Stanisław", "Zofia"];
    const lastNames = ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Wojciechowski", "Kwiatkowski", "Krawczyk", "Kaczmarek", "Piotrowski", "Grabowski"];
    
    const obituaries = [];
    
    // Generate 20 Nekrologi
    for (let i = 0; i < 20; i++) {
      const isFemale = i % 2 !== 0;
      const firstName = firstNames[i];
      const lastName = lastNames[i] + (isFemale && lastNames[i].endsWith('i') ? 'a' : '');
      
      obituaries.push({
        firstName,
        lastName,
        slug: `nekrolog-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`,
        type: "nekrolog",
        content: `Z głębokim żalem zawiadamiamy, że w dniu ${new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('pl-PL')} zmarł${isFemale ? 'a' : ''} opatrzon${isFemale ? 'a' : 'y'} Świętymi Sakramentami, nasza najukochańsza Mama, Babcia, Prababcia.\n\nMsza Święta żałobna odprawiona zostanie w Kościele Parafialnym. Po mszy nastąpi odprowadzenie Zmarł${isFemale ? 'ej' : 'ego'} na miejsce wiecznego spoczynku.\n\nProsimy o nieskładanie kondolencji.`,
        birthDate: new Date(Date.now() - (60 + Math.random() * 30) * 31556952000).getTime(),
        deathDate: new Date(Date.now() - Math.random() * 10000000000).getTime(),
        city: "Bydgoszcz",
        funeralDate: new Date(Date.now() + Math.random() * 500000000).getTime(),
        funeralTime: "12:00",
        funeralPlace: "Kościół pw. Świętych Polskich Braci Męczenników, Bydgoszcz",
        cemeteryPlace: "Cmentarz Komunalny przy ul. Wiślanej, Bydgoszcz",
        submitterName: "Pogrążona w smutku Rodzina",
        submitterEmail: `rodzina${i}@example.com`,
        submitterRelation: "Rodzina",
        status: "approved",
        publishedAt: Date.now() - Math.random() * 1000000000,
      });
    }

    // Generate 20 Wspomnienia
    for (let i = 0; i < 20; i++) {
      const isFemale = i % 2 === 0;
      const firstName = firstNames[19 - i];
      const lastName = lastNames[19 - i] + (isFemale && lastNames[19 - i].endsWith('i') ? 'a' : '');
      
      obituaries.push({
        firstName,
        lastName,
        slug: `wspomnienie-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`,
        type: "wspomnienie",
        title: "Na zawsze w naszych sercach",
        content: `Mija kolejna rocznica Twojej śmierci, a ból w naszych sercach wciąż jest tak samo silny. Brakuje nam Twojego uśmiechu, Twoich rad i wspólnych chwil.\n\nZawsze był${isFemale ? 'aś' : 'eś'} dla nas opoką. Twoja miłość do rodziny inspirowała nas każdego dnia. Choć nie ma Cię już z nami fizycznie, Twoja obecność jest wciąż wyczuwalna w każdym zakątku naszego domu.\n\nKochamy Cię i nigdy nie zapomnimy.`,
        birthDate: new Date(Date.now() - (50 + Math.random() * 40) * 31556952000).getTime(),
        deathDate: new Date(Date.now() - (1 + Math.random() * 5) * 31556952000).getTime(),
        city: "Bydgoszcz",
        submitterName: "Dzieci z rodzinami",
        submitterEmail: `dzieci${i}@example.com`,
        submitterRelation: "Dzieci",
        status: "approved",
        publishedAt: Date.now() - Math.random() * 1000000000,
        image: isFemale ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
      });
    }

    // Generate 20 Pożegnania
    for (let i = 0; i < 20; i++) {
      const isFemale = i % 3 === 0;
      const firstName = firstNames[Math.floor(Math.random() * 20)];
      const lastName = lastNames[Math.floor(Math.random() * 20)] + (isFemale && lastNames[Math.floor(Math.random() * 20)].endsWith('i') ? 'a' : '');
      
      obituaries.push({
        firstName,
        lastName,
        slug: `pozegnanie-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`,
        type: "pozegnanie",
        content: `Z ogromnym smutkiem przyjęliśmy wiadomość o śmierci naszego wieloletniego współpracownika i przyjaciela.\n\nBył${isFemale ? 'a' : ''} nie tylko wybitnym specjalistą w swojej dziedzinie, ale przede wszystkim wspaniałym człowiekiem. Będzie nam brakowało profesjonalizmu i koleżeńskiej postawy.\n\nRodzinie i Bliskim składamy wyrazy najgłębszego współczucia.`,
        deathDate: new Date(Date.now() - Math.random() * 1000000000).getTime(),
        city: "Bydgoszcz",
        submitterName: "Zarząd i Pracownicy Firmy",
        submitterEmail: `firma${i}@example.com`,
        submitterRelation: "Współpracownicy",
        status: "approved",
        publishedAt: Date.now() - Math.random() * 1000000000,
      });
    }

    for (const obituary of obituaries) {
      await ctx.db.insert("obituaries", obituary as any);
    }
    return `Successfully seeded ${obituaries.length} obituaries.`;
  },
});

export const seedArticleTypeDemos = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const hour = 3600000;

    const demos = [
      {
        slug: "demo-typ-news-bydgoszcz",
        title: "Demo typu News: Miasto uruchamia nowy odcinek bulwarow nad Brda",
        excerpt: "Klasyczny material informacyjny pokazujacy standardowy wyglad artykulu newsowego.",
        content: "<p>Miasto uruchomilo nowy odcinek bulwarow nad Brda. Inwestycja obejmuje oswietlenie, mala architekture i nowe zejscia do wody.</p><p>To wzorcowy artykul informacyjny, ktory pozwala porownac pozostale typy materialow.</p>",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
        author: "Redakcja Love Bydgoszcz",
        publishedAt: now - hour,
        featured: false,
        tags: ["demo", "news", "miasto"],
        status: "published",
        articleType: "news",
      },
      {
        slug: "demo-typ-wywiad-bydgoszcz",
        title: "Demo typu Wywiad: Rozmowa o nowym obliczu kultury miejskiej",
        excerpt: "Przykladowy wywiad z prowadzacym i gosciem, z sekcja rozmowcow oraz blokami pytan i odpowiedzi.",
        content: "",
        category: "kultura",
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80",
        author: "Anna Redakcyjna",
        publishedAt: now - 2 * hour,
        featured: false,
        tags: ["demo", "wywiad", "kultura"],
        status: "published",
        articleType: "interview",
        interview: {
          enabled: true,
          status: "active",
          intro: "Wywiad o tym, jak zmienia sie lokalna scena kulturalna i czego oczekuja odbiorcy.",
          participants: [
            { id: "host", name: "Anna Redakcyjna", role: "Prowadzaca", shortLabel: "AR", color: "#0f766e", isHost: true },
            { id: "guest", name: "Michal Kurator", role: "Dyrektor programu", shortLabel: "MK", color: "#c2410c" },
          ],
          blocks: [
            { id: "i1", type: "question", content: "Od czego zaczela sie ta zmiana w kulturze miejskiej?", speakerId: "host" },
            { id: "i2", type: "answer", content: "Od otwarcia sie instytucji na codziennosc mieszkancow i nowe formaty spotkan.", speakerId: "guest" },
            { id: "i3", type: "quote", content: "Kultura przestala byc wydarzeniem od swieta, a stala sie rytmem miasta." },
          ],
          styleVariant: "classic",
          questionStyle: "accent",
          answerStyle: "boxed",
          speakerLabelStyle: "pill",
          width: "container",
          showSeparators: true,
          quoteStyle: "accent",
          showBioPanel: true,
        },
      },
      {
        slug: "demo-typ-analiza-bydgoszcz",
        title: "Demo typu Analiza: Czy inwestycje nad woda zmieniaja centrum miasta",
        excerpt: "Ekspercki uklad z teza, argumentami, danymi i rekomendacjami.",
        content: "",
        category: "biznes",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
        author: "Tomasz Analityk",
        publishedAt: now - 3 * hour,
        featured: false,
        tags: ["demo", "analiza", "inwestycje"],
        status: "published",
        articleType: "analysis",
        analysis: {
          enabled: true,
          thesis: "Inwestycje nad Brda realnie przesuwaja centrum aktywnosci miasta w strone rzeki.",
          summary: "Przykladowa analiza pokazujaca sposob prezentacji tezy, danych i rekomendacji.",
          expertLevel: "ekspercki",
          mainQuestion: "Czy nowe inwestycje przekladaja sie na ruch mieszkancow i biznesu?",
          context: "W ostatnich latach miasto konsekwentnie rozwija przestrzenie nadwodne oraz infrastrukture piesza.",
          arguments: ["Nowe przestrzenie przyciagaja uslugi i gastronomIe.", "Rzeka zaczyna pelnic role glownej osi spacerowej miasta."],
          counterarguments: ["Nie wszystkie dzielnice korzystaja z tej zmiany w rownym stopniu."],
          sources: ["Raport o ruchu pieszym 2025", "Dane miejskie o inwestycjach nad Brda"],
          bibliography: "Zestawienia urzedu miasta, raporty i obserwacje terenowe.",
          conclusions: "Najwieksza korzyscia jest zmiana sposobu korzystania z centrum przez mieszkancow.",
          recommendations: "Warto laczyc kolejne inwestycje z oferta uslug i transportem lokalnym.",
          metrics: [
            { id: "am1", label: "Ruch pieszy", value: "+18%", note: "porownanie rok do roku" },
            { id: "am2", label: "Nowe lokale", value: "27", note: "w promieniu 500 m" },
          ],
          blocks: [
            { id: "ab1", type: "argument", title: "Aktywizacja przestrzeni", content: "Bulwary wzmacniaja codzienny ruch i wydluzaja czas spedzany w centrum." },
            { id: "ab2", type: "data_box", title: "Wskaznik inwestycji", content: "Laczna wartosc projektow przekroczyla 40 mln zl.", value: "40 mln zl", sourceLabel: "Dane UM" },
            { id: "ab3", type: "partial_conclusion", title: "Wniosek czastkowy", content: "Nadwodne inwestycje dzialaja najlepiej, gdy tworza caly ciag atrakcji." },
          ],
          styleVariant: "expert",
        },
      },
      {
        slug: "demo-typ-reportaz-bydgoszcz",
        title: "Demo typu Reportaz: Poranek na targowisku i rytm lokalnego handlu",
        excerpt: "Narracyjny material z bohaterami, scenami i zakonczeniem reportazowym.",
        content: "",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80",
        author: "Karolina Reporterka",
        publishedAt: now - 4 * hour,
        featured: false,
        tags: ["demo", "reportaz", "miasto"],
        status: "published",
        articleType: "report",
        report: {
          enabled: true,
          intro: "Pierwsze skrzynki z warzywami pojawiaja sie jeszcze przed switem, a miasto budzi sie razem z targowiskiem.",
          mainHero: "Janina, handlarka z wieloletnim stazem",
          characters: [
            { id: "rc1", name: "Janina", role: "Handlarka", bio: "Od 25 lat sprzedaje lokalne produkty.", isPrimary: true },
            { id: "rc2", name: "Marek", role: "Staly klient", bio: "Przychodzi po zakupy co srode." },
          ],
          places: [{ id: "rp1", name: "Targowisko przy centrum", description: "Miejsce codziennych zakupow i spotkan." }],
          eventPeriod: "Wiosna 2026",
          tone: "immersyjny",
          theme: "Codziennosc miasta i lokalny handel",
          whatToKnow: "To demo pokazuje narracyjny sposob skladania scen i bohaterow.",
          materials: ["Rozmowy z handlujacymi", "Obserwacja terenowa", "Zdjecia z poranka"],
          ending: "Gdy rynek pustoszeje, na bruku zostaje jeszcze echo rozmow i pospiesznych zakupow.",
          blocks: [
            { id: "rb1", type: "scene", title: "Scena otwarcia", content: "Metalowe rolety unosza sie powoli, a zapach pieczywa miesza sie z wilgotnym powietrzem." },
            { id: "rb2", type: "hero_quote", title: "Glos bohaterki", content: "Najwazniejsze jest to, ze ludzie wciaz chca tu wracac, mimo wszystkich zmian." },
            { id: "rb3", type: "turning_point", title: "Punkt zwrotny", content: "Najwieksza zmiana przyszla wtedy, gdy obok otwarto nowy parking i ruch nagle wzrosl." },
          ],
          styleVariant: "classic",
        },
      },
      {
        slug: "demo-typ-opinia-bydgoszcz",
        title: "Demo typu Opinia: Miasto potrzebuje bardziej odwaznych decyzji urbanistycznych",
        excerpt: "Komentarz autorski z wyrazna teza, argumentacja i puenta.",
        content: "",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
        author: "Marta Komentatorka",
        publishedAt: now - 5 * hour,
        featured: false,
        tags: ["demo", "opinia", "urbanistyka"],
        status: "published",
        articleType: "opinion",
        opinion: {
          enabled: true,
          thesis: "Bydgoszcz potrzebuje mniej zachowawczych decyzji i wyrazniejszej wizji centrum.",
          position: "Miasto rozwija sie, ale zbyt czesto robi to polsrodkami, bez odwagi do spojnego ruchu.",
          authorNote: "To autorski komentarz oparty na obserwacji zmian w przestrzeni publicznej.",
          authorBio: "Autorka zajmuje sie komentowaniem zmian miejskich i polityki przestrzennej.",
          leadQuote: "Bez odwagi nie ma miasta, ktore umie opowiadac o sobie z przekonaniem.",
          counterpoint: "Przeciwnicy szybszych zmian wskazuja na koszty i ryzyko konfliktow spolecznych.",
          closingPoint: "Jesli centrum ma zyskac nowa energie, potrzebuje nie tylko remontow, ale takze decyzji z charakterem.",
          arguments: ["Spójna wizja przestrzeni poprawia czytelnosc miasta.", "Lokalne inwestycje sa zbyt rozproszone, by tworzyc efekt skali."],
          blocks: [
            { id: "ob1", type: "argument", title: "Argument 1", content: "Najbardziej udane miejsca w miescie sa efektem konsekwencji, a nie pojedynczych decyzji." },
            { id: "ob2", type: "lead_quote", title: "Cytat przewodni", content: "Potrzebujemy urbanistyki, ktora prowadzi mieszkancow, a nie tylko reaguje na biezace problemy." },
          ],
          styleVariant: "premium",
        },
      },
      {
        slug: "demo-typ-dialog-bydgoszcz",
        title: "Demo typu Dialog: O miescie, codziennosci i zmianie perspektywy",
        excerpt: "Swobodny format rozmowy z uczestnikami i komentarzem narratora.",
        content: "",
        category: "bydgoszczanie",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
        author: "Piotr Rozmowny",
        publishedAt: now - 6 * hour,
        featured: false,
        tags: ["demo", "dialog", "rozmowa"],
        status: "published",
        articleType: "dialog",
        dialog: {
          enabled: true,
          description: "Dwoje rozmowcow rozmawia o tym, jak zmienia sie rytm miasta i czego oczekuja mieszkancy.",
          context: "To format lzejszy od wywiadu, oparty na wymianie zdan i komentarzu narratora.",
          conversationStyle: "swobodny",
          place: "Kawiarnia przy rzece",
          ending: "Rozmowa nie daje jednej odpowiedzi, ale dobrze pokazuje dwa rozne sposoby patrzenia na to samo miasto.",
          participants: [
            { id: "dp1", name: "Alicja", role: "Mieszkanka", color: "#1d4ed8" },
            { id: "dp2", name: "Oskar", role: "Projektant miejski", color: "#b45309" },
          ],
          blocks: [
            { id: "db1", type: "speaker_a", speakerId: "dp1", content: "Mam wrazenie, ze miasto wreszcie zaczyna byc wygodniejsze na co dzien." },
            { id: "db2", type: "speaker_b", speakerId: "dp2", content: "To prawda, ale nadal brakuje odwagi w planowaniu duzych zmian." },
            { id: "db3", type: "narrator", content: "Rozmowa szybko schodzi z codziennosci na temat przyszlosci centrum." },
            { id: "db4", type: "highlight_quote", content: "Najlepsze miasta to te, ktore daja powod, by zostac w nich po pracy." },
          ],
        },
      },
      {
        slug: "demo-typ-komunikat-bydgoszcz",
        title: "Demo typu Komunikat: Tymczasowa zmiana organizacji ruchu w centrum",
        excerpt: "Oficjalny, prostszy uklad komunikatu z priorytetem, data obowiazywania i zrodlem.",
        content: "<p>Od poniedzialku do piatku zostanie wprowadzona czasowa zmiana organizacji ruchu w rejonie Starego Rynku.</p><p>Kierowcy proszeni sa o korzystanie z objazdow i zwracanie uwagi na nowe oznakowanie.</p>",
        category: "miasto",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
        author: "Biuro Komunikacji",
        publishedAt: now - 7 * hour,
        featured: false,
        tags: ["demo", "komunikat", "ruch"],
        status: "published",
        articleType: "press_release",
        announcement: {
          enabled: true,
          noticeType: "Zmiana organizacji ruchu",
          priority: "pilny",
          validUntil: "do 31 marca 2026",
          institution: "Urzad Miasta Bydgoszczy",
          noticeStatus: "obowiazujacy",
          ctaLabel: "Sprawdz objazdy",
          ctaUrl: "https://www.bydgoszcz.pl",
          mustKnow: "Najwieksze utrudnienia pojawia sie w godzinach porannego szczytu.",
          styleVariant: "alert",
        },
      },
      {
        slug: "demo-typ-sponsorowany-bydgoszcz",
        title: "Demo typu Sponsorowany: Nowa inwestycja mieszkaniowa otwiera pokazowe apartamenty",
        excerpt: "Material partnerski z boxem sponsora, CTA i wyraznym oznaczeniem wspolpracy.",
        content: "<p>Nowa inwestycja mieszkaniowa zaprasza na dni otwarte apartamentow pokazowych. Na miejscu mozna poznac standard wykonczenia oraz porozmawiac z doradcami.</p><p>Partner przygotowal rowniez specjalna oferte dla osob zainteresowanych rezerwacja lokalu jeszcze w marcu.</p>",
        category: "biznes",
        imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80",
        author: "Studio Partnerskie",
        publishedAt: now - 8 * hour,
        featured: false,
        tags: ["demo", "sponsorowany", "nieruchomosci"],
        status: "published",
        articleType: "sponsored",
        sponsored: {
          enabled: true,
          sponsorLabel: "Sponsorowany",
          partnerName: "Nova Residence",
          partnerLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&q=80",
          partnerUrl: "https://example.com/nova-residence",
          partnerDescription: "Partner materialu prezentuje nowy etap inwestycji mieszkaniowej w Bydgoszczy.",
          partnerCtaLabel: "Zobacz oferte",
          partnerCtaUrl: "https://example.com/nova-residence/oferta",
          sponsorBoxTitle: "Partner materialu",
          sponsorDisclaimer: "Publikacja powstala we wspolpracy komercyjnej z partnerem materialu.",
          contactOffer: "Skontaktuj sie z partnerem, aby otrzymac prezentacje inwestycji i warunki oferty.",
          sectionPlacement: "start",
          styleVariant: "business",
        },
      },
      {
        slug: "demo-typ-quiz-bydgoszcz",
        title: "Demo typu Quiz: Jakim rytmem miasta zyjesz na co dzien",
        excerpt: "Lekki quiz lifestyle z ekranem startowym, pytaniami i wynikiem.",
        content: "",
        category: "rozrywka",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
        author: "Zespol Quizowy",
        publishedAt: now - 9 * hour,
        featured: false,
        tags: ["demo", "quiz", "lifestyle"],
        status: "published",
        articleType: "quiz",
        quiz: {
          enabled: true,
          quizId: "quiz-demo-typy",
          status: "active",
          type: "personality",
          title: "Jakim rytmem miasta zyjesz?",
          description: "Odpowiedz na kilka pytan i sprawdz, czy jestes typem miejskim, slow czy kulturalnym.",
          badgeLabel: "QUIZ",
          subtitle: "Demo formatu quizowego",
          intro: "Krotki quiz pokazujacy wyglad i logike typu quiz.",
          startButtonLabel: "Rozpocznij quiz",
          showQuestionNumbers: true,
          showProgress: true,
          showQuestionCount: true,
          randomizeQuestions: false,
          randomizeAnswers: false,
          allowBack: true,
          singlePage: false,
          autoAdvance: false,
          showResultImmediately: true,
          questions: [
            {
              id: "q1",
              question: "Najlepszy plan na wolny poranek to:",
              description: "",
              imageUrl: "",
              answerType: "single",
              maxSelections: 1,
              answers: [
                { id: "q1a", label: "Spacer nad rzeka", points: 2, resultKey: "slow", color: "#f97316" },
                { id: "q1b", label: "Kawa i galerie", points: 3, resultKey: "kultura", color: "#f97316" },
                { id: "q1c", label: "Bieg po miescie", points: 1, resultKey: "miejski", color: "#f97316" },
              ],
            },
            {
              id: "q2",
              question: "Najbardziej pociaga Cie:",
              description: "",
              imageUrl: "",
              answerType: "single",
              maxSelections: 1,
              answers: [
                { id: "q2a", label: "Spokoj i zielen", points: 2, resultKey: "slow", color: "#f97316" },
                { id: "q2b", label: "Wydarzenia i premiera", points: 3, resultKey: "kultura", color: "#f97316" },
                { id: "q2c", label: "Tempo i energia", points: 1, resultKey: "miejski", color: "#f97316" },
              ],
            },
          ],
          results: [
            { id: "qr1", key: "slow", title: "Masz rytm slow city", description: "Lubisz miejsca spokojne, zielone i dajace oddech." },
            { id: "qr2", key: "kultura", title: "Zyjesz kultura miasta", description: "Najbardziej pociagaja Cie wydarzenia, sztuka i spotkania." },
            { id: "qr3", key: "miejski", title: "Masz rytm szybkiego miasta", description: "Lubisz ruch, tempo i ciagla zmiane." },
          ],
          styleVariant: "lifestyle",
          answerCardStyle: "soft",
          width: "container",
          layout: "column",
          borderRadius: 28,
          shadow: true,
          accentColor: "#f97316",
          buttonColor: "#ea580c",
          backgroundColor: "#fff7ed",
          progressStyle: "line",
          headerStyle: "hero",
          resultStyle: "card",
          headerImageUrl: "",
          headerGradient: "linear-gradient(135deg, rgba(249,115,22,0.14), rgba(236,72,153,0.12))",
          showCoverImage: false,
          showBadge: true,
          isPublic: true,
          adminPreview: true,
        },
      },
    ];

    let inserted = 0;
    let updated = 0;

    for (const demo of demos) {
      const existing = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", demo.slug)).unique();
      if (existing) {
        await ctx.db.patch(existing._id, demo as any);
        updated += 1;
      } else {
        await ctx.db.insert("articles", demo as any);
        inserted += 1;
      }
    }

    return {
      inserted,
      updated,
      slugs: demos.map((demo) => demo.slug),
    };
  },
});
