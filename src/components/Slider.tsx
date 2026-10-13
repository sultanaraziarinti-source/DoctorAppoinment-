import { ReactNode, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";

interface Props {
  children: ReactNode;
  gap: number;
  /** When this changes (e.g. another day is picked), the row jumps to `focusX` (pixels from the start). */
  resetKey?: string;
  focusX?: number;
}

// Website: a sideways row you can slide with the ‹ › arrows, by dragging with the mouse, or with a trackpad.
export default function Slider({ children, gap, resetKey, focusX = 0 }: Props) {
  const ref = useRef<ScrollView>(null);
  const box = useRef<View>(null);
  const [x, setX] = useState(0);
  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const max = Math.max(0, contentW - viewW);

  const go = (to: number, animated = true) => ref.current?.scrollTo({ x: Math.max(0, Math.min(to, max)), animated });

  // New day picked: start near its first free slot
  useEffect(() => { go(focusX, false); }, [resetKey, max]); // eslint-disable-line react-hooks/exhaustive-deps

  // Web: drag with the mouse to slide. A drag doesn't count as a click on a slot.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el = box.current as unknown as HTMLElement | null;
    if (!el) return;
    let down = false, moved = false, startX = 0, startLeft = 0, row: HTMLElement | null = null;
    const findRow = () => (Array.from(el.querySelectorAll("div")) as HTMLElement[]).find(d => getComputedStyle(d).overflowX === "auto" || getComputedStyle(d).overflowX === "scroll") ?? null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      row = findRow();
      if (!row || !row.contains(e.target as Node)) return;
      down = true; moved = false; startX = e.clientX; startLeft = row.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || !row) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      if (moved) { row.scrollLeft = startLeft - dx; el.style.cursor = "grabbing"; }
    };
    const onUp = () => { down = false; el.style.cursor = ""; };
    const onClick = (e: MouseEvent) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setX(e.nativeEvent.contentOffset.x);
  const onLayout = (e: LayoutChangeEvent) => setViewW(e.nativeEvent.layout.width);

  return (
    <View ref={box} style={s.wrap}>
      <Arrow dir={-1} disabled={x <= 1} onPress={() => go(x - viewW * 0.8)} />
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} style={[{ flex: 1 }, Platform.OS === "web" && ({ cursor: "grab" } as object)]}
        contentContainerStyle={{ gap, paddingVertical: 2 }}
        scrollEventThrottle={16} onScroll={onScroll} onLayout={onLayout} onContentSizeChange={w => setContentW(w)}>
        {children}
      </ScrollView>
      <Arrow dir={1} disabled={x >= max - 1} onPress={() => go(x + viewW * 0.8)} />
    </View>
  );
}

function Arrow({ dir, disabled, onPress }: { dir: 1 | -1; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      accessibilityLabel={dir < 0 ? "Previous" : "Next"}
      style={({ pressed }) => [s.arrow, disabled && s.arrowOff, pressed && { backgroundColor: C.blueDk }]}>
      <Text style={s.arrowText}>{dir < 0 ? "‹" : "›"}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  arrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  arrowOff: { backgroundColor: C.border },
  arrowText: { color: "#fff", fontSize: 30, fontWeight: "700", lineHeight: 32, marginTop: -4 },
});
