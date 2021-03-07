const showSpinner = () => {
    $("#quotegenerator-spinner").removeClass("d-none");
}
const hideSpinner = () => {
    $("#quotegenerator-spinner").addClass("d-none");
}
const fetcher = (method, url, body) => {
    return new Promise((resolve, reject) => {
        showSpinner();
        const ctx = {
            "method": method,
            "credentials": "include",
            "cors": true,
            "headers": {
                "content-type": "application/json"
            }
        }
        if (body) ctx.body = JSON.stringify(body);
        fetch(url, ctx).then(res => res.json()).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        }).then(() => {
            hideSpinner();
        })
    })
}
const doGet = (url) => {
    return fetcher("GET", url);
}
const doPost = (url, body) => {
    return fetcher("POST", url, body);
}
window.startApp = () => {

}