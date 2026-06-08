/* TATCO — سلوك الموقع: تبديل اللغة، الشريط العلوي، ظهور العناصر عند التمرير */
(function(){
  'use strict';

  var STORAGE_KEY = 'tatco-lang';
  var html = document.documentElement;

  /* ---------- اللغة ---------- */
  function applyLang(lang){
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
    document.title = (lang === 'ar')
      ? (html.dataset.titleAr || document.title)
      : (html.dataset.titleEn || document.title);
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  }

  function initLang(){
    var saved = null;
    try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}
    var lang = saved || html.getAttribute('lang') || 'ar';
    applyLang(lang);

    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.addEventListener('click', function(){ applyLang(btn.dataset.lang); });
    });
  }

  /* ---------- الشريط العلوي عند التمرير + قائمة الجوال ---------- */
  function initNav(){
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if(!nav) return;

    var onScroll = function(){
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });

    if(burger && links){
      function closeNav(){
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', function(){
        var open = links.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', closeNav);
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && links.classList.contains('is-open')){
          closeNav();
          burger.focus();
        }
      });
    }
  }

  /* ---------- ظهور العناصر تدريجياً عند التمرير ---------- */
  function initReveal(){
    var items = document.querySelectorAll('.reveal');
    if(!items.length) return;

    if(!('IntersectionObserver' in window)){
      items.forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.16, rootMargin:'0px 0px -40px 0px' });

    items.forEach(function(el, i){
      el.style.setProperty('--i', el.parentElement && el.parentElement.classList.contains('reveal-stagger') ? i % 8 : 0);
      io.observe(el);
    });
  }

  /* ---------- عداد الأرقام (الإحصائيات) ---------- */
  function initCounters(){
    var nums = document.querySelectorAll('[data-count]');
    if(!nums.length || !('IntersectionObserver' in window)) return;

    var animate = function(el){
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var dur = 1400, start = null;
      function step(ts){
        if(start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold:.5 });
    nums.forEach(function(el){ io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initLang();
    initNav();
    initReveal();
    initCounters();
  });
})();
