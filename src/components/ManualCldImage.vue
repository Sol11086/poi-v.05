<template>
  <img v-if="imageUrl" :src="imageUrl" :alt="alt" /> <div v-else>Cargando imagen o ID no válido...</div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { Cloudinary } from '@cloudinary/url-gen';
import { scale, limitFit, fill, crop as transformationCrop } from '@cloudinary/url-gen/actions/resize';
import { format as deliveryFormat, quality as deliveryQuality } from '@cloudinary/url-gen/actions/delivery';

const props = defineProps({
  publicId: { type: String, required: true },
  cloudName: { type: String, required: true },
  alt: { type: String, default: 'Imagen de Cloudinary' },
  width: [String, Number],
  height: [String, Number],
  crop: { type: String, default: 'limit' }, // 'limit', 'scale', 'fill', 'crop'
  // Podrías añadir más props para:
  // gravity: { type: String, default: 'auto' },
  // format: { type: String, default: 'auto' },
  // quality: { type: String, default: 'auto' },
});

const cldInstance = new Cloudinary({
  cloud: {
    cloudName: props.cloudName,
  },
});

const imageUrl = computed(() => {
  if (!props.publicId || !props.cloudName) {
    console.warn("ManualCldImage: publicId o cloudName faltan.");
    return null;
  }

  let image = cldInstance.image(props.publicId);
  let resizeAction;

  // Lógica de Resize
  if (props.width || props.height) {
    switch (props.crop) {
      case 'scale':
        resizeAction = scale();
        break;
      case 'limit':
        resizeAction = limitFit();
        break;
      case 'fill':
        resizeAction = fill();
        // if (props.gravity) resizeAction.gravity(props.gravity); // Ejemplo si añades prop de gravedad
        break;
      case 'crop':
        resizeAction = transformationCrop();
        // if (props.gravity) resizeAction.gravity(props.gravity); // Ejemplo
        break;
      default:
        // Si solo se especifica width o height sin un crop específico, limitFit es un buen default.
        resizeAction = limitFit();
    }

    if (props.width) resizeAction.width(parseInt(props.width, 10));
    if (props.height) resizeAction.height(parseInt(props.height, 10));
    
    if (resizeAction) image.resize(resizeAction);

  } else if (props.crop && (props.crop === 'fill' || props.crop === 'crop')) {
      // 'fill' y 'crop' usualmente requieren dimensiones. Advierte si no se proveen.
      console.warn(`ManualCldImage: El modo de recorte '${props.crop}' usualmente requiere width y/o height.`);
  }


  // Buenas prácticas: formato y calidad automáticos
  image.delivery(deliveryFormat('auto')); // f_auto
  image.delivery(deliveryQuality('auto')); // q_auto

  const url = image.toURL();
  console.log(`ManualCldImage URL para publicId '${props.publicId}': ${url}`);
  return url;
});
</script>

<style scoped>
img {
  display: block;
  max-width: 100%; /* Importante para responsividad */
  height: auto;   /* Mantiene la proporción si solo se define width */
  /* Puedes definir width/height específico aquí si es un tamaño fijo,
     o dejar que las props del componente y Cloudinary lo manejen */
}
</style>