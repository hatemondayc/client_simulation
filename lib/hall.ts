import { supabase } from "./supabase";
import { SEED_FEED } from "./seed-content";
import type { PersonaKey } from "./personas";

export interface HallRow {
  id: string;
  created_at: string;
  persona: PersonaKey;
  attack_text: string;
  input_summary: string | null;
  likes: number;
}

export type HallSort = "recent" | "likes";

function seedRows(): HallRow[] {
  // Supabase 미설정 시 피드가 비어보이지 않게 하는 폴백. 고정 id로 렌더 안정.
  return SEED_FEED.map((c, i) => ({
    id: `seed-${i}`,
    created_at: new Date(0).toISOString(),
    persona: c.persona,
    attack_text: c.attack_text,
    input_summary: c.input_summary,
    likes: c.likes,
  }));
}

export async function fetchHall(
  sort: HallSort,
): Promise<{ rows: HallRow[]; live: boolean }> {
  if (!supabase) return { rows: seedRows(), live: false };
  const column = sort === "likes" ? "likes" : "created_at";
  const { data, error } = await supabase
    .from("hall_of_fame")
    .select("*")
    .order(column, { ascending: false })
    .limit(100);
  if (error || !data) return { rows: seedRows(), live: false };
  return { rows: data as HallRow[], live: true };
}

export async function fetchCard(id: string): Promise<HallRow | null> {
  if (id.startsWith("seed-")) {
    return seedRows().find((r) => r.id === id) ?? null;
  }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("hall_of_fame")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as HallRow;
}

/**
 * 공격을 명예의전당에 박제. Supabase 미설정 시 null(로컬 데모: UI는 성공 처리).
 */
export async function enshrineAttack(row: {
  persona: PersonaKey;
  attack_text: string;
  input_summary: string;
}): Promise<HallRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("hall_of_fame")
    .insert({
      persona: row.persona,
      attack_text: row.attack_text.slice(0, 400),
      input_summary: row.input_summary.slice(0, 120),
      likes: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as HallRow;
}

export async function likeCard(id: string): Promise<boolean> {
  if (!supabase || id.startsWith("seed-")) return true; // 로컬/시드는 낙관적 처리
  const { error } = await supabase.rpc("increment_like", { p_id: id });
  return !error;
}
