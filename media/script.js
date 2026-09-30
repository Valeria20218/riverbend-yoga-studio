"use strict";

const CLASSES = [
  { id: "gentle", name: "Gentle Yoga", pace: "Slow and supportive", detail: "Simple movements with optional chair support. A comfortable first class for beginners.", interest: "Gentle Yoga" },
  { id: "vinyasa", name: "Vinyasa Flow", pace: "Flowing and adaptable", detail: "Connect breath and movement while choosing variations and taking breaks as needed.", interest: "Vinyasa Flow" },
  { id: "restorative", name: "Restorative Yoga", pace: "Quiet and restful", detail: "Use props and supported positions to make space for rest.", interest: "Restorative Yoga" }
];

const STORAGE_KEYS = {
  classChoice: "riverbend.classChoice",
  experience: "riverbend.experience"
};

function readPreference(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function savePreference(key, value) {
  try { localStorage.setItem(key, value); }
  catch { /* The page still works when browser storage is blocked. */ }
}

function renderClassChoice(selectedId) {
  const chosen = CLASSES.find(item => item.id === selectedId);
  const result = document.getElementById("class-result");
  if (!chosen || !result) return;

  document.querySelectorAll("#class-options button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.classId === chosen.id));
  });
  result.replaceChildren();
  const title = document.createElement("h4");
  title.textContent = chosen.name;
  const pace = document.createElement("p");
  pace.textContent = `Pace: ${chosen.pace}`;
  const detail = document.createElement("p");
  detail.textContent = chosen.detail;
  const link = document.createElement("a");
  link.href = "events.html#inquiry-form";
  link.textContent = `Ask about ${chosen.name}`;
  result.append(title, pace, detail, link);
}

function initClassPicker() {
  const container = document.getElementById("class-options");
  if (!container) return;

  CLASSES.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.name;
    button.dataset.classId = item.id;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      savePreference(STORAGE_KEYS.classChoice, item.id);
      renderClassChoice(item.id);
    });
    container.append(button);
  });

  const savedId = readPreference(STORAGE_KEYS.classChoice);
  if (CLASSES.some(item => item.id === savedId)) renderClassChoice(savedId);
}

function showFieldError(id, message) {
  const field = document.getElementById(id);
  const target = document.getElementById(`${id}-error`);
  if (target) target.textContent = message;
  if (field) {
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }
}

function validateField(id) {
  const field = document.getElementById(id);
  if (!field) return true;
  const value = field.value.trim();
  let message = "";

  if (id === "name") {
    if (!value) message = "Enter your name.";
    else if (value.length < 2) message = "Use at least 2 characters for your name.";
  } else if (id === "email") {
    if (!value) message = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address, such as name@example.com.";
  } else if (id === "phone") {
    const phoneSelected = document.getElementById("by-phone").checked;
    if (phoneSelected && !value) message = "Add a phone number for phone contact.";
    else if (value && !/^\+?[0-9 ]{7,25}$/.test(value)) message = "Use 7 to 25 digits and spaces, with an optional plus sign at the start.";
  } else if (id === "interest") {
    if (!value) message = "Choose a class or event.";
  } else if (id === "experience") {
    if (!value) message = "Choose your experience level.";
  } else if (id === "message") {
    if (!value) message = "Enter a message.";
    else if (value.length < 10) message = "Write at least 10 characters so we understand your question.";
  }

  showFieldError(id, message);
  return !message;
}

function validateContact() {
  const chosen = document.querySelector('input[name="contact"]:checked');
  const error = document.getElementById("contact-error");
  error.textContent = chosen ? "" : "Choose email or phone contact.";
  return Boolean(chosen);
}

function initInquiryForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const savedClass = CLASSES.find(item => item.id === readPreference(STORAGE_KEYS.classChoice));
  const interest = document.getElementById("interest");
  if (savedClass) interest.value = savedClass.interest;
  const experience = document.getElementById("experience");
  const savedExperience = readPreference(STORAGE_KEYS.experience);
  if (Array.from(experience.options).some(option => option.value && option.value === savedExperience)) {
    experience.value = savedExperience;
  }
  experience.addEventListener("change", () => {
    savePreference(STORAGE_KEYS.experience, experience.value);
    validateField("experience");
  });

  const fields = ["name", "email", "phone", "interest", "message"];
  fields.forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener(id === "interest" ? "change" : "input", () => validateField(id));
  });
  document.querySelectorAll('input[name="contact"]').forEach(radio => {
    radio.addEventListener("change", () => {
      validateContact();
      validateField("phone");
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const results = fields.concat("experience").map(validateField);
    results.push(validateContact());
    const status = document.getElementById("form-status");
    if (results.every(Boolean)) {
      status.textContent = "Your sample request looks complete. This demonstration did not send a message or reserve a place.";
    } else {
      status.textContent = "Please correct the highlighted fields above. Your entries have been kept.";
      form.querySelector('[aria-invalid="true"]')?.focus();
    }
  });
}

initClassPicker();
initInquiryForm();
