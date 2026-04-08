const root = document.documentElement;
const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navDrawer = document.getElementById("navDrawer");
const navBackdrop = document.querySelector(".nav-backdrop");
const yearEl = document.getElementById("year");
const brandMark = document.querySelector(".brand-mark");
const drawerLinks = [...document.querySelectorAll(".drawer-nav a")];
const navLinks = [...document.querySelectorAll(".site-nav a, .drawer-nav a")];
const revealTargets = [...document.querySelectorAll(".reveal")];
const projectCards = [...document.querySelectorAll(".project-card")];
const customCursor = document.querySelector(".custom-cursor");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileNavQuery = window.matchMedia("(max-width: 899px)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const cursorHoverSelector = "a, button, summary, input, select, textarea, [role='button'], .nav-backdrop";

root.classList.add("js-enabled");

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

if (brandMark) {
    brandMark.addEventListener("click", event => {
        event.preventDefault();
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

    drawerLinks.forEach(link => {
        link.addEventListener("click", () => {
            setDrawerState(false);
        });
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

const syncActiveNav = activeId => {
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        const isMatch = href === `#${activeId}`;
        link.classList.toggle("is-active", isMatch);

        if (isMatch) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const observedSections = [...document.querySelectorAll("main section[id]")]
    .filter(section => navLinks.some(link => link.getAttribute("href") === `#${section.id}`));

const canAnimate = "IntersectionObserver" in window && !prefersReducedMotion.matches;

const getReferenceY = () => {
    const header = document.querySelector(".site-header");
    const headerBottom = header ? Math.max(header.getBoundingClientRect().bottom, 0) : 0;
    const topSafeZone = headerBottom + 28;
    return Math.min(window.innerHeight * 0.35, topSafeZone);
};

const updateActiveSection = () => {
    if (observedSections.length === 0) {
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

projectCards.forEach(card => {
    card.addEventListener("toggle", () => {
        if (!card.open) {
            return;
        }

        projectCards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.open = false;
            }
        });

        const behavior = prefersReducedMotion.matches ? "auto" : "smooth";

        if (window.innerWidth < 1024) {
            window.setTimeout(() => {
                card.scrollIntoView({
                    behavior,
                    block: "nearest"
                });
                requestActiveSectionUpdate();
            }, 120);
        } else {
            requestActiveSectionUpdate();
        }
    });
});
