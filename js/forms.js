/* Static-site forms: send the filled form to the club's WhatsApp (no backend needed). */
function bindWhatsAppForm(formId, title) {
  const f = document.getElementById(formId);
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const lines = [...new FormData(f)].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    const text = `${title}\n\n${lines.join("\n")}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}
