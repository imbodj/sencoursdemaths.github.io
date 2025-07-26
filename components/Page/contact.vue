<template>
  <div id="contact" class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Contactez-moi</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <input v-model="form.name" type="text" placeholder="Nom" required class="w-full p-2 border rounded" />
      <input v-model="form.email" type="email" placeholder="Email" required class="w-full p-2 border rounded" />
      <textarea v-model="form.message" placeholder="Votre message" required class="w-full p-2 border rounded h-32"></textarea>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Envoyer
      </button>
    </form>
    <p v-if="successMessage" class="text-green-600 mt-4">{{ successMessage }}</p>
    <p v-if="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</p>
  </div>
</template>


<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  message: ''
})

const successMessage = ref('')
const errorMessage = ref('')

// 🔁 Remplace ce lien par le tien
const endpoint = 'https://formspree.io/f/xwpqolpp'

const submitForm = async () => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      successMessage.value = 'Message envoyé avec succès !'
      errorMessage.value = ''
      form.value = { name: '', email: '', message: '' }
    } else {
      throw new Error('Échec de l’envoi')
    }
  } catch (error) {
    successMessage.value = ''
    errorMessage.value = 'Une erreur est survenue.'
  }
}
</script>
