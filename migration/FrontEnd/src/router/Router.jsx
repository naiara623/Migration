import { createBrowserRouter } from "react-router-dom";
import BoasVindas from "../pages/BoasVinda";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login.jsx";
import Ofertas from "../pages/Ofertas.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import PerfilUsuario from "../pages/PerfilUsuario.jsx";
import MinhasCompras from "../pages/MinhasCompras.jsx";
import MeusFavoritos from "../pages/MeusFavoritos.jsx";
import Categorias from "../components/Categorias.jsx";
import Loja from "../pages/Loja.jsx";
import Produtos from "../pages/Produtos.jsx";


import Endereco from "../pages/Endereco.jsx";


const router = createBrowserRouter([
    {path: "/", element: <BoasVindas />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/login", element: <Login />},
    {path: "/ofertas", element: <Ofertas />},
    {path: "/categorias", element: <Categorias />}, // Assuming Categorias is similar to Ofertas for now
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/minhasCompras", element: <MinhasCompras/>},
    {path: "/meusFavoritos", element: <MeusFavoritos/>},
<<<<<<< HEAD:migration/src/router/Router.jsx
    {path: "/produto-novo", element: <ProductForm/>},
=======
>>>>>>> c617052ebec75bfdbb64e0eecbd7f32d1dacb0c9:migration/FrontEnd/src/router/Router.jsx
    {path: "/car", element: <Carrinho/>},
    {path: "/Perfil-usuario", element: <PerfilUsuario/>},
    {path: "/loja", element: <Loja/>},
    {path: "/produtos", element: <Produtos/>},
    {path: "/endereco", element: <Endereco/>}

   
])


export default router;
