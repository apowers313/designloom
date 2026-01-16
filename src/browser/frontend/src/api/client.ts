import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9050";

/**
 * Fetch data from the API
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}/api${endpoint}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

/**
 * Hook to fetch a list of entities
 */
export function useEntityList<T>(
    entityType: string,
    filters?: Record<string, string>
) {
    const [data, setData] = useState<T[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(filters);
        const url = `/${entityType}${params.toString() ? `?${params}` : ""}`;

        setIsLoading(true);
        fetchApi<T[]>(url)
            .then(setData)
            .catch(setError)
            .finally(() => setIsLoading(false));
    }, [entityType, JSON.stringify(filters), refreshKey]);

    // Set up SSE for live reload
    useEffect(() => {
        const eventSource = new EventSource(`${API_URL}/api/events`);

        eventSource.onmessage = (event) => {
            if (event.data !== "connected") {
                // YAML file changed, refetch data
                refetch();
            }
        };

        eventSource.onerror = () => {
            // SSE connection error - will auto-reconnect
        };

        return () => {
            eventSource.close();
        };
    }, [refetch]);

    return { data, isLoading, error, refetch };
}

/**
 * Hook to fetch a single entity by ID
 */
export function useEntity<T>(entityType: string, id: string) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchApi<T>(`/${entityType}/${id}`)
            .then(setData)
            .catch(setError)
            .finally(() => setIsLoading(false));
    }, [entityType, id, refreshKey]);

    // Set up SSE for live reload
    useEffect(() => {
        const eventSource = new EventSource(`${API_URL}/api/events`);

        eventSource.onmessage = (event) => {
            if (event.data !== "connected") {
                // YAML file changed, refetch data
                refetch();
            }
        };

        eventSource.onerror = () => {
            // SSE connection error - will auto-reconnect
        };

        return () => {
            eventSource.close();
        };
    }, [refetch]);

    return { data, isLoading, error, refetch };
}

/**
 * Hook to fetch stats for the index page
 */
export function useStats() {
    const [data, setData] = useState<Record<string, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchApi<Record<string, number>>("/stats")
            .then(setData)
            .catch(setError)
            .finally(() => setIsLoading(false));
    }, [refreshKey]);

    // Set up SSE for live reload
    useEffect(() => {
        const eventSource = new EventSource(`${API_URL}/api/events`);

        eventSource.onmessage = (event) => {
            if (event.data !== "connected") {
                refetch();
            }
        };

        eventSource.onerror = () => {
            // SSE connection error - will auto-reconnect
        };

        return () => {
            eventSource.close();
        };
    }, [refetch]);

    return { data, isLoading, error, refetch };
}
