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
  const brass = "#c59a52";
  const glass = "#58aaa1";
  const copper = "#b86c43";
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

  const drawWindow = (x, y, size, lit) => {
    context.fillStyle = lit ? "rgba(230, 174, 78, 0.82)" : "rgba(67, 137, 133, 0.32)";
    context.fillRect(x, y, size, size * 1.45);
  };

  const drawTower = (x, baseY, towerWidth, towerHeight, time, index) => {
    const top = baseY - towerHeight;

    context.fillStyle = index % 2 === 0 ? "rgba(3, 24, 27, 0.9)" : "rgba(6, 31, 33, 0.94)";
    context.strokeStyle = "rgba(195, 154, 81, 0.44)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, baseY);
    context.lineTo(x, top + 22);
    context.lineTo(x + towerWidth * 0.18, top + 22);
    context.lineTo(x + towerWidth * 0.18, top + 10);
    context.lineTo(x + towerWidth * 0.38, top + 10);
    context.lineTo(x + towerWidth * 0.5, top);
    context.lineTo(x + towerWidth * 0.62, top + 10);
    context.lineTo(x + towerWidth * 0.82, top + 10);
    context.lineTo(x + towerWidth * 0.82, top + 22);
    context.lineTo(x + towerWidth, top + 22);
    context.lineTo(x + towerWidth, baseY);
    context.closePath();
    context.fill();
    context.stroke();

    const columns = Math.max(2, Math.floor(towerWidth / 18));
    const rows = Math.max(3, Math.floor(towerHeight / 28));
    const stepX = towerWidth / (columns + 1);
    const stepY = (towerHeight - 30) / (rows + 1);

    for (let row = 1; row <= rows; row += 1) {
      for (let column = 1; column <= columns; column += 1) {
        const lit = (row + column + index) % 3 !== 0;
        drawWindow(x + column * stepX - 2, top + 25 + row * stepY, 4, lit);
      }
    }

    context.beginPath();
    context.moveTo(x + towerWidth * 0.5, top);
    context.lineTo(x + towerWidth * 0.5, top - 18 - Math.sin(time * 0.001 + index) * 2);
    context.strokeStyle = rgba(brass, 0.5);
    context.stroke();
  };

  const drawTube = (startX, startY, endX, endY, time, phase) => {
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - height * 0.08;

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.lineWidth = 7;
    context.strokeStyle = rgba(glass, 0.12);
    context.stroke();

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.setLineDash([4, 10]);
    context.lineDashOffset = -time * 0.018 - phase;
    context.lineWidth = 1;
    context.strokeStyle = rgba(brass, 0.62);
    context.stroke();
    context.setLineDash([]);
  };

  const drawGauge = (x, y, radius, time, compact) => {
    context.save();
    context.translate(x, y);
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(4, 24, 27, 0.76)";
    context.fill();
    context.lineWidth = compact ? 3 : 5;
    context.strokeStyle = rgba(brass, 0.78);
    context.stroke();

    for (let index = 0; index < 13; index += 1) {
      const angle = Math.PI * 0.75 + index * (Math.PI * 1.5) / 12;
      const inner = radius * (index % 3 === 0 ? 0.7 : 0.76);
      context.beginPath();
      context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      context.lineTo(Math.cos(angle) * radius * 0.88, Math.sin(angle) * radius * 0.88);
      context.strokeStyle = rgba(brass, index % 3 === 0 ? 0.72 : 0.38);
      context.lineWidth = 1;
      context.stroke();
    }

    const needleAngle = Math.PI * 0.85 + Math.sin(time * 0.00055) * 0.12;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Math.cos(needleAngle) * radius * 0.62, Math.sin(needleAngle) * radius * 0.62);
    context.lineWidth = 2;
    context.strokeStyle = copper;
    context.stroke();
    context.beginPath();
    context.arc(0, 0, 4, 0, Math.PI * 2);
    context.fillStyle = brass;
    context.fill();

    context.fillStyle = "rgba(237, 222, 194, 0.78)";
    context.font = `${compact ? 7 : 9}px Georgia, serif`;
    context.textAlign = "center";
    context.fillText("PRESSURE", 0, radius * 0.38);
    context.fillText("7.4 ATM", 0, radius * 0.55);
    context.restore();
  };

  const drawField = (time = 0) => {
    context.clearRect(0, 0, width, height);
    const compact = width < 820;
    pointerX += (pointerTargetX - pointerX) * 0.04;
    pointerY += (pointerTargetY - pointerY) * 0.04;
    const cityLeft = compact ? width * 0.08 : width * 0.58;
    const cityWidth = compact ? width * 0.84 : width * 0.38;
    const baseY = compact ? height * 0.91 : height * 0.83;

    context.save();
    context.translate(pointerX, pointerY);

    for (let index = 0; index < 5; index += 1) {
      const y = height * (0.08 + index * 0.11) + Math.sin(time * 0.0003 + index) * 8;
      context.beginPath();
      context.moveTo(cityLeft - 60, y);
      context.bezierCurveTo(
        cityLeft + cityWidth * 0.22,
        y + 18,
        cityLeft + cityWidth * 0.62,
        y - 22,
        width + 60,
        y + 4
      );
      context.lineWidth = index === 0 ? 1.2 : 0.7;
      context.strokeStyle = `rgba(82, 169, 159, ${0.12 - index * 0.012})`;
      context.stroke();
    }

    const towers = compact
      ? [
          [0.02, 0.18, 0.54],
          [0.22, 0.15, 0.38],
          [0.41, 0.21, 0.69],
          [0.68, 0.16, 0.45],
          [0.83, 0.13, 0.3]
        ]
      : [
          [0.02, 0.17, 0.48],
          [0.22, 0.13, 0.34],
          [0.38, 0.19, 0.65],
          [0.62, 0.15, 0.42],
          [0.8, 0.16, 0.54]
        ];

    towers.forEach(([offset, widthRatio, heightRatio], index) => {
      drawTower(
        cityLeft + cityWidth * offset,
        baseY,
        cityWidth * widthRatio,
        height * heightRatio,
        time,
        index
      );
    });

    drawTube(
      cityLeft + cityWidth * 0.08,
      baseY - height * 0.31,
      cityLeft + cityWidth * 0.45,
      baseY - height * 0.42,
      time,
      0
    );
    drawTube(
      cityLeft + cityWidth * 0.48,
      baseY - height * 0.27,
      cityLeft + cityWidth * 0.88,
      baseY - height * 0.35,
      time,
      17
    );

    const gaugeX = compact ? width * 0.83 : width * 0.86;
    const gaugeY = compact ? height * 0.48 : height * 0.28;
    drawGauge(gaugeX, gaugeY, compact ? 35 : 52, time, compact);

    const lightX = cityLeft + cityWidth * 0.47;
    const lightY = baseY - height * 0.69 - 24;
    context.beginPath();
    context.moveTo(lightX, lightY);
    context.lineTo(lightX - cityWidth * 0.26, lightY + 58);
    context.lineTo(lightX + cityWidth * 0.16, lightY + 58);
    context.closePath();
    context.fillStyle = rgba(brass, 0.045 + Math.sin(time * 0.0012) * 0.012);
    context.fill();

    for (let index = 0; index < (compact ? 18 : 30); index += 1) {
      const bubbleX = cityLeft + ((index * 61) % Math.max(1, cityWidth));
      const travel = (time * (0.018 + (index % 5) * 0.004) + index * 37) % (height * 0.82);
      const bubbleY = baseY - travel;
      const radius = 1 + (index % 4) * 0.7;
      context.beginPath();
      context.arc(bubbleX, bubbleY, radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(128, 199, 189, ${0.16 + (index % 3) * 0.06})`;
      context.lineWidth = 0.7;
      context.stroke();
    }

    context.fillStyle = "rgba(221, 203, 168, 0.48)";
    context.textAlign = "left";
    context.font = `${compact ? 8 : 10}px Georgia, serif`;
    context.fillText("RAPTURE / DEPTH 1946m", cityLeft, baseY + 22);
    context.fillText("LIGHTHOUSE / SIGNAL", lightX + 12, lightY + 2);
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
    pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
    pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
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
