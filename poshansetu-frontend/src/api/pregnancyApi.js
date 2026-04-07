import axiosInstance from './axiosInstance';

export const saveAssessment = (data) =>
    axiosInstance.post('/pregnancy/assess', data);

export const registerPregnancy = (data) =>
    axiosInstance.post('/pregnancy/register', data);

export const listPregnancies = (anganwadiId) =>
    axiosInstance.get(`/pregnancy/list/${anganwadiId}`);

export const getHighRisk = () =>
    axiosInstance.get('/pregnancy/high-risk');
