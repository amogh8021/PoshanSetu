import axiosInstance from './axiosInstance';

export const recordHealth = (data) =>
    axiosInstance.post('/health/record', data);

export const getLatestRecord = (childId) =>
    axiosInstance.get(`/health/${childId}/latest`);
