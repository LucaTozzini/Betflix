import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";

// Components
import Menu from "../components/Menu.component";

// Hooks
import Authenticator from "../hooks/Authenticator.hook";

// Contexts
import currentUserContext from "../contexts/currentUser.context";

const Layout = () => {
  const { authenticated } = useContext(currentUserContext);
  return (
    <>
      <Menu/>
      <Authenticator/>
      {authenticated ? <Outlet /> : <></>}
    </>
  )
};

export default Layout;