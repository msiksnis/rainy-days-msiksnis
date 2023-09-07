function errorMessage(type = "error", message) {
  return `<div class="${type}">${message}</div>`;
}

export function showWarningMessage(message) {
  const container = document.querySelector("#warning-message-container");
  container.innerHTML = errorMessage("error", message);
  container.classList.remove("hidden");
}

export function hideWarningMessage() {
  const container = document.querySelector("#warning-message-container");
  container.innerHTML = "";
  container.classList.add("hidden");
}

export function showTemporaryWarningMessage(message, duration = 5000) {
  const container = document.querySelector("#warning-message-container");
  container.innerHTML = errorMessage("warning", message);
  container.classList.remove("hidden");

  setTimeout(() => {
    hideWarningMessage();
  }, duration);
}

export function fetchError(message) {
  const container = document.querySelector("#errorContainer");
  container.innerHTML = errorMessage("error-message", message);
  container.classList.remove("hidden");
}
