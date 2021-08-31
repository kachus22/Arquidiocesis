import * as React from 'react';
import { useContext, useState, useRef } from 'react';

const ChannelPostsStore = React.createContext();

export function ChannelPostsStoreProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const editingPostIndex = useRef(-1);

  return (
    <ChannelPostsStore.Provider value={[posts, setPosts, editingPostIndex]}>
      {children}
    </ChannelPostsStore.Provider>
  );
}

export function useChannelPostsStore() {
  return useContext(ChannelPostsStore);
}
