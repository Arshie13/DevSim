<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from "$env/static/public";
  import {
    loadStripe,
    type Stripe,
    type StripeElements,
    type StripeCardElement,
  } from "@stripe/stripe-js";
  import { ArrowLeft } from "lucide-svelte";

  import Header from "$components/Header.svelte";
  import HelpPanel from "$lib/components/help/HelpPanel.svelte";
  import { helpTrigger } from "$lib/stores/helpTrigger";
  import PurchaseSuccessModal from "$components/ui/PurchaseSuccessModal.svelte";
  import type { UserData } from "$types";
  import type { PageData } from "./$types";

  export let data: PageData;

  // Header userData — same shape as dashboard/+page.svelte's headerUserData.
  let headerUserData: UserData = {
    id: data.user.id,
    name: data.user.name ?? "No Name",
    email: data.user.email,
    image: data.user.image,
    avatar: data.user.avatar ?? data.user.image ?? "",
    coins: data.user.coins,
    xp: data.user.xp,
    level: data.user.level,
    ownedAvatars: data.user.ownedAvatars,
    hasCompletedTutorial: data.user.hasCompletedTutorial,
    hasSeenDashboardOnboarding: data.user.hasSeenDashboardOnboarding ?? false,
  };

  // Help panel state — wired like the dashboard.
  let helpMounted = false;
  let helpMinimized = false;
  let helpPrefillCategory = "";
  let helpPrefillDescription = "";

  function handleOpenHelp(category?: string, description?: string) {
    helpPrefillCategory = category || "";
    helpPrefillDescription = description || "";
    if (!helpMounted) {
      helpMounted = true;
    }
    helpMinimized = false;
  }

  onMount(() => {
    return helpTrigger.subscribe((payload) => {
      if (payload) {
        helpPrefillCategory = payload.category;
        helpPrefillDescription = payload.description;
        helpMinimized = false;
        helpMounted = true;
        helpTrigger.clear();
      }
    });
  });

  // Back button: real browser history when there is any, otherwise /pass.
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void goto("/pass");
    }
  }

  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let cardElement: StripeCardElement | null = null;
  let isSubmitting = false;
  let isStripeLoading = false;
  let errorMessage = "";
  let stripeInitialized = false;
  let modalTitle = "PASS ACTIVATED";
  let modalMessage = "Your Learner Pass is now active — premium rewards are unlocked!";
  // Shows the success popup; closing it heads to the pass rewards page.
  let purchaseComplete = false;

  onMount(async () => {
    isStripeLoading = true;
    if (!PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errorMessage = "Stripe publishable key is missing. Check your .env file.";
      console.error("Missing publishable key: ", PUBLIC_STRIPE_PUBLISHABLE_KEY);
      isStripeLoading = true;
      return;
    }

    try {
      const stripeInstance = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
      stripe = stripeInstance;

      if (!stripe) {
        errorMessage = "Failed to initialize Stripe";
        return;
      }

      elements = stripe.elements();

      // The card input renders inside a Stripe iframe, which the design system
      // does not style. Style values below are literal because Stripe's style
      // API cannot resolve CSS custom properties; they mirror the project
      // tokens --text-primary (#d0d7dd), --text-muted (#8892a0) and --danger
      // (#ff3860). Sanctioned one-off exception to the no-hex rule.
      cardElement = elements.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            color: "#d0d7dd",
            "::placeholder": {
              color: "#8892a0",
            },
          },
          invalid: {
            color: "#ff3860",
          },
        },
      });

      setTimeout(() => {
        const mountPoint = document.getElementById("card-element");
        if (mountPoint) {
          cardElement!.mount("#card-element");
          stripeInitialized = true;

          cardElement!.on("change", (event) => {
            if (event.error) {
              errorMessage = event.error.message;
            } else {
              errorMessage = "";
            }
          });
        } else {
          console.error("Card element mount point not found");
          errorMessage = "Payment form failed to load";
        }
      }, 100);
    } catch (err) {
      console.error("Stripe initialization error:", err);
      errorMessage = "Failed to initialize payment system";
    } finally {
      isStripeLoading = false;
    }
  });

  function handleEnhance() {
    isSubmitting = true;
    errorMessage = "";
    return async ({ result }: { result: { type: string; data?: Record<string, any> } }) => {
      if (result.type === "failure") {
        errorMessage = (result.data?.error as string) ?? "Payment failed.";
        isSubmitting = false;
        return;
      }

      const { clientSecret } = result.data as { clientSecret: string };

      try {
        const { error: confirmError, paymentIntent } =
          await stripe!.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement! },
          });

        if (confirmError) throw new Error(confirmError.message);
        cardElement!.clear();

        const fd = new FormData();
        fd.append("paymentIntentId", paymentIntent!.id);
        const res = await fetch("?/confirmPayment", {
          method: "POST",
          body: fd,
        });
        const confirmResult = await res.json();

        if (confirmResult.type === "failure") {
          errorMessage = (confirmResult.data?.error as string) ?? "Confirmation failed.";
        } else {
          if (confirmResult.data?.status === "pending_webhook") {
            modalTitle = "PAYMENT RECEIVED";
            modalMessage = "Your payment is confirmed. We are activating your Learner Pass now.";
          } else {
            modalTitle = "PASS ACTIVATED";
            modalMessage = "Your Learner Pass is now active — premium rewards are unlocked!";
          }

          purchaseComplete = true;
        }
      } catch (err: any) {
        errorMessage = err.message;
      } finally {
        isSubmitting = false;
      }
    };
  }
</script>

<svelte:head>
  <title>Pass Checkout | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <!-- Shared header navbar -->
  <Header userData={headerUserData} onOpenHelp={handleOpenHelp} />

  <!-- Back button -->
  <div class="max-w-[1200px] mx-auto px-6 pt-4">
    <button
      on:click={goBack}
      class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-obsidian-text-muted hover:text-cyber-cyan transition-colors group"
    >
      <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>
  </div>

  <!-- Focused payment card (login pattern) -->
  <main class="max-w-[1200px] mx-auto px-6 py-8">
    <div
      class="card-cyber card-cyber-body mx-auto w-[min(30rem,95vw)] p-8 sm:p-10 shadow-card-glow"
      style="border-color: rgb(var(--accent-rgb) / 0.25)"
      aria-busy={isStripeLoading || isSubmitting}
    >
      <!-- Card header -->
      <header>
        <p class="font-label text-xs uppercase tracking-[0.1em] text-cyber-cyan">
          Learner Pass Checkout
        </p>
        <h1 class="mt-2 font-heading font-bold text-3xl tracking-tight text-obsidian-text-primary">
          Unlock Premium Rewards
        </h1>
        <p class="mt-2 text-sm text-obsidian-text-muted">
          One-time payment. No auto-renew. Instant activation after successful charge.
        </p>
      </header>

      <!-- Price row -->
      <div class="mt-5 flex items-center gap-3">
        <span class="font-heading font-bold text-2xl tabular-nums text-obsidian-text-primary">₱299</span>
        <span class="tag-cyber tag-cyan">30-Day Access</span>
      </div>

      <!-- Benefits -->
      <div class="mt-5 grid gap-2" aria-label="Premium pass benefits">
        <div class="rounded-card border border-[var(--card-border)] bg-obsidian-bg/40 p-3">
          <p class="font-heading text-xs font-semibold uppercase tracking-[0.05em] text-obsidian-text-primary">
            Daily Premium Rewards
          </p>
          <p class="mt-1 text-xs leading-relaxed text-obsidian-text-muted">
            Claim boosted rewards across all 30 days of your pass.
          </p>
        </div>
        <div class="rounded-card border border-[var(--card-border)] bg-obsidian-bg/40 p-3">
          <p class="font-heading text-xs font-semibold uppercase tracking-[0.05em] text-obsidian-text-primary">
            Extra AI Help Credits
          </p>
          <p class="mt-1 text-xs leading-relaxed text-obsidian-text-muted">
            Get additional daily help usage while your pass is active.
          </p>
        </div>
        <div class="rounded-card border border-[var(--card-border)] bg-obsidian-bg/40 p-3">
          <p class="font-heading text-xs font-semibold uppercase tracking-[0.05em] text-obsidian-text-primary">
            One-Time Charge
          </p>
          <p class="mt-1 text-xs leading-relaxed text-obsidian-text-muted">
            No recurring billing, no surprise renewals.
          </p>
        </div>
      </div>

      <!-- Test cards -->
      <aside class="mt-5 border-t border-[var(--card-border)] pt-3 font-label text-xs leading-relaxed text-obsidian-text-muted">
        <p class="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-obsidian-text-primary">
          Test Card Numbers
        </p>
        <p class="mt-1"><strong>Success:</strong> 4242 4242 4242 4242</p>
        <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
        <p><strong>3D Secure:</strong> 4000 0025 0000 3155</p>
        <p class="opacity-80">Use any future expiry and any CVC for test mode.</p>
      </aside>

      <!-- Checkout header -->
      <div class="mt-6 flex items-baseline justify-between border-b border-[var(--card-border)] pb-3">
        <p class="font-heading text-xs font-bold uppercase tracking-[0.07em] text-obsidian-text-primary">
          Secure Checkout
        </p>
        <p class="font-label text-xs uppercase text-obsidian-text-muted">
          Powered by Stripe
        </p>
      </div>

      {#if errorMessage}
        <div
          class="mt-4 rounded-card border border-[rgb(var(--danger-rgb)_/_0.4)] bg-[rgb(var(--danger-rgb)_/_0.12)] p-3 text-sm text-[var(--danger)]"
          role="alert"
        >
          {errorMessage}
        </div>
      {/if}

      {#if isStripeLoading}
        <div class="mt-4 text-sm text-obsidian-text-muted">Preparing secure checkout...</div>
      {:else}
        <form method="POST" action="?/createPaymentIntent" use:enhance={handleEnhance} class="mt-4">
          <label
            class="mb-2 block font-label text-xs uppercase tracking-[0.08em] text-obsidian-text-muted"
            for="card-element"
          >
            Card Details
          </label>
          <div class="min-h-[4.5rem] rounded-card border border-[rgb(var(--accent-rgb)_/_0.25)] bg-obsidian-bg/60 p-3.5">
            <div id="card-element" class="w-full">
              {#if !stripeInitialized}
                <div class="text-sm text-obsidian-text-muted">Loading payment form...</div>
              {/if}
            </div>
          </div>

          <!-- The one solid button on this view -->
          <button
            type="submit"
            disabled={isSubmitting || !stripeInitialized}
            class="btn-cyber btn-cyber-solid mt-4 w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Processing Payment..." : "Pay ₱299"}
          </button>

          <p class="mt-3 text-center font-label text-xs text-obsidian-text-muted">
            Your card details are not stored on our servers.
          </p>
        </form>
      {/if}
    </div>
  </main>

  <!-- Help Panel — always mounted once opened, visibility via minimized prop -->
  {#if helpMounted}
    <HelpPanel
      prefillCategory={helpPrefillCategory}
      prefillDescription={helpPrefillDescription}
      minimized={helpMinimized}
      onClose={() => {
        helpMounted = false;
        helpMinimized = false;
        helpPrefillCategory = "";
        helpPrefillDescription = "";
      }}
      onMinimize={() => {
        helpMinimized = true;
      }}
    />
  {/if}
</div>

<!-- Purchase success popup — closing it heads to the pass rewards page -->
<PurchaseSuccessModal
  open={purchaseComplete}
  title={modalTitle}
  closeLabel="View Rewards"
  onClose={() => goto("/pass")}
>
  <p>{modalMessage}</p>
</PurchaseSuccessModal>
