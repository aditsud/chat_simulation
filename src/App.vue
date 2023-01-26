<script setup>
import { ref, inject, onUnmounted, onMounted} from 'vue';
import { useRouter, RouterView } from 'vue-router'
import profilePicture from './assets/profile.png'
import { host, user, password, vhost, stompHeader } from './config/amqp_config'
// https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html
import Stomp from 'stompjs'
import { getStorage, removeStorage, setStorage } from './config/storage';
import AWN from "awesome-notifications"
import 'awesome-notifications/dist/style.css'

let notifier = ref(null)
const renderVersion = ref(1)

const drawer = ref(true)
const status = ref('Offline')
const emitter = inject('emitter')
emitter.on('ubahStatus', (val)=>{
  status.value = val
})
const router = useRouter();

const channels = ref([])
const inbox = ref([])
const myChannel = ref('')

let ws = new WebSocket(host)
let client = Stomp.over(ws);

const sub_id = ref(null)

const on_connect =  async () => {
  
  console.log('connectedd');
  status.value = 'Online'; 
  sub_id.value = await client.subscribe(`/queue/${myChannel.value}`, async (response) => {
    inbox.value.unshift(response.body)
    await setStorage(`inbox_${myChannel.value}`, inbox.value)
    emitter.emit('changeInbox', inbox.value)
    notifier.value.success(response.body)
  }, stompHeader);
  let cekListChat = await getStorage(`listchat_${myChannel.value}`)
  if(cekListChat) channels.value = cekListChat
  let cekinbox = await getStorage(`inbox_${myChannel.value}`)
  if(cekinbox) inbox.value = cekinbox
  
};
const on_error =  function() {
  status.value = 'Offline';
  console.log('error');
};
const connect = () => {
  if(client.connected) client.disconnect();
  ws = null;
  client = null;
  // https://www.cloudamqp.com/docs/web_stomp.html
  ws = new WebSocket(host)
  client = Stomp.over(ws);
  client.heartbeat.outgoing = 3000;
  client.heartbeat.incoming = 3000;
  client.debug = (m) => {
    console.log("StompJS: ", m);
    if(m.includes('Whoops! Lost connection') || m.includes('DISCONNECT')){
      status.value = 'Offline'
      router.push('/home')
      return;
    } 
  };
  client.connect(user, password, on_connect, on_error, vhost);
  
  renderVersion.value += 2
}
emitter.on('sendChat', (val)=>{
  client.send(`/queue/${val[0]}`, { "content-type": "text/plain" }, val[1]);
})
emitter.on('saveMyChannel', (val) => {
  myChannel.value = val
  connect()
})
onUnmounted(()=>{
  client.disconnect();
})
onMounted(async () => {
  let cekprofil = await getStorage('profil')
  if(cekprofil){
    emitter.emit('saveMyChannel', cekprofil)
  }
  if(notifier.value === null){
    notifier.value = new AWN({
      labels: {
        success: 'Pesan Baru'
      }
    })
  }
})

const dialogChat = ref(false)
emitter.on('newChat', () => {
  dialogChat.value = true
})
const personToChat = ref('')
const startChat = async () => {
  if(personToChat.value!==''){
    // ke url lain
    channels.value.push({
      channel_name: personToChat.value
    })
    await setStorage(`listchat_${myChannel.value}`, channels.value)
    router.push('/chat/' + personToChat.value)
    dialogChat.value = false;
    personToChat.value = ''
  }
  
  
}

const gantiIdentitas = async () => {
  await removeStorage('profil')
  myChannel.value = ''
  inbox.value = []
  channels.value = []
  client.disconnect();
  emitter.emit('gantiIdentitas')
  router.push('/home')
}
</script>

<template>
  <v-app>
    <v-layout>
      <v-app-bar 
        color="primary"
        prominent
      >
        <template v-slot:prepend>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title @click="router.push('/home')">Chat Simulation</v-app-bar-title>

        <template v-slot:append>
          <!-- <v-btn icon="mdi-dots-vertical"></v-btn> -->
          <small>&copy; 23222063</small>
        </template>
      </v-app-bar>
      <v-navigation-drawer
        :key="renderVersion"
        v-model="drawer"
        :temporary="false"
      >
        <template v-slot:prepend>
          <v-list-item
            lines="two"
            :prepend-avatar="profilePicture"
            :subtitle="status"
          >
          <v-list-item-title>{{myChannel}} <v-icon v-if="myChannel!=='' " @click="gantiIdentitas">mdi-logout</v-icon></v-list-item-title>
        </v-list-item>
        </template>

        <v-divider v-if="status==='Online'"></v-divider>        

        <v-list v-if="status==='Online'" density="compact" nav>
          
          <v-list-item prepend-icon="mdi-inbox" value="inbox" to="/inbox">
            <v-list-item-content>
              <v-badge :content="inbox.length" inline color="blue">
                <v-list-item-title>Pesan Masuk</v-list-item-title>
              </v-badge>
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="channels.length>0" style="padding-top:10px; margin-top: 10px;"></v-divider>
          <v-list-item v-if="channels.length>0" v-for="item in channels" prepend-icon="mdi-account" :title="item.channel_name" :value="item.channel_name" :to="'/chat/' + item.channel_name"></v-list-item>
        </v-list>

      </v-navigation-drawer>


      <v-main>
        <div class="innerBody">
          <RouterView />
        </div>

        <v-dialog
          transition="dialog-bottom-transition"
          v-model="dialogChat"
          size="sm"
          class="dialogChannel"
        >
          <v-card>
            <v-toolbar
              color="primary"
              title="Masukkan Nama Orang yang Ingin Anda Chat"
            ></v-toolbar>
            <v-card-text>
              <v-text-field onkeydown="if(['Space'].includes(arguments[0].code)){return false;}" label="" variant="outlined" v-model="personToChat" @keyup.enter="startChat"></v-text-field>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                variant="text"
                @click="dialogChat = false"
              >Batal</v-btn>
              <v-btn
                color="primary"
                :disabled="personToChat===''"
                @click="startChat"
              >Mulai Percakapan</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn
          v-if="status==='Online'"
          class="fab"
          @click="dialogChat=true"
          icon="mdi-pencil"
          color="primary"
        ></v-btn>
        
      </v-main>

      
    </v-layout>
  </v-app>

  
</template>

<style scoped>
.innerBody{
  padding: 20px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
.dialogChannel{
  max-width: 500px;
}
.fab{
  position: absolute;
  right:20px;
  bottom: 20px;
}
</style>
