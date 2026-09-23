import { createBrowserRouter, Outlet } from 'react-router';
import PhoneFrame from './components/PhoneFrame';
import CredentialDetail from './screens/CredentialDetail/CredentialDetail';
import IssuerDemo from './screens/IssuerDemo/IssuerDemo';
import NotFound from './screens/NotFound/NotFound';
import Onboarding from './screens/Onboarding/Onboarding';
import ShareCredential from './screens/ShareCredential/ShareCredential';
import Verifier from './screens/Verifier/Verifier';
import WalletHome from './screens/WalletHome/WalletHome';

function WalletLayout() {
  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  );
}

export const router = createBrowserRouter([
  {
    element: <WalletLayout />,
    children: [
      { path: '/', element: <Onboarding /> },
      { path: '/billetera', element: <WalletHome /> },
      { path: '/billetera/:credentialId', element: <CredentialDetail /> },
      {
        path: '/billetera/:credentialId/compartir',
        element: <ShareCredential />,
      },
    ],
  },
  { path: '/verificar/:token', element: <Verifier /> },
  { path: '/emisor', element: <IssuerDemo /> },
  { path: '*', element: <NotFound /> },
]);
