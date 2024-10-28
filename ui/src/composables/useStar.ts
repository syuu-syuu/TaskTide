import { Ref, computed } from "vue"
import { Project, upsertProject} from '@/data'

export default function useStar(currentProject: Ref<Project>) {
    const isStarred = computed(() => currentProject.value.isStarred);
    const toggleStar = async () => {
        currentProject.value.isStarred = !isStarred.value;
        const newProject = { ...currentProject.value, isStarred: currentProject.value.isStarred };

        await upsertProject(newProject);
        console.log("🎉 Successfully updated project data");
    }

    const starClass = computed(() => {
        return isStarred.value ? 'star-icon starred' : 'star-icon not-starred';
    })

   return {
    toggleStar,
    starClass
  }
}