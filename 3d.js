/* ===========================================================
   3D-сцены на Three.js r128 (UMD, без модулей)
   1) heroScene — крупный wireframe-объект в духе "сети/данных",
      вращается сам по себе и слегка довращивается за курсором
   2) bgScene   — лёгкое поле точек-"узлов" с линиями связи,
      едет фоном через весь сайт поверх body
   =========================================================== */

(function () {
    if (typeof THREE === 'undefined') return;

    var prefersReducedMotion = window.matchMedia('(prefers-color-scheme: no-preference)').matches === false
        ? false
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       1) HERO 3D — вращающийся икосаэдр-каркас "сеть данных"
    --------------------------------------------------------- */
    (function initHero3D() {
        var canvas = document.getElementById('hero-3d');
        var heroEl = document.querySelector('.hero');
        if (!canvas || !heroEl) return;

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 9);

        function sizeHero() {
            var w = heroEl.clientWidth;
            var h = heroEl.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        sizeHero();

        var accentColor = 0x1F4E3D; // var(--accent)
        var inkColor = 0x1C1C1A;    // var(--ink)

        var group = new THREE.Group();
        scene.add(group);

        // Каркасный икосаэдр — абстрактная "сеть узлов"
        var icoGeo = new THREE.IcosahedronGeometry(2.4, 1);
        var icoWire = new THREE.EdgesGeometry(icoGeo);
        var icoMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.55 });
        var icoLines = new THREE.LineSegments(icoWire, icoMat);
        group.add(icoLines);

        // Узлы на вершинах (точки, похожие на "ноды" графа)
        var dotsGeo = new THREE.BufferGeometry();
        var posAttr = icoGeo.getAttribute('position');
        dotsGeo.setAttribute('position', posAttr);
        var dotsMat = new THREE.PointsMaterial({ color: inkColor, size: 0.09, sizeAttenuation: true });
        var dots = new THREE.Points(dotsGeo, dotsMat);
        group.add(dots);

        // Внутренний маленький вращающийся тор — акцент "процессора/ядра"
        var torusGeo = new THREE.TorusGeometry(0.85, 0.055, 8, 48);
        var torusMat = new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: 0.5 });
        var torus = new THREE.Mesh(torusGeo, torusMat);
        torus.rotation.x = Math.PI / 3;
        group.add(torus);

        group.position.set(2.4, -0.3, 0);

        var mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            targetRotY = mouseX * 0.35;
            targetRotX = mouseY * 0.2;
        });

        var clock = new THREE.Clock();
        function animateHero() {
            requestAnimationFrame(animateHero);
            var t = clock.getElapsedTime();

            if (!prefersReducedMotion) {
                group.rotation.y += 0.0022;
                torus.rotation.z += 0.004;
            }
            group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
            group.rotation.y += (targetRotY - (group.rotation.y % (Math.PI * 2))) * 0.015;
            group.position.y = -0.3 + Math.sin(t * 0.6) * 0.12;

            renderer.render(scene, camera);
        }
        animateHero();

        window.addEventListener('resize', sizeHero);
    })();

    /* ---------------------------------------------------------
       2) ФОН — редкое поле точек-узлов с линиями связи,
          стилизовано под граф/схему данных, едет через весь сайт
    --------------------------------------------------------- */
    (function initBackgroundGrid() {
        var canvas = document.getElementById('bg-grid-3d');
        if (!canvas) return;

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 14;

        function sizeBg() {
            renderer.setSize(window.innerWidth, window.innerHeight, false);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        sizeBg();

        var NODE_COUNT = window.innerWidth < 768 ? 16 : 30;
        var SPREAD_X = 16, SPREAD_Y = 10, SPREAD_Z = 6;
        var nodes = [];
        var nodeGeo = new THREE.BufferGeometry();
        var positions = new Float32Array(NODE_COUNT * 3);

        for (var i = 0; i < NODE_COUNT; i++) {
            var x = (Math.random() - 0.5) * SPREAD_X;
            var y = (Math.random() - 0.5) * SPREAD_Y;
            var z = (Math.random() - 0.5) * SPREAD_Z;
            nodes.push({ x: x, y: y, z: z, baseY: y, speed: 0.08 + Math.random() * 0.12, phase: Math.random() * Math.PI * 2 });
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var nodeMat = new THREE.PointsMaterial({ color: 0x1F4E3D, size: 0.065, transparent: true, opacity: 0.4 });
        var points = new THREE.Points(nodeGeo, nodeMat);
        scene.add(points);

        // Линии связи между близкими узлами — "граф" в духе сетевой схемы
        var linkGeo = new THREE.BufferGeometry();
        var linkMat = new THREE.LineBasicMaterial({ color: 0x1C1C1A, transparent: true, opacity: 0.04 });
        var linkLines = new THREE.LineSegments(linkGeo, linkMat);
        scene.add(linkLines);

        var MAX_DIST = 4.2;
        function rebuildLinks() {
            var verts = [];
            for (var a = 0; a < nodes.length; a++) {
                for (var b = a + 1; b < nodes.length; b++) {
                    var dx = nodes[a].x - nodes[b].x;
                    var dy = nodes[a].y - nodes[b].y;
                    var dz = nodes[a].z - nodes[b].z;
                    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < MAX_DIST) {
                        verts.push(nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z);
                    }
                }
            }
            linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
            linkGeo.attributes.position.needsUpdate = true;
        }
        rebuildLinks();

        var clockBg = new THREE.Clock();
        var frame = 0;
        function animateBg() {
            requestAnimationFrame(animateBg);
            if (!prefersReducedMotion) {
                var t = clockBg.getElapsedTime();
                var posArr = nodeGeo.getAttribute('position');
                for (var i = 0; i < nodes.length; i++) {
                    var n = nodes[i];
                    n.y = n.baseY + Math.sin(t * n.speed + n.phase) * 0.4;
                    posArr.setXYZ(i, n.x, n.y, n.z);
                }
                posArr.needsUpdate = true;

                frame++;
                if (frame % 20 === 0) rebuildLinks(); // линии обновляются реже — дешевле по производительности

                scene.rotation.y = Math.sin(t * 0.04) * 0.08;
            }
            renderer.render(scene, camera);
        }
        animateBg();

        window.addEventListener('resize', sizeBg);
    })();
})();
