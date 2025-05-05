import { isDev } from "../utils/isDev";

export default function DevOnly({ children }) {
  if (!isDev) return null;
  return <>{children}</>;
}
