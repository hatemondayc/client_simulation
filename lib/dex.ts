// 광고주 도감 — 만나본 페르소나를 localStorage에 기록.
// 4종을 모두 겪으면 히든 강도 '개싸가지 모드'가 해금된다.
import { PERSONA_KEYS, type PersonaKey } from "./personas";

const KEY = "possessed_personas";

function read(): PersonaKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as PersonaKey[]) : [];
  } catch {
    return [];
  }
}

function allSeen(set: Set<string>): boolean {
  return PERSONA_KEYS.every((k) => set.has(k));
}

/** 지금까지 만난 페르소나 수 (0~4) */
export function seenCount(): number {
  return new Set(read()).size;
}

/** 개싸가지 모드 해금 여부 */
export function isSavageUnlocked(): boolean {
  return allSeen(new Set(read()));
}

/**
 * 페르소나 1종 조우 기록. 이번 기록으로 4종이 완성돼 '방금 해금'됐는지 반환.
 */
export function recordPersona(p: PersonaKey): { justUnlocked: boolean } {
  const before = isSavageUnlocked();
  const arr = read();
  if (!arr.includes(p)) {
    arr.push(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch {
      /* 저장 실패 무시 */
    }
  }
  const after = allSeen(new Set(arr));
  return { justUnlocked: after && !before };
}
