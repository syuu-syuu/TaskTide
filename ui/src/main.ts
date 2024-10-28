import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue"
import App from "./App.vue"

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

import "@/static/global.css"
import "@/static/font/iconfont.css"

import draggable from "vuedraggable"
draggable.compatConfig = { MODE: 3 }

import Project from "@components/MainBoard/Project.vue"
import Home from "@components/MainBoard/Home.vue"
import Profile from "@/pages/Profile.vue"
import Dashboard from "@/pages/Dashboard.vue"
import Splash from "@/pages/Splash.vue"
// import DashboardTest from "@/pages/DashboardTest.vue"
// import HomeTest from "@components/MainBoard/HomeTest.vue"

const routes = [
  {
    path: "/home",
    component: Dashboard,
    children: [
      { path: "/home", component: Home },
      { path: "/project/:projectId", component: Project, props: true },
    ]
  },
  // {
  //   path: "/test",
  //   component: DashboardTest,
  //   children: [
  //     { path: "test", component: HomeTest },
  //     { path: "/project/:projectId", component: Project, props: true },
  //   ]
  // },
  { path: "/profile", component: Profile },
  { path: "/", component: Splash },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any)
  .use(router)
  .mount("#app")