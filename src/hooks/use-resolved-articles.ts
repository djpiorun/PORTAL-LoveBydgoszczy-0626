import { useMemo } from "react";

export function useResolvedArticles<T extends any[]>(articles: T | undefined) {
  return useMemo(() => {
    if (!articles) return articles;

    return articles.map((article: any) => {
      if (article.category === "sport" && article.sport) {
        return {
          ...article,
          __relationMeta: {
            ...(article.__relationMeta ?? {}),
            primarySportTeam: article.sport.homeTeam?.name,
            secondarySportTeam: article.sport.awayTeam?.name,
            sportLeague: article.sport.league,
            sportEvent: article.sport.round,
          },
        };
      }

      if (article.category === "polityka" && article.politics) {
        return {
          ...article,
          __relationMeta: {
            ...(article.__relationMeta ?? {}),
            primaryParty: article.politics.parties?.[0] || article.politics.politicians?.[0]?.party,
            politicalMaterialType: article.politics.relatedLegislation,
            politicalPositions: article.politics.politicians?.map((item: any) => item.position).filter(Boolean) ?? [],
          },
        };
      }

      if (article.category === "inwestycje" && article.investment) {
        return {
          ...article,
          __relationMeta: {
            ...(article.__relationMeta ?? {}),
            investmentStatusLabel: article.investment.projectStatus,
            investmentLocationLabel: article.investment.location,
            investmentTypeLabel: article.investment.impactDescription,
          },
        };
      }

      if (article.category === "nasze_dzialania" && article.ourActions) {
        return {
          ...article,
          __relationMeta: {
            ...(article.__relationMeta ?? {}),
            ourActionsTypeLabel: article.ourActions.actionType,
            ourActionsProjectLabel: article.ourActions.milestones?.[0]?.title,
            ourActionsCampaignLabel: article.ourActions.ctaLabel,
          },
        };
      }

      return article;
    }) as T;
  }, [articles]);
}
