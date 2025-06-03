<template>
  <Button @click="handleUpload" :label="buttonLabel" :icon="icon || 'pi pi-upload'" />
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import Button from 'primevue/button'; // Usas PrimeVue según tu main.js
import axios from 'axios'; // Ya es una dependencia

const scriptLoaded = ref(!!window.cloudinary);

const props = defineProps({
  buttonLabel: { type: String, default: 'Upload File' },
  icon: { type: String, default: null },
  uploadPreset: { type: String, required: true }, // Nombre del PRESET FIRMADO de Cloudinary
  folder: String, // Carpeta opcional en Cloudinary
  tags: Array, // Tags opcionales
  source: String, // Contexto: 'chat', 'task_submission'
  relatedId: String // ID contextual: chat_id, team_id, task_id
});
const emit = defineEmits(['upload-success', 'upload-error']);

const widgetInstance = ref(null);

const API_BASE_URL = 'https://fcea-2806-230-4043-c126-7dfb-b81d-b40-eef7.ngrok-free.app'; // deafult http://localhost:3000

// Cargar script del widget de Cloudinary dinámicamente
onMounted(() => {
  if (!scriptLoaded.value) {
    // Prevenir múltiples cargas del script si el componente se monta varias veces
    if (document.querySelector('script[src="https://upload-widget.cloudinary.com/global/all.js"]')) {
        // Si ya existe el tag y window.cloudinary está disponible, marca como cargado
        if (window.cloudinary) scriptLoaded.value = true;
        // Si no, el script existente podría estar aún cargando, su `onload` (si tuviera) lo manejaría.
        // O podemos añadir un pequeño poller aquí si es necesario, pero usualmente no lo es.
        return;
    }
    const script = document.createElement('script');
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => {
      console.log("Cloudinary widget script loaded successfully via onMounted.");
      scriptLoaded.value = true;
    };
    script.onerror = () => {
      console.error("Failed to load Cloudinary widget script.");
      scriptLoaded.value = false; // O manejar de otra forma
    };
    document.head.appendChild(script);
  }
});

const handleUpload = async () => {
  if (!scriptLoaded.value || !window.cloudinary) {
    alert("Cloudinary widget is not loaded yet. Please try again in a few moments.");
    console.error("Cloudinary SDK (window.cloudinary) not available or script not fully processed.");
    return;
  }

  try {
    console.log("Requesting signature with preset:", props.uploadPreset); // Log para depurar

  const sigResponse = await axios.post(
    `${API_BASE_URL}/api/cloudinary-signature`, // URL completa a tu backend
    {
      upload_preset: props.uploadPreset,
      folder: props.folder,
      tags: props.tags
    },
    {
      headers: {
        'ngrok-skip-browser-warning': 'true', // ¡Añade esta cabecera!
        // Si tu endpoint de firma requiere autenticación, asegúrate de incluir el token también:
        // const token = localStorage.getItem('user_token');
        // 'Authorization': token ? `Bearer ${token}` : undefined,
      }
    }
  );

  console.log("Signature response data:", sigResponse.data); // Log para depurar

  const { signature, timestamp, api_key, cloud_name } = sigResponse.data;

  if (!signature || !timestamp || !api_key || !cloud_name) {
    console.error("Incomplete signature data received:", sigResponse.data);
    emit('upload-error', { message: "Failed to get complete signature data from backend." });
    return;
  }

    // Destruir instancia anterior si existe para evitar problemas con parámetros cacheados
    if (widgetInstance.value) {
      // widgetInstance.value.destroy(); // Puede que no sea necesario o no exista, verificar docs.
      // Por ahora, simplemente creamos una nueva instancia.
    }

    widgetInstance.value = window.cloudinary.createUploadWidget({
      cloudName: cloud_name,
      apiKey: api_key,
      uploadSignatureTimestamp: timestamp,
      uploadSignature: signature,
      uploadPreset: props.uploadPreset, // Importante: este es el preset FIRMADO
      folder: props.folder,
      tags: props.tags,
      sources: ['local', 'url', 'camera'], // Puedes personalizar las fuentes
      // styling, text, etc. (ver documentación del Widget de Cloudinary)
    }, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Widget Error: ', error);
        emit('upload-error', error);
        return;
      }
      if (result && result.event === "success") {
        console.log('Upload successful: ', result.info);
        const fileData = {
          url: result.info.secure_url,
          public_id: result.info.public_id,
          file_type: result.info.resource_type + '/' + (result.info.format || result.info.resource_type), // ej: image/jpeg, video/mp4, raw/pdf
          original_filename: result.info.original_filename,
          bytes: result.info.bytes,
          name: result.info.original_filename, // Añadido para consistencia con lo que espera chat.vue
          size: result.info.bytes,       // Añadido para consistencia
          source: props.source, // Contexto
          relatedId: props.relatedId // ID contextual
        };
        emit('upload-success', fileData);
      } else if (result && result.event === 'abort') {
        console.log('Upload aborted by user.');
      }
    });

    if (widgetInstance.value) {
      widgetInstance.value.open();
    } else {
      console.error("Failed to create Cloudinary widget instance.");
      emit('upload-error', { message: "Failed to initialize upload widget." });
    }

  } catch (err) {
    console.error("Failed to get signature or open widget:", err.response ? err.response.data : err.message);
    emit('upload-error', { message: err.response?.data?.error || "Failed to initiate upload." });
  }
};
</script>