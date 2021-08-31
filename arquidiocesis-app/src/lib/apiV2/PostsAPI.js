import { get, post, put, del } from './APIv2';
import { ROOT_URL as BASE_URL } from './APIv2';

const ROOT_URL = `${BASE_URL}posts`;
/**
  @typedef {{text: string, authorID: string, files: {uri: string, type: string, fileName: string, thumbnail: string}[], channelOwnerID: string}} AddPostParams
  @typedef {{error: boolean, data: string} | null} AddPostResponse
  
  @typedef {string} GetOnePostParams
  @typedef {{error: boolean, data: {id: string, creation_timestamp: string, authorInfo: {nombre: string, apellido_paterno: string, apellido_materno: string}, post_author: string, post_text: string, post_files: string[], post_comments: string[]} | null} GetOnePostResponse

  @typedef {{id: string, text?: string, files?: string[]}} EditPostParams
  @typedef {{error: boolean} | null} EditPostResponse

  @typedef {string} DeletePostParams
  @typedef {{error: boolean, message: string} | null} DeletePostResponse

  @typedef {channelID: string} AllByChannelParams
  @typedef {{error: boolean, data: {id: string, authorInfo: {nombre: string, apellido_paterno: string, apellido_materno: string}, post_author: string, post_text: string, post_files: string[], creation_timestamp: string, channel_owner_id: string, post_comments: string[]}[]}} AllByChannelResponse
*/

/**
 * @param {AddPostParams} params
 * @returns {Promise<AddPostResponse>}
 */
async function add(params) {
  const { text, authorID, files, channelOwnerID } = params;
  if (
    text == null ||
    authorID == null ||
    files == null ||
    channelOwnerID == null
  ) {
    console.warn('[HTTP] Invalid POST request in PostsAPI.add: missing params');
    return null;
  }

  return await post(`${ROOT_URL}/`, {
    post_text: text,
    post_author: authorID,
    post_files: files,
    channel_owner_id: channelOwnerID,
  });
}

/**
 * @param {GetOnePostParams} id
 * @returns {GetOnePostResponse}
 */
async function getOne(id) {
  if (id == null) {
    console.warn('[HTTP] Invalid GET request in PostsAPI.getOne: missing id');
    return null;
  }
  return await get(`${ROOT_URL}/${id}`);
}

/**
 *
 * @param {EditPostParams} params
 * @returns {EditPostResponse}
 */
async function edit(params) {
  const { id, text, files } = params;
  if (id == null) {
    console.warn('[HTTP] Invalid PUT request in PostsAPI.edit: missing params');
    return null;
  }

  return await put(`${ROOT_URL}/edit/${id}`, {
    post_id: id,
    post_text: text,
    post_files: files,
  });
}

/**
 * @param {DeletePostParams} id
 * @returns {DeletePostResponse}
 */
async function remove(id) {
  if (id == null) {
    console.warn(
      '[HTTP] Invalid DELETE request in PostsAPI.remove: missing id'
    );
    return null;
  }
  return await del(`${ROOT_URL}/delete/${id}`);
}

/**
 *
 * @param {AllByChannelParams} channelID
 * @returns {AllByChannelResponse}
 */
async function allByChannel(channelID) {
  if (channelID == null) {
    console.warn(
      '[HTTP] Invalid POST request in PostsAPI.allByChannel: missing id'
    );
    return null;
  }
  return await get(`${ROOT_URL}/getChannelPosts/${channelID}`);
}

export default {
  add,
  getOne,
  edit,
  remove,
  allByChannel,
};
