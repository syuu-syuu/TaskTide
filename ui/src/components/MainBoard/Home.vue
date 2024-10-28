<template>
  <div class="mainboard-content">
    <div class="quick-tasks">
      <div class="quick-tasks-head">
        <div class="line"></div>
        <SvgIcon :name="`icon-double-check`" class="quick-tasks-icon" />
        <div class="quick-tasks-title">Quick Tasks</div>
        <div class="line"></div>
      </div>
      <TaskList @updated="handleUpdate()"/>
    </div>

    <ControlBar />

    <draggable v-model="detailedProjects" @end="updateOrder" class="project-cards">
        <template #item="{ element, index }">
          <Card :key="element._id" :project="element" :cardIndex="index" />
        </template>
    </draggable>
    </div>
</template>

<script setup lang="ts">
import Card from "@components/Card/Card.vue";
import TaskList from "@components/TaskList/TaskList.vue";
import ControlBar from '@components/MainBoard/ControlBar.vue'
import draggable from 'vuedraggable'
import {Task, Project, DragEvent, getProjects, getQuickTasks} from "@/data";
import { ref, Ref, onMounted, provide } from "vue";
import { io } from "socket.io-client"
const socket = io({ transports: ["websocket"] })

const allProjects: Ref<Project[]> = ref([]);
const detailedProjects: Ref<Project[]> = ref([]);
const quickProject: Ref<Project> = ref({
  title: "Default Project",
  ownerId: "Jon Snow",
  isStarred: false,
  type: "Private",
})
const quickTasks: Ref<Task[]> = ref([]);

provide('currentProject', quickProject)
provide('projectTasks', quickTasks)

onMounted ( async() => {
  await refresh()
})

// socket.on('redirect', function (destination) {
//   window.location.href = destination;
// });


socket.on('project-submitted', async (success: boolean) => {
  if (success) {
    refresh()
  } else {
    console.log('Failed to update the project.');
  }
});

async function refresh() {
  allProjects.value = await getProjects("All")
  detailedProjects.value = allProjects.value.filter(project => project.type !== "Quick");
  quickProject.value = (await getProjects("Quick"))[0]
  const taskData = await getQuickTasks()
  quickTasks.value = taskData.data.quickTask
}

async function handleUpdate() {
    console.log("📍 Update signal received at mainboard")
    await refresh()
}

const updateOrder = (event: DragEvent) => {
  const { oldIndex, newIndex } = event;
  const updatedProjects = [...detailedProjects.value];
  const [movedItem] = updatedProjects.splice(oldIndex, 1);
  updatedProjects.splice(newIndex, 0, movedItem);
  detailedProjects.value = updatedProjects;
}
</script>

<style>
.quick-tasks {
  padding: 1.5em;
}

.quick-tasks-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.8em;
  padding: 1em 0;
}

.quick-tasks-icon {
  width: 2em;
  height: 2em;
}

.quick-tasks-title {
  color: #212121;
  font-size: 1.6em;
  font-style: italic;
  font-weight: 600;
}

.project-cards {
  padding: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 2em;
}

@media (max-width: 720px) {
  .filters {
    gap: 0em;
  }
}
</style>
