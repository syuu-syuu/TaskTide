<template>
  <div class="project-card">
    <div class="card-lead">
      <div class="card-index">
        {{ formattedCardIndex }}
      </div>
    </div>
    <div class="card-main">
      <div class="card-head">
        <div class="card-head-lead">
          <div class="space-type">{{ currentProject.type.toUpperCase() }}</div>
          <router-link class="project-title" :to="`/project/${currentProject._id}`">
            {{ currentProject.title }}
          </router-link>
        </div>
        <div :class="starClass" @click="toggleStar">
          <SvgIcon :name="`icon-star`" />
        </div>
      </div>
      <div class="card-body">
        <div class="task-list">
          <DetailedTaskList />
          <router-link class="more-button" :to="`/project/${currentProject._id}`">...</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon.vue'
import DetailedTaskList from '@components/TaskList/DetailedTaskList.vue'
import useStar from '@/composables/useStar'
import { ref, computed, Ref, onMounted, provide } from 'vue'
import { Task, Project, getTasksByProjectId} from '@/data'
import { RouterLink } from 'vue-router'
import { io } from "socket.io-client"

const socket = io({ transports: ["websocket"] })

interface Props {
  cardIndex: number;
  project: Project;
}

const props = withDefaults(defineProps<Props>(), {
  cardIndex: 0,
  project: () => ({
    title: "Default Project",
    ownerId: "Jon Snow",
    isStarred: false,
    type: "Private",
  })
});

const currentProject: Ref<Project> = ref(props.project)
const projectTasks: Ref<Task[]> = ref([])

provide('currentProject', currentProject)
provide('projectTasks', projectTasks)

onMounted ( async () => {
  await refresh()
})

async function refresh() {
  projectTasks.value = await getTasksByProjectId(currentProject.value._id)
}

const formattedCardIndex = computed(() => {
  return (props.cardIndex + 1).toString().padStart(2, "0");
});


socket.on('submit-result', async (success: boolean) => {
  if (success) {
    await refresh()
    console.log("Task submitted successfully. Here is the task list after updating:", projectTasks.value);
    // alert('Task updated successfully!');
  } else {
    console.log('Failed to update the task.');
    // alert('Failed to update the task. Please try again.');
  }
});

socket.on('remove-result', async (success: boolean) => {
  if (success) {
    await refresh()
    console.log("Task removed successfully. Here is the task list after remeval:", projectTasks.value);
    // alert('Task removed successfully!');
  } else {
    console.log('Failed to remove the task.');
    // alert('Failed to remove the task. Please try again.');
  }
});

const { toggleStar, starClass } = useStar(currentProject);

</script>

<style scoped>
.project-card {
  width: 100%;
  border-radius: 1.8em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
}

.project-card :deep(.task-item) {
  background: white;
}

.card-lead {
  width: 12%;
  border-top-left-radius: 1.8em;
  border-bottom-left-radius: 1.8em;
  background: rgba(98, 0, 232, 0.86);
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding: 1.25em;
}

@media (max-width: 720px) {
  .project-card {
    flex-direction: column;
  }

  .card-lead {
    width: 100%;
    border-top-left-radius: 1.8em;
    border-top-right-radius: 1.8em;
    border-bottom-left-radius: 0em;
    justify-content: start;
  }
}

.card-main {
  padding: 1.2em;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1em;
}

.card-head {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.card-head-lead {
  display: flex;
  flex-direction: column;
}

.star-icon {
  width: 2.5em;
  height: 2.5em;
  cursor: pointer;
  stroke-width: 0.1em;
  fill: none;
}

.star-icon:hover {
  stroke: #4e07ae;
}

.not-starred {
  stroke: #808080ed;
}

.starred {
  fill: #4e07ae;
}

.card-index {
  color: #fff;
  font-size: 2em;
  font-weight: 600;
}

.space-type {
  color: #a8a6ac;
  font-size: 1em;
  font-weight: 400;
  letter-spacing: -0.03em;
  margin-bottom: -0.3em;
}

.card-head-lead .project-title{
  color:#2A282F;
  font-size: 1.25em;
  font-weight: 600;
}

.card-body {
  padding: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.625em;
}

.task-item {
  border-radius: 0.25em;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.125em;
  font-size: 1em;
}

.task-item-lead {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.checkbox {
  margin-right: 0.625em;
  cursor: pointer;
}

.task-item-tail svg {
  width: 1.5em;
  height: 1.5em;
}

.delete-button {
  cursor: pointer;
}

.more-button {
  border-radius: 0.25em;
  margin-bottom: 0.5em;
  padding: 0 0.625em 0 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>