<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
    <!-- Header -->
    <header class="bg-white shadow-soft border-b border-secondary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gradient mb-2">
            Sticker Factory
          </h1>
          <p class="text-xl text-secondary-600 font-medium">
            SVG Badge Generator
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="card p-8 md:p-12 animate-fade-in">
        <div class="text-center mb-8">
          <div class="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Scaffolding Complete
          </div>
          <h2 class="text-3xl font-bold text-secondary-900 mb-4">
            Vue 3 SPA Ready for Development
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Your application scaffold is now complete with all the modern tools and features you need to build an amazing SVG badge generator.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Vue 3 & TypeScript -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-blue-900 mb-2">Vue 3 & TypeScript</h3>
            <p class="text-blue-700 text-sm">Modern reactive framework with full type safety</p>
          </div>

          <!-- State Management -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-900 mb-2">Advanced Store</h3>
            <p class="text-green-700 text-sm">Mutex-controlled localStorage with cache-on-demand</p>
          </div>

          <!-- Tailwind CSS -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-purple-900 mb-2">Tailwind CSS</h3>
            <p class="text-purple-700 text-sm">Utility-first CSS with custom design system</p>
          </div>

          <!-- Export/Import -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-orange-900 mb-2">Export/Import</h3>
            <p class="text-orange-700 text-sm">Version-compatible data persistence and backup</p>
          </div>

          <!-- Express API -->
          <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
            <div class="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-teal-900 mb-2">Express Server</h3>
            <p class="text-teal-700 text-sm">TypeScript API with CORS and security middleware</p>
          </div>

          <!-- Development Tools -->
          <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-red-900 mb-2">Dev Tools</h3>
            <p class="text-red-700 text-sm">Vite, ESLint, Makefile, and hot reload</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-12 text-center">
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="btn-primary">
              <svg class="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
              </svg>
              Get Started
            </button>
            <button class="btn-secondary">
              <svg class="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Documentation
            </button>
          </div>
          <p class="text-sm text-secondary-500 mt-4">
            Run <code class="px-2 py-1 bg-secondary-100 rounded text-primary-600 font-mono">make dev</code> to start development
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Scaffolding complete with Tailwind CSS - ready for implementation
</script>