<template>
  <video v-if="videoUrl" :width="width" :height="height" :controls="controls">
    <source :src="videoUrl" :type="videoMimeType" />
    Tu navegador no soporta la etiqueta de video.
  </video>
  <div v-else>Error al cargar video o publicId no válido.</div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { Cloudinary } from '@cloudinary/url-gen';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { format as deliveryFormat, quality as deliveryQuality } from '@cloudinary/url-gen/actions/delivery';

const props = defineProps({
  publicId: { type: String, required: true },
  cloudName: { type: String, required: true },
  width: [String, Number],
  height: [String, Number],
  controls: { type: Boolean, default: true },
  format: { type: String, default: 'mp4' },
});

const cldInstance = new Cloudinary({
  cloud: {
    cloudName: props.cloudName,
  },
});

const videoUrl = computed(() => {
  if (!props.publicId || !props.cloudName) {
    console.warn("ManualCldVideo: publicId o cloudName faltan.");
    return null;
  }

  const video = cldInstance.video(props.publicId);

  video.delivery(deliveryFormat(props.format || 'auto'));

  if (props.width) {
    const resizeAction = scale();
    resizeAction.width(parseInt(props.width, 10));
    if (props.height) {
      resizeAction.height(parseInt(props.height, 10));
    }
    video.resize(resizeAction);
  }

  // Ahora 'deliveryQuality' está definido porque lo importaste
  video.delivery(deliveryQuality('auto'));

  const url = video.toURL();
  console.log(`ManualCldVideo URL para publicId '${props.publicId}': ${url}`);
  return url;
});

const videoMimeType = computed(() => `video/${props.format}`);
</script>

<style scoped>
video {
  display: block;
  max-width: 100%;
}
</style>