(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.classList.add("js-ready");
  prepareReveal();
  startCultureCanvas("heroCultureCanvas", "hero");
  startCultureCanvas("umkmCultureCanvas", "stage");

  function prepareReveal() {
    var targets = document.querySelectorAll(
      ".section, .culture-section, .metric, .interest-card, .timeline-item, .education-item, .journal-list span, .contact-links a"
    );

    targets.forEach(function (target) {
      target.classList.add("reveal-target");
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  function startCultureCanvas(id, mode) {
    var canvas = document.getElementById(id);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var motifs = [];
    var dpr = 1;
    var frameId = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motifs = createMotifs(mode, width, height);
      draw(performance.now(), true);
    }

    function loop(time) {
      draw(time, false);
      frameId = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", throttle(resize, 160), { passive: true });

    if (!reduceMotion) {
      frameId = window.requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          window.cancelAnimationFrame(frameId);
        } else {
          frameId = window.requestAnimationFrame(loop);
        }
      });
    }

    function draw(time, staticFrame) {
      var t = staticFrame ? 0 : time * 0.001;
      ctx.clearRect(0, 0, width, height);
      drawNetwork(ctx, motifs, t, mode);

      motifs.forEach(function (motif, index) {
        var drift = reduceMotion ? 0 : Math.sin(t * motif.speed + motif.phase) * motif.drift;
        var pulse = reduceMotion ? 1 : 0.82 + Math.sin(t * 1.4 + motif.phase) * 0.18;
        var x = motif.x + Math.cos(t * motif.speed * 0.7 + motif.phase) * drift;
        var y = motif.y + Math.sin(t * motif.speed + motif.phase) * drift;
        var alpha = motif.alpha * pulse;
        var rotation = t * motif.rotate + motif.phase;

        if (motif.type === "kawung") drawKawung(ctx, x, y, motif.size, rotation, alpha);
        if (motif.type === "stall") drawStall(ctx, x, y, motif.size, alpha);
        if (motif.type === "leaf") drawLeaf(ctx, x, y, motif.size, rotation, alpha);
        if (motif.type === "node") drawNode(ctx, x, y, motif.size, alpha, index);
      });
    }
  }

  function createMotifs(mode, width, height) {
    var count = mode === "hero" ? 18 : 30;
    var motifs = [];
    var types = ["kawung", "stall", "leaf", "node"];

    for (var i = 0; i < count; i += 1) {
      var stageBias = mode === "stage";
      var x = stageBias
        ? width * (0.42 + seeded(i, 1) * 0.52)
        : width * (0.08 + seeded(i, 1) * 0.84);
      var y = stageBias
        ? height * (0.08 + seeded(i, 2) * 0.84)
        : height * (0.12 + seeded(i, 2) * 0.72);

      motifs.push({
        x: x,
        y: y,
        size: (stageBias ? 22 : 15) + seeded(i, 3) * (stageBias ? 34 : 26),
        phase: seeded(i, 4) * Math.PI * 2,
        speed: 0.28 + seeded(i, 5) * 0.42,
        drift: (stageBias ? 9 : 6) + seeded(i, 6) * 9,
        rotate: (seeded(i, 7) - 0.5) * 0.36,
        alpha: stageBias ? 0.22 + seeded(i, 8) * 0.34 : 0.12 + seeded(i, 8) * 0.22,
        type: types[i % types.length]
      });
    }

    return motifs;
  }

  function drawNetwork(ctx, motifs, time, mode) {
    var maxDistance = mode === "stage" ? 230 : 170;
    ctx.save();
    ctx.lineWidth = 1;

    for (var i = 0; i < motifs.length; i += 1) {
      for (var j = i + 1; j < motifs.length; j += 1) {
        var a = motifs[i];
        var b = motifs[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          var alpha = (1 - distance / maxDistance) * (mode === "stage" ? 0.12 : 0.08);
          var pulse = 0.75 + Math.sin(time + i * 0.6 + j * 0.3) * 0.25;
          ctx.strokeStyle = "rgba(255, 209, 132, " + (alpha * pulse).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function drawKawung(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = "rgba(255, 209, 132, " + alpha.toFixed(3) + ")";
    ctx.lineWidth = Math.max(1, size * 0.035);

    for (var i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(size * 0.23, 0, size * 0.42, size * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(117, 183, 170, " + Math.min(alpha + 0.08, 0.72).toFixed(3) + ")";
    ctx.fill();
    ctx.restore();
  }

  function drawStall(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
    ctx.fillStyle = "rgba(216, 144, 31, " + Math.min(alpha + 0.08, 0.72).toFixed(3) + ")";
    ctx.lineWidth = Math.max(1, size * 0.04);

    ctx.beginPath();
    ctx.moveTo(-size * 0.45, -size * 0.1);
    ctx.lineTo(-size * 0.28, -size * 0.36);
    ctx.lineTo(size * 0.28, -size * 0.36);
    ctx.lineTo(size * 0.45, -size * 0.1);
    ctx.closePath();
    ctx.stroke();

    for (var i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(i * size * 0.18, -size * 0.1, size * 0.09, 0, Math.PI);
      ctx.stroke();
    }

    ctx.fillRect(-size * 0.32, size * 0.02, size * 0.64, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(-size * 0.36, size * 0.32);
    ctx.lineTo(size * 0.36, size * 0.32);
    ctx.moveTo(-size * 0.28, size * 0.1);
    ctx.lineTo(-size * 0.28, size * 0.32);
    ctx.moveTo(size * 0.28, size * 0.1);
    ctx.lineTo(size * 0.28, size * 0.32);
    ctx.stroke();
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = "rgba(117, 183, 170, " + Math.min(alpha + 0.08, 0.68).toFixed(3) + ")";
    ctx.fillStyle = "rgba(35, 95, 88, " + Math.min(alpha * 0.45, 0.28).toFixed(3) + ")";
    ctx.lineWidth = Math.max(1, size * 0.035);

    ctx.beginPath();
    ctx.moveTo(0, size * 0.42);
    ctx.bezierCurveTo(-size * 0.55, size * 0.08, -size * 0.36, -size * 0.36, 0, -size * 0.48);
    ctx.bezierCurveTo(size * 0.36, -size * 0.36, size * 0.55, size * 0.08, 0, size * 0.42);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, size * 0.34);
    ctx.lineTo(0, -size * 0.36);
    ctx.stroke();
    ctx.restore();
  }

  function drawNode(ctx, x, y, size, alpha, index) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = index % 2 === 0
      ? "rgba(255, 209, 132, " + Math.min(alpha + 0.14, 0.8).toFixed(3) + ")"
      : "rgba(117, 183, 170, " + Math.min(alpha + 0.14, 0.78).toFixed(3) + ")";
    ctx.strokeStyle = "rgba(255, 255, 255, " + Math.min(alpha + 0.08, 0.58).toFixed(3) + ")";
    ctx.lineWidth = Math.max(1, size * 0.035);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.31, 0.25, Math.PI * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  function seeded(index, salt) {
    var value = Math.sin(index * 97.13 + salt * 31.71) * 10000;
    return value - Math.floor(value);
  }

  function throttle(fn, delay) {
    var timer = 0;
    return function () {
      if (timer) return;
      timer = window.setTimeout(function () {
        timer = 0;
        fn();
      }, delay);
    };
  }
})();
