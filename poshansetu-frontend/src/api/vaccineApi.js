import axiosInstance from './axiosInstance';

export const recordVaccination = (data) =>
    axiosInstance.post('/vaccine/record', data);

export const getUpcoming = (childId) =>
    axiosInstance.get(`/vaccine/${childId}/upcoming`);

export const getDropoutRisk = (childId) =>
    axiosInstance.get(`/vaccine/${childId}/dropout-risk`);
