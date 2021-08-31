import { post, put } from './APIv2';
import { ROOT_URL as BASE_URL } from './APIv2';

const ROOT_URL = `${BASE_URL}channels`;
/**
 *
 * @typedef {{id: string, data: Object}[]} AllGroupsResponse
 *
 * @typedef {ids: string[]} AllChannelsByGroupsParams
 * @typedef {{error: boolean, channels: {id: string, canal_name: string, canal_description: string, canal_publications: string[]}[]}} AllChannelsByGroupsResponse
 */

/**
 * @param {{idGroup: string, name: string, description: string}} params
 * @returns {Promise<AddGroupResponse | null>}
 */
async function add(params) {
  const { idGroup, name, description } = params;
  if (idGroup == null || name == null || description == null) {
    return null;
  }

  const data = await post(`${ROOT_URL}/`, {
    grupo_conv_owner_id: idGroup,
    canal_name: name,
    canal_description: description,
    canal_publications: [],
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

/**
 * @param {AllChannelsByGroupsParams} ids
 * @returns {AllChannelsByGroupsResponse}
 */
async function allByGroup(ids) {
  if (ids == null || ids.length < 1) {
    return null;
  }

  return await post(`${ROOT_URL}/getAll`, {
    channel_ids: ids,
  });
}

/**
 *
 * @param {string[]} channel_ids
 */
async function deleteChannels(channel_ids) {
  const data = await post(`${ROOT_URL}/delete`, {
    channel_ids,
  });

  return !data.error;
}

export default {
  add,
  edit,
  allByGroup,
  deleteChannels,
};
