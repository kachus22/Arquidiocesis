/**
 * @jest-environment jsdom
 */
import { ROOT_URL as BASE_URL, get, post, put, del } from '../APIv2';
import PostsAPI from '../PostsAPI';

jest.mock('../APIv2');

const ROOT_URL = `${BASE_URL}posts`;
const mockPosts = [
  {
    id: '1',
    authorInfo: {
      nombre: 'Hello',
      apellido_paterno: 'World',
      apellido_materno: '!!!',
    },
    post_author: '123',
    post_text: 'test content for post',
    post_files: ['file-1'],
    creation_timestamp: new Date(),
    channel_owner_id: 'channel-1',
    post_comments: ['comment-1', 'comment-2'],
  },
  {
    id: '2',
    authorInfo: {
      nombre: 'World',
      apellido_paterno: '!!!',
      apellido_materno: 'Hello',
    },
    post_author: '321',
    post_text: 'test content for another test post',
    post_files: [],
    creation_timestamp: new Date(),
    channel_owner_id: 'channel-2',
    post_comments: ['comment-3'],
  },
];

describe('PostsAPI http requests', () => {
  test('adds a new post', async () => {
    post.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: '3',
      })
    );

    const res = await PostsAPI.add({
      authorID: '123',
      text: 'test text for new post',
      channelOwnerID: 'channel-1',
      files: [],
    });
    expect(res.error).toBeFalsy();
    expect(res.data).toEqual('3');
    expect(post).toHaveBeenCalledWith(`${ROOT_URL}/`, {
      post_text: 'test text for new post',
      post_author: '123',
      post_files: [],
      channel_owner_id: 'channel-1',
    });
  });

  test('get one post', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: {
          post: mockPosts[1],
        },
      })
    );

    const res = await PostsAPI.getOne('2');
    expect(res.error).toBeFalsy();
    expect(res.data.post.id).toEqual('2');
    expect(get).toHaveBeenCalledWith(`${ROOT_URL}/2`);
  });

  test('edit one post', async () => {
    put.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
      })
    );

    const res = await PostsAPI.edit({
      id: '2',
      text: 'new text edited',
      files: [],
    });
    expect(res.error).toBeFalsy();
    expect(put).toHaveBeenCalledWith(`${ROOT_URL}/edit/2`, {
      post_id: '2',
      post_text: 'new text edited',
      post_files: [],
    });
  });

  test('remove one post', async () => {
    del.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        message: 'success',
      })
    );

    const res = await PostsAPI.remove('2');
    expect(res.error).toBeFalsy();
    expect(res.message).toBeTruthy();
    expect(del).toHaveBeenCalledWith(`${ROOT_URL}/delete/2`);
  });

  test('get all posts by channel', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: mockPosts.filter((post) => post.channel_owner_id === 'channel-1'),
      })
    );

    const res = await PostsAPI.allByChannel('channel-1');
    expect(res.error).toBeFalsy();
    expect(res.data.length).toEqual(1);
    expect(get).toHaveBeenCalledWith(`${ROOT_URL}/getChannelPosts/channel-1`);
  });

  test('incorrect add post because of missing params', async () => {
    post.mockImplementationOnce(() => Promise.resolve(null));

    const res = await PostsAPI.add({ text: 'test post', files: [] });
    expect(res).toBeNull();
  });

  test('empty posts with non-existent channel', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: true,
        data: mockPosts.filter(
          (post) => post.channel_owner_id === 'channel-111'
        ),
      })
    );

    const res = await PostsAPI.allByChannel('channel-111');
    expect(res.error).toBeTruthy();
    expect(res.data.length).toEqual(0);
  });
});
