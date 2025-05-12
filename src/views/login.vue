
<template>
    <link ref="stylesheet" href="../assets/base.css" scoped>
    <div class="main-bg">
        <img class="img-bg" src="../assets/Fondo.png">
        <div class="login-card">
            <form @submit.prevent="handleLogin">
                <h2>Iniciar Sesión</h2>
                <InputText id="user" name="user" v-model="username" placeholder="Usuario" />
                <Password name="pass" v-model="password" inputId="pass" placeholder="Contraseña" toggleMask :feedback="false" />
                <Checkbox inputId="remember" v-model="rememberMe" value="remember" binary />
                <label for="remember"> Recuérdame </label><br>
                <a id="forgot-pass">Olvidé mi contraseña</a>
                <p>¿No tienes cuenta? <a id="go-register" href="#"> ¡Regístrate!</a></p>
                <input type="submit" id="login" name="login" value="Ingresar" />
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
    };
  },
  methods: {
    async handleLogin() {
      try {
        // dafault http://localhost:3000/login -- Cambiar por el puerto que se esté usando (ngrok o vite)
        const response = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password,
        });

        if (response.data.success) {
          // Almacena el token o información del usuario en el localStorage o en Vuex
          localStorage.setItem('user_token', response.data.token);

          // Redirigir al usuario a la página principal o al dashboard
          this.$router.push('/home');
        } else {
          alert('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        alert('Hubo un problema al iniciar sesión');
      }
    },
  },
};
</script>

<style scoped>
.main-bg {
    font-family: Arial, Helvetica, sans-serif;
}
h2 {
    border-bottom: 2px solid var(--p-primary-500);
    font-size: 30px;
    text-align: center;
    padding: 5px;
    margin-bottom: 20px;
}

.img-bg {
    background: no-repeat;
    width: 100%;
    height: 100vh;
    object-fit: cover;
    position: relative;
    overflow-x: hidden;
    z-index: 0;
}

.login-card {
    background-color:#021F25;
    box-shadow: 15px 15px 0px #011823;    
    color: var(--p-primary-50);
    border: none;
    border-radius: 15px;
    width: 20rem;
    height: auto;
    position: absolute;
    top: 30%;
    right: 40%;
    z-index: 1;
}

form {
    display: block;
    padding: 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
form p{
    display: flex;
    justify-content: center;
    border-bottom: 2px solid var(--p-primary-500);
    margin: 10px 0px;
    padding: 10px 0px;
}
#forgot-pass {
    color: var(--p-primary-500);
    text-decoration: underline;
    display: flex;
    margin-top: 15px;
    justify-content: center;
    cursor: pointer;
}
#go-register {
    color: #9F86F9;
    text-decoration: underline;
    cursor: pointer;
}
input,
.p-inputtext,
.p-password {
    appearance: none;
    font-size: 20px;
    background-color: var(--p-surface-50);
    margin: 10px 0px;
    padding: 10px;
    border-radius: 35px;
    border: 1px solid #ccc;
    outline: none;
    width: 100%;
    color:#011823
}

/* Ajusta el input dentro del componente Password */
:deep(.p-password-input) {
    background-color: var(--p-surface-50) !important;
    font-size: 20px;
    border: none !important;
    box-shadow: none;
    width: 90%;
    outline: none;
}

/* Ajusta la alineación del icono del ojo */
:deep(.p-password .p-icon) {
    right: 15px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%) !important;
    width: 25px;
    height: 25px;
}

input:focus,
.p-inputtext:focus {
    border-color: var(--p-emerald-700);
    box-shadow: 0 0 5px rgba(0, 255, 76, 0.5);
}

#login {
    background-color: var(--p-emerald-700);
    color: white;
    cursor: pointer;
    border: none;
    transition: background 0.3s;
}

#login:hover {
    background-color: var(--p-emerald-900);
}
</style>
