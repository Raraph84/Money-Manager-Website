export const login = (password) => postProp("/auth/login", { password }, "token", "no");
export const logout = () => postNoContent("/auth/logout");

export const getFlows = (includes) => getProp(withIncludes("/flows", includes), "flows");
export const getFlow = (flowId, includes) => get(withIncludes("/flows/" + flowId, includes));

export const getInflows = (includes) => getProp(withIncludes("/inflows", includes), "inflows");
export const getInflow = (inflowId, includes) => get(withIncludes("/inflows/" + inflowId, includes));

export const getOutflows = (includes) => getProp(withIncludes("/outflows", includes), "outflows");
export const getOutflow = (outflowId, includes) => get(withIncludes("/outflows/" + outflowId, includes));

export const getPeople = () => getProp("/people", "people");
export const getPerson = (personId) => get("/people/" + personId);

export const getAccounts = () => getProp("/accounts", "accounts");
export const getAccount = (accountId) => get("/accounts/" + accountId);

export const getBusinesses = () => getProp("/businesses", "businesses");
export const getBusiness = (businessId) => get("/businesses/" + businessId);

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

const get = (url, auth) => requestJson(url, "GET", null, auth);
const getProp = (url, name, auth) => requestJson(url, "GET", null, auth).then((res) => res[name]);

const postProp = (url, body, name, auth) => requestJson(url, "POST", body, auth).then((res) => res[name]);
const postNoContent = (url, body, auth) => request(url, "POST", body, auth).then(() => undefined);

const withIncludes = (url, includes = []) => {
    const params = new URLSearchParams();
    if (includes.length) params.set("includes", includes.join(","));
    return url + (params.size ? "?" + params : "");
};
