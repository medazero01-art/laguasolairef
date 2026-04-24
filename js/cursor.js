/* ============================================================
   cursor.js — Custom cursor for 3D model canvas ONLY
   Small gold dot on the 3D canvas, expands to ring on hover.
   ============================================================ */

(function () {
  'use strict';

  var isTouch = window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  var cursor = document.getElementById('customCursor');
  if (!cursor) return;

  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var mouseX = -100, mouseY = -100;
  var curX = -100, curY = -100;
  var visible = false;
  var LERP = 0.15;

  cursor.style.opacity = '0';

  /** Show cursor only when over 3D canvas */
  canvas.addEventListener('mouseenter', function () {
    visible = true;
    cursor.style.opacity = '1';
  });

  canvas.addEventListener('mouseleave', function () {
    visible = false;
    cursor.style.opacity = '0';
  });

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    curX += (mouseX - curX) * LERP;
    curY += (mouseY - curY) * LERP;
    cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
    requestAnimationFrame(tick);
  }

  tick();
})();
