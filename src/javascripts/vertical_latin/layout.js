window.addEventListener('DOMContentLoaded', () => {
  if (!window.PREVENT_TAKETORI) {
    new Taketori().set({multiColumnEnabled: true}).element('body.page').toVertical();
  }
});
