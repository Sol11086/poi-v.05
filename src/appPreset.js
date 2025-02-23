import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const appPreset = definePreset(Aura, {
  primitive: {
    independence: '#4B5563',
    zinc: '#F4F4F5',
    darkCharcoal: '#333333',
    jonquil: '#F1C40F',
    white: '#FFFFFF',
    black: '#000000',
    content: '#18181B',
    grayZinc: '#3F3F46',
    azureishWhite: '#E2E8F0',
    error: '#E34449',
    platinum: '#E1E3E8',
    charcoal: '#334155',
    cadetGray: '#94A3B8',
    lightSilver: '#D1D5DB',
    brand: '#022F57',
    celticBlue: '#2E70B8',
  },
  semantic: {
    primary: {
      100: '##e6eaee',
      200: '#9aacbc',
      300: '#67829b',
      400: '#1b4469',
      500: '#129E82',  
      600: '#105B32',
      700: '#01182c',
      800: '#010e1a',
      900: '#000912',
      950: '#000509',
    },
  },
  components: {
    button: {
      colorScheme: {
        primary: {
          background: '{primary.500}', 
          hover: {
            color: '#fff', 
            background: '{primary.600}',
          },
        },
      },
    },
  },
});

export default appPreset;
