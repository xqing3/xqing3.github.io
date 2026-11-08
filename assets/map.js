// Dot map interactivity: hover/focus previews in the side panel; touch = tap once to preview, twice to open.
(function () {
  var map = document.getElementById('map');
  var panel = document.getElementById('map-panel');
  if (!map || !panel) return;
  var dots = Array.prototype.slice.call(map.querySelectorAll('a.dot'));
  if (!dots.length) return;
  var areas = {};
  try {
    var raw = document.getElementById('map-data');
    ((raw && JSON.parse(raw.textContent)).areas || []).forEach(function (a) { areas[a.id] = a; });
  } catch (e) {}
  var initialHtml = panel.innerHTML;
  var active = null;
  var armed = null; // dot previewed by a first touch tap

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function ids(dot) { return (dot.getAttribute('data-areas') || '').split(' ').filter(Boolean); }
  function lit(on, dot) {
    ids(dot).forEach(function (id) {
      var c = map.querySelector('circle.area-' + id);
      if (c) c.classList.toggle('is-lit', on);
    });
  }
  function clear() {
    if (active) { active.classList.remove('is-active'); lit(false, active); }
    active = null;
    armed = null;
    panel.innerHTML = initialHtml;
  }
  function preview(dot) {
    if (active === dot) return;
    if (active) { active.classList.remove('is-active'); lit(false, active); }
    active = dot;
    dot.classList.add('is-active');
    lit(true, dot);
    panel.textContent = '';
    panel.appendChild(el('h3', '', dot.getAttribute('data-name')));
    panel.appendChild(el('p', 'summary', dot.getAttribute('data-summary')));
    ids(dot).forEach(function (id) {
      var a = areas[id];
      if (!a) return;
      var p = el('p', 'thesis area-' + id);
      p.appendChild(el('strong', '', a.name + '. '));
      p.appendChild(document.createTextNode(a.thesis));
      panel.appendChild(p);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') preview(dot); });
    dot.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && document.activeElement !== dot) clear(); });
    dot.addEventListener('focus', function () { preview(dot); });
    dot.addEventListener('blur', function () { clear(); });
    dot.addEventListener('click', function (e) {
      var touch = dot._lastPointer === 'touch';
      dot._lastPointer = null;
      if (!touch) return;
      if (armed === dot) return; // second tap: follow link
      e.preventDefault();
      preview(dot);
      armed = dot;
    });
    dot.addEventListener('pointerdown', function (e) { dot._lastPointer = e.pointerType; });
    // A touch that never becomes a click (scroll, cancel) must not leave a stale flag for keyboard Enter.
    dot.addEventListener('pointercancel', function () { dot._lastPointer = null; });
    dot.addEventListener('pointerup', function 