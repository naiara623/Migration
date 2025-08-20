import { createBrowserRouter } from "react-router-dom";
import BoasVindas from "../pages/BoasVinda";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login.jsx";
import Ofertas from "../pages/Ofertas.jsx";
import Categorias from "../components/Categorias.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import PerfilUsuario from "../pages/PerfilUsuario.jsx";



const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
    {path: "/categorias", element: <Categorias />}, // Assuming Categorias is similar to Ofertas for now
    {path: "/carrinho", element: <Carrinho/>},
    {path: "/Perfil-usuario", element: <PerfilUsuario/>}

   
])


export default router;
