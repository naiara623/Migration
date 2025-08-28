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
import Endereco from "../pages/Endereco.jsx";


const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
    {path: "/categorias", element: <Categorias />}, // Assuming Categorias is similar to Ofertas for now
    {path: "/carrinho", element: <Carrinho/>},
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/minhasCompras", element: <MinhasCompras/>},
    {path: "/meusFavoritos", element: <MeusFavoritos/>},
    {path: "/produto-novo", element: <ProductForm/>},
    {path: "/car", element: <Carrinho/>},
    {path: "/categorias", element: <Categorias/>}, // Assuming Categorias is similar to Ofertas for now
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/loja", element: <Loja/>},
    {path: "/endereco", element: <Endereco/>}

   
])


export default router;
