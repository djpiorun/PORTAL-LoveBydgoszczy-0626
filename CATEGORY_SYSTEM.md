# System Kategorii Artykułów - Love Bydgoszcz

## Przegląd

Portal Love Bydgoszcz posiada zaawansowany system kategorii, gdzie każda kategoria jest pełnoprawnym modułem z własnymi:
- Strukturami danych
- Komponentami UI
- Stylem wizualnym
- Logiką biznesową

## Kategorie

### Kategorie standardowe
1. **Miasto** - wiadomości miejskie i lokalne wydarzenia
2. **Rozrywka** - wydarzenia rozrywkowe i kulturalne
3. **Kultura** - kultura, sztuka i dziedzictwo
4. **Biznes** - biznes lokalny i przedsiębiorczość
5. **Gastronomia** - restauracje, kawiarnie i kulinaria
6. **Bydgoszczanie** - historie mieszkańców Bydgoszczy
7. **Zdrowie (Medyczna)** - zdrowie i opieka medyczna

### Kategorie rozszerzone (nowy system)

#### 8. Sport
**Podkategorie:** Piłka nożna, Żużel, Siatkówka, Inne

**Struktura danych:**
- Typ sportu
- Informacje o meczu (drużyny, wynik, data, miejsce)
- Składy drużyn z numerami i pozycjami
- Statystyki meczu (posiadanie piłki, strzały, faule)
- Kluczowe momenty meczu
- Status meczu (zaplanowany/trwa/zakończony/odwołany)

**Komponenty:**
- `ArticleSport` - scoreboard z wynikiem, składami, statystykami
- Dynamiczne kolory drużyn
- Timeline wydarzeń meczowych
- Oceny zawodników

**Użycie:**
```typescript
article.category = "sport";
article.sport = {
  enabled: true,
  sportType: "pilka_nozna",
  isMatchReport: true,
  homeTeam: { name: "Zawisza", score: "2", ... },
  awayTeam: { name: "Lech", score: "1", ... },
  // ...
};
```

#### 9. Polityka
**Funkcje:**
- Baza polityków (imię, nazwisko, partia, stanowisko, bio)
- Timeline wydarzeń politycznych
- Przypisanie polityków do artykułów
- Kontekst polityczny
- Powiązane przepisy

**Struktura danych:**
- Lista polityków z profilami
- Główny polityk artykułu
- Partie polityczne
- Timeline wydarzeń (wypowiedzi, decyzje, głosowania)
- Legislacja

**Komponenty:**
- `ArticlePolitics` - profile polityków, timeline, kontekst
- Kary polityków z social media
- Timeline wydarzeń politycznych
- Editorial style (poważny, informacyjny)

**Użycie:**
```typescript
article.category = "polityka";
article.politics = {
  enabled: true,
  politicians: [
    { fullName: "Jan Kowalski", party: "KO", position: "Prezydent", ... }
  ],
  timeline: [
    { date: "2024-03-29", title: "Konferencja prasowa", type: "wypowiedz" }
  ],
  // ...
};
```

#### 10. Inwestycje
**Funkcje:**
- Śledzenie projektów miejskich
- Status inwestycji (planowana/w trakcie/zakończona/wstrzymana)
- Timeline z fazami projektu
- Budżet i wykonawcy
- Zdjęcia przed/po
- Wpływ na miasto

**Struktura danych:**
- Nazwa projektu i status
- Lokalizacja, daty, budżet
- Wykonawca i inwestor
- Procent zaawansowania
- Timeline faz (completed/current/upcoming)
- Galeria before/after
- Mapa lokalizacji

**Komponenty:**
- `ArticleInvestment` - status projektu, progress bar, timeline
- Karty informacyjne (lokalizacja, daty, budżet)
- Timeline z kolorowymi statusami
- Galeria before/after
- Technical style

**Użycie:**
```typescript
article.category = "inwestycje";
article.investment = {
  enabled: true,
  projectName: "Modernizacja Mostu Uniwersyteckiego",
  projectStatus: "w_trakcie",
  progressPercent: 65,
  timeline: [
    { date: "2023-06-01", title: "Start prac", status: "completed" }
  ],
  // ...
};
```

#### 11. Nasze Działania
**Funkcje:**
- Akcje redakcyjne
- Kampanie społeczne
- Projekty i współprace
- Partnerzy akcji
- Kamienie milowe
- Efekty i wpływ

**Struktura danych:**
- Typ akcji (akcja/projekt/kampania/współpraca)
- Status (aktywna/zakończona/planowana)
- Lista partnerów z logotypami
- Milestones z datami i zdjęciami
- Wyniki i wpływ
- Galeria zdjęć
- CTA (call to action)

**Komponenty:**
- `ArticleOurActions` - hero banner, partnerzy, timeline, galeria
- Emocjonalny, storytellingowy styl
- Wyeksponowane efekty i wpływ
- Brandingowy charakter

**Użycie:**
```typescript
article.category = "nasze_dzialania";
article.ourActions = {
  enabled: true,
  actionType: "akcja",
  actionStatus: "zakonczona",
  partners: [
    { name: "Miejski Zakład Oczyszczania", logo: "..." }
  ],
  results: "Zebraliśmy 3 tony śmieci!",
  // ...
};
```

## System Kolorów

Każda kategoria ma zdefiniowaną paletę kolorów w `src/lib/categoryConfig.ts`:

```typescript
export const categoryConfigs: Record<CategoryKey, CategoryConfig> = {
  sport: {
    gradient: "from-blue-500/10 via-indigo-500/5 to-blue-600/10",
    accentColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-900",
    // ...
  },
  // ...
};
```

**Funkcje pomocnicze:**
- `getCategoryConfig(category)` - pobiera pełną konfigurację
- `getCategoryLabel(category)` - zwraca nazwę kategorii
- `getCategoryIcon(category)` - zwraca ikonę Lucide
- `getCategoryGradient(category)` - zwraca klasy gradientu
- `getCategoryAccentColor(category)` - zwraca kolor akcentu

## Dodawanie Przykładowych Danych

Użyj seed file do dodania przykładowych artykułów:

```bash
# Wszystkie kategorie naraz
bunx convex run seedCategoryExamples:seedAll

# Pojedyncze kategorie
bunx convex run seedCategoryExamples:seedSportArticle
bunx convex run seedCategoryExamples:seedPoliticsArticle
bunx convex run seedCategoryExamples:seedInvestmentArticle
bunx convex run seedCategoryExamples:seedOurActionsArticle
```

## Integracja w ArticlePage

Komponenty są renderowane warunkowo w `ArticlePage.tsx`:

```tsx
{article.category === "sport" && article.sport?.enabled && (
  <ArticleSport data={article.sport} />
)}

{article.category === "polityka" && article.politics?.enabled && (
  <ArticlePolitics data={article.politics} />
)}

{article.category === "inwestycje" && article.investment?.enabled && (
  <ArticleInvestment data={article.investment} />
)}

{article.category === "nasze_dzialania" && article.ourActions?.enabled && (
  <ArticleOurActions data={article.ourActions} />
)}
```

## Rozszerzanie Systemu

Aby dodać nową kategorię:

1. **Schema** (`src/convex/schema.ts`):
   - Dodaj kategorię do `CATEGORIES`
   - Stwórz validator dla struktury danych
   - Dodaj pole w tabeli `articles`

2. **Komponenty** (`src/components/article/`):
   - Stwórz komponent `Article[Category].tsx`
   - Zaimplementuj UI i logikę

3. **Kolory** (`src/lib/categoryConfig.ts`):
   - Dodaj konfigurację kolorów i ikon

4. **Integracja**:
   - Dodaj import w `ArticlePage.tsx`
   - Dodaj warunek renderowania
   - Aktualizuj `CategorySection.tsx`

5. **Seed** (opcjonalnie):
   - Dodaj przykładowe dane w `seedCategoryExamples.ts`

## Architektura

```
src/
├── convex/
│   ├── schema.ts                    # Definicje tabel i validatorów
│   └── seedCategoryExamples.ts      # Przykładowe dane
├── components/
│   └── article/
│       ├── ArticleSport.tsx         # Komponenty kategorii
│       ├── ArticlePolitics.tsx
│       ├── ArticleInvestment.tsx
│       └── ArticleOurActions.tsx
├── lib/
│   └── categoryConfig.ts            # System kolorów i konfiguracja
└── pages/
    └── ArticlePage.tsx              # Główna strona artykułu
```

## Best Practices

1. **Dane opcjonalne** - wszystkie rozszerzone pola powinny być opcjonalne
2. **Enabled flag** - każdy moduł ma flagę `enabled` do włączania/wyłączania
3. **Spójność UI** - komponenty używają wspólnego design language
4. **Dark mode** - wszystkie komponenty wspierają ciemny motyw
5. **Responsive** - komponenty są responsywne (mobile-first)
6. **Animacje** - używaj Framer Motion dla płynnych przejść
7. **TypeScript** - wszystkie struktury są typowane

## Przykłady Użycia

Zobacz `src/convex/seedCategoryExamples.ts` dla pełnych przykładów implementacji każdej kategorii.

---

**Utworzono:** 30 marca 2024
**Wersja:** 1.0
**Autor:** vly (AI Agent)
