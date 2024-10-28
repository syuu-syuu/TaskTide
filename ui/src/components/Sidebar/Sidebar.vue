<template>
  <div class="siderbar-content">
    <!-- User Profile -->
    <router-link class="user-profile" :to="`/profile`" v-if="user">
      <img :src="user.picture" class="profile-img" />
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-mail">{{ user.email }}</div>
        <div v-if="user?.role === 'advanced'" class="text-warning"> Premium User </div>
        <div v-else class="text-muted">Basic User</div>
      </div>
    </router-link>

    <!-- Navigation Menu -->
    <div class="navigation">
      <!-- Basic Menu - Home, Notification, Tide Clock -->
      <div class="basic-menu">
        <router-link class="basic-item" v-for="item in menuItems" :key="item.icon" :to="item.to">
          <SvgIcon class="basic-icon" :name="item.icon" />
          <div class="nav-text">{{ item.text }}</div>
        </router-link>
      </div>

      <!-- Space Menu -->
      <div class="space-menu">
        <div class="space-item">
          <!-- Private Space -->
          <div class="space-item-head">
            <SvgIcon class="space-icon" :name="`icon-bookmark`" />
            <div class="space-head-group">
              <div class="space-head">
                <div class="space-name">PRIVATE</div>
                <button class="add-button" @click="createNewProject('Private')" id="addPrivateProjectButton">+</button>
              </div>
              <div class="line"></div>
            </div>
          </div>
          <div class="projects">
            <div v-for="project in quickProject" :key="project._id">
              <router-link class="project" :to="`/project/${project._id}`">
                <SvgIcon class="project-icon" :name="`icon-menu1`" />
                <div class="project-title">{{ project.title }}</div>
              </router-link>
            </div>
            <div v-for="project in privateProjects" :key="project._id">
              <router-link class="project" :to="`/project/${project._id}`">
                <SvgIcon class="project-icon" :name="`icon-menu2`" />
                <div class="project-title">{{ project.title }}</div>
              </router-link>
            </div>
            <div class="project" v-if="isCreatingPrivateProj">
              <SvgIcon class="project-icon" :name="`icon-menu2`" />
              <b-form-textarea v-model="editableTitle" @blur="submit('Private')"
                @keydown.enter="submit('Private', $event)" class="project-title-input" ref="inputRef"
                id="newPrivProjectTitle">
              </b-form-textarea>
            </div>
          </div>
        </div>

        <!-- <b-button class="space-item" v-show="user._id !== 'sample_id'">Login and Join Task Tide</b-button> -->
      </div>

      <!-- Shared Space -->
      <div class="space-item">
        <div class="space-item-head">
          <SvgIcon class="space-icon" :name="`icon-bookmark`" />
          <div class="space-head-group">
            <div class="space-head">
              <div class="space-name">SHARED</div>
              <button v-show="user?.role==='advanced'" class="add-button" @click="createNewProject('Shared')">+</button>
              <b-button class="upgrade-button" @click="levelup" v-show="user?.role==='basic'"> Upgrade Account
              </b-button>
            </div>
            <div class=" line">
            </div>
          </div>
        </div>
        <div class="projects">
          <div v-for="project in sharedProjects" :key="project._id">
            <div class="project">
              <router-link class="project" :to="`/project/${project._id}`">
                <SvgIcon class="project-icon" :name="`icon-menu2`" />
                <div class="project-title">{{ project.title }}</div>
              </router-link>
            </div>
          </div>

          <div class="project" v-if="isCreatingSharedProj">
            <SvgIcon class="project-icon" :name="`icon-menu2`" />
            <b-form-textarea v-model="editableTitle" @blur="submit('Shared')" @keydown.enter="submit('Shared', $event)"
              class="project-title-input" ref="inputRef" id="newSharProjectTitle"></b-form-textarea>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from "@components/SvgIcon.vue";
import { ref, Ref, onMounted, nextTick } from "vue";
import { Project, menuItems, getUserInfo, getProjects } from "@/data";
import { io } from "socket.io-client";
import {useAuthStore} from "@/store/auth";

const socket = io({ transports: ["websocket"] })
const emit = defineEmits(['updated'])

// const defaultUser: User = {
//   _id: 'sample_id',
//   email: 'knowsnothing@duke.edu',
//   name: 'Jon Snow',
//   picture: 'https://img.freepik.com/premium-photo/jon-snow-game-thrones-cartoon-character-generative-ai_934475-8645.jpg?w=740',
//   role: 'basic'
// };
const { user } = useAuthStore();
// const user: Ref<User> = ref(defaultUser);
const newProject: Ref<Project> = ref() as Ref<Project>;
const editableTitle = ref("");
const inputRef: Ref<HTMLInputElement | HTMLTextAreaElement | null> = ref(null);
const isCreatingPrivateProj = ref(false);
const isCreatingSharedProj = ref(false);

const privateProjects: Ref<Project[]> = ref([]);
const sharedProjects: Ref<Project[]> = ref([]);
const quickProject: Ref<Project[]> = ref([]);

async function refresh(){
  user.value = await getUserInfo();
  quickProject.value = await getProjects("Quick")
  privateProjects.value = await getProjects("Private")
  sharedProjects.value = await getProjects("Shared")
}
onMounted( async()=> await refresh());

function createNewProject(type: "Private" | "Shared") {
  newProject.value = {
    title: "", 
    ownerId: user.value?._id || '', 
    members:[{id:user.value?._id || '', name: user.value?.name || ''}],
    isStarred: false, 
    type: type };
  isCreatingPrivateProj.value = type === "Private";
  isCreatingSharedProj.value = type === "Shared";
  nextTick(() => {
    inputRef.value?.focus();
  });
}

async function submit(type: "Private" | "Shared", event?: KeyboardEvent) {
  if (event && event.key === "Enter") {
    event.preventDefault();
  }
  let isCreating = type === "Private" ? isCreatingPrivateProj : isCreatingSharedProj;
  // Prevents adding projects with empty or whitespace-only titles.
  if (editableTitle.value.trim().length) {
    console.log("Going to create a project named", editableTitle.value);
    newProject.value.title = editableTitle.value;

    socket.emit('submit-project', newProject.value)
    // await upsertProject(newProject.value)
    console.log("🎉 Successfully update project data")
    if (type === 'Private') {
      privateProjects.value = await getProjects('Private')
    } else {
      sharedProjects.value = await getProjects('Shared')
    }
  }
  // Reset the title input
  editableTitle.value = "";
  // Set the creation state to false based on the project type
  isCreating.value = false;
  emit('updated')
}

async function levelup() {
  await fetch('/api/gitlab/levelup', {
    method: 'POST'
  })
  window.location.reload()
}

</script>


<style scoped lang="scss">
.sidebar-content {
  @include flex-col-center;
  overflow-y: auto;
  overflow-wrap: break-word;
}

.user-profile {
  @include flex-row-center;
  flex-wrap: wrap;
  padding: 2em 1.3em;
  gap: 1.5em;

  .profile-img {
    border-radius: 50%;
    cursor: pointer;
    width: 5em;
    height: 5em;
  }

  .user-info {
    @include flex-col-center;
    align-items: flex-start;
    gap: 0.2em;

    .user-name {
      font-size: 1.2em;
      cursor: pointer;
    }

    .user-mail {
      color: #777;
    }
  }
}

.navigation {
  padding: 1em 1em;

  .basic-menu {
    margin-bottom: 2.5em;
    cursor: pointer;

    .basic-item {
      @include flex-row-center;
      margin-bottom: 0.7em;

      .basic-icon {
        width: 2em;
        height: 2em;
        margin-right: 0.3em;
        flex-shrink: 0;
      }

      .nav-text {
        padding: 0.5em 0.1em;
      }
    }
  }

  .space-item {
    margin-bottom: 3.75em;

    &-head {
      @include flex-row-center;
      margin-bottom: 0.3em;

      .space-icon {
        width: 1.8em;
        height: 2em;
        margin-right: 0.3em;
        flex-shrink: 0;
        transform: translateY(-10%);
      }

      .space-head-group {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        margin-bottom: 0.625em;
        transform: translateY(10%);

        .space-head {
          display: flex;
          justify-content: space-between;
          flex-grow: 1;
        }

        .line {
          flex-grow: 1;
          background: #abbed1;
          height: 0.0625em;
        }
      }
    }

    .add-button,
    .upgrade-button {
      transform: translateY(-20%);
      box-shadow: 0px 0.8px 1.5px 0px rgba(0, 0, 0, 0.1),
        0px 6px 12px 0px rgba(0, 0, 0, 0.2);
      background-color: #6200e8;
      color: #ffffff;
      border: none;
      border-radius: 50%;
      width: 1.5em;
      height: 1.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 1em;

      &.add-button {
        background-color: #6200e8; 
      }
    }

    .projects {
      @include flex-col-center;
      gap: 1em;
      padding: 0.5em 2.4em;

      .project {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
        cursor: pointer;

        .project-icon {
          width: 1.2em;
          height: 1.2em;
          margin-right: 0.3em;
          flex-shrink: 0;
          transform: translateY(8%);
        }

        .project-title {
          word-break: break-word;
          white-space: pre-line;
          overflow-wrap: break-word;
        }

        .project-title-input {
          width: 100%;
        }
      }
    }
  }
}
</style>