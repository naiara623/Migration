import { createBrowserRouter } from "react-router-dom";
import BoasVindas from "../pages/BoasVinda";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login.jsx";
import Ofertas from "../pages/Ofertas.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import ProductForm from "../components/ProductForm.jsx";



const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
{path: "/produto-novo", element: <ProductForm/>},
    {path: "/car", element: <Carrinho/>},
   

   
])


export default router;
