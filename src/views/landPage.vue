<script setup>
</script>

<template>
    <div class="main-bg">
        <div class="slogan">
            <p> Where Ideas <b class="b1">Grow</b> and <b class="b2">Teams</b> Thrive!</p>
        </div>
        <div class="buttons">
            <button class="btn-1">Sign Up</button>
            <button class="btn-2" @click="$router.push('/login')">Log In</button>
        </div>
    </div>
    <img class="img-design" src="../assets/diseño.png" alt="landing">
    <img class="img-root" src="../assets/planta.png">>
</template>

<style scoped>
.main-bg {
    background: linear-gradient(to top right, #041e10 0%, #000f16 35%, #000F16 80%);
    height: 100vh;
    width: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: hidden;
}
.buttons{
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 65%;
    left: 20%;
    width: 30%;
}
.btn-1, .btn-2{
    height: 50px;
    color: white;
    font-size: 1.5rem;
    border: none;
    border-radius: 50px;
    margin-bottom: 40px;
    z-index: 1;
}

.btn-1{
    width: 40%;
    background-color: #105B32;
    cursor: pointer;
}
.btn-2{
    width: 60%;
    background-color: #129E82;
    cursor: pointer;
}
.slogan{
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 25%;
    left: 20%;
    width: 30%;
    text-align: left;
}
.img-root{
    width: 139.7px;
    height: 290.4px;
    position: absolute;
    left: 31.3%;
    bottom: 0%;
    z-index: 0;
}

.img-design{
    width: 565.4px;
    height: 752.4px;
    position: absolute;
    right: 18%;
    top: 15%;
    z-index: 1;
}

p {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 4.5rem;
    color: white;
}

.b1 {
    color: #129E82;
}

.b2 {
    color: #9F86F9;
}
</style>
