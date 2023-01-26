<script setup>
import { inject, ref, onMounted } from 'vue';
import { getStorage, setStorage } from '../config/storage';

const nama = ref('')
const dialog = ref(false)
const emitter = inject('emitter')
const openDialog = () => {
  dialog.value = true
}
const hasInputChannel = ref(false)
const simpanChannel = async () => {
  if(nama.value!==''){
    dialog.value = false
    await setStorage('profil', nama.value)
    emitter.emit('saveMyChannel', nama.value)
    hasInputChannel.value = true
  }
}
onMounted(async () => {
  let cekprofil = await getStorage('profil')
  if(cekprofil){
    hasInputChannel.value = true
  }
})
const openDialogChat = () => {
  emitter.emit('newChat')
}
emitter.on('gantiIdentitas', () => {
  dialog.value = true;
  hasInputChannel.value = false
  nama.value = '';
})
</script>

<template>
  <div class="parent">
    <div v-if="!hasInputChannel" class="inputnama">
      <p>Sebelum memulai chat, silakan masukkan nama Anda terlebih dahulu.</p>
      <v-btn variant="flat" block color="primary" @click="openDialog">
        INPUT NAMA
      </v-btn>
    </div>
    <div v-else>
      <p>Ayo mulai chat dengan seseorang.</p>
      <v-btn variant="flat" block color="primary" @click="openDialogChat">
        Mulai Chat!
      </v-btn>
    </div>
  </div>
  <v-dialog
    transition="dialog-bottom-transition"
    v-model="dialog"
    size="sm"
    class="dialogChannel"
  >
    <v-card>
      <v-toolbar
        color="primary"
        title="Masukkan Nama Anda"
      ></v-toolbar>
      <v-card-text>
        <v-text-field onkeydown="if(['Space'].includes(arguments[0].code)){return false;}" label="" variant="outlined" v-model="nama" @keyup.enter="simpanChannel"></v-text-field>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          variant="text"
          @click="dialog = false"
        >Batal</v-btn>
        <v-btn
          color="primary"
          :disabled="nama===''"
          @click="simpanChannel"
        >Simpan</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.parent{
  height: calc(100vh - 104px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialogChannel{
  max-width: 500px;
}
</style>