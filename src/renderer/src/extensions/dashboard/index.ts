import { mdiViewDashboardOutline } from "@mdi/js";

import type {
  IDashletOptions,
  IExtensionContext,
  PropsCallback,
} from "../../types/IExtensionContext";
import settingsReducer from "./reducer";
import type { IDashletProps } from "./types/IDashletProps";
import Dashboard from "./views/Dashboard";
import Settings from "./views/Settings";

const dashlets: IDashletProps[] = [];

function registerDashlet(
  title: string,
  width: 1 | 2 | 3,
  height: 1 | 2 | 3 | 4 | 5,
  position: number,
  component: React.ComponentClass<any>,
  isVisible: (state) => boolean,
  props: PropsCallback,
  options: IDashletOptions,
) {
  const fixed = options !== undefined ? options.fixed || false : false;
  const closable = options !== undefined ? options.closable : true;
  dashlets.push({
    title,
    position,
    width,
    height,
    component,
    isVisible,
    props,
    fixed,
    closable,
  });
}

function init(context: IExtensionContext): boolean {
  context.registerReducer(["settings", "interface"], settingsReducer);
  // Vortex Unlocked: the Dashboard tab can be fully hidden from
  // Settings -> Interface ("Hide Dashboard tab").
  context.registerMainPage("dashboard", "Dashboard", Dashboard, {
    priority: 1,
    hotkey: "1",
    group: "dashboard",
    props: () => ({ dashlets }),
    mdi: mdiViewDashboardOutline,
    visible: () => {
      const state = context.api.store.getState();
      return !(state as any)?.settings?.interface?.hideDashboard;
    },
  });

  context.registerSettings("Interface", Settings, () => ({ dashlets }), undefined, 1000);

  context.registerDashlet = registerDashlet;

  return true;
}

export default init;
