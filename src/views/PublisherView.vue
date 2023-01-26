<script setup>
import { onMounted, ref, inject, onUpdated } from 'vue';
import { useRoute } from 'vue-router';
import { getStorage, setStorage } from '../config/storage';

const route = useRoute();
const nama = ref(false)
const profil = ref('')
onMounted(async ()=>{
  profil.value = await getStorage('profil')
  nama.value = route.params.channel
  let cekRiwayat = await getStorage(`riwayat_${profil.value}_${nama.value}`)
  if(cekRiwayat) riwayat.value = cekRiwayat
})
const emitter = inject('emitter')
const riwayat = ref([])
const message = ref('')
const sendChat = async () => {
  if(message.value!==''){
    emitter.emit('sendChat', [nama.value, message.value])
    riwayat.value.unshift(message.value)
    await setStorage(`riwayat_${profil.value}_${nama.value}`, riwayat.value)
    message.value = ''
  }
}
onUpdated(async ()=>{
  if(route.params.channel != nama.value){
    nama.value = route.params.channel;
    riwayat.value = []
    message.value = ''
    let cekRiwayat = await getStorage(`riwayat_${profil.value}_${nama.value}`)
    if(cekRiwayat) riwayat.value = cekRiwayat
  }
})
</script>

<template>
  <div class="titlePage">
    <h1>Chat {{ nama }}</h1>
    <br/>
    <div>
      <v-text-field label="Pesan Anda" placeholder="ketik lalu enter" variant="outlined" v-model="message" @keyup.enter="sendChat"></v-text-field>
    </div>
    <div v-if="riwayat.length > 0">
      <h4>Riwayat Chat</h4>
      <v-list lines="one">
        <div v-for="item in riwayat">
          <v-divider></v-divider>
          <v-list-item :title="item"></v-list-item>
        </div>
      </v-list>
    </div>
  </div>
</template>
