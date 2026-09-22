<script lang="ts">
  import type { PageData } from './$types';
  import type { UserData } from '$types';
  import Header from '$components/Header.svelte';
  import ScenarioList from '$components/scenario/ScenarioList.svelte';

  export let data: PageData;

  const headerUserData: Partial<UserData> = {
    name: data.user?.name ?? 'No Name',
    email: data.user.email ?? 'No email',
    image: data.user.image ?? 'No image found',
    id: data.user.id ?? '',
    avatar: data.user?.image ?? '../static/avatars/defaultcyan.svg',
    fullName: data.user?.name ?? data.user?.name ?? 'No name found',
    coins: data.userCoins,
  };
</script>

<svelte:head>
  <title>DevSim — Choose Your Scenario</title>
</svelte:head>

<div class="page-root">
  <!-- Background layers -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-orb" aria-hidden="true"></div>
  <div class="scanlines" aria-hidden="true"></div>

  <div class="relative z-10 flex flex-col min-h-screen">
    <Header userData={headerUserData} />

      <main class="page-container py-4">
      <ScenarioList
        scenarios={data.scenarios}
        stackName={data.stackName}
        selection={data.selection}
        tutorialState={data.tutorialState}
      />
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #0a0e1a;
  }

  .page-root {
    min-height: 100vh;
    background: #0a0e1a;
    color: #d0d7dd;
    position: relative;
  }

  .bg-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image:
      repeating-linear-gradient(0deg,   var(--grid-line) 0, var(--grid-line) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg,  var(--grid-line) 0, var(--grid-line) 1px, transparent 1px, transparent 40px);
    pointer-events: none;
  }

  .bg-orb {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60vh;
    z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(7, 165, 201, 0.03), transparent);
    pointer-events: none;
  }

</style>
