(() => {
  const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe';
  document.querySelectorAll('.header-windows,.hero-windows,.bottom-windows').forEach((link) => link.setAttribute('href', windowsInstallerUrl));
})();
