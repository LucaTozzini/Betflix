import { Outlet } from "react-router-dom";

// Components
import Menu from "../components/Menu.component";

const MenuLayout = () => {
  return (
    <>
      <Menu/>
      <Outlet />
    </>
  )
};

export default MenuLayout;