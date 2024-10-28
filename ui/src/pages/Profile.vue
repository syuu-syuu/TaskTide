<template>
  <div class="profile-container">
    <section class="section">
      <h4 class="section-title">My Profile</h4>
      <div class="username pt-3 d-flex">
        <b-avatar size="70" class="mr-3" :src="user.picture"></b-avatar>
        <div class="d-flex flex-column justify-content-center">
          <div disabled class="preferred-name mb-1">Preferred name</div>
          <b-input :value=user.name></b-input>
        </div>
      </div>
    </section>
    <section class="section">
      <h4 class="section-title">Account Security</h4>
      <b-list-group>
        <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
          <div class="d-flex flex-column justify-content-center">
            <div>Email</div>
            <div class="text-muted desc">{{user.email}}</div>
          </div>
          <div>
            <b-button disabled>Change email</b-button>
          </div>
        </b-list-group-item>
        <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
          <div class="d-flex flex-column justify-content-center">
            <div>Password</div>
            <div class="text-muted desc mr-5">
              If you lose access to your school email address, you'll be able to
              log in using your password.
            </div>
          </div>
          <b-button style="flex-shrink: 0;" disabled>Change password</b-button>
        </b-list-group-item>
        <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
        </b-list-group-item>
      </b-list-group>
    </section>
    <section class="section">
      <h4 class="section-title">Account Options</h4>
      <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
      </b-list-group-item>
      <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
        <div class="d-flex flex-column justify-content-center">
          <div class="text-danger" @click="logout">Log out</div>
          <div class="text-muted desc">
            Log out of all other active sessions on other devices besides this
            one.
          </div>
        </div>
        <div>
          <b-icon-chevron-right />
        </div>
      </b-list-group-item>
      <b-list-group-item class="d-flex justify-content-between align-items-center border-0 px-0">
        <div class="d-flex flex-column justify-content-center">
          <div class="text-danger">Delete my account</div>
          <div class="text-muted desc">
            Permanently delete the account and remove access from all
            workspaces.
          </div>
        </div>
        <div>
          <b-icon-chevron-right />
        </div>
      </b-list-group-item>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";
import { User, getUserInfo, defaultUser} from "@/data";
import { io } from "socket.io-client"
const socket = io({ transports: ["websocket"] })

socket.on('redirect', (destination) => {
  window.location.href = destination;
});


const user: Ref<User> = ref(defaultUser);

onMounted( async () => {
  user.value = await getUserInfo();
});

async function logout() {
  console.log("Attempting to log out...");
  await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json'
    }
  })

  window.location.href = '/';
}

</script>

<style scoped lang="scss">
.profile-container {
  padding: 0 30px;
  color: #363636;
  .section {
    margin-bottom: 40px;
    .list-group-item {
      cursor: pointer;
    }
  }
  .section-title {
    height: 60px;
    line-height: 60px;
    border-bottom: 1px solid #e0e0e0;
  }
  .desc {
    font-size: 14px;
  }
}
</style>
