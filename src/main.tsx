import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  RouterProvider,
  Link,
} from "@tanstack/react-router";
import { App } from "./App";
import { Tasks } from "./pages/Tasks";
import { Milestones, MilestoneDetail } from "./pages/Milestones";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { StoreProvider } from "./store";
import { UIProvider } from "./ui";
import "./styles.css";
const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: () => (
    <p>
      Страница не найдена. <Link to="/">Вернуться к задачам</Link>
    </p>
  ),
});
const tasks = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Tasks,
});
const milestones = createRoute({
  getParentRoute: () => rootRoute,
  path: "/milestones",
  component: Milestones,
});
const detail = createRoute({
  getParentRoute: () => rootRoute,
  path: "/milestones/$id",
  component: MilestoneDetail,
});
const profile = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});
const settings = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});
const router = createRouter({
  routeTree: rootRoute.addChildren([
    tasks,
    milestones,
    detail,
    profile,
    settings,
  ]),
  history: createHashHistory(),
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <UIProvider>
        <RouterProvider router={router} />
      </UIProvider>
    </StoreProvider>
  </StrictMode>,
);
