//存放关于授权相关的状态 定义在所有components都可以变的变量
import { ref } from "vue";

export interface GitlabUser {
  _id: string;
  sub_legacy: string;
  name: string;
  nickname: string;
  preferred_username: string;
  email: string;
  email_verified: boolean;
  profile: string;
  picture: string;
  groups: string[];
  role: "basic" | "advanced";
}

const user = ref<GitlabUser>();
const isAuthenticated = ref(false);

export function useAuthStore() {
  return {
    user,
    isAuthenticated,
  };
}

fetch('/api/graphql', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ query: "{ user }" }),
}).then(async (res) => {
  if (res.ok) {
    const { data } = await res.json();
    if (data.user.sub) {
      isAuthenticated.value = true;
      user.value = data.user;
    }
  }
})
