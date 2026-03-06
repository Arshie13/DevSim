<script lang="ts">
  import { Plus, Edit, Eye, Clock, CheckCircle, XCircle, Layers } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">My Submissions</h1>
        <p class="text-gray-400">Manage your user generated content</p>
      </div>
      <a
        href="/ugc/new"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus class="w-5 h-5" />
        New Submission
      </a>
    </div>

    {#if data.ugcList.length === 0}
      <div class="bg-gray-800 rounded-xl p-12 text-center">
        <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers class="w-8 h-8 text-gray-500" />
        </div>
        <h2 class="text-xl font-semibold mb-2">No submissions yet</h2>
        <p class="text-gray-400 mb-6">Create your first user generated content to get started.</p>
        <a
          href="/ugc/new"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus class="w-5 h-5" />
          Create Submission
        </a>
      </div>
    {:else}
      <!-- Submissions Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each data.ugcList as ugc}
          <div class="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all">
            <!-- Card Header -->
            <div class="p-5 border-b border-gray-700">
              <div class="flex items-start justify-between mb-2">
                <span class="px-3 py-1 rounded-full text-xs font-medium
                  {ugc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                   ugc.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                   'bg-red-500/20 text-red-400'}">
                  {ugc.status}
                </span>
                <span class="text-xs text-gray-400">
                  {new Date(ugc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 class="font-semibold text-lg line-clamp-1">{ugc.repoLink.split('/').pop() || 'Untitled'}</h3>
              {#if ugc.scenario}
                <p class="text-gray-400 text-sm mt-1 line-clamp-2">{ugc.scenario}</p>
              {/if}
            </div>

            <!-- Tech Stacks -->
            <div class="px-5 py-3 bg-gray-700/30">
              <div class="flex flex-wrap gap-1.5">
                {#each ugc.techStacks.slice(0, 4) as stack}
                  <span class="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                    {stack.name}
                  </span>
                {/each}
                {#if ugc.techStacks.length > 4}
                  <span class="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
                    +{ugc.techStacks.length - 4}
                  </span>
                {/if}
              </div>
            </div>

            <!-- Stats -->
            <div class="px-5 py-3 border-t border-gray-700 flex items-center justify-between text-sm">
              <div class="flex items-center gap-4 text-gray-400">
                <span class="flex items-center gap-1">
                  <Layers class="w-4 h-4" />
                  {ugc.levels.length} levels
                </span>
                <span class="flex items-center gap-1">
                  <CheckCircle class="w-4 h-4" />
                  {ugc.levels.reduce((sum, l) => sum + l.tasks.length, 0)} tasks
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="px-5 py-3 border-t border-gray-700 flex gap-2">
              <a
                href="/ugc/{ugc.id}"
                class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center text-sm flex items-center justify-center gap-2"
              >
                <Edit class="w-4 h-4" />
                Edit
              </a>
              {#if ugc.status === 'pending' || ugc.status === 'rejected'}
                <a
                  href="/workspace/{ugc.id}"
                  class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center text-sm flex items-center justify-center gap-2"
                >
                  <Eye class="w-4 h-4" />
                  Preview
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
