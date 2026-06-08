/* TATCO — سلوك الموقع الموحّد
   اللغة، الثيم، الشريط العلوي، الكشف على التمرير، العدّادات،
   FAQ، تتبّع الشحنة، Magnetic buttons، Marquee، To-top */
(function(){
  'use strict';

  var STORAGE_LANG  = 'tatco-lang';
  var STORAGE_THEME = 'tatco-theme';
  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============== اللغة ============== */
  function applyLang(lang){
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
    var t = (lang === 'ar') ? html.dataset.titleAr : html.dataset.titleEn;
    if(t) document.title = t;
    try{ localStorage.setItem(STORAGE_LANG, lang); }catch(e){}
    document.dispatchEvent(new CustomEvent('langchange', { detail:{ lang:lang } }));
  }
  function initLang(){
    var saved = null;
    try{ saved = localStorage.getItem(STORAGE_LANG); }catch(e){}
    var lang = saved || html.getAttribute('lang') || 'ar';
    applyLang(lang);
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.addEventListener('click', function(){ applyLang(btn.dataset.lang); });
    });
  }

  /* ============== الثيم Dark/Light ============== */
  function applyTheme(theme){
    html.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
    try{ localStorage.setItem(STORAGE_THEME, theme); }catch(e){}
  }
  function initTheme(){
    var saved = null;
    try{ saved = localStorage.getItem(STORAGE_THEME); }catch(e){}
    var theme = saved || 'dark';
    applyTheme(theme);
    setTimeout(function(){ html.classList.add('theme-ready'); }, 60);

    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.addEventListener('click', function(){
        var current = html.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });
  }

  /* ============== الشريط العلوي + قائمة الجوال ============== */
  function initNav(){
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if(!nav) return;

    var onScroll = function(){ nav.classList.toggle('is-scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });

    if(burger && links){
      function closeNav(){
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', function(){
        var open = links.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open?'true':'false');
        document.body.style.overflow = open?'hidden':'';
      });
      links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && links.classList.contains('is-open')){ closeNav(); burger.focus(); }
      });
    }
  }

  /* ============== Reveal on scroll ============== */
  function initReveal(){
    var items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    if(!('IntersectionObserver' in window) || reduceMotion){
      items.forEach(function(el){ el.classList.add('is-visible'); }); return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold:.14, rootMargin:'0px 0px -60px 0px' });

    items.forEach(function(el, i){
      var parent = el.parentElement;
      if(parent && parent.classList.contains('reveal-stagger')){
        var siblings = Array.prototype.indexOf.call(parent.children, el);
        el.style.setProperty('--i', siblings % 10);
      }
      io.observe(el);
    });
  }

  /* ============== Counters ============== */
  function initCounters(){
    var nums = document.querySelectorAll('[data-count]');
    if(!nums.length || !('IntersectionObserver' in window)) return;
    var animate = function(el){
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var dur = 1400, start = null;
      if(reduceMotion){ el.textContent = target + suffix; return; }
      function step(ts){
        if(start===null) start = ts;
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

  /* ============== Magnetic Buttons (يستجيب لمكان الفأرة) ============== */
  function initMagnetic(){
    if(reduceMotion) return;
    var mags = document.querySelectorAll('[data-magnetic]');
    mags.forEach(function(el){
      var strength = parseFloat(el.dataset.magnetic) || 0.25;
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width/2;
        var y = e.clientY - rect.top - rect.height/2;
        el.style.transform = 'translate('+(x*strength)+'px,'+(y*strength)+'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform=''; });
    });
  }

  /* ============== To-top button ============== */
  function initToTop(){
    var btn = document.querySelector('.to-top');
    if(!btn) return;
    var onScroll = function(){ btn.classList.toggle('is-visible', window.scrollY > 600); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
    btn.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============== FAQ Accordion ============== */
  function initFAQ(){
    var items = document.querySelectorAll('[data-faq]');
    if(!items.length) return;
    items.forEach(function(item){
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if(!btn || !panel) return;
      btn.setAttribute('aria-expanded','false');
      btn.addEventListener('click', function(){
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true':'false');
        if(open){
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          panel.style.maxHeight = '0px';
        }
      });
    });

    var search = document.getElementById('faq-search');
    if(search){
      search.addEventListener('input', function(){
        var q = search.value.trim().toLowerCase();
        items.forEach(function(item){
          var text = item.textContent.toLowerCase();
          item.style.display = !q || text.indexOf(q) !== -1 ? '' : 'none';
        });
        document.querySelectorAll('.faq-group').forEach(function(group){
          var visible = group.querySelectorAll('[data-faq]:not([style*="display: none"])');
          group.style.display = visible.length === 0 ? 'none' : '';
        });
      });
    }
  }

  /* ============== Tracking Simulation ============== */
  function initTracking(){
    var form = document.getElementById('track-form');
    if(!form) return;
    var input = document.getElementById('track-input');
    var result = document.getElementById('track-result');
    var demoBtn = document.getElementById('track-demo');

    function showDemo(){
      result.classList.remove('is-error');
      result.classList.add('is-loading');
      result.innerHTML = '<div class="track-loading"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span></div>';
      setTimeout(function(){
        result.classList.remove('is-loading');
        result.classList.add('is-visible');
        result.innerHTML = renderDemoResult();
        var bars = result.querySelectorAll('.track-step');
        bars.forEach(function(b, i){
          setTimeout(function(){ b.classList.add('is-visible'); }, i * 200);
        });
      }, 900);
    }

    function renderDemoResult(){
      var lang = html.getAttribute('lang') || 'ar';
      var data = {
        ar: {
          id: 'TAT-2026-08842',
          status: 'في الطريق',
          origin: 'ميناء الدمام',
          dest: 'الرياض، حي الورود',
          eta: 'الوصول المتوقع: غدًا 14:00',
          truck: 'الشاحنة #FL-217 · السائق محمد',
          steps: [
            ['تم الاستلام من العميل', 'الدمام · 06:12', true],
            ['تجاوزت إجراءات الجمارك', 'ميناء الدمام · 08:45', true],
            ['غادرت ساحة العمليات', 'الدمام · 10:30', true],
            ['نقطة المرور — الخرج', 'الخرج · 12:18', true],
            ['في الطريق إلى الوجهة', 'الرياض · جاري', 'active'],
            ['التسليم النهائي', 'الرياض · غدًا', false]
          ]
        },
        en: {
          id: 'TAT-2026-08842',
          status: 'In Transit',
          origin: 'Dammam Port',
          dest: 'Riyadh, Al Wurud',
          eta: 'ETA: Tomorrow 14:00',
          truck: 'Truck #FL-217 · Driver Mohammed',
          steps: [
            ['Picked up from customer', 'Dammam · 06:12', true],
            ['Cleared customs', 'Dammam Port · 08:45', true],
            ['Left operations yard', 'Dammam · 10:30', true],
            ['Checkpoint — Al Kharj', 'Al Kharj · 12:18', true],
            ['On route to destination', 'Riyadh · ongoing', 'active'],
            ['Final delivery', 'Riyadh · tomorrow', false]
          ]
        }
      };
      var d = data[lang] || data.ar;
      var stepHtml = d.steps.map(function(s){
        var cls = s[2] === true ? 'is-done' : (s[2] === 'active' ? 'is-active' : '');
        return '<div class="track-step '+cls+'">' +
          '<span class="track-dot"></span>' +
          '<div class="track-text"><strong>'+s[0]+'</strong><span>'+s[1]+'</span></div>' +
        '</div>';
      }).join('');

      return '<div class="track-card">' +
        '<header class="track-head">' +
          '<div>' +
            '<span class="badge badge--success badge--dot">'+d.status+'</span>' +
            '<h3 class="mono">'+d.id+'</h3>' +
            '<p>'+d.origin+' → '+d.dest+'</p>' +
          '</div>' +
          '<div class="track-eta">' +
            '<span class="muted">ETA</span>' +
            '<strong>'+d.eta+'</strong>' +
            '<span class="muted">'+d.truck+'</span>' +
          '</div>' +
        '</header>' +
        '<div class="track-timeline">'+stepHtml+'</div>' +
      '</div>';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var val = (input.value || '').trim().toUpperCase();
      if(!val){
        input.focus();
        result.classList.add('is-error');
        result.innerHTML = '<p class="muted"><span class="lang-ar">يرجى إدخال رقم الشحنة (مثال: TAT-2026-08842)</span><span class="lang-en">Please enter a tracking number (e.g., TAT-2026-08842)</span></p>';
        return;
      }
      showDemo();
    });

    if(demoBtn){
      demoBtn.addEventListener('click', function(){
        input.value = 'TAT-2026-08842';
        showDemo();
      });
    }
  }

  /* ============== Smooth scroll for anchors ============== */
  function initAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      var href = a.getAttribute('href');
      if(href === '#' || href.length < 2) return;
      a.addEventListener('click', function(e){
        var target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'start' });
          history.pushState(null, '', href);
        }
      });
    });
  }

  /* ============== Tilt subtle on cards ============== */
  function initTilt(){
    if(reduceMotion || window.matchMedia('(hover: none)').matches) return;
    var els = document.querySelectorAll('[data-tilt]');
    els.forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - .5;
        var y = (e.clientY - rect.top) / rect.height - .5;
        el.style.transform = 'perspective(900px) rotateX('+(-y*6)+'deg) rotateY('+(x*6)+'deg)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform=''; });
    });
  }

  /* ============== Form validation light ============== */
  function initForms(){
    document.querySelectorAll('form[data-validate]').forEach(function(form){
      form.addEventListener('submit', function(e){
        var fields = form.querySelectorAll('[required]');
        var ok = true;
        fields.forEach(function(f){
          if(!f.value || (f.type==='email' && !/\S+@\S+\.\S+/.test(f.value))){
            f.setAttribute('aria-invalid','true');
            f.classList.add('is-invalid');
            ok = false;
          } else {
            f.removeAttribute('aria-invalid');
            f.classList.remove('is-invalid');
          }
        });
        if(!ok){
          e.preventDefault();
          var firstInvalid = form.querySelector('.is-invalid');
          if(firstInvalid) firstInvalid.focus();
          return;
        }
        var success = form.querySelector('[data-success]');
        if(success){
          e.preventDefault();
          form.classList.add('is-submitted');
          setTimeout(function(){ form.reset(); form.classList.remove('is-submitted'); }, 5000);
        }
      });
      form.querySelectorAll('input, textarea').forEach(function(f){
        f.addEventListener('blur', function(){
          if(f.hasAttribute('required') && f.value){
            f.removeAttribute('aria-invalid');
            f.classList.remove('is-invalid');
          }
        });
      });
    });
  }

  /* ============== Init ============== */
  document.addEventListener('DOMContentLoaded', function(){
    initTheme();
    initLang();
    initNav();
    initReveal();
    initCounters();
    initMagnetic();
    initToTop();
    initFAQ();
    initTracking();
    initAnchors();
    initTilt();
    initForms();

    var yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
