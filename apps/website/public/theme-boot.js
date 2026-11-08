try {
  if (localStorage.getItem('eh_theme') === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
  }
  var locale = localStorage.getItem('eh_locale');
  if (locale !== 'ar' && locale !== 'en') {
    locale = (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
} catch (e) {}
