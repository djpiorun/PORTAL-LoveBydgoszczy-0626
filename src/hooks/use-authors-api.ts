import { useEffect, useState } from "react";

import { fetchAuthorByIdentifier, fetchAuthors, type Author } from "@/lib/authors-api";

type AuthorsState = {
  authors: Author[];
  isLoading: boolean;
  error: Error | null;
};

export function useAuthors() {
  const [state, setState] = useState<AuthorsState>({ authors: [], isLoading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    setState((prev) => ({ ...prev, isLoading: true }));
    fetchAuthors()
      .then((authors) => {
        if (!isMounted) return;
        setState({ authors, isLoading: false, error: null });
      })
      .catch((error) => {
        if (!isMounted) return;
        setState({ authors: [], isLoading: false, error });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

export function useAuthorLookup(identifier?: string | null) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!identifier) {
      setAuthor(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchAuthorByIdentifier(identifier)
      .then((data) => {
        if (!isMounted) return;
        setAuthor(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setAuthor(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [identifier]);

  return { author, isLoading };
}
