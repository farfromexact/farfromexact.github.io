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
  const navy = "#29495d";
  const gold = "#c59a46";
  const sky = "#6f9fad";
  const coral = "#b96858";
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
      x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
      y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
    };
  };

  const drawCloud = (x, y, scale, alpha) => {
    context.beginPath();
    context.ellipse(x, y, 45 * scale, 13 * scale, 0, 0, Math.PI * 2);
    context.ellipse(x - 27 * scale, y + 2 * scale, 25 * scale, 10 * scale, 0, 0, Math.PI * 2);
    context.ellipse(x + 26 * scale, y + 1 * scale, 31 * scale, 11 * scale, 0, 0, Math.PI * 2);
    context.ellipse(x + 5 * scale, y - 8 * scale, 25 * scale, 17 * scale, 0, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 252, 242, ${alpha})`;
    context.fill();
    context.strokeStyle = `rgba(84, 122, 135, ${alpha * 0.28})`;
    context.lineWidth = 0.6;
    context.stroke();
  };

  const drawBuilding = (x, platformY, buildingWidth, buildingHeight, styleIndex) => {
    const top = platformY - buildingHeight;
    context.fillStyle = styleIndex % 2 === 0 ? "rgba(255, 249, 235, 0.94)" : "rgba(238, 233, 216, 0.96)";
    context.strokeStyle = "rgba(54, 84, 98, 0.58)";
    context.lineWidth = 1;
    context.fillRect(x, top, buildingWidth, buildingHeight);
    context.strokeRect(x, top, buildingWidth, buildingHeight);

    context.fillStyle = rgba(gold, 0.82);
    context.fillRect(x - 3, top, buildingWidth + 6, 4);
    context.fillRect(x, top + 12, buildingWidth, 2);

    const columns = Math.max(2, Math.floor(buildingWidth / 18));
    for (let column = 0; column < columns; column += 1) {
      const columnX = x + 7 + column * ((buildingWidth - 14) / Math.max(1, columns - 1));
      context.fillStyle = "rgba(71, 112, 126, 0.5)";
      context.fillRect(columnX - 1.5, top + 20, 3, buildingHeight - 28);
      context.fillStyle = rgba(gold, 0.64);
      context.fillRect(columnX - 2.5, top + 18, 5, 2);
    }

    context.beginPath();
    context.moveTo(x + buildingWidth * 0.2, top);
    context.lineTo(x + buildingWidth * 0.5, top - buildingWidth * 0.2);
    context.lineTo(x + buildingWidth * 0.8, top);
    context.closePath();
    context.fillStyle = styleIndex % 2 === 0 ? rgba(coral, 0.82) : rgba(navy, 0.76);
    context.fill();
    context.stroke();

    context.beginPath();
    context.moveTo(x + buildingWidth * 0.5, top - buildingWidth * 0.2);
    context.lineTo(x + buildingWidth * 0.5, top - buildingWidth * 0.2 - 22);
    context.strokeStyle = rgba(gold, 0.72);
    context.stroke();
  };

  const drawPlatform = (x, y, platformWidth, time, index) => {
    context.beginPath();
    context.ellipse(x + platformWidth / 2, y, platformWidth / 2, 13, 0, 0, Math.PI * 2);
    context.fillStyle = "rgba(62, 99, 111, 0.2)";
    context.fill();
    context.strokeStyle = "rgba(42, 74, 89, 0.48)";
    context.stroke();

    context.beginPath();
    context.moveTo(x + 8, y + 3);
    context.lineTo(x + platformWidth * 0.34, y + 50);
    context.lineTo(x + platformWidth * 0.5, y + 64 + Math.sin(time * 0.001 + index) * 2);
    context.lineTo(x + platformWidth * 0.66, y + 50);
    context.lineTo(x + platformWidth - 8, y + 3);
    context.closePath();
    context.fillStyle = "rgba(67, 101, 111, 0.13)";
    context.fill();
    context.strokeStyle = "rgba(57, 91, 103, 0.28)";
    context.stroke();

    for (let cable = 1; cable < 4; cable += 1) {
      const cableX = x + platformWidth * cable / 4;
      context.beginPath();
      context.moveTo(cableX, y + 4);
      context.lineTo(x + platformWidth * 0.5, y + 64);
      context.strokeStyle = "rgba(58, 91, 101, 0.16)";
      context.stroke();
    }
  };

  const drawBalloon = (x, y, scale, phase) => {
    const bob = Math.sin(phase) * 3;
    context.beginPath();
    context.ellipse(x, y + bob, 15 * scale, 20 * scale, 0, 0, Math.PI * 2);
    context.fillStyle = "rgba(187, 103, 83, 0.16)";
    context.fill();
    context.strokeStyle = "rgba(147, 75, 63, 0.48)";
    context.stroke();
    context.beginPath();
    context.moveTo(x - 8 * scale, y + 15 * scale + bob);
    context.lineTo(x - 3 * scale, y + 29 * scale + bob);
    context.lineTo(x + 3 * scale, y + 29 * scale + bob);
    context.lineTo(x + 8 * scale, y + 15 * scale + bob);
    context.stroke();
    context.fillStyle = rgba(navy, 0.56);
    context.fillRect(x - 4 * scale, y + 28 * scale + bob, 8 * scale, 4 * scale);
  };

  const drawRail = (start, control, end, time, compact) => {
    [-4, 4].forEach((offset) => {
      context.beginPath();
      context.moveTo(start.x, start.y + offset);
      context.quadraticCurveTo(control.x, control.y + offset, end.x, end.y + offset);
      context.lineWidth = 1.2;
      context.strokeStyle = rgba(navy, 0.52);
      context.stroke();
    });

    const progress = (time * 0.000055) % 1;
    const carriage = quadraticPoint(start, control, end, progress);
    context.beginPath();
    context.arc(carriage.x, carriage.y, compact ? 3 : 4, 0, Math.PI * 2);
    context.fillStyle = gold;
    context.shadowColor = rgba(gold, 0.5);
    context.shadowBlur = 9;
    context.fill();
    context.shadowBlur = 0;
  };

  const drawField = (time = 0) => {
    context.clearRect(0, 0, width, height);
    const compact = width < 820;
    pointerX += (pointerTargetX - pointerX) * 0.04;
    pointerY += (pointerTargetY - pointerY) * 0.04;
    const cityLeft = compact ? width * 0.04 : width * 0.56;
    const cityWidth = compact ? width * 0.92 : width * 0.4;
    const baseY = compact ? height * 0.79 : height * 0.61;

    context.save();
    context.translate(pointerX, pointerY);

    const sunX = compact ? width * 0.79 : width * 0.84;
    const sunY = compact ? height * 0.43 : height * 0.2;
    context.beginPath();
    context.arc(sunX, sunY, compact ? 38 : 60, 0, Math.PI * 2);
    context.fillStyle = rgba(gold, 0.12);
    context.fill();
    context.strokeStyle = rgba(gold, 0.38);
    context.stroke();

    for (let index = 0; index < (compact ? 9 : 14); index += 1) {
      const drift = (time * (0.006 + (index % 3) * 0.002) + index * 97) % (width + 220);
      const x = drift - 110;
      const y = height * (0.34 + (index % 5) * 0.09);
      drawCloud(x, y, 0.55 + (index % 4) * 0.16, 0.32 + (index % 3) * 0.08);
    }

    const platforms = compact
      ? [
          [0.02, 0.32, 0.1, 0.31],
          [0.37, 0.27, -0.06, 0.44],
          [0.69, 0.26, 0.07, 0.35]
        ]
      : [
          [0.01, 0.3, 0.07, 0.29],
          [0.34, 0.28, -0.08, 0.43],
          [0.66, 0.31, 0.05, 0.34]
        ];

    platforms.forEach(([offset, widthRatio, yOffset, buildingRatio], index) => {
      const platformX = cityLeft + cityWidth * offset;
      const platformWidth = cityWidth * widthRatio;
      const platformY = baseY + height * yOffset + Math.sin(time * 0.00045 + index * 1.8) * 4;
      drawPlatform(platformX, platformY, platformWidth, time, index);
      drawBuilding(
        platformX + platformWidth * 0.24,
        platformY - 7,
        platformWidth * 0.52,
        height * buildingRatio,
        index
      );
    });

    const railStart = { x: cityLeft + cityWidth * 0.06, y: baseY - height * 0.08 };
    const railControl = { x: cityLeft + cityWidth * 0.51, y: baseY - height * 0.48 };
    const railEnd = { x: cityLeft + cityWidth * 0.94, y: baseY - height * 0.05 };
    drawRail(railStart, railControl, railEnd, time, compact);

    drawBalloon(cityLeft + cityWidth * 0.11, height * (compact ? 0.46 : 0.17), compact ? 0.72 : 0.9, time * 0.001);
    drawBalloon(cityLeft + cityWidth * 0.9, height * (compact ? 0.55 : 0.31), compact ? 0.55 : 0.68, time * 0.0012 + 2);

    context.fillStyle = "rgba(48, 78, 91, 0.54)";
    context.font = `${compact ? 8 : 10}px Georgia, serif`;
    context.textAlign = "left";
    context.fillText("COLUMBIA / ALTITUDE 15,000 FT", cityLeft, baseY + height * 0.16);

    if (!compact) {
      context.fillText("SKY-LINE / VARIABLE PATH", railControl.x - 40, railControl.y - 12);
      context.fillStyle = rgba(gold, 0.74);
      context.fillText("CONSTANT / TRUE NORTH", sunX - 60, sunY + 82);
    }

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
    pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
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
