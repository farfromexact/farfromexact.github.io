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
  const radiant = "#2d8b68";
  const dire = "#b44237";
  const river = "#6f8e91";
  const terrain = "#77796d";

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

  const cubicPoint = (start, controlA, controlB, end, progress) => {
    const inverse = 1 - progress;

    return {
      x:
        inverse ** 3 * start.x +
        3 * inverse ** 2 * progress * controlA.x +
        3 * inverse * progress ** 2 * controlB.x +
        progress ** 3 * end.x,
      y:
        inverse ** 3 * start.y +
        3 * inverse ** 2 * progress * controlA.y +
        3 * inverse * progress ** 2 * controlB.y +
        progress ** 3 * end.y
    };
  };

  const drawDiamond = (x, y, size, color, fillAlpha = 0.1) => {
    context.save();
    context.translate(x, y);
    context.rotate(Math.PI / 4);
    context.beginPath();
    context.rect(-size / 2, -size / 2, size, size);
    context.fillStyle = rgba(color, fillAlpha);
    context.fill();
    context.strokeStyle = rgba(color, 0.82);
    context.lineWidth = 1.2;
    context.stroke();
    context.restore();
  };

  const drawVision = (x, y, color, time, phase, compact) => {
    const pulse = (compact ? 24 : 33) + Math.sin(time * 0.002 + phase) * 4;

    context.beginPath();
    context.arc(x, y, pulse, 0, Math.PI * 2);
    context.strokeStyle = rgba(color, 0.17);
    context.lineWidth = 1;
    context.stroke();

    context.beginPath();
    context.arc(x, y, pulse * 0.58, 0, Math.PI * 2);
    context.setLineDash([3, 6]);
    context.lineDashOffset = -time * 0.01;
    context.strokeStyle = rgba(color, 0.3);
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.arc(x, y, compact ? 2.5 : 3.5, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  };

  const createMap = (compact) => {
    const left = compact ? width * 0.06 : Math.max(width * 0.54, width - 610);
    const right = width * 0.95;
    const top = compact ? height * 0.48 : height * 0.12;
    const bottom = compact ? height - 126 : height - 138;
    const offsetX = pointerX;
    const offsetY = pointerY;

    const radiantBase = {
      x: left + (compact ? 18 : 28) + offsetX,
      y: bottom - (compact ? 16 : 24) + offsetY
    };
    const direBase = {
      x: right - (compact ? 18 : 28) + offsetX,
      y: top + (compact ? 16 : 24) + offsetY
    };

    return {
      left: left + offsetX,
      right: right + offsetX,
      top: top + offsetY,
      bottom: bottom + offsetY,
      radiantBase,
      direBase,
      lanes: [
        {
          label: "TOP / HIGH GROUND",
          start: radiantBase,
          controlA: { x: left - 8 + offsetX, y: top + 56 + offsetY },
          controlB: { x: right - 92 + offsetX, y: top + 8 + offsetY },
          end: direBase
        },
        {
          label: "MID / TEMPO",
          start: radiantBase,
          controlA: {
            x: left + (right - left) * 0.38 + offsetX,
            y: bottom - (bottom - top) * 0.38 + offsetY
          },
          controlB: {
            x: left + (right - left) * 0.62 + offsetX,
            y: bottom - (bottom - top) * 0.62 + offsetY
          },
          end: direBase
        },
        {
          label: "SAFE / ECONOMY",
          start: radiantBase,
          controlA: { x: right - 70 + offsetX, y: bottom + 8 + offsetY },
          controlB: { x: right + 8 + offsetX, y: top + 82 + offsetY },
          end: direBase
        }
      ]
    };
  };

  const drawLane = (lane, laneIndex, time, compact) => {
    context.beginPath();
    context.moveTo(lane.start.x, lane.start.y);
    context.bezierCurveTo(
      lane.controlA.x,
      lane.controlA.y,
      lane.controlB.x,
      lane.controlB.y,
      lane.end.x,
      lane.end.y
    );
    context.strokeStyle = "rgba(44, 49, 42, 0.12)";
    context.lineWidth = compact ? 6 : 9;
    context.stroke();

    context.beginPath();
    context.moveTo(lane.start.x, lane.start.y);
    context.bezierCurveTo(
      lane.controlA.x,
      lane.controlA.y,
      lane.controlB.x,
      lane.controlB.y,
      lane.end.x,
      lane.end.y
    );
    context.setLineDash([6, 8]);
    context.lineDashOffset = -time * (0.008 + laneIndex * 0.001);
    context.strokeStyle = "rgba(87, 91, 80, 0.48)";
    context.lineWidth = 1;
    context.stroke();
    context.setLineDash([]);

    [0.23, 0.47, 0.73].forEach((progress) => {
      const point = cubicPoint(
        lane.start,
        lane.controlA,
        lane.controlB,
        lane.end,
        progress
      );
      const color = progress < 0.5 ? radiant : dire;
      drawDiamond(point.x, point.y, compact ? 6 : 8, color, 0.12);
    });

    const unitCount = compact ? 3 : 5;

    for (let unitIndex = 0; unitIndex < unitCount; unitIndex += 1) {
      const forward =
        (time * (0.000035 + laneIndex * 0.000004) + unitIndex / unitCount) % 1;
      const backward =
        1 -
        ((time * (0.000032 + laneIndex * 0.000003) +
          unitIndex / unitCount +
          0.17) %
          1);
      const radiantPoint = cubicPoint(
        lane.start,
        lane.controlA,
        lane.controlB,
        lane.end,
        forward
      );
      const direPoint = cubicPoint(
        lane.start,
        lane.controlA,
        lane.controlB,
        lane.end,
        backward
      );

      [
        { point: radiantPoint, color: radiant },
        { point: direPoint, color: dire }
      ].forEach(({ point, color }) => {
        context.beginPath();
        context.arc(point.x, point.y, compact ? 1.8 : 2.2, 0, Math.PI * 2);
        context.fillStyle = rgba(color, 0.9);
        context.shadowColor = rgba(color, 0.35);
        context.shadowBlur = compact ? 5 : 8;
        context.fill();
        context.shadowBlur = 0;
      });
    }

    if (!compact) {
      const labelPoint = cubicPoint(
        lane.start,
        lane.controlA,
        lane.controlB,
        lane.end,
        0.58
      );
      context.font = '600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      context.fillStyle = "rgba(32, 37, 31, 0.46)";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(lane.label, labelPoint.x + 10, labelPoint.y - 10);
    }
  };

  const drawMap = (time) => {
    context.clearRect(0, 0, width, height);

    const compact = width < 820;
    pointerX += (pointerTargetX - pointerX) * 0.045;
    pointerY += (pointerTargetY - pointerY) * 0.045;

    const map = createMap(compact);
    const mapWidth = map.right - map.left;
    const mapHeight = map.bottom - map.top;

    context.save();

    const columns = compact ? 8 : 12;
    const rows = compact ? 5 : 9;

    for (let column = 0; column <= columns; column += 1) {
      for (let row = 0; row <= rows; row += 1) {
        const x = map.left + (column / columns) * mapWidth;
        const y = map.top + (row / rows) * mapHeight;

        context.beginPath();
        context.arc(x, y, (column + row) % 5 === 0 ? 1.25 : 0.7, 0, Math.PI * 2);
        context.fillStyle = "rgba(45, 52, 44, 0.08)";
        context.fill();
      }
    }

    context.beginPath();
    context.moveTo(map.left + mapWidth * 0.12, map.top);
    context.lineTo(map.right - mapWidth * 0.1, map.bottom);
    context.lineWidth = compact ? 13 : 18;
    context.strokeStyle = rgba(river, 0.08);
    context.stroke();

    context.beginPath();
    context.moveTo(map.left + mapWidth * 0.12, map.top);
    context.lineTo(map.right - mapWidth * 0.1, map.bottom);
    context.setLineDash([4, 11]);
    context.lineDashOffset = time * 0.006;
    context.lineWidth = 1;
    context.strokeStyle = rgba(river, 0.48);
    context.stroke();
    context.setLineDash([]);

    map.lanes.forEach((lane, laneIndex) => {
      drawLane(lane, laneIndex, time, compact);
    });

    const objectiveX = map.left + mapWidth * 0.54;
    const objectiveY = map.top + mapHeight * 0.43;

    context.beginPath();
    context.ellipse(
      objectiveX,
      objectiveY,
      compact ? 13 : 19,
      compact ? 9 : 12,
      -0.5,
      0,
      Math.PI * 2
    );
    context.fillStyle = "rgba(141, 98, 50, 0.08)";
    context.fill();
    context.setLineDash([3, 5]);
    context.lineDashOffset = -time * 0.008;
    context.strokeStyle = "rgba(141, 98, 50, 0.48)";
    context.stroke();
    context.setLineDash([]);

    drawVision(
      map.left + mapWidth * 0.33,
      map.top + mapHeight * 0.54,
      radiant,
      time,
      0,
      compact
    );
    drawVision(
      map.left + mapWidth * 0.7,
      map.top + mapHeight * 0.35,
      dire,
      time,
      Math.PI,
      compact
    );

    drawDiamond(
      map.radiantBase.x,
      map.radiantBase.y,
      compact ? 18 : 26,
      radiant,
      0.16
    );
    drawDiamond(map.direBase.x, map.direBase.y, compact ? 18 : 26, dire, 0.16);

    if (!compact) {
      context.font = '700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      context.textBaseline = "middle";
      context.fillStyle = rgba(radiant, 0.82);
      context.textAlign = "right";
      context.fillText("RADIANT", map.radiantBase.x - 18, map.radiantBase.y);
      context.fillStyle = rgba(dire, 0.82);
      context.textAlign = "left";
      context.fillText("DIRE", map.direBase.x + 18, map.direBase.y);

      context.font = '600 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      context.fillStyle = "rgba(32, 37, 31, 0.42)";
      context.textAlign = "center";
      context.fillText("OBJECTIVE", objectiveX, objectiveY + 21);
      context.fillText(
        "RIVER / VISION BREAK",
        map.left + mapWidth * 0.42,
        map.top + mapHeight * 0.22
      );

      context.textAlign = "right";
      context.fillStyle = "rgba(32, 37, 31, 0.34)";
      context.fillText("STRATEGY MAP / REPLAY ENABLED", map.right, map.top - 20);
    }

    context.restore();
  };

  const animate = (time) => {
    drawMap(time);

    if (!motionQuery.matches && !document.hidden) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    window.cancelAnimationFrame(animationFrame);

    if (motionQuery.matches) {
      drawMap(0);
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
    drawMap(performance.now());
  };

  hero.addEventListener("pointermove", (event) => {
    if (motionQuery.matches) {
      return;
    }

    const bounds = hero.getBoundingClientRect();
    pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 9;
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
