
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm'); //tomar informacion del form pt3
    const loginButton = document.getElementById('loginButton'); // boton de login

    const passwordInput = document.getElementById('password'); // 
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');


    // se envia el form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        errorMessage.textContent = ''; // para elminiar contendio de textboxes
        errorMessage.style.display = 'none';
        successMessage.textContent = '';
        successMessage.style.display = 'none';
        
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;
        
        if (!usuario || !password) { // asegurar campos completos
            showError('Por favor completa todos los campos');
            return;
        }
    
        setLoading(true);
        
        try {
            const response = await fetch('php/login.php', { // enviar info de login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuario: usuario,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('Inicio de sesión exitoso. Redirigiendo...');
                
                setTimeout(() => {
                    window.location.href = data.redirect || 'adminDashboard.php';
                }, 1000);
            } else {
                showError(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error de conexión. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    });

    function showError(message) { //mensaje de error
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) { // mensaje de completado
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }

    function setLoading(loading) {
        const buttonText = loginButton.querySelector('.button-text');
        const spinner = loginButton.querySelector('.spinner');
        
        if (loading) {
            loginButton.disabled = true;
            loginButton.classList.add('loading');
            buttonText.textContent = 'Iniciando sesión...';
            spinner.style.display = 'inline-block';
        } else {
            loginButton.disabled = false;
            loginButton.classList.remove('loading');
            buttonText.textContent = 'Iniciar Sesión';
            spinner.style.display = 'none';
        }
    }
});