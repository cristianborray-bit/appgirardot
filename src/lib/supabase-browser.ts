"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/lib/supabase-public";

export function createBrowserAuthClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
