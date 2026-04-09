const root = document.documentElement;
const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navDrawer = document.getElementById("navDrawer");
const navBackdrop = document.querySelector(".nav-backdrop");
const yearEl = document.getElementById("year");
const drawerLinks = [...document.querySelectorAll(".drawer-nav a")];
const navLinks = [...document.querySelectorAll(".site-nav a, .drawer-nav a")];
const revealTargets = [...document.querySelectorAll(".reveal")];
const projectsShowcase = document.getElementById("projectsShowcase");
const projectsViewport = document.getElementById("projectsViewport");
const projectsTrack = document.getElementById("projectsTrack");
const projectsPrevButton = document.querySelector("[data-projects-prev]");
const projectsNextButton = document.querySelector("[data-projects-next]");
const projectsDots = [...document.querySelectorAll("[data-projects-dot]")];
const projectSlides = projectsTrack ? [...projectsTrack.querySelectorAll(".project-slide")] : [];
const customCursor = document.querySelector(".custom-cursor");
const faviconDynamicLink = document.getElementById("favicon-dynamic");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileNavQuery = window.matchMedia("(max-width: 899px)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const projectsCarouselQuery = window.matchMedia("(max-width: 767px)");
const cursorHoverSelector = "a, button, summary, input, select, textarea, [role='button'], .nav-backdrop";
const pagePreloader = document.getElementById("page-preloader");
const preloaderStartedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
const minPreloaderMs = prefersReducedMotion.matches ? 80 : 420;
let hasClosedPreloader = false;

const closePreloader = () => {
    if (hasClosedPreloader) {
        return;
    }

    hasClosedPreloader = true;
    body.classList.remove("is-loading");
    body.classList.add("is-loaded");

    if (!pagePreloader) {
        return;
    }

    pagePreloader.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
        pagePreloader.remove();
    }, prefersReducedMotion.matches ? 20 : 280);
};

const queuePreloaderClose = () => {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - preloaderStartedAt;
    const waitMs = Math.max(0, minPreloaderMs - elapsed);

    window.setTimeout(closePreloader, waitMs);
};

root.classList.add("js-enabled");

if (document.readyState === "complete") {
    queuePreloaderClose();
} else {
    window.addEventListener("load", queuePreloaderClose, { once: true });
}

window.setTimeout(queuePreloaderClose, 1600);

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const faviconBaseHref = faviconDynamicLink?.getAttribute("href") ?? "/favicon.svg?v=1";
const faviconBaseType = faviconDynamicLink?.getAttribute("type") ?? "image/svg+xml";
const faviconFrames = faviconDynamicLink
    ? [
        {
            href: "/assets/favicon/ds-frame-1.png?v=1",
            delay: 900,
            type: "image/png"
        },
        {
            href: "/assets/favicon/ds-frame-2.png?v=1",
            delay: 90,
            type: "image/png"
        },
        {
            href: "/assets/favicon/ds-frame-3.png?v=1",
            delay: 90,
            type: "image/png"
        },
        {
            href: "/assets/favicon/ds-frame-4.png?v=1",
            delay: 120,
            type: "image/png"
        }
    ]
    : [];

let faviconTimer = 0;
let faviconFrameIndex = 0;

const clearFaviconTimer = () => {
    if (faviconTimer) {
        window.clearTimeout(faviconTimer);
        faviconTimer = 0;
    }
};

const setFaviconHref = (href, type = faviconBaseType) => {
    if (!faviconDynamicLink) {
        return;
    }

    faviconDynamicLink.setAttribute("href", href);
    faviconDynamicLink.setAttribute("type", type);
};

const restoreBaseFavicon = () => {
    clearFaviconTimer();
    setFaviconHref(faviconBaseHref, faviconBaseType);
};

const shouldAnimateFavicon = () => Boolean(
    faviconDynamicLink
    && faviconFrames.length > 0
    && !prefersReducedMotion.matches
    && !document.hidden
);

const queueFaviconFrame = () => {
    if (!shouldAnimateFavicon()) {
        restoreBaseFavicon();
        return;
    }

    const frame = faviconFrames[faviconFrameIndex];
    setFaviconHref(frame.href, frame.type);

    faviconTimer = window.setTimeout(() => {
        faviconFrameIndex = (faviconFrameIndex + 1) % faviconFrames.length;
        queueFaviconFrame();
    }, frame.delay);
};

const syncFaviconAnimation = () => {
    clearFaviconTimer();
    faviconFrameIndex = 0;

    if (!shouldAnimateFavicon()) {
        restoreBaseFavicon();
        return;
    }

    queueFaviconFrame();
};

syncFaviconAnimation();

if (faviconFrames.length > 0) {
    faviconFrames.forEach(frame => {
        const image = new Image();
        image.src = frame.href;
    });
}

const positionCursor = (x, y) => {
    if (!customCursor) {
        return;
    }

    customCursor.style.setProperty("--cursor-x", `${x}px`);
    customCursor.style.setProperty("--cursor-y", `${y}px`);
};

const canUseCustomCursor = () => Boolean(customCursor && finePointerQuery.matches && !mobileNavQuery.matches);

const hideCustomCursor = () => {
    if (!customCursor) {
        return;
    }

    customCursor.classList.remove("is-visible", "is-hovering", "is-pressed");
};

const syncCursorHoverState = target => {
    if (!customCursor) {
        return;
    }

    customCursor.classList.toggle("is-hovering", Boolean(target && target.closest(cursorHoverSelector)));
};

const updateCursorAvailability = () => {
    const enabled = canUseCustomCursor();
    root.classList.toggle("custom-cursor-enabled", enabled);

    if (!enabled) {
        hideCustomCursor();
    }
};

updateCursorAvailability();

if (customCursor) {
    document.addEventListener("pointermove", event => {
        if (!canUseCustomCursor() || event.pointerType !== "mouse") {
            return;
        }

        customCursor.classList.add("is-visible");
        positionCursor(event.clientX, event.clientY);
        syncCursorHoverState(event.target);
    });

    document.addEventListener("pointerover", event => {
        if (!canUseCustomCursor() || event.pointerType !== "mouse") {
            return;
        }

        syncCursorHoverState(event.target);
    });

    document.addEventListener("pointerdown", event => {
        if (!canUseCustomCursor() || event.pointerType !== "mouse") {
            return;
        }

        syncCursorHoverState(event.target);
        customCursor.classList.add("is-pressed");
    });

    window.addEventListener("pointerup", () => {
        if (!customCursor) {
            return;
        }

        customCursor.classList.remove("is-pressed");
    });

    document.addEventListener("pointerout", event => {
        if (!canUseCustomCursor() || event.relatedTarget) {
            return;
        }

        hideCustomCursor();
    });

    window.addEventListener("blur", hideCustomCursor);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideCustomCursor();
        }
    });

    const handleCursorEnvironmentChange = () => {
        updateCursorAvailability();
    };

    if (typeof finePointerQuery.addEventListener === "function") {
        finePointerQuery.addEventListener("change", handleCursorEnvironmentChange);
        prefersReducedMotion.addEventListener("change", handleCursorEnvironmentChange);
    } else {
        finePointerQuery.addListener(handleCursorEnvironmentChange);
        prefersReducedMotion.addListener(handleCursorEnvironmentChange);
    }
}

document.addEventListener("visibilitychange", syncFaviconAnimation);

if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", syncFaviconAnimation);
} else {
    prefersReducedMotion.addListener(syncFaviconAnimation);
}

const setDrawerState = open => {
    if (!navToggle || !navDrawer || !navBackdrop) {
        return;
    }

    body.classList.toggle("nav-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    const label = navToggle.querySelector(".nav-toggle-text");
    if (label) {
        label.textContent = open ? "Close" : "Menu";
    }

    navDrawer.classList.toggle("is-open", open);
    navDrawer.setAttribute("aria-hidden", String(!open));
    navBackdrop.classList.toggle("is-visible", open);
};

if (navToggle && navDrawer && navBackdrop) {
    navToggle.addEventListener("click", () => {
        if (!mobileNavQuery.matches) {
            return;
        }

        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        setDrawerState(!isOpen);

        if (!isOpen) {
            const firstLink = drawerLinks[0];
            if (firstLink) {
                firstLink.focus();
            }
        }
    });

    navBackdrop.addEventListener("click", () => {
        setDrawerState(false);
        navToggle.focus();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
            setDrawerState(false);
            navToggle.focus();
        }
    });

    const handleViewportChange = event => {
        if (!event.matches) {
            setDrawerState(false);
        }

        updateCursorAvailability();
    };

    if (typeof mobileNavQuery.addEventListener === "function") {
        mobileNavQuery.addEventListener("change", handleViewportChange);
    } else {
        mobileNavQuery.addListener(handleViewportChange);
    }
}

let activeProjectIndex = 0;
let projectsTouchStartX = 0;
let projectsTouchEndX = 0;

const canUseProjectsCarousel = () => Boolean(
    projectsShowcase
    && projectsViewport
    && projectsTrack
    && projectSlides.length > 0
    && projectsCarouselQuery.matches
);

const syncProjectsDots = () => {
    projectsDots.forEach((dot, index) => {
        const isActive = index === activeProjectIndex;
        dot.classList.toggle("is-active", isActive);

        if (isActive) {
            dot.setAttribute("aria-current", "true");
        } else {
            dot.removeAttribute("aria-current");
        }
    });
};

const syncProjectsCarousel = () => {
    if (!projectsShowcase || !projectsTrack || projectSlides.length === 0) {
        return;
    }

    const maxIndex = projectSlides.length - 1;
    activeProjectIndex = Math.min(Math.max(activeProjectIndex, 0), maxIndex);

    const carouselEnabled = canUseProjectsCarousel();
    projectsShowcase.classList.toggle("is-carousel-active", carouselEnabled);

    if (!carouselEnabled) {
        projectsTrack.style.removeProperty("transform");
        if (projectsPrevButton) {
            projectsPrevButton.disabled = false;
        }

        if (projectsNextButton) {
            projectsNextButton.disabled = false;
        }

        syncProjectsDots();
        return;
    }

    const slideOffset = activeProjectIndex * projectsViewport.clientWidth;
    projectsTrack.style.transform = `translate3d(${-slideOffset}px, 0, 0)`;

    if (projectsPrevButton) {
        projectsPrevButton.disabled = activeProjectIndex === 0;
    }

    if (projectsNextButton) {
        projectsNextButton.disabled = activeProjectIndex === maxIndex;
    }

    syncProjectsDots();
};

const setActiveProject = nextIndex => {
    if (projectSlides.length === 0) {
        return;
    }

    const maxIndex = projectSlides.length - 1;
    activeProjectIndex = Math.min(Math.max(nextIndex, 0), maxIndex);
    syncProjectsCarousel();
};

if (projectsShowcase && projectsTrack && projectSlides.length > 0) {
    if (projectsPrevButton) {
        projectsPrevButton.addEventListener("click", () => {
            setActiveProject(activeProjectIndex - 1);
        });
    }

    if (projectsNextButton) {
        projectsNextButton.addEventListener("click", () => {
            setActiveProject(activeProjectIndex + 1);
        });
    }

    projectsDots.forEach(dot => {
        dot.addEventListener("click", () => {
            const slideIndex = Number(dot.getAttribute("data-projects-dot"));
            if (Number.isNaN(slideIndex)) {
                return;
            }

            setActiveProject(slideIndex);
        });
    });

    if (projectsViewport) {
        projectsViewport.addEventListener(
            "touchstart",
            event => {
                if (!canUseProjectsCarousel()) {
                    return;
                }

                const touch = event.changedTouches[0];
                projectsTouchStartX = touch.clientX;
                projectsTouchEndX = touch.clientX;
            },
            { passive: true }
        );

        projectsViewport.addEventListener(
            "touchmove",
            event => {
                if (!canUseProjectsCarousel()) {
                    return;
                }

                const touch = event.changedTouches[0];
                projectsTouchEndX = touch.clientX;
            },
            { passive: true }
        );

        projectsViewport.addEventListener(
            "touchend",
            () => {
                if (!canUseProjectsCarousel()) {
                    return;
                }

                const swipeDistance = projectsTouchEndX - projectsTouchStartX;
                if (Math.abs(swipeDistance) < 48) {
                    return;
                }

                if (swipeDistance < 0) {
                    setActiveProject(activeProjectIndex + 1);
                } else {
                    setActiveProject(activeProjectIndex - 1);
                }
            },
            { passive: true }
        );
    }

    const handleProjectsViewportChange = () => {
        syncProjectsCarousel();
    };

    if (typeof projectsCarouselQuery.addEventListener === "function") {
        projectsCarouselQuery.addEventListener("change", handleProjectsViewportChange);
    } else {
        projectsCarouselQuery.addListener(handleProjectsViewportChange);
    }

    window.addEventListener("resize", syncProjectsCarousel);
    syncProjectsCarousel();
}

const syncActiveNav = activeId => {
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        const normalizedHref = href?.startsWith("/#") ? href.slice(1) : href;
        const isMatch = normalizedHref === `#${activeId}`;
        link.classList.toggle("is-active", isMatch);

        if (isMatch) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const sectionCandidates = [document.getElementById("top"), ...document.querySelectorAll("main section[id]")]
    .filter(Boolean);

const observedSections = sectionCandidates
    .filter(section => navLinks.some(link => {
        const href = link.getAttribute("href");
        const normalizedHref = href?.startsWith("/#") ? href.slice(1) : href;
        return normalizedHref === `#${section.id}`;
    }));

const canAnimate = "IntersectionObserver" in window && !prefersReducedMotion.matches;

const getReferenceY = () => {
    const header = document.querySelector(".site-header");
    const headerBottom = header ? Math.max(header.getBoundingClientRect().bottom, 0) : 0;
    return Math.max(headerBottom + 28, window.innerHeight * 0.35);
};

const updateActiveSection = () => {
    if (observedSections.length === 0) {
        return;
    }

    const lastSection = observedSections[observedSections.length - 1];
    const distanceFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (lastSection && distanceFromBottom <= 32) {
        syncActiveNav(lastSection.id);
        return;
    }

    const referenceY = getReferenceY();
    let activeSection = observedSections[0];

    observedSections.forEach(section => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= referenceY) {
            activeSection = section;
        }

        if (rect.top <= referenceY && rect.bottom > referenceY) {
            activeSection = section;
        }
    });

    syncActiveNav(activeSection.id);
};

let isTicking = false;
const requestActiveSectionUpdate = () => {
    if (isTicking) {
        return;
    }

    isTicking = true;
    window.requestAnimationFrame(() => {
        updateActiveSection();
        isTicking = false;
    });
};

const hashLinks = [...document.querySelectorAll("a[href^='#']")];

const scrollToHashTarget = hash => {
    const targetId = hash.slice(1).trim();
    if (!targetId) {
        return false;
    }

    const target = document.getElementById(targetId);
    if (!target) {
        return false;
    }

    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
    target.scrollIntoView({
        behavior,
        block: "start"
    });

    if (location.hash !== hash) {
        if (typeof history.pushState === "function") {
            history.pushState(null, "", hash);
        } else {
            location.hash = hash;
        }
    }

    window.setTimeout(requestActiveSectionUpdate, prefersReducedMotion.matches ? 0 : 220);
    return true;
};

hashLinks.forEach(link => {
    link.addEventListener("click", event => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") {
            return;
        }

        const isDrawerLink = Boolean(link.closest(".drawer-nav"));
        if (isDrawerLink) {
            const targetId = hash.slice(1).trim();
            if (!targetId || !document.getElementById(targetId)) {
                return;
            }

            event.preventDefault();
            setDrawerState(false);
            window.setTimeout(() => {
                scrollToHashTarget(hash);
            }, 60);
            return;
        }

        if (!scrollToHashTarget(hash)) {
            return;
        }

        event.preventDefault();
    });
});

if (canAnimate) {
    root.classList.add("motion-safe");

    revealTargets.forEach(target => {
        const parent = target.parentElement;
        if (!parent) {
            return;
        }

        const siblings = [...parent.children].filter(child => child.classList.contains("reveal"));
        const index = siblings.indexOf(target);
        if (index >= 0) {
            target.style.transitionDelay = `${index * 70}ms`;
        }
    });

    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16
        }
    );

    revealTargets.forEach(target => revealObserver.observe(target));
} else {
    revealTargets.forEach(target => target.classList.add("is-visible"));
}

updateActiveSection();
window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
window.addEventListener("resize", requestActiveSectionUpdate);
