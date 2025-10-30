const { createApp, ref } = Vue;

const params = new URLSearchParams(window.location.search);

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref(params.get('error') || '');


async function isValid(username, password) {
    const response = await fetch('/isValid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value }) // Convert the JavaScript object to a JSON string
    });
    const result = await response.json();
    return result;
}



let previousUsername = '';
let previousPassword = '';
setInterval(async () => {
    if (username.value === previousUsername && password.value === previousPassword) return;
    previousUsername = username;
    previousPassword = password;

    const result = await isValid(username, password);    
    error.value = result.reason || '';
    if (password.value !== confirmPassword.value && error.value == '') {
        error.value = "Passwords do not match";
    }
}, 250);

async function submit() {
    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return;
    }
    const result = await isValid(username, password);
    
    if (!result.valid) return;
    document.getElementById('form').submit();
}

createApp({
	setup() {
		return {
			username,
			password,
			confirmPassword,
			error,
			submit
		};
	}
}).mount('body');
