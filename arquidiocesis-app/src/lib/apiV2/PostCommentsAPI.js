import { get, post, ROOT_URL as BASE_URL } from './APIv2';

const ROOT_URL = `${BASE_URL}comment`;
/**
 * @typedef {{text: string, authorID: string, postID: string}} AddPostCommentParams
 * @typedef {{error: boolean, data: string}} AddPostCommentResponse
 *
 * @typedef {postID: string} GetPostCommentsParams
 * @typedef {{error: boolean, data: {id: string, comment_author: string, authorInfo: {nombre: string, apellido_paterno: string, apellido_materno: string}, comment_text: string, creation_timestamp: string}[]}} GetPostCommentsResponse
 */

/**
 * @param {AddPostCommentParams} params
 * @returns {Promise<AddPostCommentResponse>}
 */
async function add(params) {
  const { text, authorID, postID } = params;
  if (text == null || authorID == null || postID == null) {
    console.warn(
      '[HTTP] Invalid POST request in PostCommentsAPI.add: missing params'
    );
    return null;
  }

  return await post(`${ROOT_URL}`, {
    comment_text: text,
    comment_author: authorID,
    post_owner_id: postID,
  });
}

/**
 * @param {GetPostCommentsParams} postID
 * @param {Promise<GetPostCommentsResponse>}
 */
async function getForPost(postID) {
  if (postID == null) {
    console.warn(
      '[HTTP] Invalid GET request in PostCommentsAPI.getForPost: missing id'
    );
    return null;
  }

  return await get(`${ROOT_URL}/getPostComments/${postID}`);
}

export default {
  add,
  getForPost,
};
