import { createContext } from "react";

/**
 * The context object lives in its own module so AuthContext.jsx exports only a
 * component — otherwise React Fast Refresh cannot hot-reload the provider.
 *
 * Consume it through hooks/useAuth.js rather than importing it directly.
 */
export const AuthContext = createContext(null);
