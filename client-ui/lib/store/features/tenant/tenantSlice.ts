import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

// ── localStorage persistence ──────────────────────────────────────────────────
const TENANT_STORAGE_KEY = "selected_tenant_id";

export const loadTenantFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TENANT_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveTenantToStorage = (tenantId: string | null): void => {
  try {
    if (tenantId) {
      localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  } catch {
    // storage unavailable — silently ignore
  }
};

// ── State ────────────────────────────────────────────────────────────────────
interface TenantState {
  tenantId: string | null;
}

const initialState: TenantState = {
  tenantId: loadTenantFromStorage(),
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenantId(state, action: PayloadAction<string | null>) {
      state.tenantId = action.payload;
    },
  },
});

export const { setTenantId } = tenantSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectTenantId = (state: RootState) => state.tenant.tenantId;

export default tenantSlice.reducer;
