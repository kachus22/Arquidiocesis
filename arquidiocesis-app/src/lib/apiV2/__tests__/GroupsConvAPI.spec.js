/**
 * @jest-environment jsdom
 */
import { ROOT_URL as BASE_URL, get, post, put } from '../APIv2';
import GroupsConvAPI from '../GroupsConvAPI';

jest.mock('../APIv2');

const ROOT_URL = `${BASE_URL}groups`;
const mockGroups = [
  {
    id: '1',
    group_channels: ['channel-1'],
    group_name: 'Group 1',
    group_roles: ['role-1', 'role-2'],
  },
  {
    id: '2',
    group_channels: ['channel-2', 'channel-3'],
    group_name: 'Group 2',
    group_roles: ['role-3'],
  },
];

describe('GroupsConvAPI http requests', () => {
  test('gets all groups by user', async () => {
    get.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        groups: mockGroups,
      })
    );

    const res = await GroupsConvAPI.allByUser('123');
    expect(res.error).toBeFalsy();
    expect(res.groups).toBeTruthy();
    expect(res.groups.length).toBe(2);
    expect(get).toHaveBeenCalledWith(`${ROOT_URL}/get/123`);
  });

  test('adds a new group', async () => {
    post.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
        data: '3',
      })
    );

    const res = await GroupsConvAPI.add({
      name: 'Group 3',
      roles: [],
      channels: ['channel-5'],
    });
    expect(res.error).toBeFalsy();
    expect(res.data).toEqual('3');
    expect(post).toHaveBeenCalledWith(`${ROOT_URL}/`, {
      group_name: 'Group 3',
      group_roles: [],
      group_channels: ['channel-5'],
    });
  });

  test('fails to add group because no name provided', async () => {
    post.mockImplementationOnce(() => Promise.resolve(null));

    const res = await GroupsConvAPI.add({});
    expect(res).toBeNull();
  });

  test('can edit an existing group', async () => {
    put.mockImplementationOnce(() =>
      Promise.resolve({
        error: false,
      })
    );

    const res = await GroupsConvAPI.edit({
      id: '2',
      name: 'Group 2 new name',
      description: '',
    });
    expect(res.error).toBeFalsy();
    expect(put).toHaveBeenCalledWith(`${ROOT_URL}/2`, {
      group_id: '2',
      group_name: 'Group 2 new name',
      group_description: '',
    });
  });

  test('fails to edit group because incorrect params', async () => {
    put.mockImplementationOnce(() => Promise.resolve(null));

    const res = await GroupsConvAPI.edit({ name: 'New Name' });
    expect(res).toBeNull();
  });
});
