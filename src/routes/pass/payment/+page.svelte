<script lang="ts">
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from "$env/static/public";
  import { onMount } from "svelte";
  import {
    loadStripe,
    type Stripe,
    type StripeElements,
    type StripeCardElement,
  } from "@stripe/stripe-js";

  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let cardElement: StripeCardElement | null = null;
  let isSubmitting = false;
  let isStripeLoading = false;
  let errorMessage = "";
  let successMessage = "";
  let stripeInitialized = false;

  onMount(async () => {
    isStripeLoading = true;
    if (!PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errorMessage = "Stripe publishable key is missing. Check your .env file.";
      console.error("Missing publishable key: ", PUBLIC_STRIPE_PUBLISHABLE_KEY);
      isStripeLoading = true;
      return;
    }

    try {
      // Load Stripe
      const stripeInstance = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
      stripe = stripeInstance;

      if (!stripe) {
        errorMessage = "Failed to initialize Stripe";
        return;
      }

      console.log("Stripe loaded successfully");

      // Create Elements
      elements = stripe.elements();

      // Create card element with proper styling
      cardElement = elements.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
          invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
          },
        },
        hidePostalCode: true, // Simplified for testing
      });

      // Wait a tick to ensure DOM is ready
      setTimeout(() => {
        const mountPoint = document.getElementById("card-element");
        if (mountPoint) {
          console.log("Mounting card element");
          cardElement!.mount("#card-element");
          stripeInitialized = true;

          // Add event listener for validation
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
    successMessage = "";

    try {
      console.log("Creating payment intent...");
      // Create payment intent on your server
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1999, currency: "USD" }),
      });

      const data = await response.json();
      console.log("Payment intent response:", data);

      if (data.error) throw new Error(data.error);

      const { clientSecret } = data;

      console.log("Confirming payment...");
      // Confirm the payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      console.log("Payment successful:", paymentIntent);
      successMessage = "✅ Payment successful! Check your Stripe dashboard.";
      cardElement.clear();
    } catch (err: any) {
      console.error("Payment error:", err);
      errorMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isStripeLoading}
  <div>Stripe is loading. Please wait...</div>
{:else}
  <main>
    <h1>💳 Test Payment</h1>
    <p class="amount">₱299</p>

    {#if successMessage}
      <div class="success">{successMessage}</div>
    {/if}

    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}
    <form on:submit={handleSubmit}>
      <div class="card-container">
        <!-- Make sure this div exists before mounting -->
        <div id="card-element">
          {#if !stripeInitialized}
            <div class="loading-placeholder">Loading payment form...</div>
          {/if}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting || !stripeInitialized}>
        {isSubmitting ? "Processing..." : "Pay ₱299"}
      </button>
    </form>

    <div class="test-cards">
      <h3>🧪 Test Cards</h3>
      <p><strong>Success:</strong> 4242 4242 4242 4242</p>
      <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
      <p><strong>3D Secure:</strong> 4000 0025 0000 3155</p>
      <p><small>Use any future expiry (12/34) and any CVC (123)</small></p>
      <p><small>Check console (F12) for debugging info</small></p>
    </div>
  </main>
{/if}

<style>
  main {
    max-width: 500px;
    margin: 50px auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }

  h1 {
    color: #635bff;
  }

  .amount {
    font-size: 32px;
    font-weight: bold;
    color: #32325d;
    margin: 20px 0;
  }

  .card-container {
    padding: 20px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin: 20px 0;
    background: white;
    min-height: 100px;
  }

  #card-element {
    width: 100%;
  }

  .loading-placeholder {
    color: #aab7c4;
    text-align: center;
    padding: 20px;
  }

  button {
    background: #635bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
  }

  button:hover:not(:disabled) {
    background: #4a42d5;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .success {
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 4px;
    margin: 10px 0;
  }

  .error {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin: 10px 0;
  }

  .test-cards {
    margin-top: 40px;
    padding: 20px;
    background: #f7f7f7;
    border-radius: 8px;
    font-size: 14px;
  }

  .test-cards p {
    margin: 8px 0;
  }
</style>
