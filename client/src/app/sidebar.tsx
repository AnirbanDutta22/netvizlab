import { NavLink } from "react-router-dom";
import { Activity, Route as RouteIcon, Search, Radio } from "lucide-react";

const NAV_ITEMS = [
  { to: "/ping", label: "Ping", icon: Activity },
  { to: "/traceroute", label: "Traceroute", icon: RouteIcon },
  { to: "/dns", label: "DNS Lookup", icon: Search },
];

export const Sidebar = () => (
  <nav className="flex h-full flex-col border-r border-bg-hairline bg-bg-panel">
    <div className="flex items-center gap-2 border-b border-bg-hairline px-4 py-4">
      <Radio className="h-5 w-5 text-signal" strokeWidth={2.25} />
      <span className="font-display text-[15px] font-semibold tracking-tight">
        NetVizLab
      </span>
    </div>
    <ul className="flex-1 space-y-1 px-2 py-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-signal/10 text-signal"
                  : "text-ink-muted hover:bg-bg-raised hover:text-ink"
              }`
            }
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
    <div className="border-t border-bg-hairline px-4 py-3">
      <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
        Extensible by design — new commands plug in without touching existing
        features.
      </p>
    </div>
  </nav>
);
