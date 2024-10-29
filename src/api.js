export const login = (password) => postProp("/auth/login", { password }, "token", "no");
export const logout = () => postNoContent("/auth/logout");

export const createFlow = (flow) => postProp("/flows", flow, "id");
export const getFlows = (includes, accounts) => getProp(withParam(withIncludes("/flows", includes), "accounts", accounts), "flows");
export const getFlow = (flowId, includes) => get(withIncludes("/flows/" + flowId, includes));

export const createInflow = (inflow) => postProp("/inflows", inflow, "id");
export const getInflows = (includes, people) => getProp(withParam(withIncludes("/inflows", includes), "people", people), "inflows");
export const getInflow = (inflowId, includes) => get(withIncludes("/inflows/" + inflowId, includes));

export const createOutflow = (outflow) => postProp("/outflows", outflow, "id");
export const getOutflows = (includes, people) => getProp(withParam(withIncludes("/outflows", includes), "people", people), "outflows");
export const getOutflow = (outflowId, includes) => get(withIncludes("/outflows/" + outflowId, includes));

export const createPerson = (person) => postProp("/people", person, "id");
export const getPeople = () => getProp("/people", "people");
export const getPerson = (personId) => get("/people/" + personId);

export const createAccount = (account) => postProp("/accounts", account, "id");
export const getAccounts = () => getProp("/accounts", "accounts");
export const getAccount = (accountId) => get("/accounts/" + accountId);

export const createBusiness = (business) => postProp("/businesses", business, "id");
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

const withParam = (url, param, values = []) => {
    if (!values.length) return url;
    const params = new URLSearchParams(url.split("?").slice(1).join("?"));
    params.set(param, values.join(","));
    return url + "?" + params;
};

const withIncludes = (url, includes) => withParam(url, "includes", includes);
