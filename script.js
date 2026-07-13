const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const filterButtons = document.querySelectorAll(".filter-button");
const catalogItems = document.querySelectorAll(".catalog-item");

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));

  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    catalogItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !shouldShow);
      item.hidden = !shouldShow;
    });
  });
});

const revealTargets = document.querySelectorAll(
  ".method-statement, .method-console, .section-heading, .axis-card, .project-card, .catalog-item, .principles > *"
);

revealTargets.forEach((item) => item.classList.add("reveal"));

if (motionQuery.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08
    }
  );

  revealTargets.forEach((item) => revealObserver.observe(item));
}

const navigationLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleSection) {
        return;
      }

      navigationLinks.forEach((link) => {
        link.classList.toggle(
          "is-current",
          link.getAttribute("href") === `#${visibleSection.target.id}`
        );
      });
    },
    {
      rootMargin: "-28% 0px -58% 0px",
      threshold: [0, 0.2, 0.5]
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const canvas = document.querySelector("#system-field");
const hero = document.querySelector(".hero");

if (canvas && hero) {
  const context = canvas.getContext("2d");
  const trackDefinitions = [
    { label: "MARKET REGIME", color: "#0071e3", phase: 0.02, speed: 0.000045 },
    { label: "OPTIONS + VOL", color: "#00a68a", phase: 0.24, speed: 0.000052 },
    { label: "RISK + CAPITAL", color: "#d05a2a", phase: 0.46, speed: 0.000041 },
    { label: "RESEARCH", color: "#a44c86", phase: 0.68, speed: 0.000048 }
  ];

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let animationFrame = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  const rgba = (hex, alpha) => {
    const value = Number.parseInt(hex.slice(1), 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  const quadraticPoint = (start, control, end, progress) => {
    const inverse = 1 - progress;

    return {
      x:
        inverse * inverse * start.x +
        2 * inverse * progress * control.x +
        progress * progress * end.x,
      y:
        inverse * inverse * start.y +
        2 * inverse * progress * control.y +
        progress * progress * end.y
    };
  };

  const pathGeometry = (index, hub, compact) => {
    if (compact) {
      const startX = [0.08, 0.26, 0.48, 0.64][index] * width;
      const startY = [0.6, 0.52, 0.57, 0.49][index] * height;
      const controlX = [0.35, 0.48, 0.61, 0.7][index] * width;
      const controlY = [0.67, 0.58, 0.72, 0.59][index] * height;

      return {
        start: { x: startX, y: startY },
        control: { x: controlX, y: controlY },
        end: hub
      };
    }

    const startX = Math.max(width * 0.58, Math.min(width - 280, 700));
    const startY = [0.16, 0.33, 0.66, 0.81][index] * height;
    const controlX = [0.71, 0.73, 0.7, 0.74][index] * width;
    const controlY = [0.14, 0.35, 0.69, 0.83][index] * height;

    return {
      start: { x: startX + index * 10, y: startY },
      control: { x: controlX, y: controlY },
      end: hub
    };
  };

  const drawTrack = (definition, index, time, hub, compact) => {
    const geometry = pathGeometry(index, hub, compact);

    [-7, 0, 7].forEach((offset, lineIndex) => {
      context.beginPath();
      context.moveTo(geometry.start.x, geometry.start.y + offset);
      context.quadraticCurveTo(
        geometry.control.x,
        geometry.control.y + offset * 0.5,
        geometry.end.x,
        geometry.end.y
      );
      context.setLineDash(lineIndex === 1 ? [7, 11] : [2, 13]);
      context.lineDashOffset = -time * (0.012 + index * 0.002) - offset;
      context.lineWidth = lineIndex === 1 ? 1.35 : 0.7;
      context.strokeStyle = rgba(definition.color, lineIndex === 1 ? 0.34 : 0.12);
      context.stroke();
    });

    context.setLineDash([]);

    const particleCount = compact ? 4 : 6;

    for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
      const progress =
        (time * definition.speed + particleIndex / particleCount + definition.phase) % 1;
      const point = quadraticPoint(
        geometry.start,
        geometry.control,
        geometry.end,
        progress
      );
      const pulse = 1 + Math.sin(time * 0.004 + particleIndex + index) * 0.35;

      context.beginPath();
      context.arc(point.x, point.y, (compact ? 1.8 : 2.2) * pulse, 0, Math.PI * 2);
      context.fillStyle = rgba(definition.color, 0.9);
      context.shadowColor = rgba(definition.color, 0.45);
      context.shadowBlur = compact ? 6 : 10;
      context.fill();
      context.shadowBlur = 0;
    }

    context.beginPath();
    context.arc(geometry.start.x, geometry.start.y, compact ? 3 : 4, 0, Math.PI * 2);
    context.fillStyle = definition.color;
    context.fill();

    if (!compact) {
      context.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      context.fillStyle = "rgba(29, 29, 31, 0.54)";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(definition.label, geometry.start.x + 12, geometry.start.y);
    }
  };

  const drawHub = (hub, time, compact) => {
    const radii = compact ? [70, 51, 33] : [126, 92, 58];

    radii.forEach((radius, index) => {
      context.beginPath();
      context.arc(hub.x, hub.y, radius, 0, Math.PI * 2);
      context.setLineDash(index === 1 ? [4, 8] : [2, 11]);
      context.lineDashOffset = (index % 2 === 0 ? -1 : 1) * time * 0.012;
      context.lineWidth = index === 2 ? 1.4 : 0.8;
      context.strokeStyle = `rgba(29, 29, 31, ${index === 2 ? 0.24 : 0.13})`;
      context.stroke();
    });

    context.setLineDash([]);

    trackDefinitions.forEach((definition, index) => {
      const startAngle = -Math.PI / 2 + index * (Math.PI / 2) + time * 0.00005;
      const endAngle = startAngle + Math.PI * 0.28;

      context.beginPath();
      context.arc(hub.x, hub.y, radii[0], startAngle, endAngle);
      context.lineWidth = compact ? 2.4 : 3;
      context.lineCap = "round";
      context.strokeStyle = definition.color;
      context.stroke();
    });

    context.beginPath();
    context.arc(hub.x, hub.y, compact ? 27 : 45, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 255, 255, 0.94)";
    context.shadowColor = "rgba(29, 29, 31, 0.14)";
    context.shadowBlur = compact ? 18 : 28;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(29, 29, 31, 0.18)";
    context.lineWidth = 1;
    context.stroke();

    context.beginPath();
    context.arc(hub.x, hub.y - (compact ? 6 : 9), compact ? 3 : 4, 0, Math.PI * 2);
    context.fillStyle = "#1d1d1f";
    context.fill();

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(29, 29, 31, 0.88)";
    context.font = compact
      ? '650 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : '650 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    context.fillText(compact ? "REVIEW" : "DECISION", hub.x, hub.y + (compact ? 7 : 9));

    if (!compact) {
      context.fillStyle = "rgba(29, 29, 31, 0.42)";
      context.font = '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      context.fillText("NOT PREDICTION", hub.x, hub.y + 24);
    }
  };

  const drawField = (time = 0) => {
    context.clearRect(0, 0, width, height);

    const compact = width < 820;
    pointerX += (pointerTargetX - pointerX) * 0.045;
    pointerY += (pointerTargetY - pointerY) * 0.045;

    const hub = {
      x: width * (compact ? 0.77 : 0.82) + pointerX,
      y: height * (compact ? 0.7 : 0.44) + pointerY
    };

    context.save();

    const cloudCount = compact ? 18 : 34;

    for (let index = 0; index < cloudCount; index += 1) {
      const angle = index * 2.399963 + time * 0.000025;
      const radius = (compact ? 92 : 168) + (index % 5) * (compact ? 10 : 15);
      const x = hub.x + Math.cos(angle) * radius;
      const y = hub.y + Math.sin(angle) * radius * 0.66;

      context.beginPath();
      context.arc(x, y, index % 4 === 0 ? 1.5 : 0.9, 0, Math.PI * 2);
      context.fillStyle = `rgba(29, 29, 31, ${index % 4 === 0 ? 0.15 : 0.08})`;
      context.fill();
    }

    trackDefinitions.forEach((definition, index) => {
      drawTrack(definition, index, time, hub, compact);
    });

    drawHub(hub, time, compact);
    context.restore();
  };

  const animate = (time) => {
    drawField(time);

    if (!motionQuery.matches && !document.hidden) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    window.cancelAnimationFrame(animationFrame);

    if (motionQuery.matches) {
      drawField(0);
      return;
    }

    animationFrame = window.requestAnimationFrame(animate);
  };

  const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawField(performance.now());
  };

  hero.addEventListener("pointermove", (event) => {
    if (motionQuery.matches) {
      return;
    }

    const bounds = hero.getBoundingClientRect();
    pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
    pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;
  });

  hero.addEventListener("pointerleave", () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      return;
    }

    startAnimation();
  });

  const handleMotionChange = () => {
    if (motionQuery.matches) {
      revealTargets.forEach((item) => item.classList.add("is-visible"));
    }

    startAnimation();
  };

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", handleMotionChange);
  } else {
    motionQuery.addListener(handleMotionChange);
  }

  if ("ResizeObserver" in window) {
    const canvasResizeObserver = new ResizeObserver(resizeCanvas);
    canvasResizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  resizeCanvas();
  startAnimation();
}
