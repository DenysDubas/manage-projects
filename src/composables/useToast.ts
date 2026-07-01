import { ref } from 'vue'

export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<ToastMessage[]>([])
let toastId = 0

export function useToast() {
  function showToast(text: string, type: ToastMessage['type'] = 'success'): void {
    const id = ++toastId
    toasts.value.push({ id, text, type })
    window.setTimeout(() => removeToast(id), 3000)
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast,
  }
}
