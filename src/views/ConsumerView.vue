<script setup>
import { inject, ref, onMounted } from 'vue';
import { getStorage } from '../config/storage';

const emitter = inject('emitter')
const inbox = ref([])
emitter.on('changeInbox', (val)=>{
  inbox.value = val
})
onMounted(async ()=>{
  let profil = await getStorage('profil')
  let cekInbox = await getStorage(`inbox_${profil}`)
  if(cekInbox){
    inbox.value = cekInbox
  }
})
</script>

<template>
  <div class="titlePage">
    <h1>Pesan Masuk</h1>
    <div v-if="inbox.length > 0">
      <h4>Riwayat Chat</h4>
      <v-list lines="one">
        <div v-for="item in inbox">
          <v-divider></v-divider>
          <v-list-item :title="item"></v-list-item>
        </div>
      </v-list>
    </div>
  </div>
</template>
