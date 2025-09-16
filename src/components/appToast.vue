<template>
  <transition name="slide-fade">
    <div v-if="visivel" :class="['toast', tipo]">{{ mensagem }}</div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'AppToast',
  props: {
    mensagem: { type: String, required: true },
    tipo: { type: String, default: 'sucesso' }, // 'sucesso' ou 'erro'
    duracao: { type: Number, default: 3000 }
  },
  setup(props) {
    const visivel = ref(false)

    watch(() => props.mensagem, (nova) => {
      if (!nova) return
      visivel.value = true
      setTimeout(() => visivel.value = false, props.duracao)
    })

    return { visivel }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 200px;
  padding: 12px 18px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 2000;
}
.toast.sucesso { background-color: #1abc9c; }
.toast.erro { background-color: #e74c3c; }

.slide-fade-enter-active,
.slide-fade-leave-active { transition: all 0.4s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-20px); }
.slide-fade-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
