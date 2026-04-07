import axiosInstance from './axiosInstance';

export const getMyChildren = (parentId) =>
    axiosInstance.get(`/child/my-children`, { params: { parentId } });

export const registerChild = (data) =>
    axiosInstance.post('/child/register', data);

export const getGrowthChart = (childId) =>
    axiosInstance.get(`/child/${childId}/growth-chart`);

export const getChildrenForAnganwadi = (anganwadiId) =>
    axiosInstance.get(`/child/anganwadi/${anganwadiId}`);
