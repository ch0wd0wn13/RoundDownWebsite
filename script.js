"use strict";
function calculateTransfer(balance, level, floor, maximum) {
  const cents = value => Math.round(value * 100);
  const b = cents(balance), l = cents(level), f = cents(floor), m = cents(maximum);
  if (![b,l,f,m].every(Number.isSafeInteger) || b < 0 || f < 0 || m < 0 || ![1000,10000,100000,1000000].includes(l)) {
    throw new Error("Please enter valid nonnegative amounts and a supported Round Down level.");
  }
  const remainder = b % l;
  const available = Math.max(0, b - f);
  const transfer = Math.min(remainder, available, m);
  return { transfer: transfer / 100, remaining: (b - transfer) / 100, remainder: remainder / 100, available: available / 100 };
}
if (typeof module !== "undefined") module.exports = { calculateTransfer };
if (typeof document !== "undefined") {
  const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const form = document.getElementById("demo-form");
  function runDemo(event) {
    if (event) event.preventDefault();
    if (!form.reportValidity()) return;
    const values = ["balance", "level", "floor", "maximum"].map(id => Number(document.getElementById(id).value));
    const result = document.getElementById("result");
    try {
      const outcome = calculateTransfer(...values);
      const heading = document.createElement("span");
      heading.textContent = outcome.transfer > 0 ? "Would move to your brokerage" : "No transfer this time";
      const amount = document.createElement("strong"); amount.textContent = money(outcome.transfer);
      const remaining = document.createElement("p"); remaining.textContent = money(outcome.remaining) + " would remain in checking.";
      const explanation = document.createElement("p");
      explanation.textContent = outcome.transfer === 0
        ? (outcome.available === 0 ? "Your balance is at or below your safety floor." : values[3] === 0 ? "Your maximum transfer is set to zero." : "Your balance already lands on the selected Round Down level.")
        : "Balance remainder: " + money(outcome.remainder) + ". Your balance floor and transfer cap are applied.";
      const schedule = document.createElement("p"); schedule.textContent = "Selected schedule: " + document.getElementById("schedule").value + ". This example shows one balance check.";
      result.replaceChildren(heading, amount, remaining, explanation);

    } catch (error) { result.textContent = error.message; }
  }
  form.addEventListener("submit", runDemo); runDemo();
  const betaForm = document.getElementById("beta-form");
  betaForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!betaForm.reportValidity()) return;
    const button = betaForm.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const status = document.getElementById("beta-status");
    button.disabled = true;
    button.textContent = "Joining…";
    betaForm.setAttribute("aria-busy", "true");
    status.textContent = "Sending your signup…";
    try {
      const response = await fetch(betaForm.action, {
        method: "POST",
        body: new FormData(betaForm),
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        status.textContent = "You’re on the list! We’ll email you when RoundDown beta is ready.";
        betaForm.reset();
      } else if (response.status === 429) {
        status.textContent = "Signup is temporarily unavailable. Please try again later. Your signup hasn’t been confirmed.";
      } else {
        status.textContent = "We couldn’t save your signup. Please check your email address and try again.";
      }
    } catch (error) {
      status.textContent = "We couldn’t confirm your signup. Check your connection and try again.";
    } finally {
      button.disabled = false;
      button.textContent = "Join Beta";
      betaForm.removeAttribute("aria-busy");
    }
  });
}
