import { get, post, put } from './APIv2';
import { ROOT_URL as BASE_URL } from './APIv2';

const ROOT_URL = `${BASE_URL}groups`;
/**
 * @typedef {id: string} AllGroupsByUserParams
 * @typedef {{error: boolean, groups: {id: string, group_channels: string[], group_name: string, group_roles: string[], group_description: string}[]}} AllGroupsByUserResponse
 *
 * @typedef {{name: string, roles: {[key: string]: string}, channels: string[], icon: string}} AddGroupParams
 * @typedef {{error: boolean, data: string}} AddGroupResponse
 *
 * @typedef {{id: string, name: string, description: string}} EditGroupParams
 * @typedef {{error: boolean}} EditGroupResponse
 */

/**
 * @param {AllGroupsByUserParams} userID
 * @returns {Promise<AllGroupsByUserResponse>}
 */
async function allByUser(userID) {
  return await get(`${ROOT_URL}/get/${userID}`);
}

/**
 * @param {AddGroupParams} params
 * @returns {Promise<AddGroupResponse | null>}
 */
async function add(params) {
  const { name, roles, channels, icon } = params;
  if (name == null) {
    return null;
  }

  const data = await post(`${ROOT_URL}/`, {
    group_name: name,
    group_roles: roles,
    group_channels: channels,
    group_icon: icon,
  });
  return data;
}

/**
 * @param {EditGroupParams} params
 * @returns {Promise<EditGroupResponse | null>}
 */
async function edit(params) {
  const { id, name, description } = params;
  if (id == null || name == null || description == null) {
    return null;
  }

  const data = await put(`${ROOT_URL}/${id}`, {
    group_id: id,
    group_name: name,
    group_description: description,
  });
  return data;
}

async function getAllUsers(params) {
  const { id } = params;
  if (id == null) {
    return { error: true, message: 'No id' };
  }

  const data = await put(`${ROOT_URL}/users`, {
    id,
  });
  return data;
}

/**
 *
 * @param {string} idGroup
 * @param {string[]} idsUsers
 * @returns
 */
async function removeUsers(idGroup, idsUsers) {
  if (idGroup == null) {
    return { error: true, message: 'No id' };
  }

  const data = await put(`${ROOT_URL}/removeUser`, {
    group_id: idGroup,
    group_members: idsUsers,
  });
  return data;
}

/**
 *
 * @param {string} id
 * @param {string[]} members
 */
async function addUser(id, members) {
  const data = await put(`${ROOT_URL}/addMember`, {
    group_id: id,
    group_members: members,
  });

  return data;
}

/**
 *
 * @param {string} idGroup
 * @param {string[]} idUsers
 */
async function setAdmin(idGroup, idUsers) {
  const data = await put(`${ROOT_URL}/addAdmin`, {
    group_id: idGroup,
    administrators: idUsers,
  });

  return data;
}

/**
 *
 * @param {string[]} group_ids
 */
async function deleteGroup(group_ids) {
  const data = await post(`${ROOT_URL}/delete`, {
    group_ids,
  });

  return !data.error;
}

export default {
  allByUser,
  add,
  edit,
  getAllUsers,
  addUser,
  removeUsers,
  setAdmin,
  deleteGroup,
};
