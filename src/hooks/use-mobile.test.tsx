import { act, render, screen } from "@testing-library/react";

import { useIsMobile } from "@/hooks/use-mobile";

type MockMql = {
  readonly media: string;
  onchange: ((event: MediaQueryListEvent) => void) | null;
  addEventListener: (_type: "change", listener: () => void) => void;
  removeEventListener: (_type: "change", listener: () => void) => void;
  addListener: (_listener: () => void) => void;
  removeListener: (_listener: () => void) => void;
  dispatchEvent: (_event: Event) => boolean;
  readonly matches: boolean;
  _emit: () => void;
};

const mediaQueries: MockMql[] = [];

const evaluateClause = (clause: string, coarsePointer: boolean) => {
  const maxWidthMatch = clause.match(/\(max-width:\s*(\d+)px\)/);
  if (maxWidthMatch) {
    return window.innerWidth <= Number(maxWidthMatch[1]);
  }

  const maxHeightMatch = clause.match(/\(max-height:\s*(\d+)px\)/);
  if (maxHeightMatch) {
    return window.innerHeight <= Number(maxHeightMatch[1]);
  }

  if (clause.includes("(pointer: coarse)")) {
    return coarsePointer;
  }

  return false;
};

const evaluateQuery = (query: string, coarsePointer: boolean) => {
  const branches = query.split(",").map((branch) => branch.trim());
  return branches.some((branch) =>
    branch
      .split("and")
      .map((clause) => clause.trim())
      .every((clause) => evaluateClause(clause, coarsePointer)),
  );
};

const installMatchMediaMock = (coarsePointer: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => {
      const listeners = new Set<() => void>();
      const mql: MockMql = {
        get matches() {
          return evaluateQuery(query, coarsePointer);
        },
        media: query,
        onchange: null,
        addEventListener: (_type, listener) => {
          listeners.add(listener);
        },
        removeEventListener: (_type, listener) => {
          listeners.delete(listener);
        },
        addListener: (listener) => {
          listeners.add(listener);
        },
        removeListener: (listener) => {
          listeners.delete(listener);
        },
        dispatchEvent: () => true,
        _emit: () => {
          listeners.forEach((listener) => listener());
          if (mql.onchange) {
            mql.onchange({ matches: mql.matches } as MediaQueryListEvent);
          }
        },
      };
      mediaQueries.push(mql);
      return mql;
    },
  });
};

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: height });
};

const emitMediaChange = () => {
  mediaQueries.forEach((mql) => mql._emit());
};

const Probe = () => {
  const isMobile = useIsMobile();
  return <div data-testid="is-mobile">{String(isMobile)}</div>;
};

describe("useIsMobile responsive matrix", () => {
  beforeEach(() => {
    mediaQueries.splice(0, mediaQueries.length);
  });

  it("detects mobile widths under 768", () => {
    setViewport(390, 844);
    installMatchMediaMock(true);

    render(<Probe />);
    expect(screen.getByTestId("is-mobile").textContent).toBe("true");
  });

  it("keeps 768px+ in non-mobile mode when height is normal", () => {
    setViewport(768, 1024);
    installMatchMediaMock(true);

    render(<Probe />);
    expect(screen.getByTestId("is-mobile").textContent).toBe("false");
  });

  it("treats coarse-pointer landscape with low height as mobile", () => {
    setViewport(844, 390);
    installMatchMediaMock(true);

    render(<Probe />);
    expect(screen.getByTestId("is-mobile").textContent).toBe("true");
  });

  it("does not force mobile for non-coarse pointer at low height", () => {
    setViewport(844, 390);
    installMatchMediaMock(false);

    render(<Probe />);
    expect(screen.getByTestId("is-mobile").textContent).toBe("false");
  });

  it("reacts to viewport changes in the responsive matrix", () => {
    setViewport(768, 1024);
    installMatchMediaMock(true);

    render(<Probe />);
    expect(screen.getByTestId("is-mobile").textContent).toBe("false");

    act(() => {
      setViewport(767, 900);
      emitMediaChange();
    });
    expect(screen.getByTestId("is-mobile").textContent).toBe("true");

    act(() => {
      setViewport(844, 700);
      emitMediaChange();
    });
    expect(screen.getByTestId("is-mobile").textContent).toBe("false");

    act(() => {
      setViewport(915, 412);
      emitMediaChange();
    });
    expect(screen.getByTestId("is-mobile").textContent).toBe("true");
  });
});
