import {
    BrowserRouter,
} from "react-router-dom";

import {
    AuthProvider,
} from "./contexts/AuthContext.jsx";

import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;