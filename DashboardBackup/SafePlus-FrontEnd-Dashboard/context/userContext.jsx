import axios from 'axios';
import { createContext , useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext({})

export function UserContextProvider({ children }) {
  const [user, setUser]= useState(null);
  useEffect(() => {
    if(!user) {
      axios.get('api/auth/profile').then(({data}) => {
        setUser(data)
      })
    }
  }, [])
  return (
    <UserContext.Provider value ={{user, setUser}}>
      {children}
    </UserContext.Provider>
  ) 
}

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};