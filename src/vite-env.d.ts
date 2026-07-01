/// <reference types="vite/client" />

declare module 'vuedraggable' {
  import type { DefineComponent } from 'vue'

  const draggable: DefineComponent<object, object, unknown>
  export default draggable
}
