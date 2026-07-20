import * as RouterDOM from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import ChatLayout from "./pages/chat/layout.tsx";
import ChatPage from "./pages/chat/page.tsx";
import SettingsPage from "./pages/settings/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <RouterDOM.BrowserRouter>
        <RouterDOM.Routes>
          <RouterDOM.Route path="/auth/callback" element={<AuthCallback />} />
          <RouterDOM.Route element={<ChatLayout />}>
            <RouterDOM.Route path="/" element={<ChatPage />} />
            <RouterDOM.Route path="/c/:id" element={<ChatPage />} />
            <RouterDOM.Route path="/settings" element={<SettingsPage />} />
          </RouterDOM.Route>
          <RouterDOM.Route path="*" element={<NotFound />} />
        </RouterDOM.Routes>
      </RouterDOM.BrowserRouter>
    </DefaultProviders>
  );
}
