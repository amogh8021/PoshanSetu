import { useState, useEffect } from 'react';
import { getMalnutritionStats, getVaccinationCompliance } from '../api/adminApi';

export function useAdminStats() {
    const [malnutritionData, setMalnutritionData] = useState([]);
    const [complianceData, setComplianceData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([getMalnutritionStats(), getVaccinationCompliance()])
            .then(([mRes, cRes]) => {
                setMalnutritionData(mRes.data?.data || []);
                setComplianceData(cRes.data?.data || null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { malnutritionData, complianceData, isLoading };
}
