import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { CapabilityDetail } from "./pages/capabilities/CapabilityDetail";
import { CapabilityList } from "./pages/capabilities/CapabilityList";
import { ComponentDetail } from "./pages/components/ComponentDetail";
import { ComponentList } from "./pages/components/ComponentList";
import { IndexPage } from "./pages/IndexPage";
import { InteractionDetail } from "./pages/interactions/InteractionDetail";
import { InteractionList } from "./pages/interactions/InteractionList";
import { PersonaDetail } from "./pages/personas/PersonaDetail";
import { PersonaList } from "./pages/personas/PersonaList";
import { TokensDetail } from "./pages/tokens/TokensDetail";
import { TokensList } from "./pages/tokens/TokensList";
import { ViewDetail } from "./pages/views/ViewDetail";
import { ViewList } from "./pages/views/ViewList";
import { WorkflowDetail } from "./pages/workflows/WorkflowDetail";
import { WorkflowList } from "./pages/workflows/WorkflowList";

export function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<IndexPage />} />

                    <Route path="/workflows" element={<WorkflowList />} />
                    <Route path="/workflows/:id" element={<WorkflowDetail />} />

                    <Route path="/capabilities" element={<CapabilityList />} />
                    <Route
                        path="/capabilities/:id"
                        element={<CapabilityDetail />}
                    />

                    <Route path="/personas" element={<PersonaList />} />
                    <Route path="/personas/:id" element={<PersonaDetail />} />

                    <Route path="/components" element={<ComponentList />} />
                    <Route
                        path="/components/:id"
                        element={<ComponentDetail />}
                    />

                    <Route path="/tokens" element={<TokensList />} />
                    <Route path="/tokens/:id" element={<TokensDetail />} />

                    <Route path="/views" element={<ViewList />} />
                    <Route path="/views/:id" element={<ViewDetail />} />

                    <Route path="/interactions" element={<InteractionList />} />
                    <Route
                        path="/interactions/:id"
                        element={<InteractionDetail />}
                    />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
