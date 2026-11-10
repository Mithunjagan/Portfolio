const $ = (s) => document.querySelector(s);
$("#year").textContent = new Date().getFullYear();
for (const filter of document.querySelectorAll(".filter")) {
  filter.addEventListener("click", () => {
    for (const button of document.querySelectorAll(".filter")) {
      const selected = button === filter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    for (const project of document.querySelectorAll(".project")) {
      project.hidden =
        filter.dataset.filter !== "all" &&
        project.dataset.category !== filter.dataset.filter;
    }
  });
}
const panel = $("#chat-panel");
const toggle = $("#chat-toggle");
function setChat(open) {
  panel.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  if (open) $("#chat-input").focus();
  else toggle.focus();
}
toggle.addEventListener("click", () => setChat(panel.hidden));
$("#chat-close").addEventListener("click", () => setChat(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) setChat(false);
});
const history = [];
let busy = false;
function chatMessage(text, role) {
  const p = document.createElement("p");
  p.className = `${role}-message`;
  p.textContent = text;
  $("#chat-log").append(p);
  $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  return p;
}
async function ask(message) {
  if (busy || !message.trim()) return;
  busy = true;
  $("#chat-form button").disabled = true;
  chatMessage(message, "user");
  $("#chat-input").value = "";
  const pending = chatMessage("Thinking…", "assistant");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-8) }),
      signal: AbortSignal.timeout(25000),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error || "The assistant is unavailable. Please try again.",
      );
    pending.textContent = data.response;
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: data.response },
    );
  } catch (error) {
    pending.textContent =
      error.name === "TimeoutError"
        ? "That took too long. Please try again or contact Mithun directly."
        : error.message;
  } finally {
    busy = false;
    $("#chat-form button").disabled = false;
    $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  }
}
$("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  ask($("#chat-input").value.trim());
});
for (const button of document.querySelectorAll(".chat-suggestions button"))
  button.addEventListener("click", () => ask(button.textContent));
let reviewsLoaded = false;
async function loadReviews() {
  try {
    const response = await fetch("/api/reviews");
    if (!response.ok) return;
    const reviews = await response.json();
    if (!Array.isArray(reviews)) return;
    $("#reviews").replaceChildren();
    for (const review of reviews.slice(-5).reverse()) {
      const article = document.createElement("article");
      article.className = "review";
      const name = document.createElement("strong");
      name.textContent = `${review.name} · ${review.rating}/5`;
      const comment = document.createElement("p");
      comment.textContent = review.comment;
      article.append(name, comment);
      $("#reviews").append(article);
    }
    reviewsLoaded = true;
  } catch {
    /* Feedback remains usable if review listing is unavailable. */
  }
}
$("#feedback-details").addEventListener("toggle", () => {
  if ($("#feedback-details").open && !reviewsLoaded) loadReviews();
});
$("#feedback-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector("button");
  if (button.disabled) return;
  const data = Object.fromEntries(new FormData(form));
  data.rating = Number(data.rating);
  button.disabled = true;
  $("#feedback-status").textContent = "Sending…";
  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new Error("Could not save feedback. Please try again.");
    $("#feedback-status").textContent = "Thank you — feedback received.";
    form.reset();
    await loadReviews();
  } catch (error) {
    $("#feedback-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
