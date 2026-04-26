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
  camera.position.set(0, 1.5, 5.5); // slightly above and facing down
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  function resize() {
    var w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    if (typeof panelGroup !== 'undefined') {
      var screenW = window.innerWidth;
      // La taille standard du design est d'environ 1200px
      var scale = Math.min(1, screenW / 1200);
      scale = Math.max(0.3, scale); // Limite abaissée à 0.3 pour les petits mobiles
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

  // --- Lighting ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  var dirLight = new THREE.DirectionalLight(0xffffff, 4.0);
  dirLight.position.set(-5, 8, 4); // top-left
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  var fillLight = new THREE.PointLight(0xffffff, 1.5, 20);
  fillLight.position.set(5, -2, 5); // opposite side
  scene.add(fillLight);



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
      
      // TAILLE : 0.7 (comme demandé)
      model.scale.set(0.7, 0.7, 0.7); 
      
      // HAUTEUR : Modifiez la valeur Y ici pour monter ou descendre le modèle
      model.position.y = -0.6; 
      
      model.traverse(function (node) {
        if (node.isMesh && node.material) {
          node.material.envMapIntensity = 1.2;
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
    var ids = ['heroEyebrow', 'heroH1', 'heroBody', 'heroCtas'];
    var delays = [0, 200, 600, 800];
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

    isAnimating = true;

    if (!isHovering) {
      targetRotX = baseRotX;
      targetRotY = baseRotY;
    }

    var dx = targetRotX - panelGroup.rotation.x;
    var dy = targetRotY - panelGroup.rotation.y;
    
    // Check if lerp is converged
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
      panelGroup.rotation.x = targetRotX;
      panelGroup.rotation.y = targetRotY;
      renderer.render(scene, camera); // Final perfect frame
      isAnimating = false;
      return; // Stop requesting frames
    }

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
