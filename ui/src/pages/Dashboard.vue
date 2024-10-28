<template>
  <b-overlay no-center :show="!isLoggedIn" rounded="sm">
    <div class="d-flex flex-column">
      <div class="hamburger-menu" @click="toggleSidebar" v-show="isMobile">
        <svg>
          <use href="../static/icons.svg#icon-normal-project"></use>
        </svg>
      </div>
      <div class="home-page">
        <div :class="sidebarClass">
          <Sidebar />
        </div>

        <div class="mainboard">
          <router-view />
        </div>
      </div>
    </div>
  </b-overlay>
</template>

<script setup lang="ts">
import Sidebar from "@components/Sidebar/Sidebar.vue"
import { ref, onMounted, onUnmounted, computed } from "vue"
import { getUserInfo } from '@/data'
import { io } from "socket.io-client"
const socket = io({ transports: ["websocket"] })

socket.on('redirect', (destination) => {
  window.location.href = destination;
});


const user = ref(null);
const isLoggedIn = ref(false);

onMounted(async () => {
  try {
    user.value = await getUserInfo();
    isLoggedIn.value = true; 
  } catch (error) {
    isLoggedIn.value = false; 
  }
});

// Responsive Design
const screenWidth = ref(window.innerWidth);
const onResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

const isSidebarOpen = ref(false);
const isMobile = computed(() => screenWidth.value <= 1024);
function toggleSidebar() {
  if (isMobile.value) {
    isSidebarOpen.value = !isSidebarOpen.value;
  }
}

const sidebarClass = computed(() => {
  if (isMobile.value) {
    if (isSidebarOpen.value) {
      return "sidebar-container sidebar-mobile";
    } else {
      return "sidebar-container sidebar-mobile sidebar-hidden";
    }
  } else {
    return "sidebar-container sidebar-desktop";
  }
});
</script>

<style scope>
.home-page {
  display: flex;
  flex-direction: row;
}

.hamburger-menu {
  position: fixed;
  padding: 2em;
  z-index: 2000;
  cursor: pointer;
}

.hamburger-menu svg {
  width: 2.5em;
  height: 2.5em;
}

.sidebar-container {
  height: 100vh;
  background: #fff;
  border-radius: 1em;
  box-shadow: 0 0.25em 0.5em rgba(171, 190, 209, 0.4);
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  flex: 1;
}

.sidebar-desktop {
  padding: 2em 2em;
  position: sticky;
  top: 0;
}

.sidebar-mobile {
  padding: 3em 4em;
  position: absolute;
  top: 5.5em;
}

.sidebar-hidden {
  transform: translateX(-100%);
}

.mainboard {
  height: 100vh;
  overflow-y: auto;
  margin: 0 2em;
  border-radius: 1em;
  background: #fff;
  display: flex;
  justify-content: center;
  flex: 3.2;
}

.b-overlay {
  z-index: 5000;
  position: relative;
}

</style>
