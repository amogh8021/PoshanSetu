import { useState, useEffect } from 'react';
import { getGrowthChart } from '../api/childApi';
import { getLatestRecord } from '../api/healthApi';
import { getUpcoming } from '../api/vaccineApi';

export function useChildData(childId) {
    const [childData, setChildData] = useState(null);
    const [latestHealth, setLatestHealth] = useState(null);
    const [upcomingVaccines, setUpcomingVaccines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!childId) return;
        setIsLoading(true);
        setError(null);
        Promise.all([
            getGrowthChart(childId),
            getLatestRecord(childId),
            getUpcoming(childId),
        ])
            .then(([growthRes, healthRes, vaccineRes]) => {
                setChildData(growthRes.data?.data || []);
                setLatestHealth(healthRes.data?.data || null);
                setUpcomingVaccines(vaccineRes.data?.data || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [childId]);

    return { childData, latestHealth, upcomingVaccines, isLoading, error };
}
