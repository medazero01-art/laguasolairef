/* ============================================================
   solar-panel-3d.js — Three.js bifacial solar panel scene
   Camera dolly-in on load, mouse tracking, auto-rotate.
   ============================================================ */

(function () {
  'use strict';

  const container = document.getElementById('heroCanvas');
  if (!container || typeof THREE === 'undefined') return;

  const isMobile = window.matchMedia('(hover: none)').matches;

  // --- Scene setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);
  camera.lookAt(0, 0, 0);
  const clock = new THREE.Clock();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  function resize() {
    var w = container.offsetWidth, h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    if (typeof panelGroup !== 'undefined') {
      var screenW = window.innerWidth;
      var scale = 1.0;
      if (screenW < 768) {
        scale = 0.7; // Mobile: Reduce size significantly
      } else if (screenW < 1200) {
        scale = 0.85; // Tablet: Reduce model scale factor
      }
      panelGroup.scale.set(scale, scale, scale);
    }

    if (typeof wakeUpAnimation === 'function') {
      wakeUpAnimation();
    } else {
      renderer.render(scene, camera);
    }
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // --- Cinematic Lighting ---
  scene.add(new THREE.AmbientLight(0x0f1d2b, 1.5));

  var sunLight = new THREE.DirectionalLight(0xfff5e6, 6.0);
  sunLight.position.set(-8, 10, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  var rimLight = new THREE.DirectionalLight(0x00e5ff, 4.0);
  rimLight.position.set(10, 5, -10);
  scene.add(rimLight);

  var sweepLight = new THREE.PointLight(0x88ccff, 5.0, 15);
  sweepLight.position.set(-5, 0, 3);
  scene.add(sweepLight);



  // --- Panel group ---
  var panelGroup = new THREE.Group();
  scene.add(panelGroup);
  resize(); // On appelle resize() pour appliquer l'échelle initiale

  // --- GLB Loading Logic ---
  // If the user places "model.glb" in the "assets/" folder, it will load.
  // Otherwise, we build the procedural model as fallback.
  var loader = new THREE.GLTFLoader();
  loader.load(
    'assets/model.glb',
    function (gltf) {
      var model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fitScale = 3.5 / maxDim; // Adjusted to fit perfectly without cropping
      model.scale.setScalar(fitScale);
      
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(fitScale));
      
      model.traverse(function (node) {
        if (node.isMesh && node.material) {
          node.material.envMapIntensity = 3.0;
          if (node.material.metalness !== undefined) node.material.metalness = Math.max(0.6, node.material.metalness);
          if (node.material.roughness !== undefined) node.material.roughness = Math.min(0.2, node.material.roughness);
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      panelGroup.add(model);
      
      if (typeof wakeUpAnimation === 'function') wakeUpAnimation();
    },
    undefined,
    function (error) {
      console.error("Erreur de chargement du modèle GLB :", error);
    }
  );



  // --- Mouse tracking ---
  var baseRotX = Math.PI / 10; // ~18 degrees tilted back
  var baseRotY = -Math.PI / 12; // ~-15 degrees tilted left
  var targetRotX = baseRotX, targetRotY = baseRotY;
  
  // Set initial orientation
  panelGroup.rotation.set(baseRotX, baseRotY, 0);

  var isHovering = false;
  var maxRotH = Math.PI / 36; // ±5°
  var maxRotV = Math.PI / 36; // ±5°

  var isVisible = true;
  var isAnimating = false;

  function wakeUpAnimation() {
    if (isVisible && !isAnimating) {
      animate();
    }
  }

  if (!isMobile) {
    // We bind to document so mouse tracking works across the hero without being cut off
    document.addEventListener('mousemove', function (e) {
      // Only track if mouse is somewhat in the top half of the screen where hero is
      if (e.clientY > window.innerHeight) {
        targetRotX = baseRotX;
        targetRotY = baseRotY;
        isHovering = false;
        wakeUpAnimation();
        return;
      }
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = baseRotY + nx * maxRotH;
      targetRotX = baseRotX + ny * maxRotV;
      isHovering = true;
      wakeUpAnimation();
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      targetRotX = baseRotX;
      targetRotY = baseRotY;
      isHovering = false;
      wakeUpAnimation();
    }, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          wakeUpAnimation();
        }
      });
    }, { threshold: 0 });
    observer.observe(container);
  }

  // --- Initialize Text Animations ---
  function startDolly() {
    // No dolly animation, just trigger the texts
    triggerHeroText();
  }

  /** Trigger hero text stagger after dolly completes */
  function triggerHeroText() {
    var ids = ['heroH1', 'heroLeft'];
    var delays = [0, 400];
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el) {
        setTimeout(function () {
          el.classList.remove('hero-load-hidden');
          el.classList.add('hero-load-visible');
        }, delays[i]);
      }
    });
    // Chatbot trigger entrance
    setTimeout(function () {
      var ct = document.getElementById('chatbotTrigger');
      if (ct) {
        ct.classList.add('chatbot__trigger--entered');
        setTimeout(function () {
          ct.classList.add('chatbot__trigger--pulse');
        }, 400);
      }
    }, 1200);
  }

  // --- Render loop ---
  function animate() {
    if (!isVisible) {
      isAnimating = false;
      return; // Pause completely if off screen
    }

    if (!isHovering) {
      targetRotX = baseRotX;
      targetRotY = baseRotY;
    }

    var dx = targetRotX - panelGroup.rotation.x;
    var dy = targetRotY - panelGroup.rotation.y;
    
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
      // Force exact target to avoid micro-jitter
      panelGroup.rotation.x = targetRotX;
      panelGroup.rotation.y = targetRotY;
      renderer.render(scene, camera); // One final render to lock it
      isAnimating = false;
      return; // Stop the loop!
    }

    isAnimating = true;

    // Animate sweep light only when rendering
    var time = clock.getElapsedTime();
    sweepLight.position.x = Math.sin(time * 0.8) * 6;
    sweepLight.position.y = Math.cos(time * 0.5) * 4;

    panelGroup.rotation.y += dy * 0.05;
    panelGroup.rotation.x += dx * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // --- Init ---
  renderer.domElement.style.opacity = '0';
  renderer.domElement.style.transition = 'opacity 0.8s ease';

  function initScene() {
    renderer.domElement.style.opacity = '1';
    startDolly();
    wakeUpAnimation();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initScene);
  } else {
    initScene();
  }

  // Expose for main.js scroll integration
  window.__solarPanel = { panelGroup: panelGroup };
})();
