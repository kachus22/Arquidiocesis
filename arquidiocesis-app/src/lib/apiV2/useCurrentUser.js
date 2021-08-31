import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function useCurrentUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function getUser() {
      setUser(JSON.parse(await AsyncStorage.getItem('user_info')));
    }
    getUser();
  }, []);

  return user;
}

export default useCurrentUser;
