import { useCallback, useEffect, useState } from "react";

import { fetchArticleById, fetchArticleBySlug, fetchArticleUpdates, fetchArticles, fetchPaginatedArticles, type Article, type ArticleUpdate } from "@/lib/articles-api";

type ArticlesState = {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  meta?: any;
  links?: any;
};

type UseArticlesParams = {
  category?: string;
  limit?: number;
  perPage?: number;
  page?: number;
  featured?: boolean;
  patronage?: boolean;
  search?: string;
  author?: string;
};

export function useArticles(params: UseArticlesParams) {
  const [state, setState] = useState<ArticlesState>({ articles: [], isLoading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    setState((prev) => ({ ...prev, isLoading: true }));
    fetchArticles(params)
      .then((articles) => {
        if (!isMounted) return;
        setState({ articles, isLoading: false, error: null });
      })
      .catch((error) => {
        if (!isMounted) return;
        setState({ articles: [], isLoading: false, error });
      });
    return () => {
      isMounted = false;
    };
  }, [params.author, params.category, params.featured, params.limit, params.page, params.patronage, params.perPage, params.search]);

  return state;
}

export function usePaginatedArticles(params: UseArticlesParams) {
  const [state, setState] = useState<ArticlesState>({ articles: [], isLoading: true, error: null });
  const [page, setPage] = useState(params.page ?? 1);

  const loadPage = useCallback(async (nextPage: number) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetchPaginatedArticles({ ...params, page: nextPage, perPage: params.perPage });
      setState({
        articles: response.articles,
        isLoading: false,
        error: null,
        meta: response.meta,
        links: response.links,
      });
    } catch (error: any) {
      setState({ articles: [], isLoading: false, error });
    }
  }, [params.author, params.category, params.featured, params.patronage, params.perPage, params.search]);

  useEffect(() => {
    setPage(params.page ?? 1);
  }, [params.page]);

  useEffect(() => {
    void loadPage(page);
  }, [loadPage, page]);

  return {
    articles: state.articles,
    isLoading: state.isLoading,
    error: state.error,
    meta: state.meta,
    links: state.links,
    page,
    setPage,
    reload: () => loadPage(page),
  };
}

export function useArticleLookup({ id, slug }: { id?: string | null; slug?: string | null }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!id && !slug) {
      setArticle(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const fetcher = slug ? fetchArticleBySlug(slug) : fetchArticleById(id as string);
    fetcher
      .then((data) => {
        if (!isMounted) return;
        setArticle(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setArticle(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, slug]);

  return { article, isLoading };
}

export function useArticleUpdates(articleId?: string | null) {
  const [updates, setUpdates] = useState<ArticleUpdate[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!articleId) {
      setUpdates(null);
      return;
    }
    fetchArticleUpdates(articleId)
      .then((data) => {
        if (!isMounted) return;
        setUpdates(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setUpdates([]);
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  return updates;
}
