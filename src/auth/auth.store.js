export const setAuth = ({access, refresh, user}) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("user", JSON.stringify(user));
}

export const clearAuth = () => {
  localStorage.clear();
}

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
}