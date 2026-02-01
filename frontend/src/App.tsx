import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailsPage } from './pages/ClubDetailsPage';
import { CreateClubPage } from './pages/CreateClubPage';
import { ProfilePage } from './pages/ProfilePage';
import { GBMarketPage } from './pages/GBMarketPage';
import { Layout } from './components/Layout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="clubs" element={<ClubsPage />} />
                    <Route path="clubs/create" element={<CreateClubPage />} />
                    <Route path="clubs/:id" element={<ClubDetailsPage />} />
                    <Route path="gb-market" element={<GBMarketPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="my-clubs" element={<ClubsPage />} /> {/* Reuse with filter */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
