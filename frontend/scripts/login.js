function showForm(formId) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('btn-login');
    const registerTab = document.getElementById('btn-register')
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.remove('active');
    registerTab.classList.remove('active')
    if (formId === 'login') {
        loginForm.classList.remove('hidden');
        loginTab.classList.add('active');
    } else if (formId === 'register') {
        registerForm.classList.remove('hidden');
        registerTab.classList.add('active');
    }
}