const { createApp, ref } = Vue;

const params = new URLSearchParams(window.location.search);

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref(params.get('error') || '');


let previousUsername = '';
let previousPassword = '';
setInterval(async () => {
    if (username.value === previousUsername && password.value === previousPassword) return;
    previousUsername = username;
    previousPassword = password;

    const response = await fetch(`/isValid?username=${username.value}&password=${password.value}`);
    const result = await response.json();
    
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
    const response = await fetch(`/isValid?username=${username.value}&password=${password.value}`);
    const result = await response.json();
    
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
