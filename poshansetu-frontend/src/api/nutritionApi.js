import axiosInstance from './axiosInstance';

export const logNutrition = (data) =>
    axiosInstance.post('/nutrition/log', data);

export const getWeeklySummary = (childId) =>
    axiosInstance.get(`/nutrition/${childId}/weekly`);
