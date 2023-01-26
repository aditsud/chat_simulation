import { Preferences as Storage } from '@capacitor/preferences';

async function getFromStorage(){
  let {value}  = await Storage.get({ key: 'chatsimulation' }) ;
  let parsedSavedItem = value ? JSON.parse(value) : {};
  return parsedSavedItem;
}

async function saveToStorage(obj){
  await Storage.set({
    key: 'chatsimulation',
    value: JSON.stringify(obj),
  });
}

export async function setStorage(key, value){
  let parsedSavedItem = await getFromStorage();
  parsedSavedItem[key] = value;
  saveToStorage(parsedSavedItem);
}

export async function getStorage(key){
  let parsedSavedItem = await getFromStorage();
  return parsedSavedItem[key];
}

export async function removeStorage(key){
  let parsedSavedItem = await getFromStorage();
  delete parsedSavedItem[key]
  saveToStorage(parsedSavedItem);
}

export async function clearStorage(){
  await Storage.remove({ key: 'chatsimulation' });
}