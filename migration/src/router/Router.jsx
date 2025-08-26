import { createBrowserRouter } from "react-router-dom";
import BoasVindas from "../pages/BoasVinda";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login.jsx";
import Ofertas from "../pages/Ofertas.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import ProductForm from "../components/ProductForm.jsx";
import PerfilUsuario from "../pages/PerfilUsuario.jsx";
import Categorias from "../components/Categorias.jsx";
import Loja from "../pages/Loja.jsx";




const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
    {path: "/produto-novo", element: <ProductForm/>},
    {path: "/car", element: <Carrinho/>},
    {path: "/categorias", element: <Categorias/>}, // Assuming Categorias is similar to Ofertas for now
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/loja", element: <Loja/>}

   
])


export default router;
