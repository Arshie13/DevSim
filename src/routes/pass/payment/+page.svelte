<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from "$env/static/public";
  import {
    loadStripe,
    type Stripe,
    type StripeElements,
    type StripeCardElement,
  } from "@stripe/stripe-js";

  import PurchaseSuccessModal from "$components/ui/PurchaseSuccessModal.svelte";

  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let cardElement: StripeCardElement | null = null;
  let isSubmitting = false;
  let isStripeLoading = false;
  let errorMessage = "";
  let stripeInitialized = false;
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

      cardElement = elements.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#e2e8f0",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSmoothing: "antialiased",
            "::placeholder": {
              color: "#94a3b8",
            },
          },
          invalid: {
            color: "#fb7185",
            iconColor: "#fb7185",
          },
        },
        hidePostalCode: true,
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

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!stripe || !cardElement) {
      errorMessage = "Payment system not ready. Please wait.";
      return;
    }

    isSubmitting = true;
    errorMessage = "";

    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "learner_pass_30d" }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const { clientSecret } = data;

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      cardElement.clear();

      await fetch("/api/stripe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });

      purchaseComplete = true;
    } catch (err: any) {
      console.error("Payment error:", err);
      errorMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<main class="payment-shell">
  <section class="payment-card" aria-busy={isStripeLoading || isSubmitting}>
    <div class="top-accent"></div>

    <div class="layout-grid">
      <aside class="summary-panel">
        <header class="header">
          <p class="eyebrow">Learner Pass Checkout</p>
          <h1>Unlock Premium Rewards</h1>
          <p class="subcopy">One-time payment. No auto-renew. Instant activation after successful charge.</p>
        </header>

        <div class="price-row">
          <span class="price">₱299</span>
          <span class="pill">30-Day Access</span>
        </div>

        <div class="benefits-grid" aria-label="Premium pass benefits">
          <div class="benefit-item">
            <p class="benefit-title">Daily Premium Rewards</p>
            <p class="benefit-copy">Claim boosted rewards across all 30 days of your pass.</p>
          </div>
          <div class="benefit-item">
            <p class="benefit-title">Extra AI Help Credits</p>
            <p class="benefit-copy">Get additional daily help usage while your pass is active.</p>
          </div>
          <div class="benefit-item">
            <p class="benefit-title">One-Time Charge</p>
            <p class="benefit-copy">No recurring billing, no surprise renewals.</p>
          </div>
        </div>

        <aside class="test-cards">
          <p class="test-title">Test Card Numbers</p>
          <p><strong>Success:</strong> 4242 4242 4242 4242</p>
          <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
          <p><strong>3D Secure:</strong> 4000 0025 0000 3155</p>
          <p class="hint">Use any future expiry and any CVC for test mode.</p>
        </aside>
      </aside>

      <div class="checkout-panel">
        <div class="checkout-header">
          <p class="checkout-kicker">Secure Checkout</p>
          <p class="checkout-sub">Powered by Stripe</p>
        </div>

        {#if errorMessage}
          <div class="error" role="alert">{errorMessage}</div>
        {/if}

        {#if isStripeLoading}
          <div class="loading-state">Preparing secure checkout...</div>
        {:else}
          <form on:submit={handleSubmit} class="form">
            <label class="label" for="card-element">Card Details</label>
            <div class="card-container">
              <div id="card-element">
                {#if !stripeInitialized}
                  <div class="loading-placeholder">Loading payment form...</div>
                {/if}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || !stripeInitialized}>
              {isSubmitting ? "Processing Payment..." : "Pay ₱299"}
            </button>

            <p class="checkout-note">Your card details are not stored on our servers.</p>
          </form>
        {/if}
      </div>
    </div>
  </section>
</main>

<!-- Purchase success popup — closing it heads to the pass rewards page -->
<PurchaseSuccessModal
  open={purchaseComplete}
  title="PASS ACTIVATED"
  closeLabel="View Rewards"
  onClose={() => goto("/pass")}
>
  <p>
    Your <span class="font-orbitron font-bold text-cyber-cyan">Learner Pass</span> is now active —
    premium rewards are unlocked!
  </p>
</PurchaseSuccessModal>

<style>
  .payment-shell {
    max-width: 920px;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 2.5rem);
  }

  .payment-card {
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.25));
    background: linear-gradient(180deg, rgba(18, 25, 42, 0.97), rgba(10, 15, 28, 0.97));
    box-shadow: 0 0 0 1px rgba(7, 165, 201, 0.07), 0 0 40px rgba(7, 165, 201, 0.12);
    padding: clamp(1rem, 4vw, 2rem);
  }

  .layout-grid {
    display: grid;
    gap: 1rem;
  }

  .summary-panel,
  .checkout-panel {
    border: 1px solid rgba(7, 165, 201, 0.15);
    border-radius: 6px;
    background: rgba(2, 6, 23, 0.45);
    padding: 1rem;
  }

  .checkout-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    padding-bottom: 0.7rem;
  }

  .checkout-kicker {
    margin: 0;
    font: 700 0.75rem/1.2 var(--font-heading, "Orbitron", sans-serif);
    text-transform: uppercase;
    color: var(--text-primary, #e2e8f0);
    letter-spacing: 0.07em;
  }

  .checkout-sub {
    margin: 0;
    color: var(--text-muted, #94a3b8);
    font: 500 0.66rem/1.2 var(--font-mono, "JetBrains Mono", monospace);
    text-transform: uppercase;
  }

  .top-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent, #07a5c9), transparent);
  }

  .header h1 {
    margin: 0.35rem 0 0;
    font: 700 clamp(1.4rem, 3vw, 2rem) / 1.2 var(--font-heading, "Orbitron", sans-serif);
    letter-spacing: 0.02em;
    color: var(--text-primary, #e2e8f0);
  }

  .eyebrow {
    margin: 0;
    font: 600 0.72rem/1.3 var(--font-mono, "JetBrains Mono", monospace);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent, #07a5c9);
  }

  .subcopy {
    margin: 0.65rem 0 0;
    color: var(--text-muted, #94a3b8);
    font-size: 0.9rem;
  }

  .price-row {
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .price {
    font: 800 2rem/1 var(--font-heading, "Orbitron", sans-serif);
    color: #f8fafc;
  }

  .pill {
    border-radius: 999px;
    border: 1px solid rgba(7, 165, 201, 0.35);
    padding: 0.35rem 0.65rem;
    font: 600 0.68rem/1 var(--font-mono, "JetBrains Mono", monospace);
    color: var(--accent, #07a5c9);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(7, 165, 201, 0.1);
  }

  .form {
    margin-top: 0.9rem;
  }

  .benefits-grid {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .benefit-item {
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.45);
    border-radius: 4px;
    padding: 0.7rem;
  }

  .benefit-title {
    margin: 0;
    color: var(--text-primary, #e2e8f0);
    font: 700 0.75rem/1.2 var(--font-heading, "Orbitron", sans-serif);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .benefit-copy {
    margin: 0.35rem 0 0;
    color: var(--text-muted, #94a3b8);
    font-size: 0.78rem;
    line-height: 1.35;
  }

  .label {
    display: block;
    margin-bottom: 0.5rem;
    font: 600 0.72rem/1.3 var(--font-mono, "JetBrains Mono", monospace);
    color: var(--text-muted, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .card-container {
    border: 1px solid rgba(7, 165, 201, 0.24);
    border-radius: 4px;
    padding: 0.9rem;
    min-height: 72px;
    background: rgba(2, 6, 23, 0.65);
  }

  #card-element {
    width: 100%;
  }

  .loading-placeholder,
  .loading-state {
    color: var(--text-muted, #94a3b8);
    font-size: 0.88rem;
  }

  button {
    margin-top: 1rem;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.78rem 1rem;
    font: 700 0.82rem/1.1 var(--font-heading, "Orbitron", sans-serif);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #071018;
    background: linear-gradient(90deg, #facc15, #22d3ee 65%, #38bdf8);
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .checkout-note {
    margin: 0.6rem 0 0;
    font: 500 0.68rem/1.4 var(--font-mono, "JetBrains Mono", monospace);
    color: var(--text-muted, #94a3b8);
    text-align: center;
  }

  .error {
    margin-top: 1rem;
    border: 1px solid rgba(251, 113, 133, 0.4);
    border-radius: 4px;
    padding: 0.75rem;
    background: rgba(251, 113, 133, 0.12);
    color: #fecdd3;
    font-size: 0.88rem;
  }

  .test-cards {
    margin-top: 1.2rem;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 0.9rem;
    color: var(--text-muted, #94a3b8);
    font: 500 0.78rem/1.5 var(--font-mono, "JetBrains Mono", monospace);
  }

  .test-title {
    margin: 0 0 0.45rem;
    color: var(--text-primary, #e2e8f0);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.7rem;
  }

  .test-cards p {
    margin: 0.2rem 0;
  }

  .hint {
    opacity: 0.85;
  }

  @media (min-width: 720px) {
    .layout-grid {
      grid-template-columns: 1.1fr 0.9fr;
      align-items: start;
    }

    .benefits-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
