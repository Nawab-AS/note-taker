const params = new URLSearchParams(window.location.search);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('error').innerHTML = params.get('error') || '';
});

let previousUsername = '';
let previousPassword = '';
setInterval(async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === previousUsername && password === previousPassword) return;
    previousUsername = username;
    previousPassword = password;

    const response = await fetch(`/isValid?username=${username}&password=${password}`);
    const result = await response.json();

    document.getElementById('error').innerHTML = result.valid ? '' : result.reason;
}, 250);