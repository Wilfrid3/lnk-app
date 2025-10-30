// Clear all service workers script - run this in browser console to debug
(async () => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('Found registrations:', registrations.length);
  
  for (const registration of registrations) {
    console.log('Unregistering:', registration.scope);
    await registration.unregister();
  }
  
  console.log('All service workers unregistered');
  location.reload();
})();
