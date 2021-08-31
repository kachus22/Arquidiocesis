/**
 * @jest-environment jsdom
 */
import { ROOT_URL as BASE_URL, get, post } from '../APIv2';
import PostCommentsAPI from '../PostCommentsAPI';

jest.mock('../APIv2');

const ROOT_URL = `${BASE_URL}comment`;
const mockComments = [
  {
    id: '1',
    comment_author: '123',
    authorInfo: {
      nombre: 'Hello',
      apellido_paterno: 'World',
      apellido_materno: '!!!',
    },
    comment_text: 'this is a comment',
    creation_timestamp: Date.now(),
  },
  {
    id: '2',
    comment_author: '321',
    authorInfo: {
      nombre: 'Hello',
      apellido_paterno: 'World',
      apellido_materno: '!!!',
    },
    comment_text: 'this is another comment',
    creation_timestamp: Date.now(),
  },
];

describe('PostCommentsAPI http requests', () => {
  test('adding a new comment to post', async () => {
    post.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: '3',
      })
    );

    const res = await PostCommentsAPI.add({
      text: 'this is a new comment',
      authorID: '123',
      postID: '1',
    });
    expect(res.error).toBeFalsy();
    expect(res.data).toEqual('3');
    expect(post).toHaveBeenCalledWith(`${ROOT_URL}`, {
      comment_text: 'this is a new comment',
      comment_author: '123',
      post_owner_id: '1',
    });
  });

  test('get comments for a post', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: mockComments,
      })
    );

    const res = await PostCommentsAPI.getForPost('1');
    expect(res.error).toBeFalsy();
    expect(res.data.length).toEqual(2);
    expect(get).toHaveBeenCalledWith(`${ROOT_URL}/getPostComments/1`);
  });

  test('fail to add new post because missing params', async () => {
    post.mockImplementationOnce(() => Promise.resolve(null));

    const res = await PostCommentsAPI.add({
      text: 'invalid comment content',
    });
    expect(res).toBeNull();
  });

  test('empty comments for non-existant post', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: [],
      })
    );

    const res = await PostCommentsAPI.getForPost('111');
    expect(res.data.length).toEqual(0);
  });
});
