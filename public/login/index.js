const params = new URLSearchParams(window.location.search);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('error').innerHTML = params.get('error') || '';
});