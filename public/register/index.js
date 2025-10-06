const { createApp, ref } = Vue;

const params = new URLSearchParams(window.location.search);

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref(params.get('error') || '');


function validateAndSubmit() {
    error.value = "";
    username.value = username.value.trim();

    if (!username.value) {
        error.value = "Username is required.";
        return;
    }
    if (username.value.length < 7) {
        error.value = "Username must be at least 7 characters.";
        return;
    }
    if (!password.value) {
        error.value = "Password is required.";
        return;
    }
    if (password.value.length < 6) {
        error.value = "Password must be at least 6 characters.";
        return;
    }
    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match.";
        return;
    }


    // If all validations pass, submit the form
    error.value = "";
    document.getElementById('form').submit();
}

createApp({
	setup() {
		return {
			username,
			password,
			confirmPassword,
			error,
			validateAndSubmit
		};
	}
}).mount('body');
