import api from "./axios";

export const refreshAccessToken = async (refreshToken) => {
    const res = await api.post("/users/v1/token/refresh/", { 
        refresh: refreshToken 
    });
    return res.data;
}