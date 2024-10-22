export const login = (email, password) => postProp("/auth/login", { email, password }, "token", "no");
export const logout = () => postNoContent("/auth/logout");

const request = (url, method, body = null, auth = "yes") => new Promise((resolve, reject) => {
    fetch(process.env.NEXT_PUBLIC_API_HOST + url, {
        method,
        headers: {
            ...(auth === "yes" || (auth === "ifAvailable" && localStorage.getItem("token")) ? { "Authorization": localStorage.getItem("token") || "no" } : {}),
            ...(body ? { "Content-Type": "application/json" } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    }).then((res) => {
        if (res.ok) resolve(res);
        else res.json().then((res) => reject(res.message)).catch((error) => reject(error.toString()));
    }).catch((error) => reject(error.toString()));
});

const requestJson = (...args) => new Promise((resolve, reject) => {
    request(...args).then((res) => {
        res.json().then((res) => { delete res.code; resolve(res); }).catch((error) => reject(error.toString()));
    }).catch((error) => reject(error));
});

const postProp = (url, body, name, auth) => requestJson(url, "POST", body, auth).then((res) => res[name]);
const postNoContent = (url, body, auth) => request(url, "POST", body, auth).then(() => undefined);

const withIncludes = (url, includes = []) => {
    const params = new URLSearchParams();
    if (includes.length) params.set("includes", includes.join(","));
    return url + (params.size ? "?" + params : "");
};
