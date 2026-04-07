import axiosInstance from './axiosInstance';

export const markAttendance = (data) =>
    axiosInstance.post(`/attendance/mark?childId=${data.childId}&status=${data.status}&anganwadiId=${data.anganwadiId}&mealEaten=${data.mealEaten || false}`);

export const getTodayAttendance = (anganwadiId) =>
    axiosInstance.get(`/attendance/today/${anganwadiId}`);

export const getAttendanceHistory = (childId) =>
    axiosInstance.get(`/attendance/history/${childId}`);
