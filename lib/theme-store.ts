type Listener = () => void;

const listeners = new Set<Listener>();

export function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function getServerSnapshot() {
  return false;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
  listeners.forEach((listener) => listener());
}
