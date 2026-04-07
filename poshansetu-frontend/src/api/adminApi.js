import axiosInstance from './axiosInstance';

export const getMalnutritionStats = () =>
    axiosInstance.get('/admin/stats/malnutrition');

export const getVaccinationCompliance = () =>
    axiosInstance.get('/admin/stats/vaccination-compliance');

export const getFullReport = () =>
    axiosInstance.get('/admin/reports/summary');
