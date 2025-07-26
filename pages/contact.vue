<template>
  <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-xl bg-gray-800 shadow-xl rounded-2xl p-8">
      <h1 class="text-3xl font-bold mb-6 text-center text-green-400">Contact</h1>
      <p class="text-sm text-gray-300 mb-8 text-center">
        Une remarque, une idée, une correction ? N'hésitez pas à m'envoyer un message.
      </p>

      <form
        action="https://formspree.io/f/xwpqolpp"
        method="POST"
        class="space-y-6"
      >
        <!-- Nom -->
        <div>
          <label for="name" class="block mb-2 text-sm font-medium">Nom</label>
          <input
            type="text"
            name="name"
            id="name"
            required
            class="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Votre nom"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block mb-2 text-sm font-medium">Adresse email</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            class="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="exemple@email.com"
          />
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block mb-2 text-sm font-medium">Message</label>
          <textarea
            name="message"
            id="message"
            rows="5"
            required
            class="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Écrivez votre message ici..."
          ></textarea>
        </div>

        <!-- Anti-spam invisible -->
        <input type="hidden" name="_captcha" value="false" />

        <!-- Bouton envoyer -->
        <div class="text-center">
          <button
            type="submit"
            class="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-md"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
