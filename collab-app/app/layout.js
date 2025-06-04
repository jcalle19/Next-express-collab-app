import "./css/globals.css";
import { StateProvider } from './contexts/userState.jsx'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StateProvider>
          {children} 
        </StateProvider>
      </body>
    </html>
  );
}
