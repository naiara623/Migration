import { createBrowserRouter } from "react-router-dom";
import BoasVindas from "../pages/BoasVinda";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login.jsx";
import Ofertas from "../pages/Ofertas.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import ProductForm from "../components/ProductForm.jsx";
import PerfilUsuario from "../pages/PerfilUsuario.jsx";
import MinhasCompras from "../pages/MinhasCompras.jsx";
import MeusFavoritos from "../pages/MeusFavoritos.jsx";
import Categorias from "../components/Categorias.jsx";
import Loja from "../pages/Loja.jsx";




const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
<<<<<<< HEAD
=======
    {path: "/categorias", element: <Categorias />}, // Assuming Categorias is similar to Ofertas for now
    {path: "/carrinho", element: <Carrinho/>},
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "MinhasCompras", element: <MinhasCompras/>},
   {path: "MeusFavoritos", element: <MeusFavoritos/>},
>>>>>>> 00fb925e233178ecdd575b50e121b4314e796ea2
    {path: "/produto-novo", element: <ProductForm/>},
    {path: "/car", element: <Carrinho/>},
    {path: "/categorias", element: <Categorias/>}, // Assuming Categorias is similar to Ofertas for now
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/loja", element: <Loja/>}

   
])


export default router;
