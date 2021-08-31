import { get, post, put } from './APIv2';
import { ROOT_URL as BASE_URL } from './APIv2';

const ROOT_URL = `${BASE_URL}roles`;

/**
 * @param {AllGroupsByUserParams} userID
 * @returns {Promise<AllGroupsByUserResponse>}
 */
async function allRoles() {
  const data = await get(`${ROOT_URL}/all`);
  const roles = [];
  for (const k in data.data) {
    if (Object.hasOwnProperty.call(data.data, k)) {
      const role = data.data[k];
      roles.push({
        id: k,
        name: role.role_title,
        members: role.members,
      });
    }
  }
  return roles;
}

async function allUsersPerRole(idRole) {
  return await put(`${ROOT_URL}/users`, {
    id: idRole,
  });
}

export default {
  allRoles,
  allUsersPerRole,
};
