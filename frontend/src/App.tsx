import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ClubsPage } from './pages/ClubsPage';
import { ProfilePage } from './pages/ProfilePage';
import { Layout } from './components/Layout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="clubs" element={<ClubsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    {/* Future routes */}
                    {/* <Route path="clubs/:id" element={<ClubDetailsPage />} /> */}
                    {/* <Route path="clubs/create" element={<CreateClubPage />} /> */}
                    {/* <Route path="gb-market" element={<GBMarketPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
