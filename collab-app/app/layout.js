import "@/css/globals.css";
import { StateProvider } from '../contexts/userState.jsx'
import { RoomStateProvider } from '@/contexts/stateContext.jsx'
import { RefProvider } from '@/contexts/refContext.jsx'
import { SocketProvider } from '@/contexts/socketContext.jsx'
import { DrawingProvider } from '@/contexts/drawingContext.jsx' 
import { CanvasProvider } from '@/contexts/canvasContext.jsx'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RefProvider>
          <RoomStateProvider>
            <SocketProvider>
              <DrawingProvider>
                <CanvasProvider>
                  {children}
                </CanvasProvider>
              </DrawingProvider>
            </SocketProvider>
          </RoomStateProvider>
        </RefProvider>
      </body>
    </html>
  );
}


/*
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
*/