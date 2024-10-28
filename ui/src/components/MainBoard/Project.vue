<template>
    <div class="mainboard-content">
        <div class="project-page-header">
            <router-link to="/home">
                <SvgIcon class="page-header-icon" :name="`icon-back-arrow`" />
            </router-link>
            <div class="project-page-header-trailing">
                <SvgIcon class="page-header-icon" :name="`icon-link`" v-show="currentProject?.type==='Shared'" />
                <div @click="userPickerVisible = true">
                  <SvgIcon class="page-header-icon" :name="`icon-add-people`"
                        v-show="currentProject?.type === 'Shared'" />
                </div>
                <div :class="starClass" @click="toggleStar">
                    <SvgIcon :name="`icon-star`" v-show="currentProject?.type !== 'Quick'" />
                </div>
                <div @click="removeProject(props.projectId)">
                    <SvgIcon class="page-header-icon" :name="`icon-trash-bin`"
                        v-show="currentProject?.type !== 'Quick'" />
                </div>
            </div>

        </div>
        <div class="line"></div>
        <ControlBar />
        <div class="project-title-big">{{ currentProject.title}}</div>

        <DetailedTaskList class="project-cards" :completed="false" />

        <div class="quick-tasks-head">
            <div class="line"></div>
            <SvgIcon class="title-icon" :name="`icon-complete`" />
            <div class="quick-tasks-title">Completed</div>
            <div class="line"></div>
        </div>

        <DetailedTaskList class="project-cards" :completed="true" />

    </div>

  <MemberPicker :visible="userPickerVisible" :project="currentProject" @hide="userPickerVisible = false"/>
</template>

<script setup lang="ts">
import DetailedTaskList from '@components/TaskList/DetailedTaskList.vue'
import ControlBar from '@components/MainBoard/ControlBar.vue'
import SvgIcon from '@components/SvgIcon.vue'
import useStar from '@/composables/useStar'
import { ref, Ref, onMounted, provide, watch } from 'vue'
import { Task, Project, ObjectId, getTasksByProjectId, getProjectByProjectId } from '@/data'
import { io } from "socket.io-client"
import MemberPicker from "@components/MainBoard/MemberPicker.vue";

const userPickerVisible = ref(false)

const socket = io({ transports: ["websocket"] })
interface Props {
    projectId: ObjectId
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined
})

const currentProject: Ref<Project> = ref({
    title: "Default Project",
    ownerId: "Jon Snow",
    isStarred: false,
    type: "Private",
})
const projectTasks: Ref<Task[]> = ref([])

provide('currentProject', currentProject)
provide('projectTasks', projectTasks)

onMounted(async () => {
    await refresh()
})


watch(() => props.projectId, () => {
    refresh()
})


async function refresh() {
    currentProject.value = await getProjectByProjectId(props.projectId)
    projectTasks.value = await getTasksByProjectId(currentProject.value._id)
    console.log("Current Project:", currentProject.value)
    console.log("Current Tasks:", projectTasks.value)
}

socket.on('submit-result', async (success: boolean) => {
    if(success) {
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

async function removeProject(projectId: ObjectId){
    if (projectId) {
        console.log("Deleting Project:", projectId)
        socket.emit("delete-project", projectId)
    } else {
        console.error("Attempted to delete a project without a valid ID.");
    }
}


socket.on('project-deleted', async (success: boolean) => {
    if (success) {
        console.log("🎉 Successfully deleted a project")
        window.location.replace('/home'); 
    } else {
        console.log('Failed to delete the project.');
    }
});




const { toggleStar, starClass } = useStar(currentProject);



</script>

<style>
.project-page-header {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
    padding: 1.2em 1em;
    margin-top: 1.8em;
}


.project-page-header-trailing {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
    gap: 1em;
}

.project-title-big {
   font-size: 2.5em;
   font-weight: 600;
   padding: 0.2em 1em;
}

.title-icon {
    width: 2.5em;
    height: 2.5em;
}
.star-icon, .page-header-icon{
    width: 1.8em;
    height: 1.8em;
    cursor: pointer;
    margin: 0;
    padding: 0;
}

.star-icon {
    stroke-width: 1;
    fill: none;
}

.not-starred {
    stroke: #222222;
}

.star-icon:hover {
    stroke: #4E07AE;
}

.starred {
    fill: #4E07AE;
}
</style>