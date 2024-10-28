

import express, { Router, Request, Response } from 'express';
import { isLoggedIn } from './authentication';
import { GitlabGroupParams, ADVANCED_GROUP_ID, ACCESS_TOKEN } from "./data";

const router: Router = express.Router();


export async function addGitlabGroup(parameter_to_gitlab: GitlabGroupParams) {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameter_to_gitlab),
  }

  return fetch("https://coursework.cs.duke.edu/api/v4/groups", options).then(
    (response) => response.json()
  )
}

//前端通过api传给后端，后端调用这个函数去访问gitlab，获得gitlab所有用户，之后再返给前端（比如下拉菜单）
export async function getGitlabUsers(pageNum: string, pageSize: string) {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  let url = "https://coursework.cs.duke.edu/api/v4/users";
  const query_param = new URLSearchParams({
    page: pageNum,
    per_page: pageSize,
    without_project_bots: 'true',
  })
  return fetch(`${url}?${query_param}`, options).then(
      async (response) => {
        const data = await response.json()
        const total = response.headers.get('x-total')
        return {
          total,
          data
        }
      }
  );
}

// Add a member to a specific GitLab group and set the access level for the user in the group
export async function addMembertoGroup(groupId: number, memberId: string) {
  const options = {
    method: "POST",
    headers: {
      'PRIVATE-TOKEN': ACCESS_TOKEN,
      // Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: memberId, access_level: 10 })
    // body: `user_id=${memberId}&access_level=${10}`
  };
  return fetch(`https://coursework.cs.duke.edu/api/v4/groups/${groupId}/members`, options).then(
      (response) => response.json()
  );
}


// Remove a member from a specific GitLab group
async function deleteMember(groupId: number, memberId: number) {
  const options = {
    method: "DELETE",
    headers: {
      'PRIVATE-TOKEN': ACCESS_TOKEN,
    },
  };
  return fetch(`https://coursework.cs.duke.edu/api/v4/groups/${groupId}/members/${memberId}`, options).then(
      (response) => response.json()
  );
}

router.post('levelup', isLoggedIn, async (req, res) => {
  if (req.user) {
    const result = await addMembertoGroup(ADVANCED_GROUP_ID, (req.user as any).sub)
    res.json(result)
  }
})

export default router;